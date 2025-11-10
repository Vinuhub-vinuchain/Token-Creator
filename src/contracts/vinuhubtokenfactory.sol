// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TokenFactory {
    uint256 public creationFee = 10000 ether;
    address public owner;

    event TokenCreated(address indexed tokenAddress, address indexed creator);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setCreationFee(uint256 _fee) external onlyOwner {
        creationFee = _fee;
    }

    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals,
        uint256 buyTaxRate,
        uint256 sellTaxRate,
        uint256 burnRate,
        address devWallet,
        uint256 maxTxPercentage,
        bool renounce
    ) external payable returns (address) {
        require(msg.value >= creationFee, "Insufficient creation fee");
        require(buyTaxRate <= 1000, "Buy tax too high"); // Max 10%
        require(sellTaxRate <= 1000, "Sell tax too high"); // Max 10%
        require(burnRate <= 500, "Burn rate too high"); // Max 5%
        require(maxTxPercentage <= 100, "Max tx too high");

        CustomToken token = new CustomToken(
            name,
            symbol,
            initialSupply,
            decimals,
            buyTaxRate,
            sellTaxRate,
            burnRate,
            devWallet,
            maxTxPercentage,
            msg.sender
        );

        if (renounce) {
            token.renounceOwnership();
        } else {
            token.transferOwnership(msg.sender);
        }

        emit TokenCreated(address(token), msg.sender);
        return address(token);
    }
}

contract CustomToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    uint256 public buyTaxRate;
    uint256 public sellTaxRate;
    uint256 public burnRate;
    address public devWallet;
    uint256 public maxTxAmount;
    address public owner;
    address public pair;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        uint8 _decimals,
        uint256 _buyTaxRate,
        uint256 _sellTaxRate,
        uint256 _burnRate,
        address _devWallet,
        uint256 _maxTxPercentage,
        address _owner
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _initialSupply * 10 ** _decimals;
        buyTaxRate = _buyTaxRate;
        sellTaxRate = _sellTaxRate;
        burnRate = _burnRate;
        devWallet = _devWallet;
        maxTxAmount = (_maxTxPercentage * totalSupply) / 100;
        owner = _owner;
        _balances[_owner] = totalSupply;
        emit Transfer(address(0), _owner, totalSupply);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address owner_, address spender) public view returns (uint256) {
        return _allowances[owner_][spender];
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= amount, "Insufficient allowance");
        _approve(from, msg.sender, currentAllowance - amount);
        _transfer(from, to, amount);
        return true;
    }

    function setPair(address _pair) external onlyOwner {
        pair = _pair;
    }

    function renounceOwnership() external onlyOwner {
        emit OwnershipTransferred(owner, address(0));
        owner = address(0);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "Zero address");
        require(to != address(0), "Zero address");
        require(_balances[from] >= amount, "Insufficient balance");
        if (maxTxAmount > 0) {
            require(amount <= maxTxAmount, "Exceeds max tx amount");
        }

        uint256 taxAmount = 0;
        if (from == pair && buyTaxRate > 0) {
            taxAmount = (amount * buyTaxRate) / 10000;
        } else if (to == pair && sellTaxRate > 0) {
            taxAmount = (amount * sellTaxRate) / 10000;
        }

        uint256 burnAmount = burnRate > 0 ? (amount * burnRate) / 10000 : 0;
        uint256 transferAmount = amount - taxAmount - burnAmount;

        _balances[from] -= amount;
        _balances[to] += transferAmount;
        if (taxAmount > 0 && devWallet != address(0)) {
            _balances[devWallet] += taxAmount;
            emit Transfer(from, devWallet, taxAmount);
        }
        if (burnAmount > 0) {
            totalSupply -= burnAmount;
            emit Transfer(from, address(0), burnAmount);
        }
        emit Transfer(from, to, transferAmount);
    }

    function _approve(address owner_, address spender, uint256 amount) internal {
        require(owner_ != address(0), "Zero address");
        require(spender != address(0), "Zero address");
        _allowances[owner_][spender] = amount;
        emit Approval(owner_, spender, amount);
    }
}
