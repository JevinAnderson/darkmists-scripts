#!/usr/bin/env node

const lib = require("../lib");

lib.greet().then(console.log).then(process.exit);

function parseArgs() {
  const results = {};
  const args = process.argv.slice(2);
  console.log("pre-parsed args", args);
  const inputKey = {
    hasValue: true,
    key: "input"
  };
  const outputKey = {
    hasValue: true,
    key: "output"
  };
  const mapping = {
    "-i": inputKey,
    "--input": inputKey,
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
