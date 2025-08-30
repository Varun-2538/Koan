import { unitePluginSystem } from '../frontend/lib/unite-plugin-system'

async function testPluginSystem() {
  console.log('🧪 Testing Plugin System...')
  
  try {
    // Initialize the plugin system
    await unitePluginSystem.initialize()
    console.log('✅ Plugin system initialized')
    
    // Get all components
    const components = unitePluginSystem.getComponents()
    console.log('📦 Available components:', components.map(c => c.id))
    
    // Test getting the oneInchQuote component
    const oneInchQuote = unitePluginSystem.getComponent('oneInchQuote')
    if (oneInchQuote) {
      console.log('✅ oneInchQuote component found')
      console.log('📋 Component details:', {
        id: oneInchQuote.id,
        name: oneInchQuote.name,
        description: oneInchQuote.description,
        category: oneInchQuote.category,
        hasTemplate: !!oneInchQuote.template,
        hasConfiguration: !!oneInchQuote.template?.configuration,
        configFields: oneInchQuote.template?.configuration?.length || 0
      })
    } else {
      console.error('❌ oneInchQuote component not found')
    }
    
    // Test getting the oneInchSwap component
    const oneInchSwap = unitePluginSystem.getComponent('oneInchSwap')
    if (oneInchSwap) {
      console.log('✅ oneInchSwap component found')
      console.log('📋 Component details:', {
        id: oneInchSwap.id,
        name: oneInchSwap.name,
        description: oneInchSwap.description,
        category: oneInchSwap.category,
        hasTemplate: !!oneInchSwap.template,
        hasConfiguration: !!oneInchSwap.template?.configuration,
        configFields: oneInchSwap.template?.configuration?.length || 0
      })
    } else {
      console.error('❌ oneInchSwap component not found')
    }
    
  } catch (error) {
    console.error('❌ Plugin system test failed:', error)
  }
}

testPluginSystem()
