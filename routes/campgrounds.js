const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const campground = require('../models/campground');

// Joi middleware for server side data validation
const validateCampground = (req, res, next) => {
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
const isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

router.get('/', async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});

router.post('/', isLoggedIn, validateCampground, catchAsync(async(req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    // authoring campground before creation
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'New campground created successfully');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

router.get('/:id', catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');
    // console.log(campground);
    if(!campground){
        req.flash('error', 'Sorry, the campground was not found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Sorry, the campground was not found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Campground updated successfully');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted successfully');
    res.redirect('/campgrounds');
}));

module.exports = router;