// Importing libraries
const express = require('express');
const app = express();
const expbs = require('express-handlebars');
const path = require('path');
const morgan = require('morgan');
const passport = require('passport');

// Importing files
const routes = require('./routes/handlers');
const session = require('express-session');
const flash = require('connect-flash');

//Init everything
require('./database/db');
require('./passport/local-auth');

// Sending static files with Express 
app.use(express.static('public'));


const hbs = expbs.create({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/mainLayout'), // change layout folder name
    partialsDir: path.join(__dirname, 'views/pieces'), // change partials folder name

    // create custom express handlebars helpers
    helpers: {
        calculation: function(value) {
            return value * 5;
        },

        list: function(value, options) {
            let out = "<ul>";
            for (let i = 0; i < value.length; i++) {
                out = out + "<li>" +  options.fn(value[i]) + "</li>";
            }
            return out + "</ul>";
        }
    }
});


// Express Handlebars Configuration
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

//Morgan & middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: 'secretsess',
    resave: false,
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