module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        // store the url of origin to know the last page!
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in.');
        return res.redirect('/login');
    }
    next();
};