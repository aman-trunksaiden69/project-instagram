var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressSession = require('express-session');
require('dotenv').config();
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const passport = require('passport');
const fs = require('fs');
const mongoose = require('mongoose');

var app = express();

// MongoDB Connection Established
mongoose.connect(process.env.MONGODB_URI) 
.then(() => console.log('MongoDB connected...')) 
.catch(err => console.log('MongoDB connection error...', err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

//error handler-
app.use(function(err, req, res, next) {
  // Log error details safely in production
  if (process.env.NODE_ENV === 'production') {
    console.error('Error:', err.message); // Logs to console
    fs.appendFileSync('error.log', `${new Date()} - ${err.message}\n`); // Logs to file
  }

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;