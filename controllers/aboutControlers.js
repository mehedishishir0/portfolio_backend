const createError = require("http-errors");
const AboutModel = require("../model/aboutModel,");
const cloudinary = require("../config/cloudinaryConfig");
const { successResponse } = require("../response/response");

exports.getAbout = async (req, res, next) => {
  try {
    const response = await AboutModel.find();
    if (!response.length) {
      throw createError(200, "about not found");
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

exports.postAbout = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    console.log(title, description);
    const file = req.file;

    if (!title || !description || !file) {
      throw createError(404, "all field are required");
    }
    const find = await AboutModel.find();

    if (find.length) {
      await cloudinary.uploader.destroy(find[0].image.public_id);
      await AboutModel.deleteMany();
    }

    const response = await cloudinary.uploader.upload(file.path, {
      resource_type: "image",
      folder: "shishir/aboutImage",
    });

    if (!response.secure_url) {
      throw createError(
        404,
        "image not uploaded on cloudinary. Please try again"
      );
    }
    const data = await AboutModel.create({
      title,
      description,
      image: {
        public_id: response.public_id,
        url: response.secure_url,
      },
    });

    successResponse(res, {
      statusCode: 201,
      message: "about created successfully",
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAbout = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    const find = await AboutModel.find();
    if (!find) {
      throw createError(404, "About not found");
    }
    let updatedData = {
      title,
      description,
    };

    if (file) {
      const [destroyResult, uploadResult] = await Promise.all([
        cloudinary.uploader.destroy(find[0].image.public_id),
        cloudinary.uploader.upload(file.path, {
          resource_type: "image",
          folder: "shishir/aboutImage",
        }),
      ]);
      if (destroyResult.result !== "ok") {
        throw createError(400, "faild to delete");
      }
      if (!uploadResult.secure_url) {
        throw createError(
          400,
          "image not uploded on clodinary. please try again"
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

    await AboutModel.updateOne(updatedData);
    successResponse(res, {
      statusCode: 201,
      message: "updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
