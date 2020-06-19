const fs = require("fs");

function readFile(file) {
  // should probably switch to readline
  return new Promise((resolve, reject) => {
    fs.readFile(file.path, "utf-8", (error, data) => {
      if (error) {
        return reject(error);
      }
      resolve(data);
    });
  });
}

function parseArea(area, lines, i) {
  while (lines[i] && lines[i].trim()) {
    let line = lines[i++];
    line = line.replace("~", "");

    if (/\.are/.test(line)) {
      continue;
    }

    if (/{.+}/.test(line)) {
      area.listing = line;
      continue;
    }

    if (/[0-9]+ [0-9]+/.test(line)) {
      area.range = line;
      continue;
    }

    area.name = line;
  }

  return i;
}

function parseData(data) {
  const area = {};
  const lines = data.split("\n");
  const length = lines.length;
  for (let i = 0; i < length; i++) {
    let line = lines[i];

    if (/#AREA/i.test(line)) {
      i = parseArea(area, lines, i + 1);
    }
  }

  return area;
}

async function generateMap(file) {
  const data = await readFile(file);
  const area = parseData(data);

  process.send({
    key: file.name,
    payload: area
  });
}

module.exports = {
  generateMap
};
