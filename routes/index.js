/**
 * 새로운 유저 가입과 프로필사진 변경을 위한 Multipart (Memory Storage 로 사용함)
 */
const multer = require('multer');
const storage = multer.memoryStorage();
const multipart = multer({
  storage,
}).single('profileImg');

const {
  getUser, createUser, editUser, loginUser,
} = require('../components/users/usersController');
const { createRoom, getRoomInformation } = require('../components/rooms/roomsController');
const { authMiddleware } = require('../middlewares/auth');

module.exports = (router) => {
  router.route('/login')
    .post(loginUser);
  router.route('/users')
    .post(multipart, createUser);
  router.route('/users/:userId')
    .put(authMiddleware, multipart, editUser)
    .get(authMiddleware, getUser);
  router.route('/rooms')
    .get(authMiddleware, getRoomInformation)
    .post(authMiddleware, createRoom);
  return router;
};
