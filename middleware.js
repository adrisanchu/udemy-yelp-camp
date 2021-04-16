const { campgroundSchema } = require('./schemas.js');
const Campground = require('./models/campground');
const ExpressError = require('./utils/ExpressError');


module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        // store the url of origin to know the last page!
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in.');
        return res.redirect('/login');
    }
    next();
};

// Joi middleware for server side data validation
module.exports.validateCampground = (req, res, next) => {
    // destructuring the error from the Joi error object
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        // map through details array and join all messages separated by comma
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

// middleware to check if currUser is the author of the campground
module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};