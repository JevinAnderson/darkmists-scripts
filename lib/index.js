const inAMinute = require("./inAMinute");

async function greet() {
  console.log("Hello Ohio!");
  return await inAMinute("Goodbye Ohio... :(");
}

module.exports = { greet };
