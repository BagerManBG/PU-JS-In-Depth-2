const scaffold = function (req, res, next) {
  console.log('LOGGED');
  next();
};

module.exports = scaffold;