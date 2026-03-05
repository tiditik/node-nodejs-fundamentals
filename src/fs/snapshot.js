import path from 'path';
import fs from 'node:fs/promises';

//  { "path": "file1.txt", "type": "file", "size": 1024, "content": "base64" },
//  { "path": "nested", "type": "directory" }

const snapshot = async () => {
  // Write your code here
  // Recursively scan workspace directory
  // Write snapshot.json with:
  // - rootPath: absolute path to workspace
  // - entries: flat array of relative paths and metadata
  const rootPath = path.resolve('workspace');
  let entries = [];

  try {
    await fs.access(rootPath);
  } catch {
    throw new Error("FS Operation failed");
  }

  const dir = await fs.opendir(rootPath, { recursive: true });
  for await (const dirent of dir) {
    const relativePath = path.relative(rootPath, path.join(dirent.parentPath, dirent.name));
    const type = dirent.isFile() ? 'file' : 'directory';

    if (type === 'file') {
      const fullPath = path.join(dirent.parentPath, dirent.name);
      const stats = await fs.stat(fullPath);

      const fileContent = await fs.readFile(fullPath);
      const base64content = fileContent.toString('base64');

      entries.push({
        path: relativePath,
        type: 'file',
        size: stats.size,
        content: base64content
      });
    } else {
      entries.push({
        path: relativePath,
        type: 'directory'
      });
    }
  }

  const snapshot = { rootPath, entries };
  await fs.writeFile(
    path.join(rootPath, 'snapshot.json'),
    JSON.stringify(snapshot, null, 2)
  );
};

await snapshot();
