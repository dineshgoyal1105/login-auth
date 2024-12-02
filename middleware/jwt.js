const jwt =  require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();



const SECRET_KEY = process.env.SECRET_KEY;

const jwtAuthMiddleware = (req, res, next) => {
    // Get the token from the Authorization header
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // 'Bearer <token>'

    // If no token is provided, return an error
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    // Verify and decode the token
    try {
        const decoded = jwt.verify(token, SECRET_KEY); // Decode the token
        req.user = decoded; // Attach the decoded payload to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        // If the token is invalid or expired
        console.error(error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = { jwtAuthMiddleware };


const generateToken = (userData) => {
    // Check if the userData is valid and has the required properties
    if (!userData || !userData._id || !userData.email) {
        throw new Error('Invalid user data: user must have _id and email');
    }

    // Create the payload using the user data
    const payload = {
        userId: userData._id,
        email: userData.email,
    };

    // Generate the JWT token with the payload and secret key
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: 30 }); // Optional expiration time
}

module.exports = {jwtAuthMiddleware,generateToken};