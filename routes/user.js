const express = require("express");
const router = express.Router();
const User = require("../models/user.js")
const wrapAsync = require("../utils/wrapAsync")
const passport = require("passport")
const { saveRedirectUrl } = require("../middleware.js");
const UserListings = require("../controllers/users.js")


router.route("/signup")
.get(UserListings.renderSignup )
.post(wrapAsync(UserListings.signup))


router.route("/login")
.get( UserListings.renderLoginForm  )

.post(saveRedirectUrl , passport.authenticate('local', { failureRedirect: '/login', failureFlash: true } )
, UserListings.login)

// router.get("/signup",UserListings.renderSignup )

// router.post("/signup", wrapAsync(UserListings.signup))

// router.get("/login", UserListings.renderLoginForm  )


// router.post("/login", saveRedirectUrl , passport.authenticate('local', { failureRedirect: '/login', failureFlash: true } )
// , UserListings.login)


router.get("/logout", UserListings.LogOut)





module.exports = router;