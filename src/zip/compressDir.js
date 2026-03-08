import fs from "node:fs/promises";
import { createReadStream, createWriteStream, existsSync } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { createBrotliCompress } from "node:zlib";

const compressDir = async () => {
  const toCompressDirPath = path.resolve("workspace", "toCompress");
  const compressedDirPath = path.resolve("workspace", "compressed");
  const archivePath = path.join(compressedDirPath, "archive.br");

  if (!existsSync(toCompressDirPath)) {
    throw new Error("FS operation failed");
  }

  await fs.mkdir(compressedDirPath, { recursive: true });

  async function* getFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        yield* getFiles(fullPath);
      } else {
        yield fullPath;
      }
    }
  }

  const sourceStream = Readable.from(
    (async function* () {
      for await (const filePath of getFiles(toCompressDirPath)) {
        const relativePath = path.relative(toCompressDirPath, filePath);

        const pathBuffer = Buffer.from(relativePath);
        const pathLenBuffer = Buffer.alloc(4);
        pathLenBuffer.writeUInt32BE(pathBuffer.length);

        const stat = await fs.stat(filePath);
        const sizeBuffer = Buffer.alloc(4);
        sizeBuffer.writeUInt32BE(stat.size);

        yield pathLenBuffer;
        yield pathBuffer;
        yield sizeBuffer;

        yield* createReadStream(filePath);
      }
    })()
  );

  await pipeline(
    sourceStream,
    createBrotliCompress(),
    createWriteStream(archivePath)
  );
};

await compressDir();