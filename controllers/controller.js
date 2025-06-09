const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const {
    validateUserSignup,
    validateUserLogin,
} = require("../validation/validation");
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
        posts,
    });
};

const loginGet = (req, res) => {
    // console.log("login get");

    res.render("pages/login", {
        title: "Login",
        links: [{ href: "/sign-up", text: "Sign-up" }],
    });
};

const loginPost = [
    validateUserLogin,
    (req, res) => {
        // console.log("login post");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errorValues = Object.fromEntries(
                errors.errors.map((error) => [error.path, error.msg])
            );

            res.render("pages/login", {
                title: "Login",
                links: [{ href: "/sign-up", text: "Sign-up" }],
                values: req.body,
                errors: errorValues,
            });
        } else {
            res.redirect("/");
        }
    },
];

const signupGet = (req, res) => {
    // console.log("sign-up get");
    // what if the user is already logged in?
    res.render("pages/sign-up", {
        title: "Sing-up",
        links: [{ href: "/login", text: "Login" }],
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

            res.render("pages/sign-up", {
                title: "Sing-up",
                links: [{ href: "/login", text: "Login" }],
                values: req.body,
                errors: errorValues,
            });
        } else {
            let user = { ...req.body };
            let hashedPassword = await bcrypt.hash(user.password, 10);
            user.hashedPassword = hashedPassword;
            user.isMember = false;
            user.isAdmin = false;
            user.joinedOn = new Date();
            delete user.confirmPassword;
            db.addUser(user);
            res.redirect("/");
        }
    },
];

module.exports = {
    getAllMessages,
    loginGet,
    loginPost,
    signupGet,
    signupPost,
};
