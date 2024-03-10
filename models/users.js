const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

// .connect("mongodb://localhost/sampark")
mongoose
  .connect(
    "mongodb+srv://rohan:eB9SEo3057fwxHiG@cluster0.wwcfbd7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const userSchema = mongoose.Schema({
  name: String,
  username: String,
  password: String,
  // trucks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Truck" }],
});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);
