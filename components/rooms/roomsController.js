const debug = require('debug')('dev');
const { checkProperty, sendPush } = require('../manitoLib');
const { Rooms, Participants, Users } = require('../db');
const { matchManito } = require('../participants/participantsController');

const createRoom = async (req, res, next) => {
  try {
    checkProperty(req.body, ['roomTitle', 'roomCode', 'startDate', 'endDate']);
    const joinedList = await Participants.find({ userId: req.user._id })
      .populate('roomId').sort({ createdAt: -1 });
    if (joinedList.length > 0) {
      joinedList.forEach((participant) => {
        if (participant.roomId.state !== 'END') {
          const err = new Error('This user already joined Room');
          err.status = 400;
          throw err;
        }
      });
    }
    const {
      roomTitle, roomCode, startDate, endDate,
    } = req.body;
    const startDateObj = new Date(Number(startDate));
    const endDateObj = new Date(Number(endDate));
    const room = new Rooms({
      roomTitle, roomCode, startDate: startDateObj, endDate: endDateObj,
    });
    await room.save();
    debug(`Created Room Id : ${room._id}`);
    res.send(room.resFormat());
  } catch (err) {
    if (err.message.indexOf('roomCode_1 dup key') > -1) {
      err.message = '방 코드번호가 중복됩니다.';
      err.status = 400;
    } else if (err.message.indexOf('Rooms validation failed: roomCode:') > -1) {
      err.message = '방 코드번호는 6자리의 문자와 숫자로 이루어져야 합니다.';
      err.status = 400;
    }
    next(err);
  }
};

const getRoomInformation = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const room = await Rooms.findByCode(roomCode);
    const participantCount = room ? await Participants.find({ roomId: room._id }).count() : 0;
    res.send(room ? room.resFormat(participantCount) : { _id: null });
  } catch (err) {
    next(err);
  }
};

const joinRoom = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const room = await Rooms.findByCode(roomCode);
    if (!room.joinable) {
      const err = new Error('Not joinable Room');
      err.status = 400;
      throw err;
    }
    const joinedList = await Participants.find({ userId: req.user._id })
      .populate('roomId').sort({ createdAt: -1 });
    if (joinedList.length > 0) {
      joinedList.forEach((participant) => {
        if (participant.roomId.state !== 'END') {
          const err = new Error('This user already joined Room');
          err.status = 400;
          throw err;
        }
      });
    }
    const paricipant = new Participants({ roomId: room._id, userId: req.user._id });
    await paricipant.save();

    res.send(paricipant);
  } catch (err) {
    next(err);
  }
};

const leaveRoom = async (req, res, next) => {
  try {
    const recentRoom = await Participants.findOne({ userId: req.user._id })
      .populate('roomId').sort({ createdAt: -1 });
    if (!recentRoom) {
      const err = new Error('User doesn\'t joined any room');
      err.status = 400;
      throw err;
    }
    switch (recentRoom.roomId.state) {
      case 'READY': {
        await Participants.deleteOne({ _id: recentRoom._id });
        break;
      }
      default: {
        const err = new Error('User cannot leave room');
        err.status = 400;
        throw err;
      }
    }
    res.end();
  } catch (err) {
    next(err);
  }
};

const changeState = async () => {
  try {
    const now = new Date();
    const rooms = await Rooms.find({ state: { $ne: 'END' } });
    rooms.forEach(async (room) => {
      // 시작시간이 지난 경우에만 동작
      if (room.startDate <= now) {
        const participants = await Participants.find({ roomId: room._id }).populate('userId');
        const userArray = participants.map(participant => participant.userId);
        if (room.state === 'READY' && room.endDate > now && userArray.length >= 3) {
          // READY 상태에, 참여인원이 3명 이상인 경우에만 게임 시작
          console.log(`Room Code [${room.roomCode}] is PLAYED!`);
          await Users.updateMany({ _id: { $in: userArray } },
            { $set: { currentPlaying: room._id } });
          matchManito(room._id);
          room.state = 'PLAYING';
          room.save();
          participants.forEach((participant) => {
            const { pushToken, name } = participant.userId;
            const { roomTitle } = room;
            if (pushToken) {
              const title = '참여하신 마니또 방이 시작되었습니다!';
              const body = `${name}님, 참여하신 '${roomTitle}' 마니또 방이 시작되었습니다. 마니또를 확인해보세요!`;
              sendPush(pushToken, title, body);
            }
          });
        } else if ((room.state === 'PLAYING' && room.endDate <= now) || userArray.length < 3) {
          // PLAYING 상태에, 끝시간이 지난 경우나, 시작시간이 자나고 참여인원이 3명 미만인 경우엔 바로 종료.
          console.log(`Room Code [${room.roomCode}] is ENDED!`);
          await Users.updateMany({ _id: { $in: userArray } }, { $set: { currentPlaying: null } });
          room.state = 'END';
          room.save();
          participants.forEach((participant) => {
            const { pushToken, name } = participant.userId;
            const { roomTitle } = room;
            if (pushToken) {
              const title = '참여하신 마니또 방이 종료되었습니다!';
              const body = `${name}님, 참여하신 '${roomTitle}' 마니또 방이 종료되었습니다. 결과를 확인하세요!`;
              sendPush(pushToken, title, body);
            }
          });
        }
      }
    });
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  createRoom, getRoomInformation, changeState, joinRoom, leaveRoom,
};
