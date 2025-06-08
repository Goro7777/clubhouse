const { body } = require("express-validator");
const { users } = require("../storage/storage");

const validateUserSignup = [
    body("username")
        .trim()
        .custom((value) => {
            const usernameFoundInDb = users.find(
                (user) => user.username === value
            );
            if (usernameFoundInDb) {
                throw new Error("Username already in use");
            }
            return true;
        }),
    body("email")
        .trim()
        .isEmail()
        .withMessage("Not a valid e-mail address")
        .custom((value) => {
            const emailFoundInDb = users.find((user) => user.email === value);
            if (emailFoundInDb) {
                throw new Error("E-mail already in use");
            }
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
        .custom((value) => {
            let user = users.find((user) => user.username === value);
            if (!user) {
                throw new Error("Username not found");
            }
            return true;
        }),
    body("password").custom((value, { req }) => {
        let user = users.find((user) => user.username === req.body.username);
        if (user && user.password !== value) {
            throw new Error("Incorrect password");
        }
        return true;
    }),
];

module.exports = {
    validateUserSignup,
    validateUserLogin,
};
