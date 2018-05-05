const { testFunc } = require('../controllers/test');
const {
  getAllUser,
} = require('../components/user').route;
const {
  getAllTask,
} = require('../components/task').route;

module.exports = (router) => {
  router.route('/')
    .get(testFunc);
  router.route('/users')
    .get(getAllUser);
  router.route('/tasks')
    .get(getAllTask);
  return router;
};
