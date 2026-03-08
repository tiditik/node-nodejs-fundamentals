import path from 'path';
import fs from 'node:fs/promises';
import { argv } from 'node:process';

const merge = async () => {
  // Write your code here
  // Default: read all .txt files from workspace/parts in alphabetical order
  // Optional: support --files filename1,filename2,... to merge specific files in provided order
  // Concatenate content and write to workspace/merged.txt
  const partsDir = path.resolve('workspace', 'parts');
  const outputFile = path.resolve('workspace', 'merged.txt');

  try {
    try {
      await fs.access(partsDir);
    } catch {
      throw new Error("FS Operation failed");
    }

    let filesToMerge = [];

    const filesFlagIndex = argv.indexOf('--files');

    if (filesFlagIndex !== -1 && argv[filesFlagIndex+1]) {
      filesToMerge = argv[filesFlagIndex+1].split(',');

      for (const file of filesToMerge) {
        await fs.access(path.resolve(partsDir, file), fs.constants.F_OK);
      }
    } else {
      const allFiles = await fs.readdir(partsDir);
      filesToMerge = allFiles.filter(file => file.endsWith('.txt')).sort();
      if (filesToMerge.length === 0) throw new Error("FS operation failed");
    }

    const contents = await Promise.all(filesToMerge.map(file => fs.readFile(path.resolve(partsDir, file), 'utf8')));

    await fs.writeFile(outputFile, contents.join(''));
  }
  catch (err) {
    throw err;
  }
};

await merge();
