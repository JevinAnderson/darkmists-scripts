const child_process = require("child_process");
const args = require("./args");
const path = require("path");
const maps = require("./maps/index");

const { fork } = child_process;

function createWorkers(max) {
  const workers = {};

  for (let i = 0; i < Math.min(max, args.processes); i++) {
    workers[`${i}`] = fork(path.resolve(__dirname, "worker.js"));
  }

  return workers;
}

function createMaps(files = []) {
  return new Promise((resolve, reject) => {
    if (!files.length) {
      return resolve({});
    }

    const results = {};
    const workers = createWorkers(files.length);
    Object.keys(workers).forEach((index) => {
      const worker = workers[index];

      const file = files.shift();

      worker.send({ file, task: "map", output: args.output });
      worker.on("message", (message) => {
        const { key, payload, error } = message;
        if (error) {
          console.log(`Error mapping file: `, error);
        } else {
          results[key] = payload;
        }

        const file = files.shift();
        if (file) {
          worker.send({ file, task: "map", output: args.output });
        } else {
          worker.disconnect();
          delete workers[`${index}`];

          if (Object.keys(workers).length === 0) {
            maps
              .generateAreaTOC(results, args.output)
              .then(resolve)
              .catch(reject);
          }
        }
      });
    });
  });
}

module.exports = {
  createMaps
};
