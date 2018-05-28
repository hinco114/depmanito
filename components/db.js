const debug = require('debug')('bootstrap');
const config = require('../configs/config');
const { mongo } = config.dbConfig;
const mongoose = require('mongoose');
const mongoEnv = mongo[global.env];

const admin = require('firebase-admin');
const serviceAccount = require('../configs/config').firebase;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = {};

// 급해서 동적으로 require 하는거 다 빼먹고 걍 함
db.Users = require('./users/usersModel');
db.Rooms = require('./rooms/roomsModel');
db.Participants = require('./participants/participantsModel');

mongoose.connect(mongoEnv);
mongoose.connection.on('error', err => console.log(`MongoDB Connection Error: ${err.message}`));
mongoose.connection.once('open', () => debug('MongoDB Connected'));

module.exports = db;
