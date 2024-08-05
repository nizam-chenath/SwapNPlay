const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const dotenv = require('dotenv');

dotenv.config();

// Import User model before usage
const User = require('./models/user');

const app = express();

// Middleware setup
app.use(express.urlencoded({ extended: false })); // Replace body-parser with Express's built-in middleware

// Set up MongoDB session store
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions',
});

// Catch errors with the store
store.on('error', (error) => {
  console.log('Session store error:', error);
});

// Set up CSRF protection
const csrfProtection = csrf();

// Use session middleware
// app.use(
//   session({
//     secret: 'my secret',
//     resave: false,
//     saveUninitialized: false,
//     store: store, // With this, the session data will be stored in MongoDB
//   })
// );

// Use CSRF protection middleware
app.use(csrfProtection);

// Middleware to populate req.user
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log('Error fetching user:', err);
      next(err); // Pass the error to the global error handler
    });
});

// Middleware to set local variables
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public'))); // Ensure 'public' folder is accessible

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB!');
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
