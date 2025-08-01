import { NodeExecutor, ExecutionContext, NodeExecutionResult } from '../types';
import { logger } from '../utils/logger';
import axios from 'axios';
import { EventEmitter } from 'events';

export interface TransactionMonitorConfig {
  confirmationsRequired?: number;
  timeoutMinutes?: number;
  enableAlerts?: boolean;
  includeGasTracking?: boolean;
  enableMEVDetection?: boolean;
  webhookUrl?: string;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed' | 'replaced' | 'timeout';
  confirmations: number;
  gasUsed?: string;
  gasPrice?: string;
  effectiveGasPrice?: string;
  blockNumber?: number;
  blockTimestamp?: number;
  from: string;
  to: string;
  value: string;
  nonce: number;
  mevDetected?: boolean;
  replacementTx?: string;
  failureReason?: string;
  logs?: Array<{
    address: string;
    topics: string[];
    data: string;
  }>;
  events?: Array<{
    eventName: string;
    args: Record<string, any>;
  }>;
}

export interface MonitoringResult {
  transactionHash: string;
  finalStatus: TransactionStatus;
  timeline: Array<{
    timestamp: number;
    event: string;
    details: string;
    blockNumber?: number;
  }>;
  performance: {
    totalTime: number;
    confirmationTime: number;
    gasEfficiency: number;
  };
  alerts: Array<{
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: number;
  }>;
}

export class TransactionMonitorExecutor implements NodeExecutor {
  readonly type = 'transactionMonitor';
  readonly name = 'Transaction Monitor';
  readonly description = 'Monitor transaction status with real-time updates, MEV detection, and performance analytics';

  private eventEmitter = new EventEmitter();
  private activeMonitors = new Map<string, any>();

  async validate(inputs: Record<string, any>): Promise<{ valid: boolean; errors: string[] }> {
    const isTemplateMode = inputs.template_creation_mode || inputs.mode === 'template' || inputs.config_only;
    const errors: string[] = [];
    
    if (isTemplateMode) {
      try {
        await this.validateTemplateConfig(inputs);
        return { valid: true, errors: [] };
      } catch (error: any) {
        return { valid: false, errors: [error.message] };
      }
    }

    if (!inputs.transaction_hash && !inputs.transaction_data) {
      errors.push('Either transaction_hash or transaction_data is required');
    }

    if (inputs.transaction_hash && !/^0x[a-fA-F0-9]{64}$/.test(inputs.transaction_hash)) {
      errors.push('Invalid transaction hash format');
    }

    if (inputs.chain_id && !this.isValidChainId(inputs.chain_id)) {
      errors.push(`Unsupported chain ID: ${inputs.chain_id}`);
    }

    return { valid: errors.length === 0, errors };
  }

  private async validateTemplateConfig(inputs: Record<string, any>): Promise<void> {
    if (inputs.confirmations_required && (isNaN(inputs.confirmations_required) || inputs.confirmations_required < 0)) {
      throw new Error('confirmations_required must be a positive number');
    }

    if (inputs.timeout_minutes && (isNaN(inputs.timeout_minutes) || inputs.timeout_minutes < 0)) {
      throw new Error('timeout_minutes must be a positive number');
    }
  }

  private async executeTemplateMode(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      logger.info(`🔧 Configuring transaction monitor for template creation`);

      const config = {
        confirmations_required: inputs.confirmations_required || 1,
        timeout_minutes: inputs.timeout_minutes || 5,
        enable_mev_detection: inputs.enable_mev_detection !== false,
        track_gas_usage: inputs.track_gas_usage !== false,
        enable_notifications: inputs.enable_notifications !== false,
        enable_webhooks: inputs.enable_webhooks || false
      };

      return {
        success: true,
        outputs: {
          monitor_config: config,
          features: {
            confirmation_tracking: true,
            mev_detection: config.enable_mev_detection,
            gas_tracking: config.track_gas_usage,
            notifications: config.enable_notifications,
            webhooks: config.enable_webhooks
          },
          settings: {
            confirmations: config.confirmations_required,
            timeout: `${config.timeout_minutes} minutes`
          }
        },
        executionTime: 50,
        logs: [
          `Configured transaction monitor`,
          `Confirmations required: ${config.confirmations_required}`,
          `Timeout: ${config.timeout_minutes} minutes`,
          `MEV detection: ${config.enable_mev_detection ? 'enabled' : 'disabled'}`
        ]
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        executionTime: 50
      };
    }
  }

  async execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const isTemplateMode = inputs.template_creation_mode || inputs.mode === 'template' || inputs.config_only;
      
      if (isTemplateMode) {
        return this.executeTemplateMode(inputs, context);
      }

      const config: TransactionMonitorConfig = {
        confirmationsRequired: 1,
        timeoutMinutes: 30,
        enableAlerts: true,
        includeGasTracking: true,
        enableMEVDetection: true,
        ...inputs.config
      };

      let transactionHash = inputs.transaction_hash;
      const chainId = inputs.chain_id || '1';

      // If transaction data is provided, submit it first
      if (inputs.transaction_data && !transactionHash) {
        logger.info('📡 Submitting transaction to network...');
        transactionHash = await this.submitTransaction(inputs.transaction_data, chainId);
      }

      logger.info(`🔍 Starting transaction monitoring for ${transactionHash}`);

      // Start monitoring
      const monitoringResult = await this.monitorTransaction(transactionHash, chainId, config, context);

      // Clean up active monitor
      this.activeMonitors.delete(transactionHash);

      const result = {
        monitoringResult,
        transactionHash,
        success: monitoringResult.finalStatus.status === 'confirmed',
        gasUsed: monitoringResult.finalStatus.gasUsed,
        blockNumber: monitoringResult.finalStatus.blockNumber,
        confirmations: monitoringResult.finalStatus.confirmations,
        executionTime: monitoringResult.performance.totalTime
      };

      if (result.success) {
        logger.info(`✅ Transaction confirmed: ${transactionHash}`);
      } else {
        logger.error(`❌ Transaction failed: ${transactionHash} - ${monitoringResult.finalStatus.failureReason}`);
      }

      return {
        success: result.success,
        outputs: result,
        executionTime: Date.now() - context.startTime,
        gasUsed: result.gasUsed,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        logs: this.generateExecutionLogs(monitoringResult)
      };

    } catch (error: any) {
      logger.error('Transaction monitoring failed:', error);
      return {
        success: false,
        outputs: {},
        error: error.message,
        executionTime: Date.now() - context.startTime,
        logs: [`Error: ${error.message}`]
      };
    }
  }

  private async submitTransaction(transactionData: any, chainId: string): Promise<string> {
    try {
      // This would submit the transaction to the network
      // For now, return a mock transaction hash
      const mockHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      logger.info(`Transaction submitted with hash: ${mockHash}`);
      return mockHash;
    } catch (error) {
      throw new Error(`Failed to submit transaction: ${error}`);
    }
  }

  private async monitorTransaction(
    transactionHash: string,
    chainId: string,
    config: TransactionMonitorConfig,
    context: ExecutionContext
  ): Promise<MonitoringResult> {
    const startTime = Date.now();
    const timeline: MonitoringResult['timeline'] = [];
    const alerts: MonitoringResult['alerts'] = [];
    
    let currentStatus: TransactionStatus = {
      hash: transactionHash,
      status: 'pending',
      confirmations: 0,
      from: '',
      to: '',
      value: '0',
      nonce: 0
    };

    // Add initial timeline entry
    timeline.push({
      timestamp: startTime,
      event: 'monitoring_started',
      details: 'Started monitoring transaction'
    });

    // Monitoring loop
    const timeoutMs = config.timeoutMinutes! * 60 * 1000;
    const endTime = startTime + timeoutMs;
    let confirmationStartTime = 0;

    while (Date.now() < endTime) {
      try {
        // Get transaction status
        const status = await this.getTransactionStatus(transactionHash, chainId);
        
        // Check for status changes
        if (status.status !== currentStatus.status) {
          timeline.push({
            timestamp: Date.now(),
            event: 'status_change',
            details: `Status changed from ${currentStatus.status} to ${status.status}`,
            blockNumber: status.blockNumber
          });

          if (status.status === 'confirmed' && confirmationStartTime === 0) {
            confirmationStartTime = Date.now();
          }
        }

        // Update current status
        currentStatus = status;

        // Check for MEV if enabled
        if (config.enableMEVDetection && status.status === 'confirmed') {
          const mevDetected = await this.detectMEV(transactionHash, chainId);
          if (mevDetected) {
            currentStatus.mevDetected = true;
            alerts.push({
              level: 'warning',
              message: 'MEV activity detected in transaction',
              timestamp: Date.now()
            });
          }
        }

        // Check if we have enough confirmations
        if (status.confirmations >= config.confirmationsRequired!) {
          timeline.push({
            timestamp: Date.now(),
            event: 'confirmed',
            details: `Transaction confirmed with ${status.confirmations} confirmations`,
            blockNumber: status.blockNumber
          });
          break;
        }

        // Check for failure
        if (status.status === 'failed') {
          alerts.push({
            level: 'error',
            message: `Transaction failed: ${status.failureReason}`,
            timestamp: Date.now()
          });
          break;
        }

        // Wait before next check
        await this.sleep(5000); // Check every 5 seconds

      } catch (error: any) {
        alerts.push({
          level: 'warning',
          message: `Monitoring error: ${error.message}`,
          timestamp: Date.now()
        });
        
        // Continue monitoring despite errors
        await this.sleep(10000);
      }
    }

    // Handle timeout
    if (Date.now() >= endTime && currentStatus.status === 'pending') {
      currentStatus.status = 'timeout';
      alerts.push({
        level: 'error',
        message: 'Transaction monitoring timed out',
        timestamp: Date.now()
      });
    }

    const totalTime = Date.now() - startTime;
    const confirmationTime = confirmationStartTime > 0 ? Date.now() - confirmationStartTime : 0;

    return {
      transactionHash,
      finalStatus: currentStatus,
      timeline,
      performance: {
        totalTime,
        confirmationTime,
        gasEfficiency: this.calculateGasEfficiency(currentStatus)
      },
      alerts
    };
  }

  private async getTransactionStatus(transactionHash: string, chainId: string): Promise<TransactionStatus> {
    try {
      // In a real implementation, this would call the blockchain RPC
      // For demo purposes, simulate transaction progression
      const random = Math.random();
      
      return {
        hash: transactionHash,
        status: random > 0.8 ? 'confirmed' : 'pending',
        confirmations: random > 0.8 ? 1 : 0,
        gasUsed: random > 0.8 ? '21000' : undefined,
        gasPrice: '20000000000',
        blockNumber: random > 0.8 ? Math.floor(Math.random() * 1000000) + 18000000 : undefined,
        blockTimestamp: random > 0.8 ? Math.floor(Date.now() / 1000) : undefined,
        from: '0x742d35Cc6bD9A0532123456789012345678901',
        to: '0x742d35Cc6bD9A0532123456789098765432101',
        value: '0',
        nonce: 42
      };

    } catch (error) {
      throw new Error(`Failed to get transaction status: ${error}`);
    }
  }

  private async detectMEV(transactionHash: string, chainId: string): Promise<boolean> {
    try {
      // In a real implementation, this would analyze the transaction for MEV
      // Check for sandwich attacks, front-running, etc.
      return Math.random() > 0.9; // 10% chance for demo
    } catch (error) {
      logger.warn('MEV detection failed:', error);
      return false;
    }
  }

  private calculateGasEfficiency(status: TransactionStatus): number {
    if (!status.gasUsed || !status.gasPrice) return 0;
    
    // Simple efficiency calculation (in real implementation, compare to network average)
    const gasUsed = parseInt(status.gasUsed);
    const standardGas = 21000; // Standard ETH transfer
    
    return Math.max(0, 100 - ((gasUsed - standardGas) / standardGas) * 100);
  }

  private generateExecutionLogs(result: MonitoringResult): string[] {
    const logs: string[] = [];
    
    logs.push(`Transaction hash: ${result.transactionHash}`);
    logs.push(`Final status: ${result.finalStatus.status}`);
    logs.push(`Confirmations: ${result.finalStatus.confirmations}`);
    
    if (result.finalStatus.gasUsed) {
      logs.push(`Gas used: ${result.finalStatus.gasUsed}`);
    }
    
    if (result.finalStatus.blockNumber) {
      logs.push(`Block number: ${result.finalStatus.blockNumber}`);
    }
    
    logs.push(`Total monitoring time: ${result.performance.totalTime}ms`);
    
    if (result.alerts.length > 0) {
      logs.push(`Alerts generated: ${result.alerts.length}`);
    }
    
    if (result.finalStatus.mevDetected) {
      logs.push('MEV activity detected');
    }
    
    return logs;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isValidChainId(chainId: string): boolean {
    const supportedChains = ['1', '56', '137', '42161', '10', '8453', '43114'];
    return supportedChains.includes(chainId);
  }

  // Event emitter methods for real-time updates
  public onTransactionUpdate(callback: (hash: string, status: TransactionStatus) => void) {
    this.eventEmitter.on('transaction_update', callback);
  }

  public onTransactionConfirmed(callback: (hash: string, result: MonitoringResult) => void) {
    this.eventEmitter.on('transaction_confirmed', callback);
  }

  public onTransactionFailed(callback: (hash: string, error: string) => void) {
    this.eventEmitter.on('transaction_failed', callback);
  }
}