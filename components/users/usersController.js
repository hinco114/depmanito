const debug = require('debug')('dev');
const { checkProperty } = require('../manitoLib');
const { Users } = require('../db');
const { createToken } = require('../../middlewares/auth');

const createUser = async (req, res, next) => {
  try {
    checkProperty(
      req.body,
      ['uuid', 'name', 'gender', 'birthday', 'bloodType', 'job', 'hobby', 'like', 'dislike'],
    );
    if (req.file) {
      // TODO: Image S3 Upload 필요함!
      console.log(req.file);
    }
    const {
      uuid, name, gender, birthday, bloodType, job, hobby, like, dislike,
    } = req.body;
    const birthObj = new Date(Number(birthday));
    const user = new Users({
      uuid, name, gender, birthday: birthObj, bloodType, job, hobby, like, dislike,
    });
    await user.save();
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
    debug(req.body);
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
    next(err);
  }
};

module.exports = {
  getUser, createUser, editUser, loginUser,
};
