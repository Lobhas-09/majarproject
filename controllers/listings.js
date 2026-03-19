const Listing = require("../models/listing")

const maptilerClient = require("@maptiler/client");

maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;


// in an async function, or as a 'thenable':

// in an async function, or as a 'thenable':

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", {
    allListings,
    maptilerKey: process.env.MAPTILER_API_KEY,
    searchQuery: null,
    activeCategory: null,
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs", {
    maptilerKey: process.env.MAPTILER_API_KEY,
  });
}

module.exports.ShowListings = async (req, res) => {
  let { id } = req.params;
  id = id.trim();
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews"
      , populate: {
        path: "author",
      }
    }).populate("owner");
  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");  // ✅ return stops execution here
  }

  // ✅ Only ONE res.render at the end
  return res.render("listings/show.ejs", {
    listing,
    maptilerKey: process.env.MAPTILER_API_KEY,
  });
};
// module.exports.CreateListings = async (req, res,next) => {


// const gc = new GeocodingControl({
//   collapsed: true,
//   country: 'de',
//   limit: 10
// });

//   let url = req.file.path;
//   let filename = req.file.filename;


//   const newListing = new Listing(req.body.listing); // cannot throw now

//    newListing.owner = req.user._id;

//    newListing.image = { url , filename }
//   await newListing.save();
//   req.flash("success" , "New Listings Created")
//   res.redirect('/listings');
// }
module.exports.CreateListings = async (req, res, next) => {
  try {
    // Ensure categories is always an array
    if (!req.body.listing.categories) {
      req.body.listing.categories = [];
    } else if (typeof req.body.listing.categories === "string") {
      req.body.listing.categories = [req.body.listing.categories];
    }

    const location = req.body.listing.location;
    let coordinates;

    try {
      const geoData = await maptilerClient.geocoding.forward(location, {
        limit: 1,
        language: ["en"],
      });

      if (!geoData.features.length) {
        req.flash("error", "Location not found, please try again");
        return res.redirect("/listings/new");
      }

      coordinates = geoData.features[0].geometry.coordinates;
    } catch (geoErr) {
      console.error("Geocoding Error:", geoErr);
      req.flash("error", "Map service is currently unavailable. Please try again later.");
      return res.redirect("/listings/new");
    }

    let url, filename;
    if (req.file) {
      url = req.file.path;
      filename = req.file.filename;
    } else {
      console.warn("CREATE LISTING DEBUG: No req.file found, using default image. Check if Cloudinary credentials are correct.");
      url = "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60";
      filename = "default_image";
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = {
      type: "Point",
      coordinates: coordinates,
    };

    await newListing.save();
    req.flash("success", "New Listing Created");
    return res.redirect("/listings");

  } catch (err) {
    console.error("Creation Error:", err);
    req.flash("error", err.message);
    res.redirect("/listings/new");
  }
};
module.exports.EditListings = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image?.url || "";
  if (originalImageUrl) {
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
  }

  res.render("listings/edit.ejs", { listing, originalImageUrl });
}

module.exports.UpdateListings = async (req, res) => {
  try {
    let { id } = req.params;

    // Ensure categories is always an array
    if (!req.body.listing.categories) {
      req.body.listing.categories = [];
    } else if (typeof req.body.listing.categories === "string") {
      req.body.listing.categories = [req.body.listing.categories];
    }

    let ListingToUpdate = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (!ListingToUpdate) {
      req.flash("error", "Listing you requested to update does not exist!");
      return res.redirect("/listings");
    }

    if (typeof req.file !== "undefined") {
      let url = req.file.path;
      let filename = req.file.filename;
      ListingToUpdate.image = { url, filename };
      await ListingToUpdate.save();
    }

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error("Update Error:", err);
    req.flash("error", err.message);
    res.redirect(`/listings/${req.params.id}/edit`);
  }
};

module.exports.destroyListings = async (req, res) => {
  let { id } = req.params;
  let deletedListings = await Listing.findByIdAndDelete(id);
  console.log(deletedListings);

  req.flash("success", " Listings Deleted")
  res.redirect("/listings");

}

module.exports.search = async (req, res) => {
  const q = req.query.q ? req.query.q.trim() : "";
  if (!q) {
    req.flash("error", "Please enter a search term");
    return res.redirect("/listings");
  }
  const regex = new RegExp(q, "i");
  const allListings = await Listing.find({
    $or: [
      { title: regex },
      { location: regex },
      { country: regex },
      { categories: regex },
    ],
  });
  if (allListings.length === 0) {
    req.flash("error", "This data is not in the list");
    return res.redirect("/listings");
  }
  res.render("listings/index.ejs", {
    allListings,
    maptilerKey: process.env.MAPTILER_API_KEY,
    searchQuery: q,
    activeCategory: null,
  });
};

module.exports.filterByCategory = async (req, res) => {
  const { category } = req.params;
  const regex = new RegExp(category, "i");
  const allListings = await Listing.find({ categories: { $in: [regex] } });
  if (allListings.length === 0) {
    req.flash("error", "This data is not in the list");
    return res.redirect("/listings");
  }
  res.render("listings/index.ejs", {
    allListings,
    maptilerKey: process.env.MAPTILER_API_KEY,
    searchQuery: null,
    activeCategory: category,
  });
};