import path from 'path';
import fs from 'node:fs/promises';

const restore = async () => {
  // Write your code here
  // Read snapshot.json
  // Treat snapshot.rootPath as metadata only
  // Recreate directory/file structure in workspace_restored
  const snapshotPath = path.resolve('workspace', 'snapshot.json');
  const restorePath = path.resolve('workspace_restored');

  try {
    try {
      await fs.access(snapshotPath);
    } catch {
      throw new Error("FS Operation failed");
    }

    try {
      await fs.access(restorePath);
      throw new Error("FS Operation failed");
    } catch (err) {
      if (err.message === "FS Operation failed") throw err;
    }

    const snapshotFile = await fs.readFile(snapshotPath, 'utf8');
    const snapshot = JSON.parse(snapshotFile);

    await fs.mkdir(restorePath, { recursive: true });

    for (const entry of snapshot.entries) {
      const entrypath = path.join(restorePath, entry.path);

      if (entry.type === 'directory') {
        await fs.mkdir(entrypath, { recursive: true });
      } else if (entry.type === 'file') {
        const parentDir = path.dirname(entrypath);
        await fs.mkdir(parentDir, { recursive: true });

        const fileContent = Buffer.from(entry.content, 'base64');
        await fs.writeFile(entrypath, fileContent);
      }
    }
  } catch (err) {
    throw err;
  }
};

await restore();
