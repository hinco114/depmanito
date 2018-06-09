const { Participants } = require('../db');
const { checkProperty, sendPush } = require('../manitoLib');

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
    const participants = await Participants.find({ roomId }).populate('userId roomId');
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
        bigArray[0].manitoId = bigArray.length >= 2 ? bigArray[1].userId : firstUserId;
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
    const participant = await Participants.findByUserId(req.user._id, req.user.currentPlaying)
      .populate('manitoId');
    if (!participant) {
      const err = new Error('Something Wrong in RequestStamp');
      err.status = 400;
      throw err;
    }
    if (participant.unReadStamps.length > 0) {
      const err = new Error('아직 확정받지 않은 도장이 있습니다.');
      err.status = 400;
      throw err;
    }
    participant.stamps.push({
      read: false,
      createdAt: Date.now(),
    });
    participant.save();

    const { pushToken, name } = participant.manitoId;
    if (pushToken) {
      const title = '누군가가 도장을 찍으려고 합니다.';
      const body = `${name}님, 누군가가 당신에게 착한일을 했습니다. 어서 확인해주세요!`;
      sendPush(pushToken, title, body);
    }
    res.send(participant.resFormat());
  } catch (err) {
    next(err);
  }
};

const getGameInfo = async (req, res, next) => {
  try {
    const participants = await Participants.findByUserId(req.user._id, req.user.currentPlaying);
    const fromWoorung = await Participants.findOne({
      manitoId: req.user._id,
      roomId: req.user.currentPlaying,
    });
    res.send(participants.resFormat(fromWoorung));
  } catch (err) {
    next(err);
  }
};

const decisionStamp = async (req, res, next) => {
  try {
    checkProperty(req.body, ['confirmed']);
    const participants = await Participants.findByUserId(req.user._id, req.user.currentPlaying);
    const wooRung = await Participants.findOne({
      manitoId: req.user._id,
      roomId: req.user.currentPlaying,
    });
    const index = wooRung.stamps.findIndex(stamp => stamp._id.toString() === req.params.stampId);
    if (index < 0) {
      const err = new Error('Not exists stampId');
      err.status = 400;
      throw err;
    }
    wooRung.stamps[index].read = true;
    wooRung.stamps[index].confirmed = req.body.confirmed;
    await wooRung.save();
    const { pushToken } = wooRung;
    if (pushToken) {
      const title = req.body.confirmed ? '도장을 받았습니다!' : '도장을 못받았습니다.';
      const body = req.body.confirmed
        ? '마니또가 도장을 찍어주었습니다! 새로운 힌트를 얻어보세요!'
        : '마니또가 도장을 찍어주지 않았습니다. ㅠㅠ';
      sendPush(pushToken, title, body);
    }
    res.send(participants.resFormat(wooRung));
  } catch (err) {
    next(err);
  }
};

const getHints = async (req, res, next) => {
  try {
    const participants = await Participants.findByUserId(req.user._id, req.user.currentPlaying);
    const fromManito = await Participants.findOne({
      manitoId: req.user._id,
      roomId: req.user.currentPlaying,
    })
      .populate('userId');
    const hints = fromManito.userId.hintList.slice(0, participants.confirmedStamps.length / 2);
    res.send({ hints });
  } catch (err) {
    next(err);
  }
};

const getMyManito = async (req, res, next) => {
  try {
    const manitoDoc = await Participants.findByUserId(req.user._id, req.user.currentPlaying)
      .populate('manitoId');
    if (!manitoDoc) {
      const err = new Error('Something Wrong in GetMyManito');
      err.status = 400;
      throw err;
    }
    res.send(manitoDoc.manitoId.resFormat());
  } catch (err) {
    next(err);
  }
};

const getWooRung = async (req, res, next) => {
  try {
    const participants = await Participants.find({ manitoId: req.user._id })
      .populate('roomId userId').sort({ createdAt: -1 });
    const endedGames = participants.filter(participant => participant.roomId.state === 'END');
    const resData = endedGames.map(game => ({
      roomId: game.roomId,
      wooRung: game.userId.resFormat(),
    }));
    res.send(resData);
  } catch (err) {
    next(err);
  }
};

const createChat = async (req, res, next) => {
  try {
    checkProperty(req.body, ['message']);
    const participant = await Participants.findByUserId(req.user._id, req.user.currentPlaying)
      .populate('manitoId');
    if (!participant) {
      const err = new Error('Something Wrong in RequestStamp');
      err.status = 400;
      throw err;
    }
    participant.sentMessage.push({
      message: req.body.message,
      createdAt: Date.now(),
    });
    participant.save();

    const { pushToken, name } = participant.manitoId;
    if (pushToken) {
      const title = '누군가가 메세지를 보냈습니다.';
      const body = `${name}님, 누군가가 당신에게 메세지를 보냈습니다. 어서 확인해주세요!`;
      sendPush(pushToken, title, body);
    }
    res.send(participant.resFormat());
  } catch (err) {
    next(err);
  }
};

module.exports = {
  matchManito,
  requestStamp,
  getGameInfo,
  decisionStamp,
  getHints,
  getMyManito,
  getWooRung,
  createChat,
};
