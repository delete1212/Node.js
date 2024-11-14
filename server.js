const express = require('express')
const app = express()

app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true})) 



const { MongoClient, ObjectId } = require('mongodb')

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

app.get('/write', (요청, 응답) =>{
    응답.render('write.ejs')
})

app.post('/add', async (요청, 응답) => {
    try{
        if (요청.body.title == ''){
            응답.send('제목을 입력해주세요!')
        } else {
            await db.collection('post').insertOne({title : 요청.body.title, content : 요청.body.content})
            응답.redirect('/list')
        }
    } catch(e) {
        console.log(e)
        응답.status(500).send('서버에러')
    }
})

app.get('/detail/:aaaa', async (요청, 응답)=>{
    try {
        const id = 요청.params.aaaa
        if(ObjectId.isValid(id)){
            const result = await db.collection('post').findOne({ _id : new ObjectId(id) })
            응답.render('detail.ejs', {post : result})
        } else {
            응답.status(400).send('잘못된 요청')
        }
    } catch(e) {
        console.log(e)
        응답.status(500).send('서버에러')
    }
})

app.post('/detail/:postId/comment', async (요청, 응답) => {
    const Id = 요청.params.postId
    try{
        if (요청.body.comments == ''){
            응답.send('댓글을 입력해주세요!')
        } else {
            await db.collection('post').updateOne({ _id: new ObjectId(Id)}, {$push: { comments: { text:요청.body.comments, createdAt: new Date()}}})
            응답.redirect('/list')
        }
    } catch(e) {
        console.log(e)
        응답.status(500).send('서버에러')
    }
})

app.get('/edit/:id', async (요청, 응답) =>{
    const id = 요청.params.id
    const result = await db.collection('post').findOne({ _id : new ObjectId(id) })
    응답.render('edit.ejs', {result : result})
})