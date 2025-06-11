const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { validateSignup, validatePost } = require("../validation/validation");
const passport = require("passport");
const db = require("../db/queries");

const allPostsGet = async (req, res) => {
    let posts = await db.getAllPosts();
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
    validateSignup,
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
            res.redirect("/login");
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
        title: "New Post",
        action: "/newPost",
        values,
        errors,
        submitText: "Post",
    });
};

const newPostPost = [
    validatePost,
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
            let post = {
                ...req.body,
                userId: req.user.userid,
                postedOn: new Date(),
            };
            await db.addPost(post);
            res.redirect("/");
        }
    },
];

const editPostGet = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).render("pages/error", {
            message: "401 - Unauthorized: You cannot edit posts.",
        });
    }

    let { postid } = req.params;
    let values, errors;
    if (req.session.redirectData) {
        values = req.session.redirectData.values;
        errors = req.session.redirectData.errors;
    } else {
        let { postid } = req.params;
        let post = await db.getPost(postid);

        if (post.userid !== req.user.userid) {
            return res.status(400).render("pages/error", {
                message:
                    "400 - Bad Request: You are not allowed to edit this post.",
            });
        } else {
            values = post;
        }
    }
    req.session.redirectData = null;

    res.render("pages/post", {
        title: "Edit Post",
        action: `/editPost/${postid}`,
        values,
        errors,
        submitText: "Edit",
    });
};

const editPostPost = [
    validatePost,
    async (req, res) => {
        const errors = validationResult(req);
        let { postid } = req.params;
        if (!errors.isEmpty()) {
            errorValues = Object.fromEntries(
                errors.errors.map((error) => [error.path, error.msg])
            );
            req.session.redirectData = {
                values: req.body,
                errors: errorValues,
            };
            res.redirect(`/editPost/${postid}`);
        } else {
            let post = {
                ...req.body,
                postid,
                postedOn: new Date(),
            };
            await db.editPost(post);
            res.redirect("/");
        }
    },
];

const deletePostGet = async (req, res) => {
    if (!req.isAuthenticated()) {
        res.render("pages/error", {
            message: "400 - Bad Request: You are not allowed to delete a post.",
        });
        return;
    }

    let { postid } = req.params;
    let post = await db.getPost(postid);

    if (!req.user.isAdmin && post?.userid !== req.user.userid)
        return res.status(400).render("pages/error", {
            message:
                "400 - Bad Request: You are not allowed to delete this post.",
        });

    await db.deletePost(postid);
    res.redirect("/");
};

const profileGet = async (req, res) => {
    // add isAuthenticated check here

    let { userid } = req.params;

    let userProfileInfo = await db.getUserProfileInfo(userid);
    userProfileInfo.status = userProfileInfo.isadmin
        ? "Admin"
        : userProfileInfo.ismember
        ? "Club member"
        : "User";

    res.render("pages/profile", { userProfileInfo });
};

module.exports = {
    allPostsGet,
    loginGet,
    loginPost,
    signupGet,
    signupPost,
    logoutGet,
    newPostGet,
    newPostPost,
    editPostGet,
    editPostPost,
    deletePostGet,
    profileGet,
};
