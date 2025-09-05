//MongoDB랑 연결하고 데이터를 저장·조회하기 위한 라이브러리
const mongoose = require('mongoose');
//비밀번호를 암호화하거나 비교할 때 사용
const bcrypt = require('bcrypt');
//암호화할 때 얼마나 복잡하게 섞을지 정하는 숫자 (보통 10이면 충분)
const saltRounds = 10
//로그인 토큰(JWT)을 생성할 때 사용
const jwt = require('jsonwebtoken');

//어떤 데이터를 MongoDB에 저장할지, 그 형식과 제한 조건을 정의
const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true, //양쪽 공백 제거
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

//user.save()를 실행하기 "직전"에 자동 실행되는 코드
//이 부분 덕분에 비밀번호가 암호화되서 저장됨 
userSchema.pre('save', async function(next) {//몽구스에서 가져온 메소드, index.js에서 저장하기 전에 무엇을 할지
  const user = this;
   //isModified('password'): password 필드가 변경되었는지 확인
   //비밀번호가 바뀌었을 때만 암호화함 (회원가입, 비밀번호 변경 시 등)
  if(user.isModified('password')){
    //salt를 이용해 비밀번호를 암호화(hash)해서 user.password를 대체
    try {
      //암호화할 때 사용할 salt 생성
      const salt = await bcrypt.genSalt(saltRounds); 
      //생성된 salt와 사용자의 비밀번호를 해시(hash) 처리
      const hash = await bcrypt.hash(user.password, salt);
      user.password = hash; //암호화한 비밀번호 저장
      next();
    } catch (err) {
      return next(err); //에러가 발생하면, 그 에러를 next()에 전달
    }
  } else {
    //비밀번호가 변경되지 않은 경우(isModified가 false일 때)
    //아무 작업도 하지 않고 next()를 호출하여 저장 작업을 그대로 진행
    next()
  }
})

// 사용자가 입력한 평문 비밀번호(plainPassword)와 
// DB에 저장된 암호화된 비밀번호(this.password)를 비교
userSchema.methods.comparePassword = function(plainPassword, cb){
  bcrypt.compare(plainPassword, this.password, function (err,isMatch){
    if (err) return cb(err); //에러를 콜백 함수(cb)에 전달하여 처리
    //비밀번호가 일치하면 isMatch 값이 true가 됩니다. 이 값을 콜백 함수로 반환합니다.
    //비밀번호가 틀리면 isMatch는 false가 되고, 그 결과를 콜백 함수에 전달
    cb(null,isMatch); 
  })
}

// 토큰 생성
// generateToken은 사용자가 로그인 시 JWT(JSON Web Token)를 생성하여
// 사용자 인증을 위한 토큰을 발급하는 메서드
userSchema.methods.generateToken = function(cb) {
  const user = this; //this:현재 문서 인스턴스인 user 객체
  //jwt.sign: 토큰을 생성하는 함수
  //user._id+'secretToken'=token -> 'secrettoken'->user._id
  //jwt.sign(사용자 고유 id 문자열,토큰을 암호화하는 비밀 키)
  //환경 변수 JWT_SECRET이 있으면 그걸 쓰고, 없으면 'secretToken'이라는 기본 키를 사용
  const token = jwt.sign(user._id.toHexString(), process.env.JWT_SECRET || 'secretToken');
  user.token = token;

  user.save() //토큰이 추가된 사용자 데이터를 DB에 저장
    .then(savedUser => cb(null, savedUser)) //저장된 사용자 데이터를 콜백 함수로 전달
    .catch(err => cb(err));
};

userSchema.statics.findByToken = function(token, cb) {
  var user = this;
  user._id + '' == token

  // 토큰을 decode 한다.
  jwt.verify(token, 'secretToken', function(err, decoded) {
    // 유저 아이디를 이용해서 유저를 찾은 다음에
    // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
    user.findOne({ "_id": decoded, "token": token }, function(err, user) {
      if (err) return cb(err);
      cb(null, user)
    })
  })
}



//mongoose.model('User', userSchema)는 User 모델을 생성
const User = mongoose.model('User', userSchema)

//User 모델을 다른 파일에서도 사용할 수 있게 내보냄
//require()를 통해 다른 파일에서 이 모델을 가져와 
//데이터베이스 조작(생성, 조회 등)을 할 수 있게됨
module.exports = { User } 