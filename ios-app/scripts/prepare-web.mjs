import { cp, mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(app, '..');
const web = path.join(app, 'Web');
await mkdir(path.join(web, 'life'), { recursive: true });
await mkdir(path.join(web, 'thuchi'), { recursive: true });
// Explicit allowlist: never bundle personal backups, tokens or git history.
for (const name of ['index.html', 'assets', 'js', 'vendor']) {
  await cp(path.join(repo, name), path.join(web, 'life', name), { recursive: true });
}
await cp(path.join(app, 'Sources', 'thuchi', 'index.html'), path.join(web, 'thuchi', 'index.html'));
await cp(path.join(app, 'Sources', 'thuchi', 'beerich-icon.png'), path.join(web, 'thuchi', 'beerich-icon.png'));
for (const section of ['life', 'thuchi']) {
  const dest = path.join(web, section);
  let html = await readFile(path.join(dest, 'index.html'), 'utf8');
  html = html.replace('<html lang="vi">', '<html lang="vi" class="native-app">');
  html = html.replace('</head>', '<link rel="stylesheet" href="native-theme.css">\n<script defer src="native-bridge.js"></script>\n</head>');
  if (section === 'thuchi') {
    html = html.replace('function exportBackup(){', 'function exportBackup(){if(window.KhaiNative){window.KhaiNative.shareBlob("khairich-backup-"+new Date().toISOString().slice(0,10)+".json",new Blob([JSON.stringify({app:"KhaiRich",version:2,finances},null,2)],{type:"application/json"}));return;}');
  }
  await writeFile(path.join(dest, 'index.html'), html);
  await cp(path.join(app, 'theme', section + '.css'), path.join(dest, 'native-theme.css'));
  await cp(path.join(app, 'scripts', 'native-bridge.js'), path.join(dest, 'native-bridge.js'));
}
for (const file of ['js/core/theme.js', 'js/features/settings.js']) {
  const target = path.join(web, 'life', file);
  let source = await readFile(target, 'utf8');
  source = source.replaceAll('assets/icons/logo.svg', 'assets/icons/logo.png');
  source = source.replace('Đưa KhaiLife lên điện thoại', 'KhaiLife trên iPhone')
    .replace('Mở website bằng Safari trên iPhone → Chia sẻ → Thêm vào Màn hình chính. Để dùng dữ liệu trên thiết bị khác, nhập bản sao lưu hoặc tải từ GitHub.', 'Dùng hai mục KhaiLife và Thu chi ở cuối màn hình để chuyển không gian. Để lấy dữ liệu từ bản web, nhập bản sao lưu JSON hoặc tải từ GitHub. Xuất bản sao lưu để lưu vào Tệp trên iPhone.')
    .replaceAll('trình duyệt hiện tại', 'ứng dụng này').replaceAll('trình duyệt này', 'thiết bị này');
  await writeFile(target, source);
}
// Catch missing bundled local dependencies at build time.
for (const section of ['life', 'thuchi']) {
  const html = await readFile(path.join(web, section, 'index.html'), 'utf8');
  for (const [, ref] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (/^(https?:|data:|mailto:)/.test(ref)) continue;
    await readFile(path.join(web, section, ref));
  }
}
console.log('Prepared offline Life + Thu chi web bundle (personal backups excluded).');
