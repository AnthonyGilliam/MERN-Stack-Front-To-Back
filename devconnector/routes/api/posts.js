const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Posts');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   Post api/post
// @desc    Create a post
// @access  Private
router.post('/',
    auth,
    body('text', 'Text is required').not().isEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        try {
            const user = await User.findById(req.user.id).select('-password');

            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            });

            const post = await newPost.save();

            res.json(post);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   Get api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // 4:26 - Use the sort() method on the result of a Mongoose model’s Query object to return a sorted list of
        // documents from a MongoDB collection
        //  Pass an JSON object containing properties with:
        //   Its keys equal to names in the query’s MongoDB collection
        //   Its values equal to:
        //    asc, ascending, or 1 for ascending order
        //    desc, descending, or -1 for descending order
        //   Passing multiple field names to this object will cause the query to sort by the first field name first then
        //   within all results of the query that contain that field’s same value, sort by the proceeding field recursively
        const posts = await Post.find().sort({date: -1});
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   Get api/posts/:id
// @desc    Get post by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({msg: 'Post not found'});
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({msg: 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   Delete api/posts/:id
// @desc    Delete post by ID
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // Check user can delete post
        // 4:26 - To get the string value of a Mongoose model’s ObjectID (either the model’s ID or a reference ID to
        // another model) use the toString() method of that ObjectID
        if (!post) {
            return res.status(404).json({msg: 'Post not found'});
        }
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'User not authorized to delete post'});
        }
        // 4:26 - Use the "findByIdAndDelete()" method to delete a single document by ID from the database
        await Post.findByIdAndDelete(post.id);
        res.json({msg: 'Post removed'});
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({msg: 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // Check if post has already been liked by user
        if (post.likes.some(like => like.user.toString() === req.user.id)) {
            return res.status(400).json({msg: 'Post already liked'});
        }
        post.likes.unshift({user: req.user.id});
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({msg: 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/posts/unlike/:id
// @desc    Un-like a post
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // Check if post has been liked by user
        if (!post.likes.some(like => like.user.toString() === req.user.id)) {
            return res.status(400).json({msg: 'Post has not been liked by user'});
        }
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1)
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({msg: 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   Post api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
router.post('/comment/:id',
    auth,
    body('text', 'Text is required').not().isEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        try {
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id);

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            };

            post.comments.unshift(newComment);
            await post.save();

            res.json(post.comments);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   Delete api/posts/:id/comment/:comment_id
// @desc    Delete a comment on a post
// @access  Private
router.delete('/:id/comment/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({msg: 'Post not found'})
        }
        const commentIndex = post.comments.map(cmt => cmt.id).indexOf(req.params.comment_id);
        if (commentIndex === -1) {
            return res.status(404).json({msg: 'Comment not found'});
        }
        const comment = post.comments[commentIndex];
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'User not authorized'});
        }
        post.comments.splice(commentIndex, 1);
        post.save();
        return res.json(post.comments);
    } catch (err) {
        console.log(err);
        if (err.kind === 'ObjectId') {
            res.status(400).json({msg: 'Post or comment not found'})
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
