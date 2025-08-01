import { EventEmitter } from 'events';
import { Logger } from 'winston';
import { WorkflowDefinition, WorkflowExecution, ExecutionContext, NodeExecutor } from '@/types';
export declare class DeFiExecutionEngine extends EventEmitter {
    private executions;
    private nodeExecutors;
    private logger;
    constructor(logger: Logger);
    /**
     * Register a node executor for a specific node type
     */
    registerNodeExecutor(executor: NodeExecutor): void;
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
     * Execute a single step
     */
    private executeStep;
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
}
//# sourceMappingURL=execution-engine.d.ts.map