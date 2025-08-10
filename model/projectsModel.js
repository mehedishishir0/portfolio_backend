const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: [
    {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
  technologies: {
    type: [String],
    required: true,
  },
  githubLink: {
    type: String,
    default: null,
  },
  liveLink: {
    type: String,
    default: null,
  },
});

const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;
