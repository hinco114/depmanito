const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.ObjectId, index: true, ref: 'Rooms' },
  userId: { type: mongoose.Schema.ObjectId, index: true, ref: 'Users' },
  manitoId: { type: mongoose.Schema.ObjectId, index: true, ref: 'Users' },
  stamps: [{
    confirmed: { type: Boolean },
    createdAt: { type: Date, default: Date.now() },
  }],
  sentMessage: [{
    message: { type: String },
    createdAt: { type: Date, default: Date.now() },
  }],
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
});

class Participants {
  resFormat() {
    return {
      _id: this._id,
      userId: this.userId,
      manitoId: this.manitoId,
      stamps: this.stamps,
      sentMessage: this.sentMessage,
    };
  }

  findMyManitoDoc() {
    // TODO: 확인필요
    return this.findOne({ roomId: this.roomId, manitoId: this.userId }).exec();
  }

  get confirmedStamps() {
    return this.stamps.filter(stamp => stamp.confirmed === true);
  }

  get recivedMessage() {
    // TODO: 완성필요
  }
}

schema.loadClass(Participants);

module.exports = mongoose.model('Participants', schema);
