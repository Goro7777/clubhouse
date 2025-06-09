const { body } = require("express-validator");
const bcrypt = require("bcryptjs");
const db = require("../db/queries");

const validateUserSignup = [
    body("username")
        .trim()
        .custom(async (value) => {
            let usernameTaken = await db.getByField("username", value);
            if (usernameTaken) throw new Error("Username already in use");

            return true;
        }),
    body("email")
        .trim()
        .isEmail()
        .withMessage("Not a valid e-mail address")
        .custom(async (value) => {
            let emailTaken = await db.getByField("email", value);
            if (emailTaken) throw new Error("E-mail already in use");

            return true;
        }),

    body("password")
        .trim()
        .isLength({ min: 6 })
        .withMessage("Must be at least 6 characters long"),
    body("confirmPassword")
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password)
                throw new Error('Must match the "Password" field');
            return true;
        }),
];

const validateUserLogin = [
    body("username")
        .trim()
        .custom(async (value) => {
            let user = await db.getByField("username", value);
            if (!user) throw new Error("Username not found");

            return true;
        }),
    body("password").custom(async (value, { req }) => {
        let user = await db.getByField("username", req.body.username);
        console.log(user);
        if (!user) return true;

        let match = await bcrypt.compare(value, user.password);
        if (!match) throw new Error("Incorrect password");

        return true;
    }),
];

module.exports = {
    validateUserSignup,
    validateUserLogin,
};
