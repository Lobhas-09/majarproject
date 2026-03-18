const express = require("express");
const router = express.Router({mergeParams :true});
const wrapAsync = require("../utils/wrapAsync.js")

const Review = require("../models/review.js");

 const Listing = require("../models/listing.js");
const {validateReview , isLoggedIn ,  isReviewAuthor} = require("../middleware.js")
const ReviewController = require("../controllers/review.js")

//Reviews POST ROUTE
router.post("/", isLoggedIn , validateReview, wrapAsync(ReviewController.CreateReview))

// Delete Reviews POST ROUTE
router.delete("/:reviewId", isLoggedIn , isReviewAuthor, wrapAsync(ReviewController.distroyReview))

module.exports = router;