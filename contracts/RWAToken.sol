// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RWAToken
 * @dev A simple contract for Real World Asset tokenization
 */
contract RWAToken {
    // Token details
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    // Asset details
    string public assetType;
    string public assetDescription;
    uint256 public assetValue;
    bool public assetVerified;
    
    // Owner address
    address public owner;
    
    // Balances and allowances
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event AssetVerificationChanged(bool verified);
    event AssetValueUpdated(uint256 newValue);
    
    /**
     * @dev Constructor initializes the token and asset details
     */
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _assetType,
        string memory _assetDescription,
        uint256 _assetValue,
        uint256 initialSupply
    ) {
        name = _name;
        symbol = _symbol;
        assetType = _assetType;
        assetDescription = _assetDescription;
        assetValue = _assetValue;
        owner = msg.sender;
        
        // Mint initial supply to the owner
        totalSupply = initialSupply * 10**uint256(decimals);
        balanceOf[owner] = totalSupply;
        emit Transfer(address(0), owner, totalSupply);
    }
    
    /**
     * @dev Modifier to restrict function access to the owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Transfer tokens to a specified address
     * @param to The address to transfer to
     * @param value The amount to be transferred
     * @return success True if the transfer was successful
     */
    function transfer(address to, uint256 value) public returns (bool success) {
        require(to != address(0), "Transfer to zero address");
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender
     * @param spender The address which will spend the funds
     * @param value The amount of tokens to be spent
     * @return success True if the approval was successful
     */
    function approve(address spender, uint256 value) public returns (bool success) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    /**
     * @dev Transfer tokens from one address to another
     * @param from The address to transfer from
     * @param to The address to transfer to
     * @param value The amount to be transferred
     * @return success True if the transfer was successful
     */
    function transferFrom(address from, address to, uint256 value) public returns (bool success) {
        require(to != address(0), "Transfer to zero address");
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        emit Transfer(from, to, value);
        return true;
    }
    
    /**
     * @dev Update the verification status of the asset
     * @param verified The new verification status
     */
    function setAssetVerification(bool verified) public onlyOwner {
        assetVerified = verified;
        emit AssetVerificationChanged(verified);
    }
    
    /**
     * @dev Update the value of the asset
     * @param newValue The new asset value
     */
    function updateAssetValue(uint256 newValue) public onlyOwner {
        assetValue = newValue;
        emit AssetValueUpdated(newValue);
    }
    
    /**
     * @dev Mint new tokens
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "Mint to zero address");
        
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
    
    /**
     * @dev Burn tokens
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) public {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
} 