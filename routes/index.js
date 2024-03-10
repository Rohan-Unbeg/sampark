var express = require("express");
const passport = require("passport");
var router = express.Router();
const userModel = require("../models/users");
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

router.get("/", function (req, res) {
  res.render("index");
});

router.get("/signin", function (req, res) {
  res.render("signin");
});

router.get("/signup", function (req, res) {
  res.render("signup");
});

router.get("/profile", isLoggedIn, function (req, res) {
  res.render("profile");
});

router.post("/signup", function (req, res) {
  const userdata = new userModel({
    name: req.body.name,
    username: req.body.username,
    password: req.body.password,
  });
  userModel
    .register(userdata, req.body.password)
    .then(function (registereduser) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    })
    .catch(function (err) {
      console.error("Error registering user:", err);
      res.sendStatus(500); // Internal Server Error
    });
});

router.post(
  "/signin",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
  })
);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

const truckSchema = new mongoose.Schema({
  truckName: {
    type: String,
  },
  truckType: {
    type: String,
  },
  capacity: {
    type: String,
  },
  destinations: {
    type: String,
  },
  ownerEmail: {
    type: String,
    required: true,
  },
});

const Truck = mongoose.model("Truck", truckSchema);

router.get("/truck", isLoggedIn, async (req, res) => {
  try {
    const trucks = await Truck.find();
    res.render("truck.ejs", { trucks });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/list", isLoggedIn, async (req, res) => {
  try {
    const trucks = await Truck.find();
    res.render("listing.ejs", { trucks });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/trucks", async (req, res) => {
  try {
    const { truckName, truckType, capacity, destinations, ownerEmail } =
      req.body;
    const newTruck = new Truck({
      truckName,
      truckType,
      capacity,
      destinations,
      ownerEmail,
    });
    await newTruck.save();
    res.redirect("/truck");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/booking/:id", async (req, res) => {
  try {
    const truckId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(truckId)) {
      return res.status(400).send("Invalid truck ID");
    }
    const truck = await Truck.findById(truckId);
    if (!truck) {
      return res.status(404).send("Truck not found");
    }
    res.render("booking", { truck }); // Pass the truck object to the view
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


router.post("/booking/:id/confirm", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const truckId = req.params.id;
    const truck = await Truck.findById(truckId); // Fetch the truck object from the database
    if (!truck) {
      return res.status(404).send("Truck not found");
    }
    const ownerEmail = truck.ownerEmail; // Access the ownerEmail property
    console.log(ownerEmail);
    // Add your logic here to send confirmation email to the owner
    res.send("Confirmation email sent");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = router;



//   // Fetch the details of the truck, including the truck owner's email
  //   const truck = await Truck.findById(truckId);
  //   if (!truck) {
  //     return res.status(404).send("Truck not found");
  //   }

  //   // Compose email content
  //   const transporter = nodemailer.createTransport({
  //     service: "gmail",
  //     auth: {
  //       user: "rohanunbeg0918@gmail.com", // Sender's email address
  //       pass: "oeht ekyc cwsx xfyd", // Sender's email password
  //     },
  //   });

  //   // Define email message options
  //   const mailOptions = {
  //     from: "your_email@gmail.com", // Replace with your email
  //     to: truck.ownerEmail, // Send email to the truck owner
  //     subject: "New Booking Request for Your Truck",
  //     text: `Hello,\n\nA new booking request has been made for your truck ${truck.truckName}.\n\nDetails:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`,
  //     // html: `<p>Hello,</p><p>A new booking request has been made for your truck <strong>${truck.truckName}</strong>.</p><p><strong>Details:</strong></p><p>Name: ${name}</p><p>Email: ${email}</p><p>Phone: ${phone}</p>`
  //   };

  //   // Send the email
  //   transporter.sendMail(mailOptions, function (error, info) {
  //     if (error) {
  //       console.error("Error sending email:", error);
  //       res.status(500).send("Error sending email");
  //     } else {
  //       console.log("Email sent:", info.response);
  //       res.status(200).send("Booking request sent successfully");
  //     }
  //   });