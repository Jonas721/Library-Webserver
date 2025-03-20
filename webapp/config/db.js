
var mysql = require('mysql');

exports.pool = mysql.createPool({
    host: 'mysql1',
    user: 'root',
    password: 'mysql',//changed from password
    database: 'mydb'
});
