'use strict';

var db = require('../config/db');

function User(username, hashedPassword) {
    this.username = username;
    this.hashedPassword = hashedPassword;
}

let sqlQuery = "select * from users ";

// callback(error, results) - results is a stack of Users
User.search = function (callback) {
    db.pool.getConnection(function (err, connection) {
        try{
            connection.query(sqlQuery, function (err, data) {
                connection.release();              
                if (err) return callback(err);
    
                if (data) {
                    var results = [];
                    for (var i = 0; i < data.length; ++i) {
                        var user = data[i];
                        results.push(new User(user.Username, user.HashedPassword));
                    }
                    callback(null, results);
                } else {
                    callback(null, null);
                }
            });
        }
        catch(e){
            return callback(e, null);
        }
    });
}

module.exports = User;