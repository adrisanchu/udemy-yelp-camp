const Campground = require('../models/campground');

module.exports.index = async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async(req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    // authoring campground before creation
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'New campground created successfully');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        // nested populate, getting author for each review
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');  // this is the author of the campground, not the reviews!!
    // console.log(campground);
    if(!campground){
        req.flash('error', 'Sorry, the campground was not found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Sorry, the campground was not found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Campground updated successfully');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async(req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted successfully');
    res.redirect('/campgrounds');
};