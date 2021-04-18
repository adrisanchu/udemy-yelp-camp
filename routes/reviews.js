const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');


router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    // create new review (independent from any campground)
    const review = new Review(req.body.review);
    // add currentUser to review model as author
    review.author = req.user._id;
    // attach the review to a campground in an array of reviews
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'New review added successfully');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync( async(req, res) => {
    const { id, reviewId } = req.params;
    // find the campground and remove the review
    // using the pull() method (see Mongo docs)
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId }});
    // delete the review from reviews
    await Review.findByIdAndDelete(req.params.reviewId);
    // send back to campgrounds page
    req.flash('success', 'Review deleted successfully');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;