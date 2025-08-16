const createError = require("http-errors");
const TimelineModel = require("../model/timelineModel");
const { successResponse } = require("../response/response");

exports.getTimelin = async (req, res, next) => {
  try {
    const response = await TimelineModel.find();
    if (!response.length) {
      throw createError(404, "Not found");
    }
    successResponse(res, {
      statusCode: 200,
      message: "fetch successfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

exports.postTimeline = async (req, res, next) => {
  try {
    console.log(req.body)
    const { date, title, subTitle, content } = req.body;
    console.log(date),
    console.log(req.body)
    if (!date || !title || !subTitle || !content) {
      throw createError(404, "all field are required");
    }
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      throw createError(
        400,
        "Invalid date format. Use YYYY-MM-DD or ISO string"
      );
    }
    const response = await TimelineModel.create({
      title,
      date: parsedDate,
      content,
      subTitle,
    });
    successResponse(res, {
      statusCode: 201,
      message: "Time line created successfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTimeline = async (req, res, next) => {
  try {
    const { date, title, subTitle, content } = req.body;
    const { id } = req.params;
    const find = await TimelineModel.findById(id);
    if (!find) {
      throw createError(404, "not found");
    }
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      throw createError(
        400,
        "Invalid date format. Use YYYY-MM-DD or ISO string"
      );
    }
    const updatedData = {
      date: parsedDate,
      title,
      subTitle,
      content,
    };

    await TimelineModel.findByIdAndUpdate(id, updatedData);
    successResponse(res, { statusCode: 200, message: "Updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deleteTimeline = async (req, res, next) => {
  try {
    const { id } = req.params;
    const find = await TimelineModel.findById(id);
    if (!find) {
      throw createError(404, "not found with this id");
    }
    await TimelineModel.findByIdAndDelete(id);
    successResponse(res, { statusCode: 200, message: "Deleted successfully" });
  } catch (error) {
    next(error);
  }
};
