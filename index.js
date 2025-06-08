const path = require("node:path");
const express = require("express");
require("dotenv").config();
const { body, validationResult } = require("express-validator");
const { error } = require("node:console");
const { values } = require("lodash");

/**
 * ---------------------- USERS ----------------------
 */

const users = [
    {
        username: "bobo",
        firstname: "John",
        lastname: "Smith",
        email: "play@mail.ru",
        password: "123456",
    },
];

/**
 * ---------------------- VALIDATION ----------------------
 */

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

const app = express();

app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
    "/css",
    express.static(
        path.join(__dirname, "node_modules", "bootstrap", "dist", "css")
    )
);

app.get("/", (req, res) => {
    res.render("pages/index", {
        title: "Club House",
        links: [
            { href: "/login", text: "Login" },
            { href: "/sign-up", text: "Sign-up" },
        ],
    });
});

// login
app.get("/login", (req, res) => {
    // what if the user is already logged in?
    console.log("login page");
    res.render("pages/login", {
        title: "Login",
        links: [],
    });
});

app.post("/login", (req, res) => {
    console.log("you've logged in");
    res.redirect("/");
});

// signup
app.get("/sign-up", (req, res) => {
    // what if the user is already logged in?
    console.log("login page");
    res.render("pages/sign-up", {
        title: "Sing-up",
        links: [],
        errors: {},
        values: {},
    });
});

app.post("/sign-up", validateUserSignup, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errorValues = Object.fromEntries(
            errors.errors.map((error) => [error.path, error.msg])
        );
        console.log("--------------------");
        console.log(errorValues);
        res.render("pages/sign-up", {
            title: "Sing-up",
            links: [],
            values: req.body,
            errors: errorValues,
        });
    } else {
        console.log("you've signed up");
        console.log(req.body);
        res.redirect("/");
    }
});

// catch-all middleware for handling errors
app.use((err, req, res, next) => {
    console.error(err);
    res.redirect("/");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening to requests on port ${PORT}`);
});
