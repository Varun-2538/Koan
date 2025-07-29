// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";

contract GovernorBravoMock is Governor, GovernorSettings, GovernorCountingSimple {
    constructor(address timelock, address token, uint256 votingDelay, uint256 votingPeriod, uint256 proposalThreshold)
        Governor("GovernorBravo")
        GovernorSettings(votingDelay, votingPeriod, proposalThreshold)
    {}

    function quorum(uint256 blockNumber) public pure override returns (uint256) {
        return 4; // Simplified quorum
    }
}