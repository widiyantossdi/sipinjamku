#!/usr/bin/env node

/**
 * Script deployment otomatis untuk Vercel
 * Usage: node deploy.js [--prod]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const isProd = process.argv.includes('--prod');
const environment = isProd ? 'production' : 'preview';

console.log(`🚀 Starting deployment to ${environment}...`);

try {
  // 1. Verify build exists
  console.log('✅ Verifying build output...');
  if (!fs.existsSync('dist/index.html')) {
    console.log('🏗️  Build not found, creating production build...');
    execSync('npm run build', { stdio: 'inherit' });
  } else {
    console.log('📦 Using existing build in dist/ directory');
  }

  // 2. Deploy to Vercel
  console.log(`🌐 Deploying to Vercel (${environment})...`);
  const deployCmd = isProd ? 'vercel --prod' : 'vercel';
  execSync(deployCmd, { stdio: 'inherit' });

  console.log('🎉 Deployment completed successfully!');
  console.log('📱 Frontend URL: https://sipinjamku.unugha.ac.id');
  console.log('🔗 Backend URL: https://backpinjam.unugha.ac.id');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

// Helper function to check environment
function checkEnvironment() {
  const requiredEnvVars = [
    'VITE_API_BASE_URL'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing.join(', '));
    console.log('📝 Make sure to set them in Vercel dashboard');
  }
}

checkEnvironment();