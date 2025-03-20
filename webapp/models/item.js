'use strict';

var db = require('../config/db');

function Item(id, callNo, author, title, pubInfo, descript, series, addAuthor, updateCount, subject) {
    this.id = id;
    this.callNo = callNo;
    this.author = author;
    this.title = title;
    this.pubInfo = pubInfo;
    this.descript = descript;
    this.series = series;
    this.addAuthor = addAuthor;
    this.updateCount = updateCount;
    this.subject = subject; //undefined if querying only the items table
}

function Count(id) {
    this.id = id;
}

let sqlQuery = ""
Item.setSearchTerm = function (searchTerm, getCount, offset){
    sqlQuery = `select * from items 
                    where title like \"%${searchTerm}%\" 
                    order by title limit 10
                    offset ${offset}`;
    if (getCount){
        sqlQuery = `select count(*) as count from (
            select * from items 
            where title like \"%${searchTerm}%\" 
        ) as subquery`;
    }
}

Item.setSearchId = function (searchID){
    sqlQuery = `select * from items left join booksubjects
                    on items.id = booksubjects.BookID
                    where items.id = ${searchID};`;
}

Item.updateData = function(bookID, callNo, author, title, pubInfo, descript, series, addAuthor){
    sqlQuery = `UPDATE items
        SET CALLNO = "${callNo}", 
        AUTHOR = "${author}",
        TITLE = "${title}",
        PUB_INFO = "${pubInfo}",
        DESCRIPT = "${descript}",
        SERIES = "${series}",
        ADD_AUTHOR = "${addAuthor}"
        WHERE id = "${bookID}";`;
}

// callback(error, results) - results is a stack of Items
Item.search = function (callback, getcount) {
    db.pool.getConnection(function (err, connection) {
        try{
            connection.query(sqlQuery, function (err, data) {
                //console.log(data);
                connection.release();              
                if (err) return callback(err);
    
                if (data) {
                    if (getcount){
                        var length = data[0].count
                        callback(null, length);
                    }
                    else{
                        var results = [];
                        for (var i = 0; i < data.length; ++i) {
                            var item = data[i];
                            results.push(new Item(item.ID, item.CALLNO, item.AUTHOR, item.TITLE, item.PUB_INFO,
                                item.DESCRIPT, item.SERIES, item.ADD_AUTHOR, item.UPDATE_COUNT, item.Subject));
                        }
                        callback(null, results);
                    }
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

module.exports = Item;