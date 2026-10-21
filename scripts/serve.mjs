import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(projectRoot, 'dist');
const host = '127.0.0.1';
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'], ['.mjs', 'text/javascript; charset=utf-8'],
  ['.svg', 'image/svg+xml'], ['.png', 'image/png'], ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'], ['.webp', 'image/webp'], ['.avif', 'image/avif'],
  ['.gif', 'image/gif'], ['.ico', 'image/x-icon'], ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'], ['.ttf', 'font/ttf'], ['.txt', 'text/plain; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
]);
const internalSegments = new Set(['docs', 'src', 'scripts', 'node_modules', 'content-sources.md',
  'readme.md', 'agents.md', 'skills-lock.json', 'package.json', 'package-lock.json']);

function usage() {
  console.log('用法：node scripts/serve.mjs [--port 4173]');
  console.log('仅预览 dist，监听地址固定为 127.0.0.1。');
}

let port = 4173;
const args = process.argv.slice(2);
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === '--help' || args[index] === '-h') {
    usage();
    process.exit(0);
  }
  let value;
  if (args[index] === '--port') value = args[++index];
  else if (args[index].startsWith('--port=')) value = args[index].slice(7);
  else {
    console.error(`未知参数：${args[index]}`);
    usage();
    process.exit(1);
  }
  if (!value || !/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 65535) {
    console.error('端口必须是 1 至 65535 之间的整数。');
    process.exit(1);
  }
  port = Number(value);
}

function withinRoot(candidate) {
  const relative = path.relative(publicRoot, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

async function resolvePublicFile(candidate) {
  if (!withinRoot(candidate)) return null;
  try {
    const actualPath = await fs.promises.realpath(candidate);
    if (!withinRoot(actualPath)) return null;
    const stats = await fs.promises.stat(actualPath);
    if (!stats.isFile() || !mimeTypes.has(path.extname(actualPath).toLowerCase())) return null;
    return { path: actualPath, stats };
  } catch (error) {
    if (['ENOENT', 'ENOTDIR', 'EACCES', 'EPERM'].includes(error.code)) return null;
    throw error;
  }
}

function requestPath(requestUrl) {
  if (!requestUrl?.startsWith('/')) return { status: 400 };
  const rawPath = requestUrl.split('?')[0];
  let decoded;
  try { decoded = decodeURIComponent(rawPath); } catch { return { status: 400 }; }
  if (/[\\%\x00-\x1f\x7f#]/.test(decoded)) return { status: 404 };
  const segments = decoded.split('/').filter(Boolean);
  if (segments.some((segment) => segment.startsWith('.') || segment.includes(':')
    || internalSegments.has(segment.toLowerCase()))) return { status: 404 };
  if (decoded === '/') return { path: path.join(publicRoot, 'index.html') };
  return { path: path.resolve(publicRoot, `.${decoded}`) };
}

try {
  const rootStats = await fs.promises.lstat(publicRoot);
  if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) throw new Error('dist 必须是实际目录。');
  await fs.promises.access(path.join(publicRoot, 'index.html'));
  await fs.promises.access(path.join(publicRoot, '404.html'));
} catch {
  console.error('未找到可预览的 dist/index.html 与 dist/404.html。请先运行 node scripts/build.mjs。');
  process.exit(1);
}

const server = http.createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('仅支持 GET 与 HEAD。');
    return;
  }
  try {
    const route = requestPath(request.url);
    let status = route.status || 200;
    let file = route.path ? await resolvePublicFile(route.path) : null;
    if (!file) {
      if (status === 200) status = 404;
      file = await resolvePublicFile(path.join(publicRoot, '404.html'));
    }
    if (!file) {
      response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : '页面未找到。请返回首页。');
      return;
    }
    response.writeHead(status, {
      'Content-Type': mimeTypes.get(path.extname(file.path).toLowerCase()),
      'Content-Length': file.stats.size,
    });
    if (request.method === 'HEAD') response.end();
    else {
      const stream = fs.createReadStream(file.path);
      stream.on('error', () => response.destroy());
      stream.pipe(response);
    }
  } catch (error) {
    console.error(`预览请求失败：${error.message}`);
    if (!response.headersSent) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('预览服务暂时无法读取文件。');
    } else response.destroy();
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') console.error(`端口 ${port} 已被占用，请通过 --port 指定其他端口。`);
  else console.error(`预览服务未能启动：${error.message}`);
  process.exitCode = 1;
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close((error) => { if (error) process.exitCode = 1; });
  server.closeIdleConnections?.();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
server.listen(port, host, () => console.log(`Local: http://${host}:${port}/`));
