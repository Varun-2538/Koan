"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IcmSenderExecutor = void 0;
const ethers_1 = require("ethers");
// Avalanche Fuji Teleporter Contract Details
const TELEPORTER_ADDRESS = '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf'; // Fuji testnet
const FUJI_CHAIN_ID = 43113;
const FUJI_RPC_URL = 'https://api.avax-test.network/ext/bc/C/rpc';
// Simplified Teleporter ABI for sendCrossChainMessage
const TELEPORTER_ABI = [
    {
        "inputs": [
            { "internalType": "bytes32", "name": "destinationBlockchainID", "type": "bytes32" },
            { "internalType": "address", "name": "destinationAddress", "type": "address" },
            { "internalType": "address", "name": "feeTokenAddress", "type": "address" },
            { "internalType": "uint256", "name": "feeAmount", "type": "uint256" },
            { "internalType": "uint256", "name": "requiredGasLimit", "type": "uint256" },
            { "internalType": "address[]", "name": "multiHopAddresses", "type": "address[]" },
            { "internalType": "bytes", "name": "message", "type": "bytes" }
        ],
        "name": "sendCrossChainMessage",
        "outputs": [{ "internalType": "uint256", "name": "messageID", "type": "uint256" }],
        "stateMutability": "payable",
        "type": "function"
    }
];
class IcmSenderExecutor {
    type = 'icmSender';
    name = 'ICM Sender';
    description = 'Send cross-chain messages using Avalanche Teleporter';
    logger;
    provider;
    constructor(logger) {
        this.logger = logger;
        this.provider = new ethers_1.ethers.JsonRpcProvider(FUJI_RPC_URL);
    }
    async validate(inputs) {
        const isTemplateMode = inputs.template_creation_mode || inputs.mode === 'template' || inputs.config_only;
        const errors = [];
        if (isTemplateMode) {
            try {
                await this.validateTemplateConfig(inputs);
                return { valid: true, errors: [] };
            }
            catch (error) {
                return { valid: false, errors: [error.message] };
            }
        }
        // Execution mode validation
        if (!inputs.sourceChain) {
            errors.push('Source chain is required');
        }
        if (!inputs.destinationChainID) {
            errors.push('Destination chain ID is required');
        }
        if (!inputs.recipient) {
            errors.push('Recipient address is required');
        }
        if (!inputs.walletAddress) {
            errors.push('Wallet address is required');
        }
        // Validate addresses
        if (inputs.recipient && !ethers_1.ethers.isAddress(inputs.recipient)) {
            errors.push('Invalid recipient address format');
        }
        if (inputs.walletAddress && !ethers_1.ethers.isAddress(inputs.walletAddress)) {
            errors.push('Invalid wallet address format');
        }
        // Validate payload type
        if (inputs.payloadType && !['string', 'number', 'object'].includes(inputs.payloadType)) {
            errors.push('Payload type must be string, number, or object');
        }
        return { valid: errors.length === 0, errors };
    }
    async validateTemplateConfig(inputs) {
        // Template mode validation
        if (inputs.supportedChains && !Array.isArray(inputs.supportedChains)) {
            throw new Error('supportedChains must be an array');
        }
    }
    async execute(inputs, context) {
        const startTime = Date.now();
        const isTemplateMode = inputs.template_creation_mode || inputs.mode === 'template' || inputs.config_only;
        try {
            if (isTemplateMode) {
                return this.executeTemplateMode(inputs, context, startTime);
            }
            // Extract inputs
            const { sourceChain, destinationChainID, recipient, amount, payloadType = 'string', walletAddress } = inputs;
            this.logger.info(`📤 Sending ICM message from ${sourceChain} to ${destinationChainID}`);
            // Create Teleporter contract instance
            const teleporter = new ethers_1.ethers.Contract(TELEPORTER_ADDRESS, TELEPORTER_ABI, this.provider);
            // Prepare message data based on payload type
            let messageData;
            if (payloadType === 'number' && amount !== undefined) {
                messageData = ethers_1.ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [amount]);
            }
            else if (payloadType === 'string') {
                const message = amount || 'Hello from Unite DeFi!';
                messageData = ethers_1.ethers.AbiCoder.defaultAbiCoder().encode(['string'], [message]);
            }
            else {
                // For objects or other types, convert to JSON string
                const payload = { type: payloadType, data: amount || {}, timestamp: Date.now() };
                messageData = ethers_1.ethers.AbiCoder.defaultAbiCoder().encode(['string'], [JSON.stringify(payload)]);
            }
            // Prepare cross-chain message parameters
            const destinationBlockchainID = ethers_1.ethers.zeroPadValue(destinationChainID.startsWith('0x') ?
                destinationChainID : `0x${destinationChainID}`, 32);
            const feeInfo = {
                feeTokenAddress: ethers_1.ethers.ZeroAddress, // Use native AVAX for fees
                feeAmount: ethers_1.ethers.parseEther('0.01'), // 0.01 AVAX for testing
                requiredGasLimit: ethers_1.ethers.toBigInt(100000),
                multiHopAddresses: [] // No multi-hop for simplicity
            };
            // Encode the function call
            const callData = teleporter.interface.encodeFunctionData('sendCrossChainMessage', [
                destinationBlockchainID,
                recipient,
                feeInfo.feeTokenAddress,
                feeInfo.feeAmount,
                feeInfo.requiredGasLimit,
                feeInfo.multiHopAddresses,
                messageData
            ]);
            // Create unsigned transaction
            const unsignedTx = {
                to: TELEPORTER_ADDRESS,
                data: callData,
                value: feeInfo.feeAmount.toString(),
                chainId: FUJI_CHAIN_ID,
                gasLimit: '200000',
                from: walletAddress
            };
            this.logger.info(`📝 Unsigned transaction prepared for ${walletAddress}`);
            // Send to frontend for signing via WebSocket
            if (!context.userSocket) {
                throw new Error('WebSocket connection not available for signing');
            }
            context.userSocket.emit('sign-transaction', {
                executionId: context.executionId,
                nodeId: context.nodeId || 'icm-sender',
                unsignedTx: unsignedTx
            });
            this.logger.info(`📤 Sent signing request to frontend for execution ${context.executionId}`);
            // Wait for signed transaction response with timeout
            const signedTx = await this.waitForSignedTransaction(context);
            this.logger.info(`✅ Received signed transaction, broadcasting...`);
            // Broadcast the signed transaction
            const txResponse = await this.provider.broadcastTransaction(signedTx);
            this.logger.info(`🚀 Transaction broadcasted: ${txResponse.hash}`);
            // Wait for confirmation (optional for demo)
            const receipt = await txResponse.wait(1);
            this.logger.info(`✅ Transaction confirmed in block ${receipt?.blockNumber}`);
            // Extract message ID from logs (simplified - in real implementation, parse logs)
            const messageID = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            return {
                success: true,
                outputs: {
                    transactionHash: txResponse.hash,
                    messageID: messageID,
                    status: 'sent',
                    recipient: recipient,
                    destinationChain: destinationChainID,
                    payloadType: payloadType,
                    gasUsed: receipt?.gasUsed?.toString() || '0'
                },
                logs: [
                    `📤 ICM message sent successfully`,
                    `🔗 Transaction Hash: ${txResponse.hash}`,
                    `🎯 Message ID: ${messageID}`,
                    `🏔️ Destination: ${destinationChainID}`,
                    `👤 Recipient: ${recipient}`,
                    `💰 Fee: ${ethers_1.ethers.formatEther(feeInfo.feeAmount)} AVAX`,
                    `⛽ Gas Used: ${receipt?.gasUsed?.toString() || 'pending'}`
                ],
                executionTime: Date.now() - startTime,
                transactionHash: txResponse.hash,
                gasUsed: receipt?.gasUsed?.toString() || '0'
            };
        }
        catch (error) {
            this.logger.error('❌ ICM sending failed:', error);
            return {
                success: false,
                outputs: {},
                error: error.message,
                logs: [
                    `❌ Failed to send ICM message: ${error.message}`,
                    `🔍 Error details: ${error.stack || 'No stack trace available'}`
                ],
                executionTime: Date.now() - startTime
            };
        }
    }
    async waitForSignedTransaction(context) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Transaction signing timeout - user did not sign within 60 seconds'));
            }, 60000); // 60 second timeout
            const handleSignedTx = (data) => {
                if (data.executionId === context.executionId && data.nodeId === (context.nodeId || 'icm-sender')) {
                    clearTimeout(timeout);
                    context.userSocket?.off('transaction-signed', handleSignedTx);
                    resolve(data.signedTx);
                }
            };
            context.userSocket?.on('transaction-signed', handleSignedTx);
            // Also listen for signing errors
            const handleSigningError = (data) => {
                if (data.executionId === context.executionId && data.nodeId === (context.nodeId || 'icm-sender')) {
                    clearTimeout(timeout);
                    context.userSocket?.off('transaction-signed', handleSignedTx);
                    context.userSocket?.off('signing-error', handleSigningError);
                    reject(new Error(`Signing failed: ${data.error}`));
                }
            };
            context.userSocket?.on('signing-error', handleSigningError);
        });
    }
    async executeTemplateMode(inputs, context, startTime) {
        this.logger.info(`🎭 Generating ICM template configuration`);
        const config = {
            supportedChains: inputs.supportedChains || ['C', 'P', 'X'], // C-Chain, P-Chain, X-Chain
            defaultFeeToken: inputs.defaultFeeToken || ethers_1.ethers.ZeroAddress,
            defaultGasLimit: inputs.defaultGasLimit || 100000,
            multiHopEnabled: inputs.multiHopEnabled || false,
            messageTypes: ['string', 'number', 'object', 'bytes']
        };
        // Mock successful ICM send for template
        const mockResult = {
            transactionHash: '0x' + 'a'.repeat(64),
            messageID: `template_msg_${Date.now()}`,
            status: 'template-sent',
            recipient: '0x742d35Cc6634C0532925a3b8D427b2C0ef46c',
            destinationChain: 'C',
            payloadType: 'string'
        };
        return {
            success: true,
            outputs: {
                icmConfig: config,
                mockSend: mockResult
            },
            logs: [
                `🎭 ICM template configuration created`,
                `🔗 Supported chains: ${config.supportedChains.join(', ')}`,
                `💰 Default fee token: ${config.defaultFeeToken}`,
                `⛽ Default gas limit: ${config.defaultGasLimit}`,
                `🔄 Multi-hop: ${config.multiHopEnabled ? 'enabled' : 'disabled'}`,
                `📝 Message types: ${config.messageTypes.join(', ')}`,
                `✅ Mock message sent: ${mockResult.messageID}`
            ],
            executionTime: Date.now() - startTime
        };
    }
    async estimateGas(inputs) {
        // Estimate gas for ICM send transaction
        return '200000'; // Conservative estimate for Teleporter call
    }
}
exports.IcmSenderExecutor = IcmSenderExecutor;
//# sourceMappingURL=icm-sender-executor.js.map