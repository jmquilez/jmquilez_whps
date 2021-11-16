const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const customStrat = require('passport-custom').Strategy;

const User = require('../models/user');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

passport.use('local-signup', new customStrat(
    async function (req, done) {
        const us = await User.findOne({email: req.body.email});
        //console.log(us);
        if (us) {
            return done(null, false, req.flash('signups', 'email taken already.'));
        } else {
            const newUser = new User();
            newUser.user_name = req.body.user_name
            newUser.name = req.body.name
            newUser.surname = req.body.surname;
            newUser.email = req.body.email;
            newUser.password = newUser.encryptPassword(req.body.password); 
            newUser.sex = req.body.sex;
            newUser.date = req.body.date;
            newUser.fav_color = req.body.color;
            await newUser.save()
            done(null, newUser);
        }
        
    }
));

passport.use('local-signin', new customStrat(
    async function (req, done) {
        const ues = await User.findOne({email: req.body.email});
        if (!ues) {
            console.log("nope")
            return done(null, false, req.flash('signIns', 'User doesnt exist'));
        }
        if (!ues.comparePassword(req.body.password)) {
            console.log("nopase")
            return done(null, false, req.flash('signIns', 'Incorrect Password'));
        }

        req.session.userId = ues._id;
        req.session.admin = true

        console.log(req.session.userId, req.session.admin)

        done(null, ues);
    }
))

/**{
    usernameField: 'email',
    customField: 'user_name',
    /*userField: 'user',
    surnameField: 'surname',
    emailField: 'email',*/
    //passwordField: 'password',
/*repField: 'repeat_password',
sexField: 'sex',
dateField: 'date',
colorField: 'color',*/
    //passReqToCallback: false
//}, async (req, email, password, done/*user_name, name, surname, email, password, repeat_password, sex, date, color, done*/) => {
    //const newUs = new User();
/*newUs.user_name = user_name;
newUs.name = name;
newUs.surname = surname;*/
    //newUs.email = email;
    //newUs.password = password;
/*newUs.sex = sex;
newUs.date = date;
newUs.fav_color = color;*/
    //await newUs.save();
    //done(null, newUs);
//} */