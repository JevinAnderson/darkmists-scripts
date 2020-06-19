const os = require("os");
const { result } = require("lodash");

function parseArgs() {
  const results = {};
  const args = process.argv.slice(2);
  const inputKey = {
    hasValue: true,
    key: "input"
  };
  const mapKey = {
    key: "maps"
  };
  const outputKey = {
    hasValue: true,
    key: "output"
  };
  const processKey = {
    hasValue: true,
    key: "processes"
  };
  const mapping = {
    "-i": inputKey,
    "--input": inputKey,
    "-m": mapKey,
    "--maps": mapKey,
    "-o": outputKey,
    "--output": outputKey,
    "-p": processKey,
    "--processes": processKey
  };

  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    let [key, value] = arg.split("=");
    const details = mapping[key];
    if (!details) {
      continue;
    }

    key = details.key;

    if (!details.hasValue) {
      results[key] = true;
      continue;
    }

    value = value || args[++i];

    if (!value) {
      console.log(
        `\n${
          args[i - 1]
        }: ${key} argument requires a value. Pass a value with '=' or ' ' characters.\n`
      );
      process.exit();
    }

    results[key] = value;
  }

  results.maps = Boolean(results.maps);

  const cpuCount = Math.max(1, os.cpus().length - 1);
  if (results.processes) {
    let processes = results.processes;
    try {
      processes = parseInt(processes, 10);
      if (isNaN(processes) || processes < 1) {
        throw Error("bad input");
      }
    } catch (error) {
      console.log(
        "-p, --processes: Processes argument must be an integer value > 0"
      );
    }
    results.processes = Math.min(cpuCount, processes);
  } else {
    results.processes = cpuCount;
  }

  return results;
}

const args = parseArgs();

module.exports = {
  get maps() {
    return args.maps;
  },
  get input() {
    return args.input;
  },
  get output() {
    return args.output;
  },
  get processes() {
    return args.processes;
  },
  get raw() {
    return { ...args };
  }
};
