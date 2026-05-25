import { resolve } from 'path';

const workspaceRoot = resolve(new URL('..', import.meta.url).pathname);
const initCwd = process.env.INIT_CWD ? resolve(process.env.INIT_CWD) : process.cwd();

if (initCwd !== workspaceRoot) {
  console.error('');
  console.error('Root-only workflow violation.');
  console.error(`Run "pnpm install" only from: ${workspaceRoot}`);
  console.error(`Current install origin: ${initCwd}`);
  console.error('');
  process.exit(1);
}
