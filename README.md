# hello-world
- git 및 github 공부용
- node.js, react, mongoDB 공부용


##  ✅ async와 await란?
### 🔸 async

- 이 함수 안에서는 비동기 작업(예: 데이터 저장, 요청, 응답 등)을 할 수 있다는 표시

- JavaScript는 기본적으로 순서대로 코드를 실행하지만, 서버에서는 데이터베이스에 요청을 보내거나 파일을 읽는 등 시간이 오래 걸리는 작업도 많음
- 이럴 때 async를 붙여야 await를 사용할 수 있음

### 🔸 await

- await는 "이 작업이 끝날 때까지 기다려줘"라는 의미

- user.save()는 MongoDB에 데이터를 저장하는 비동기 작업
- 이 작업이 끝나기 전에 다음 줄로 넘어가면 문제가 생길 수 있으니까, await user.save()로 저장 끝날 때까지 기다리도록 함