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
const { createRoom, getRoomInformation, joinRoom } = require('../components/rooms/roomsController');
const {
  requestStamp, getStamp, decisionStamp, getHints, getMyManito, getWooRung, createChat,
} = require('../components/participants/participantsController');
const { authMiddleware, onlyCurrentPlaying } = require('../middlewares/auth');

module.exports = (router) => {
  router.route('/login')
    .post(loginUser);
  router.route('/users')
    .post(multipart, createUser);
  router.route('/users/:userId')
    .put(authMiddleware, multipart, editUser)
    .get(authMiddleware, getUser);
  router.route('/rooms')
    .post(authMiddleware, createRoom);
  router.route('/rooms/:roomCode')
    .get(authMiddleware, getRoomInformation);
  router.route('/rooms/:roomCode/join')
    .post(authMiddleware, joinRoom);
  router.route('/games/manito')
    .get(authMiddleware, onlyCurrentPlaying, getMyManito);
  router.route('/games/woo-rung')
    .get(authMiddleware, getWooRung);
  router.route('/games/stamps')
    .post(authMiddleware, onlyCurrentPlaying, requestStamp)
    .get(authMiddleware, onlyCurrentPlaying, getStamp);
  router.route('/games/chats')
    .post(authMiddleware, onlyCurrentPlaying, createChat);
  router.route('/games/stamps/:stampId/decision')
    .post(authMiddleware, onlyCurrentPlaying, decisionStamp);
  router.route('/games/hints')
    .get(authMiddleware, onlyCurrentPlaying, getHints);
  return router;
};
