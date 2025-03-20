// middleware to ensure user is logged in via session
function ensureLoggedIn(req, res, next) {
    if (req.session.isLoggedIn) {
        return next();
    } else {
        res.render('error', {
            message: "Must be logged in to acccess the maintenance page",
            error: {}
        });
    }
}

module.exports = ensureLoggedIn;