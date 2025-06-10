const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const db = require("../db/queries");

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            let user = await db.getUserByField("username", username);

            if (!user) {
                // no error, don't let in
                console.log("didn't pass");
                return done(null, false, {
                    message: `username:Username not found:${username}:${password}`,
                });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                // no error, don't let in
                return done(null, false, {
                    message: `password:Incorrect password:${username}:${password}`,
                });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.userid);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.getUserByField("userid", id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});
