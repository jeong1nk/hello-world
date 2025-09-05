//💡index.js는 서버의 입구

//💡express: Node.js에서 서버를 쉽게 만들 수 있게 해주는 라이브러리
const express = require('express'); //익스프레스 모듈을 가져옴 
const app = express(); //app 이라는 우리의 서버를 만듦
const port = 5000; //포드는 5000번

const cookieParser = require('cookie-parser'); // 쿠키를 쉽게 다루기 위한 미들웨어
const config = require('./config/key'); // DB 주소, 보안키 등 비밀 설정
const { User } = require("./models/User"); // user.js에서 사용자에 대한 데이터 모델 불러오기
const { auth } = require("./middleware/auth");

//application/xx-www-form-urlencoded 이렇게 구성된 데이터를 분석해서 가져올 수 있게 함
// urlencoded: 폼 데이터 (예: HTML form 전송)를 읽을 수 있게 함.
// { extended: true }: 객체 안에 객체를 넣을 수 있게 해주는 옵션.
app.use(express.urlencoded({ extended: true })); // form 데이터
//application/json 이렇게 된 파일을 분석해서 가져오게 함
// json(): JSON 형식의 요청 본문을 읽을 수 있게 해주는 미들웨어.
// 예: Postman에서 application/json으로 보내면 이걸로 읽습니다.
app.use(express.json()); // JSON 데이터
// req.cookies를 통해 쿠키를 읽을 수 있게 됩니다.
app.use(cookieParser()); // 쿠키 읽기/쓰기


//💡데이터베이스 연결(MongoDB)
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {}) //config폴더에 있는 mongoURI를 가져와 연결
 .then(() => console.log('MongoDB Connected...')) //연결이 되면 해당 문구를
 .catch(err => console.log(err)) //안되고 에러가 나면 콘솔로그에 에러문구를 띄움

//req:request, res:respond 받고 보내고
app.get('/', (req, res) => { //브라우저에서 "/"(루트디렉토리)로 접속하면 이 코드를 실행
  res.send('Hello World!!') //사용자에게 보내는 메시지 (response).
})

//💡회원가입 API 
// /register 라는 회원가입 요청을 처리하는 주소를 만들고 post요청
app.post('/api/users/register', async (req, res) => {
    try {
      //1. 사용자가 보낸 정보인 req.body를 User(...)라는 새 유저 객체를 생성해서 user에 저장
      const user = new User(req.body);
      //2. MongoDB에 유저 정보를 저장
      //.save()는 비동기 작업👉await 덕분에 저장이 끝날 때까지 기다림
      await user.save()
      //3.저장 성공 → 200 응답 코드와 함께 클라이언트에게 success: true 응답
      res.status(200).json({  success: true });
    } 
    catch (err) { //try 중 에러가 나면(저장 실패)실행
      console.error(err);
      res.status(400).json({ success: false, err });
    }// 콘솔에 에러를 찍고, 사용자에게 success: false 응답
});

//💡로그인 API
// /login 라는 회원가입 요청을 처리하는 주소를 만들고 post요청
app.post('/api/users/login', async (req, res) => {
  try {
    // DB에서 해당 이메일이 있는지 찾고 결과를 user에 넣음
    //User.findOne은 Mongoose의 메서드, 조건에 맞는 하나의 유저를 찾아줌
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      //res.json은 클라이언트에게 JSON 형식으로 응답을 보내는 함수
      return res.json({
          loginSuccess: false,
          message: "제공된 이메일에 해당하는 유저가 없습니다."
      });
    }
    //comparePassword: 비밀번호가 맞는지 확인하는 함수(User.js)
    //저장된 암호화된 비밀번호와, 사용자가 입력한 비밀번호(req.body.password)를 비교
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (err) return res.status(500).json({ loginSuccess: false, err });

      if (!isMatch) {
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });
      }

      // 비밀번호까지 맞다면 토큰 생성
      //generateToken: 토큰을 생성하는 함수(User.js)
      //userWithToken: 토큰이 들어간 새로운 유저 정보
      user.generateToken((err, userWithToken) => {
        if (err) return res.status(400).send(err);
        //토큰을 쿠키에 저장 후 응답
        //쿠키에 x_auth라는 이름으로 토큰을 저장
        res
          .cookie("x_auth", userWithToken.token) //생성된 토큰을 쿠키(x_auth)에 저장
          .status(200)
          .json({ loginSuccess: true, userId: userWithToken._id });
          //로그인 성공 메시지와 함께 유저의 ID를 응답으로 보냄
          //쿠키에 토큰을 저장하면, 클라이언트가 다음 요청을 할 때 자동으로 토큰을 보내줘요 (자동 로그인 등 가능).
      });

    });

  } catch (err) {
    return res.status(500).json({ loginSuccess: false, err });
  }
});


// role 1 어드민    role 2 특정 부서 어드민
// role 0 -> 일반유저    role 0이 아니면 관리자
app.get('/api/users/auth', auth, (req, res) => {
  // 여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True 라는 말
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

app.get('/api/users/logout', auth, async (req, res) => {
  console.log('req.user', req.user);
  try {
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { token: "" }
    );
    res.clearCookie("x_auth");
    return res.status(200).send({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, err });
  }
});



//지정한 포트 번호로 서버를 실행
app.listen(port, () => { //5000번은 port에서 받아와서 실행하게 됨
  console.log(`Example app listening on port ${port}`)
})
