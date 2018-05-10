const debug = require('debug')('dev');
const { checkProperty } = require('../manitoLib');
const { Rooms } = require('../db');

const createRoom = async (req, res, next) => {
  try {
    checkProperty(req.body, ['roomTitle', 'roomCode', 'startDate', 'endDate']);
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
    res.send(room ? room.resFormat() : { _id: null });
  } catch (err) {
    next(err);
  }
};

const changeState = async () => {
  try {
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
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  createRoom, getRoomInformation, changeState,
};
