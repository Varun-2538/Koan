/**
 * Unite DeFi Enhanced Plugin System
 * Main integration file that brings all systems together
 * 
 * This system transforms Unite DeFi into a Langflow-like platform while keeping predefined nodes
 */

export * from './types'
export * from './plugin-registry'
export * from './connection-validator'
export * from './execution-engine'
export * from './code-execution'
export * from './enhanced-templates'
export * from './versioning-migration'

import { pluginRegistry } from './plugin-registry'
import { connectionValidator } from './connection-validator'
import { executionEngine } from './execution-engine'
import { codeExecutionEngine } from './code-execution'
import { templateProcessor } from './enhanced-templates'
import { versionManager } from './versioning-migration'

// Main plugin system orchestrator
export class UnitePluginSystem {
  private static instance: UnitePluginSystem
  private initialized = false

  static getInstance(): UnitePluginSystem {
    if (!UnitePluginSystem.instance) {
      UnitePluginSystem.instance = new UnitePluginSystem()
    }
    return UnitePluginSystem.instance
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log('🚀 Initializing Unite DeFi Enhanced Plugin System...')

    // Initialize all subsystems
    await this.initializeBuiltInComponents()
    await this.initializeBuiltInTransformers()
    await this.initializeBuiltInExecutors()
    await this.initializeBuiltInMigrations()
    
    // Discover and load plugins
    await this.discoverPlugins()

    // Setup event listeners
    this.setupEventListeners()

    this.initialized = true
    console.log('✅ Unite DeFi Plugin System initialized successfully!')
  }

  private async initializeBuiltInComponents(): Promise<void> {
    console.log('📦 Loading built-in components...')

    const builtInComponents = [
      // DeFi Components
      {
        id: 'oneInchSwap',
        name: '1inch Swap',
        description: 'Swap execution (panel validates only by default)',
        category: 'DeFi',
        version: '1.0.0',
        template: {
          inputs: [],
          outputs: [
            { id: 'transaction', name: 'Transaction', dataType: 'object' },
            { id: 'route', name: 'Route Info', dataType: 'object' },
            { id: 'validationOk', name: 'Validation OK', dataType: 'boolean' }
          ],
          configuration: [
            { key: 'chainId', name: 'Chain ID', type: 'text', required: true },
            { key: 'src', name: 'From Token Address', type: 'text', required: true },
            { key: 'dst', name: 'To Token Address', type: 'text', required: true },
            { key: 'amount', name: 'Amount (smallest units)', type: 'text', required: true },
            { key: 'from', name: 'From Address', type: 'text', required: true },
            { key: 'slippage', name: 'Slippage %', type: 'number', required: false, defaultValue: 1 },
            { key: 'apiKey', name: '1inch API Key', type: 'text', required: true, sensitive: true },
            { key: 'validateOnly', name: 'Validate Only (don’t broadcast)', type: 'boolean', required: false, defaultValue: true }
          ]
        },
        executor: {
          type: 'javascript',
          code: `
            async function execute(inputs, config, context) {
              const required = ['chainId','src','dst','amount','from','apiKey'];
              const missing = required.filter(k => !config[k]);
              if (missing.length) throw new Error('Missing required field(s): ' + missing.join(', '));
              // Validation-only or template mode: verify with quote endpoint
              if (config.validateOnly === true || config.template_creation_mode === true) {
                const params = new URLSearchParams();
                params.append('chainId', String(config.chainId));
                params.append('src', String(config.src));
                params.append('dst', String(config.dst));
                params.append('amount', String(config.amount));
                if (config.from) params.append('from', String(config.from));
                if (config.slippage != null) params.append('slippage', String(config.slippage));
                if (config.apiKey) params.append('apiKey', String(config.apiKey));
                const base = "${process.env.NEXT_PUBLIC_BACKEND_URL || ''}";
                const res = await fetch(base + '/api/1inch/quote?' + params.toString(), { method: 'GET' });
                if (!res.ok) {
                  let err; try { err = await res.json(); } catch {}
                  throw new Error((err && err.error) || ('HTTP ' + res.status));
                }
                const data = await res.json();
                return { transaction: null, route: data || null, validationOk: true };
              }
              const body = {
                chainId: String(config.chainId),
                src: String(config.src),
                dst: String(config.dst),
                amount: String(config.amount),
                from: String(config.from),
                slippage: config.slippage != null ? String(config.slippage) : undefined,
                apiKey: String(config.apiKey)
              };
              const base = "${process.env.NEXT_PUBLIC_BACKEND_URL || ''}";
              const res = await fetch(base + '/api/1inch/swap', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
              if (!res.ok) {
                let err; try { err = await res.json(); } catch {}
                throw new Error((err && err.error) || ('HTTP ' + res.status));
              }
              const data = await res.json();
              return { transaction: data.tx || data, route: data.route || data.protocols, validationOk: true };
            }
          `
        }
      },

      // Data Processing Components  
      {
        id: 'dataProcessor',
        name: 'Data Processor',
        description: 'Transform and manipulate data with JavaScript expressions',
        category: 'Data',
        version: '1.0.0',
        template: {
          inputs: [
            { id: 'data', name: 'Input Data', dataType: 'any', required: true }
          ],
          outputs: [
            { id: 'result', name: 'Processed Data', dataType: 'any' }
          ],
          configuration: [
            {
              key: 'operation',
              name: 'Operation Type',
              type: 'select',
              required: true,
              options: [
                { label: 'Format Number', value: 'formatNumber' },
                { label: 'Parse JSON', value: 'parseJson' },
                { label: 'Custom Expression', value: 'custom' }
              ]
            },
            {
              key: 'expression',
              name: 'Custom Expression',
              type: 'code',
              conditional: { field: 'operation', operator: 'equals', value: 'custom' },
              ui: { 
                helpText: 'JavaScript expression to process data. Use "input" variable.',
                placeholder: 'return input * 2;'
              }
            },
            {
              key: 'decimals',
              name: 'Decimal Places',
              type: 'number',
              conditional: { field: 'operation', operator: 'equals', value: 'formatNumber' },
              defaultValue: 2,
              constraints: [{ type: 'min', value: 0 }, { type: 'max', value: 18 }]
            }
          ]
        },
        executor: {
          type: 'javascript',
          code: `
            async function execute(inputs, config, context) {
              const { data } = inputs;
              const { operation, expression, decimals } = config;
              
              let result = data;
              
              switch (operation) {
                case 'formatNumber':
                  result = parseFloat(data).toFixed(decimals || 2);
                  break;
                case 'parseJson':
                  result = JSON.parse(data);
                  break;
                case 'custom':
                  result = await context.services.codeExecution.execute(expression, {
                    input: data,
                    config,
                    context
                  });
                  break;
              }
              
              return { result };
            }
          `
        }
      },

      // Conditional Logic
      {
        id: 'conditionalLogic',
        name: 'Conditional Logic',
        description: 'Execute different paths based on conditions',
        category: 'Logic',
        version: '1.0.0',
        template: {
          inputs: [
            { id: 'input', name: 'Input Value', dataType: 'any', required: true },
            { id: 'reference', name: 'Reference Value', dataType: 'any', required: false }
          ],
          outputs: [
            { id: 'true', name: 'True Path', dataType: 'execution' },
            { id: 'false', name: 'False Path', dataType: 'execution' },
            { id: 'value', name: 'Original Value', dataType: 'any' }
          ],
          configuration: [
            {
              key: 'conditionType',
              name: 'Condition Type',
              type: 'select',
              required: true,
              options: [
                { label: 'Greater Than (>)', value: 'gt' },
                { label: 'Less Than (<)', value: 'lt' },
                { label: 'Equal To (=)', value: 'eq' },
                { label: 'Contains Text', value: 'contains' },
                { label: 'Custom Expression', value: 'custom' }
              ]
            },
            {
              key: 'threshold',
              name: 'Threshold Value',
              type: 'number',
              conditional: { 
                field: 'conditionType', 
                operator: 'in', 
                values: ['gt', 'lt', 'eq'] 
              }
            },
            {
              key: 'customCondition',
              name: 'Custom Condition',
              type: 'code',
              conditional: { field: 'conditionType', operator: 'equals', value: 'custom' },
              ui: { 
                helpText: 'JavaScript expression returning true/false. Use "input" and "reference" variables.',
                placeholder: 'return input > reference;'
              }
            }
          ]
        },
        executor: {
          type: 'javascript',
          code: `
            async function execute(inputs, config, context) {
              const { input, reference } = inputs;
              const { conditionType, threshold, customCondition } = config;
              
              let result = false;
              
              switch (conditionType) {
                case 'gt':
                  result = parseFloat(input) > parseFloat(threshold);
                  break;
                case 'lt':
                  result = parseFloat(input) < parseFloat(threshold);
                  break;
                case 'eq':
                  result = input == threshold;
                  break;
                case 'contains':
                  result = String(input).includes(String(reference));
                  break;
                case 'custom':
                  const customResult = await context.services.codeExecution.execute(customCondition, {
                    input, reference, config, context
                  });
                  result = !!customResult.result;
                  break;
              }
              
              return { 
                value: input,
                result: result,
                [result ? 'true' : 'false']: true 
              };
            }
          `
        }
      }
      ,
      // Avalanche ICM - Sender (panel validation only)
      {
        id: 'icmSender',
        name: 'ICM Sender',
        description: 'Avalanche Teleporter send (panel validates only)',
        category: 'Avalanche',
        version: '1.0.0',
        template: {
          inputs: [],
          outputs: [
            { id: 'validationOk', name: 'Validation OK', dataType: 'boolean' }
          ],
          configuration: [
            {
              key: 'sourceChain',
              name: 'Source Chain',
              type: 'select',
              required: true,
              options: [
                { label: 'C-Chain', value: 'C' },
                { label: 'P-Chain', value: 'P' }
              ],
              defaultValue: 'C'
            },
            {
              key: 'destinationPreset',
              name: 'Destination Subnet',
              type: 'select',
              required: true,
              options: [
                { label: 'Dexalot Subnet (Mainnet)', value: 'dexalot' },
                { label: 'DeFi Kingdoms (DFK) Subnet (Mainnet)', value: 'dfk' },
                { label: 'Amplify Subnet (Mainnet)', value: 'amplify' },
                { label: 'Custom / Test Subnet (enter blockchainID)', value: 'custom' }
              ],
              defaultValue: 'custom'
            },
            {
              key: 'destinationChainID',
              name: 'Destination Chain ID',
              type: 'text',
              required: true,
              placeholder: '0x… 32-byte blockchainID (destination chain)',
              ui: {
                helpText: 'Paste the destination blockchainID (bytes32 hex). Presets provide guidance; you can override manually.'
              }
            },
            { key: 'recipient', name: 'Recipient Address', type: 'text', required: true, placeholder: '0x...' },
            { key: 'walletAddress', name: 'Wallet Address', type: 'text', required: true, placeholder: '0x...' },
            { key: 'amount', name: 'Amount/Payload (optional)', type: 'text', required: false },
            { key: 'validateOnly', name: 'Validate Only (don’t broadcast)', type: 'boolean', required: false, defaultValue: true }
          ]
        },
        executor: {
          type: 'javascript',
          code: `
            async function execute(inputs, config, context) {
              // Auto-fill destinationChainID from preset if provided
              if ((config.destinationPreset && config.destinationPreset !== 'custom') && !config.destinationChainID) {
                const presetMap = {
                  dexalot: "${process.env.NEXT_PUBLIC_AVAX_BLOCKCHAIN_ID_DEXALOT || ''}",
                  dfk: "${process.env.NEXT_PUBLIC_AVAX_BLOCKCHAIN_ID_DFK || ''}",
                  amplify: "${process.env.NEXT_PUBLIC_AVAX_BLOCKCHAIN_ID_AMPLIFY || ''}"
                };
                const suggested = presetMap[String(config.destinationPreset)] || '';
                if (suggested) {
                  config.destinationChainID = suggested;
                }
              }

              const required = ['sourceChain','destinationChainID','recipient','walletAddress'];
              const missing = required.filter(k => !config[k]);
              if (missing.length) throw new Error('Missing required field(s): ' + missing.join(', '));
              // Panel validates only
              return { validationOk: true };
            }
          `
        }
      }
      ,
      // 1inch Quote (Frontend built-in)
      {
        id: 'oneInchQuote',
        name: '1inch Quote',
        description: 'Get token swap quotes via backend 1inch API',
        category: 'DeFi',
        version: '1.0.0',
        template: {
          inputs: [
            { id: 'chainId', name: 'Chain ID', dataType: 'text', required: false },
            { id: 'src', name: 'From Token Address', dataType: 'text', required: false },
            { id: 'dst', name: 'To Token Address', dataType: 'text', required: false },
            { id: 'amount', name: 'Amount (wei)', dataType: 'text', required: false },
            { id: 'from', name: 'From Address', dataType: 'text', required: false },
            { id: 'slippage', name: 'Slippage %', dataType: 'number', required: false },
            { id: 'apiKey', name: 'API Key', dataType: 'text', required: false }
          ],
          outputs: [
            { id: 'quote', name: 'Quote Data', dataType: 'object' },
            { id: 'estimatedGas', name: 'Estimated Gas', dataType: 'number' }
          ],
          configuration: [
            { key: 'chainId', name: 'Chain ID', type: 'text', required: true, placeholder: '1' },
            { key: 'src', name: 'From Token Address', type: 'text', required: true, placeholder: '0xeeeeeeee...' },
            { key: 'dst', name: 'To Token Address', type: 'text', required: true, placeholder: '0xA0b8...' },
            { key: 'amount', name: 'Amount (wei)', type: 'text', required: true, placeholder: '1000000000000000000' },
            { key: 'from', name: 'From Address (optional)', type: 'text', required: false, placeholder: '0x...' },
            { key: 'slippage', name: 'Slippage %', type: 'number', required: false, defaultValue: 1 },
            { key: 'apiKey', name: '1inch API Key', type: 'text', required: true, sensitive: true }
          ]
        },
        executor: {
          type: 'javascript',
          code: `
            // Calls backend 1inch proxy. Backend must have ONEINCH_API_KEY set.
            async function execute(inputs, config, context) {
              const params = new URLSearchParams();
              
              // Merge inputs from connected nodes with config values (inputs take priority)
              const chainId = inputs.chainId || config.chainId;
              const src = inputs.src || config.src;
              const dst = inputs.dst || config.dst;
              const amount = inputs.amount || config.amount;
              const from = inputs.from || config.from;
              const slippage = inputs.slippage != null ? inputs.slippage : config.slippage;
              const apiKey = inputs.apiKey || config.apiKey;
              
              const required = [
                {key: 'chainId', value: chainId},
                {key: 'src', value: src},
                {key: 'dst', value: dst},
                {key: 'amount', value: amount}
              ];
              
              for (const {key, value} of required) {
                if (!value) throw new Error('Missing required field: ' + key);
                params.append(key, String(value));
              }
              if (from) params.append('from', String(from));
              if (slippage != null) params.append('slippage', String(slippage));
              // Enforce apiKey
              if (!apiKey) throw new Error('Missing required field: apiKey');
              params.append('apiKey', String(apiKey));

              const base = "${process.env.NEXT_PUBLIC_BACKEND_URL || ''}";
              const res = await fetch(base + '/api/1inch/quote?' + params.toString(), { method: 'GET' });
              if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || ('HTTP ' + res.status));
              }
              const data = await res.json();
              return { quote: data, estimatedGas: Number(data?.gas ?? 0) };
            }
          `
        }
      }
      ,
      {
        id: 'oneInchSwap',
        name: '1inch Swap',
        description: 'Execute swaps via backend 1inch API (panel validates only by default)',
        category: 'DeFi',
        version: '1.0.0',
        template: {
          inputs: [
            { id: 'chainId', name: 'Chain ID', dataType: 'text', required: false },
            { id: 'src', name: 'From Token Address', dataType: 'text', required: false },
            { id: 'dst', name: 'To Token Address', dataType: 'text', required: false },
            { id: 'amount', name: 'Amount (wei)', dataType: 'text', required: false },
            { id: 'from', name: 'From Address', dataType: 'text', required: false },
            { id: 'slippage', name: 'Slippage %', dataType: 'number', required: false },
            { id: 'apiKey', name: 'API Key', dataType: 'text', required: false },
            { id: 'quote', name: 'Quote Data', dataType: 'object', required: false }
          ],
          outputs: [
            { id: 'transaction', name: 'Transaction', dataType: 'object' },
            { id: 'route', name: 'Route Info', dataType: 'object' },
            { id: 'validationOk', name: 'Validation OK', dataType: 'boolean' }
          ],
          configuration: [
            { key: 'chainId', name: 'Chain ID', type: 'text', required: true },
            { key: 'src', name: 'From Token Address', type: 'text', required: true },
            { key: 'dst', name: 'To Token Address', type: 'text', required: true },
            { key: 'amount', name: 'Amount (smallest units)', type: 'text', required: true },
            { key: 'from', name: 'From Address', type: 'text', required: true },
            { key: 'slippage', name: 'Slippage %', type: 'number', required: false, defaultValue: 1 },
            { key: 'apiKey', name: '1inch API Key', type: 'text', required: true, sensitive: true },
            { key: 'validateOnly', name: 'Validate Only (don’t broadcast)', type: 'boolean', required: false, defaultValue: true },
            { key: 'template_creation_mode', name: 'Template Creation Mode', type: 'boolean', required: false, defaultValue: false }
          ]
        },
        executor: {
          type: 'javascript',
          code: `
            async function execute(inputs, config, context) {
              // Merge inputs from connected nodes with config values (inputs take priority)
              const chainId = inputs.chainId || config.chainId;
              const src = inputs.src || config.src;
              const dst = inputs.dst || config.dst;
              const amount = inputs.amount || config.amount;
              const from = inputs.from || config.from;
              const slippage = inputs.slippage != null ? inputs.slippage : config.slippage;
              const apiKey = inputs.apiKey || config.apiKey;
              
              const required = [
                {key: 'chainId', value: chainId},
                {key: 'src', value: src},
                {key: 'dst', value: dst},
                {key: 'amount', value: amount},
                {key: 'from', value: from},
                {key: 'apiKey', value: apiKey}
              ];
              
              for (const {key, value} of required) {
                if (!value) throw new Error('Missing required field: ' + key);
              }
              
              // In the config panel we default to validation-only; also support template mode
              if (config.validateOnly === true || config.template_creation_mode === true) {
                const params = new URLSearchParams();
                params.append('chainId', String(chainId));
                params.append('src', String(src));
                params.append('dst', String(dst));
                params.append('amount', String(amount));
                if (from) params.append('from', String(from));
                if (slippage != null) params.append('slippage', String(slippage));
                if (apiKey) params.append('apiKey', String(apiKey));
                const base = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_BACKEND_URL) ? process.env.NEXT_PUBLIC_BACKEND_URL : '';
                const res = await fetch(base + '/api/1inch/quote?' + params.toString(), { method: 'GET' });
                if (!res.ok) {
                  let err; try { err = await res.json(); } catch {}
                  throw new Error((err && err.error) || ('HTTP ' + res.status));
                }
                const data = await res.json();
                return { transaction: null, route: data || null, validationOk: true };
              }
              const body = {
                chainId: String(chainId),
                src: String(src),
                dst: String(dst),
                amount: String(amount),
                from: String(from),
                slippage: slippage != null ? String(slippage) : undefined,
                apiKey: String(apiKey)
              };
              const base = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_BACKEND_URL) ? process.env.NEXT_PUBLIC_BACKEND_URL : '';
              const res = await fetch(base + '/api/1inch/swap', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
              if (!res.ok) {
                let err; try { err = await res.json(); } catch {}
                throw new Error((err && err.error) || ('HTTP ' + res.status));
              }
              const data = await res.json();
              return { transaction: data.tx || data, route: data.route || data.protocols, validationOk: true };
            }
          `
        }
      }
      ,
      // Wallet Connector
      {
        id: 'walletConnector',
        name: 'Wallet Connector',
        description: 'Connect to crypto wallets (MetaMask, WalletConnect, Coinbase Wallet)',
        category: 'Wallet',
        version: '1.0.0',
        template: {
          inputs: [],
          outputs: [
            { id: 'address', name: 'Wallet Address', dataType: 'address' },
            { id: 'chainId', name: 'Chain ID', dataType: 'number' },
            { id: 'provider', name: 'Provider', dataType: 'object' }
          ],
          configuration: [
            {
              key: 'walletType',
              name: 'Wallet Type',
              type: 'select',
              required: true,
              options: [
                { label: 'MetaMask', value: 'metamask' },
                { label: 'WalletConnect', value: 'walletconnect' },
                { label: 'Coinbase Wallet', value: 'coinbase' }
              ],
              defaultValue: 'metamask'
            },
            {
              key: 'autoConnect',
              name: 'Auto Connect',
              type: 'boolean',
              required: false,
              defaultValue: true
            }
          ]
        },
        executor: {
          type: 'javascript',
          code: `
            // Development-time wallet connector mock
            async function execute(inputs, config, context) {
              const address = '0x' + Math.random().toString(16).substr(2, 40).padEnd(40, '0')
              const chainId = 1
              const provider = { type: config.walletType || 'metamask', connected: true }
              return { address, chainId, provider }
            }
          `
        }
      },
      // Token Selector (frontend utility)
      {
        id: 'tokenSelector',
        name: 'Token Selector',
        description: 'Select tokens and emit basic selection outputs',
        category: 'Wallet',
        version: '1.0.0',
        template: {
          inputs: [],
          outputs: [
            { id: 'selectedToken', name: 'Selected Token', dataType: 'token' },
            { id: 'fromToken', name: 'From Token', dataType: 'token' },
            { id: 'toToken', name: 'To Token', dataType: 'token' },
            { id: 'amount', name: 'Amount', dataType: 'string' },
            { id: 'tokens', name: 'Token List', dataType: 'array' }
          ],
          configuration: [
            { key: 'defaultTokens', name: 'Default Token List', type: 'multiselect', required: false },
            { key: 'fromToken', name: 'From Token', type: 'text', required: false },
            { key: 'toToken', name: 'To Token', type: 'text', required: false },
            { key: 'amount', name: 'Amount', type: 'text', required: false },
            { key: 'showTokenSearch', name: 'Show Token Search', type: 'boolean', required: false, defaultValue: true },
            { key: 'template_creation_mode', name: 'Template Creation Mode', type: 'boolean', required: false, defaultValue: true }
          ]
        },
        executor: {
          type: 'javascript',
          code: `
            async function execute(inputs, config, context) {
              const tokens = Array.isArray(config.defaultTokens) ? config.defaultTokens : [];
              const selectedToken = config.selectedToken || config.fromToken || null;
              const fromToken = config.fromToken || null;
              const toToken = config.toToken || null;
              const amount = (config.amount != null) ? String(config.amount) : null;
              return { selectedToken, fromToken, toToken, amount, tokens };
            }
          `
        }
      },
      // Input Provider (manual inputs for flows)
      {
        id: 'inputProvider',
        name: 'Input Provider',
        description: 'Provide manual inputs (chainId, src, dst, amount, from, slippage, apiKey) to downstream nodes',
        category: 'Data',
        version: '1.0.0',
        template: {
          inputs: [],
          outputs: [
            { id: 'chainId', name: 'Chain ID', dataType: 'text' },
            { id: 'src', name: 'From Token Address', dataType: 'text' },
            { id: 'dst', name: 'To Token Address', dataType: 'text' },
            { id: 'amount', name: 'Amount (wei)', dataType: 'text' },
            { id: 'from', name: 'From Address', dataType: 'text' },
            { id: 'slippage', name: 'Slippage %', dataType: 'number' },
            { id: 'apiKey', name: '1inch API Key', dataType: 'text' }
          ],
          configuration: [
            { key: 'chainId', name: 'Chain ID', type: 'text', required: false, placeholder: '1' },
            { key: 'src', name: 'From Token Address', type: 'text', required: false },
            { key: 'dst', name: 'To Token Address', type: 'text', required: false },
            { key: 'amount', name: 'Amount (wei)', type: 'text', required: false },
            { key: 'from', name: 'From Address', type: 'text', required: false },
            { key: 'slippage', name: 'Slippage %', type: 'number', required: false, defaultValue: 1 },
            { key: 'apiKey', name: '1inch API Key', type: 'text', required: false, sensitive: true }
          ]
        },
        executor: {
          type: 'javascript',
          code: `
            async function execute(inputs, config, context) {
              return {
                chainId: String(config.chainId ?? inputs.chainId ?? ''),
                src: config.src ?? inputs.src ?? '',
                dst: config.dst ?? inputs.dst ?? '',
                amount: String(config.amount ?? inputs.amount ?? ''),
                from: config.from ?? inputs.from ?? '',
                slippage: (config.slippage != null ? Number(config.slippage) : (inputs.slippage != null ? Number(inputs.slippage) : undefined)),
                apiKey: config.apiKey ?? inputs.apiKey ?? ''
              }
            }
          `
        }
      },
      // Price Impact Calculator
      {
        id: 'priceImpactCalculator',
        name: 'Price Impact Calculator',
        description: 'Calculate price impact and minimum received based on slippage',
        category: 'Analytics',
        version: '1.0.0',
        template: {
          inputs: [],
          outputs: [
            { id: 'priceImpact', name: 'Price Impact %', dataType: 'number' },
            { id: 'minimumReceived', name: 'Minimum Received', dataType: 'number' }
          ],
          configuration: [
            { key: 'tradeAmount', name: 'Trade Amount', type: 'number', required: false },
            { key: 'liquidity', name: 'Pool Liquidity', type: 'number', required: false },
            { key: 'slippageTolerance', name: 'Slippage Tolerance %', type: 'number', required: false, defaultValue: 1 },
            { key: 'autoSlippage', name: 'Auto Slippage', type: 'boolean', required: false, defaultValue: false },
            { key: 'minSlippage', name: 'Min Slippage %', type: 'number', required: false, defaultValue: 0.1 },
            { key: 'maxSlippage', name: 'Max Slippage %', type: 'number', required: false, defaultValue: 5 },
            { key: 'template_creation_mode', name: 'Template Creation Mode', type: 'boolean', required: false, defaultValue: true }
          ]
        },
        executor: {
          type: 'javascript',
          code: `
            async function execute(inputs, config, context) {
              const tradeAmount = parseFloat(config.tradeAmount || 0);
              const liquidity = parseFloat(config.liquidity || 0);
              let slippage = parseFloat(config.slippageTolerance != null ? config.slippageTolerance : 1);
              if (config.autoSlippage) {
                const minS = parseFloat(config.minSlippage != null ? config.minSlippage : 0.1);
                const maxS = parseFloat(config.maxSlippage != null ? config.maxSlippage : 5);
                slippage = Math.min(maxS, Math.max(minS, tradeAmount && liquidity ? (tradeAmount / (liquidity || 1)) * 100 : 1));
              }
              // If template mode and no numbers yet, return safe defaults
              if ((config.template_creation_mode === true) && (!tradeAmount || !liquidity)) {
                return { priceImpact: 0, minimumReceived: 0 };
              }
              const priceImpact = liquidity > 0 ? (tradeAmount / liquidity) * 100 : 0;
              const minimumReceived = tradeAmount * (1 - (slippage / 100));
              return { priceImpact, minimumReceived };
            }
          `
        }
      },
      // DeFi Dashboard (UI)
      {
        id: 'defiDashboard',
        name: 'DeFi Dashboard',
        description: 'Display DeFi metrics and charts based on inputs',
        category: 'UI',
        version: '1.0.0',
        template: {
          inputs: [],
          outputs: [
            { id: 'dashboardState', name: 'Dashboard State', dataType: 'object' }
          ],
          configuration: [
            { key: 'title', name: 'Title', type: 'text', required: false, defaultValue: 'DeFi Dashboard' },
            { key: 'theme', name: 'Theme', type: 'select', required: false, options: [
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
              { label: 'Modern', value: 'modern' }
            ], defaultValue: 'light' },
            { key: 'chartType', name: 'Chart Type', type: 'select', required: false, options: [
              { label: 'Line', value: 'line' },
              { label: 'Bar', value: 'bar' },
              { label: 'Pie', value: 'pie' }
            ], defaultValue: 'line' },
            { key: 'refreshInterval', name: 'Refresh Interval (s)', type: 'number', required: false, defaultValue: 30 },
            { key: 'showPnL', name: 'Show P&L', type: 'boolean', required: false, defaultValue: true },
            { key: 'enablePriceChart', name: 'Enable Price Chart', type: 'boolean', required: false, defaultValue: true },
            { key: 'showPriceImpact', name: 'Show Price Impact', type: 'boolean', required: false, defaultValue: false },
            { key: 'showAdvancedSettings', name: 'Show Advanced Settings', type: 'boolean', required: false, defaultValue: false },
            { key: 'template_creation_mode', name: 'Template Creation Mode', type: 'boolean', required: false, defaultValue: true }
          ]
        },
        executor: {
          type: 'javascript',
          code: `
            async function execute(inputs, config, context) {
              const dashboardState = {
                title: config.title || 'DeFi Dashboard',
                theme: config.theme || 'light',
                chartType: config.chartType || 'line',
                refreshInterval: Number(config.refreshInterval || 30),
                showPnL: Boolean(config.showPnL),
                enablePriceChart: Boolean(config.enablePriceChart),
                showPriceImpact: Boolean(config.showPriceImpact),
                showAdvancedSettings: Boolean(config.showAdvancedSettings),
                widgets: [
                  { id: 'summary', type: 'summary', data: { pnl: 0, positions: 0 } },
                  { id: 'chart', type: 'price', visible: Boolean(config.enablePriceChart) }
                ]
              };
              return { dashboardState };
            }
          `
        }
      }
    ]

    // Register all built-in components
    for (const component of builtInComponents) {
      await pluginRegistry.registerPlugin({
        id: `builtin-${component.id}`,
        name: component.name,
        version: component.version,
        author: 'Unite DeFi Team',
        description: component.description,
        components: [component as any],
        permissions: [],
        compatibility: { minVersion: '1.0.0' },
        tags: [component.category.toLowerCase()]
      })
    }

    console.log(`✅ Loaded ${builtInComponents.length} built-in components`)
  }

  private async initializeBuiltInTransformers(): Promise<void> {
    console.log('🔄 Initializing data transformers...')

    const transformers = [
      {
        id: 'string_to_number',
        name: 'String to Number',
        fromType: 'string',
        toType: 'number',
        transform: (value: string) => parseFloat(value) || 0
      },
      {
        id: 'number_to_string',
        name: 'Number to String',
        fromType: 'number',
        toType: 'string',
        transform: (value: number) => value.toString()
      },
      {
        id: 'object_to_json',
        name: 'Object to JSON',
        fromType: 'object',
        toType: 'string',
        transform: (value: any) => JSON.stringify(value)
      },
      {
        id: 'json_to_object',
        name: 'JSON to Object',
        fromType: 'string',
        toType: 'object',
        transform: (value: string) => {
          try {
            return JSON.parse(value)
          } catch {
            return {}
          }
        }
      },
      {
        id: 'token_to_address',
        name: 'Extract Token Address',
        fromType: 'token',
        toType: 'address',
        transform: (value: any) => value.address || value
      }
    ]

    transformers.forEach(transformer => {
      connectionValidator.registerTransformer(transformer as any)
    })

    console.log(`✅ Registered ${transformers.length} data transformers`)
  }

  private async initializeBuiltInExecutors(): Promise<void> {
    console.log('⚡ Initializing executors...')
    // Executors are initialized in the execution engine
    console.log('✅ Built-in executors ready')
  }

  private async initializeBuiltInMigrations(): Promise<void> {
    console.log('🔄 Initializing migrations...')
    
    // Register common migrations
    const migrations = [
      {
        id: 'v1_to_v2_config_update',
        fromVersion: '1.0.0',
        toVersion: '2.0.0',
        type: 'automatic',
        description: 'Update configuration format',
        breaking: false,
        steps: [{
          id: 'update_config_format',
          description: 'Update configuration to new format',
          type: 'config',
          transformer: {
            transform: async (data: any) => ({
              success: true,
              data: { ...data, version: '2.0.0' },
              warnings: [],
              errors: [],
              manualStepsRequired: []
            })
          }
        }]
      }
    ]

    migrations.forEach(migration => {
      versionManager.registerMigration(migration as any)
    })

    console.log(`✅ Registered ${migrations.length} migrations`)
  }

  private async discoverPlugins(): Promise<void> {
    console.log('🔍 Discovering plugins...')
    
    try {
      const discovered = await pluginRegistry.discoverPlugins()
      console.log(`📦 Found ${discovered.length} available plugins`)
      
      // Auto-load essential plugins
      for (const plugin of discovered) {
        if (plugin.tags?.includes('essential') || plugin.tags?.includes('core')) {
          await pluginRegistry.registerPlugin(plugin)
          console.log(`✅ Auto-loaded essential plugin: ${plugin.name}`)
        }
      }
    } catch (error) {
      console.warn('⚠️  Plugin discovery failed:', error)
    }
  }

  private setupEventListeners(): void {
    console.log('👂 Setting up event listeners...')

    // Plugin lifecycle events
    pluginRegistry.on('plugin-registered', (event) => {
      console.log(`📦 Plugin registered: ${event.plugin.name}`)
    })

    pluginRegistry.on('plugin-unregistered', (event) => {
      console.log(`🗑️  Plugin unregistered: ${event.pluginId}`)
    })

    // Execution events  
    executionEngine.on('execution-started', (event) => {
      console.log(`🚀 Execution started: ${event.executionId}`)
    })

    executionEngine.on('execution-completed', (event) => {
      console.log(`✅ Execution completed: ${event.executionId}`)
    })

    executionEngine.on('execution-failed', (event) => {
      console.error(`❌ Execution failed: ${event.executionId}`, event.error)
    })

    console.log('✅ Event listeners configured')
  }

  // Public API methods
  async executeWorkflow(
    workflowDefinition: any,
    inputs: Record<string, any> = {},
    options: ExecutionOptions = {}
  ): Promise<WorkflowExecutionResult> {
    console.log(`🎯 Executing workflow: ${workflowDefinition.name || 'Unnamed'}`)

    const startTime = Date.now()
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
      // Validate workflow
      const validation = await this.validateWorkflow(workflowDefinition)
      if (!validation.valid) {
        throw new Error(`Workflow validation failed: ${validation.errors.join(', ')}`)
      }

      // Execute nodes in topological order
      const executionOrder = this.getExecutionOrder(workflowDefinition)
      const results = new Map<string, any>()
      const nodeResults: NodeExecutionResult[] = []

      for (const nodeId of executionOrder) {
        const node = workflowDefinition.nodes.find((n: any) => n.id === nodeId)
        if (!node) continue

        // Prepare node inputs from previous results and workflow inputs
        const nodeInputs = this.prepareNodeInputs(node, results, inputs, workflowDefinition.connections)

        // Execute node
        const nodeResult = await executionEngine.executeComponent(
          node.type,
          nodeInputs,
          node.config || {},
          {
            workflowId: workflowDefinition.id,
            executionId,
            nodeId: node.id,
            environment: options.environment || 'development',
            variables: new Map(),
            secrets: new Map(),
            services: new Map(),
            cache: new Map(),
            events: new (EventTarget as any)(),
            logger: console,
            config: {
              timeout: 30000,
              retries: 3,
              enableCaching: true,
              enableLogging: true,
              enableProfiling: false,
              sandboxed: true,
              resourceLimits: {
                memory: 128,
                cpu: 1,
                network: 100,
                storage: 256,
                duration: 30
              },
              permissions: []
            }
          }
        )

        results.set(nodeId, nodeResult.outputs)
        nodeResults.push({
          nodeId,
          nodeType: node.type,
          success: nodeResult.success,
          outputs: nodeResult.outputs,
          error: nodeResult.error?.message,
          duration: nodeResult.metrics?.duration || 0
        })

        if (!nodeResult.success && options.failFast !== false) {
          throw new Error(`Node ${nodeId} failed: ${nodeResult.error?.message}`)
        }
      }

      return {
        success: true,
        executionId,
        duration: Date.now() - startTime,
        results: Object.fromEntries(results),
        nodeResults,
        errors: [],
        warnings: []
      }

    } catch (error) {
      console.error(`❌ Workflow execution failed:`, error)
      
      return {
        success: false,
        executionId,
        duration: Date.now() - startTime,
        results: {},
        nodeResults: [],
        errors: [error.message],
        warnings: []
      }
    }
  }

  async generateCode(
    workflowDefinition: any,
    options: CodeGenerationOptions = {}
  ): Promise<GeneratedCodeRepository> {
    console.log(`🔨 Generating code for workflow: ${workflowDefinition.name}`)

    const nodeConfigs = workflowDefinition.nodes.map((node: any) => ({
      id: node.id,
      type: node.type,
      config: node.config || {},
      script: node.script,
      inputs: [], // Would be populated from component definitions
      outputs: []
    }))

    const connections = workflowDefinition.connections || []

    return await codeExecutionEngine.generateModularCode(
      nodeConfigs,
      connections,
      {
        language: 'typescript',
        description: workflowDefinition.description,
        includeTests: options.includeTests !== false,
        includeDocumentation: options.includeDocumentation !== false,
        optimizeForProduction: options.optimizeForProduction === true
      }
    )
  }

  private async validateWorkflow(workflow: any): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    console.log('🔍 Validating workflow...')
    console.log('📊 Workflow nodes:', workflow.nodes?.length || 0)
    console.log('🔗 Workflow connections:', workflow.connections?.length || 0)

    // Basic structure validation
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push('Workflow must have a nodes array')
    }

    if (!workflow.connections || !Array.isArray(workflow.connections)) {
      warnings.push('Workflow has no connections defined')
    }

        // Validate nodes
    for (const node of workflow.nodes || []) {
      console.log(`🔍 Validating node: ${node.id} (${node.type})`)
      if (!node.id) errors.push(`Node missing ID: ${JSON.stringify(node)}`)
      if (!node.type) errors.push(`Node ${node.id} missing type`)

      const component = pluginRegistry.getComponent(node.type)
      if (!component) {
        console.warn(`⚠️ Component not found in plugin registry: ${node.type}. This may be a backend-only component.`)
        warnings.push(`Unknown component type: ${node.type} (may be backend-only)`)
        // Don't add to errors for now - allow backend-only components
      }
    }

        // Validate connections
    for (const connection of workflow.connections || []) {
      console.log(`🔍 Validating connection: ${connection.source} → ${connection.target}`)
      const sourceNode = workflow.nodes.find((n: any) => n.id === connection.source)
      const targetNode = workflow.nodes.find((n: any) => n.id === connection.target)

      if (!sourceNode) {
        console.error(`❌ Connection references unknown source node: ${connection.source}`)
        console.log('Available nodes:', workflow.nodes?.map(n => n.id))
        errors.push(`Connection references unknown source node: ${connection.source}`)
      }
      if (!targetNode) {
        console.error(`❌ Connection references unknown target node: ${connection.target}`)
        console.log('Available nodes:', workflow.nodes?.map(n => n.id))
        errors.push(`Connection references unknown target node: ${connection.target}`)
      }

      if (sourceNode && targetNode) {
        console.log(`✅ Connection valid: ${connection.source} → ${connection.target}`)
        // Skip connection validation for now since most components aren't registered
        // const canConnect = await connectionValidator.canConnect(
        //   connection.sourceHandle || 'output',
        //   connection.targetHandle || 'input'
        // )
        //
        // if (!canConnect) {
        //   warnings.push(`Potentially invalid connection: ${connection.source} → ${connection.target}`)
        // }
      }
    }

    console.log('✅ Workflow validation complete:', {
      valid: errors.length === 0,
      errors: errors.length,
      warnings: warnings.length
    })

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    }
  }

  private getExecutionOrder(workflow: any): string[] {
    // Implement topological sort for execution order
    const nodes = workflow.nodes.map((n: any) => n.id)
    const connections = workflow.connections || []
    
    // For now, return nodes in original order
    // In production, implement proper topological sort
    return nodes
  }

  private prepareNodeInputs(
    node: any,
    results: Map<string, any>,
    workflowInputs: Record<string, any>,
    connections: any[]
  ): Record<string, any> {
    const inputs: Record<string, any> = { ...workflowInputs }
    
    // Add inputs from connected nodes
    const nodeConnections = connections.filter((c: any) => c.target === node.id)
    
    for (const connection of nodeConnections) {
      const sourceResult = results.get(connection.source)
      if (sourceResult) {
        const outputKey = connection.sourceHandle || 'output'
        const inputKey = connection.targetHandle || 'input'
        inputs[inputKey] = sourceResult[outputKey]
      }
    }
    
    return inputs
  }

  // Component access methods
  getComponent(componentId: string): any {
    return pluginRegistry.getComponent(componentId)
  }

  getComponents(): any[] {
    return pluginRegistry.getComponents()
  }

  // System status and health checks
  getSystemStatus(): SystemStatus {
    return {
      initialized: this.initialized,
      components: pluginRegistry.getComponents().length,
      plugins: Array.from((pluginRegistry as any).plugins.size || 0),
      executors: Array.from((executionEngine as any).executors.size || 0),
      transformers: Array.from((connectionValidator as any).transformers.size || 0),
      uptime: Date.now() - (this as any).initTime || 0
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const checks: HealthCheck[] = []

    // Check plugin registry
    try {
      const components = pluginRegistry.getComponents()
      checks.push({
        name: 'Plugin Registry',
        status: 'healthy',
        message: `${components.length} components loaded`
      })
    } catch (error) {
      checks.push({
        name: 'Plugin Registry',
        status: 'unhealthy',
        message: error.message
      })
    }

    // Check execution engine
    try {
      const runningExecutions = executionEngine.getRunningExecutions()
      checks.push({
        name: 'Execution Engine',
        status: 'healthy',
        message: `${runningExecutions.length} executions running`
      })
    } catch (error) {
      checks.push({
        name: 'Execution Engine', 
        status: 'unhealthy',
        message: error.message
      })
    }

    const healthy = checks.every(check => check.status === 'healthy')

    return {
      status: healthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString()
    }
  }
}

// Export types and interfaces
export interface ExecutionOptions {
  environment?: 'development' | 'staging' | 'production'
  failFast?: boolean
  timeout?: number
}

export interface WorkflowExecutionResult {
  success: boolean
  executionId: string
  duration: number
  results: Record<string, any>
  nodeResults: NodeExecutionResult[]
  errors: string[]
  warnings: string[]
}

export interface NodeExecutionResult {
  nodeId: string
  nodeType: string
  success: boolean
  outputs: Record<string, any>
  error?: string
  duration: number
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface CodeGenerationOptions {
  includeTests?: boolean
  includeDocumentation?: boolean
  optimizeForProduction?: boolean
}

export interface GeneratedCodeRepository {
  language: string
  modules: Map<string, any>
  dependencies: Set<string>
  entryPoint: string
  metadata: any
}

export interface SystemStatus {
  initialized: boolean
  components: number
  plugins: number
  executors: number
  transformers: number
  uptime: number
}

export interface HealthCheck {
  name: string
  status: 'healthy' | 'unhealthy' | 'warning'
  message: string
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy'
  checks: HealthCheck[]
  timestamp: string
}

// Global plugin system instance
export const unitePluginSystem = UnitePluginSystem.getInstance()

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  // Browser environment - initialize after DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    unitePluginSystem.initialize().catch(console.error)
  })
} else {
  // Node.js environment - initialize immediately
  unitePluginSystem.initialize().catch(console.error)
}