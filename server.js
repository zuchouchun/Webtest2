const express = require('express');
const mysql = require('mysql');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;  // 使用 Heroku 提供的端口或默认本地的 3000 端口

// 设置 MySQL 连接：如果有 Heroku 的 CLEARDB_DATABASE_URL 环境变量，则使用它，否则使用本地开发配置
let connection;
if (process.env.CLEARDB_DATABASE_URL) {
    // 使用 Heroku ClearDB MySQL 的连接配置
    connection = mysql.createConnection(process.env.CLEARDB_DATABASE_URL);
} else {
    // 本地开发使用的 MySQL 配置
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',  // 本地开发使用的 MySQL 用户
        password: 'Sunjingxuan@1',  // 本地开发使用的 MySQL 密码
        database: 'commentsDB'  // 数据库名称
    });
}

// 连接 MySQL 数据库
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// 解析 JSON 数据
app.use(express.json());

// 设置静态文件目录，确保静态页面（如 index.html）能够正确提供
app.use(express.static(path.join(__dirname)));

// 提交留言
app.post('/api/comments', (req, res) => {
    const comment = req.body.content;
    if (!comment) {
        return res.status(400).send('No content provided');
    }

    const sql = 'INSERT INTO comments (content) VALUES (?)';
    connection.query(sql, [comment], (err, result) => {
        if (err) {
            console.error('Error inserting comment: ', err);
            return res.status(500).send('Error saving comment');
        }
        res.send('Comment added successfully');
    });
});

// 获取所有留言
app.get('/api/comments', (req, res) => {
    const sql = 'SELECT * FROM comments ORDER BY created_at DESC';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching comments: ', err);
            return res.status(500).send('Error fetching comments');
        }
        res.json(results);
    });
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
