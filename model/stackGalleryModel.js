const mongoose = require("mongoose");

const stackGallerySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
});

const StackGallery = mongoose.model("StackGallery", stackGallerySchema);

module.exports = StackGallery;
