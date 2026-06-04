import http from 'k6/http';
import { check, sleep } from 'k6';

// Ramped load test with latency/error thresholds.
// Run: k6 run backend/load/load.js
export const options = {
  stages: [
    { duration: '20s', target: 20 },
    { duration: '40s', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:8080';

export default function () {
  const res = http.get(`${BASE}/api/health`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
