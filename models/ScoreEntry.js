const mongoose = require("mongoose");

const scoreEntrySchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        min: 3,
        max: 12,
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
});

module.exports = mongoose.model("ScoreEntry", scoreEntrySchema);
