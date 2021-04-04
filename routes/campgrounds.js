const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas.js');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

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
}

router.get('/', async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});

router.post('/', validateCampground, catchAsync(async(req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'New campground created successfully');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.get('/new', (req, res) => {
    if(!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in.');
        return res.redirect('/login');
    }
    res.render('campgrounds/new');
});

router.get('/:id', catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground){
        req.flash('error', 'Sorry, the campground was not found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error', 'Sorry, the campground was not found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));

router.put('/:id', catchAsync(async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Campground updated successfully');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', catchAsync(async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted successfully');
    res.redirect('/campgrounds');
}));

module.exports = router;