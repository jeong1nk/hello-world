if(process.env.NODE_ENV === 'production'){
    //production 모드 이면 prod파일을 이용해 가져오고
    module.exports = require('./prod');
} else {
    //develop 모드 이면 dev파일에서 가져옴
    module.exports = require('./dev');
}