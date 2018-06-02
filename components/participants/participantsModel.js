const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.ObjectId, index: true, ref: 'Rooms' },
  userId: { type: mongoose.Schema.ObjectId, index: true, ref: 'Users' },
  manitoId: { type: mongoose.Schema.ObjectId, index: true, ref: 'Users' },
  stamps: [{
    confirmed: { type: Boolean },
    read: { type: Boolean, default: false },
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
  resFormat(fromWoorung) {
    const ret = {
      _id: this._id,
      roomId: this.roomId,
      userId: this.userId,
      manitoId: this.manitoId,
      stamps: this.stamps,
      sentMessage: this.sentMessage,
    };
    if (fromWoorung) {
      ret.unReadStamps = fromWoorung.unReadStamps;
      ret.recivedMessage = fromWoorung.recivedMessage;
    }
    return ret;
  }

  static findByUserId(userId, roomId) {
    return this.findOne({ userId, roomId });
  }

  get confirmedStamps() {
    return this.stamps.filter(stamp => stamp.confirmed === true);
  }

  get unReadStamps() {
    return this.stamps.filter(stamp => stamp.read === false);
  }

  get recivedMessage() {
    return this.sentMessage;
  }
}

schema.loadClass(Participants);

module.exports = mongoose.model('Participants', schema);
