const progress = () => {
  const args = process.argv.slice(2);
  const getArg = (name, defaultValue) => {
    const index = args.indexOf(name);
    return index !== -1 ? args[index + 1] : defaultValue;
  };

  const duration = parseInt(getArg("--duration", 5000));
  const interval = parseInt(getArg("--interval", 100));
  const length = parseInt(getArg("--length", 30));
  const color = getArg("--color", null);
  let colorprefix = '';

  if (color && /^#[0-9A-Fa-f]{6}$/.test(color)) {
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);
    colorprefix = `\x1b[38;2;${r};${g};${b}m`;
  }

  const totalSteps = Math.ceil(duration / interval);
  const stepDelay = Math.floor(duration / totalSteps);

  for (let step = 0; step <= totalSteps; step++) {
    const ratio = step / totalSteps;
    const percent = Math.round(ratio * 100);
    const filledLength = Math.round(ratio * length);

    const fBar = '█'.repeat(filledLength);
    const emptyBar = ' '.repeat(length - filledLength);

    process.stdout.write(`\r[${colorprefix}${fBar}\x1b[0m${emptyBar}] ${percent}%`);

    if (step < totalSteps) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, stepDelay);
    }
  }

  process.stdout.write('\nDone!\n');
};

progress();
