const express = require('express'); //익스프레스 모듈을 가져옴
const app = express(); //새로운 익스프레스 앱을 만듦
const port = 5000; //5000번 포드를 백서버로 둚
// const bodyParser = require('body-parser'); 현재 버전에서는 필요없음
const cookieParser = require('cookie-parser');
const config = require('./config/key');

const { User } = require("./models/User");

//application/xx-www-form-urlencoded 이렇게 구성된 데이터를 분석해서 가져올 수 있게 함
app.use(express.urlencoded({ extended: true }));
 
//application/json 이렇게 된 파일을 분석해서 가져오게 함
app.use(express.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    //useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))


app.get('/', (req, res) => { //루트디렉토리에 헬로우 월드가 출력되게 함
  res.send('Hello World!!')
})

app.post('/register', async (req, res) => {
  const user = new User(req.body); // 요청 데이터를 이용해 새 유저 생성

  await user
    .save()
    .then(() => {
      res.status(200).json({
        success: true,
      });
    })
    .catch((err) => {
      console.error(err);
      res.json({
        success: false,
        err: err,
      });
    });
});

//Mongoose 7부터는 .findOne() 같은 메서드에서 콜백(callback) 방식이 제거되었다.
//async/await 기반으로 리팩토링 해야함
app.post('/login',async (req, res) => {
  try {
    // 요청된 이메일을 데이터베이스에 있는지 찾는다.
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.json({
          loginSuccess: false,
          message: "제공된 이메일에 해당하는 유저가 없습니다."
      });
    }

    //요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인.
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (err) return res.status(500).json({ loginSuccess: false, err });

      if (!isMatch) {
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });
      }

      // 비밀번호까지 맞다면 토큰 생성
      user.generateToken((err, userWithToken) => {
        if (err) return res.status(400).send(err);

        // 토큰을 쿠키에 저장 후 응답
        res
          .cookie("x_auth", userWithToken.token)
          .status(200)
          .json({ loginSuccess: true, userId: userWithToken._id });
      });
    });

  } catch (err) {
    return res.status(500).json({ loginSuccess: false, err });
  }
});

app.listen(port, () => { //5000번은 port에서 받아와서 실행하게 됨
  console.log(`Example app listening on port ${port}`)
})
