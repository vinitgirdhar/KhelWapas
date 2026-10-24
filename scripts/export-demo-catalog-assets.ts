import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { DEMO_PRODUCTS } from '../src/data/demo-catalog';

// Export the independent cells from generated photography production sheets.
// Creative image generation happens in image_gen; this only packages web assets.
async function main() {
  const manifestPath = process.argv[2] || 'artifacts/catalog/sheets.json';
  const sheets = JSON.parse(await readFile(manifestPath, 'utf8')) as { sheet: number; path: string }[];
  const folder = path.join(process.cwd(), 'public/images/demo-catalog');
  await mkdir(folder, { recursive: true });
  let count = 0;
  for (const sheet of sheets) {
    const metadata = await sharp(sheet.path).metadata();
    if (!metadata.width || !metadata.height) throw new Error(`Cannot read image sheet ${sheet.sheet}`);
    for (const product of DEMO_PRODUCTS.filter(product => product.sheet === sheet.sheet)) {
      const column = product.cell % 4, row = Math.floor(product.cell / 4);
      const left = Math.round(column * metadata.width / 4) + 2;
      const top = Math.round(row * metadata.height / 3) + 2;
      const right = Math.round((column + 1) * metadata.width / 4) - 2;
      const bottom = Math.round((row + 1) * metadata.height / 3) - 2;
      await sharp(sheet.path).extract({ left, top, width: right - left, height: bottom - top })
        .resize(720, 720, { fit: 'contain', background: '#f4f3ef' }).webp({ quality: 90, effort: 6 })
        .toFile(path.join(folder, path.basename(product.imageUrls[0])));
      count++;
    }
  }
  console.log(`Exported ${count} individual product images.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
