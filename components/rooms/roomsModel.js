const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  roomTitle: { type: String },
  roomCode: { type: String, uppercase: true, unique: true, index: true },
  startDate: { type: Date },
  endDate: { type: Date },
  state: { type: String, enum: ['READY', 'PLAYING', 'END'], default: 'READY' },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
});

class Rooms {
  resFormat() {
    return {
      _id: this._id,
      roomTitle: this.roomTitle,
      roomCode: this.roomCode,
      startDate: this.startDate,
      endDate: this.endDate,
      isPlaying: this.isPlaying,
    };
  }

  static findByCode(roomCode) {
    return this.findOne({ roomCode });
  }

  get isPlaying() {
    return this.state === 'PLAYING';
  }

  get joinable() {
    return this.state === 'READY';
  }
}

schema.loadClass(Rooms);

module.exports = mongoose.model('Rooms', schema);
