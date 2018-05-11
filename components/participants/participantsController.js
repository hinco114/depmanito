const { Participants } = require('../db');
const { checkProperty } = require('../manitoLib');

const shuffledArray = (arr) => {
  const array = [...arr];
  let currentIndex = array.length;
  while (currentIndex !== 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    const temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

const matchManito = async (roomId) => {
  try {
    const participants = await Participants.find({ roomId }).populate('userId', 'gender');
    if (participants.length < 2) {
      return;
    }
    const males = participants.filter(parti => parti.userId.gender === 'M');
    const females = participants.filter(parti => parti.userId.gender === 'F');

    const sMales = shuffledArray(males);
    const sFemales = shuffledArray(females);

    // 위에서 length 가 2 이상이어야만 넘어오므로 bigArray 는 항상 1 이상의 값을 보장한다.
    const bigArray = sMales.length >= sFemales.length ? sMales : sFemales;
    const smallArray = sMales.length < sFemales.length ? sMales : sFemales;

    const firstUserId = bigArray[0].userId;
    while (bigArray.length > 0) {
      if (bigArray.length >= 2 && smallArray.length >= 1) {
        // B1 -> S1 -> B2 로 마니또 연결함 (B 는 항상 small 보다 크기때문에 가능)
        bigArray[0].manitoId = smallArray[0].userId;
        smallArray[0].manitoId = bigArray[1].userId;
        bigArray.shift().save();
        smallArray.shift().save();
      } else if (bigArray.length === 1 && smallArray.length === 1) {
        bigArray[0].manitoId = smallArray[0].userId;
        smallArray[0].manitoId = firstUserId;
        bigArray.shift().save();
        smallArray.shift().save();
      } else if (smallArray.length === 0 && bigArray.length >= 1) {
        // bigArray 가 2개 이상이면 B1 -> B2 연결, 1개이면 마지막 유저이므로 첫 유저와 연결.
        bigArray[0].manitoId = bigArray.length > 2 ? bigArray[1].userId : firstUserId;
        bigArray.shift().save();
      } else {
        console.error(`[${roomId}] 매칭에서 알 수 없는 에러가 발생함.`);
      }
    }
    console.log(`[${roomId}] 매칭 완료!`);
  } catch (err) {
    throw err;
  }
};

const requestStamp = async (req, res, next) => {
  try {
    const participant = await Participants.findByUserId(req.user._id, req.user.currentPlaying);
    participant.stamps.push({});
    participant.save();
    res.send(participant.resFormat());
  } catch (err) {
    next(err);
  }
};

const getStamp = async (req, res, next) => {
  try {
    const participants = await Participants.findByUserId(req.user._id, req.user.currentPlaying);
    const fromManito = await Participants.findByUserId(participants.manitoId, req.user.currentPlaying);
    res.send(participants.resFormat(fromManito));
  } catch (err) {
    next(err);
  }
};

const decisionStamp = async (req, res, next) => {
  try {
    checkProperty(req.body, ['confirmed']);
    const participants = await Participants.findByUserId(req.user._id, req.user.currentPlaying);
    const fromManito = await Participants.findByUserId(participants.manitoId, req.user.currentPlaying);
    const index = fromManito.stamps.findIndex(stamp => stamp._id.toString() === req.params.stampId);
    if (index < 0) {
      const err = new Error('Not exists stampId');
      err.status = 400;
      throw err;
    }
    fromManito.stamps[index].read = true;
    fromManito.stamps[index].confirmed = req.body.confirmed;
    await fromManito.save();
    res.send(participants.resFormat(fromManito));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  matchManito, requestStamp, getStamp, decisionStamp,
};
