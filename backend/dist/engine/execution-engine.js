"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeFiExecutionEngine = void 0;
const events_1 = require("events");
const uuid_1 = require("uuid");
const types_1 = require("@/types");
class DeFiExecutionEngine extends events_1.EventEmitter {
    executions = new Map();
    nodeExecutors = new Map();
    logger;
    constructor(logger) {
        super();
        this.logger = logger;
    }
    /**
     * Register a node executor for a specific node type
     */
    registerNodeExecutor(executor) {
        this.nodeExecutors.set(executor.type, executor);
        this.logger.info(`Registered node executor: ${executor.type}`);
    }
    /**
     * Execute a workflow definition
     */
    async executeWorkflow(workflow, context = {}) {
        const executionId = (0, uuid_1.v4)();
        const fullContext = {
            workflowId: workflow.id,
            executionId,
            environment: 'test',
            startTime: Date.now(),
            variables: {},
            secrets: {},
            ...context
        };
        // Create execution instance
        const execution = {
            id: executionId,
            workflowId: workflow.id,
            status: 'pending',
            steps: new Map(),
            context: fullContext,
            startTime: fullContext.startTime
        };
        this.executions.set(executionId, execution);
        try {
            this.logger.info(`Starting workflow execution: ${executionId}`);
            this.emitEvent('execution.started', executionId, { workflow, context: fullContext });
            // Parse workflow and build execution plan
            const executionPlan = this.buildExecutionPlan(workflow.nodes, workflow.edges);
            execution.steps = executionPlan;
            // Execute workflow
            await this.executeSteps(execution);
            execution.status = 'completed';
            execution.endTime = Date.now();
            this.logger.info(`Workflow execution completed: ${executionId}`);
            this.emitEvent('execution.completed', executionId, {
                duration: execution.endTime - execution.startTime,
                totalSteps: execution.steps.size
            });
        }
        catch (error) {
            execution.status = 'failed';
            execution.endTime = Date.now();
            execution.error = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Workflow execution failed: ${executionId}`, error);
            this.emitEvent('execution.failed', executionId, { error: execution.error });
            throw error;
        }
        return execution;
    }
    /**
     * Get execution status
     */
    getExecution(executionId) {
        return this.executions.get(executionId);
    }
    /**
     * Cancel a running execution
     */
    async cancelExecution(executionId) {
        const execution = this.executions.get(executionId);
        if (!execution || execution.status !== 'running') {
            return false;
        }
        execution.status = 'cancelled';
        execution.endTime = Date.now();
        this.logger.info(`Workflow execution cancelled: ${executionId}`);
        this.emitEvent('execution.failed', executionId, { error: 'Cancelled by user' });
        return true;
    }
    /**
     * Build execution plan from nodes and edges
     */
    buildExecutionPlan(nodes, edges) {
        const steps = new Map();
        // Create execution steps for each node
        for (const node of nodes) {
            const dependencies = this.findNodeDependencies(node.id, edges);
            steps.set(node.id, {
                nodeId: node.id,
                nodeType: node.type,
                status: 'pending',
                inputs: node.data.config || {},
                outputs: {},
                dependencies
            });
        }
        // Validate that all dependencies exist
        for (const [nodeId, step] of steps) {
            for (const depId of step.dependencies) {
                if (!steps.has(depId)) {
                    throw new types_1.ExecutionError(`Node ${nodeId} depends on non-existent node ${depId}`, nodeId);
                }
            }
        }
        // Check for circular dependencies
        this.detectCircularDependencies(steps);
        return steps;
    }
    /**
     * Find dependencies for a node based on incoming edges
     */
    findNodeDependencies(nodeId, edges) {
        return edges
            .filter(edge => edge.target === nodeId)
            .map(edge => edge.source);
    }
    /**
     * Detect circular dependencies using DFS
     */
    detectCircularDependencies(steps) {
        const visited = new Set();
        const recursionStack = new Set();
        const dfs = (nodeId) => {
            if (recursionStack.has(nodeId)) {
                throw new types_1.ExecutionError(`Circular dependency detected involving node ${nodeId}`, nodeId);
            }
            if (visited.has(nodeId)) {
                return false;
            }
            visited.add(nodeId);
            recursionStack.add(nodeId);
            const step = steps.get(nodeId);
            for (const depId of step.dependencies) {
                if (dfs(depId)) {
                    return true;
                }
            }
            recursionStack.delete(nodeId);
            return false;
        };
        for (const nodeId of steps.keys()) {
            if (!visited.has(nodeId)) {
                dfs(nodeId);
            }
        }
    }
    /**
     * Execute workflow steps in dependency order
     */
    async executeSteps(execution) {
        execution.status = 'running';
        while (this.hasRunnableSteps(execution.steps)) {
            const runnableSteps = this.getRunnableSteps(execution.steps);
            if (runnableSteps.length === 0) {
                throw new types_1.ExecutionError('No runnable steps found, possible deadlock', undefined, undefined, execution.id);
            }
            // Execute runnable steps in parallel (for independent nodes)
            const promises = runnableSteps.map(step => this.executeStep(step, execution));
            await Promise.all(promises);
        }
        // Check if all steps completed successfully
        const failedSteps = Array.from(execution.steps.values()).filter(step => step.status === 'failed');
        if (failedSteps.length > 0) {
            throw new types_1.ExecutionError(`${failedSteps.length} steps failed`, failedSteps[0].nodeId, failedSteps[0].nodeType, execution.id);
        }
    }
    /**
     * Check if there are any runnable steps
     */
    hasRunnableSteps(steps) {
        return Array.from(steps.values()).some(step => step.status === 'pending' || step.status === 'running');
    }
    /**
     * Get steps that can be executed (all dependencies completed)
     */
    getRunnableSteps(steps) {
        return Array.from(steps.values()).filter(step => {
            if (step.status !== 'pending')
                return false;
            // Check all dependencies are completed
            return step.dependencies.every(depId => {
                const depStep = steps.get(depId);
                return depStep?.status === 'completed';
            });
        });
    }
    /**
     * Execute a single step
     */
    async executeStep(step, execution) {
        const { nodeId, nodeType } = step;
        const executor = this.nodeExecutors.get(nodeType);
        if (!executor) {
            throw new types_1.ExecutionError(`No executor found for node type: ${nodeType}`, nodeId, nodeType, execution.id);
        }
        step.status = 'running';
        step.startTime = Date.now();
        this.logger.info(`Executing step: ${nodeId} (${nodeType})`);
        this.emitEvent('node.started', execution.id, { nodeId, nodeType, inputs: step.inputs });
        try {
            // Collect inputs from dependencies
            const inputs = this.collectStepInputs(step, execution.steps);
            // Validate inputs
            const validation = await executor.validate(inputs);
            // Handle both boolean and object validation responses
            let isValid = false;
            let errorMessage = 'Validation failed';
            if (typeof validation === 'boolean') {
                // Legacy boolean format
                isValid = validation;
            }
            else if (validation && typeof validation === 'object') {
                // New object format with valid and errors properties
                isValid = validation.valid;
                if (!isValid && validation.errors && Array.isArray(validation.errors)) {
                    errorMessage = `Input validation failed: ${validation.errors.join(', ')}`;
                }
            }
            if (!isValid) {
                throw new types_1.ExecutionError(errorMessage, nodeId, nodeType, execution.id);
            }
            // Execute the node
            const result = await executor.execute(inputs, execution.context);
            step.result = result;
            step.outputs = result.outputs;
            step.endTime = Date.now();
            if (result.success) {
                step.status = 'completed';
                this.logger.info(`Step completed: ${nodeId} in ${step.endTime - step.startTime}ms`);
                this.emitEvent('node.completed', execution.id, {
                    nodeId,
                    nodeType,
                    outputs: result.outputs,
                    executionTime: result.executionTime,
                    gasUsed: result.gasUsed
                });
            }
            else {
                step.status = 'failed';
                throw new types_1.ExecutionError(result.error || 'Node execution failed', nodeId, nodeType, execution.id);
            }
        }
        catch (error) {
            step.status = 'failed';
            step.endTime = Date.now();
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Step failed: ${nodeId}`, error);
            this.emitEvent('node.failed', execution.id, {
                nodeId,
                nodeType,
                error: errorMessage,
                executionTime: step.endTime - step.startTime
            });
            throw error;
        }
    }
    /**
     * Collect inputs for a step from its dependencies
     */
    collectStepInputs(step, allSteps) {
        let inputs = { ...step.inputs };
        // Merge outputs from dependency nodes
        for (const depId of step.dependencies) {
            const depStep = allSteps.get(depId);
            if (depStep && depStep.status === 'completed') {
                inputs = { ...inputs, ...depStep.outputs };
            }
        }
        return inputs;
    }
    /**
     * Emit execution event
     */
    emitEvent(type, executionId, data) {
        const event = {
            type,
            executionId,
            timestamp: Date.now(),
            data
        };
        this.emit('execution.event', event);
    }
    /**
     * Get execution statistics
     */
    getExecutionStats(executionId) {
        const execution = this.executions.get(executionId);
        if (!execution)
            return null;
        const steps = Array.from(execution.steps.values());
        const completedSteps = steps.filter(s => s.status === 'completed');
        const failedSteps = steps.filter(s => s.status === 'failed');
        const totalGasUsed = completedSteps.reduce((total, step) => {
            const gasUsed = step.result?.gasUsed ? BigInt(step.result.gasUsed) : 0n;
            return total + gasUsed;
        }, 0n);
        return {
            executionId: execution.id,
            workflowId: execution.workflowId,
            status: execution.status,
            duration: execution.endTime ? execution.endTime - execution.startTime : Date.now() - execution.startTime,
            totalSteps: steps.length,
            completedSteps: completedSteps.length,
            failedSteps: failedSteps.length,
            totalGasUsed: totalGasUsed.toString(),
            error: execution.error
        };
    }
    /**
     * Clean up old executions
     */
    cleanup(maxAge = 24 * 60 * 60 * 1000) {
        const cutoff = Date.now() - maxAge;
        let cleaned = 0;
        for (const [id, execution] of this.executions) {
            if (execution.startTime < cutoff && execution.status !== 'running') {
                this.executions.delete(id);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            this.logger.info(`Cleaned up ${cleaned} old executions`);
        }
    }
}
exports.DeFiExecutionEngine = DeFiExecutionEngine;
//# sourceMappingURL=execution-engine.js.map