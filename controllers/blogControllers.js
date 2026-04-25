const createError = require("http-errors");
const cloudinary = require("../config/cloudinaryConfig");
const BlogModel = require("../model/blogModel")
const { successResponse } = require("../response/response");

// GET ALL BLOG
exports.getBlogs = async (req, res, next) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const total = await BlogModel.countDocuments();

    const blogs = await BlogModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    successResponse(res, {
      statusCode: 200,
      message: "Success",
      data: {
        items: blogs,
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasPreviousPage: page > 1,
          hasNextPage: page < totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getSingleBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await BlogModel.findById(id);

    if (!blog) {
      throw createError(404, "blog not found");
    }

    successResponse(res, {
      statusCode: 200,
      message: "Success",
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE BLOG
exports.createBlog = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!title || !description || !file) {
      throw createError(400, "all fields are required");
    }

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      resource_type: "image",
      folder: "shishir/blogs",
    });

    if (!uploadResult.secure_url) {
      throw createError(400, "image upload failed");
    }

    const blog = await BlogModel.create({
      title,
      description,
      image: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
    });

    successResponse(res, {
      statusCode: 201,
      message: "blog created successfully",
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE BLOG
exports.updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const file = req.file;

    const blog = await BlogModel.findById(id);
    if (!blog) {
      throw createError(404, "blog not found");
    }

    let updatedData = {
      title,
      description,
    };

    if (file) {
      const [destroyResult, uploadResult] = await Promise.all([
        cloudinary.uploader.destroy(blog.image.public_id),
        cloudinary.uploader.upload(file.path, {
          resource_type: "image",
          folder: "shishir/blogs",
        }),
      ]);

      if (destroyResult.result !== "ok") {
        throw createError(400, "failed to delete old image");
      }

      if (!uploadResult.secure_url) {
        throw createError(400, "image upload failed");
      }

      updatedData.image = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }

    const updatedBlog = await BlogModel.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    successResponse(res, {
      statusCode: 200,
      message: "blog updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE BLOG
exports.deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await BlogModel.findById(id);
    if (!blog) {
      throw createError(404, "blog not found");
    }

    await cloudinary.uploader.destroy(blog.image.public_id);
    await BlogModel.findByIdAndDelete(id);

    successResponse(res, {
      statusCode: 200,
      message: "blog deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};