const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const customStrat = require('passport-custom').Strategy;
const { uuid } = require('uuidv4');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const multa = require('multer');

const gc = new Storage({
    keyFilename: path.join(__dirname, "..//tics-332218-fa68b13dfa5d.json"),
    projectId: 'tics-332218'
})

gc.getBuckets().then(x => {
    console.log(x)
});

const multer = multa({
    storage: multa.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

const bucket = gc.bucket('jmquilez');

const User = require('../models/user');

const Bucket = require('../models/bucket');

var serie;

async function veris() {
    serie = uuid
    const usap = await Bucket.findOne({ title: serie })
    if (usap) {
        veris()
    }
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

async function verif(req, done) {
    serie = uuid();

    const usap = await Bucket.findOne({ title: serial })
    if (usap) {
        verif()
    }
    const newPost = new Bucket();
    newPost.author = req.session.userId;
    newPost.date = Date();
    newPost.title = serial;
    newPost.description = "yes";
    newPost.likes = 0;
    await newPost.save();
    done(null, newPost, null);
}

passport.use('postafile', new customStrat(
    async function (req, done) {
        async function verify() {
            console.log('requestbody',  req.body);
            const serp = uuid();
            const usap = await Bucket.findOne({ title: serp })
            if (usap) {
                verify()
            }
            const ext = path.extname(req.file.originalname);
            
            const newPost = new Bucket();
            if (ext == '.jpeg' || ext == '.jpg' || ext == '.png' || ext == '.gif' || ext == '.tiff' || ext == '.psd' || ext == '.pdf') {
                newPost.filetype = 'image';
                newPost.extension = ext.substring(1, ext.length);
                newPost.url = `https://storage.googleapis.com/jmquilez/${serp}`;
                console.log(ext)
                console.log('image');
            } else if (ext == '.mp4' || ext == '.avi' || ext == '.wmv' || ext == '.flv' || ext == '.mkv' || ext == '.f4v' || ext == '.avchd' || ext == '.swf' || ext == '.webm' || ext == '.mpeg-2') {
                newPost.filetype = 'video';
                newPost.extension = ext.substring(1, ext.length);
                if (req.body.checkerboard) {
                    newPost.isHLSCoded = false
                    newPost.url = `https://storage.googleapis.com/jmquilez/${serp}`;
                } else {
                    newPost.isHLSCoded = true
                    newPost.url = `https://storage.googleapis.com/jmquilez/${serp}/${serp}.m3u8`;
                }
                console.log(ext)
                console.log('video')
            } else if (ext == '.mov' || ext == '.MOV') {
                newPost.filetype = 'video';
                newPost.extension = 'mp4';
                if (req.body.checkerboard) {
                    newPost.isHLSCoded = false
                    newPost.url = `https://storage.googleapis.com/jmquilez/${serp}`;
                } else {
                    newPost.isHLSCoded = true
                    newPost.url = `https://storage.googleapis.com/jmquilez/${serp}/${serp}.m3u8`;
                }
                console.log("nope")
                //res.status(400).send('Only videos, photos, gifs or pdfs');
            } else {
                console.log("loie")

            }
            
            //newPost.extension = ext.substring(1, ext.length);
            newPost.author = req.session.user_name;
            newPost.date = Date();
            newPost.id = serp;
            
            newPost.title = req.body.titl;
            newPost.description = req.body.descr;
            newPost.likes = 0;
            console.log('iscoded', newPost.isHLSCoded)
            
            await newPost.save();
            done(null, newPost, null);
        }
        verify()
        //veris();

    }
))

passport.use('local-signup', new customStrat(
    async function (req, done) {
        const us = await User.findOne({ email: req.body.email });
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
            req.session.userId = newUser._id;
            req.session.user_name = newUser.user_name;
            req.session.user = newUser.name;
            req.session.email = newUser.email;
            req.session.admin = true
            done(null, newUser, req.flash('signupproperly', `Signed in properly, Mr/Mrs ${newUser.name}`));
        }

    }
));

passport.use('local-signin', new customStrat(
    async function (req, done) {
        const ues = await User.findOne({ email: req.body.email });
        if (!ues) {
            console.log("nope")
            return done(null, false, req.flash('signIns', 'User doesnt exist'));
        }
        if (!ues.comparePassword(req.body.password)) {
            console.log("nopase")
            return done(null, false, req.flash('signIns', 'Incorrect Password'));
        }

        req.session.userId = ues._id;
        req.session.user_name = ues.user_name;
        req.session.user = ues.name;
        req.session.email = ues.email;
        req.session.admin = true

        console.log(req.session.userId, req.session.admin)

        done(null, ues, req.flash('signinproperly', `Signed in properly, Mr/Mrs ${ues.name}`));
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