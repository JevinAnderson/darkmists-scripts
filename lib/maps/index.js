const fs = require("fs");
const path = require("path");
const parseArea = require("../parser/index");

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

function createRoom(room = {}, output) {
  const exits = Object.keys(room.exits)
    .map((key) => {
      return `<a href="/${room.exits[key].vnum}.html">${key}</a>`;
    })
    .join("");

  const content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Should live on some cdn -->
  <link rel="stylesheet" href="/main.css">
  <title>${room.title}</title>
</head>
<body class="room">
  <h1>${room.title}</h1>
  <pre>${room.description}</pre>
  <br />
  ${exits}
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
  <!-- Should live on some cdn -->
  <script src="/main.js"></script>
</body>
</html>
`;

  const target = path.resolve(output, `${room.vnum}.html`);
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

const createMeta = (area, output) =>
  new Promise((resolve) => {
    const data = JSON.stringify(area, null, 2);
    // console.log(' data', data);
    console.log(Object.keys(area));

    console.log(" area.filename", area.filename);
    console.log(" output", output);

    const filename = path.resolve(
      output,
      `${area.filename.split(".").shift()}.json`
    );
    console.log(`filename: ${filename}`);
    // console.log(data)
    fs.writeFile(filename, data, "utf-8", (error) => {
      console.log(" error", error);
      resolve();
    });
  });

const createTOC = (area, output) =>
  new Promise((resolve) => {
    const rooms = Object.keys(area.rooms || {})
      .map(
        (vnum) =>
          `<tr><td><a href="/${vnum}.html">${area.rooms[vnum].title}</a></td></tr>`
      )
      .join("");
    const content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Should live on some cdn -->
  <link rel="stylesheet" href="/main.css">
  <title>${area.name}</title>
</head>
<body class="room">
  <h1>${area.name}</h1>
  <table>
    <tbody>
      ${rooms}
    </tbody>
  </table>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
  <!-- Should live on some cdn -->
  <script src="/main.js"></script>
</body>
</html>
`;

    const filename = path.resolve(
      output,
      `${area.filename.split(".").shift()}.html`
    );

    fs.writeFile(filename, content, "utf-8", (error) => {
      console.log(" error", error);
      resolve();
    });
  });

async function generateMap(file, output) {
  console.log(" output", output);
  const data = await readFile(file);
  const area = parseArea(data);
  await createMeta(area, output);
  await createPages(area, output);
  await createTOC(area, output);

  process.send({
    key: area.name || file.name,
    payload: area
  });
}

module.exports = {
  generateMap
};
