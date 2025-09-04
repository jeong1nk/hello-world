const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10

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

userSchema.pre('save', function(next) {//몽구스에서 가져온 메소드, index.js에서 저장하기 전에 무엇을 할지
  var user = this;

  if(user.isModified('password')){ //password가 변환될때만 bcrypt를 이용해 암호화 한다.
    //salt를 이용해 비밀번호를 암호화 시킨다.
    bcrypt.genSalt(saltRounds, function(err, salt) {
      if(err) return next(err)  //에러가 나면 index.js의 post의 err부분으로 이동
      bcrypt.hash(user.password, salt, function(err, hash) { //hash가 암호화된 비밀번호
          if(err) return next(err)
          user.password = hash
          next()  
        })
    })
  } else {
    next()
  }
})

const User = mongoose.model('User', userSchema)

module.exports = { User } //다른곳에서도 쓸수있게