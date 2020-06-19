const path = require("path");
const fs = require("fs");

const getDirectoryContents = (dir) =>
  new Promise((resolve, reject) => {
    const options = { withFileTypes: true };
    fs.readdir(dir, options, (error, entries = []) => {
      if (error) {
        reject(error);
      }

      let results = [];
      const nestedLookups = [];

      entries.forEach((entry) => {
        const result = {
          path: path.resolve(dir, entry.name)
        };

        if (entry.isFile()) {
          result.name = entry.name;
          result.type = "file";
        } else if (entry.isDirectory()) {
          result.type = "directory";
          nestedLookups.push(getDirectoryContents(result.path));
        }

        results.push(result);
      });

      Promise.all(nestedLookups)
        .then((nestedResults) => {
          nestedResults.forEach((nestedResult) => {
            results = results.concat(nestedResult);
          });

          resolve(results);
        })
        .catch(reject);
    });
  });

module.exports = {
  getDirectoryContents
};
