module.exports = function Lines(input) {
  const lines = input
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const length = lines.length;

  let i = 0;

  const result = {
    advance() {
      i++;
    },
    get current() {
      return lines[i] || "";
    },
    get i() {
      return i;
    },
    get lines() {
      return [...lines];
    },
    get next() {
      return lines[i + 1] || "";
    },
    get next10() {
      return lines.slice(i, i + 10);
    },
    nextX(x) {
      return lines.slice(i, i + x);
    },
    get trimmed() {
      return result.current.trim();
    },
    get unsafe() {
      if (i >= length) {
        return null;
      }

      return lines[i];
    }
  };

  return result;
};
