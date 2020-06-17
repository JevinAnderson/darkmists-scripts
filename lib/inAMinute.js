const inAMinute = (...args) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(...args);
    }, 3000);
  });

module.exports = inAMinute;
