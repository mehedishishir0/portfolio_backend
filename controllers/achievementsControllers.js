const createError = require("http-errors")
const cloudinary = require("../config/cloudinaryConfig")
const { successResponse } = require("../response/response")
const AchievementsModel = require("../model/achievementsModel")



exports.getAchievements = async (req, res, next) => {
    try {
        const response = await AchievementsModel.find();
        if (!response.length) {
            throw createError(404, "not found")
        };
        successResponse(res, {
            statusCode: 200,
            message: "fetch successfully",
            data: response
        })

    } catch (error) {
        next(error)
    }
}


exports.postAchievements = async (req, res, next) => {
    try {
        const { title, value } = req.body;
        const icon = req.file
        if (!title || !value || !icon) {
            throw createError(404, "all filed are required")
        };
        const response = await cloudinary.uploader.upload(icon.path, {
            resource_type: "image",
            folder: "shishir/achievments"
        })
        if (!response.secure_url) {
            throw createError(400, "faild to uplode image")
        }
        const data = await AchievementsModel.create({
            title,
            value,
            image: {
                public_id: response.public_id,
                url: response.secure_url
            }
        })

        successResponse(res, { statusCode: 201, message: "achivement created sucessfully", data: data })
    } catch (error) {

    }
}

exports.updateAchievments = async (req, res, next) => {
    try {
        const { title, value, } = req.body;
        const icon = req.file
        const { id } = req.params;

        const find = await AchievementsModel.findById(id)
        if (!find) {
            throw createError(404, "not found ")
        }
        const updatedData = {
            title,
            value
        }
        if (icon) {
            const [destroyResult, uploadResult] = await Promise.all([
                cloudinary.uploader.destroy(find.image.public_id),
                cloudinary.uploader.upload(file.path, {
                    resource_type: "image",
                    folder: "shishir/achievments",
                }),
            ])
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

        await AchievementsModel.findByIdAndUpdate(id, updatedData);

        successResponse(res, {
            statusCode: 200,
            message: "Achievment updated seccessfully",
        });
    } catch (error) {
        next(error)
    }
}


exports.deleteAcievments = async (req, res, next) => {
    try {
        const { id } = req.params
        const find = await AchievementsModel.findById(id);
        if (!find) {
            throw createError(404, "not found");
        }
        const response = await cloudinary.uploader.destroy(find.image.public_id);
        if (response.result !== "ok") {
            throw createError(400, "faild to delete image")
        }
        await AchievementsModel.findByIdAndDelete(id)
        successResponse(res, { statusCode: 200, message: "deleted successfully" });

    } catch (error) {
        next(error)
    }
}