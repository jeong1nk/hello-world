const express = require('express') //익스프레스 모듈을 가져옴
const app = express() //새로운 익스프레스 앱을 만듦
const port = 5000 //5000번 포드를 백서버로 둚
// const bodyParser = require('body-parser'); 현재 버전에서는 필요없음

const config = require('./config/key');

const { User } = require("./models/User");

//application/xx-www-form-urlencoded 이렇게 구성된 데이터를 분석해서 가져올 수 있게 함
app.use(express.urlencoded({ extended: true }));

//application/json 이렇게 된 파일을 분석해서 가져오게 함
app.use(express.json());

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


app.listen(port, () => { //5000번은 port에서 받아와서 실행하게 됨
  console.log(`Example app listening on port ${port}`)
})
