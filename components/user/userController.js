const db = require('../db');

const getAllUser = async (req, res, next) => {
  try {
    const data = await db.userInfoTb.find();
    console.log(data);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUser,
};
