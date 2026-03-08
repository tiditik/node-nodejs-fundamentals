import stream from "node:stream";

const lineNumberer = () => {
  // Почемуто не работает если запускать через npm scripts
  
  let lineCount = 1;
  let buffer = '';

  const transform = new stream.Transform({
    transform (chunk, encoding, callback) {
      buffer += chunk.toString();
      const lines = buffer.split(/\n|\\n/);
      buffer = lines.pop();

      for (const line of lines) {
        this.push(`${lineCount++} | ${line}\n`);
      }

      callback();
    },
    flush(callback) {
      if (buffer.length > 0) {
        this.push(`${lineCount++} | ${buffer}\n`);
      }
      callback();
    }
  });
  process.stdin.pipe(transform).pipe(process.stdout);
  
};

lineNumberer();
