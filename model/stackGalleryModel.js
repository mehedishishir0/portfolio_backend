const mongoose = require("mongoose");

const stackGallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
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

const StackGallery = mongoose.model("StackGallery", stackGallerySchema);

module.exports = StackGallery;
