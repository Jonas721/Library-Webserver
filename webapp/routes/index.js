var express = require('express');
var router = express.Router();

var Item = require('../models/item');
var User = require('../models/user');
const crypto = require('crypto');
const ensureLoggedIn = require('../middleware/loginMiddleware');

let currPage = 0;
maxPages = 100;
let lastSearchTerm = "gospel"; // default search value

// reads login status from session
function LoginStatus(req){
    this.loginPrompt = (req.session.isLoggedIn) ? "logout" : "login";
    this.loginLink = (req.session.isLoggedIn) ? "logout.html" : "login.html";
}

/* GET home page. */
router.get('/', function (req, res, next) {
    let loginStatus = new LoginStatus(req);
    res.render('index', {loginPrompt: loginStatus.loginPrompt, loginLink: loginStatus.loginLink, 
        numResults: 0, totalPages: 1});
});

/* GET search page. */
router.get('/search.html', async function (req, res, next) {
    PerformSearch(req, res, next, false);
});

/* search logic encapsulated to facilitate access from multiple routes */
function PerformSearch (req, res, next, mobileMode){
    let loginStatus = new LoginStatus(req);
    let mobile = (mobileMode ? "mobile" : "");
    // retrieve values from the query string
    let searchEntry = (typeof req.query.txtTitle === "undefined" ? lastSearchTerm: req.query.txtTitle)
    lastSearchTerm = searchEntry;
    currPage = isNaN(req.query.start) ? 0 : req.query.start * 10;
    if ((currPage / 10) >= maxPages) currPage = (maxPages - 1) * 10;
    if (currPage < 0) currPage = 0;

    // perform input validation
    let errorMsg = {
        msg: checkForAlphaNumericChars(searchEntry)
    }

    // prep for search query
    if (searchEntry != "")
        Item.setSearchTerm(searchEntry, false, currPage)
    else //hack to make nothing display on empty search per instructions
        Item.setSearchTerm("there are no books with this title because that would be weird", false, currPage)

    // search for the search term first, then search for count of results
    Item.search((err, results) => {
        Item.setSearchTerm(searchEntry, true);
        Item.search((err, length) => {
            length = (searchEntry == "" ? 0 : length);
            maxPages = (Math.ceil(length / 10))

            res.render(mobile + 'index', {layout: (mobile + 'layout'), 
                loginPrompt: loginStatus.loginPrompt, loginLink: loginStatus.loginLink,
                errorMsg: errorMsg, lastSearchTerm: lastSearchTerm, 
                items: results, numResults: length, 
                totalPages: maxPages, lastPage: (currPage / 10) - 1, nextPage: (currPage / 10) + 1})
        }, true);
    });
}

/* GET details page. */
router.get('/details.html', function (req, res, next) {
    let loginStatus = new LoginStatus(req);

    Item.setSearchId(req.query.book_id)
    Item.search((err, results) => {
        res.render('details', {loginPrompt: loginStatus.loginPrompt, loginLink: loginStatus.loginLink,
            book: results[0], subjects: results});
    });
});

/* GET login page. */
router.get('/login.html', function (req, res, next) {
    let loginStatus = new LoginStatus(req);
    res.render('login', {loginPrompt: loginStatus.loginPrompt, loginLink: loginStatus.loginLink});
});

/* POST login page. */
router.post('/login.html', function (req, res, next) {
    let loginStatus = new LoginStatus(req);

    User.search((err, results) => {
        let username = req.body.txtUsername;
        let password = req.body.txtPassword;
        let hashedPassword = hashPassword(password);
        
        results.forEach(user => {
            if (user.username === username){
                // hash user passwords and compare against table passwords
                if (user.hashedPassword === hashedPassword){
                    // store logged in user in session
                    req.session.user = user;
                    req.session.isLoggedIn = true;
                    // successful login
                    res.render('login', {loginPrompt: loginStatus.loginPrompt, loginLink: loginStatus.loginLink, 
                        msg : "Successfully logged in.", msgColor: "green"});
                }
            }
        });
        // failed login 
        if (!req.session.isLoggedIn) {
            res.render('login', {loginPrompt: loginStatus.loginPrompt, loginLink: loginStatus.loginLink, 
                msg : "No user with that username and password exist", msgColor: "red"});
        }
    });
});

/* GET logout page. */
router.get('/logout.html', function (req, res, next) {
    req.session.user = undefined;
    req.session.isLoggedIn = false;
    let loginStatus = new LoginStatus(req);

    // logged out
    res.render('login', {loginPrompt: loginStatus.loginPrompt, loginLink: loginStatus.loginLink,
        msg : "Successfully logged out.", msgColor: "green"
    });
});

/* GET maintain page. */
router.get('/maintain.html', ensureLoggedIn, function (req, res, next) {
    let loginStatus = new LoginStatus(req);
    let bookID = req.query.bookID;

    Item.setSearchId(bookID)
    Item.search((err, results) => {
        res.render('maintain', {loginPrompt: loginStatus.loginPrompt, loginLink: loginStatus.loginLink,
            book: results[0], bookID: bookID});
    });
});

/* POST maintain page. */
router.post('/maintain.html', ensureLoggedIn, function (req, res, next) {
    let loginStatus = new LoginStatus(req);

    // read new book info
    let bookID = req.body.bookID;
    let callNo = req.body.callNo;
    let author = req.body.author;
    let title = req.body.title;
    let pubInfo = req.body.pubInfo;
    let descript = req.body.descript;
    let series = req.body.series;
    let addAuthor = req.body.addAuthor;

    // validate input
    console.log("call, author, and title are: " + callNo +", " + author +", "+ title);
    console.log("boolean call, author, and title are: " + Boolean(callNo) +", " + Boolean(author) +", "+ Boolean(title))
    if (!callNo || !author || !title){
        // invalid input data; show error msg
        Item.setSearchId(bookID)
        Item.search((err, results) => {
            res.render('maintain', {loginPrompt: loginStatus.loginPrompt, loginLink: loginStatus.loginLink,
                book: results[0], bookID: bookID, msg: "ERROR; call number, author, and title must all be nonempty.", msgColor: "red"});
        });
    }
    else{
        // update table to reflect new values
        Item.updateData(bookID, callNo, author, title, pubInfo, descript, series, addAuthor);
        Item.search((err, results) => {
            Item.setSearchId(bookID)
            Item.search((err, results) => {
                res.render('maintain', {loginPrompt: loginStatus.loginPrompt, loginLink: loginStatus.loginLink,
                    book: results[0], bookID: bookID, msg: "SUCCESS", msgColor: "green"});
            });
        });
    }
});

// mobile views------------------------------------------------------------------------------------------

/* GET mobile search page. */
router.get('/mobilesearch.html', function (req, res, next) {
    res.render('mobilesearch', {layout: 'mobilelayout', numResults: 0, totalPages: 1});
});

/* GET mobile search results page. */
router.get('/mobileindex.html', function (req, res, next) {
    let errMsg = checkForAlphaNumericChars(req.query.txtTitle);
    if (errMsg != ""){
        res.render('mobilesearch', {layout: 'mobilelayout', numResults: 0, totalPages: 1, errMsg: errMsg});
    }
    else{
        PerformSearch(req, res, next, true);
    }
});

/* GET mobile details page. */
router.get('/mobiledetail.html', function (req, res, next) {
    Item.setSearchId(req.query.book_id)
    Item.search((err, results) => {
        res.render('mobiledetail', {layout: 'mobilelayout', book: results[0], subjects: results});
    });
});



module.exports = router;

/* return an error msg if testString is not alphanumeric chars only */
function checkForAlphaNumericChars(testString){
    let regEx = /^[a-zA-Z0-9 ']*$/; 

    // perform input validation
    if (regEx.test(testString)) {
        return("");
    } else {
        return("The input is invalid. Only alphanumeric characters are allowed.");
    }
} 

// hashes a password *gasp*
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}