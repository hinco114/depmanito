const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  gender: { type: String, uppercase: true, enum: ['M', 'W'] },
  birthday: { type: Date, min: new Date('1900-01-01') },
  profileImgUrl: { type: String },
  bloodType: { type: String, uppercase: true, enum: ['A', 'B', 'AB', 'O'] },
  job: { type: String },
  hobby: { type: String },
  like: { type: String },
  dislike: { type: String },
  pushToken: { type: String },
  currentPlaying: { type: mongoose.Schema.ObjectId, default: null },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
});

class Users {
  resFormat() {
    return {
      // UUID 와 pushToken 은 필요가 없다.
      _id: this._id,
      name: this.name,
      gender: this.gender,
      birthday: this.birthday,
      profileImgUrl: this.profileImgUrl,
      bloodType: this.bloodType,
      job: this.job,
      hobby: this.hobby,
      like: this.like,
      dislike: this.dislike,
      currentPlaying: this.currentPlaying || null,
    };
  }
}

schema.loadClass(Users);

module.exports = mongoose.model('Users', schema);
