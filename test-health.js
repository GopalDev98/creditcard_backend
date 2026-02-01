#!/usr/bin/env node

/**
 * Health Check Test Script
 * Tests the /api/ping and /api/health endpoints
 */

import http from 'http';

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        try {
          const json = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            responseTime,
            data: json,
          });
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testEndpoint(name, path, expectedStatus = 200) {
  console.log(`\n${colors.cyan}Testing ${name}...${colors.reset}`);
  console.log(`URL: http://${HOST}:${PORT}${path}`);
  
  try {
    const result = await makeRequest(path);
    
    const statusColor = result.statusCode === expectedStatus ? colors.green : colors.red;
    console.log(`${statusColor}Status: ${result.statusCode}${colors.reset}`);
    console.log(`${colors.yellow}Response Time: ${result.responseTime}ms${colors.reset}`);
    
    if (result.data.success) {
      console.log(`${colors.green}✓ Success: ${result.data.message}${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Failed: ${result.data.message}${colors.reset}`);
    }
    
    // Display additional info for health endpoint
    if (path === '/api/health' && result.data.database) {
      const dbColor = result.data.database.status === 'connected' ? colors.green : colors.red;
      console.log(`${dbColor}Database: ${result.data.database.status}${colors.reset}`);
      if (result.data.uptime) {
        console.log(`Uptime: ${result.data.uptime}`);
      }
      if (result.data.memory) {
        console.log(`Memory: ${result.data.memory.used} / ${result.data.memory.total}`);
      }
    }
    
    return result.statusCode === expectedStatus;
  } catch (error) {
    console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
    return false;
  }
}

async function runTests() {
  console.log(`${colors.cyan}==================================${colors.reset}`);
  console.log(`${colors.cyan}  Health Check Endpoint Tests${colors.reset}`);
  console.log(`${colors.cyan}==================================${colors.reset}`);
  
  const results = [];
  
  // Test ping endpoint
  results.push(await testEndpoint('Ping Endpoint', '/api/ping', 200));
  
  // Test health endpoint
  results.push(await testEndpoint('Health Check Endpoint', '/api/health', 200));
  
  // Test root endpoint
  results.push(await testEndpoint('Root Endpoint', '/', 200));
  
  // Summary
  console.log(`\n${colors.cyan}==================================${colors.reset}`);
  console.log(`${colors.cyan}  Test Summary${colors.reset}`);
  console.log(`${colors.cyan}==================================${colors.reset}`);
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  const failed = total - passed;
  
  console.log(`Total Tests: ${total}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  if (failed > 0) {
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  }
  
  if (passed === total) {
    console.log(`\n${colors.green}✓ All health checks passed!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}✗ Some health checks failed!${colors.reset}`);
    process.exit(1);
  }
}

// Check if server is running
console.log(`Checking server at http://${HOST}:${PORT}...`);
runTests().catch((error) => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  console.log(`\n${colors.yellow}Make sure the server is running:${colors.reset}`);
  console.log(`  npm run dev`);
  process.exit(1);
});
