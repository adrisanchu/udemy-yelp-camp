const express = require('express');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');
const { reviewSchema } = require('./schemas');

const campgrounds = require('./routes/campgrounds');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false  // method deprecated. see mongo docs
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// routes
app.use('/campgrounds', campgrounds);

// Joi middleware for reviews
const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        // map through details array and join all messages separated by comma
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
});

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    // create new review (independent from any campground)
    const review = new Review(req.body.review);
    // attach the review to a campground in an array of reviews
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync( async(req, res) => {
    const { id, reviewId } = req.params;
    // find the campground and remove the review
    // using the pull() method (see Mongo docs)
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId }});
    // delete the review from reviews
    await Review.findByIdAndDelete(req.params.reviewId);
    // send back to campgrounds page
    res.redirect(`/campgrounds/${id}`);
}));

// 404 page (in case the path does not exist)
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found :(', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Something went wrong :(';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});