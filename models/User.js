const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10
const jwt = require('jsonwebtoken');

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

// 비밀번호 암호화
userSchema.pre('save', async function(next) {//몽구스에서 가져온 메소드, index.js에서 저장하기 전에 무엇을 할지
  const user = this;

  if(user.isModified('password')){ //password가 변환될때만 bcrypt를 이용해 암호화 한다.
    //salt를 이용해 비밀번호를 암호화 시킨다.
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(user.password, salt);
      user.password = hash;
      next();
    } catch (err) {
      return next(err);
    }
  } else {
    next()
  }
})

// 비밀번호 비교
userSchema.methods.comparePassword = function(plainPassword, cb){
  bcrypt.compare(plainPassword, this.password, function (err,isMatch){
    if (err) return cb(err);
    cb(null,isMatch);
  })
}

// 토큰 생성
userSchema.methods.generateToken = function(cb) {
  const user = this;
  //jsonwebtoken을 이용해서 token 생성하기
  //user._id+'secretToken'=token -> 'secrettoken'->user._id
  const token = jwt.sign(user._id.toHexString(), process.env.JWT_SECRET || 'secretToken');
  user.token = token;

  user.save()
    .then(savedUser => cb(null, savedUser))
    .catch(err => cb(err));
};


const User = mongoose.model('User', userSchema)

module.exports = { User } //다른곳에서도 쓸수있게