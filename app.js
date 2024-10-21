var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const compression = require("compression");
const helmet = require("helmet");
const favicon = require("serve-favicon");
require("dotenv").config();
const MongoStore = require("connect-mongo");

// Routes
const siteRouter = require("./routes/gardenofpages");
const monthlyWrapUpRouter = require("./routes/monthlyWrapUp");
const bookReviewRouter = require("./routes/bookReview");
const bookRouter = require("./routes/book");
const userRouter = require("./routes/user");

var app = express();

// Favicon
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_URL;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

if (process.env.NODE_ENV === "development") {
  const MockStrategy = require("passport-mock-strategy");
  // In Development, set up Mock Passport Local Strategy & Sessions
  console.log("In Development");

  passport.use(
    new MockStrategy(
      {
        name: "my-mock",
        user: {
          id: 1,
          is_admin: true,
        },
      },
      (user, done) => {
        // Perform actions on user, call done once finished
        return done(null, user);
      }
    )
  );

  app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: true,
    })
  );

  MockStrategy.setupSerializeAndDeserialize(passport, null, (id, done) => {
    // custom deserializeUser function
    done(null, {
      id: 1,
      is_admin: true,
    });
  });

  MockStrategy.connectPassport(app, passport);

  app.get("/", passport.authenticate("my-mock"));
  app.get("/book-reviews/add", passport.authenticate("my-mock"));
  app.get("/books/add", passport.authenticate("my-mock"));
  app.get("/monthly-wrap-up/add", passport.authenticate("my-mock"));
} else {
  // In Production, set up Passport & Sessions
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username: username });
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          // passwords do not match!
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Mongodb session
  app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

// view engine setup, updated to handle subdirectories in view folder
app.set("view engine", "pug");
app.set("views", "./views");
app.use(express.static(path.join(__dirname, "./public")));

// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         "img-src": [
//           "'self'",
//           "https://firebasestorage.googleapis.com",
//           "https://calendar.google.com",
//         ],
//         frameSrc: ["'self'", "*.google.com/"],
//       },
//     },
//   })
// );
app.use(compression()); // Compress all routes

// Set up rate limiter: maximum of twenty requests per minute
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});
// Apply rate limiter to all requests
// app.use(limiter);

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use(passport.initialize());
app.use(passport.session());
app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/public")));

// TinyMCE node module
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce"))
);

// he node module
app.use("/he", express.static(path.join(__dirname, "node_modules", "he")));
app.locals.he = require("he");

// moment node module
app.use(
  "/moment",
  express.static(path.join(__dirname, "node_modules", "moment"))
);
app.locals.moment = require("moment");

// Routes
app.use("/", siteRouter);
app.use("/monthly-wrap-ups", monthlyWrapUpRouter);
app.use("/book-reviews", bookReviewRouter);
app.use("/books", bookRouter);
app.use("/me", userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
