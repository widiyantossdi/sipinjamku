// Post-Deploy Testing Script
// Testing integrasi frontend-backend dan verifikasi deployment

import axios from 'axios';
import fs from 'fs';

// Configuration
const BACKEND_LOCAL = 'http://localhost:8000/api';
const BACKEND_PRODUCTION = 'https://backpinjam.unugha.ac.id/api';
const FRONTEND_LOCAL = 'http://localhost:3000';
const FRONTEND_PRODUCTION = 'https://sipinjamku.unugha.ac.id';

// Test Results
let testResults = {
  timestamp: new Date().toISOString(),
  tests: []
};

// Helper function to add test result
function addTestResult(name, status, message, details = null) {
  testResults.tests.push({
    name,
    status,
    message,
    details,
    timestamp: new Date().toISOString()
  });
  console.log(`${status === 'PASS' ? '✅' : '❌'} ${name}: ${message}`);
}

// Test Backend Health (Local)
async function testBackendHealthLocal() {
  try {
    const response = await axios.get(`${BACKEND_LOCAL}/health`, {
      timeout: 5000
    });
    
    if (response.status === 200 && response.data.status === 'ok') {
      addTestResult(
        'Backend Health (Local)',
        'PASS',
        'Backend API berfungsi dengan baik',
        response.data
      );
    } else {
      addTestResult(
        'Backend Health (Local)',
        'FAIL',
        'Response tidak sesuai ekspektasi',
        response.data
      );
    }
  } catch (error) {
    addTestResult(
      'Backend Health (Local)',
      'FAIL',
      `Error: ${error.message}`,
      error.response?.data
    );
  }
}

// Test Backend Health (Production)
async function testBackendHealthProduction() {
  try {
    const response = await axios.get(`${BACKEND_PRODUCTION}/health`, {
      timeout: 10000
    });
    
    if (response.status === 200 && response.data.status === 'ok') {
      addTestResult(
        'Backend Health (Production)',
        'PASS',
        'Backend production API berfungsi dengan baik',
        response.data
      );
    } else {
      addTestResult(
        'Backend Health (Production)',
        'FAIL',
        'Response tidak sesuai ekspektasi',
        response.data
      );
    }
  } catch (error) {
    addTestResult(
      'Backend Health (Production)',
      'FAIL',
      `Error: ${error.message}`,
      error.response?.data
    );
  }
}

// Test CSRF Token (Local)
async function testCSRFLocal() {
  try {
    const response = await axios.get(`${BACKEND_LOCAL.replace('/api', '')}/sanctum/csrf-cookie`, {
      timeout: 5000
    });
    
    if (response.status === 204) {
      addTestResult(
        'CSRF Token (Local)',
        'PASS',
        'CSRF cookie endpoint berfungsi',
        { status: response.status }
      );
    } else {
      addTestResult(
        'CSRF Token (Local)',
        'FAIL',
        'Status code tidak sesuai ekspektasi',
        { status: response.status }
      );
    }
  } catch (error) {
    addTestResult(
      'CSRF Token (Local)',
      'FAIL',
      `Error: ${error.message}`,
      error.response?.data
    );
  }
}

// Test Frontend Access (Local)
async function testFrontendLocal() {
  try {
    const response = await axios.get(FRONTEND_LOCAL, {
      timeout: 5000
    });
    
    if (response.status === 200 && response.data.includes('<!DOCTYPE html>')) {
      addTestResult(
        'Frontend Access (Local)',
        'PASS',
        'Frontend lokal dapat diakses',
        { status: response.status }
      );
    } else {
      addTestResult(
        'Frontend Access (Local)',
        'FAIL',
        'Response tidak sesuai ekspektasi',
        { status: response.status }
      );
    }
  } catch (error) {
    addTestResult(
      'Frontend Access (Local)',
      'FAIL',
      `Error: ${error.message}`,
      error.response?.data
    );
  }
}

// Test Frontend Access (Production)
async function testFrontendProduction() {
  try {
    const response = await axios.get(FRONTEND_PRODUCTION, {
      timeout: 10000
    });
    
    if (response.status === 200 && response.data.includes('<!DOCTYPE html>')) {
      addTestResult(
        'Frontend Access (Production)',
        'PASS',
        'Frontend production dapat diakses',
        { status: response.status }
      );
    } else {
      addTestResult(
        'Frontend Access (Production)',
        'FAIL',
        'Response tidak sesuai ekspektasi',
        { status: response.status }
      );
    }
  } catch (error) {
    addTestResult(
      'Frontend Access (Production)',
      'FAIL',
      `Error: ${error.message}`,
      error.response?.data
    );
  }
}

// Test CORS Configuration
async function testCORS() {
  try {
    const response = await axios.options(`${BACKEND_LOCAL}/health`, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET'
      },
      timeout: 5000
    });
    
    const corsHeaders = response.headers['access-control-allow-origin'];
    if (corsHeaders) {
      addTestResult(
        'CORS Configuration',
        'PASS',
        'CORS headers dikonfigurasi dengan benar',
        { corsHeaders }
      );
    } else {
      addTestResult(
        'CORS Configuration',
        'FAIL',
        'CORS headers tidak ditemukan',
        response.headers
      );
    }
  } catch (error) {
    addTestResult(
      'CORS Configuration',
      'FAIL',
      `Error: ${error.message}`,
      error.response?.data
    );
  }
}

// Main testing function
async function runTests() {
  console.log('🚀 Memulai Post-Deploy Testing...');
  console.log('=' .repeat(50));
  
  // Local tests
  console.log('\n📍 Testing Local Environment:');
  await testBackendHealthLocal();
  await testCSRFLocal();
  await testFrontendLocal();
  await testCORS();
  
  // Production tests
  console.log('\n🌐 Testing Production Environment:');
  await testBackendHealthProduction();
  await testFrontendProduction();
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Summary:');
  
  const passedTests = testResults.tests.filter(t => t.status === 'PASS').length;
  const totalTests = testResults.tests.length;
  
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  // Save results to file
  fs.writeFileSync(
    'post_deploy_test_results.json',
    JSON.stringify(testResults, null, 2)
  );
  
  console.log('\n📄 Hasil testing disimpan ke: post_deploy_test_results.json');
  
  // Exit with appropriate code
  process.exit(passedTests === totalTests ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Error menjalankan tests:', error);
  process.exit(1);
});