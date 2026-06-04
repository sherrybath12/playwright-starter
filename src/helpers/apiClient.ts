import { APIRequestContext } from '@playwright/test';

export class ApiClient {
  constructor(private request: APIRequestContext) {}

  async get(url: string) {
    const response = await this.request.get(url);
    return { status: response.status(), body: await response.json() };
  }

  async post(url: string, data: Record<string, unknown>) {
    const response = await this.request.post(url, { data });
    return { status: response.status(), body: await response.json() };
  }
}
