require("dotenv").config();
const path = require("node:path");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const pgSession = require("connect-pg-simple")(session);
const pool = require("./db/pool");

const router = require("./routes/router");

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

app.use(
    session({
        store: new pgSession({
            pool,
        }),
        secret: process.env.FOO_COOKIE_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

require("./auth/passport");

app.use(passport.initialize());
app.use(passport.session());

// To make user available in all views
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.use("/", router);

app.use((req, res) =>
    res.status(404).render("pages/error", {
        message: "404 Not Found: There is no such resource.",
    })
);

app.use((err, req, res, next) => {
    console.error(err);
    res.render("pages/error", {
        message: "An error occurred while processing your request.",
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening to requests on port ${PORT}`);
});
