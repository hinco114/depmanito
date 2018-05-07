/**
 * 새로운 유저 가입과 프로필사진 변경을 위한 Multipart (Memory Storage 로 사용함)
 */
const multer = require('multer');
const storage = multer.memoryStorage();
const multipart = multer({
  storage,
}).single('profileImg');

const { getUser, createUser, editUser } = require('../components/users/usersController');

module.exports = (router) => {
  router.route('/users')
    .post(multipart, createUser);
  router.route('/users/:userId')
    .put(multipart, editUser)
    .get(getUser);
  return router;
};
