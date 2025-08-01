import { NodeExecutor, ExecutionContext, NodeExecutionResult } from '../types';
export interface TokenSelectorConfig {
    defaultFromToken?: string;
    defaultToToken?: string;
    enabledTokens?: string[];
    includeMetadata?: boolean;
    priceSource?: 'coingecko' | '1inch' | 'chainlink';
}
export interface TokenMetadata {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoUri?: string;
    chainId: number;
    price?: number;
    priceChange24h?: number;
    marketCap?: number;
    volume24h?: number;
    verified?: boolean;
}
export declare class TokenSelectorExecutor implements NodeExecutor {
    readonly type = "tokenSelector";
    readonly name = "Token Selector";
    readonly description = "Select and configure tokens for swapping with metadata and price information";
    private defaultTokens;
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    private validateTemplateConfig;
    private executeTemplateMode;
    private getTokenName;
    private getTokenAddress;
    private getMockPrice;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    private getTokenMetadata;
    private fetchTokenMetadataFromChain;
    private enrichWithPriceData;
    private enrichWithCoingeckoPrices;
    private enrichWith1inchPrices;
    private isValidToken;
    private isValidChainId;
}
//# sourceMappingURL=token-selector-executor.d.ts.map