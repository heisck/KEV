import http from 'k6/http';
import { check } from 'k6';

// Quick smoke check of the public health endpoint.
// Run: k6 run backend/load/smoke.js  (set BASE_URL to target a deployed env)
export const options = { vus: 1, iterations: 1 };

const BASE = __ENV.BASE_URL || 'http://localhost:8080';

export default function () {
  const res = http.get(`${BASE}/api/health`);
  check(res, { 'status is 200': (r) => r.status === 200 });
}
