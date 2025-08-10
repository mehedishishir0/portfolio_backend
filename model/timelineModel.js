const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subTitle: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    content: {
        type: String,
        required: true
    }
});

const Timeline = mongoose.model("Timeline", timelineSchema);

module.exports = Timeline;
