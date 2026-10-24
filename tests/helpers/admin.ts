import { expect, request as requestFactory, type APIRequestContext } from '@playwright/test';

let session: Awaited<ReturnType<APIRequestContext['storageState']>> | undefined;

/** Reuse the seeded manager session so unrelated tests do not exhaust login limits. */
export async function adminContext() {
  const api = await requestFactory.newContext({ baseURL: 'http://localhost:9003', ...(session ? { storageState: session } : {}) });
  if (!session) {
    const response = await api.post('/api/admin/login', { data: { email: process.env.DEMO_ADMIN_EMAIL, password: process.env.DEMO_ADMIN_PASSWORD } });
    expect(response.status()).toBe(200);
    session = await api.storageState();
  }
  return api;
}
