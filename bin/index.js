#!/usr/bin/env node

const lib = require("../lib");
const directory = require("../lib/directory");

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
  const mapping = {
    "-i": inputKey,
    "--input": inputKey,
    "-m": mapKey,
    "--maps": mapKey,
    "-o": outputKey,
    "--output": outputKey
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

  return results;
}

const args = parseArgs();
console.log(" args", args);

if (args.input) {
  directory.getDirectoryContents(args.input).then(console.log);
}
