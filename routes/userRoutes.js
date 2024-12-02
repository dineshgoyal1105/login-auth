// const express = require('express');
// const router = express.Router();
//  // Assuming you exported the model correctly in userModel.js

// // Define a POST route for user registration
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const User = require('../models/userModel'); // Ensure the User model is correctly imported
// const SECRET_KEY = process.env.SECRET_KEY; // Replace with an environment variable in production

// router.post('/register', async (req, res) => {
//     try {
//         const { name, email, password } = req.body;

//         // Validate required fields
//         if (!name || !email || !password) {
//             return res.status(400).json({ message: 'All fields are required' });
//         }

//         // Check if the email is already in use
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ message: 'Email is already in use' });
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10); // Hash with a salt of 10 rounds

//         // Create a new user
//         const newUser = new User({ name, email, password: hashedPassword });
//         await newUser.save();

//         // Generate a JWT token
//         const token = jwt.sign(
//             { userId: newUser._id, email: newUser.email }, // Payload
//             SECRET_KEY, // Secret key
//             { expiresIn: '1h' } // Token expiration time
//         );

//         // Respond with success and token
//         return res.status(201).json({ 
//             message: 'User registered successfully', 
//             token 
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'An error occurred' });
//     }
// });



// router.post('/login', async (req, res) => {
//     try {
//         const { email, password } = req.body; // Extract email and password from request body

//         // Validate required fields
//         if (!email || !password) {
//             return res.status(400).json({ message: 'Email and password are required' });
//         }

//         // Find the user by email
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Check if the provided password matches the hashed password in the database
//         const isPasswordCorrect = await bcrypt.compare(password, user.password);
//         if (!isPasswordCorrect) {
//             return res.status(401).json({ message: 'Invalid email or password' });
//         }

//         // Generate a JWT token
//         const token = jwt.sign(
//             { userId: user._id, email: user.email }, // Payload
//             SECRET_KEY, // Secret key
//             { expiresIn: '1h' } // Token expiration time
//         );

//         // Respond with success, user data, and token
//         return res.status(200).json({
//             message: 'Login successful',
//             token,
//             user: {
//                 email: user.email,
//                 name: user.name,
//             },
//         });
//     } catch (error) {
//         console.error(error); // Log the error for debugging
//         return res.status(500).json({ message: 'An error occurred' });
//     }
// });



const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/userModel'); // Ensure the User model is correctly imported
const { generateToken, jwtAuthMiddleware } = require('../middleware/jwt')// Import generateToken function

// Define a POST route for user registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if the email is already in use
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // Hash with a salt of 10 rounds

        // Create a new user
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        // Generate JWT token after successful registration
        const token = generateToken(newUser); // Pass the user object to generate the token
        console.log("token is:", token); // Log the token for debugging

        // Respond with success and token
        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                name: newUser.name,
                email: newUser.email,
            },
            token, // Include token in the response
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred' });
    }
});

// Define a POST route for user login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body; // Extract email and password from the request body

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the provided password matches the hashed password in the database
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token after successful login
        const token = generateToken(user); // Pass the user object to generate the token

        // Respond with success and user data (including token)
        return res.status(200).json({
            message: 'Login successful',
            user: {
                name: user.name,
                email: user.email,
            },
            token, // Include token in the response
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ message: 'An error occurred' });
    }
});

// PATCH Route to update user email
router.patch('/updateEmail', async (req, res) => {
    try {
        const { userId, newEmail } = req.body; // Extract userId and new email from the request body

        // Validate required fields
        if (!userId || !newEmail) {
            return res.status(400).json({ message: 'User ID and new email are required' });
        }

        // Check if the new email is already in use
        const emailExists = await User.findOne({ email: newEmail });
        if (emailExists) {
            return res.status(400).json({ message: 'Email is already in use' });
        }

        // Find the user by userId and update the email
        const updatedUser = await User.findByIdAndUpdate(
            userId, // Find the user by their unique userId
            { email: newEmail }, // Update the email
            { new: true } // Return the updated document
        );

        // If the user does not exist
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with the updated user
        return res.status(200).json({
            message: 'Email updated successfully',
            user: {
                name: updatedUser.name,
                email: updatedUser.email,
            },
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ message: 'An error occurred' });
    }
});
// Define a GET route to fetch all users
router.get('/users',jwtAuthMiddleware, async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await User.find();

        // Check if no users are found
        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        // Respond with the list of users
        return res.status(200).json({
            message: 'Users fetched successfully',
            users, // Include the list of users in the response
        });

    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ message: 'An error occurred while fetching users' });
    }
});

module.exports = router;
