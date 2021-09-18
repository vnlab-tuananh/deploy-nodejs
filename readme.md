# I. Tạo tính năng đăng ký thành viên

### Các bước khi user vào blog

Đăng ký tài khoản -> Đăng nhập -> Viết bài -> Xem bài

### Các bước thực hiện

1. Tạo giao diện người dùng
   
+ Thư mục `views`
+ File name : register.ejs

```angular2html
// register.ejs
<form action="/users/register" method="POST" enctype="multipart/form-data">
    <div class="control-group">
        <div class="form-group floating-label-form-group controls">
            <label>User Name</label>
            <input type="text" class="form-control" placeholder="User Name" id="username"
                   name="username">
        </div>
    </div>
    <div class="control-group">
        <div class="form-group floating-label-form-group controls">
            <label>Password</label>
            <input type="password" class="form-control" placeholder="Password" id="password"
                   name="password">
        </div>
    </div>
    <br>
    <div class="form-group">
        <button type="submit" class="btn btn-primary">Register</button>
    </div>
</form>
```
Chú ý :
+ action : /users/register
+ password : type="password" -> biến ký tự trong form thành dấu *

2. Xử lý router để hiển thị trang register new user
+ Thư mục : `controller`
+ File name : newUser.ejs

```angular2html
// newUser.js
module.exports = (req, res) => {
    res.render('register') // render register.ejs
}
```

+ Khai báo controller trong index.js

```angular2html
const newUserController = require('./controllers/newUser')
```

+ Tạo router để truy xuất

```angular2html
app.get('/auth/register', newUserController)
```

+ Tạo menu để có thể click từ giao diện web trong ` views/layouts/navbar.ejs`

```angular2html
<div class="collapse navbar-collapse" id="navbarResponsive">
     <ul class="navbar-nav ml-auto">
         <li class="nav-item">
            <a class="nav-link" href="/">Home</a>
         </li>
         <li class="nav-item">
            <a class="nav-link" href="/posts/new">New Post</a>
         </li>
         <li class="nav-item">
            <a class="nav-link" href="/auth/register">New User</a>
         </li>
     </ul>
</div>

```

3. Tạo User Model để mapping thông tin user vào database

+ Thư mục `models`
+ File name : User.js

```angular2html
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const UserSchema = new Schema({
     username: String,
     password: String
});

// export model
const User = mongoose.model('User', UserSchema);
module.exports = User
```

4. Tạo controller xử lý đăng ký user

- Thiết lập router khi người dùng nhấn nút submit  `register`

```angular2html
// index.js
const storeUserController = require('./controllers/storeUser')
app.post('/users/register', storeUserController)
```

- Tại sao phải định nghĩa router trên ?

```angular2html
-> <form action="/users/register" method="POST" enctype="multipart/form-data">
```

- Xử lý controller logic đăng ký user mới
+ Thư mục : controller
+ File name :  storeUser.js
```angular2html
// storeUser.js
const User = require('../models/User.js')
module.exports = (req, res) => {
        User.create(req.body, (error, user) => {
        res.redirect('/')
    })
}
```

- Chạy thử kiểm tra trong db -> Mật khẩu không được mã hóa. Bị lộ -> mất an toàn

5. Mã hóa mật khẩu

- Cài thư viện : `npm i --save bcrypt`
- Lưu ý trong quá trình cài đặt dễ dẫn đến lỗi do nhiều máy chưa cài python
- Xử lý : https://github.com/kelektiv/node.bcrypt.js/issues/697
  
```angular2html

```

- Khai báo và sử dụng bcrypt để mã hóa mật khẩu

```angular2html
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')
const UserSchema = new Schema({
    username: String,
    password: String
});
UserSchema.pre('save', function (next) {
    const user = this
    bcrypt.hash(user.password, 10, (error, hash) => {
        user.password = hash
        next()
    })
})

```

Giải thích:
- Hàm .pre(...) để thông báo cho Mongoose biết là sẽ cần thực hiện hàm trong tham số
  thứ 2 trước khi lưu vào Users collection. Điều này cho phép chúng ta thay đổi dữ liệu
  trước khi lưu vào DB.

- Hàm bcrypt.hash(...) để mã hóa cần hai giá trị đầu vào: một là mật khẩu dạng
  thô, hai là số lần mã hóa.
  
- Tham số cuối cùng là callback, được gọi sau khi quá trình mã hóa hoàn thành. Hàm
  next() có tác dụng là báo cho Mongoose chuyển sang hàm tiếp theo, tiếp tục tạo dữ liệu
  vào lưu vào DB
  
6. Validation khi register member trùng nhau - Sử dụng mongoose

- Ngoài validate data, mongoose còn tự kiểm tra data có bị duplicate và return lỗi
- Trong models/User.js, chúng ta sẽ update lại UserSchema:

```angular2html
...
const UserSchema = new Schema({
 username: {
     type: String,
     required: true,
     unique: true
 },
 password: {
     type: String,
     required: true
 }
});

```
Giải thích :
+ required : không cho phép trường đó đc null
+ unique : không cho phép trường đó được trùng -> duy nhất

- Hiển thị error nếu đăng ký trùng

```angular2html
//  trong controllers/storeUser.js
module.exports = (req, res) => {
 User.create(req.body, (error, user) => {
     console.log(error)
     res.redirect('/')
 })
}

```
- Nếu có lỗi quay về trang đăng ký từ đầu

```angular2html
module.exports = (req, res) => {
User.create(req.body, (error, user) => {
    if (error) {
        return res.redirect('/auth/register')
    }
    res.redirect('/')
  })
}

```
# I. Tạo tính năng đăng nhập

- Mô tả hoạt động :
+ Trên menu sẽ có một nút "Login"
+ Khi người dùng click vào menu "login" và nhập thông tin username, password đã đăng ký trước đó.
+ Nếu đăng nhập thành công, menu "login" sẽ chuyển thành menu "logout". 

- Bài tập về nhà