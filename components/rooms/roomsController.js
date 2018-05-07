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
    if (err.message.indexOf('roomCode') > -1) {
      err.message = '방 코드번호가 중복됩니다.';
      err.status = 400;
    }
    next(err);
  }
};

const getRoomInformation = async (req, res, next) => {
  try {
    checkProperty(req.query, ['roomCode']);
    const room = await Rooms.findByCode(req.query.roomCode);
    res.send(room ? room.resFormat() : { _id: null });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRoom, getRoomInformation,
};
