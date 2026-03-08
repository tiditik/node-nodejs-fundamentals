import fs, { read } from "node:fs";
import readline from 'node:readline';

const split = async () => {
  const sourceFilepath = 'source.txt';

  if (!fs.existsSync(sourceFilepath)) {
    process.exit(-1);
  }
  
  const linesArgIndex = process.argv.indexOf('--lines');
  const linesChunk = linesArgIndex !== -1 ? parseInt(process.argv[linesArgIndex+1], 10) : 10;

  if (isNaN(linesChunk) || linesChunk <= 0) {
    process.exit(-1);
  }

  const fileReadStream = fs.createReadStream(sourceFilepath);

  const rl = readline.createInterface({
    input: fileReadStream,
    crlfDelay: Infinity
  });

  let lineCounter = 0;
  let chunkCounter = 1;
  let currentWriteStream = null;

  const createNewChunk = () => {
    if (currentWriteStream) {
      currentWriteStream.end();
    }
    const chunkFileName = `chunk_${chunkCounter}.txt`;
    currentWriteStream = fs.createWriteStream(chunkFileName);
    
    chunkCounter++;
    lineCounter = 0;
  };

  for await (const line of rl) {
    if (currentWriteStream === null || lineCounter >= linesChunk) {
      createNewChunk();
    }
    
    currentWriteStream.write(line + '\n');
    lineCounter++;
  }

  if (currentWriteStream) {
    currentWriteStream.end();
  }
  
};

await split();
