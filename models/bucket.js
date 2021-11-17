const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const passport = require('passport');

const { Schema } = mongoose

const bucket = new Schema({
    author: String, 
    date: Date, 
    title: String,
    description: String,
    likes: Number
});

bucket.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(12));
};

bucket.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('bucket', bucket);