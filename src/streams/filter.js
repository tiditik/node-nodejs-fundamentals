import stream, { pipeline } from "node:stream";

const filter = () => {
  const patternIndex = process.argv.indexOf('--patern');
  if (patternIndex === -1 || process.argv.length <= patternIndex + 1) {
    process.exit(-1);
  }
  const pattern = process.argv[patternIndex + 1];

  let lastLine = '';

  const filterStream = new stream.Transform({
    transform(chunk, encoding, callback) {
      let data = lastLine + chunk.toString();
      let lines = data.split('\n');
      
      lastLine = lines.pop();

      for (const line of lines) {
        if (line.includes(pattern)) {
          this.push(line + '\n');
        }
      }

      callback();
    },

    flush(callback) {
      if (lastLine && lastLine.includes(pattern)) {
        this.push(lastLine);
      }

      callback();
    }
  });

  process.stdin.pipe(filterStream).pipe(process.stdout);
  
};

filter();
