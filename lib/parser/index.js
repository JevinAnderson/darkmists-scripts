const Lines = require("./lines");
const parseRooms = require("./rooms");
const utils = require("./utils");

function parseAreaDetails(area, lines) {
  lines.advance()
  area.filename = lines.current.replace("~", "");
  lines.advance();
  area.name = lines.current.replace("~", "");
  lines.advance();
  area.listing = lines.current.replace("~", "");
  lines.advance();
  area.range = lines.current;
  lines.advance();
}

function parseArea(input) {
  const lines = new Lines(input);
  const area = {};

  do {
    let line = lines.current;
    if (utils.AREA_R.test(lines.current)) {
      parseAreaDetails(area, lines);
    }

    if (utils.ROOMS_R.test(lines.current)) {
      area.rooms = parseRooms(lines);
    }

    if (lines.current === line) {
      lines.advance();
    }
  } while (lines.unsafe !== null);

  return area;
}

module.exports = parseArea;
