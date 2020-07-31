const fs = require("fs");
const path = require("path");
const parseArea = require("../parser/index");
const createMap = require("./create");

const writeHeader = () => `
<header class="main-header">
  <a href="https://darkmists.org" class="main-header-anchor">
    <img src="/header.png" alt="Main Header Image" class="main-header-image"/>
  </a>
</header>
`;

const writeFooter = () => `
<footer class="main-footer">
  <img src="/footer.png" alt="Main Footer Image" class="main-footer-image"/>
</footer>
`;

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
      return `<a target="_blank" class="room-exit" href="/${room.exits[key].vnum}.html">${key}</a>`;
    })
    .join("");

  const content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="author" content="Jevin Anderson">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/main.css">
  <title>${room.title}</title>
</head>
<body class="room">
  ${writeHeader()}
  <div class="container">
    <h1 class="room-header">${room.title}</h1>
    <pre class="room-description">${room.description}</pre>
    <div class="room-exits">
      ${exits}
    </div>
  </div>
  ${writeFooter()}
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
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

    console.log(" area.filename", area.filename);

    const filename = path.resolve(
      output,
      `${area.filename.split(".").shift()}.meta.json`
    );
    console.log(`filename: ${filename}`);

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
          `<tr class="area-room-row"><td class="area-room-column"><a target="_blank" class="area-room-anchor" href="/${vnum}.html">${area.rooms[vnum].title}</a></td></tr>`
      )
      .join("");
    const content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="author" content="Jevin Anderson">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/main.css">
  <title>${area.name}</title>
</head>
<body class="area">
  ${writeHeader()}
  <div id="map-controls"></div>
  <div class="container">
    <h1 class="area-header">${area.name}</h1>
    <table class="area-rooms-table">
      <tbody class="area-rooms-table-body">
        ${rooms}
      </tbody>
    </table>
  </div>
  ${writeFooter()}
  <script>
    window._map_filename = '${area.filename.split(".").shift()}.map.json';
  </script>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
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

const printMap = (map, output) =>
  new Promise((resolve) => {
    const data = JSON.stringify(map, null, 2);

    const filename = path.resolve(
      output,
      `${map.filename.split(".").shift()}.map.json`
    );
    console.log(`filename: ${filename}`);

    fs.writeFile(filename, data, "utf-8", (error) => {
      console.log(" error printing map", error);
      resolve();
    });
  });

async function generateMap(file, output) {
  console.log(" output", output);
  const data = await readFile(file);
  const area = parseArea(data);
  try {
    const map = createMap(area);
    await printMap(map, output);
  } catch (error) {
    console.log("print map error: ", error);
    console.log(`print map filename: ${area.filename}`);
  }
  await createMeta(area, output);
  await createPages(area, output);
  await createTOC(area, output);

  process.send({
    key: area.name || file.name,
    payload: area
  });
}

const generateAreaTOC = (areas, output) =>
  new Promise((resolve) => {
    const rows = Object.keys(areas)
      .sort()
      .map(
        (name) =>
          `<tr class="area-toc-table-row"><td class="area-toc-table-column"><a target="_blank" class="area-toc-area-anchor" href="/${areas[
            name
          ].filename
            .split(".")
            .shift()}.html">${name}</a></td></tr>`
      )
      .join("");
    const content = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta name="author" content="Jevin Anderson">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/main.css">
    <title>Darkmists Areas</title>
  </head>
  <body class="area-toc">
    ${writeHeader()}
    <div class="container">
      <h1 class="area-toc-header">Darkmists Areas</h1>
      <table class="area-toc-table">
        <tbody class="area-toc-table-body">
          ${rows}
        </tbody>
      </table>
    </div>
    ${writeFooter()}
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="/main.js"></script>
  </body>
  </html>
  `;

    const filename = path.resolve(output, "index.html");

    fs.writeFile(filename, content, "utf-8", () => {
      resolve(areas);
    });
  });

module.exports = {
  generateMap,
  generateAreaTOC
};
