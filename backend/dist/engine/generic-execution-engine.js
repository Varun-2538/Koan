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
                description: 'Execute token swaps with 1inch aggregation (backend proxy)',
                category: 'DeFi',
                inputs: [],
                outputs: [
                    { key: 'transaction', type: 'object', label: 'Transaction', required: false },
                    { key: 'route', type: 'object', label: 'Route Info', required: false },
                    { key: 'validationOk', type: 'boolean', label: 'Validation OK', required: false }
                ],
                executor: {
                    type: 'javascript',
                    code: `
            async function execute(inputs, context) {
              const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
              const chainId = String(inputs.chain_id || inputs.chainId || '1');
              const src = String(inputs.src || inputs.from_token || inputs.fromToken || '');
              const dst = String(inputs.dst || inputs.to_token || inputs.toToken || '');
              const amount = String(inputs.amount || '');
              const from = String(inputs.from || inputs.from_address || inputs.wallet_address || '');
              const slippage = inputs.slippage != null ? String(inputs.slippage) : undefined;
              const apiKey = inputs.apiKey;

              if (!chainId || !src || !dst || !amount) {
                throw new Error('Missing required field(s) for swap/quote');
              }

              if (inputs.validateOnly === true || inputs.template_creation_mode === true) {
                const params = new URLSearchParams();
                params.append('chainId', chainId);
                params.append('src', src);
                params.append('dst', dst);
                params.append('amount', amount);
                if (from) params.append('from', from);
                if (slippage) params.append('slippage', slippage);
                if (apiKey) params.append('apiKey', apiKey);
                const res = await fetch(base + '/api/1inch/quote?' + params.toString(), { method: 'GET', headers: { 'accept': 'application/json' } });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) return { success: false, error: data.error || ('HTTP ' + res.status), outputs: {} };
                return { success: true, outputs: { transaction: null, route: data, validationOk: true } };
              }

              const body = { chainId, src, dst, amount, from, slippage, apiKey };
              const res = await fetch(base + '/api/1inch/swap', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) return { success: false, error: data.error || ('HTTP ' + res.status), outputs: {} };
              return { success: true, outputs: { transaction: data.tx || data, route: data.route || data.protocols, validationOk: true } };
            }
          `,
                    timeout: 30000,
                    retries: 3
                }
            },
            {
                id: 'inputProvider',
                name: 'Input Provider',
                version: '1.0.0',
                description: 'Provide manual inputs to downstream nodes (chain, tokens, amount, address, apiKey)',
                category: 'Data',
                inputs: [],
                outputs: [
                    { key: 'chainId', type: 'string', label: 'Chain ID', required: false },
                    { key: 'chain_id', type: 'string', label: 'Chain ID (snake)', required: false },
                    { key: 'src', type: 'string', label: 'From Token Address', required: false },
                    { key: 'dst', type: 'string', label: 'To Token Address', required: false },
                    { key: 'from_token', type: 'string', label: 'From Token (alias)', required: false },
                    { key: 'to_token', type: 'string', label: 'To Token (alias)', required: false },
                    { key: 'amount', type: 'string', label: 'Amount (wei)', required: false },
                    { key: 'from', type: 'string', label: 'From Address', required: false },
                    { key: 'slippage', type: 'number', label: 'Slippage %', required: false },
                    { key: 'apiKey', type: 'string', label: 'API Key', required: false }
                ],
                executor: {
                    type: 'javascript',
                    code: `
            async function execute(inputs) {
              const chainId = String(inputs.chain_id || inputs.chainId || '')
              const src = String(inputs.src || inputs.from_token || inputs.fromToken || '')
              const dst = String(inputs.dst || inputs.to_token || inputs.toToken || '')
              const amount = String(inputs.amount || '')
              const from = String(inputs.from || inputs.from_address || inputs.address || '')
              const slippage = inputs.slippage != null ? Number(inputs.slippage) : undefined
              const apiKey = inputs.apiKey

              return {
                success: true,
                outputs: {
                  chainId,
                  chain_id: chainId,
                  src,
                  dst,
                  from_token: src,
                  to_token: dst,
                  amount,
                  from,
                  slippage,
                  apiKey
                }
              }
            }
          `
                }
            },
            {
                id: 'oneInchQuote',
                name: '1inch Quote',
                version: '1.0.0',
                description: 'Fetch swap quote from 1inch backend proxy',
                category: 'DeFi',
                inputs: [],
                outputs: [
                    { key: 'quote', type: 'object', label: 'Quote Data', required: true }
                ],
                executor: {
                    type: 'javascript',
                    code: `
            async function execute(inputs) {
              const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
              
              // Debug log all inputs received
              console.log('🔍 oneInchQuote inputs received:', JSON.stringify(inputs, null, 2));
              
              // Extract values with proper fallbacks
              const chainId = String(inputs.chain_id || inputs.chainId || '1');
              const src = String(inputs.src || inputs.from_token || inputs.fromToken || '');
              const dst = String(inputs.dst || inputs.to_token || inputs.toToken || '');
              const amount = String(inputs.amount || '');
              const from = String(inputs.from || inputs.from_address || inputs.address || '');
              const slippage = inputs.slippage != null ? String(inputs.slippage) : undefined;
              const apiKey = inputs.apiKey;

              console.log('🔍 Extracted values: chainId=' + chainId + ', src=' + src + ', dst=' + dst + ', amount=' + amount);

              if (!chainId || !src || !dst || !amount) {
                throw new Error('Missing required fields: chainId=' + chainId + ', src=' + src + ', dst=' + dst + ', amount=' + amount);
              }

              const params = new URLSearchParams();
              params.append('chainId', chainId);
              params.append('src', src);
              params.append('dst', dst);
              params.append('amount', amount);
              if (from) params.append('from', from);
              if (slippage) params.append('slippage', slippage);
              if (apiKey) params.append('apiKey', apiKey);
              
              const res = await fetch(base + '/api/1inch/quote?' + params.toString(), { 
                method: 'GET', 
                headers: { 'accept': 'application/json' } 
              });
              const data = await res.json().catch(() => ({}));
              return {
                success: res.ok,
                outputs: res.ok ? { quote: data } : {},
                error: res.ok ? undefined : (data.error || ('HTTP ' + res.status))
              };
            }
          `
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
            },
            {
                id: 'tokenSelector',
                name: 'Token Selector',
                version: '1.0.0',
                description: 'Select tokens and emit outputs for DeFi operations',
                category: 'Wallet',
                inputs: [],
                outputs: [
                    { key: 'fromToken', type: 'string', label: 'From Token', required: false },
                    { key: 'toToken', type: 'string', label: 'To Token', required: false },
                    { key: 'src', type: 'string', label: 'Source Token Address', required: false },
                    { key: 'dst', type: 'string', label: 'Destination Token Address', required: false },
                    { key: 'amount', type: 'string', label: 'Amount', required: false }
                ],
                executor: {
                    type: 'javascript',
                    code: `
            function execute(inputs) {
              // Use configured values or defaults for template mode
              const fromToken = inputs.fromToken || inputs.src || "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
              const toToken = inputs.toToken || inputs.dst || "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
              const amount = inputs.amount || "100000000000000000"; // 0.1 ETH
              
              return {
                success: true,
                outputs: {
                  fromToken,
                  toToken,
                  src: fromToken,
                  dst: toToken,
                  amount
                }
              };
            }
          `
                }
            },
            {
                id: 'walletConnector',
                name: 'Wallet Connector',
                version: '1.0.0',
                description: 'Connect to crypto wallets and provide address/chain info',
                category: 'Wallet',
                inputs: [],
                outputs: [
                    { key: 'address', type: 'string', label: 'Wallet Address', required: false },
                    { key: 'chainId', type: 'string', label: 'Chain ID', required: false },
                    { key: 'from', type: 'string', label: 'From Address', required: false }
                ],
                executor: {
                    type: 'javascript',
                    code: `
            function execute(inputs) {
              // Use configured values or mock for template mode
              const address = inputs.address || "0xAe3068f47B279D24a68C701eDf16cC180388d974";
              const chainId = inputs.chainId || inputs.chain_id || "1";
              
              return {
                success: true,
                outputs: {
                  address,
                  chainId,
                  from: address,
                  chain_id: chainId
                }
              };
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
        // Validate input data
        if (!nodes || !Array.isArray(nodes)) {
            throw new Error('Invalid workflow: nodes must be an array');
        }
        if (!edges) {
            this.logger.warn('No edges provided in workflow, treating as disconnected nodes');
            edges = [];
        }
        else if (!Array.isArray(edges)) {
            throw new Error('Invalid workflow: edges must be an array');
        }
        // If no edges supplied, create linear dependencies in node order
        let autoEdges = [];
        if (edges.length === 0 && nodes.length > 1) {
            for (let i = 1; i < nodes.length; i++) {
                autoEdges.push({ id: `auto_${nodes[i - 1].id}_${nodes[i].id}`, source: nodes[i - 1].id, target: nodes[i].id });
            }
        }
        const effectiveEdges = edges.length === 0 ? autoEdges : edges;
        // Create execution steps for each node
        for (const node of nodes) {
            // Validate node structure
            if (!node.id || !node.type) {
                throw new Error(`Invalid node: missing id or type - ${JSON.stringify(node)}`);
            }
            const dependencies = this.findNodeDependencies(node.id, effectiveEdges);
            // Safely access node data and config
            const nodeData = node.data || {};
            const nodeConfig = nodeData.config || {};
            // Debug log the node configuration
            this.logger.info(`Node ${node.id} (${node.type}) config:`, JSON.stringify(nodeConfig, null, 2));
            steps.set(node.id, {
                nodeId: node.id,
                nodeType: node.type,
                status: 'pending',
                inputs: nodeConfig,
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
        // Defensive programming: handle undefined or null edges
        if (!edges || !Array.isArray(edges)) {
            this.logger.warn(`No edges provided for node ${nodeId}, assuming no dependencies`);
            return [];
        }
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
            const fetchOptions = {
                method: plugin.executor.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Unite-DeFi-Engine/1.0.0'
                }
            };
            // Only add body for non-GET requests
            if (plugin.executor.method !== 'GET') {
                fetchOptions.body = JSON.stringify(inputs);
            }
            const response = await fetch(plugin.executor.endpoint, fetchOptions);
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
        // Normalize common frontend camelCase keys to backend snake_case
        const normalized = {};
        for (const [key, value] of Object.entries(inputs)) {
            switch (key) {
                case 'fromToken':
                    normalized['from_token'] = value;
                    normalized['src'] = value;
                    break;
                case 'toToken':
                    normalized['to_token'] = value;
                    normalized['dst'] = value;
                    break;
                case 'src':
                    normalized['src'] = value;
                    break;
                case 'dst':
                    normalized['dst'] = value;
                    break;
                case 'fromAddress':
                    normalized['from_address'] = value;
                    break;
                case 'chainId':
                    normalized['chain_id'] = value;
                    normalized['chainId'] = value;
                    break;
                case 'address':
                    normalized['from'] = value;
                    normalized['from_address'] = value;
                    break;
                case 'walletAddress':
                    normalized['wallet_address'] = value;
                    break;
                case 'walletProvider':
                    normalized['wallet_provider'] = value;
                    break;
                case 'supportedWallets':
                    normalized['supported_wallets'] = value;
                    break;
                case 'supportedNetworks':
                    normalized['supported_networks'] = value;
                    break;
                case 'defaultNetwork':
                    normalized['default_network'] = value;
                    break;
                case 'autoConnect':
                    normalized['auto_connect'] = value;
                    break;
                case 'showBalance':
                    normalized['show_balance'] = value;
                    break;
                case 'showNetworkSwitcher':
                    normalized['show_network_switcher'] = value;
                    break;
                default:
                    normalized[key] = value;
            }
        }
        inputs = normalized;
        // Add aliasing for 1inch expectations
        if (!inputs['src']) {
            if (inputs['from_token'])
                inputs['src'] = inputs['from_token'];
            else if (inputs['fromToken'])
                inputs['src'] = inputs['fromToken'];
        }
        if (!inputs['dst']) {
            if (inputs['to_token'])
                inputs['dst'] = inputs['to_token'];
            else if (inputs['toToken'])
                inputs['dst'] = inputs['toToken'];
        }
        // If a wallet address is present, prefer it as 'from'
        if (!inputs['from'] && inputs['from_address'])
            inputs['from'] = inputs['from_address'];
        // Merge outputs from dependency nodes
        for (const depId of step.dependencies) {
            const depStep = allSteps.get(depId);
            if (depStep && depStep.status === 'completed') {
                inputs = { ...inputs, ...depStep.outputs };
            }
        }
        // Re-run aliasing after merging dependency outputs
        if (!inputs['chain_id'] && inputs['chainId'])
            inputs['chain_id'] = inputs['chainId'];
        if (!inputs['src']) {
            if (inputs['from_token'])
                inputs['src'] = inputs['from_token'];
            else if (inputs['fromToken'])
                inputs['src'] = inputs['fromToken'];
        }
        if (!inputs['dst']) {
            if (inputs['to_token'])
                inputs['dst'] = inputs['to_token'];
            else if (inputs['toToken'])
                inputs['dst'] = inputs['toToken'];
        }
        if (!inputs['from'] && (inputs['from_address'] || inputs['wallet_address'] || inputs['address'])) {
            inputs['from'] = inputs['from_address'] || inputs['wallet_address'] || inputs['address'];
        }
        // Final safety: if critical fields are still missing, scan all completed steps' outputs
        const fillIfMissing = (key, candidates) => {
            if (inputs[key] !== undefined && inputs[key] !== '')
                return;
            for (const step of Array.from(allSteps.values())) {
                if (step.status === 'completed' && step.outputs) {
                    for (const candidate of candidates) {
                        const value = step.outputs[candidate];
                        if (value !== undefined && value !== null && value !== '') {
                            inputs[key] = value;
                            return;
                        }
                    }
                }
            }
        };
        fillIfMissing('chain_id', ['chain_id', 'chainId']);
        fillIfMissing('src', ['src', 'from_token', 'fromToken']);
        fillIfMissing('dst', ['dst', 'to_token', 'toToken']);
        fillIfMissing('amount', ['amount']);
        if (!inputs['chainId'] && inputs['chain_id'])
            inputs['chainId'] = inputs['chain_id'];
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