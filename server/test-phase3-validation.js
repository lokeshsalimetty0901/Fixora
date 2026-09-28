const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fixora_super_secret_jwt_token_key_change_in_production_2026';

// Generate test tokens
const customerToken = jwt.sign(
  { id: '11111111-1111-1111-1111-111111111111', email: 'customer@fixora.com', role: 'CUSTOMER' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const proToken = jwt.sign(
  { id: '22222222-2222-2222-2222-222222222222', email: 'pro@fixora.com', role: 'PROFESSIONAL' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (body) headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(
      {
        host: 'localhost',
        port: 5000,
        path,
        method,
        headers,
      },
      (res) => {
        let resData = '';
        res.on('data', (chunk) => (resData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(resData) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: resData });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (body) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('--- RUNNING PHASE 3 AUTOMATED API VALIDATION TESTS ---\n');
  let passed = 0;
  let total = 0;

  // Test 1: Health Check
  total++;
  try {
    const res = await request('GET', '/health');
    if (res.status === 200 && res.body.status === 'OK') {
      console.log('✅ TEST 1 PASSED: Server health endpoint returns status 200 OK');
      passed++;
    } else {
      console.log('❌ TEST 1 FAILED: Unexpected response', res);
    }
  } catch (err) {
    console.log('❌ TEST 1 FAILED:', err.message);
  }

  // Test 2: Unauthorized request to /api/bookings
  total++;
  try {
    const res = await request('POST', '/api/bookings', { address: 'Test' });
    if (res.status === 401 && res.body.error && res.body.error.includes('token')) {
      console.log('✅ TEST 2 PASSED: POST /api/bookings blocks unauthenticated requests with 401');
      passed++;
    } else {
      console.log('❌ TEST 2 FAILED:', res);
    }
  } catch (err) {
    console.log('❌ TEST 2 FAILED:', err.message);
  }

  // Test 3: Professional role trying to create a customer booking
  total++;
  try {
    const res = await request('POST', '/api/bookings', { address: 'Test' }, proToken);
    if (res.status === 403 && res.body.error && res.body.error.includes('Only customer accounts')) {
      console.log('✅ TEST 3 PASSED: Role authorization blocks PROFESSIONAL role with 403 Forbidden');
      passed++;
    } else {
      console.log('❌ TEST 3 FAILED:', res);
    }
  } catch (err) {
    console.log('❌ TEST 3 FAILED:', err.message);
  }

  // Test 4: Missing required fields (Customer Token)
  total++;
  try {
    const res = await request('POST', '/api/bookings', {}, customerToken);
    if (res.status === 400 && res.body.error) {
      console.log('✅ TEST 4 PASSED: Missing required fields rejected with 400 Bad Request:', res.body.error);
      passed++;
    } else {
      console.log('❌ TEST 4 FAILED:', res);
    }
  } catch (err) {
    console.log('❌ TEST 4 FAILED:', err.message);
  }

  // Test 5: Invalid date format
  total++;
  try {
    const res = await request(
      'POST',
      '/api/bookings',
      {
        professionalId: 'some-pro-id',
        serviceId: 'some-service-id',
        address: '123 Test St, NY',
        scheduledDate: 'not-a-date',
        scheduledTime: '10:00 AM',
      },
      customerToken
    );
    if (res.status === 400 && res.body.error && res.body.error.includes('date format')) {
      console.log('✅ TEST 5 PASSED: Invalid date format rejected with 400 Bad Request');
      passed++;
    } else {
      console.log('❌ TEST 5 FAILED:', res);
    }
  } catch (err) {
    console.log('❌ TEST 5 FAILED:', err.message);
  }

  console.log(`\nRESULTS: ${passed} of ${total} security, routing, and validation tests PASSED.`);
}

runTests();
