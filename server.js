// Importing libraries
const express = require('express');
const app = express();
const expbs = require('express-handlebars');
const path = require('path');
const morgan = require('morgan');
const passport = require('passport');
var cors = require('cors');


// Importing files
const routes = require('./routes/handlers');
const session = require('express-session');
const flash = require('connect-flash');

//Init everything
require('./database/db');
require('./passport/local-auth');

app.use(cors());

// Sending static files with Express 
app.use(express.static('public'));

const hbs = expbs.create({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/mainLayout'), // change layout folder name
    partialsDir: path.join(__dirname, 'views/pieces'), // change partials folder name

    // create custom express handlebars helpers
    helpers: 
        require('./config/handlebars/helpers'),
    
});


// Express Handlebars Configuration
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


//Morgan & middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: 'secretsess',
    resave: true,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    app.locals.signUps = req.flash('signups');
    app.locals.signIns = req.flash('signIns');
    app.locals.signInsProperly = req.flash('signinproperly');
    app.locals.signUpsProperly = req.flash('signupproperly');
    next();
});



//app.use(express.bodyParser({keepExtensions:true,uploadDir:path.join(__dirname,'./files')}));


// Configure Routes
app.use('/', routes);

//Morgan

const puert = process.env.PORT || 3001;



app.listen(puert, () => {
    console.log('Server is starting at port ', 3001);
});