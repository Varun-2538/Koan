import { ethers } from 'ethers'
import { Logger } from 'winston'
import {
  NodeExecutor,
  NodeExecutionResult,
  ExecutionContext,
  ValidationError,
  ChainError
} from '@/types'

// Avalanche Fuji Teleporter Contract Details
const TELEPORTER_ADDRESS = process.env.TELEPORTER_CONTRACT_ADDRESS || '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf' // Fuji testnet
const FUJI_RPC_URL = process.env.AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'

// Teleporter ABI for receiving messages (simplified)
const TELEPORTER_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "messageID", "type": "uint256"},
      {"indexed": false, "internalType": "bytes32", "name": "sourceBlockchainID", "type": "bytes32"},
      {"indexed": false, "internalType": "address", "name": "sourceAddress", "type": "address"},
      {"indexed": false, "internalType": "address", "name": "recipient", "type": "address"},
      {"indexed": false, "internalType": "bytes", "name": "message", "type": "bytes"}
    ],
    "name": "ReceiveCrossChainMessage",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "messageID", "type": "uint256"},
      {"internalType": "bytes32", "name": "sourceBlockchainID", "type": "bytes32"}
    ],
    "name": "getMessagePayload",
    "outputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
    "stateMutability": "view",
    "type": "function"
  }
]

export class IcmReceiverExecutor implements NodeExecutor {
  readonly type = 'icmReceiver'
  readonly name = 'ICM Receiver'
  readonly description = 'Receive and process cross-chain messages from Avalanche Teleporter'

  private logger: Logger
  private provider: ethers.JsonRpcProvider
  private teleporter: ethers.Contract

  constructor(logger: Logger) {
    this.logger = logger
    this.provider = new ethers.JsonRpcProvider(FUJI_RPC_URL)
    this.teleporter = new ethers.Contract(TELEPORTER_ADDRESS, TELEPORTER_ABI, this.provider)
  }

  async validate(inputs: Record<string, any>): Promise<{ valid: boolean; errors: string[] }> {
    const isTemplateMode = inputs.template_creation_mode || inputs.mode === 'template' || inputs.config_only
    const errors: string[] = []

    if (isTemplateMode) {
      try {
        await this.validateTemplateConfig(inputs)
        return { valid: true, errors: [] }
      } catch (error: any) {
        return { valid: false, errors: [error.message] }
      }
    }

    // Execution mode validation
    if (!inputs.messageID) {
      errors.push('Message ID is required')
    }
    if (!inputs.sourceChainID) {
      errors.push('Source chain ID is required')
    }

    return { valid: errors.length === 0, errors }
  }

  private async validateTemplateConfig(inputs: Record<string, any>): Promise<void> {
    // Template mode validation
    if (inputs.pollingInterval && (inputs.pollingInterval < 5 || inputs.pollingInterval > 300)) {
      throw new Error('Polling interval must be between 5 and 300 seconds')
    }
  }

  async execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult> {
    const startTime = Date.now()
    const isTemplateMode = inputs.template_creation_mode || inputs.mode === 'template' || inputs.config_only

    try {
      if (isTemplateMode) {
        return this.executeTemplateMode(inputs, context, startTime)
      }

      // Extract inputs
      const { messageID, sourceChainID, pollingTimeout = 30 } = inputs

      this.logger.info(`📥 Receiving ICM message ${messageID} from ${sourceChainID}`)

      // Convert inputs to proper types
      const messageIdNum = typeof messageID === 'string' ? parseInt(messageID.replace('msg_', '')) : messageID
      const sourceBlockchainID = ethers.zeroPadValue(sourceChainID.startsWith('0x') ?
        sourceChainID : `0x${sourceChainID}`, 32)

      // Try to get message payload from Teleporter contract
      let messagePayload: string = ''
      let decodedPayload: any = {}
      let status = 'received'

      try {
        // Call the contract to get message payload
        messagePayload = await this.teleporter.getMessagePayload(messageIdNum, sourceBlockchainID)
        this.logger.info(`✅ Message payload retrieved: ${messagePayload}`)

        // Try to decode the payload
        try {
          // First try to decode as string
          decodedPayload = ethers.AbiCoder.defaultAbiCoder().decode(['string'], messagePayload)[0]

          // If it's a JSON string, parse it
          try {
            const parsed = JSON.parse(decodedPayload)
            if (typeof parsed === 'object' && parsed !== null) {
              decodedPayload = parsed
            }
          } catch (jsonError) {
            // Not JSON, keep as string
          }
        } catch (decodeError) {
          // If string decoding fails, try other types
          try {
            decodedPayload = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], messagePayload)[0]
            decodedPayload = {
              type: 'number',
              value: decodedPayload.toString(),
              raw: messagePayload
            }
          } catch (numberError) {
            // Keep raw payload if all decoding fails
            decodedPayload = {
              type: 'bytes',
              raw: messagePayload,
              decoded: false
            }
          }
        }

        status = 'decoded'

      } catch (contractError: any) {
        this.logger.warn(`⚠️ Could not retrieve message from contract: ${contractError.message}`)

        // For demo purposes, simulate a received message if contract call fails
        if (messageID.includes('msg_')) {
          decodedPayload = {
            type: 'string',
            data: `Simulated cross-chain message from ${sourceChainID}`,
            timestamp: Date.now(),
            messageID: messageID
          }
          status = 'simulated'
          this.logger.info(`🎭 Using simulated message for demo purposes`)
        } else {
          throw new Error(`Failed to retrieve message ${messageID}: ${contractError.message}`)
        }
      }

      // Get additional message metadata
      const metadata = {
        receivedAt: new Date().toISOString(),
        sourceChain: sourceChainID,
        messageID: messageID,
        contractAddress: TELEPORTER_ADDRESS,
        network: 'Avalanche Fuji'
      }

      this.logger.info(`✅ ICM message processed: ${status}`)

      return {
        success: true,
        outputs: {
          decodedPayload: decodedPayload,
          status: status,
          metadata: metadata,
          messageID: messageID,
          sourceChain: sourceChainID,
          rawPayload: messagePayload || 'simulated'
        },
        logs: [
          `📥 ICM message received and processed`,
          `🔗 Message ID: ${messageID}`,
          `🏔️ Source Chain: ${sourceChainID}`,
          `📊 Status: ${status}`,
          `📝 Payload Type: ${typeof decodedPayload === 'object' && decodedPayload.type ? decodedPayload.type : 'unknown'}`,
          `📅 Received At: ${metadata.receivedAt}`,
          `🌐 Network: ${metadata.network}`
        ],
        executionTime: Date.now() - startTime
      }

    } catch (error: any) {
      this.logger.error('❌ ICM receiving failed:', error)

      return {
        success: false,
        outputs: {},
        error: error.message,
        logs: [
          `❌ Failed to receive ICM message: ${error.message}`,
          `🔍 Error details: ${error.stack || 'No stack trace available'}`,
          `💡 This might be due to network issues or invalid message ID`
        ],
        executionTime: Date.now() - startTime
      }
    }
  }

  private async executeTemplateMode(inputs: Record<string, any>, context: ExecutionContext, startTime: number): Promise<NodeExecutionResult> {
    this.logger.info(`🎭 Generating ICM receiver template configuration`)

    const config = {
      pollingInterval: inputs.pollingInterval || 30, // seconds
      maxRetries: inputs.maxRetries || 3,
      supportedPayloadTypes: ['string', 'number', 'object', 'bytes'],
      autoDecode: inputs.autoDecode !== false,
      eventListening: inputs.eventListening !== false
    }

    // Mock received message for template
    const mockPayload = {
      type: 'object',
      data: {
        message: 'Hello from cross-chain!',
        sender: '0x742d35Cc6634C0532925a3b8D427b2C0ef46c',
        timestamp: Date.now()
      },
      messageID: 'template_msg_123',
      sourceChain: 'C'
    }

    return {
      success: true,
      outputs: {
        receiverConfig: config,
        mockReceive: mockPayload
      },
      logs: [
        `🎭 ICM receiver template configuration created`,
        `⏱️ Polling interval: ${config.pollingInterval}s`,
        `🔄 Max retries: ${config.maxRetries}`,
        `📝 Auto decode: ${config.autoDecode ? 'enabled' : 'disabled'}`,
        `👂 Event listening: ${config.eventListening ? 'enabled' : 'disabled'}`,
        `📋 Supported types: ${config.supportedPayloadTypes.join(', ')}`,
        `✅ Mock message received: ${mockPayload.messageID}`
      ],
      executionTime: Date.now() - startTime
    }
  }

  async estimateGas(inputs: Record<string, any>): Promise<string> {
    // No gas estimation needed for receiving messages
    return '0'
  }
}
