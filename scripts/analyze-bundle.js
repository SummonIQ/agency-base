#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Large dependencies that could be optimized
const LARGE_DEPS = [
  'puppeteer', // Very large, consider dynamic import
  'mammoth', // Only used for document conversion
  'react-icons', // Import only needed icons
  '@heroicons/react', // Consider using lucide-react only
  'styled-components', // Using Tailwind, might not need this
  'lodash', // Can use individual imports
  'axios', // Can use native fetch
  'cheerio', // Server-side only
  'puppeteer-extra', // Server-side only
  'puppeteer-extra-plugin-stealth', // Server-side only
  '@adobe/helix-md2docx', // Document conversion only
  'react-diff-viewer', // Used in specific features only
  'recharts', // Consider lighter chart library
];

// Dependencies that should be in devDependencies
const SHOULD_BE_DEV = [
  'markdownlint',
  'markdownlint-rule-helpers',
  'pino-pretty', // Only for development logging
];

// Analyze package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

console.log('🔍 Bundle Size Optimization Analysis\n');

console.log('📦 Large Dependencies to Optimize:');
LARGE_DEPS.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`  ❗ ${dep} - Consider dynamic import or lighter alternative`);
  }
});

console.log('\n🔧 Dependencies that should be devDependencies:');
SHOULD_BE_DEV.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`  ⚠️  ${dep} - Move to devDependencies`);
  }
});

console.log('\n💡 Optimization Suggestions:');
console.log('  1. Use dynamic imports for puppeteer (server-side only)');
console.log('  2. Replace lodash with ES6 methods or individual imports');
console.log('  3. Use only lucide-react for icons (remove react-icons and @heroicons/react)');
console.log('  4. Remove axios in favor of native fetch');
console.log('  5. Lazy load heavy components like react-diff-viewer');
console.log('  6. Consider lighter charting library than recharts');
console.log('  7. Remove styled-components if not actively used');

// Check for duplicate icon libraries
const iconLibs = ['lucide-react', 'react-icons', '@heroicons/react', '@radix-ui/react-icons'];
const usedIconLibs = iconLibs.filter(lib => packageJson.dependencies[lib]);
if (usedIconLibs.length > 1) {
  console.log(`\n⚠️  Multiple icon libraries detected: ${usedIconLibs.join(', ')}`);
  console.log('   Consider using only lucide-react for consistency and smaller bundle');
}

console.log('\n📊 Next Steps:');
console.log('  1. Run "bunx @next/bundle-analyzer" for detailed analysis');
console.log('  2. Check usage of each large dependency');
console.log('  3. Implement code splitting for heavy features');
console.log('  4. Use dynamic imports for server-only code');