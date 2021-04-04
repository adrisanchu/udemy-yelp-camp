const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res) => {
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
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

// passport.authenticate middleware, passing Validation Strategy
// it could be google, github, ...
// we pass also settings to configure what to do during authentication
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    const { username } = req.body;
    req.flash('success', `Welcome back, ${username}!`);
    // get original URL from session (stored in middleware)
    // if going to /login directly, then redirect to /campgrounds
    const redirectUrl = req.session.returnTo || '/campgrounds';
    // once this info used, we delete it from the session
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res) => {
    // passport provides login() and logout() methods in the req object
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
});

module.exports = router;