// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RWACrossPay {
    // Asset and token details
    struct Asset {
        string assetType;
        string description;
        uint256 value;
        bool verified;
        address tokenAddress;
    }
    
    // Transaction structure
    struct Transaction {
        address sender;
        address recipient;
        uint256 assetId;
        uint256 amount;
        uint256 fee;
        string fromCountry;
        string toCountry;
        uint256 timestamp;
        TransactionStatus status;
    }
    
    // Transaction status
    enum TransactionStatus {
        Pending,
        Completed,
        Refunded,
        Rejected
    }
    
    // Country regulations and fees
    struct CountryConfig {
        bool enabled;
        uint256 feeBps; 
        uint256 minAmount;
        uint256 maxAmount;
    }
    
    // State variables
    address public owner;
    uint256 public assetCount;
    uint256 public transactionCount;
    
    // Mappings
    mapping(uint256 => Asset) public assets;
    mapping(uint256 => Transaction) public transactions;
    mapping(string => CountryConfig) public countryConfigs;
    mapping(address => bool) public verifiedUsers;
    mapping(address => uint256) public feeBalances;
    mapping(address => bool) public operators;
    
    // Events
    event AssetRegistered(uint256 indexed assetId, string assetType, uint256 value);
    event AssetVerified(uint256 indexed assetId, bool status);
    event UserVerified(address indexed user);
    event TransactionCreated(uint256 indexed txId, address sender, address recipient, uint256 assetId, uint256 amount);
    event TransactionCompleted(uint256 indexed txId);
    event TransactionRefunded(uint256 indexed txId);
    event CountryConfigUpdated(string country, bool enabled, uint256 feeBps);
    event FeesWithdrawn(address recipient, uint256 amount);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "RWACrossPay: Only owner can call this function");
        _;
    }
    
    modifier onlyOperator() {
        require(operators[msg.sender] || msg.sender == owner, "RWACrossPay: Only operators can call this function");
        _;
    }
    
    modifier onlyVerifiedUser() {
        require(verifiedUsers[msg.sender], "RWACrossPay: User not verified");
        _;
    }
    
    /**
     * @dev Constructor sets the contract owner
     */
    constructor() {
        owner = msg.sender;
        operators[msg.sender] = true;
    }

    function registerAsset(
        string memory assetType,
        string memory description,
        uint256 value,
        address tokenAddress
    ) public onlyOperator returns (uint256) {
        require(bytes(assetType).length > 0, "RWACrossPay: Asset type cannot be empty");
        require(value > 0, "RWACrossPay: Asset value must be greater than zero");
        require(tokenAddress != address(0), "RWACrossPay: Token address cannot be zero");
        
        uint256 assetId = ++assetCount;
        
        assets[assetId] = Asset({
            assetType: assetType,
            description: description,
            value: value,
            verified: false,
            tokenAddress: tokenAddress
        });
        
        emit AssetRegistered(assetId, assetType, value);
        return assetId;
    }

    function verifyAsset(uint256 assetId, bool status) public onlyOperator {
        require(assetId > 0 && assetId <= assetCount, "RWACrossPay: Asset does not exist");
        
        assets[assetId].verified = status;
        
        emit AssetVerified(assetId, status);
    }

    function verifyUser(address user) public onlyOperator {
        require(user != address(0), "RWACrossPay: User address cannot be zero");
        
        verifiedUsers[user] = true;
        
        emit UserVerified(user);
    }
    
    function configureCountry(
        string memory country,
        bool enabled,
        uint256 feeBps,
        uint256 minAmount,
        uint256 maxAmount
    ) public onlyOwner {
        require(bytes(country).length > 0, "RWACrossPay: Country code cannot be empty");
        require(feeBps <= 1000, "RWACrossPay: Fee cannot exceed 10%");
        require(minAmount < maxAmount, "RWACrossPay: Min must be less than max");
        
        countryConfigs[country] = CountryConfig({
            enabled: enabled,
            feeBps: feeBps,
            minAmount: minAmount,
            maxAmount: maxAmount
        });
        
        emit CountryConfigUpdated(country, enabled, feeBps);
    }
    
    function addOperator(address operator) public onlyOwner {
        require(operator != address(0), "RWACrossPay: Operator address cannot be zero");
        
        operators[operator] = true;
    }
    
    /**
     * @dev Remove an operator
     * @param operator The address of the operator to remove
     */
    function removeOperator(address operator) public onlyOwner {
        require(operator != address(0), "RWACrossPay: Operator address cannot be zero");
        require(operator != owner, "RWACrossPay: Cannot remove owner as operator");
        
        operators[operator] = false;
    }

    function createTransaction(
        address recipient,
        uint256 assetId,
        uint256 amount,
        string memory fromCountry,
        string memory toCountry
    ) public onlyVerifiedUser returns (uint256) {
        require(recipient != address(0), "RWACrossPay: Recipient cannot be zero address");
        require(assetId > 0 && assetId <= assetCount, "RWACrossPay: Asset does not exist");
        require(assets[assetId].verified, "RWACrossPay: Asset not verified");
        require(bytes(fromCountry).length > 0 && bytes(toCountry).length > 0, "RWACrossPay: Country codes required");
        
        // Check country configurations
        CountryConfig memory sourceConfig = countryConfigs[fromCountry];
        CountryConfig memory destConfig = countryConfigs[toCountry];
        
        require(sourceConfig.enabled, "RWACrossPay: Source country not supported");
        require(destConfig.enabled, "RWACrossPay: Destination country not supported");
        require(amount >= sourceConfig.minAmount, "RWACrossPay: Amount below minimum");
        require(amount <= sourceConfig.maxAmount, "RWACrossPay: Amount above maximum");
        
        // Calculate fee (using source country fee)
        uint256 fee = (amount * sourceConfig.feeBps) / 10000;
        
        // Create transaction record
        uint256 txId = ++transactionCount;
        transactions[txId] = Transaction({
            sender: msg.sender,
            recipient: recipient,
            assetId: assetId,
            amount: amount,
            fee: fee,
            fromCountry: fromCountry,
            toCountry: toCountry,
            timestamp: block.timestamp,
            status: TransactionStatus.Pending
        });
        
        // Update fee balance
        feeBalances[assets[assetId].tokenAddress] += fee;
        
        emit TransactionCreated(txId, msg.sender, recipient, assetId, amount);
        return txId;
    }

    function completeTransaction(uint256 txId) public onlyOperator {
        require(txId > 0 && txId <= transactionCount, "RWACrossPay: Transaction does not exist");
        
        Transaction storage transaction = transactions[txId];
        require(transaction.status == TransactionStatus.Pending, "RWACrossPay: Transaction not in pending state");
        
        // Update transaction status
        transaction.status = TransactionStatus.Completed;
        
        emit TransactionCompleted(txId);
    }

    function refundTransaction(uint256 txId) public onlyOperator {
        require(txId > 0 && txId <= transactionCount, "RWACrossPay: Transaction does not exist");
        
        Transaction storage transaction = transactions[txId];
        require(transaction.status == TransactionStatus.Pending, "RWACrossPay: Transaction not in pending state");
        
        // Update fee balance
        uint256 assetId = transaction.assetId;
        feeBalances[assets[assetId].tokenAddress] -= transaction.fee;
        
        // Update transaction status
        transaction.status = TransactionStatus.Refunded;
        
        emit TransactionRefunded(txId);
    }

    function withdrawFees(address tokenAddress) public onlyOwner {
        require(tokenAddress != address(0), "RWACrossPay: Token address cannot be zero");
        
        uint256 amount = feeBalances[tokenAddress];
        require(amount > 0, "RWACrossPay: No fees to withdraw");
        
        // Reset fee balance before transfer
        feeBalances[tokenAddress] = 0;
        
        emit FeesWithdrawn(msg.sender, amount);
    }

    function getAsset(uint256 assetId) public view returns (
        string memory assetType,
        string memory description,
        uint256 value,
        bool verified,
        address tokenAddress
    ) {
        require(assetId > 0 && assetId <= assetCount, "RWACrossPay: Asset does not exist");
        
        Asset memory asset = assets[assetId];
        return (
            asset.assetType,
            asset.description,
            asset.value,
            asset.verified,
            asset.tokenAddress
        );
    }

    function getTransaction(uint256 txId) public view returns (
        address sender,
        address recipient,
        uint256 assetId,
        uint256 amount,
        uint256 fee,
        string memory fromCountry,
        string memory toCountry,
        uint256 timestamp,
        TransactionStatus status
    ) {
        require(txId > 0 && txId <= transactionCount, "RWACrossPay: Transaction does not exist");
        
        Transaction memory transaction = transactions[txId];
        return (
            transaction.sender,
            transaction.recipient,
            transaction.assetId,
            transaction.amount,
            transaction.fee,
            transaction.fromCountry,
            transaction.toCountry,
            transaction.timestamp,
            transaction.status
        );
    }
} 