import { test, expect } from '@playwright/test';
import { ApiClient } from '../../src/helpers/apiClient';

const BASE = 'https://jsonplaceholder.typicode.com';

test.describe('JSONPlaceholder API (via ApiClient)', () => {
  test('GET /posts returns 100 posts', async ({ request }) => {
    const api = new ApiClient(request);
    const { status, body } = await api.get(`${BASE}/posts`);
    expect(status).toBe(200);
    expect(body).toHaveLength(100);
  });

  test('GET /posts/1 returns correct post', async ({ request }) => {
    const api = new ApiClient(request);
    const { status, body } = await api.get(`${BASE}/posts/1`);
    expect(status).toBe(200);
    expect(body).toMatchObject({ id: 1, userId: 1 });
    expect(body.title).toBeTruthy();
  });

  test('POST /posts creates a resource', async ({ request }) => {
    const api = new ApiClient(request);
    const { status, body } = await api.post(`${BASE}/posts`, { title: 'Test post', body: 'Hello', userId: 1 });
    expect(status).toBe(201);
    expect(body.id).toBeDefined();
  });
});
