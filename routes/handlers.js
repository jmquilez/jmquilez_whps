const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const passport = require('passport');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const multa = require('multer');
const format = require('format');
const postales = require('../models/bucket');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const fspromises = require('fs').promises;
const fs = require('fs');
const fpeg = require('child_process').exec
var rimraf = require('rimraf');
const Users = require('../models/email');
const nodemailer = require('nodemailer');
const LocalStrategy = require('passport-local').Strategy
const customStrat = require('passport-custom').Strategy;

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const gc = new Storage({
    keyFilename: path.join(__dirname, "../tics-332218-fa68b13dfa5d.json"),
    projectId: 'tics-332218'
})

gc.getBuckets().then(x => {
    console.log(x)
});

const multer = multa({
    storage: multa.memoryStorage(),
    limits: {
        fileSize: 30 * 1024 * 1024,
    },
});

const bucket = gc.bucket('jmquilez');

// Routing

const { google } = require('googleapis');

const CLIENT_ID = "651275040234-7m1t2376il35fcvt06nm4eq421nt04r7.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = "1//04PxQk6UoJnHPCgYIARAAGAQSNwF-L9IrmGIeAXGThH3x9wi_ob99kSIg_DBh_vP6XwCnquTg0VfBR0esBnDm-RFtQ-LkGly2swE";

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const accessToken = oAuth2Client.getAccessToken();

const transport = nodemailer.createTransport({
    /*port: 587,
    secure: false,
    host: "smtp.example.com",*/
    /*host: 'molylosrockeros.herokuapp.com',
    port: 123,*/
    service: 'gmail',
    /*auth: {
        user: 'finalizer2869@gmail.com',
        pass: 'ESTAFADOR45',
    }*/
    auth: {
        type: "OAuth2",
        user: 'molylosrockeros@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
    },
});

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser((id, done) => {
    //const user = await Users.findById(id);
    done( /*null*/ null, id);
});

passport.use('new_register', new customStrat(
    async function(req, done) {
        var sentCount = 0

        function sendMs(transporter, options, header, erase, x, extins, done, req, firstTime) {
            return new Promise(function(resolve, reject) {
                transport.sendMail(options, function(err, info) {
                    if (err) {
                        console.log('there was an error.')
                        console.error(err);
                        if (firstTime == false) {
                            done(null, true, req.flash('signIns', `Failed to resend email stack, Mr/Mrs ${req.body.mail}. Please try again ☄️☄️☄️.`))
                        } else {
                            done(null, true, req.flash('signIns', `Failed to send 1st email stack, Mr/Mrs ${req.body.mail}. Please try again ☄️☄️☄️.`))
                        }

                        return
                    } else {
                        console.log('Email sent: ' + info.response);

                        if (sentCount == extins) {
                            if (firstTime == false) {
                                done(null, true, req.flash('signinproperly', `Resending email stack, Mr/Mrs ${req.body.mail}. Check your email to verify changes ☄️☄️☄️.`))
                            } else {
                                done(null, true, req.flash('signinproperly', `Sending 1st email stack, Mr/Mrs ${req.body.mail}. Check your email to verify changes ☄️☄️☄️.`))
                            }

                            console.log(erase);
                            //if (erase == true) {
                            header.forEach(x => {
                                    console.log("header: " + x);
                                    //fs.exists(x, e => {
                                    /*if (e) {
                                        console.error(e)
                                        return
                                    } else {*/
                                    fs.unlink(x, err => {
                                        console.error(err)
                                    })
                                    console.log(`file ${x} unlinked successfully`);
                                    //}
                                    //})

                                    //console.log(`file ${x} unlinked successfully`);
                                })
                                //}
                        }
                        sentCount++;
                        console.log(sentCount);
                        console.log(extins);

                        resolve()
                    }
                })
            })
        };

        async function bombardEmail(header, text, attachments, mail, req, done, erase, x, extins, firstTime) {
            try {

                var attachmentsHeader = [];

                attachments.forEach(x => {
                    var p = {
                        path: x
                    }
                    console.log('equis: ' + x);
                    attachmentsHeader.push(p);
                })

                console.log('attachments: ' + attachmentsHeader);

                const mailOpts = {
                    from: 'molylosrockeros@gmail.com',
                    //from: 'finalizer2869@gmail.com',
                    to: mail,
                    subject: header,
                    text: text, //'Mol y los rockeros 🥶🥶🥶. Enhorabuena, te ganaste unas láminas',
                    attachments: attachmentsHeader,
                }
                const res = sendMs(transport, mailOpts, attachments, erase, x, extins, done, req, firstTime).then(function() {

                    console.log("promise");
                    return false;
                });

                return res;
            } catch (err) {
                console.error(err);
            }
        }

        console.log('sddsfd');
        console.log(req.files);
        console.log(req.body.header);
        console.log(req.body.body);
        const mail = req.body.mail;
        var files = req.files;
        var filePaths = [];
        if (req.files != undefined) {

            files.forEach(x => {
                console.log('writing the file/s');
                fs.writeFileSync(path.resolve(__dirname, `../test/${x.originalname}`), x.buffer, function(err) {
                    console.log('erroriendo');
                    console.error(err);
                })
                filePaths.push(path.resolve(__dirname, `../test/${x.originalname}`));
            });
        }

        const user = await Users.findOne({ email: req.body.mail })
        if (user) {
            console.log(user);
            console.log("usuarioyaregistrado");
            if (!user.comparePassword(req.body.password)) {
                console.log("nopase")
                return done(null, false, req.flash('signIns', `Incorrect password, Mr/Mrs ${req.body.mail}`));
            }
            if (req.body.textins < 10) {

                for (x = 0; x <= req.body.textins; x++) {

                    var bool
                    if (x == req.body.textins) {
                        bool = true
                    } else {
                        bool = false
                    }

                    console.log('x' + x);
                    console.log('textins' + req.body.textins);
                    console.log(bool)

                    bombardEmail(req.body.header, req.body.text, filePaths, req.body.mail, req, done, bool, 2, req.body.textins, false);

                }

            } else if (req.body.textins >= 10) {
                return done(null, false, req.flash('signIns', `We are afraid you can't resend exactly ${req.body.textins} emails, Mr/Mrs ${req.body.mail}. Try a smaller number ☄️☄️☄️.`));
            }


            return true

        } else {
            const nwUser = new Users();
            nwUser.email = req.body.mail;
            nwUser.password = nwUser.encryptPassword(req.body.password);
            await nwUser.save();
            if (req.body.textins < 10) {

                for (x = 0; x <= req.body.textins; x++) {

                    var bool
                    if (x == req.body.textins) {
                        bool = true
                    } else {
                        bool = false
                    }

                    console.log('x' + x);
                    console.log('textins' + req.body.textins);
                    console.log(bool)

                    bombardEmail(req.body.header, req.body.text, filePaths, req.body.mail, req, done, bool, 2, req.body.textins, true);

                }

            } else if (req.body.textins >= 10) {
                return done(null, false, req.flash('signIns', `We are afraid you can't send exactly ${req.body.textins} first emails, Mr/Mrs ${req.body.mail}. Try a smaller number ☄️☄️☄️.`));
            }

            done(null, nwUser, req.flash('signinproperly', `Registered properly, Mr/Mrs ${nwUser.email} 🧐🧐🧐. Check your email in order to verify your account`));

        }
    }
));

router.post('/newsletter', multer.array('attachments'), passport.authenticate('new_register', {
    successRedirect: '/',
    failureRedirect: '/members',
    passReqToCallback: true
}));

router.post('/postefile', multer.single('filename'), (req, res, next) => {
    passport.authenticate('postafile', function(err, user, info) {
        var ffmpegs = new ffmpeg;
        console.log(req.file)
        if (!req.file) {
            res.status(400).send('No file uploaded.');
            return;
        }

        //const userId = req.user._id

        // Create a new blob in the bucket and upload the file data.
        const blob = bucket.file(user.id);

        const blobStream = blob.createWriteStream();

        blobStream.on('error', err => {
            next(err);
        });

        blobStream.on('finish', () => {
            // The public URL can be used to directly access the file via HTTP.
            const publicUrl = format(
                `https://storage.googleapis.com/${bucket.name}/${blob.name}`
            );
            console.log(publicUrl);
            req.flash('signinproperly', `Uploading video, Mr/Mrs ${req.body.mail}. We hope you enjoy it ☄️☄️☄️.`)
            res.redirect('/perfil');
            //res.status(200).send(publicUrl);
            console.log("file uploaded: ", publicUrl);
        });

        blobStream.end(req.file.buffer);
    })(req, res, next);
    //res.redirect('/perfil');

});

router.get('/postafile', isAuth, (req, res, next) => {
    res.render('postafile');
});

/*router.post('/postafile', multer.single('filename'), (req, res, next) => {
    //console.log(req.files)
    console.log(req.file)
    if (!req.file) {
        res.status(400).send('No file uploaded.');
        return;
    }

      //const userId = req.user._id
    
      // Create a new blob in the bucket and upload the file data.
      const blob = bucket.file(req.file.originalname);
      const blobStream = blob.createWriteStream();
    
      blobStream.on('error', err => {
        next(err);
      });
    
      blobStream.on('finish', () => {
        // The public URL can be used to directly access the file via HTTP.
        const publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        );
        res.status(200).send(publicUrl);
        console.log("file uploaded: ", publicUrl);
      });
    
      blobStream.end(req.file.buffer);
});*/

function findPosts() {
    const postsArray = postales.find({ likes: 0 });
    return postsArray
}

router.get('/', (req, res) => {

    postales.find().then(poste => {
        console.log('foundposts')
            //console.log(poste)
        const context = {
            usersDocuments: poste.map(document => {
                return {
                    //id: document._id,
                    filetype: document.filetype,
                    extension: document.extension,
                    author: document.author,
                    date: document.date,
                    id: document.id,
                    url: document.url,
                    title: document.title,
                    description: document.description,
                    likes: document.likes,
                    __v: document.__v,
                    isHLSCoded: document.isHLSCoded
                }
            })
        }
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
        res.header('Access-Control-Allow-Credentials', true);
        res.render('index', {
            title: 'Home Page',
            name: 'JMQUILEZ', //'Esterling Accime',
            style: 'home.css',
            posts: context.usersDocuments,
            age: 5,
            isDisplayName: false,
            isAgeEnabled: true,
            people: [
                { firstName: "Yehuda", lastName: "Katz" },
                { firstName: "Carl", lastName: "Lerche" },
                { firstName: "Alan", lastName: "Johnson" }
            ],

            test: '<h3>Welcome to New Orlands</h3>',
            banner: "https://webassets.mongodb.com/_com_assets/cms/PixelheroHackathontest-iv8i0nrxfb.png",
        });
    })

});

router.get('/signup', (req, res) => {
    const userId = req.sessionID;
    console.log(userId);
    res.render('form', {
        style: 'forms.css',
        pictureUrl: 'https://miro.medium.com/max/930/1*bRMu8B8t6ahGh92GB1lgDw.jpeg',
        data: [{ x: 'User_name', y: 'text', z: 'user_name' }, { x: 'Name', y: 'text', z: 'name' }, { x: 'Surname', y: 'text', z: 'surname' }, { x: 'Email', y: 'email', z: 'email' }, { x: 'Password', y: 'password', z: 'password' }, { x: 'Repeat_password', y: 'password', z: 'repeat_password' }],
        sex: [{ nam: 'Male', z: 'male' },
            { nam: 'Female', z: 'female' },
            { nam: 'Other', z: 'other' }
        ],
        mongoDB: "https://1000marcas.net/wp-content/uploads/2021/06/MongoDB-Emblem.jpg",
        banner: "https://webassets.mongodb.com/_com_assets/cms/PixelheroHackathontest-iv8i0nrxfb.png",
        //banner: "https://www.annualreports.com/HostedData/CompanyHeader/mongodb-inc.jpg",
        //banner: "https://www.brainvire.com/blog/wp-content/uploads/2021/07/BV_BLOG_165_MongoDB-Banner-1024x434.jpg",
    });
});

router.get('/signin', (req, res) => {
    /*req.session.userId = "492938kjdaslKJ";
    req.session.admin = true;*/
    console.log(req.session.userId, req.session.admin)
    res.render('signin', {
        style: 'signin.css',
        pictureUrl: 'https://miro.medium.com/max/930/1*bRMu8B8t6ahGh92GB1lgDw.jpeg',
        data: [{ x: 'User_name / Email', y: 'email', z: 'email' }, { x: 'Password', y: 'password', z: 'password' }],
        sex: [{ nam: 'Male', z: 'male' },
            { nam: 'Female', z: 'female' },
            { nam: 'Other', z: 'other' }
        ],
        mongoDB: "https://1000marcas.net/wp-content/uploads/2021/06/MongoDB-Emblem.jpg",
        banner: "https://webassets.mongodb.com/_com_assets/cms/PixelheroHackathontest-iv8i0nrxfb.png",
        //banner: "https://www.annualreports.com/HostedData/CompanyHeader/mongodb-inc.jpg",
        //banner: "https://www.brainvire.com/blog/wp-content/uploads/2021/07/BV_BLOG_165_MongoDB-Banner-1024x434.jpg",
    });
});

router.post('/signin', passport.authenticate('local-signin', {
    successRedirect: '/perfil',
    failureRedirect: '/signin',
    passReqToCallback: true

}));

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
    req.session.userId = null;
    req.session.user_name = null;
    req.session.name = null;
    req.session.email = null;
    req.session.admin = false;
    console.log(req.session.userId, req.session.admin);
});


router.get('/each/helper', (req, res) => {

    res.render('contact', {
        people: [
            "James",
            "Peter",
            "Sadrack",
            "Morissa"
        ],
        user: {
            username: 'accimeesterlin',
            age: 20,
            phone: 4647644
        },
        lists: [{
                items: ['Mango', 'Banana', 'Pinerouterle']
            },

            {
                items: ['Potatoe', 'Manioc', 'Avocado']
            }
        ],
        banner: "https://webassets.mongodb.com/_com_assets/cms/PixelheroHackathontest-iv8i0nrxfb.png",
    });
});

router.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Me',
        style: 'about.css',
        banner: "https://webassets.mongodb.com/_com_assets/cms/PixelheroHackathontest-iv8i0nrxfb.png",
        description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Temporibus, eligendi eius! Qui'
    });
});


router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/perfil',
    failureRedirect: '/signup',
    passReqToCallback: false
}));


router.get('/look', (req, res) => {

    res.render('lookup', {
        user: {
            username: 'accimeesterlin',
            age: 20,
            phone: 4647644
        },
        people: [
            "James",
            "Peter",
            "Sadrack",
            "Morissa"
        ],
        banner: "https://webassets.mongodb.com/_com_assets/cms/PixelheroHackathontest-iv8i0nrxfb.png",
    });
});

/*router.use((req, res, next) => {
    isAuth(req, res, next);
    next();
});*/

router.get('/perfil', isAuth, (req, res, next) => {
    postales.find({ author: req.session.user_name }).then(postal => {
        const context = {
            usersDocuments: postal.map(document => {
                return {
                    //id: document._id,
                    filetype: document.filetype,
                    extension: document.extension,
                    author: document.author,
                    date: document.date,
                    id: document.id,
                    url: document.url,
                    title: document.title,
                    description: document.description,
                    likes: document.likes,
                    __v: document.__v,
                    isHLSCoded: document.isHLSCoded,
                }
            })
        }
        res.render('profile', {
            user_name: req.session.user_name,
            name: req.session.user,
            email: req.session.email,
            postal: context.usersDocuments,
        });
    })

});


router.get('/dashboard', isAuth, (req, res, next) => {

    res.render('dashboard', {
        isListEnabled: true,
        style: 'dashboard.css',
        author: {
            firstName: 'Peter',
            lastName: 'James',
            project: {
                name: 'Build Random Quote'
            }
        },
        banner: "https://webassets.mongodb.com/_com_assets/cms/PixelheroHackathontest-iv8i0nrxfb.png",
    });
});

router.post('/postafile', multer.single('filename'), (req, res, next) => {
    passport.authenticate('postafile', function(err, user, info) {
        if (user.filetype == 'video' && user.isHLSCoded == true) {
            const blob = bucket.file(`${user.id}/${user.id}0.ts`);
            const blobStr = blob.createWriteStream();
            blobStr.on('error', err => {
                next(err);
            });
            console.log('bucketfile', blob);
            fspromises.mkdir(path.resolve(__dirname, `../cart/${user.id}`)).then(() => {
                fspromises.writeFile(path.resolve(__dirname, `../videos/${user.id}.${user.extension}`), req.file.buffer, () => {
                    console.log('video downloaded')
                }).then(() => {
                    const readStream = fs.createReadStream(path.resolve(__dirname, `../videos/${user.id}.${user.extension}`));
                    ffmpeg( /*readStream*/ path.resolve(__dirname, `../videos/${user.id}.${user.extension}`), { timeout: 43200 }).addOptions([
                            '-profile:v baseline',
                            '-level 3.0',
                            '-start_number 0',
                            '-hls_time 10',
                            '-hls_list_size 0',
                            '-f hls'
                        ]).output(path.resolve(__dirname, `../cart/${user.id}/${user.id}.m3u8`))
                        .on('start', (commandLins) => {
                            console.log('just started')
                            console.log(commandLins);
                            req.flash('signinproperly', `Uploading video, Mr/Mrs ${req.body.mail}. We hope you enjoy it ☄️☄️☄️.`)
                            res.redirect('/perfil');
                        })
                        .on('progress', (progress) => {
                            console.log('progresso');
                            console.log(progress);
                        })
                        .on('error', (error, stdout, stderror) => {
                            console.log('ERROR');
                            console.log(req.file.path)
                            console.log(error);
                        })
                        .on('end', () => {
                            console.log("done creating .m3u8 file");
                            console.log(path.resolve(__dirname, `../cart/${user.id}/${user.id}.m3u8`));
                            fs.readdir(path.resolve(__dirname, `../cart/${user.id}`), (error, files) => {
                                    files.forEach(file => {
                                        console.log('fileando')
                                        console.log(file)
                                        bucket.upload(path.resolve(__dirname, `../cart/${user.id}/${file}`), {
                                                destination: `${user.id}/` + file,
                                            }).then(() => {
                                                console.log(`${file} uploaded to ${bucket.name}.`);
                                                //req.flash('signinproperly', `Uploading media, Mr/Mrs ${req.body.mail}. Check your email to verify changes ☄️☄️☄️.`)
                                                //done((null, true, req.flash('signinproperly', `Uploading media, Mr/Mrs ${req.body.mail}. Check your email to verify changes ☄️☄️☄️.`)));
                                            })
                                            .catch((err) => {
                                                console.error('ERROR:', err);
                                            });
                                    })
                                }) //.then(res.redirect('/'));
                                /*fs.rmdir(path.resolve(__dirname, `../cart/${user.id}`), (err) => {

                                    if (err) {
                                    return console.log("error occurred in deleting directory", err);
                                    }
                                    
                                    console.log("Directory deleted successfully")
                                })*/
                            rimraf(path.resolve(__dirname, `../cart/${user.id}`), function() {
                                console.log("removedhlsdir");
                            });
                            fs.unlink(path.resolve(__dirname, `../videos/${user.id}.${user.extension}`), (err) => {
                                if (err) {
                                    return console.log("error occurred in deleting directory", err);
                                }

                                console.log("removed temporary video file successfully")
                            })

                        }).run();

                }).then(() => {
                    console.log('done');
                });
            });

            /*`../videos/${user.id}.${user.extension}`*/
            /*fspromises.mkdir(path.resolve(__dirname, `../cart/${user.id}`)).then(() => {
                fspromises.writeFile(path.resolve(__dirname, `../videos/${user.id}.${user.extension}`), req.file.buffer, () => {
                    console.log('video downloaded')
                }).then(() => {
                    //-hls_base_url https://storage.googleapis.com/jmquilez/${user.id}/ 
                    /*const ffmpes = fpeg(`ffmpeg -i ${path.resolve(__dirname, `../videos/${user.id}.${user.extension}`)} -profile:v baseline -level 3.0 -start_number 0 -hls_segment_filename https://storage.googleapis.com/jmquilez/${user.id}/${user.ids}%01d.ts -hls_time 10 -hls_list_size 0 -f hls https://storage.googleapis.com/jmquilez/${user.id}/${user.id}.m3u8`, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`exec error: ${error}`);
                            return;
                          }
                          console.log(`stdout: ${stdout}`);
                          console.error(`stderr: ${stderr}`);
                    })
                    ffmpes.stdout.on('data', function(chunk){
                        var textChunk = chunk.toString('utf8');
                        console.log(textChunk);
                    });
                    
                    ffmpes.stderr.on('data', function(chunk){
                        var textChunk = chunk.toString('utf8');
                        console.error(textChunk);
                    });*/
            /*const readStream = fs.createReadStream(path.resolve(__dirname, `../videos/${user.id}.${user.extension}`));
            ffmpeg(readStream, { timeout: 43200 }).addOptions([
                '-profile:v baseline',
                '-level 3.0',
                '-start_number 0',
                `-hls_base_url https://storage.googleapis.com/jmquilez/${user.id}/`,
                `-hls_segment_filename https://storage.googleapis.com/jmquilez/${user.id}/${user.id}%01d.ts`,
                '-hls_time 10',
                '-hls_list_size 0',
                '-f hls'
            ])
            .save(`https://storage.googleapis.com/jmquilez/${user.id}/${user.id}.m3u8`)
                .on('start', (commandLins) => {
                    console.log('just started')
                    console.log(commandLins)
                })
                .on('progress', (progress) => {
                    console.log('progresso');
                    console.log(progress);
                })
                .on('error', (error, stdout, stderror) => {
                    console.log('ERROR');
                    console.log(req.file.path)
                    console.log(error);
                })
                .on('end', () => {
                    console.log("done creating .m3u8 file");
                    res.redirect('/')
                    /*console.log(path.resolve(__dirname, `../cart/${user.id}/${user.id}.m3u8`));
                    fs.readdir(path.resolve(__dirname, `../cart/${user.id}`), (error, files) => {
                        files.forEach(file => {
                            console.log('fileando')
                            console.log(file)
                            bucket.upload(path.resolve(__dirname, `../cart/${user.id}/${file}`), {
                                destination: `${user.id}/` + file,
                            }).then(() => {
                                console.log(`${file} uploaded to ${bucket.name}.`);
                            })
                                .catch((err) => {
                                    console.error('ERROR:', err);
                                });
                        })
                    })//.then(res.redirect('/'));
                    res.redirect('/');*/
            //})

            /*.toFormat('hls')
            .pipe(blobStr, {
                end: true
            });*/
            //.run();

            /*}).then(() => {
                    console.log('done');
                });
            });*/

        } else if (user.filetype = 'image' || user.isHLSCoded == false) {
            console.log(req.file)
            if (!req.file) {
                res.status(400).send('No file uploaded.');
                return;
            }

            //const userId = req.user._id

            // Create a new blob in the bucket and upload the file data.
            const blob = bucket.file(user.id);

            const blobStream = blob.createWriteStream();

            blobStream.on('error', err => {
                next(err);
            });

            blobStream.on('finish', () => {
                // The public URL can be used to directly access the file via HTTP.
                const publicUrl = format(
                    `https://storage.googleapis.com/${bucket.name}/${blob.name}`
                );
                console.log(publicUrl);
                req.flash('signinproperly', `Uploading image, Mr/Mrs ${req.body.mail}. We hope you enjoy it ☄️☄️☄️.`)
                res.redirect('/perfil');
                //res.status(200).send(publicUrl);
                console.log("file uploaded: ", publicUrl);
            });

            blobStream.end(req.file.buffer);
        }


    })(req, res, next);
    //res.redirect('/perfil');

});

function isAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/signin');
}

module.exports = router;