// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

contract AragonDAOFactoryMock {
    event DAOCreated(address dao);

    function createDAO(string memory name, address votingToken) external returns (address) {
        // Simplified DAO creation
        address dao = address(this); // Placeholder
        emit DAOCreated(dao);
        return dao;
    }
}