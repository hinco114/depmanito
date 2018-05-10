const { CronJob } = require('cron');
const { changeState } = require('./components/rooms/roomsController');

/**
 * Room 상태를 매분 1초에 검사하여 매칭과 상태를 변경한다.
 */
const updateRoomState = new CronJob('1 * * * * *', changeState, null, true, 'Asia/Seoul');

module.exports = {
  updateRoomState,
};
