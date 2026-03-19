const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  categories: {
    type: [String],
    default: []
  },
  price: Number,
  location: String,
  country: String,
  // ✅ Geometry field added for Geocoding
  geometry: {
    type: {
      type: String,
      enum: ["Point"],      // Only GeoJSON Point allowed
      required: true,
    },
    coordinates: {
      type: [Number],       // [longitude, latitude]
      required: true,
    },
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"

    }

  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await review.deleteMany({ _id: { $in: listing.reviews } })

  }

})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing; 