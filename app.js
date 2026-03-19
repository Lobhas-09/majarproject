require("dotenv").config();
console.log("ENVIRONMENT DIAGNOSTICS:");
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- CLOUD_NAME:", process.env.CLOUD_NAME ? "✅ Detected" : "❌ Missing");
console.log("- CLOUD_API_KEY:", process.env.CLOUD_API_KEY ? "✅ Detected" : "❌ Missing");
console.log("- CLOUD_API_SECRET:", process.env.CLOUD_API_SECRET ? "✅ Detected (Masked)" : "❌ Missing");








const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")
// const Review = require("./models/review.js");
const flash = require("connect-flash")
const session = require("express-session")
const MongoStore = require("connect-mongo").default;

const listingsRouter = require("./routes/listing.js")
const reviewsRouter = require("./routes/review.js")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user.js")

const userRouter = require("./routes/user.js")


// const { listingSchema, reviewSchema } = require("./Schema.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
main()
  .then(() => {
    console.log("connected to Db");
  })
  .catch((err) => {
    console.log(err);
  });



async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR IN SESSION STORE", err);
});

const sessionOptins = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 1000,
    httpOnly: true
  }
}



app.get("/", (req, res) => {
  res.redirect("/listings");
});





app.use(session(sessionOptins))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))


// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





app.use((req, res, next) => {
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  res.locals.currUser = req.user;
  next()
})

app.get("/demouser", async (req, res) => {
  let fakeuser = new User({
    email: "student@gmail.com",
    username: "dalta-student",
  });

  let registeredUser = await User.register(fakeuser, "lobhasthekale")
  res.send(registeredUser)
})




app.use("/listings", listingsRouter)
app.use("/listings/:id/reviews", reviewsRouter)
app.use("/", userRouter);



// //create Route  // try catch create a one middleware below and send it error
// app.post("/listings" , async(req, res , next) =>{
//   // let {title, description , image, price , location } = req.body;
//    try{

//      const newListing = new Listing(req.body.listing);
//      await newListing.save();
//      res.redirect("/listings");
//     }catch(err){
//       next(err)
//     }


// })
//create Route  // wrapasync
//create Route  // wrapasync
// app.post("/listings" , wrapAsync(async(req, res) =>{
//   // let {title, description , image, price , location } = req.body;


//      const newListing = new Listing(req.body.listing);
//      await newListing.save();
//      res.redirect("/listings");

// })
// );




// app.get("/testListing" , async (req,res)=>{
//   let sampleListing = new Listing ({
//     title : "my new banglo",
//     description : "by the beach",
//     price : 4000,
//     location : "malvan , kokan",
//     contry : "india",
//   });
//   await sampleListing.save();
//   console.log("simple was saved")
//   res.send("data can store successfuly")
// });

// catch‑all 404 (earlier advice)
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// error‑handler – must come last
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  // either send plain text, or render an error view:
  // res.status(statusCode).render("error", { err });
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { message });
});
app.listen(8080, () => {
  console.log("server is listening to  port 8080");
});