const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const gravatar = require('gravatar');
const auth = require('../../middleware/auth');
const User = require('../../models/User');

// 2:8 - Use this syntax to listen for a HTTP GET request on coming into the express server
//  pass in the  API request's relative path as the first parameter
//  pass in a function receiving request and response objects that returns an HTTP response as the second parameter
// It is good practice to provide comments above the route giving HTTP method, route path, description and Public/Private
// access

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/',
    // 3:13 - Pass the JWT auth function in as middleware to an express Router request function to authorize any request
    auth,
    async (req, res) => {
        try {
            // 3:13 - Use "select()" method on a Mongoose Query object to specify which document fields to include or
            // exclude (also known as the query “projection”)
            //  Placing a minus sign, "-", in front of a field name instructs Mongoose to exclude the proceeding field
            const user = await User.findById(req.user.id).select('-password');
            res.json(user);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });


// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post('/',
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
    async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        const {email, password} = req.body;
        try {
            let user = await User.findOne({email});

            if (!user) {
                return res.status(400).json({errors: [{msg: 'Invalid Credential'}]});
            }

            // Use bcryptjs' "compare()" function to poll if a plain text password is equal to its hashed value
            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch) {
                return res.status(400).json({errors: [{msg: 'Invalid Credential'}]});
            }

            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                {expiresIn: 360000, audience: email},
                (err, token) => {
                    if (err) throw err;
                    res.json({token});
                });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    });

module.exports = router;
