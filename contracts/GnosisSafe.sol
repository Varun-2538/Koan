// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.0;

contract GnosisSafeMock {
    address[] public owners;
    uint256 public threshold;

    constructor(address[] memory _owners, uint256 _threshold) {
        owners = _owners;
        threshold = _threshold;
    }

    function execTransaction(address to, uint256 value, bytes memory data) external {
        // Simplified: Assume multisig checks passed
        (bool success, ) = to.call{value: value}(data);
        require(success, "Transaction failed");
    }
}