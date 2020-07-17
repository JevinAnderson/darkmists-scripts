const EMPTY_TOKEN = "*";

function createFilledArray(length = 0, value = EMPTY_TOKEN) {
  const result = [];
  for (let i = 0; i < length; i++) {
    result.push(value);
  }

  return result;
}

function combineMaps(map1, map2) {
  const newWidth = map1.width + map2.width + 1;
  const newLength = Math.max(map1.length, map2.length);
  const newBase = Math.max(map1.base, map2.base);
  const newHeight =
    newBase + Math.max(map1.height - map1.base, map2.height - map2.base);

  const map3 = new AreaMap();
  while (map3.width < newWidth) {
    map3.digEast();
  }
  while (map3.length < newLength) {
    map3.digSouth();
  }
  while (map3.height < newHeight) {
    map3.digDown();
  }
  map3.base = newBase;

  copyMap(map1, map3);
  copyMap(map2, map3, map1.width + 1);
  return map3;
}

function copyMap(src, dest, xOffset = 0) {
  const srcWidth = src.width;
  const srcLength = src.length;
  const srcHeight = src.height;
  const srcBase = src.base;
  const srcRaw = src.raw;
  const destBase = dest.base;
  const destRaw = dest.raw;
  const baseOffset = destBase - srcBase;

  for (let z = 0; z < srcHeight; z++) {
    for (let y = 0; y < srcLength; y++) {
      for (let x = 0; x < srcWidth; x++) {
        destRaw[z + baseOffset][y][x + xOffset] = srcRaw[z][y][x];
      }
    }
  }
}

function AreaMap() {
  let data = [[[EMPTY_TOKEN]]];
  let base = 0;

  const result = {
    get length() {
      return data[0].length;
    },
    get width() {
      return data[0][0].length;
    },
    get height() {
      return data.length;
    },
    get json() {
      return JSON.stringify(data);
    },
    get raw() {
      return data;
    },
    get base() {
      return base;
    },
    set base(x) {
      base = x;
    },
    digNorth() {
      const height = result.height;
      for (let z = 0; z < height; z++) {
        data[z].unshift(createFilledArray(result.width));
      }
    },
    digEast() {
      const height = result.height;
      const length = result.length;
      for (let z = 0; z < height; z++) {
        for (let y = 0; y < length; y++) {
          data[z][y].push(EMPTY_TOKEN);
        }
      }
    },
    digSouth() {
      const height = result.height;
      for (let z = 0; z < height; z++) {
        data[z].push(createFilledArray(result.width));
      }
    },
    digWest() {
      const height = result.height;
      const length = result.length;
      for (let z = 0; z < height; z++) {
        for (let y = 0; y < length; y++) {
          data[z][y].unshift(EMPTY_TOKEN);
        }
      }
    },
    digUp() {
      const length = result.length;
      const width = result.width;
      const grid = [];
      for (let y = 0; y < length; y++) {
        grid.push(createFilledArray(width));
      }
      data.unshift(grid);
      base += 1;
    },
    digDown() {
      const length = result.length;
      const width = result.width;
      const grid = [];
      for (let y = 0; y < length; y++) {
        grid.push(createFilledArray(width));
      }
      data.push(grid);
    },
    getPoint(x, y, z) {
      let oX = x;
      let oY = y;
      let oZ = z;
      const point = {
        addRoom(room, x, y, z) {
          if (z < 0) {
            oZ += 1;
            z = 0;
            result.digUp();
          }
          if (z >= result.height) {
            result.digDown();
          }
          if (y < 0) {
            y = 0;
            oY += 1;
            result.digNorth();
          }
          if (y >= result.length) {
            result.digSouth();
          }
          if (x < 0) {
            x = 0;
            oX += 1;
            result.digWest();
          }
          if (x >= result.width) {
            result.digEast();
          }

          if (data[z][y][x] !== EMPTY_TOKEN) {
            return false;
          }

          data[z][y][x] = room;

          return true;
        },

        addRoomHere: (room) => point.addRoom(room, oX, oY, oZ),
        addRoomNorth: (room) => point.addRoom(room, oX, oY - 1, oZ),
        addRoomSouth: (room) => point.addRoom(room, oX, oY + 1, oZ),
        addRoomWest: (room) => point.addRoom(room, oX - 1, oY, oZ),
        addRoomEast: (room) => point.addRoom(room, oX + 1, oY, oZ),
        addRoomUp: (room) => point.addRoom(room, oX, oY, oZ - 1),
        addRoomDown: (room) => point.addRoom(room, oX, oY, oZ + 1),
        get room() {
          return data[oZ] && data[oZ][oY] && data[oZ][oY][oX];
        }
      };

      return point;
    },
    findPointForRoom(vnum) {
      const length = result.length;
      const width = result.width;
      const height = result.height;
      for (let z = 0; z < height; z++) {
        for (let y = 0; y < length; y++) {
          for (let x = 0; x < width; x++) {
            const room = data[z][y][x];

            if (room && room !== EMPTY_TOKEN && room.vnum === vnum) {
              return result.getPoint(x, y, z);
            }
          }
        }
      }
    },
    concat(map) {
      return combineMaps(result, map);
    }
  };

  return result;
}

module.exports = AreaMap;
