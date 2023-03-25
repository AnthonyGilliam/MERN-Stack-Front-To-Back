const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator');
const config = require('config');
// 3:11 - Require a domain model to use its schema and mongoose CRUD/search methods
const User = require('../../models/User');

// 2:8 - Use this syntax to listen for a HTTP GET request on coming into the express server
//  pass in the  API request's relative path as the first parameter
//  pass in a function receiving request and response objects that returns an HTTP response as the second parameter
// It is good practice to provide comments above the route giving HTTP method, route path, description and Public/Private
// access develop

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/',
    // 3:10 - Use the express-validator library as middleware to a request: https://express-validator.github.io/docs/check-api/#checkfield-message
    // Validator methods can be placed inside an array or passed one-by-one as separate arguments
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({min: 6}),
    async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // 3:11 - Use the router's response.status() method to set the status of a returned request
        // Use the .json() method to send a JSON response to the requesting machine
        return res.status(400).json({errors: errors.array()})
    }
    const {name, email, password} = req.body;
    try {
        // 3:11 Use the "findOne()" method on a Mongoose Model object to search through the underlying collection and
        // return the first object which fits the given criteria
        //  Pass in a JSON object with keys equal to the collection fields to filter and values equal the filter values
        let user = await User.findOne({ email });

        if (user) {
            // 3:11 - A response object should be returned to end a request and exit at the returning line of code
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }

        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm',
        });

        // 3:11 - Instantiate a new model object using a declared mongoose Model to create a new collection object that can be
        // saved to MongoDB
        user = new User({
            name,
            email,
            avatar,
        });

        // Use bcrypt.genSalt() to generate a salt (phrase that will distinguish this hash from any other)
        const salt = await bcrypt.genSalt(10);
        // Encrypt password (using bcrypt)
        user.password = await bcrypt.hash(password, salt);
        // 3:11 - Use a mongoose Model's save() method to save an instantiated Model object to the database
        await user.save();

        // The JWT "Payload" contains claims which are statements about an entity (typically, the user) and additional
        // metadata about the JWT itself
        const payload = {
            user: {
                // 3:12 - Mongoose uses an abstraction on top of MongoDB's '_id' field so that 'id' accesses an
                // element's ID as well
                id: user.id
            }
        }
        // Return jsonwebtoken
        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 360000, audience: email },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

});

module.exports = router;
