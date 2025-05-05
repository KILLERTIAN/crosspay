// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CrossPay
 * @dev A payment processor contract that supports ERC20 tokens
 */
contract CrossPay is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct CurrencyConfig {
        uint256 minAmount;
        uint256 maxAmount;
        uint256 feeBps;
        bool enabled;
    }

    struct Transaction {
        address sender;
        address recipient;
        address token;
        uint256 amount;
        uint256 fee;
        uint256 timestamp;
        bool completed;
    }

    // State Variables
    mapping(address => CurrencyConfig) public currencies;
    mapping(uint256 => Transaction) public transactions;
    mapping(address => bool) public isOperator;
    mapping(address => uint256) public feeBalances;
    uint256 public transactionCount;
    address[] private _supportedTokens;

    // Events
    event OperatorAdded(address indexed operator);
    event OperatorRemoved(address indexed operator);
    event CurrencyConfigured(address indexed token, uint256 minAmount, uint256 maxAmount, uint256 feeBps, bool enabled);
    event TransactionCreated(uint256 indexed id, address indexed sender, address indexed recipient, address token, uint256 amount, uint256 fee);
    event TransactionCompleted(uint256 indexed id);
    event TransactionRefunded(uint256 indexed id);
    event FeesWithdrawn(address indexed token, uint256 amount);

    /**
     * @dev Constructor sets the owner as the initial operator
     */
    constructor() Ownable(msg.sender) {
        isOperator[msg.sender] = true;
        emit OperatorAdded(msg.sender);
    }

    /**
     * @dev Restricts function to operator accounts
     */
    modifier onlyOperator() {
        require(isOperator[msg.sender], "CrossPay: Not an operator");
        _;
    }

    /**
     * @dev Validates an address is not zero
     */
    modifier validAddress(address addr) {
        require(addr != address(0), "CrossPay: Zero address");
        _;
    }

    /**
     * @dev Admin can add or update supported currencies
     */
    function configureCurrency(
        address token,
        uint256 minAmount,
        uint256 maxAmount,
        uint256 feeBps,
        bool enabled
    ) external onlyOwner validAddress(token) {
        require(feeBps <= 1000, "CrossPay: Fee cannot exceed 10%");
        require(minAmount < maxAmount, "CrossPay: Min must be less than max");
        
        // Track supported tokens list
        bool wasEnabled = currencies[token].enabled;
        if (enabled && !wasEnabled) {
            _supportedTokens.push(token);
        } else if (!enabled && wasEnabled) {
            _removeTokenFromSupported(token);
        }

        currencies[token] = CurrencyConfig({
            minAmount: minAmount,
            maxAmount: maxAmount,
            feeBps: feeBps,
            enabled: enabled
        });
        emit CurrencyConfigured(token, minAmount, maxAmount, feeBps, enabled);
    }

    /**
     * @dev Add a new operator address
     */
    function addOperator(address operator) external onlyOwner validAddress(operator) {
        require(!isOperator[operator], "CrossPay: Already an operator");
        isOperator[operator] = true;
        emit OperatorAdded(operator);
    }

    /**
     * @dev Remove an operator address
     */
    function removeOperator(address operator) external onlyOwner validAddress(operator) {
        require(isOperator[operator], "CrossPay: Not an operator");
        isOperator[operator] = false;
        emit OperatorRemoved(operator);
    }

    /**
     * @dev Create a payment transaction
     * @param token The ERC20 token address
     * @param recipient The recipient address
     * @param amount The amount to transfer
     */
    function createTransaction(
        address token,
        address recipient,
        uint256 amount
    ) external whenNotPaused nonReentrant validAddress(recipient) returns (uint256) {
        require(recipient != address(0), "CrossPay: Recipient cannot be zero address");
        
        // Check if token is configured
        CurrencyConfig memory config = currencies[token];
        require(config.enabled, "CrossPay: Currency not supported");
        
        // Check amount limits
        require(amount >= config.minAmount, "CrossPay: Amount below minimum");
        require(amount <= config.maxAmount, "CrossPay: Amount above maximum");

        // Calculate fee
        uint256 fee = (amount * config.feeBps) / 10000;
        uint256 totalAmount = amount + fee;
        
        // Check allowance
        require(
            IERC20(token).allowance(msg.sender, address(this)) >= totalAmount,
            "CrossPay: Insufficient allowance"
        );
        
        // Transfer tokens from sender to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), totalAmount);
        
        // Update fee balance
        feeBalances[token] += fee;
        
        // Create transaction record
        uint256 txId = ++transactionCount;
        transactions[txId] = Transaction({
            sender: msg.sender,
            recipient: recipient,
            token: token,
            amount: amount,
            fee: fee,
            timestamp: block.timestamp,
            completed: false
        });
        
        emit TransactionCreated(txId, msg.sender, recipient, token, amount, fee);
        return txId;
    }

    /**
     * @dev Complete a transaction by sending tokens to recipient
     * @param txId The transaction ID to complete
     */
    function completeTransaction(uint256 txId) external onlyOperator whenNotPaused nonReentrant {
        Transaction storage txn = transactions[txId];
        require(txn.sender != address(0), "CrossPay: Transaction does not exist");
        require(!txn.completed, "CrossPay: Transaction already completed");
        
        txn.completed = true;
        
        // Transfer tokens to recipient
        IERC20(txn.token).safeTransfer(txn.recipient, txn.amount);
        
        emit TransactionCompleted(txId);
    }

    /**
     * @dev Refund a transaction by returning tokens to sender
     * @param txId The transaction ID to refund
     */
    function refundTransaction(uint256 txId) external onlyOperator nonReentrant {
        Transaction storage txn = transactions[txId];
        require(txn.sender != address(0), "CrossPay: Transaction does not exist");
        require(!txn.completed, "CrossPay: Transaction already completed");
        
        txn.completed = true;
        
        // Update fee balance
        feeBalances[txn.token] -= txn.fee;
        
        // Return tokens to sender (amount + fee)
        IERC20(txn.token).safeTransfer(txn.sender, txn.amount + txn.fee);
        
        emit TransactionRefunded(txId);
    }

    /**
     * @dev Withdraw collected fees
     * @param token The token address to withdraw fees for
     */
    function withdrawFees(address token) external onlyOwner nonReentrant validAddress(token) {
        uint256 amount = feeBalances[token];
        require(amount > 0, "CrossPay: No fees to withdraw");
        feeBalances[token] = 0;
        IERC20(token).safeTransfer(msg.sender, amount);
        emit FeesWithdrawn(token, amount);
    }

    /**
     * @dev Pause contract in emergency
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get transaction details
     * @param txId The transaction ID
     */
    function getTransaction(uint256 txId) external view returns (
        address sender,
        address recipient,
        address token,
        uint256 amount,
        uint256 fee,
        uint256 timestamp,
        bool completed
    ) {
        Transaction memory t = transactions[txId];
        require(t.sender != address(0), "CrossPay: Transaction does not exist");
        return (t.sender, t.recipient, t.token, t.amount, t.fee, t.timestamp, t.completed);
    }

    /**
     * @dev Get all supported tokens
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return _supportedTokens;
    }

    /**
     * @dev Remove a token from the supported tokens array
     */
    function _removeTokenFromSupported(address token) private {
        for (uint256 i = 0; i < _supportedTokens.length; i++) {
            if (_supportedTokens[i] == token) {
                _supportedTokens[i] = _supportedTokens[_supportedTokens.length - 1];
                _supportedTokens.pop();
                break;
            }
        }
    }

    /**
     * @dev Convert uint256 to string (helper function)
     */
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        return string(bstr);
    }
}
