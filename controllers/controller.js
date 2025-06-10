const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { validateUserSignup } = require("../validation/validation");
const passport = require("passport");
const { posts } = require("../storage/storage");
const db = require("../db/queries");

const getAllMessages = async (req, res) => {
    let users = await db.getAllUsers();
    console.log(users);
    res.render("pages/index", {
        title: "Club House",
        links: [
            { href: "/login", text: "Login" },
            { href: "/sign-up", text: "Sign-up" },
        ],
        user: req.user,
        posts,
    });
};

const loginGet = async (req, res) => {
    if (req.isAuthenticated()) {
        res.send("<h1>You are already logged in</h1>");
        return;
    }
    console.log("error messages:");
    let errors = {};
    let values;
    if (req.session.messages?.length) {
        let errorMessage = req.session.messages.pop();
        let [field, message, username, password] = errorMessage.split(":");
        errors[field] = message;
        values = { username, password };
        req.session.messages.length = 0;
    }

    res.render("pages/login", {
        title: "Login",
        links: [{ href: "/sign-up", text: "Sign-up" }],
        errors,
        values,
    });
};

const loginPost = passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureMessage: true,
});

const signupGet = (req, res) => {
    // console.log("sign-up get");
    // what if the user is already logged in?
    let { values, errors } = req.session.redirectData || {};
    // req.session.redirectData = null;
    res.render("pages/sign-up", {
        title: "Sing-up",
        links: [{ href: "/login", text: "Login" }],
        values,
        errors,
    });
};

const signupPost = [
    validateUserSignup,
    async (req, res) => {
        // console.log("sign-up post");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errorValues = Object.fromEntries(
                errors.errors.map((error) => [error.path, error.msg])
            );
            req.session.redirectData = {
                values: req.body,
                errors: errorValues,
            };
            res.redirect("/sign-up");
        } else {
            let user = { ...req.body };
            let hashedPassword = await bcrypt.hash(user.password, 10);
            user.hashedPassword = hashedPassword;
            user.isMember = false;
            user.isAdmin = false;
            user.joinedOn = new Date();
            await db.addUser(user);
            res.redirect("/");
        }
    },
];

const logoutGet = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
};

module.exports = {
    getAllMessages,
    loginGet,
    loginPost,
    signupGet,
    signupPost,
    logoutGet,
};
