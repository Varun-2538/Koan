import { EventEmitter } from 'events';
import { Logger } from 'winston';
interface PluginDefinition {
    id: string;
    name: string;
    version: string;
    description: string;
    category: string;
    inputs: FieldDefinition[];
    outputs: FieldDefinition[];
    executor: ExecutorConfig;
}
interface FieldDefinition {
    key: string;
    type: string;
    label: string;
    required: boolean;
    defaultValue?: any;
    validation?: ValidationRule[];
}
interface ValidationRule {
    type: string;
    value?: any;
    message?: string;
}
interface ExecutorConfig {
    type: 'javascript' | 'python' | 'defi' | 'api' | 'generic' | 'avalanche';
    code?: string;
    endpoint?: string;
    method?: string;
    timeout?: number;
    retries?: number;
    instance?: any;
}
interface WorkflowDefinition {
    id: string;
    name: string;
    description?: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
}
interface FlowNode {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
    };
    data: {
        config?: Record<string, any>;
        [key: string]: any;
    };
}
interface FlowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}
interface ExecutionContext {
    workflowId: string;
    executionId: string;
    environment: string;
    startTime: number;
    variables: Record<string, any>;
    secrets: Record<string, any>;
    userId?: string;
}
interface WorkflowExecution {
    id: string;
    workflowId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    steps: Map<string, ExecutionStep>;
    context: ExecutionContext;
    startTime: number;
    endTime?: number;
    error?: string;
}
interface ExecutionStep {
    nodeId: string;
    nodeType: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    inputs: Record<string, any>;
    outputs: Record<string, any>;
    dependencies: string[];
    result?: NodeExecutionResult;
    startTime?: number;
    endTime?: number;
}
interface NodeExecutionResult {
    success: boolean;
    outputs: Record<string, any>;
    error?: string;
    logs?: string[];
    executionTime?: number;
    gasUsed?: string | number | bigint;
}
export declare class GenericExecutionEngine extends EventEmitter {
    private executions;
    private pluginRegistry;
    private logger;
    private unsignedTxStore;
    constructor(logger: Logger);
    /**
     * Register a plugin for execution
     */
    registerPlugin(plugin: PluginDefinition): void;
    /**
     * Load plugins from plugin registry
     */
    loadPlugins(): Promise<void>;
    /**
     * Execute a workflow definition
     */
    executeWorkflow(workflow: WorkflowDefinition, context?: Partial<ExecutionContext>): Promise<WorkflowExecution>;
    /**
     * Get execution status
     */
    getExecution(executionId: string): WorkflowExecution | undefined;
    /**
     * Cancel a running execution
     */
    cancelExecution(executionId: string): Promise<boolean>;
    /**
     * Build execution plan from nodes and edges
     */
    private buildExecutionPlan;
    /**
     * Find dependencies for a node based on incoming edges
     */
    private findNodeDependencies;
    /**
     * Detect circular dependencies using DFS
     */
    private detectCircularDependencies;
    /**
     * Execute workflow steps in dependency order
     */
    private executeSteps;
    /**
     * Check if there are any runnable steps
     */
    private hasRunnableSteps;
    /**
     * Get steps that can be executed (all dependencies completed)
     */
    private getRunnableSteps;
    /**
     * Execute a single step using plugin system
     */
    private executeStep;
    /**
     * Validate inputs against plugin definition
     */
    private validatePluginInputs;
    /**
     * Execute JavaScript code
     */
    private executeJavaScript;
    /**
     * Execute Python code (placeholder for future implementation)
     */
    private executePython;
    /**
     * Execute DeFi operations (legacy compatibility)
     */
    private executeDeFi;
    /**
     * Execute API calls
     */
    private executeAPI;
    /**
     * Execute generic operations
     */
    private executeGeneric;
    /**
     * Collect inputs for a step from its dependencies
     */
    private collectStepInputs;
    /**
     * Emit execution event
     */
    private emitEvent;
    /**
     * Get execution statistics
     */
    getExecutionStats(executionId: string): any;
    /**
     * Clean up old executions
     */
    cleanup(maxAge?: number): void;
    /**
     * Get all registered plugins
     */
    getRegisteredPlugins(): PluginDefinition[];
    /**
     * Get plugin by ID
     */
    getPlugin(pluginId: string): PluginDefinition | undefined;
    /**
     * Store unsigned transaction for later signing (Avalanche integration)
     */
    storeUnsignedTx(executionId: string, nodeId: string, unsignedTx: any): void;
    /**
     * Resume execution with signed transaction (Avalanche integration)
     */
    resumeWithSignedTx(executionId: string, nodeId: string, signedTx: string): void;
}
export {};
//# sourceMappingURL=generic-execution-engine.d.ts.map