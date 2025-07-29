// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SnapshotVotingMock {
    mapping(string => uint256) public votes;

    function vote(string memory space, uint256 proposalId, bool support) external {
        // Simplified off-chain simulation
        votes[space] += support ? 1 : 0;
    }
}