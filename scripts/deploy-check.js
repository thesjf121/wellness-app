#!/usr/bin/env node

/**
 * Pre-deployment check script
 * Validates that the application is ready for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 WellnessApp Deployment Readiness Check\n');

const checks = [
  {
    name: 'Package.json validation',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.name && pkg.version && pkg.scripts.build;
    }
  },
  {
    name: 'Environment configuration',
    check: () => {
      return fs.existsSync('.env.example') && fs.existsSync('src/config/environment.ts');
    }
  },
  {
    name: 'Render configuration',
    check: () => {
      const renderYaml = fs.readFileSync('render.yaml', 'utf8');
      return renderYaml.includes('wellness-app') && renderYaml.includes('staticPublishPath');
    }
  },
  {
    name: 'TypeScript compilation',
    check: () => {
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        return true;
      } catch (error) {
        console.log('   ❌ TypeScript errors found');
        return false;
      }
    }
  },
  {
    name: 'Build process',
    check: () => {
      try {
        console.log('   Building application...');
        execSync('npm run build', { stdio: 'pipe' });
        return fs.existsSync('build/index.html') && fs.existsSync('build/static');
      } catch (error) {
        console.log('   ❌ Build failed');
        return false;
      }
    }
  },
  {
    name: 'Required files exist',
    check: () => {
      const requiredFiles = [
        'public/index.html',
        'public/manifest.json',
        'src/App.tsx',
        'src/index.tsx',
        'DEPLOYMENT.md'
      ];
      return requiredFiles.every(file => fs.existsSync(file));
    }
  },
  {
    name: 'Clerk integration',
    check: () => {
      const appContent = fs.readFileSync('src/App.tsx', 'utf8');
      return appContent.includes('ClerkProvider') && appContent.includes('ClerkErrorBoundary');
    }
  },
  {
    name: 'Bundle size check',
    check: () => {
      if (!fs.existsSync('build')) return false;
      
      const statsFile = path.join('build', 'static', 'js');
      if (!fs.existsSync(statsFile)) return false;
      
      const jsFiles = fs.readdirSync(statsFile).filter(f => f.endsWith('.js'));
      const totalSize = jsFiles.reduce((size, file) => {
        const stat = fs.statSync(path.join(statsFile, file));
        return size + stat.size;
      }, 0);
      
      const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      console.log(`   Bundle size: ${sizeMB}MB`);
      
      // Warn if bundle is very large (>5MB)
      if (totalSize > 5 * 1024 * 1024) {
        console.log('   ⚠️  Large bundle size detected');
      }
      
      return true;
    }
  }
];

let allPassed = true;

console.log('Running deployment checks...\n');

for (const check of checks) {
  process.stdout.write(`✓ ${check.name}... `);
  
  try {
    const passed = check.check();
    if (passed) {
      console.log('✅ PASS');
    } else {
      console.log('❌ FAIL');
      allPassed = false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    allPassed = false;
  }
}

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Ready for deployment.');
  console.log('\nNext steps:');
  console.log('1. Push your code to GitHub');
  console.log('2. Connect your repository to Render.com');
  console.log('3. Set environment variables in Render dashboard');
  console.log('4. Deploy and test!');
  console.log('\nSee DEPLOYMENT.md for detailed instructions.');
} else {
  console.log('❌ Some checks failed. Please fix the issues before deploying.');
  process.exit(1);
}

console.log('\n' + '='.repeat(50));