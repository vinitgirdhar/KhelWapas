import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { isStoredUploadPath, storeImages } from '../src/server/uploads';

test('durable upload paths only accept server-generated image locations', () => {
  assert.equal(isStoredUploadPath(`/uploads/products/${randomUUID()}.webp`), true);
  assert.equal(isStoredUploadPath(`/uploads/profile/${randomUUID()}.webp`), true);
  for (const path of ['/uploads/products/../../schema.prisma', '/uploads/products/not-a-uuid.webp', '/uploads/admin/file.webp', '/uploads/products/%2e%2e.webp']) {
    assert.equal(isStoredUploadPath(path), false);
  }
});

test('image validation rejects spoofed files before durable writes', async () => {
  await assert.rejects(storeImages([new File(['<script>bad</script>'], 'fake.webp', { type: 'image/webp' })], 'products'), /could not be read/);
  await assert.rejects(storeImages([], 'products', 3), /Upload 3/);
});
