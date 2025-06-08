const path = require("node:path");
const express = require("express");
require("dotenv").config();
const { body, validationResult } = require("express-validator");

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
        isMember: false,
        isAdmin: false,
    },
];

function addUser(userData) {
    let { username, firstname, lastname, email, password } = userData;
    let user = {
        username,
        firstname,
        lastname,
        email,
        password,
        isMember: false,
        isAdmin: false,
    };
    users.push(user);
}

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
    console.log("------------ USERS ------------");
    console.log(users);
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
    res.render("pages/login", {
        title: "Login",
        links: [{ href: "/sign-up", text: "Sign-up" }],
    });
});

app.post("/login", validateUserLogin, (req, res) => {
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
});

// signup
app.get("/sign-up", (req, res) => {
    // what if the user is already logged in?
    res.render("pages/sign-up", {
        title: "Sing-up",
        links: [{ href: "/login", text: "Login" }],
    });
});

app.post("/sign-up", validateUserSignup, (req, res) => {
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
        addUser(req.body);
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
