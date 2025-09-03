const express = require('express') //익스프레스 모듈을 가져옴
const app = express() //새로운 익스프레스 앱을 만듦
const port = 5000 //5000번 포드를 백서버로 둚
const bodyParser = require('body-parser');
const { User } = require("./models/User");

//application/xx-www-form-urlencoded 이렇게 구성된 데이터를 분석해서 가져올 수 있게 함
app.use(bodyParser.urlencoded({ extended: true }));

//application/json 이렇게 된 파일을 분석해서 가져오게 함
app.use(bodyParser.json());

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://ink:abcd1234@test.70fbxpm.mongodb.net/?retryWrites=true&w=majority&appName=test', {
    //useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))


app.get('/', (req, res) => { //루트디렉토리에 헬로우 월드가 출력되게 함
  res.send('Hello World!')
})

app.post('./register', (req, res) => {

  //회원 가입할 때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터베이스에 넣어준다.

  const user = new User(req.body)
  //user 모델에 저장됨
  //err(에러)가 있을 시 json 형식으로 전달함
  user.save((err, UserInfo) => {
    if(err) return  res.json({ success: false, err})
    return res.status(200).json({ //200은 성공했다는 의미
      success: true
    })
  })
})

app.listen(port, () => { //5000번은 port에서 받아와서 실행하게 됨
  console.log(`Example app listening on port ${port}`)
})
