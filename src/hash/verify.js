import crypto from "node:crypto";
import { pipeline } from "node:stream/promises";
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";

const verify = async () => {
  // Программа будет ожидать файл checksums в корне => этот файл стоит рядом с .gitignore
  // Если файлов не существует то также будет ошибка.

  try {
    await fs.access('checksums.json', fs.constants.F_OK);
  } catch {
    throw new Error('FS operation failed');
  }

  const checksumsFile = await fs.readFile('checksums.json', 'utf8');
  const checksums = JSON.parse(checksumsFile);
  const files = Object.keys(checksums);
  
  files.forEach(async value => {
    try {
      await fs.access(value, fs.constants.F_OK);
    } catch { 
      throw new Error('FS operation failed');
    }
  });

  files.forEach(async value => {
    const readStream = createReadStream(value);
    const hash = crypto.createHash('sha256');
    await pipeline(readStream, hash);

    let status = hash.digest('hex') === checksums[value] ? 'OK' : 'FAIL';
    console.log(`${value} - ${status}`);
  });
  
};

await verify();
