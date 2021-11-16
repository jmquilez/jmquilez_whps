const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const passport = require('passport');

const { Schema } = mongoose

const user = new Schema({
    user_name: String,
    name: String,
    surname: String,
    email: String,
    password: String,
    sex: String,
    date: Date, 
    fav_color: String
});

user.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(12));
};

user.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('users', user);