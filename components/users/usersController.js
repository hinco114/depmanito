const debug = require('debug')('dev');
const { checkProperty, uploadToS3, deleteFromS3 } = require('../manitoLib');
const { Users } = require('../db');
const { createToken } = require('../../middlewares/auth');

const uploadProfile = async (file, user) => {
  try {
    const { originalname, buffer } = file;
    const keyName = `profile-images/${user._id}-${originalname}`;
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
      ['uuid', 'name', 'gender', 'birthday', 'bloodType', 'job', 'hobby', 'like', 'dislike'],
    );
    const {
      uuid, name, gender, birthday, bloodType, job, hobby, like, dislike,
    } = req.body;
    const birthObj = new Date(Number(birthday));
    const user = new Users({
      uuid, name, gender, birthday: birthObj, bloodType, job, hobby, like, dislike,
    });
    await user.save();
    if (req.file) {
      await uploadProfile(req.file, user);
    }
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
    res.send(user.resFormat());
  } catch (err) {
    next(err);
  }
};

const editUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await Users.findOne({ _id: userId });
    if (req.file) {
      const prevPic = user.profileImgUrl.replace('https://dep-manito.s3.ap-northeast-2.amazonaws.com/', '');
      console.log(prevPic);
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
