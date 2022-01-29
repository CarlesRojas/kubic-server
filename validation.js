const Joi = require("joi");

const scoreEntryValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(12).required(),
        score: Joi.number().min(0).required(),
    });

    return schema.validate(data);
};

module.exports.scoreEntryValidation = scoreEntryValidation;
