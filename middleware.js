const Listing = require("./models/listing")
const ExpressError = require("./utils/ExpressError.js")
const { listingSchema, reviewSchema } = require("./Schema.js");
const Review = require("./models/review")

module.exports.isLoggedIn = (req, res, next) => {


  // console.log(req.path , ".." , req.originalUrl)    
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in to create listings")
    return res.redirect("/login")
  }
  next()
}

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }

  next();
}
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "you are not the owner of this Hotel")
    return res.redirect(`/listings/${id}`)
  }
  next()
}

module.exports.validationListings = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errmess = error.details.map((el) => el.message).join(",")
    throw new ExpressError(400, errmess)
  } else {
    next()
  }
  //  if(!req.body.listing)
}

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errmess = error.details.map((el) => el.message).join(",")
    throw new ExpressError(400, errmess)
  } else {
    next()
  }
  //  if(!req.body.listing)
}

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "you are not the Author of this review")
    return res.redirect(`/listings/${id}`)
  }
  next()
}