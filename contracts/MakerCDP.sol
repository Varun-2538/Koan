// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

contract MakerCDPMock {
    mapping(address => uint256) public collateral;
    mapping(address => uint256) public debt;

    function lockCollateral(uint256 amount) external {
        collateral[msg.sender] += amount;
    }

    function generateDebt(uint256 amount) external {
        require(collateral[msg.sender] >= amount * 2, "Insufficient collateral"); // Simplified ratio
        debt[msg.sender] += amount;
    }
}