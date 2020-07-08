const utils = require("./utils");

const DIRECTIONS = {
  D0: "north",
  D1: "east",
  D2: "south",
  D3: "west",
  D4: "up",
  D5: "down"
};

const ROOM_FLAGS = {
  A: "ROOM_DARK",
  B: "ROOM_NO_BLITZ",
  C: "ROOM_NO_MOB",
  D: "ROOM_INDOORS",
  E: "ROOM_HOUSE",
  F: "ROOM_SHRINE",
  J: "ROOM_PRIVATE",
  K: "ROOM_SAFE",
  L: "ROOM_SOLITARY",
  M: "ROOM_PET_SHOP",
  N: "ROOM_NO_RECALL",
  O: "ROOM_IMP_ONLY",
  P: "ROOM_GODS_ONLY",
  Q: "ROOM_HEROES_ONLY",
  R: "ROOM_NEWBIES_ONLY",
  S: "ROOM_LAW",
  T: "ROOM_NOWHERE",
  U: "ROOM_NO_GATE",
  V: "ROOM_CONSECRATED",
  W: "ROOM_NO_SUMMON",
  X: "ROOM_NO_CONSECRATE",
  Y: "ROOM_NO_TELEPORT",
  Z: "ROOM_NO_ALARM",
  bb: "ROOM_LOW_ONLY",
  cc: "ROOM_NO_MAGIC",
  dd: "ROOM_BLOODY_TIMER",
  ee: "ROOM_NO_TRACK"
};

const GUILD_FLAGS = {
  1: "GUILD_WARRIOR",
  2: "GUILD_THIEF",
  3: "GUILD_CLERIC",
  4: "GUILD_PALADIN",
  5: "GUILD_ANTI_PALADIN",
  6: "GUILD_RANGER",
  7: "GUILD_MONK",
  8: "GUILD_CHANNELER",
  9: "GUILD_NIGHTWALKER",
  10: "GUILD_NECROMANCER",
  11: "GUILD_ELEMENTALIST"
};

const SECTOR_TYPES = {
  0: "SECT_INSIDE",
  1: "SECT_CITY",
  2: "SECT_FIELD",
  3: "SECT_FOREST",
  4: "SECT_HILLS",
  5: "SECT_MOUNTAIN",
  6: "SECT_WATER_SWIM",
  7: "SECT_WATER_NOSWIM",
  8: "SECT_UNUSED",
  9: "SECT_AIR",
  10: "SECT_DESERT",
  11: "SECT_UNDERWATER",
  12: "SECT_UNDERGROUND",
  13: "SECT_MAX"
};

const EXIT_FLAGS = {
  A: "EX_ISDOOR",
  B: "EX_CLOSED",
  C: "EX_LOCKED",
  F: "EX_PICKPROOF",
  G: "EX_NOPASS",
  H: "EX_EASY",
  I: "EX_HARD",
  J: "EX_INFURIATING",
  K: "EX_NOCLOSE",
  L: "EX_NOLOCK",
  M: "EX_NOBASH"
};

const DOOR_STATES = {
  1: ["IS_DOOR"],
  2: ["IS_DOOR", "PICKPROOF"],
  3: ["IS_DOOR", "NOPASS"],
  4: ["IS_DOOR", "NOPASS", "PICKPROOF"],
  5: ["IS_DOOR", "NOPASS", "PICKPROOF", "DOORBASH_PROOF"]
};

const EXIT_R = /D[0-9]/;
const ROOM_END = /^S$/;
const RECOVERY_R = /(M [0-9]+ H [0-9]+)|(H [0-9]+ M [0-9]+)/;
const CLAN_R = /clan .+~/;
const GUILD_R = /^G$/;

function parseFlags(input = "") {
  const flags = [];

  Object.keys(ROOM_FLAGS).forEach((key) => {
    input.replace(key, () => {
      flags.push(ROOM_FLAGS[key]);
      return "";
    });
  });

  return flags;
}

function parseExit(lines, exits) {
  const direction = DIRECTIONS[lines.current];
  lines.advance();

  let description;
  while (!/~/.test(lines.current)) {
    if (description) {
      description += `\n${lines.current}`;
    } else {
      description = lines.current;
    }
    lines.advance();
  }
  lines.advance();

  const keywords = lines.current.replace(/~|'/g, "").split(" ").filter(Boolean);
  lines.advance();

  let [state, key, vnum] = lines.current.split(" ");
  state = DOOR_STATES[parseInt(state, 10)] || [];
  key = key || undefined;
  exits[direction] = { description, keywords, state, key, vnum };
  lines.advance();
}

function parseExtra(lines, extras) {
  lines.advance();
  const keywords = lines.current.replace("~", "").split(" ");
  lines.advance();
  let description;

  while (!/~/.test(lines.current)) {
    if (description) {
      description += `\n${lines.current}`;
    } else {
      description = lines.current;
    }

    lines.advance();
  }

  extras.push({ keywords, description });
}

function parseRoom(lines) {
  const vnum = lines.current.replace("#", "").trim();
  lines.advance();
  const title = lines.current.replace("~", "");
  lines.advance();
  let description;

  while (!/~/.test(lines.current)) {
    if (description) {
      description += `\n${lines.current}`;
    } else {
      description = lines.current;
    }
    lines.advance();
  }
  lines.advance();

  let [_, flags, sector] = lines.current.split(" ");
  flags = parseFlags(flags);
  sector = SECTOR_TYPES[parseInt(sector, 10)];

  const exits = {};
  const extras = [];
  let mana_mod = 100;
  let hp_mod = 100;
  let clan;
  let guild;

  while (
    !ROOM_END.test(lines.current) &&
    !utils.SECTION_END.test(lines.current)
  ) {
    let line = lines.current;

    if (EXIT_R.test(lines.current)) {
      parseExit(lines, exits);
    }

    if (/^E$/.test(lines.current)) {
      parseExtra(lines, extras);
    }

    if (RECOVERY_R.test(lines.current)) {
      const modifiers = lines.current.split(" ");
      while (modifiers.length > 0) {
        let modifier = modifiers.shift();
        if (modifier === "M") {
          mana_mod = parseInt(modifiers.shift(), 10);
        } else {
          hp_mod = parseInt(modifiers.shift(), 10);
        }
      }
    }

    if (CLAN_R.test(lines.current)) {
      clan = lines.current.replace("clan", "").replace("~", "");
    }

    if (GUILD_R.test(lines.current)) {
      lines.advance();
      guild = GUILD_FLAGS[(parseInt(lines.current), 10)];
    }

    if (line === lines.current) {
      lines.advance();
    }
  }

  return {
    vnum,
    title,
    description,
    flags,
    sector,
    exits,
    extras,
    hp_mod,
    mana_mod,
    clan,
    guild
  };
}

function parseRooms(lines) {
  const rooms = {};

  while (!utils.SECTION_END.test(lines.current)) {
    let line = lines.current;
    if (/#[0-9][0-9]/.test(lines.current)) {
      const room = parseRoom(lines);
      if (room) {
        rooms[room.vnum] = room;
      }
    }
    if (line === lines.current) {
      lines.advance();
    }
  }

  return rooms;
}

module.exports = parseRooms;
