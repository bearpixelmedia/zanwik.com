#!/usr/bin/env node

const https = require('https');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          console.log('Raw response:', data.substring(0, 500));
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function testApis() {
  console.log('Testing PublicAPIs.dev...');
  try {
    const data = await makeRequest('https://api.publicapis.dev/entries');
    console.log('Type:', typeof data);
    console.log('Keys:', Object.keys(data || {}));
    if (Array.isArray(data)) {
      console.log('Array length:', data.length);
      console.log('First item:', data[0]);
    } else if (data && data.entries) {
      console.log('Entries length:', data.entries.length);
      console.log('First entry:', data.entries[0]);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testApis();
