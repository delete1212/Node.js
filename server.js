const express = require('express')
const app = express()

app.use(express.static(__dirname + '/CSS'))
app.use(express.static(__dirname + '/HTML'))

app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
})

app.get('/', (요청, 응답) => {
    응답.sendfile(__dirname + '/index.html')
})

app.get('/news', (요청, 응답) => {
    응답.send('흐림')
})

app.get('/shop', function(요청, 응답){
    응답.send('쇼핑')
})

app.get('/about', (요청, 응답) => {
    응답.sendfile(__dirname + '/about.html')
})
