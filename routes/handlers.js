const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const passport = require('passport');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const multa = require('multer');
const format = require('format');

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
      fileSize: 5 * 1024 * 1024, 
    },
  });

const bucket = gc.bucket('jmquilez');

// Routing

router.get('/postafile', (req, res, next) => {
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

router.get('/', (req, res) => {
    res.render('index', {
        title: 'Home Page',
        name: 'Esterling Accime',
        style:  'home.css',
        
        age: 5,
        isDisplayName: false,
        isAgeEnabled: true,
        people: [
            {firstName: "Yehuda", lastName: "Katz"},
            {firstName: "Carl", lastName: "Lerche"},
            {firstName: "Alan", lastName: "Johnson"}
        ],

        test: '<h3>Welcome to New Orlands</h3>',
        banner: "https://webassets.mongodb.com/_com_assets/cms/PixelheroHackathontest-iv8i0nrxfb.png",
    });
});

router.get('/signup', (req, res) => {
    const userId = req.sessionID;
    console.log(userId);
    res.render('form', {
        style:  'forms.css',
        pictureUrl: 'https://miro.medium.com/max/930/1*bRMu8B8t6ahGh92GB1lgDw.jpeg',
        data: [{ x: 'User_name', y: 'text', z:'user_name' }, { x: 'Name', y: 'text', z: 'name' }, { x: 'Surname', y: 'text', z: 'surname'}, { x: 'Email', y: 'email', z: 'email' }, { x: 'Password', y: 'password', z: 'password' }, { x: 'Repeat_password', y: 'password', z: 'repeat_password'}],
        sex: [{ nam: 'Male', z: 'male' }, 
              { nam: 'Female', z: 'female'}, 
              { nam: 'Other', z: 'other'}],
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
        style:  'signin.css',
        pictureUrl: 'https://miro.medium.com/max/930/1*bRMu8B8t6ahGh92GB1lgDw.jpeg',
        data: [{ x: 'User_name / Email', y: 'email', z:'email' }, { x: 'Password', y: 'password', z: 'password' }],
        sex: [{ nam: 'Male', z: 'male' }, 
              { nam: 'Female', z: 'female'}, 
              { nam: 'Other', z: 'other'}],
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
        lists: [
            {
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
        style:  'about.css',
        banner: "https://webassets.mongodb.com/_com_assets/cms/PixelheroHackathontest-iv8i0nrxfb.png",
        description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Temporibus, eligendi eius! Qui'
    });
});


router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/perfil',
    failureRedirect: '/signup',
    passReqToCallback: false
}));

router.post('/postafile', multer.single('filename'), (req, res, next) => {
    passport.authenticate('postafile', function(err, user, info) {
        console.log(req.file)
        if (!req.file) {
            res.status(400).send('No file uploaded.');
            return;
        }
    
          //const userId = req.user._id
        
          // Create a new blob in the bucket and upload the file data.
          const blob = bucket.file(user.title);
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
    })(req, res, next);
    //res.redirect('/perfil');

});


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
    res.render('profile', {
        user_name: req.session.user_name,
        name: req.session.user,
        email: req.session.email,
    });
});


router.get('/dashboard', isAuth, (req, res, next) => {

    res.render('dashboard', {
        isListEnabled: true,
        style:  'dashboard.css',
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

function isAuth(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/signin');
}

module.exports = router;


