const createError = require("http-errors");
const HeroModel = require("../model/heroModel");
const { successResponse } = require("../response/response");

exports.getHero = async (req, res, next) => {
  try {
    const response = await HeroModel.find();
    if (!response.length) {
      throw createError(404, "hero not found");
    }
    successResponse(res, {
      statusCode: 200,
      message: "Hero fetch successfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

exports.postHero = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if ((!title, !description)) {
      throw createError(404, "title and description are required");
    }

    const findExistingHero = HeroModel.find();

    if (findExistingHero) {
      await HeroModel.deleteMany();
    }

    const response = await HeroModel.create({ title, description });

    successResponse(res, {
      statusCode: 201,
      message: "Hero created Sucessfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateHero = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const find = await HeroModel.findOne();
    if (!find) {
      throw createError(404, "hero not found");
    }
    const updatedHero = {
      title,
      description,
    };
    const response = await HeroModel.updateOne(updatedHero);
    successResponse(res, {
      statusCode: 201,
      message: "Hero Update successfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};
