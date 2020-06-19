const maps = require("./maps/index");

process.on("message", (message) => {
  switch (message.task) {
    case "map": {
      maps.generateMap(message.file, message.output);
    }
    default:
  }
});
