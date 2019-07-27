const iterate = (...arg) => {
  if (!arg.length) return 0;
  return arg.reduce((val, cur) => val + cur);
};

const createObj = (name) => {
  return {
    id: 12,
    name: name
  }
}

module.exports = {
  iterate,
  createObj
}
