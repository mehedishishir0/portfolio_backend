const mongoose = require("mongoose");

const achievementsSchema = new mongoose.Schema({
  projectComplited: {
    type: Number,
    default: 0,
  },
  yearsExperience: {
    type: Number,
    default: 0,
  },
  cupsOfCoffee: {
    type: Number,
    default: 0,
  },
  happyClients: {
    type: Number,
    default: 0,
  },
  satisfactionRate: {
    type: Number,
    default: 0,
  },
  technologiesUsed: {
    type: Number,
    default: 0,
  },
  contributions: {
    type: Number,
    default: 0,
  },
});

const Achievements = mongoose.model("Achievements", achievementsSchema);

module.exports = Achievements;
