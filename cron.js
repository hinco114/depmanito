const { CronJob } = require('cron');
const { Rooms } = require('./components/db');

/**
 * Room 상태를 1분마다 검사하여 시작 or 종료 시킨다.
 */
const updateRoomState = new CronJob('1 * * * * *', async () => {
  const now = new Date();
  const rooms = await Rooms.find({ state: { $ne: 'END' } });
  rooms.forEach((room) => {
    if (room.startDate <= now) {
      if (room.endDate > now) {
        room.state = 'PLAYING';
      } else {
        room.state = 'END';
      }
      room.save();
    }
  });
}, null, true, 'Asia/Seoul');

module.exports = {
  updateRoomState,
};
