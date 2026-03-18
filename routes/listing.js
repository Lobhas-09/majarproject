const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js")

const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validationListings } = require("../middleware.js")
const ListinngController = require("../controllers/listings.js");
const multer = require('multer');

const { storage } = require("../cloudConfig.js")
const upload = multer({ storage })

router.route("/")
  .get(wrapAsync(ListinngController.index))
  .post(isLoggedIn, upload.single('listing[image]'), validationListings, wrapAsync(ListinngController.CreateListings))



//New Router
router.get("/new", isLoggedIn, ListinngController.renderNewForm)

// Search & Filter routes (MUST be before /:id)
router.get("/search", wrapAsync(ListinngController.search));
router.get("/filter/:category", wrapAsync(ListinngController.filterByCategory));

router.route("/:id")
  .get(wrapAsync(ListinngController.ShowListings))
  .put(isLoggedIn, isOwner, upload.single('listing[image]'), validationListings, wrapAsync(ListinngController.UpdateListings))
  .delete(isOwner, isLoggedIn, wrapAsync(ListinngController.destroyListings))


//index router
// router.get("/", wrapAsync(ListinngController.index))



// show router
// router.get("/:id", wrapAsync(ListinngController.ShowListings))

//Create route
// router.post('/', isLoggedIn, validationListings, wrapAsync(ListinngController.CreateListings))
// if(!newListing.title){
//   throw new ExpressError(400, "Title is missing");
// }

// if(!newListing.discription){
//   throw new ExpressError(400, "Enter a discription");
// }

// if(!newListing.location){
//   throw new ExpressError(400, "location is missing");
// }


//edit router
router.get("/:id/edit", isOwner, isLoggedIn, wrapAsync(ListinngController.EditListings))

//update router
// router.put("/:id", isLoggedIn ,isOwner, validationListings,  wrapAsync(ListinngController.UpdateListings))

//DELETE ROUTER
// router.delete("/:id",isOwner, isLoggedIn, wrapAsync(ListinngController.destroyListings))

module.exports = router;