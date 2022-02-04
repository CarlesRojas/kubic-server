const Joi = require("joi");

const registerValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(12).required(),
        password: Joi.string().min(6).max(1024).required(),
    });

    return schema.validate(data);
};

const scoreValidation = (data) => {
    const schema = Joi.object({
        score: Joi.number().min(0).required(),
    });

    return schema.validate(data);
};

const tutorialDoneValidation = (data) => {
    const schema = Joi.object({
        tutorialDone: Joi.boolean().required(),
    });

    return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.scoreValidation = scoreValidation;
module.exports.tutorialDoneValidation = tutorialDoneValidation;
