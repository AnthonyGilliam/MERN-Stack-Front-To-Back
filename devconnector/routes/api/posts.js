const express = require('express');
const router = express.Router();

// 2:8 - Use this syntax to listen for a HTTP GET request on coming into the express server
//  pass in the  API request's relative path as the first parameter
//  pass in a function receiving request and response objects that returns an HTTP response as the second parameter
// It is good practice to provide comments above the route giving HTTP method, route path, description and Public/Private
// access

// @route   GET api/post
// @desc    Test route
// @access  Public
router.get('/', (req, res) => res.send('Post route'));

module.exports = router;
