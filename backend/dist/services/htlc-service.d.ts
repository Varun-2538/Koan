export declare class HTLCService {
    private ethereumProvider;
    private monadProvider;
    private fusionMonadAdapterAddress;
    private monadBridgeAddress;
    constructor();
    /**
     * Create HTLC on Ethereum using FusionMonadAdapter contract
     */
    createEthereumHTLC(params: HTLCCreateParams): Promise<HTLCResult>;
    /**
     * Create HTLC on Monad using MonadBridge contract
     */
    createMonadHTLC(params: HTLCCreateParams): Promise<HTLCResult>;
    /**
     * Claim funds from HTLC with secret revelation
     */
    claimFunds(contractId: string, secret: string, chain: 'ethereum' | 'monad'): Promise<HTLCResult>;
    /**
     * Refund funds after timelock expiration
     */
    refundFunds(contractId: string, chain: 'ethereum' | 'monad'): Promise<HTLCResult>;
    /**
     * Monitor HTLC status across both chains
     */
    monitorHTLCStatus(contractId: string): Promise<HTLCStatus>;
    private getHTLCStatusOnChain;
    private determineOverallStatus;
}
export interface HTLCCreateParams {
    contractId: string;
    hashlock: string;
    timelock: number;
    token: string;
    amount: string;
    targetChain?: string;
}
export interface HTLCResult {
    txHash: string;
    contractId: string;
    blockNumber: number;
    gasUsed: string;
    status: string;
    chain: string;
}
export interface ChainHTLCStatus {
    exists: boolean;
    locked: boolean;
    claimed: boolean;
    refunded: boolean;
    timelock_expired: boolean;
    secret_revealed: boolean;
    block_number: number;
}
export interface HTLCStatus {
    contractId: string;
    ethereum: ChainHTLCStatus;
    monad: ChainHTLCStatus;
    overall_status: string;
    last_updated: string;
}
//# sourceMappingURL=htlc-service.d.ts.map