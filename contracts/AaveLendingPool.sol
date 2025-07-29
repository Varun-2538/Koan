// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.0;

interface ILendingPool {
    function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external;
}

contract AaveLendingPoolMock is ILendingPool {
    mapping(address => uint256) public balances;

    function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external override {
        // Simplified deposit logic
        balances[onBehalfOf] += amount;
    }

    function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external override {
        // Simplified borrow logic
        require(balances[onBehalfOf] >= amount, "Insufficient collateral");
        balances[onBehalfOf] -= amount;
    }
}