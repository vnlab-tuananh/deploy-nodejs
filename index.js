const express = require('express')
const app = new express()
const ejs = require('ejs')
app.set('view engine', 'ejs')


const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ type: 'application/json' }))
app.use(bodyParser.raw());

const newPostController = require('./controllers/newPost')
const homeController = require('./controllers/home')
const storePostController = require('./controllers/storePost')
const getPostController = require('./controllers/getPost')
const newUserController = require('./controllers/newUser')
const storeUserController = require('./controllers/storeUser')
const loginController = require('./controllers/login')
const loginUserController = require('./controllers/loginUser')

const mongoose = require('mongoose');
const mongoAtlasUri = "mongodb+srv://anhtbok:87654321@cluster0.i6xzm.mongodb.net/my_database?retryWrites=true&w=majority";

try {
    // Connect to the MongoDB cluster
    mongoose.connect(
        mongoAtlasUri,
        { useNewUrlParser: true, useUnifiedTopology: true },
        () => console.log(" Mongoose blog mindx is connected")
    );
} catch (e) {
    console.log("could not connect");
}

// const databaseurl = "mongodb+srv://anhtbok:87654321@cluster0.i6xzm.mongodb.net/my_database?retryWrites=true&w=majority";
// mongoose.connect(databaseurl, { useNewUrlParser: true })

const fileUpload = require('express-fileupload')
app.use(fileUpload())



//Đăng ký thư mục public.....
app.use(express.static('public'))

const customMiddleWare = (req, res, next) => {
    console.log('Custom middle ware called')
    next()
}
app.use(customMiddleWare)

const validateMiddleware = require("./middleware/validationMiddleware");
app.use('/posts/store', validateMiddleware)

//Tao server
// app.listen(4000, () => {
//     console.log('OK. App listening on port 4000')
// })

app.listen(process.env.PORT || 3000, () => {
    console.log(`app is running on port ${process.env.PORT}`);
})

app.get('/', homeController)

app.get('/posts/new',newPostController)

app.get('/post/:id', getPostController)

app.post('/posts/store', storePostController)

app.get('/auth/register', newUserController)

app.post('/users/register', storeUserController)

app.get('/auth/login', loginController);

app.post('/users/login',loginUserController)