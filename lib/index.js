const mkdirp = require("mkdirp");
const path = require("path");
const manager = require("./manager");
const directory = require("./directory");
const args = require("./args");

async function createMaps() {
  await mkdirp(path.resolve(args.output));
  const contents = await directory.getDirectoryContents(args.input);
  const areas = contents.filter((value) => {
    return value.type === "file" && /\.are$/.test(value.name);
  });
  const results = await manager.createMaps(areas);

  return results;
}

module.exports = {
  createMaps
};
