const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validators = require("../middlewares/validators");
const { body } = require("express-validator");

/**
 * @route POST auth/login
 * @description LOGIN
 * @access Public
 */
router.post(
  "/login",
  validators.validate([
    body("email", "Invalid email").exists().isEmail(),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  authController.loginWithEmail
);

/**
 * @route POST auth/login
 * @description LOGINWITHFACEBOOK
 * @access Public
 */
router.get("/login/facebook/:token", authController.loginWithFacebook);

/**
 * @route POST auth/login
 * @description LOGINWITHGOOGLE
 * @access Public
 */
router.get("/login/google/:token", authController.loginWithGoogle);
module.exports = router;
