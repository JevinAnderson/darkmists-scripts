const fs = require("fs");
const { resolve } = require("path");

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

function parseRooms(area, lines, i) {
  const bailouts = [
    AREA_R,
    MOBILES_R,
    RESETS_R,
    MOBPROGS_R,
    SPECIALS_R,
    OBJECTS_R,
    SHOPS_R
  ];

  const rooms = {};
  let room;
  let gettingTitle = false;
  let gettingDescription = false;
  let gettingExits = false;
  let exitKey;
  while (!bailouts.some((b) => b.test(lines[i])) && i < lines.length) {
    let line = lines[i++];

    if (/#[0-9]+/.test(line)) {
      room = line.replace("#", "").trim();

      rooms[room] = {
        identifier: room,
        description: "",
        exits: {}
      };
      gettingTitle = true;
      gettingDescription = false;
      gettingExits = false;
      continue;
    }

    if (gettingTitle) {
      rooms[room].title = line.replace("~", "");
      gettingTitle = false;
      gettingDescription = true;
      continue;
    }

    if (gettingDescription) {
      if (/~/.test(line)) {
        gettingDescription = false;
        gettingExits = true;
        continue;
      }
      rooms[room].description += `${line}\n`;
    }

    if (gettingExits) {
      if (/D[0-9]/i.test(line)) {
        exitKey = line.trim().toUpperCase();
        exitKey = DIRECTIONS[exitKey];
      }
      if (/-?[0-9] -?[0-9] [0-9]+/.test(line)) {
        let exitNumber = line.trim().split(" ").pop();
        rooms[room].exits[exitKey] = exitNumber;
      }
    }
  }

  area.rooms = rooms;

  return i;
}

const DIRECTIONS = {
  D0: "north",
  D1: "east",
  D2: "south",
  D3: "west",
  D4: "up",
  D5: "down"
};

const AREA_R = /#AREA/i;
const ROOMS_R = /#ROOMS/i;
const MOBILES_R = /#MOBILES/i;
const RESETS_R = /#RESETS/i;
const MOBPROGS_R = /#MOBPROGS/i;
const SPECIALS_R = /#SPECIALS/i;
const OBJECTS_R = /#OBJECTS/i;
const SHOPS_R = /#SHOPS/i;

function parseData(data) {
  const area = {};
  const lines = data.split("\n");
  const length = lines.length;
  for (let i = 0; i < length; i++) {
    let line = lines[i];

    if (AREA_R.test(line)) {
      i = parseArea(area, lines, i + 1);
    }

    if (ROOMS_R.test(line)) {
      i = parseRooms(area, lines, i + 1);
    }
  }

  return area;
}

function createRoom(room = {}, output) {
  const exits = Object.keys(room.exits)
    .map((key) => {
      return `<p><a href="/${room.exits[key]}.html">${key}</a></p><br />`;
    })
    .join("");

  const content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${room.title}</title>
</head>
<body>
  <h1>${room.title}</h2>
  <pre>${room.description}</pre>
  <br />
  ${exits}

</body>
</html>
`;

  const target = resolve(output, `${room.identifier}.html`);
  return new Promise((resolve) => {
    fs.writeFile(target, content, "utf-8", () => {
      resolve();
    });
  });
}

async function createPages(area, output) {
  if (!area.rooms) return;
  const promises = Object.keys(area.rooms).map((key) =>
    createRoom(area.rooms[key], output)
  );

  await Promise.all(promises);
}

async function generateMap(file, output) {
  const data = await readFile(file);
  const area = parseData(data);
  await createPages(area, output);

  process.send({
    key: area.name || file.name,
    payload: area
  });
}

module.exports = {
  generateMap
};
