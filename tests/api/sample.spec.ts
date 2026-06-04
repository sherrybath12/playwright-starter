import { test, expect } from '@playwright/test';

test.describe('JSONPlaceholder API', () => {
  test('GET /posts returns 100 posts', async ({ request }) => {
    const response = await request.get('https://jsonplaceholder.typicode.com/posts');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveLength(100);
  });

  test('GET /posts/1 returns correct post', async ({ request }) => {
    const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ id: 1, userId: 1 });
    expect(body.title).toBeTruthy();
  });

  test('POST /posts creates a resource', async ({ request }) => {
    const response = await request.post('https://jsonplaceholder.typicode.com/posts', {
      data: { title: 'Test post', body: 'Hello', userId: 1 },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.id).toBeDefined();
  });
});
