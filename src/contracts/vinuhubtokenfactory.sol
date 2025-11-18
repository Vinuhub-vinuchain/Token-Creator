// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TokenFactory {
    uint256 public creationFee = 10000 ether;
    address public owner;
    address public feeWallet;

    event TokenCreated(address indexed token, address indexed creator);
    event FeeWithdrawn(address indexed to, uint256 amount);
    event FeeWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event CreationFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor(address _feeWallet) {
        require(_feeWallet != address(0), "Invalid fee wallet");
        owner = msg.sender;
        feeWallet = _feeWallet;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setCreationFee(uint256 _fee) external onlyOwner {
        emit CreationFeeUpdated(creationFee, _fee);
        creationFee = _fee;
    }

    function setFeeWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Zero address");
        emit FeeWalletUpdated(feeWallet, _newWallet);
        feeWallet = _newWallet;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds");
        (bool sent, ) = feeWallet.call{value: balance}("");
        require(sent, "Withdraw failed");
        emit FeeWithdrawn(feeWallet, balance);
    }

    function createToken(
        string memory name,
        string memory symbol,
        uint256 supply,
        uint8 decimals,
        uint256 buyTax,     // in basis points (500 = 5%)
        uint256 sellTax,
        uint256 burnRate,
        address devWallet,
        uint256 maxTxPercent,
        bool renounce
    ) external payable returns (address) {
        require(msg.value >= creationFee, "Insufficient fee");
        require(buyTax <= 1000 && sellTax <= 1000, "Tax too high");
        require(burnRate <= 500, "Burn too high");

        // Safely forward fee
        (bool sent, ) = feeWallet.call{value: msg.value}("");
        require(sent, "Fee transfer failed");

        CustomToken token = new CustomToken(
            name, symbol, supply, decimals,
            buyTax, sellTax, burnRate,
            devWallet, maxTxPercent, msg.sender
        );

        if (renounce) token.renounceOwnership();
        else token.transferOwnership(msg.sender);

        emit TokenCreated(address(token), msg.sender);
        return address(token);
    }
}

contract CustomToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    uint256 public buyTax;
    uint256 public sellTax;
    uint256 public burnRate;
    address public devWallet;
    uint256 public maxTxAmount;
    address public owner;
    address public pair;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(
        string memory _name, string memory _symbol, uint256 _supply, uint8 _decimals,
        uint256 _buyTax, uint256 _sellTax, uint256 _burnRate,
        address _devWallet, uint256 _maxTxPercent, address _owner
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _supply * (10 ** _decimals);
        balanceOf[_owner] = totalSupply;
        buyTax = _buyTax;
        sellTax = _sellTax;
        burnRate = _burnRate;
        devWallet = _devWallet;
        maxTxAmount = totalSupply * _maxTxPercent / 100;
        owner = _owner;
        emit Transfer(address(0), _owner, totalSupply);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        if (allowance[from][msg.sender] != type(uint256).max) {
            allowance[from][msg.sender] -= amount;
        }
        _transfer(from, to, amount);
        return true;
    }

    function setPair(address _pair) external onlyOwner {
        pair = _pair;
    }

    function renounceOwnership() external onlyOwner {
        owner = address(0);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(balanceOf[from] >= amount, "Insufficient balance");
        if (maxTxAmount > 0) require(amount <= maxTxAmount, "Exceeds max tx");

        uint256 tax = 0;
        if (from == pair && buyTax > 0) tax = amount * buyTax / 10000;
        else if (to == pair && sellTax > 0) tax = amount * sellTax / 10000;

        uint256 burn = burnRate > 0 ? amount * burnRate / 10000 : 0;
        uint256 send = amount - tax - burn;

        balanceOf[from] -= amount;
        balanceOf[to] += send;

        if (tax > 0 && devWallet != address(0)) {
            balanceOf[devWallet] += tax;
            emit Transfer(from, devWallet, tax);
        }
        if (burn > 0) {
            totalSupply -= burn;
            emit Transfer(from, address(0), burn);
        }
        emit Transfer(from, to, send);
    }
}
