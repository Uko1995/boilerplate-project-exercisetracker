const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI);

const exerciseSchema = new mongoose.Schema({
    description: {type: String, required: true},
    duration: {type: String, required: true},
    date: String
})

const Schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    exercises: [exerciseSchema]
});

const User = mongoose.model('User', Schema);

module.exports = User;