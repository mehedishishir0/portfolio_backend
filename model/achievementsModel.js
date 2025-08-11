const mongoose = require("mongoose");

const achievementsSchema = new mongoose.Schema({
  title: { type: String, required: true },      // e.g. "Projects Delivered"
  value: { type: String, required: true },      // e.g. "60+"
  percentage: { type: Number, default: null },  // optional
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
});

const AchievementsModel = mongoose.model("Achievements", achievementsSchema);

module.exports = AchievementsModel;
