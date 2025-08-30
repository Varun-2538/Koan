"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericExecutionEngine = void 0;
const events_1 = require("events");
const uuid_1 = require("uuid");
class ExecutionError extends Error {
    nodeId;
    nodeType;
    executionId;
    constructor(message, nodeId, nodeType, executionId) {
        super(message);
        this.nodeId = nodeId;
        this.nodeType = nodeType;
        this.executionId = executionId;
        this.name = 'ExecutionError';
    }
}
class GenericExecutionEngine extends events_1.EventEmitter {
    executions = new Map();
    pluginRegistry = new Map();
    logger;
    // Avalanche integration: Storage for unsigned transactions
    unsignedTxStore = new Map();
    constructor(logger) {
        super();
        this.logger = logger;
    }
    /**
     * Register a plugin for execution
     */
    registerPlugin(plugin) {
        this.pluginRegistry.set(plugin.id, plugin);
        this.logger.info(`Registered plugin: ${plugin.id} (${plugin.name})`);
    }
    /**
     * Load plugins from plugin registry
     */
    async loadPlugins() {
        // This would integrate with the frontend plugin system
        // For now, we'll register some default plugins
        const defaultPlugins = [
            {
                id: 'oneInchSwap',
                name: '1inch Swap',
                version: '1.0.0',
                description: 'Execute token swaps with 1inch aggregation',
                category: 'DeFi',
                inputs: [
                    { key: 'from_token', type: 'token', label: 'From Token', required: true },
                    { key: 'to_token', type: 'token', label: 'To Token', required: true },
                    { key: 'amount', type: 'number', label: 'Amount', required: true },
                    { key: 'slippage', type: 'number', label: 'Slippage %', required: false, defaultValue: 1 }
                ],
                outputs: [
                    { key: 'transaction', type: 'transaction', label: 'Transaction', required: true },
                    { key: 'route', type: 'object', label: 'Route Info', required: false }
                ],
                executor: {
                    type: 'defi',
                    timeout: 30000,
                    retries: 3
                }
            },
            {
                id: 'conditionalLogic',
                name: 'Conditional Logic',
                version: '1.0.0',
                description: 'Execute different paths based on conditions',
                category: 'Logic',
                inputs: [
                    { key: 'condition', type: 'string', label: 'Condition', required: true },
                    { key: 'value', type: 'any', label: 'Value to Check', required: true }
                ],
                outputs: [
                    { key: 'result', type: 'boolean', label: 'Result', required: true },
                    { key: 'path', type: 'string', label: 'Execution Path', required: true }
                ],
                executor: {
                    type: 'javascript',
                    code: `
            function execute(inputs) {
              const { condition, value } = inputs;
              let result = false;
              
              // Simple condition evaluation
              switch (condition) {
                case 'greater_than':
                  result = parseFloat(value) > parseFloat(inputs.threshold || 0);
                  break;
                case 'contains':
                  result = String(value).includes(String(inputs.searchText || ''));
                  break;
                case 'regex':
                  result = new RegExp(inputs.pattern || '').test(String(value));
                  break;
                default:
                  result = Boolean(value);
              }
              
              return {
                success: true,
                outputs: {
                  result,
                  path: result ? 'true' : 'false'
                }
              };
            }
          `
                }
            },
            {
                id: 'dataProcessor',
                name: 'Data Processor',
                version: '1.0.0',
                description: 'Transform and manipulate data with JavaScript',
                category: 'Data',
                inputs: [
                    { key: 'data', type: 'any', label: 'Input Data', required: true },
                    { key: 'transformation', type: 'string', label: 'Transformation Code', required: true }
                ],
                outputs: [
                    { key: 'result', type: 'any', label: 'Processed Data', required: true }
                ],
                executor: {
                    type: 'javascript',
                    code: `
            function execute(inputs) {
              const { data, transformation } = inputs;
              
              try {
                // Create a safe execution context
                const context = { data, JSON, Math, Date };
                const func = new Function('context', \`with(context) { return (\${transformation}); }\`);
                const result = func(context);
                
                return {
                  success: true,
                  outputs: { result }
                };
              } catch (error) {
                return {
                  success: false,
                  error: error.message
                };
              }
            }
          `
                }
            }
        ];
        defaultPlugins.forEach(plugin => this.registerPlugin(plugin));
    }
    /**
     * Execute a workflow definition
     */
    async executeWorkflow(workflow, context = {}) {
        const executionId = (0, uuid_1.v4)();
        const fullContext = {
            workflowId: workflow.id,
            executionId,
            environment: 'production',
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
                    throw new ExecutionError(`Node ${nodeId} depends on non-existent node ${depId}`, nodeId);
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
                throw new ExecutionError(`Circular dependency detected involving node ${nodeId}`, nodeId);
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
                throw new ExecutionError('No runnable steps found, possible deadlock', undefined, undefined, execution.id);
            }
            // Execute runnable steps in parallel (for independent nodes)
            const promises = runnableSteps.map(step => this.executeStep(step, execution));
            await Promise.all(promises);
        }
        // Check if all steps completed successfully
        const failedSteps = Array.from(execution.steps.values()).filter(step => step.status === 'failed');
        if (failedSteps.length > 0) {
            throw new ExecutionError(`${failedSteps.length} steps failed`, failedSteps[0].nodeId, failedSteps[0].nodeType, execution.id);
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
     * Execute a single step using plugin system
     */
    async executeStep(step, execution) {
        const { nodeId, nodeType } = step;
        const plugin = this.pluginRegistry.get(nodeType);
        if (!plugin) {
            throw new ExecutionError(`No plugin found for node type: ${nodeType}`, nodeId, nodeType, execution.id);
        }
        step.status = 'running';
        step.startTime = Date.now();
        this.logger.info(`Executing step: ${nodeId} (${nodeType})`);
        this.emitEvent('node.started', execution.id, { nodeId, nodeType, inputs: step.inputs });
        try {
            // Collect inputs from dependencies
            const inputs = this.collectStepInputs(step, execution.steps);
            // Validate inputs against plugin definition
            const validation = this.validatePluginInputs(plugin, inputs);
            if (!validation.valid) {
                throw new ExecutionError(`Input validation failed: ${validation.errors.join(', ')}`, nodeId, nodeType, execution.id);
            }
            // Execute based on plugin executor type
            let result;
            switch (plugin.executor.type) {
                case 'javascript':
                    result = await this.executeJavaScript(plugin, inputs, execution.context);
                    break;
                case 'python':
                    result = await this.executePython(plugin, inputs, execution.context);
                    break;
                case 'defi':
                    result = await this.executeDeFi(plugin, inputs, execution.context);
                    break;
                case 'api':
                    result = await this.executeAPI(plugin, inputs, execution.context);
                    break;
                case 'avalanche':
                    if (plugin.executor.instance) {
                        // Use the direct executor instance for Avalanche plugins
                        result = await plugin.executor.instance.execute(inputs, execution.context);
                    }
                    else {
                        throw new ExecutionError('Avalanche plugin missing executor instance', nodeId, nodeType, execution.id);
                    }
                    break;
                case 'generic':
                default:
                    result = await this.executeGeneric(plugin, inputs, execution.context);
                    break;
            }
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
                throw new ExecutionError(result.error || 'Node execution failed', nodeId, nodeType, execution.id);
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
     * Validate inputs against plugin definition
     */
    validatePluginInputs(plugin, inputs) {
        const errors = [];
        for (const inputDef of plugin.inputs) {
            const value = inputs[inputDef.key];
            // Check required fields
            if (inputDef.required && (value === undefined || value === null || value === '')) {
                errors.push(`Required field '${inputDef.label}' is missing`);
                continue;
            }
            // Type validation
            if (value !== undefined && value !== null) {
                switch (inputDef.type) {
                    case 'number':
                        if (isNaN(Number(value))) {
                            errors.push(`Field '${inputDef.label}' must be a number`);
                        }
                        break;
                    case 'boolean':
                        if (typeof value !== 'boolean') {
                            errors.push(`Field '${inputDef.label}' must be a boolean`);
                        }
                        break;
                    case 'array':
                        if (!Array.isArray(value)) {
                            errors.push(`Field '${inputDef.label}' must be an array`);
                        }
                        break;
                }
            }
            // Custom validation rules
            if (inputDef.validation) {
                for (const rule of inputDef.validation) {
                    switch (rule.type) {
                        case 'min':
                            if (Number(value) < Number(rule.value)) {
                                errors.push(rule.message || `${inputDef.label} must be at least ${rule.value}`);
                            }
                            break;
                        case 'max':
                            if (Number(value) > Number(rule.value)) {
                                errors.push(rule.message || `${inputDef.label} must be at most ${rule.value}`);
                            }
                            break;
                        case 'pattern':
                            if (!new RegExp(String(rule.value)).test(String(value))) {
                                errors.push(rule.message || `${inputDef.label} format is invalid`);
                            }
                            break;
                    }
                }
            }
        }
        return { valid: errors.length === 0, errors };
    }
    /**
     * Execute JavaScript code
     */
    async executeJavaScript(plugin, inputs, context) {
        const startTime = Date.now();
        try {
            if (!plugin.executor.code) {
                throw new Error('No JavaScript code provided');
            }
            // Create a safe execution environment
            const safeContext = {
                inputs,
                context,
                console: {
                    log: (...args) => this.logger.info(`[${plugin.name}]`, ...args)
                },
                setTimeout,
                clearTimeout,
                JSON,
                Math,
                Date
            };
            // Execute the code in a controlled environment
            const func = new Function('context', `
        const { inputs, console, setTimeout, clearTimeout, JSON, Math, Date } = context;
        ${plugin.executor.code}
        return execute(inputs, context);
      `);
            const result = await func(safeContext);
            return {
                success: true,
                outputs: result.outputs || {},
                executionTime: Date.now() - startTime,
                logs: [`Executed JavaScript plugin: ${plugin.name}`]
            };
        }
        catch (error) {
            return {
                success: false,
                outputs: {},
                error: error instanceof Error ? error.message : 'JavaScript execution failed',
                executionTime: Date.now() - startTime
            };
        }
    }
    /**
     * Execute Python code (placeholder for future implementation)
     */
    async executePython(plugin, inputs, context) {
        return {
            success: false,
            outputs: {},
            error: 'Python execution not yet implemented'
        };
    }
    /**
     * Execute DeFi operations (legacy compatibility)
     */
    async executeDeFi(plugin, inputs, context) {
        const startTime = Date.now();
        try {
            // This would integrate with existing DeFi executors
            // For now, return a mock result
            return {
                success: true,
                outputs: {
                    transaction: {
                        hash: '0x' + Math.random().toString(16).substr(2, 64),
                        status: 'pending'
                    }
                },
                executionTime: Date.now() - startTime,
                gasUsed: '21000'
            };
        }
        catch (error) {
            return {
                success: false,
                outputs: {},
                error: error instanceof Error ? error.message : 'DeFi execution failed',
                executionTime: Date.now() - startTime
            };
        }
    }
    /**
     * Execute API calls
     */
    async executeAPI(plugin, inputs, context) {
        const startTime = Date.now();
        try {
            if (!plugin.executor.endpoint) {
                throw new Error('No API endpoint provided');
            }
            const response = await fetch(plugin.executor.endpoint, {
                method: plugin.executor.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Unite-DeFi-Engine/1.0.0'
                },
                body: plugin.executor.method !== 'GET' ? JSON.stringify(inputs) : undefined
            });
            const data = await response.json();
            return {
                success: response.ok,
                outputs: { response: data },
                executionTime: Date.now() - startTime,
                logs: [`API call to ${plugin.executor.endpoint} completed`]
            };
        }
        catch (error) {
            return {
                success: false,
                outputs: {},
                error: error instanceof Error ? error.message : 'API execution failed',
                executionTime: Date.now() - startTime
            };
        }
    }
    /**
     * Execute generic operations
     */
    async executeGeneric(plugin, inputs, context) {
        return {
            success: true,
            outputs: inputs, // Pass through inputs as outputs
            executionTime: 0,
            logs: [`Executed generic plugin: ${plugin.name}`]
        };
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
    /**
     * Get all registered plugins
     */
    getRegisteredPlugins() {
        return Array.from(this.pluginRegistry.values());
    }
    /**
     * Get plugin by ID
     */
    getPlugin(pluginId) {
        return this.pluginRegistry.get(pluginId);
    }
    /**
     * Store unsigned transaction for later signing (Avalanche integration)
     */
    storeUnsignedTx(executionId, nodeId, unsignedTx) {
        if (!this.unsignedTxStore.has(executionId)) {
            this.unsignedTxStore.set(executionId, new Map());
        }
        this.unsignedTxStore.get(executionId).set(nodeId, unsignedTx);
        this.logger.info(`Stored unsigned transaction for execution ${executionId}, node ${nodeId}`);
    }
    /**
     * Resume execution with signed transaction (Avalanche integration)
     */
    resumeWithSignedTx(executionId, nodeId, signedTx) {
        const execution = this.getExecution(executionId);
        if (!execution) {
            throw new Error(`Execution ${executionId} not found`);
        }
        const unsignedTx = this.unsignedTxStore.get(executionId)?.get(nodeId);
        if (!unsignedTx) {
            throw new Error(`Unsigned transaction not found for ${executionId}:${nodeId}`);
        }
        // Clean up stored transaction
        this.unsignedTxStore.get(executionId)?.delete(nodeId);
        // Emit event for frontend to handle signed transaction
        this.emit('signed-transaction-ready', {
            executionId,
            nodeId,
            signedTx,
            unsignedTx
        });
        this.logger.info(`Resumed execution with signed transaction for ${executionId}:${nodeId}`);
    }
}
exports.GenericExecutionEngine = GenericExecutionEngine;
//# sourceMappingURL=generic-execution-engine.js.map