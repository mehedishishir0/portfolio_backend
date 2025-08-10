const mongoose = require("mongoose");

const heroSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});
const HeroModel = mongoose.model('hero', heroSchema);

module.exports = HeroModel;