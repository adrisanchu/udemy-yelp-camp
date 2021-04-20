const User = require('../models/user');


module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res) => {
    // if error, we will flash the error message on top
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        // console.log(registeredUser);
        // once we register, we use .login() method (from passport) to login
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', `Welcome to Yelp Camp, ${username}!`);
            res.redirect('/campgrounds');
        });
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res) => {
    const { username } = req.body;
    req.flash('success', `Welcome back, ${username}!`);
    // get original URL from session (stored in middleware)
    // if going to /login directly, then redirect to /campgrounds
    const redirectUrl = req.session.returnTo || '/campgrounds';
    // once this info used, we delete it from the session
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    // passport provides login() and logout() methods in the req object
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
};