import { readFile } from 'node:fs/promises';
import { cpus } from 'node:os';
import { Worker } from 'node:worker_threads';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const kWayMerge = (arrays) => {
  const result = [];
  const indexes = new Array(arrays.length).fill(0);

  while (true) {
    let min = Infinity;
    let minIndex = -1;

    for (let i = 0; i < arrays.length; i++) {
      if (indexes[i] < arrays[i].length) {
        const value = arrays[i][indexes[i]];
        if (value < min) {
          min = value;
          minIndex = i;
        }
      }
    }

    if (minIndex === -1) break;

    result.push(min);
    indexes[minIndex]++;
  }

  return result;
};


const main = async () => {
   const file = await readFile(path.join('data.json'), 'utf8');
  const data = JSON.parse(file);

  const cores = cpus().length;
  const chunkSize = Math.ceil(data.length / cores);

  const chunks = [];
  for (let i = 0; i < cores; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    chunks.push(data.slice(start, end));
  }

  const workers = [];
  const results = new Array(chunks.length);

  const promises = chunks.map((chunk, index) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, 'worker.js'));

      workers.push(worker);

      worker.postMessage(chunk);

      worker.on('message', (sortedChunk) => {
        results[index] = sortedChunk; 
        resolve();
      });

      worker.on('error', reject);
    });
  });

  await Promise.all(promises);

  const merged = kWayMerge(results);

  console.log(merged);
};

await main();
