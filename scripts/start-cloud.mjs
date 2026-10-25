import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
let child;
let stopping = false;

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    stopping = true;
    child?.kill(signal);
  });
}

async function run(binary, args, extraEnv = {}) {
  if (stopping) process.exit(0);
  const code = await new Promise((resolveExit, reject) => {
    child = spawn(process.execPath, [resolve(root, 'node_modules', binary), ...args], {
      cwd: root,
      env: { ...process.env, ...extraEnv },
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', (status, signal) => resolveExit(signal ? 1 : status || 0));
  });
  child = undefined;
  if (stopping) process.exit(0);
  if (code !== 0) process.exit(code);
}

if (!process.env.DATABASE_URL?.startsWith('postgres')) {
  throw new Error('Cloud startup requires a PostgreSQL DATABASE_URL');
}

await run('prisma/build/index.js', ['migrate', 'deploy', '--schema', 'prisma/postgres/schema.prisma']);
if (process.env.SEED_DEMO_DATA === 'true') {
  await run('tsx/dist/cli.mjs', ['prisma/seed.ts'], { SEED_MOCK_PRODUCTS: 'true' });
  await run('tsx/dist/cli.mjs', ['prisma/seed-demo.ts']);
}
await run('next/dist/bin/next', ['start', '--hostname', '0.0.0.0', '--port', process.env.PORT || '10000']);
