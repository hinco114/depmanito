const db = require('../db');

const getAllTask = async (req, res, next) => {
  try {
    const data = await db.taskTb.find();
    console.log(data);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTask,
};
