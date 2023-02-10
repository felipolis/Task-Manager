// This file will handle the connection to the mongodb database

const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();
mongoose.Promise = global.Promise;

// To prevent deprecation warnings
mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true }).then(() => {
    console.log('Connected to MongoDB');
}).catch((e) => {
    console.log('Error connecting to MongoDB');
    console.log(e);
});


module.exports = {
    mongoose
};