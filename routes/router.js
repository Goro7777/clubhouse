const express = require("express");
const router = express.Router();
const controller = require("../controllers/controller");

router.get("/", controller.allPostsGet);

router.get("/login", controller.loginGet);
router.post("/login", controller.loginPost);

router.get("/logout", controller.logoutGet);

router.get("/sign-up", controller.signupGet);
router.post("/sign-up", ...controller.signupPost);

router.get("/newPost", controller.newPostGet);
router.post("/newPost", ...controller.newPostPost);

router.get("/editPost/:postid", controller.editPostGet);
router.post("/editPost/:postid", ...controller.editPostPost);

router.get("/deletePost/:postid", controller.deletePostGet);

module.exports = router;
