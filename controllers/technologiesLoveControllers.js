const createError = require("http-errors");
const TechnologiesModel = require("../model/technologiesLoveModel");
const cloudinary = require("../config/cloudinaryConfig");
const { successResponse } = require("../response/response");

exports.getTechnologi = async (req, res, next) => {
  try {
    const response = await TechnologiesModel.find();
    if (!response.length) {
      throw createError(404, "not found ");
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

exports.postTechnologi = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    console.log(name, description);
    const file = req.file;

    if ((!name, !description, !file)) {
      throw createError(404, "all filed are required");
    }
    const imageData = await cloudinary.uploader.upload(file.path, {
      resource_type: "image",
      folder: "shishir/technologies",
    });
    if (!imageData.secure_url) {
      throw createError(
        400,
        "image not uploaded on cloudinary. Please try again"
      );
    }
    const response = await TechnologiesModel.create({
      name,
      description,
      image: {
        public_id: imageData.public_id,
        url: imageData.secure_url,
      },
    });

    successResponse(res, {
      statusCode: 201,
      message: "technologi created seccessfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTechnologi = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const { id } = req.params;
    const file = req.file;
    const find = await TechnologiesModel.findById(id);
    if (!find) {
      throw createError(404, "technology not found");
    }

    let updatedData = {
      name,
      description,
    };

    if (file) {
      const [destroyResult, uploadResult] = await Promise.all([
        cloudinary.uploader.destroy(find.image.public_id),
        cloudinary.uploader.upload(file.path, {
          resource_type: "image",
          folder: "shishir/technologies",
        }),
      ]);
      if (destroyResult.result !== "ok") {
        throw createError(400, "faild to delete image");
      }
      if (!uploadResult.secure_url) {
        throw createError(
          400,
          "image not uploaded on cloudinary. Please try again"
        );
      }
      updatedData = {
        ...updatedData,
        image: {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        },
      };
    }

    await TechnologiesModel.findByIdAndUpdate(id, updatedData);

    successResponse(res, {
      statusCode: 200,
      message: "technologi updated seccessfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTechnologi = async (req, res, next) => {
  try {
    const { id } = req.params;
    const find = await TechnologiesModel.findById(id);
    if (!find) {
      throw createError(404, "not found");
    }
    const response = await cloudinary.uploader.destroy(find.image.public_id);
    if (response.result !== "ok") {
      throw createError(400, "faild to delete image");
    }
    await TechnologiesModel.findByIdAndDelete(id);
    successResponse(res, {
      statusCode: 200,
      message: "deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
