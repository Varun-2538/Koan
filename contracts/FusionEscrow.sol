// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FusionEscrow {
    mapping(bytes32 => uint256) public escrows;
    mapping(bytes32 => uint256) public timelocks;

    function deposit(bytes32 hashlock, uint256 amount, uint256 timelock) external payable {
        require(msg.value == amount, "Incorrect amount");
        escrows[hashlock] = amount;
        timelocks[hashlock] = block.timestamp + timelock;
    }

    function withdraw(bytes32 hashlock, bytes32 secret) external {
        require(keccak256(abi.encodePacked(secret)) == hashlock, "Invalid secret");
        require(block.timestamp < timelocks[hashlock], "Timelock expired");
        payable(msg.sender).transfer(escrows[hashlock]);
        escrows[hashlock] = 0;
    }

    function cancel(bytes32 hashlock) external {
        require(block.timestamp >= timelocks[hashlock], "Timelock not expired");
        // Refund logic simplified
        escrows[hashlock] = 0;
    }
}