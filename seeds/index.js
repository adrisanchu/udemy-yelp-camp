const mongoose = require('mongoose');
const cities = require('./cities');
const cloudinaryImages = require('./imgs');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

// function to get random result from an array, limited by its length
const sample = (array) => array[Math.floor(Math.random() * array.length)];

// generate 50 new random campgrounds in our DB
// by randomly looping through cities and seedHelpers
const seedDB = async() => {
    // first delete everything in our collection
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const random6 = Math.floor(Math.random() * 6);
        const random6bis = Math.floor(Math.random() * 6);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            // set all campgrounds to username = 'adri'
            author: '6069b56dde3f557ae2018cb9',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            // random img from unsplash API
            // image: 'https://source.unsplash.com/collection/483251',
            // 2 random imgs from my cloudinary account
            images: [
                {
                    url:`${cloudinaryImages[random6].url}`,
                    filename: `${cloudinaryImages[random6].filename}`
                },
                {
                    url:`${cloudinaryImages[random6bis].url}`,
                    filename: `${cloudinaryImages[random6bis].filename}`
                }
            ],
            description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ullam soluta dignissimos obcaecati tenetur qui doloribus fugit nihil, hic ad voluptate blanditiis quae eius commodi impedit in nulla voluptatibus, sequi nam!",
            price: price,
            // set all campgrounds located at Madrid by default !
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            }
        })
        await camp.save();
    }
}

// close connection once it's done
seedDB().then(() => {
    mongoose.connection.close();
});