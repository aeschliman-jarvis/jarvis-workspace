const https = require('https');
const http = require('http');

const PRODUCT_ID = '1c0d3933-36c8-475b-84f6-4d638d8f1032';
const API_URL = `http://localhost:4000/api/products/${PRODUCT_ID}`;

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function updateModel() {
  console.log(`🛠️  Fetching config for Product: ${PRODUCT_ID}`);
  try {
    const data = await getJson(API_URL);
    console.log('✅ Product Found!');
    console.log('Config/Settings:', JSON.stringify(data.config || data.settings || data.llm_config || {}, null, 2).slice(0, 800));
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

updateModel();
