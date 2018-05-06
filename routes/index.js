const { testFunc } = require('../controllers/test');

module.exports = (router) => {
  router.route('/')
    .get(testFunc);
  return router;
};
