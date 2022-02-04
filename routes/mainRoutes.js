// Encrypt password
const bcrypt = require("bcryptjs");

// Token verification
const verify = require("./verifyToken");

// Token management
const webToken = require("jsonwebtoken");

// Get express Router
const router = require("express").Router();

// Dot env constants
const dotenv = require("dotenv");
dotenv.config();

// Get the Validation schemas
const { registerValidation, scoreValidation, tutorialDoneValidation } = require("../validation");

// Get the schemas
const User = require("../models/User");

router.post("/loginOrRegister", async (request, response) => {
    // Validate data
    const { error } = registerValidation(request.body);

    // If there is a validation error
    if (error) return response.status(422).json({ error: error.details[0].message });

    try {
        // Deconstruct request
        const { username, password } = request.body;

        // Get user
        var user = await User.findOne({ username });

        // Register
        if (!user) {
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create User
            const newUser = new User({
                username,
                password: hashedPassword,
            });

            // Save user to DB
            user = await newUser.save();
        }

        // Login
        else {
            // Check if the password is correct
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) return response.status(403).json({ error: "Invalid password." });
        }

        // Create and assign token
        const token = webToken.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
            expiresIn: 60 * 60 * 24 * 365 * 100,
        });

        response.header("token", token).status(200).json({ token });
    } catch (error) {
        // Return error
        response.status(500).json({ error });
    }
});

router.get("/getUserInfo", verify, async (request, response) => {
    try {
        // Deconstruct request
        const { _id } = request;

        // Get user
        const user = await User.findOne({ _id });
        if (!user) return response.status(404).json({ error: "User does not exist" });

        response.status(200).json(user);
    } catch (error) {
        // Return error
        response.status(500).json({ error });
    }
});

router.post("/setHighScore", verify, async (request, response) => {
    // Validate data
    const { error } = scoreValidation(request.body);

    // If there is a validation error
    if (error) return response.status(422).json({ error: error.details[0].message });

    try {
        // Deconstruct request
        const { _id } = request;
        const { score } = request.body;

        // Get user
        const user = await User.findOne({ _id });
        if (!user) return response.status(404).json({ error: "Username does not exits." });

        if (user.highestScore >= score)
            return response.status(409).json({ error: "Score is lower than the previous one." });

        // Update user
        var newUser = await User.findOneAndUpdate({ _id }, { $set: { highestScore: score } }, { new: true });

        response.status(200).json(newUser);
    } catch (error) {
        // Return error
        response.status(500).json({ error });
    }
});

router.post("/setTutorialStatus", verify, async (request, response) => {
    // Validate data
    const { error } = tutorialDoneValidation(request.body);

    // If there is a validation error
    if (error) return response.status(422).json({ error: error.details[0].message });

    try {
        // Deconstruct request
        const { _id } = request;
        const { tutorialDone } = request.body;

        // Get user
        const user = await User.findOne({ _id });
        if (!user) return response.status(404).json({ error: "Username does not exits." });

        // Update user
        var newUser = await User.findOneAndUpdate({ _id }, { $set: { tutorialDone } }, { new: true });

        response.status(200).json(newUser);
    } catch (error) {
        // Return error
        response.status(500).json({ error });
    }
});

router.get("/getTopTen", verify, async (request, response) => {
    console.log("hola");
    try {
        // Deconstruct request
        const { _id: userId } = request;

        const users = await User.find({}).sort({ highestScore: -1 });

        const userPosition = users.findIndex(({ _id }) => _id.toString() === userId);
        const topTen = users.slice(0, 10);

        response.status(200).json({ topTen, userPosition });
    } catch (error) {
        // Return error
        response.status(500).json({ error });
    }
});

router.post("/deleteAccount", verify, async (request, response) => {
    try {
        // Deconstruct request
        const { _id } = request;

        // Get user
        const user = await User.findOne({ _id });
        if (!user) return response.status(404).json({ error: "User does not exist" });

        // Delete User
        await User.deleteOne({ _id });

        // Return success
        response.status(200).json({ success: true });
    } catch (error) {
        // Return error
        response.status(500).json({ error });
    }
});
module.exports = router;
