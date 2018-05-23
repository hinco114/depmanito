const debug = require('debug')('dev');
const { checkProperty, uploadToS3, deleteFromS3 } = require('../manitoLib');
const { Users } = require('../db');
const { createToken } = require('../../middlewares/auth');

const uploadProfile = async (file, user) => {
  try {
    const { originalname, buffer } = file;
    let keyName = `profile-images/${user._id}-${originalname}`;
    if (global.env === 'development') {
      keyName = `development/${keyName}`;
    }
    const returnFromS3 = await uploadToS3(buffer, keyName);
    user.profileImgUrl = returnFromS3.Location;
    await user.save();
  } catch (err) {
    throw err;
  }
};

const createUser = async (req, res, next) => {
  try {
    checkProperty(
      req.body,
      ['uuid', 'name', 'gender', 'birthday', 'bloodType', 'job', 'hobby', 'like', 'dislike', 'pushToken'],
    );
    if (!req.file) {
      const err = new Error('There is No Picture');
      err.status = 400;
      throw err;
    }
    const {
      uuid, name, gender, birthday, bloodType, job, hobby, like, dislike, pushToken,
    } = req.body;
    const birthObj = new Date(Number(birthday));
    const user = new Users({
      uuid, name, gender, birthday: birthObj, bloodType, job, hobby, like, dislike, pushToken,
    });
    await user.save();
    await uploadProfile(req.file, user);
    debug(`Created User Id : ${user._id}`);
    res.send(user);
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await Users.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 400;
      throw err;
    }
    res.send(user.resFormat());
  } catch (err) {
    next(err);
  }
};

const editUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (userId !== req.user._id.toString()) {
      const err = new Error('Access denied');
      err.status = 403;
      throw err;
    }
    const user = await Users.findOne({ _id: userId });
    if (req.file) {
      const prevPic = user.profileImgUrl.replace('https://dep-manito.s3.ap-northeast-2.amazonaws.com/', '');
      await deleteFromS3(prevPic);
      await uploadProfile(req.file, user);
    }
    await Users.update({ _id: userId }, { $set: req.body });
    res.end();
  } catch (err) {
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    checkProperty(req.body, ['uuid']);
    const token = await createToken(req.body.uuid);
    res.json({ token });
  } catch (err) {
    err.status = 400;
    next(err);
  }
};

module.exports = {
  getUser, createUser, editUser, loginUser,
};
