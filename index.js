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
            // Insert connect-pg-simple options here
        }),
        secret: process.env.FOO_COOKIE_SECRET,
        resave: false,
        saveUninitialized: false,
        // cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
        // Insert express-session options here
    })
);

require("./auth/passport");

app.use(passport.initialize());
app.use(passport.session());

app.use("/", router);

// catch-all middleware for handling errors
app.use((err, req, res, next) => {
    console.error(err);
    res.redirect("/");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening to requests on port ${PORT}`);
});
