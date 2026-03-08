import fs from "node:fs/promises";
import { createReadStream, createWriteStream, existsSync } from "node:fs";
import path from "node:path";
import { createBrotliDecompress } from "node:zlib";
import { pipeline } from "node:stream/promises";

const decompressDir = async () => {
  const compressedDirPath = path.resolve("workspace", "compressed");
  const archivePath = path.join(compressedDirPath, "archive.br");
  const decompressedDirPath = path.resolve("workspace", "decompressed");

  if (!existsSync(archivePath)) {
    throw new Error("FS operation failed");
  }

  await fs.mkdir(decompressedDirPath, { recursive: true });

  const chunks = [];

  await pipeline(
    createReadStream(archivePath),
    createBrotliDecompress(),
    async function* (source) {
      for await (const chunk of source) {
        chunks.push(chunk);
      }
    }
  );

  const buffer = Buffer.concat(chunks);

  let offset = 0;

  while (offset < buffer.length) {
    const pathLen = buffer.readUInt32BE(offset);
    offset += 4;

    const relativePath = buffer.toString("utf8", offset, offset + pathLen);
    offset += pathLen;

    const fileSize = buffer.readUInt32BE(offset);
    offset += 4;

    const fileData = buffer.slice(offset, offset + fileSize);
    offset += fileSize;

    const fullPath = path.join(decompressedDirPath, relativePath);

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, fileData);
  }
};

await decompressDir();