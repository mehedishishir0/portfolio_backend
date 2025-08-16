const createError = require("http-errors");
const cloudinary = require("../config/cloudinaryConfig");
const StackGallery = require("../model/stackGalleryModel");
const { successResponse } = require("../response/response");

exports.getStackGallery = async (req, res, next) => {
  try {
    const response = await StackGallery.find();
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

exports.postStackGallery = async (req, res, next) => {
  try {
    console.log(req.body)
    const { title } = req.body;
    console.log(title)
    const file = req.file;
    if (!title || !file) {
      throw createError(404, "all field are required");
    }
    const response = await cloudinary.uploader.upload(file.path, {
      resource_type: "image",
      folder: "shishir/stackgallery",
    });
    if (!response.secure_url) {
      throw createError(400, "faild to uplode image on cloudinary");
    }
    const data = await StackGallery.create({
      title,
      image: {
        public_id: response.public_id,
        url: response.secure_url,
      },
    });
    successResponse(res, {
      statusCode: 201,
      message: "Created successfully",
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateStackGallery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const file = req.file;
    const find = await StackGallery.findById(id);
    if (!find) {
      throw createError(404, "Not found with this is");
    }
    let updatedData = {
      title,
    };
    if (file) {
      const [distoryresult, uploadResult] = await Promise.all([
        await cloudinary.uploader.destroy(find.image.public_id),
        await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
          folder: "shishir/stackgallery",
        }),
      ]);

      if (distoryresult.result !== "ok") {
        throw createError(400, "faild to delete image on cloudinary");
      }

      if (!uploadResult.secure_url) {
        throw createError(400, "faild to upload image on cloudinary");
      }
      updatedData = {
        ...updatedData,
        image: {
          public_id: uploadResult.public_id,
          url: uploadResult.url,
        },
      };
    }

    await StackGallery.findByIdAndUpdate(id, updatedData);
    successResponse(res, { statusCode: 200, message: "updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deleteStackGallery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const find = await StackGallery.findById(id);
    if (!find) {
      throw createError(404, "not found with this id");
    }
    const response = await cloudinary.uploader.destroy(find.image.public_id);
    if (response.result !== "ok") {
      throw createError(400, "faild to delete image");
    }
    await StackGallery.findByIdAndDelete(id);
    successResponse(res, { statusCode: 200, message: "deleted successfulyy" });
  } catch (error) {
    next(error);
  }
};
