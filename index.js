const path = require("node:path");
const express = require("express");
require("dotenv").config();

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
            { href: "/login", text: "Log In" },
            { href: "/signup", text: "Sign Up" },
        ],
    });
});

app.get("/login", (req, res) => {
    // what if the user is already logged in?
    console.log("login page");
    res.render("pages/login", {
        title: "Login",
        links: [],
    });
});

app.post("/login", (req, res) => {
    // what if the user is already logged in?
    console.log("form has been submitted");
    res.redirect("/");
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
