// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract TimelockMock is TimelockController {
    constructor(address[] memory proposers, address[] memory executors, address admin)
        TimelockController(2 days, proposers, executors, admin)
    {}
}