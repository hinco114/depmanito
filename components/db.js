const debug = require('debug')('bootstrap');
const config = require('../configs/config');
const { mongo } = config.dbConfig;
const mongoose = require('mongoose');
const mongoEnv = mongo[global.env];

const db = {};

// 급해서 동적으로 require 하는거 다 빼먹고 걍 함
db.Users = require('./users/usersModel');

mongoose.connect(mongoEnv);
mongoose.connection.on('error', err => console.log(`MongoDB Connection Error: ${err.message}`));
mongoose.connection.once('open', () => debug('MongoDB Connected'));

module.exports = db;
