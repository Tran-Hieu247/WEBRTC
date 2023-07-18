const express = require('express');
const path = require('path');
const mysql = require('mysql2');
// const admin = require('firebase-admin');
// const serviceAccount = require('./serviceAccountKey.json');
const app = express();
const port = 3000;

// tạo kết nối đến cơ sở dữ liệu MySQL
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '123456',
//   database: 'webrtc'
// });
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: 'https://WEBRTC.firebaseio.com'
// });
// const db = admin.database();
// kết nối đến cơ sở dữ liệu
// connection.connect((err) => {
//   if (err) {
//     console.error('Lỗi kết nối: ' + err.stack);
//     return;
//   }
//   console.log('Kết nối thành công với id ' + connection.threadId);
// });

app.use(express.static(path.join(__dirname, 'view')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'image')));

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'/view/index.html'));
})

app.listen(port, () =>{
    console.log(`Example app listening  at ${port}`);
})

// module.exports = db;
