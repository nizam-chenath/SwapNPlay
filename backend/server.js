const express = require('express');
const path = require('path');
const morgan = require('morgan');
const connectDB = require('./config/db');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const errorHandler = require('./middleware/errorMiddleware');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const dotenv = require('dotenv');

dotenv.config();

// Connect to database
connectDB();

// Import User model before usage
const User = require('./models/user');

const app = express();

// Body parser
app.use(bodyParser.json());

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
// const csrfProtection = csrf();

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Use session middleware
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store, // With this, the session data will be stored in MongoDB
  })
);

// Use CSRF protection middleware
// app.use(csrfProtection);

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

// Mount routers
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const shopRoutes = require('./routes/shopRoutes');
app.use('/api/auth', shopRoutes);
const chatRoutes = require('./routes/chatRoutes');
app.use('/api/auth', chatRoutes);

// Error handling middleware
app.use(errorHandler);

// Serve static files
app.use(express.static(path.join(__dirname, 'utils'))); // Ensure 'utils' folder is accessible


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
