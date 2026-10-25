import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));

function run(binary, args) {
  const result = spawnSync(process.execPath, [resolve(root, 'node_modules', binary), ...args], {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

run('prisma/build/index.js', ['generate', '--schema', 'prisma/postgres/schema.prisma']);
run('next/dist/bin/next', ['build']);
