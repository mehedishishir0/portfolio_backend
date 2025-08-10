const mongoose = require("mongoose");

const technologiesLoveSchema = new mongoose.Schema({
  name: {
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
  description: {
    type: String,
    required: true,
  },
});

const TechnologiesModel = mongoose.model("technologies",technologiesLoveSchema)

module.exports =TechnologiesModel