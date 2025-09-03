const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true, //띄어쓰기 못하게
    unique: 1 //중복방지
  },
  password: {
    type: String,
    minlength: 5
  },
  lastname: {
    type: String,
    maxlength: 50
  },
  role: { // 관리자의 경우 구분되어야 하니까
    type: Number, //관리자는 1번 이라고 생각
    default: 0 // 아무것도 지정하지 않으면 기본값은 0
  },
  image: String,
  token: {
    type: String //유효성 관리 등
  },
  tokenExp: { //토큰을 사용할 수 있는 기간
    type: Number
  }
})

const User = mongoose.model('User', userSchema)

module.exports = { User } //다른곳에서도 쓸수있게