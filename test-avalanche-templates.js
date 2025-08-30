// Simple test to verify Avalanche templates are properly structured
console.log('🧪 Testing Avalanche Template Structure...\n');

// Test the template structure by reading the file directly
const fs = require('fs');
const path = require('path');

try {
  const templatePath = path.join(__dirname, 'frontend/lib/templates.ts');
  const templateContent = fs.readFileSync(templatePath, 'utf8');

  console.log('✅ Template file found and readable');

  // Check for Avalanche category
  if (templateContent.includes('avalanche')) {
    console.log('✅ Avalanche category found in templates');
  } else {
    console.log('❌ Avalanche category not found');
  }

  // Check for ICM nodes
  const icmChecks = ['icmSender', 'icmReceiver', 'l1Config', 'l1SimulatorDeployer'];
  icmChecks.forEach(nodeType => {
    if (templateContent.includes(nodeType)) {
      console.log(`✅ ${nodeType} node type found in templates`);
    } else {
      console.log(`❌ ${nodeType} node type not found`);
    }
  });

  // Check for template IDs
  const templateIds = ['avalanche-icm-workflow', 'avalanche-l1-simulation'];
  templateIds.forEach(id => {
    if (templateContent.includes(id)) {
      console.log(`✅ Template '${id}' found`);
    } else {
      console.log(`❌ Template '${id}' not found`);
    }
  });

  console.log('\n🏔️ Template Structure Test Complete!');

} catch (error) {
  console.error('❌ Error reading template file:', error.message);
}
