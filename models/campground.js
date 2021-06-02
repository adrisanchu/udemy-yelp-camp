const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

// activate Mongoose virtuals
const opts = { toJSON: { virtuals: true } };

const ImageSchema = new Schema({
    url: String,
    filename: String
});

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    images: [ImageSchema],
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties').get(function () {
    // pass campground._id, description and title to .properties
    // to access it later on on the view, so then we can use it like:
    // `<a href='/campgrounds/${this._id}'>${this.title}</a>`;
    return {
        id: this._id,
        title: this.title,
        description: this.description
      }
});

CampgroundSchema.post('findOneAndDelete', async function(doc) {
    // check if something is found on the db
    if(doc) {
        // doc contains an array of reviews []
        // we delete each review found on that array when deleting a campground
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);