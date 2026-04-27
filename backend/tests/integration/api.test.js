const request = require('supertest');
const app = require('../../src/app');
// Mock pg pool — no real database needed for integration tests
jest.mock('../../src/db', () => ({
 query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
}));
describe('GET /health', () => {
 test('returns 200 with status ok', async () => {
 const res = await request(app).get('/health');
 expect(res.status).toBe(200);
 expect(res.body.status).toBe('ok');
 expect(res.body.database).toBe('connected');
 });
});
describe('POST /calculate', () => {
 test('valid input returns 200 with correct shape', async () => {
 const res = await request(app)
 .post('/calculate')
 .send({ grossSalary: 10000, years: 5 });
 expect(res.status).toBe(200);
 expect(res.body.bankNet).toBe(6800);
 expect(res.body.wealthProjection).toHaveLength(5);
 });
 test('missing grossSalary returns 400', async () => {
 const res = await request(app).post('/calculate').send({ years: 5 });
 expect(res.status).toBe(400);
 expect(res.body.error).toMatch(/grossSalary/);
 });
 test('years out of range returns 400', async () => {
 const res = await request(app)
 .post('/calculate').send({ grossSalary: 10000, years: 20 });
 expect(res.status).toBe(400);
 });
 test('years defaults to 15 when omitted', async () => {
 const res = await request(app)
 .post('/calculate').send({ grossSalary: 10000 });
 expect(res.status).toBe(200);
 expect(res.body.wealthProjection).toHaveLength(15);
 });
});
