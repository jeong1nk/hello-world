const { User } = require('../models/User');

let auth = (req, res, next) => {
  // 인증 처리 하는곳
  // 클라이언트 쿠키에서 토큰을 가져온다.
  const token = req.cookies.x_auth;

  // 💡 토큰이 없으면 인증 실패로 처리
  if (!token) {
    return res.status(401).json({ isAuth: false, message: 'No token provided' });
  }

  // 토큰을 복호화 한후 유저를 찾는다.
  User.findByToken(token, (err, user) => {
    if (err) return res.status(500).send(err); // ❗ throw 대신 응답 반환
    if (!user) return resres.status(401).json({ isAuth: false, error: true,  message: 'User not found' });

    req.token = token;
    req.user = user;
    next();
  })
}


//다른 파일에서도 쓸 수 있게
module.exports = { auth };