const AreaMap = require("./area-map");

function createMap(area) {
  const maps = [];
  const rooms = area.rooms || {};
  let roomsArray = Object.values(rooms);
  let remaining = new Set(Object.keys(rooms));
  let placed = new Set();

  const shorts = roomsArray
    .map((room) => ({
      vnum: room.vnum,
      title: room.title,
      exits: Object.keys(room.exits).reduce((exits, direction) => {
        exits[direction] = room.exits[direction].vnum;
        return exits;
      }, {})
    }))
    .reduce((lookup, short) => {
      lookup[short.vnum] = short;
      return lookup;
    }, {});

  while (remaining.size) {
    roomsArray = roomsArray.filter((room) => remaining.has(room.vnum));
    const map = new AreaMap();
    let room = roomsArray.shift();
    let point = map.getPoint(0, 0, 0);
    let vnum = room.vnum;
    let short = shorts[vnum];
    point.addRoomHere(short);
    placed.add(vnum);

    while (placed.size) {
      Object.keys(short.exits).forEach((exit) => {
        const exitVnum = short.exits[exit];
        const exitShort = shorts[exitVnum];
        if (!exitShort) {
          return;
        }
        switch (exit) {
          case "north":
            point.addRoomNorth(exitShort);
            break;
          case "east":
            point.addRoomEast(exitShort);
            break;
          case "south":
            point.addRoomSouth(exitShort);
            break;
          case "west":
            point.addRoomWest(exitShort);
            break;
          case "up":
            point.addRoomUp(exitShort);
            break;
          case "down":
            point.addRoomDown(exitShort);
            break;
          default:
            return;
        }
        if (remaining.has(exitVnum)) {
          placed.add(exitVnum);
        }
      });
      placed.delete(vnum);
      remaining.delete(vnum);

      vnum = [...placed][0];
      if (vnum) {
        short = shorts[vnum];
        point = map.findPointForRoom(vnum);
      }
    }

    maps.push(map);
  }

  let map = maps.shift();
  if (maps.length) {
    maps.forEach((element) => {
      map = map.concat(element);
    });
  }

  return {
    filename: area.filename,
    name: area.name,
    map: map.raw
  };
}

module.exports = createMap;
