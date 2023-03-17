const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {body, validationResult} = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// 2:8 - Use this syntax to listen for a HTTP GET request on coming into the express server
//  pass in the  API request's relative path as the first parameter
//  pass in a function receiving request and response objects that returns an HTTP response as the second parameter
// It is good practice to provide comments above the route giving HTTP method, route path, description and Public/Private
// access

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        // 4:16 - When performing a query operation on a model for a referenced (joined) model object, pass the
        // referenced property's name in the query and assign it to the ID of the referenced document (object)
        const profile = await Profile.findOne({user: req.user.id})
            // 4:16 - Use Mongoose's "Query.populate()" method to specify fields that will be populated by the referenced
            // document
            .populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({msg: 'There is no profile for this user'});
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   Post api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/',
    auth,
    body('status', 'Status is required').not().isEmpty(),
    body('skills', 'Skills is required').not().isEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        // Build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        [
            'company',
            'website',
            'location',
            'bio',
            'status',
            'githubusername',
        ].forEach(key => profileFields[key] = req.body[key]?.trim());
        profileFields.skills = req.body.skills.split(',').map(skill => skill.trim());
        profileFields.social = {};
        [
            'youtube',
            'facebook',
            'twitter',
            'instagram',
            'linkedin',
        ].forEach(key => profileFields.social[key] = req.body[key]?.trim());
        let profile;
        try {
            console.log('Profile:  ', profileFields);
            // Use the "findOneAndUpdate()" method to find the first doc that fits given filter and update it or
            // insert a new one (upsert)
            //  Pass in a JSON object containing a filter criteria as the first parameter
            //  Pass in a JSON object containing the fields to update as the second parameter
            //   Use MongoDB's "$set" operator as a key and assign it to a whole object to update vs setting each doc
            //   property one-at-a-time
            //    If the field does not exist, $set will add a new field with the specified value, provided that the
            //    new field does not violate a type constraint
            //  Pass in a JSON object containing "options" as the third parameter
            //   Set the "new" option to true to return the document AFTER its been updated vs un-updated values
            //   Set the "upsert" option to true to insert the doc if no doc fitting the criteria is found
            //    An upsert combines the filter and update parameters to save all given fields to the doc
            //   Set the "rawResult" option to true in order to return an object containing both the updated/new doc
            //   along with a "lastErrorObject" which contains metadata about the update/new doc
            //    Use the "updatedExisting" field of this object to determine whether the doc was updated or inserted
            // *This method is "Atomic" meaning the doc will not change between finding it and updating it (unless
            //  the doc is upserted)
            profile = await Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set: profileFields},
                {new: true, upsert: true}
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
        res.send(profile);
    }
);

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    try {
        // 4:18 - Use the "Request.params" object to access the URL parameters (values in the route that are prefixed
        // with a colon [:]) passed into the request
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);

        if (!profile) return res.status(400).json({msg: 'Profile not found'});
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({msg: 'Profile not found'});
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
