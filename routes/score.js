// Get express Router
const router = require("express").Router();

// Dot env constants
const dotenv = require("dotenv");
dotenv.config();

// Get the Validation schemas
const { scoreEntryValidation, usernameValidation } = require("../validation");

// Get the schemas
const ScoreEntry = require("../models/ScoreEntry");

router.post("/validateUsername", async (request, response) => {
    // Validate data
    const { error } = usernameValidation(request.body);

    // If there is a validation error
    if (error) return response.status(422).json({ error: error.details[0].message });
    return response.status(200).json({ success: true });
});

router.post("/setScore", async (request, response) => {
    // Validate data
    const { error } = scoreEntryValidation(request.body);

    // If there is a validation error
    if (error) return response.status(422).json({ error: error.details[0].message });

    try {
        // Deconstruct request
        const { username, score } = request.body;

        // Get user
        const user = await ScoreEntry.findOne({ username });

        if (user) {
            if (user.score >= score)
                return response.status(409).json({ error: "Score is lower than the previous one." });

            // Update Entry
            var newScoreEntry = await ScoreEntry.findOneAndUpdate({ username }, { $set: { score } }, { new: true });
        } else {
            // Create User
            const scoreEntry = new ScoreEntry({
                username,
                score,
            });

            // Save user to DB
            newScoreEntry = await scoreEntry.save();
        }

        response.status(200).json({ newScoreEntry });
    } catch (error) {
        // Return error
        response.status(500).json({ error });
    }
});

router.get("/getTopThree", async (_, response) => {
    try {
        const newScoreEntry = await ScoreEntry.find({}).sort({ score: -1 });
        const topThree = newScoreEntry.slice(0, 3);

        response.status(200).json({ topThree });
    } catch (error) {
        // Return error
        response.status(500).json({ error });
    }
});

router.post("/getPeopleAroundYou", async (request, response) => {
    // Validate data
    const { error } = usernameValidation(request.body);

    // If there is a validation error
    if (error) return response.status(422).json({ error: error.details[0].message });

    try {
        const { username } = request.body;

        const scores = await ScoreEntry.find({}).sort({ score: -1 });

        var index = -1;
        var yourScore = -1;
        for (let i = 0; i < scores.length; i++) {
            const elem = scores[i];
            if (elem.username === username) {
                index = i;
                yourScore = elem.score;
                break;
            }
        }

        if (index === -1) return response.status(409).json({ error: "This username is not in the database." });
        if (yourScore <= 0) return response.status(409).json({ error: "Non enough score to show this list" });

        const aroundYou = scores.slice(Math.max(0, index - 2), Math.min(scores.length - 1, index + 3));

        response.status(200).json({ aroundYou });
    } catch (error) {
        // Return error
        response.status(500).json({ error });
    }
});

module.exports = router;
