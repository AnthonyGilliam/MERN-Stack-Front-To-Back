const jwt = require('jsonwebtoken');
const config = require('config');

// 3:13 - A middleware function takes in a request, a response and a next function as parameters
// the next parameter is a function that, when called, continues on to the next step(s) in the express pipeline
module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token, return unauthorized response
    if (!token) {
        return res.status(401).json({msg: 'No token, authorization denied'})
    }

    try {
        // Use the jsonwebtoken.verify() method to decode the payload of a JWT
        //  Pass in the JWT to decode as the first parameter
        //  Pass in the secretOrPublicKey as the second parameter
        //   This should be a secret for HMAC, OR the PEM encoded public key for RSA and ECDSA algorithms
        //  Pass in optional "options" as the third parameter OR an array containing options and a callback for async
        //  processing as the third parameter; options available here:  https://www.npmjs.com/package/jsonwebtoken
        //  This function returns an object which is the decoded contents of the JWT's payload
        //  ** Errors such as "TokenExpiredError" or "JsonWebTokenError" are implicitly thrown from this method if the
        //  header/payload/signature of the JWT are in error
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({msg: 'Token is not valid'})
    }
}
