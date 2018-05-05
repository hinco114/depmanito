const fs = require('fs');
const path = require('path');
const basename = path.basename(module.filename);
const debug = require('debug')('bootstrap');
const config = require('../configs/config');
const { mysql, mongo } = config.dbConfig;
const Sequelize = require('sequelize');
const mongoose = require('mongoose');
const rdbEnv = mysql[global.env];
const mongoEnv = mongo[global.env];

const sequelize = new Sequelize(rdbEnv.database, rdbEnv.username, rdbEnv.password, mysql);
const db = {};

/**
 * Each model must has '~~Model.js' file which contains DB model Definition,
 * And 'index.js' file which contains model path.
 */
fs.readdirSync(__dirname)
  .filter(file => file.slice(-3) !== '.js')
  .forEach((file) => {
    const model = sequelize.import(`${__dirname}/${file}/${file}Model.js`);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Connect and Sync DB
sequelize.sync()
  .then(() => {
    if (global.env !== 'test') {
      debug('Sequelize DB Sync complete with Models');
    }
  })
  .catch((err) => {
    console.log(`RDB Connection Error : ${err.message}`);
  });
mongoose.connect(mongoEnv);
mongoose.connection.on('error', err => console.log(`MongoDB Connection Error: ${err.message}`));
mongoose.connection.once('open', () => debug('MongoDB Connected'));

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
