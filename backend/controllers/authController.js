const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ErrorHandler = require('../utils/errorHandler');

exports.registerUser = async (req, res) => {
  console.log("test>>",req.body)
    const { fullname, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      user = new User({
        name: fullname,
        email,
        password,
      });
  
      await user.save();
  
      const payload = {
        user: {
          id: user.id,
        },
      };
  
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.status(201).json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
};

exports.postLogin = async (req, res, next)=> {
    const {email, password} = req.body;
    try { 
        // Find user by email
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return next(new ErrorHandler('Invalid email or password', 401));
        }
        
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
    
        if (!isMatch) {
          return next(new ErrorHandler('Invalid email or password', 401));
        } else {
            req.session.isLoggedIn = true;
            req.session.user = user;
        }
    
        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE
        });
    
        res.status(200).json({
          success: true,
          token,
          user: req.session.user
        });
      } catch (err) {
        next(new ErrorHandler(err.message, 500));
    }
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return next(new ErrorHandler('Failed to logout', 500));
        }
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    });
};