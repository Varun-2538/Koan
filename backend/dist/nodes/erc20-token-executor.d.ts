import { NodeExecutor, ExecutionContext, NodeExecutionResult } from '../types';
export declare class ERC20TokenExecutor implements NodeExecutor {
    readonly type = "erc20Token";
    readonly name = "ERC20 Token";
    readonly description = "Deploy and manage ERC20 tokens with standard functionality";
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
}
//# sourceMappingURL=erc20-token-executor.d.ts.map