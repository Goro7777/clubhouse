const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const db = require("../db/queries");

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            let user = await db.getByField("username", username);

            if (!user) {
                // no error, don't let in
                return done(null, false, { message: "Username not found" });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                // no error, don't let in
                return done(null, false, { message: "Incorrect password" });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.getByField("id", id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});
