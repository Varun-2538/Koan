"use strict";
// Core execution engine types for DeFi workflows
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainError = exports.ValidationError = exports.ExecutionError = void 0;
// Error types
class ExecutionError extends Error {
    nodeId;
    nodeType;
    executionId;
    cause;
    constructor(message, nodeId, nodeType, executionId, cause) {
        super(message);
        this.nodeId = nodeId;
        this.nodeType = nodeType;
        this.executionId = executionId;
        this.cause = cause;
        this.name = 'ExecutionError';
    }
}
exports.ExecutionError = ExecutionError;
class ValidationError extends Error {
    field;
    value;
    constructor(message, field, value) {
        super(message);
        this.field = field;
        this.value = value;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class ChainError extends Error {
    chainId;
    transactionHash;
    blockNumber;
    constructor(message, chainId, transactionHash, blockNumber) {
        super(message);
        this.chainId = chainId;
        this.transactionHash = transactionHash;
        this.blockNumber = blockNumber;
        this.name = 'ChainError';
    }
}
exports.ChainError = ChainError;
//# sourceMappingURL=index.js.map