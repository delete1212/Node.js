const express = require('express')
const app = express()

app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')


const { MongoClient } = require('mongodb')

let db
const url = 'mongodb+srv://admin1234:qwer1234@mechacluster.ryvdc.mongodb.net/?retryWrites=true&w=majority&appName=MechaCluster'
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')
  app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
})
}).catch((err)=>{
  console.log(err)
})

app.get('/', (요청, 응답) => {
    응답.sendfile(__dirname + '/index.html')
})

app.get('/news', (요청, 응답) => {
    db.collection('post').insertOne({title : '흠'})
    응답.send('흐림')
})

app.get('/shop', function(요청, 응답){
    응답.send('쇼핑')
})

app.get('/about', (요청, 응답) => {
    응답.sendfile(__dirname + '/about.html')
})

app.get('/list', async (요청, 응답) => {
    let result = await db.collection('post').find().toArray()
    // 응답.send(result[0].title)
    응답.render('list.ejs', { posts : result })
})

app.get('/time', async (요청, 응답) => {
    응답.render('time.ejs', { date : new Date() })
})