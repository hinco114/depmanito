const jwt = require('jsonwebtoken');
const { Users } = require('../components/db');
const { SECRET_KEY, EXPIRES } = require('../configs/config').auth;

const createToken = async (uuid) => {
  const user = await Users.findOne({ uuid });
  if (!user) {
    const err = new Error('User not found');
    err.status = 400;
    throw err;
  }
  const payloads = {
    userId: user._id,
  };
  const token = await jwt.sign(payloads, SECRET_KEY, { expiresIn: EXPIRES });
  return token;
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    err.status = 401;
    throw err;
  }
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const decoded = verifyToken(token);
    const user = await Users.findOne({ _id: decoded.userId });
    if (!user) {
      const err = new Error('Not valid Token');
      err.status = 401;
      throw err;
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const onlyCurrentPlaying = async (req, res, next) => {
  try {
    if (req.user.currentPlaying === null) {
      const err = new Error('There is no currentPlaying Games');
      err.status = 400;
      throw err;
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createToken, authMiddleware, onlyCurrentPlaying,
};
