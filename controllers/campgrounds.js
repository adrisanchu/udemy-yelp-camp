const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


module.exports.index = async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async(req, res, next) => {
    // use MapBox API to get lat long
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    
    // map over req.files to get access to the images attached in the form (new campground)
    campground.images = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));

    // add geometry from MapBox API (check the docs for more info)
    // what we want is stored in .features[0].geometry
    campground.geometry = geoData.body.features[0].geometry;
    // authoring campground before creation
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
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
    const imgsToDelete = req.body.deleteImages;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    imgs = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));
    // pass imgs one by one inside the array with spread
    campground.images.push(...imgs);
    // remove images to delete (if any) both in cloudinary and mongo
    if(imgsToDelete) {
        // delete each img in cloudinary
        for(let filename of imgsToDelete) {
            await cloudinary.uploader.destroy(filename);
        }
        // remove imgs in Mongo
        await campground.updateOne({ $pull: { images: { filename: { $in: imgsToDelete } } } });
    }
    await campground.save();
    req.flash('success', 'Campground updated successfully');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async(req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted successfully');
    res.redirect('/campgrounds');
};