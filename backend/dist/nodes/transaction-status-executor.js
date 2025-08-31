"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionStatusExecutor = void 0;
const logger_1 = require("../utils/logger");
class TransactionStatusExecutor {
    type = 'transactionStatus';
    name = 'Transaction Status';
    description = 'Monitor and track blockchain transaction status and confirmations';
    transactionStatuses = ['pending', 'confirmed', 'failed', 'dropped'];
    async validate(inputs) {
        const errors = [];
        if (!inputs.transaction_hash) {
            errors.push('transaction_hash is required');
        }
        else {
            // Validate transaction hash format
            const hashRegex = /^0x[a-fA-F0-9]{64}$/;
            if (!hashRegex.test(inputs.transaction_hash)) {
                errors.push('Invalid transaction hash format. Must be a valid 32-byte hex string.');
            }
        }
        // Validate chain ID if specified
        if (inputs.chain_id && !this.isValidChainId(inputs.chain_id)) {
            errors.push(`Invalid chain ID: ${inputs.chain_id}`);
        }
        return { valid: errors.length === 0, errors };
    }
    async execute(inputs, context) {
        try {
            logger_1.logger.info(`📊 Checking transaction status: ${inputs.transaction_hash}`);
            const txHash = inputs.transaction_hash;
            const chainId = inputs.chain_id || '1';
            const includeReceipt = inputs.include_receipt || false;
            const waitForConfirmations = inputs.wait_for_confirmations || 1;
            // Get transaction details
            const transaction = await this.getTransactionDetails(txHash, chainId);
            // Get transaction receipt if confirmed
            const receipt = transaction.status === 'confirmed' && includeReceipt ?
                await this.getTransactionReceipt(txHash, chainId) : null;
            // Calculate confirmation details
            const confirmations = await this.getConfirmationCount(txHash, chainId);
            // Get gas usage analysis
            const gasAnalysis = transaction.status === 'confirmed' ?
                await this.analyzeGasUsage(transaction, chainId) : null;
            // Get transaction timeline
            const timeline = await this.getTransactionTimeline(txHash, chainId);
            const result = {
                success: true,
                data: {
                    transaction: {
                        hash: txHash,
                        status: transaction.status,
                        blockNumber: transaction.blockNumber,
                        blockHash: transaction.blockHash,
                        transactionIndex: transaction.transactionIndex,
                        confirmations: confirmations.count,
                        confirmedAt: transaction.confirmedAt,
                        chainId: chainId
                    },
                    details: {
                        from: transaction.from,
                        to: transaction.to,
                        value: transaction.value,
                        gasLimit: transaction.gasLimit,
                        gasUsed: transaction.gasUsed,
                        gasPrice: transaction.gasPrice,
                        nonce: transaction.nonce,
                        data: transaction.data
                    },
                    receipt: receipt,
                    confirmations: {
                        current: confirmations.count,
                        required: waitForConfirmations,
                        isFullyConfirmed: confirmations.count >= waitForConfirmations,
                        estimatedTime: confirmations.estimatedTime,
                        chainFinality: this.getChainFinality(chainId)
                    },
                    gasAnalysis: gasAnalysis,
                    timeline: timeline,
                    metadata: {
                        explorer: this.getExplorerLink(txHash, chainId),
                        type: this.classifyTransaction(transaction),
                        riskLevel: this.assessTransactionRisk(transaction),
                        recommendations: this.getTransactionRecommendations(transaction)
                    }
                }
            };
            logger_1.logger.info(`✅ Transaction status retrieved: ${transaction.status}`);
            return result;
        }
        catch (error) {
            logger_1.logger.error(`❌ Transaction status check failed:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Transaction status check failed'
            };
        }
    }
    async estimateGas(inputs) {
        // Transaction status checking doesn't require gas
        return '0';
    }
    async getTransactionDetails(txHash, chainId) {
        try {
            // In a real implementation, this would query the blockchain
            // Mock transaction data
            const statuses = ['pending', 'confirmed', 'failed'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const mockTransaction = {
                hash: txHash,
                status: randomStatus,
                blockNumber: randomStatus === 'confirmed' ? 18000000 + Math.floor(Math.random() * 1000) : null,
                blockHash: randomStatus === 'confirmed' ? '0x' + 'b'.repeat(64) : null,
                transactionIndex: randomStatus === 'confirmed' ? Math.floor(Math.random() * 100) : null,
                confirmedAt: randomStatus === 'confirmed' ? new Date().toISOString() : null,
                from: '0x742d35Cc6634C0532925a3b8D427b2C0ef46c',
                to: process.env.ONEINCH_ROUTER_ADDRESS || '0x1111111254fb6c44bAC0beD2854e76F90643097d',
                value: '1000000000000000000', // 1 ETH
                gasLimit: '200000',
                gasUsed: randomStatus === 'confirmed' ? '180000' : null,
                gasPrice: '20000000000', // 20 gwei
                nonce: 42,
                data: '0x' + 'ff'.repeat(100)
            };
            return mockTransaction;
        }
        catch (error) {
            throw new Error(`Failed to get transaction details: ${error}`);
        }
    }
    async getTransactionReceipt(txHash, chainId) {
        try {
            // Mock transaction receipt
            return {
                transactionHash: txHash,
                blockNumber: 18000000,
                blockHash: '0x' + 'b'.repeat(64),
                transactionIndex: 42,
                from: '0x742d35Cc6634C0532925a3b8D427b2C0ef46c',
                to: process.env.ONEINCH_ROUTER_ADDRESS || '0x1111111254fb6c44bAC0beD2854e76F90643097d',
                gasUsed: '180000',
                effectiveGasPrice: '20000000000',
                status: '0x1', // Success
                logs: [
                    {
                        address: '0xA0b86a33E6417c4a4e6d3b7e6d8f0e8b8e8c8d8e',
                        topics: ['0x' + 'dd'.repeat(32)],
                        data: '0x' + '00'.repeat(64)
                    }
                ],
                contractAddress: null,
                logsBloom: '0x' + '00'.repeat(256),
                type: '0x2', // EIP-1559
                cumulativeGasUsed: '2000000'
            };
        }
        catch (error) {
            throw new Error(`Failed to get transaction receipt: ${error}`);
        }
    }
    async getConfirmationCount(txHash, chainId) {
        try {
            const currentBlock = 18000100;
            const txBlock = 18000000;
            const confirmations = Math.max(0, currentBlock - txBlock);
            // Estimate time to finality based on chain
            const blockTimes = {
                '1': 12, // Ethereum
                '56': 3, // BSC
                '137': 2, // Polygon
                '42161': 1, // Arbitrum
                '10': 2 // Optimism
            };
            const blockTime = blockTimes[chainId] || 12;
            const estimatedTime = confirmations > 0 ? 0 : blockTime * 1000; // milliseconds
            return {
                count: confirmations,
                estimatedTime: estimatedTime,
                isFinalized: confirmations >= this.getChainFinality(chainId).confirmations
            };
        }
        catch (error) {
            throw new Error(`Failed to get confirmation count: ${error}`);
        }
    }
    async analyzeGasUsage(transaction, chainId) {
        try {
            const gasUsed = parseInt(transaction.gasUsed || '0');
            const gasLimit = parseInt(transaction.gasLimit || '0');
            const gasPrice = parseInt(transaction.gasPrice || '0');
            const efficiency = gasLimit > 0 ? (gasUsed / gasLimit) * 100 : 0;
            const totalCost = (gasUsed * gasPrice).toString();
            // Mock current gas prices for comparison
            const currentGasPrice = this.getCurrentGasPrice(chainId);
            const couldSaveFees = gasPrice > currentGasPrice;
            return {
                gasUsed: gasUsed.toString(),
                gasLimit: gasLimit.toString(),
                gasPrice: gasPrice.toString(),
                totalCost: totalCost,
                efficiency: efficiency.toFixed(2) + '%',
                comparison: {
                    currentGasPrice: currentGasPrice.toString(),
                    couldSaveFees: couldSaveFees,
                    potentialSavings: couldSaveFees ? ((gasPrice - currentGasPrice) * gasUsed).toString() : '0'
                },
                recommendations: this.getGasRecommendations(efficiency, couldSaveFees)
            };
        }
        catch (error) {
            return null;
        }
    }
    async getTransactionTimeline(txHash, chainId) {
        const now = Date.now();
        return [
            {
                stage: 'submitted',
                timestamp: now - 300000, // 5 minutes ago
                description: 'Transaction submitted to mempool',
                status: 'completed'
            },
            {
                stage: 'pending',
                timestamp: now - 240000, // 4 minutes ago
                description: 'Waiting for miner inclusion',
                status: 'completed'
            },
            {
                stage: 'mined',
                timestamp: now - 180000, // 3 minutes ago
                description: 'Included in block',
                status: 'completed'
            },
            {
                stage: 'confirmed',
                timestamp: now - 120000, // 2 minutes ago
                description: 'Transaction confirmed',
                status: 'completed'
            }
        ];
    }
    getExplorerLink(txHash, chainId) {
        const explorers = {
            '1': 'https://etherscan.io/tx/',
            '56': 'https://bscscan.com/tx/',
            '137': 'https://polygonscan.com/tx/',
            '42161': 'https://arbiscan.io/tx/',
            '10': 'https://optimistic.etherscan.io/tx/',
            '250': 'https://ftmscan.com/tx/',
            '43114': 'https://snowtrace.io/tx/',
            '25': 'https://cronoscan.com/tx/',
            '8453': 'https://basescan.org/tx/'
        };
        const explorer = explorers[chainId] || explorers['1'];
        return explorer + txHash;
    }
    classifyTransaction(transaction) {
        // Simple classification based on data and value
        if (transaction.data === '0x') {
            return 'transfer';
        }
        const oneInchRouter = process.env.ONEINCH_ROUTER_ADDRESS || '0x1111111254fb6c44bAC0beD2854e76F90643097d';
        if (transaction.to === oneInchRouter) {
            return '1inch_swap';
        }
        return 'contract_interaction';
    }
    assessTransactionRisk(transaction) {
        // Mock risk assessment
        return 'low';
    }
    getTransactionRecommendations(transaction) {
        const recommendations = [];
        if (transaction.status === 'pending') {
            recommendations.push('⏳ Transaction is still pending - please wait for confirmation');
            recommendations.push('🔄 You can try to speed up the transaction by increasing gas price');
        }
        if (transaction.status === 'failed') {
            recommendations.push('❌ Transaction failed - check if you have sufficient balance and gas');
            recommendations.push('🔍 Review the transaction data and try again with higher gas limit');
        }
        if (transaction.status === 'confirmed') {
            recommendations.push('✅ Transaction confirmed successfully');
            recommendations.push('📋 Save the transaction hash for your records');
        }
        return recommendations;
    }
    getCurrentGasPrice(chainId) {
        // Mock current gas prices in wei
        const gasPrices = {
            '1': 18000000000, // 18 gwei for Ethereum
            '56': 5000000000, // 5 gwei for BSC
            '137': 30000000000, // 30 gwei for Polygon
            '42161': 100000000, // 0.1 gwei for Arbitrum
            '10': 1000000000 // 1 gwei for Optimism
        };
        return gasPrices[chainId] || 20000000000;
    }
    getGasRecommendations(efficiency, couldSaveFees) {
        const recommendations = [];
        if (efficiency < 50) {
            recommendations.push('⚡ Transaction was very gas efficient');
        }
        else if (efficiency > 90) {
            recommendations.push('⚠️ Transaction used most of the gas limit - consider increasing for safety');
        }
        if (couldSaveFees) {
            recommendations.push('💰 You could have saved on gas fees with current prices');
        }
        return recommendations;
    }
    getChainFinality(chainId) {
        const finality = {
            '1': { confirmations: 12, time: '2-3 minutes' },
            '56': { confirmations: 15, time: '45 seconds' },
            '137': { confirmations: 128, time: '4-5 minutes' },
            '42161': { confirmations: 1, time: '1-2 seconds' },
            '10': { confirmations: 1, time: '2-4 seconds' }
        };
        return finality[chainId] || finality['1'];
    }
    isValidChainId(chainId) {
        const validChainIds = ['1', '56', '137', '42161', '10', '250', '43114', '25', '8453', '324', '59144', '5000', '5'];
        return validChainIds.includes(chainId);
    }
}
exports.TransactionStatusExecutor = TransactionStatusExecutor;
//# sourceMappingURL=transaction-status-executor.js.map