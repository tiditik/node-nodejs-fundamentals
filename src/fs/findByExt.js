import fs from 'node:fs/promises';
import path from 'node:path';
import { argv } from 'node:process';

const findByExt = async () => {
  const rootPath = path.resolve('workspace');
  let entries = [];
  let extension = '.txt';


  try {
    await fs.access(rootPath);
  } catch {
    throw new Error('FS operation failed');
  }

  const extIndex = argv.indexOf('--ext');
  if (extIndex !== -1 && argv[extIndex + 1]) {
    const rawExt = argv[extIndex + 1];
    extension = rawExt.startsWith('.') ? rawExt : '.' + rawExt;
  }

  const files = await fs.readdir(rootPath, { withFileTypes: true, recursive: true });
  for (const file of files) {
    if (!file.isDirectory()) {
      const relativePath = path.relative(rootPath, path.join(file.parentPath, file.name)); // Пути файлов.
      const fullPath = path.join(rootPath, relativePath);

      if (path.extname(fullPath) === extension) {
        entries.push(relativePath);
      }
    }
  }

  entries = entries.sort((a, b) => a.localeCompare(b));
  entries.forEach(value => console.log(value));

};

await findByExt();
