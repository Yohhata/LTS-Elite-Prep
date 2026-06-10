// Launcher: changes into the project directory then starts Next.js dev server
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const dir = dirname(fileURLToPath(import.meta.url));
process.chdir(dir);

const next = new URL('./node_modules/.bin/next', import.meta.url).pathname;
const port = process.env.PORT || '3000';
const child = spawn(process.execPath, [next, 'dev', '--port', port], {
  cwd: dir,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' },
});
child.on('exit', code => process.exit(code ?? 0));
