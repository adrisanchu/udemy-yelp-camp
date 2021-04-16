const mongoose = require('mongoose');
const cities = require('./cities');
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
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            // set all campgrounds to username = 'adri'
            author: '6069b56dde3f557ae2018cb9',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            // random img from unsplash API
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ut ratione saepe pariatur perferendis repudiandae, fugit autem. Reiciendis, deleniti praesentium quam iusto nulla neque quo. Rem dolorem maxime perspiciatis voluptas vero. Error voluptates cumque quis optio aliquam dolorum recusandae officiis culpa nostrum perspiciatis quisquam, harum aspernatur porro eos necessitatibus debitis quas, consequatur, deleniti officia inventore quam odio. Ducimus nisi dignissimos fuga. Exercitationem consectetur beatae laudantium officiis itaque doloremque fuga dicta sit soluta similique quia commodi in veniam dolore labore facilis laboriosam delectus facere esse, illo, non modi! Veniam rem nostrum velit?',
            price: price
        })
        await camp.save();
    }
}

// close connection once it's done
seedDB().then(() => {
    mongoose.connection.close();
});