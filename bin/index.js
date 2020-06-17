#!/usr/bin/env node

const lib = require("../lib");

const args = process.argv.slice(2);

console.log("dmscript args", args);
lib.greet().then(console.log).then(process.exit);
