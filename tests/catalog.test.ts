import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { DEMO_PRODUCTS, RETIRED_DEMO_PRODUCTS } from '../src/data/demo-catalog';
import { SPORTS_CATEGORIES } from '../src/lib/categories';

test('every sport has five distinct demo products with unique, valid generated image assets and SKUs', async () => {
  assert.equal(DEMO_PRODUCTS.length, SPORTS_CATEGORIES.length * 5);
  assert.deepEqual([...new Set(DEMO_PRODUCTS.map(p => p.category))].sort(), [...SPORTS_CATEGORIES].sort());
  assert(RETIRED_DEMO_PRODUCTS.every(retired => !DEMO_PRODUCTS.some(product => product.id === retired.id)), 'Retired bat IDs cannot be reused for different equipment.');
  for (const category of SPORTS_CATEGORIES) {
    const products = DEMO_PRODUCTS.filter(p => p.category === category);
    assert.equal(products.length, 5, category);
    assert(products.some(p => p.type === 'new'), `${category}: new gear`);
    assert(products.some(p => p.type === 'preowned'), `${category}: pre-owned gear`);
  }
  for (const values of [DEMO_PRODUCTS.map(p => p.id), DEMO_PRODUCTS.map(p => p.imageUrls[0]), DEMO_PRODUCTS.map(p => p.specs.SKU)]) assert.equal(new Set(values).size, DEMO_PRODUCTS.length);
  const hashes = await Promise.all(DEMO_PRODUCTS.map(async product => {
    const file = await readFile(path.join(process.cwd(), 'public', product.imageUrls[0]));
    const metadata = await sharp(file).metadata();
    assert.equal(metadata.format, 'webp', product.name);
    assert.equal(metadata.width, 720, product.name);
    assert.equal(metadata.height, 720, product.name);
    return createHash('sha256').update(file).digest('hex');
  }));
  assert.equal(new Set(hashes).size, DEMO_PRODUCTS.length, 'Every product needs its own exported image.');
});
