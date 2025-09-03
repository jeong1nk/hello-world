const express = require('express') // 익스프레스 모듈을 가져옴
const app = express() // 새로운 익스프레스 앱을 만듦
const port = 5000 // 5000번 포드를 백서버로 둚

const { User } = require("./models/User")

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://ink:abcd1234@test.70fbxpm.mongodb.net/?retryWrites=true&w=majority&appName=test', {
    //useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))


app.get('/', (req, res) => { // 루트디렉토리에 헬로우 월드가 출력되게 함
  res.send('Hello World!')
})

app.post

app.listen(port, () => { // 5000번은 port에서 받아와서 실행하게 됨
  console.log(`Example app listening on port ${port}`)
})
