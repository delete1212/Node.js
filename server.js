const express = require('express')
const app = express()

const methoOverride = require('method-override')
const bcrypt = require('bcrypt')
require('dotenv').config()

app.use(methoOverride('_method'))
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true})) 

const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const MongoStore = require('connect-mongo')

const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3');
const s3 = new S3Client({
    region : 'ap-northeast-2',
    credentials : {
        accessKeyId : process.env.Accesskey,
        secretAccessKey : process.env.SecAccessKey
    }
})
const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'deltabucks',
      key: function (요청, file, cb) {
        cb(null, Date.now().toString())
      }
    })
  })

const { createServer } = require('http')
const { Server } = require('socket.io')
const server = createServer(app)
const io = new Server(server) 

app.use(session({
    resave : false,
    saveUninitialized : false,
    secret : 'qwer1234',
    cookie: {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
    },
    store : MongoStore.create({
        mongoUrl : process.env.DB_URL,
        dbName : 'forum',
    })
}))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
    console.log(user)
    process.nextTick(() => {
        done(null, { id: user._id, username: user.username })
    })
  })

  passport.deserializeUser(async(user, done) => {
    let result = await db.collection('user').findOne({_id : new ObjectId(user.id)})
    delete result.password
    process.nextTick(() => {
        return  done(null, result)
    })
  })

const { MongoClient, ObjectId } = require('mongodb')
const connectDB = require('./database.js')

let db
connectDB.then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')
  server.listen(process.env.PORT, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
})
}).catch((err)=>{
  console.log(err)
})

function loginplz(요청, 응답, next){
    if(!요청.user){
        응답.send('로그인을 해주세요')
    }
    next()
}
function timeCheck(요청, 응답, next){
    console.log(new Date())
    next()
}
function logCheck(요청, 응답, next){
    if(요청.body.username=='' || 요청.body.password==''){
        응답.send('닉네임 및 비밀번호가 비어있습니다.')
    } else {
        next()
    }
}

app.get('/', (요청, 응답) => {
    응답.sendFile(__dirname + '/index.html')
})

app.get('/news', (요청, 응답) => {
    db.collection('post').insertOne({title : '흠'})
    응답.send('흐림')
})

app.get('/shop', loginplz, function(요청, 응답){
    응답.send('쇼핑')
})

app.get('/about', loginplz, (요청, 응답) => {
    응답.sendFile(__dirname + '/about.html')
})

app.get('/list/:page', timeCheck, async (요청, 응답) => {
    let totalItems = await db.collection('post').countDocuments();
    let i = 5 * (요청.params.page - 1)
    let result = await db.collection('post').find().skip(i).limit(5).toArray()
    // 응답.send(result[0].title)
    응답.render('list.ejs', { posts : result, totalItems : totalItems, user: 요청.user || null })
})
app.get('/list', async (요청, 응답) => {
    응답.redirect('/list/1')
})

app.get('/time', async (요청, 응답) => {
    응답.render('time.ejs', { date : new Date() })
})

app.get('/write', (요청, 응답) =>{
    if(요청.user){
        return 응답.render('write.ejs', { username: 요청.user.username })
    }
    응답.send('로그인을 해주세요!')
})

app.post('/add', upload.single('img1'), async (요청, 응답) => {
    try{
        if (요청.body.title == ''){
            응답.send('제목을 입력해주세요!')
        } else {
            await db.collection('post').insertOne({
                title : 요청.body.title,
                content : 요청.body.content,
                img : 요청.file ? 요청.file.location : '',
                user : 요청.user._id,
                username : 요청.user.username
            })
            응답.redirect('/list/1')
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
            응답.render('detail.ejs', {post : result, user: 요청.user || null})
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
            응답.redirect('/detail/' + Id.toString())
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
app.put('/edit', async (요청, 응답)=>{
    await db.collection('post').updateOne({ _id : new ObjectId(요청.body.id) },
      {$set : { title : 요청.body.title, content : 요청.body.content }
    })
    응답.redirect('/list')
}) 
app.delete('/delete', async(요청, 응답)=>{
    await db.collection('post').deleteOne({
        _id : new ObjectId(요청.query.docid),
        user : new ObjectId(요청.user._id)
    })
    응답.send('삭제완료')
})

passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
    let result = await db.collection('user').findOne({ username : 입력한아이디})
    if (!result) {
      return cb(null, false, { message: '아이디 DB에 없음' })
    }

    if(await bcrypt.compare(입력한비번, result.password)){
      return cb(null, result)
    } else {
      return cb(null, false, { message: '비번불일치' });
    }
  }))

app.get('/login', async (요청, 응답)=>{
    console.log(요청.user)
    응답.render('login.ejs', {user: 요청.user || null})
})
app.post('/login', logCheck, async (요청, 응답, next) => {
    passport.authenticate('local', (error, user, info) => {
        if (error) return 응답.status(500).json(error);
        if (!user) return 응답.status(400).json(info.message);

        요청.logIn(user, (err) => {
            if (err) return next(err);
            응답.redirect('/');
        });
    })(요청, 응답, next);
})

app.get('/logout', (요청, 응답, next) => {
    요청.logout((err) => {
        if (err) {
            return next(err)
        }
        응답.redirect('/login')
    })
})

app.get('/register', (요청, 응답) => {
    응답.render('register.ejs')
})
app.post('/register', logCheck, async(요청, 응답) => {

    
    const user = await db.collection('user').findOne({ username : 요청.body.username });
    if (user) {
        return 응답.status(400).json({ message: '닉네임 중복됨' });
    }
    

    let 해시 = await bcrypt.hash(요청.body.password, 10)

    await db.collection('user').insertOne({
        username : 요청.body.username,
        password : 해시,
    })
    응답.redirect('/')
})

app.use('/shop', require('./routes/shop.js'))

app.get('/search', async (요청, 응답) => {
        let 검색조건 = [
          {$search : {
            index : 'title_index',
            text : { query : '요청.query.val', path : 'title' }
          }}
        ]

    let result = await db.collection('post')
    .find({ $text : { $search : 요청.query.val } }).aggregate(검색조건).toArray()
    응답.render('search.ejs', { posts : result})
})

app.get('/chat/request', async (요청, 응답)=>{
    await db.collection('chatroom').insertOne({
      member : [요청.user._id, new ObjectId(요청.query.writerId)],
      date : new Date(),
      chat : [],
      order : []
    })
    응답.redirect('/chat/list')
})
  
app.get('/chat/list', async (요청, 응답)=>{
    let result = await db.collection('chatroom').find({ member : 요청.user._id }).toArray()
    응답.render('chatlist.ejs', {글목록 : result, user: 요청.user || null})
}) 
app.get('/chat/detail/:id', async (요청, 응답)=>{
    const check = await db.collection('chatroom').findOne({ 
        _id: new ObjectId(요청.params.id),
        member: new ObjectId(요청.user._id)
    })
    if(check){
        let result = await db.collection('chatroom').findOne({ _id : new ObjectId(요청.params.id) })
        응답.render('chatdetail.ejs', {글목록 : [result], user: 요청.user})
    } else {
        응답.send('접근할 수 없는 채팅방입니다!')
    }
})

io.on('connection', (socket)=>{
    socket.on('ask-join', async (data) => {
        console.log(data)
        socket.join(data)
    })
    socket.on('message-send', async (data)=>{
        console.log(data)
        await db.collection('chatroom').updateOne({ _id : new ObjectId(data.room) },
            {
                $push: { chat: data.msg, order: data.sender },
            }
        )
        io.to(data.room).emit('message-broadcast', { msg: data.msg, sender: data.sender })
    })
})

app.get('/stream/list', (요청, 응답) => {
    응답.writeHead(200, {
        "Connection": "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
    })

    응답.write('event: msg\n')
    응답.write('data: babo\n\n')
})




app.get('/game', async (요청, 응답)=>{

    응답.render('game.ejs', { user: 요청.user || null })
})
app.get('/game/horserace', async (요청, 응답)=>{

    응답.render('horserace.ejs', { user: 요청.user || null })
})