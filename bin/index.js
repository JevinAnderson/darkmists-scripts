#!/usr/bin/env node

const lib = require("../lib");
const args = require("../lib/args");

console.log(" args", args.raw);

const tasks = [];

if (args.maps) {
  if (!args.input || !args.output) {
    console.log(
      "You need to provide an input(-i, --input) and output(-o, --output) directory in order to generate maps."
    );
    process.exit();
  }

  tasks.push(lib.createMaps());
}

Promise.all(tasks)
  .then((results) => {
    console.log("Tasks completed: results", JSON.stringify(results, null, 2));
  })
  .catch(console.error)
  .then(process.exit);
