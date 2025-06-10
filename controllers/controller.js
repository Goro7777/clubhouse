const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const {
    validateUserSignup,
    validateNewPost,
} = require("../validation/validation");
const passport = require("passport");
const { posts } = require("../storage/storage");
const db = require("../db/queries");

const allPostsGet = async (req, res) => {
    res.render("pages/index", {
        posts,
    });
};

const loginGet = async (req, res) => {
    if (req.isAuthenticated()) {
        return res.status(400).render("pages/error", {
            message: "400 - Bad Request: You are already logged in.",
        });
    }

    let errors, values;
    if (req.session.messages?.length) {
        let errorMessage = req.session.messages.pop();
        let [field, message, username, password] = errorMessage.split(":");
        errors = { [field]: message };
        values = { username, password };
        req.session.messages.length = 0;
    }

    res.render("pages/login", {
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
    if (req.isAuthenticated()) {
        return res.status(400).render("pages/error", {
            message: "400 - Bad Request: You already have an account.",
        });
    }

    let { values, errors } = req.session.redirectData || {};
    req.session.redirectData = null;
    res.render("pages/sign-up", {
        values,
        errors,
    });
};

const signupPost = [
    validateUserSignup,
    async (req, res) => {
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

const newPostGet = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).render("pages/error", {
            message:
                "401 - Unauthorized: You need to log in to be able to post.",
        });
    }
    let { values, errors } = req.session.redirectData || {};
    req.session.redirectData = null;
    res.render("pages/post", {
        values,
        errors,
    });
};

const newPostPost = [
    validateNewPost,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errorValues = Object.fromEntries(
                errors.errors.map((error) => [error.path, error.msg])
            );
            req.session.redirectData = {
                values: req.body,
                errors: errorValues,
            };
            res.redirect("/newPost");
        } else {
            console.log("Adding new post to db...");
            res.redirect("/");
        }
    },
];

module.exports = {
    allPostsGet,
    loginGet,
    loginPost,
    signupGet,
    signupPost,
    logoutGet,
    newPostGet,
    newPostPost,
};
