const createError = require("http-errors");
const cloudinary = require("../config/cloudinaryConfig");
const Testimonial = require("../model/testimonialModel");
const { successResponse } = require("../response/response");

exports.getTestomonials = async (req, res, next) => {
  try {
    const response = await Testimonial.find();
    if (!response.length) {
      throw createError(404, "No testimonials found");
    }
    successResponse(res, {
      statusCode: 200,
      message: "Testimonials fetched successfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

exports.postTestimonial = async (req, res, next) => {
  try {
    const { name, role, feedback, rating } = req.body;
    const file = req.file;

    if (!name || !role || !feedback || !rating) {
      throw createError(400, "All fields are required");
    }

    let data = {
      name,
      role,
      feedback,
      rating,
    };

    if (file) {
      // Upload user-provided image
      const uploadRes = await cloudinary.uploader.upload(file.path, {
        folder: "shishir/testimonials",
        resource_type: "image",
      });

      if (!uploadRes?.secure_url) {
        throw createError(500, "Image upload failed");
      }

      data.image = {
        public_id: uploadRes.public_id,
        url: uploadRes.secure_url,
      };
    } else {
      // Auto-generate avatar if no file is uploaded
      const seed = `${name}-${Date.now()}`;
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

      data.image = {
        public_id: null,
        url: avatarUrl,
      };
    }

    const response = await Testimonial.create(data);

    successResponse(res, {
      statusCode: 201,
      message: "Testimonial created successfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTestomonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw createError(400, "Testimonial ID is required");
    }

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      throw createError(404, "Testimonial not found");
    }
    if (testimonial.image.public_id) {
      const response = await cloudinary.uploader.destroy(
        testimonial.image.public_id,
        {
          resource_type: "image",
        }
      );
      if (response.result !== "ok") {
        throw createError(500, "Failed to delete image from cloudinary");
      }
    }

    await Testimonial.findByIdAndDelete(id);

    successResponse(res, {
      statusCode: 200,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTestomonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role, feedback, rating } = req.body;
    const file = req.file;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      throw createError(404, "Testimonial not found");
    }

    let updatedData = { name, role, feedback, rating };
    if (testimonial.image.public_id) {
      if (file) {
        const [destroyResult, uploadResult] = await Promise.all([
          cloudinary.uploader.destroy(testimonial.image.public_id, {
            resource_type: "image",
          }),
          cloudinary.uploader.upload(file.path, {
            folder: "shishir/testimonials",
            resource_type: "image",
          }),
        ]);

        if (destroyResult.result !== "ok") {
          throw createError(500, "Failed to delete old image");
        }
        if (!uploadResult || !uploadResult.secure_url) {
          throw createError(500, "Image upload failed");
        }
        updatedData.image = {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        };
      }
    }

    await Testimonial.findByIdAndUpdate(id, updatedData, { new: true });

    successResponse(res, {
      statusCode: 200,
      message: "Testimonial updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
