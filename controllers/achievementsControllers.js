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
        const { title, value, percentage } = req.body;
        const icon = req.file
        if (!title || !value || !percentage || !icon) {
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
            percentage,
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
        const { title, value, percentage } = req.body;
        const icon = req.file
        const {id} = req.params;

        const find = await AchievementsModel.findById(id)
        if(!find){
            
        }


    } catch (error) {
        next(error)
    }
}