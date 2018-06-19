const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  gender: { type: String, uppercase: true, enum: ['M', 'F'] },
  // birthday: { type: Date, min: new Date('1900-01-01') },
  // bloodType: { type: String, uppercase: true, enum: ['A', 'B', 'AB', 'O'] },
  userOwnHints: {
    type: [String],
    maxlength: 16,
  },
  profileImgUrl: { type: String },
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
      // birthday: this.birthday,
      // bloodType: this.bloodType,
      userOwnHints: this.userOwnHints,
      profileImgUrl: this.profileImgUrl,
      job: this.job,
      hobby: this.hobby,
      like: this.like,
      dislike: this.dislike,
      currentPlaying: this.currentPlaying || null,
    };
  }

  get hintList() {
    return [
      `저는 ${this.gender === 'M' ? '남성' : '여성'}입니다.`,
      `저의 취미는 '${this.hobby}' 입니다.`,
      `제가 좋아하는것은 '${this.like} 입니다.`,
      `제가 싫어하는것은 '${this.dislike} 입니다.`,
    ].concat(this.userOwnHints);
  }
}

schema.loadClass(Users);

module.exports = mongoose.model('Users', schema);
