const testFunc = async (req, res, next) => {
  try {
    res.send('<h1> API SERVER </h1>');
  } catch (err) {
    next(err);
  }
};

module.exports.testFunc = testFunc;
