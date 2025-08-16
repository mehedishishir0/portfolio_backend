const createError = require("http-errors");
const cloudinary = require("../config/cloudinaryConfig");
const Project = require("../model/projectsModel");
const { successResponse } = require("../response/response");

exports.getProject = async (req, res, next) => {
  try {
    const response = await Project.find();
    if (!response.length) {
      throw createError(404, "project not found");
    }
    successResponse(res, {
      statusCode: 200,
      message: "project fetch successfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};


exports.getSingelProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await Project.findById(id);
    if (!response) {
      throw createError(404, "project not found");
    }
    successResponse(res, {
      statusCode: 200,
      message: "project fetch successfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};



exports.postProject = async (req, res, next) => {
  try {
    const { title, description, technologies, githubLink, liveLink } = req.body;
    const files = req.files;

    if (!title || !description || !technologies || !files || !files.length) {
      throw createError(
        400,
        "Title, description, technologies, and images are required"
      );
    }

    // Convert technologies to array if it's a string
    let techArray = [];
    if (Array.isArray(technologies)) {
      techArray = technologies;
    } else if (typeof technologies === "string") {
      try {
        techArray = JSON.parse(technologies);
      } catch {
        techArray = technologies.split(",").map((t) => t.trim());
      }
    }

    // Upload images to Cloudinary
    const uploadedImages = await Promise.all(
      files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          resource_type: "image",
          folder: "shishir/project",
        })
      )
    );

    const imageData = uploadedImages.map((img) => ({
      public_id: img.public_id,
      url: img.secure_url,
    }));

    // Create project
    const newProject = await Project.create({
      title,
      description,
      technologies: techArray,
      githubLink: githubLink || null,
      liveLink: liveLink || null,
      image: imageData,
    });

    successResponse(res, {
      statusCode: 201,
      message: "Project created successfully",
      data: newProject,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { title, description, technologies, githubLink, liveLink } = req.body;
    const files = req.files;
    const { id } = req.params;

    // Find existing project
    const existingProject = await Project.findById(id);
    if (!existingProject) {
      throw createError(404, "Project not found with this ID");
    }

    // Parse technologies into array
    let techArray = existingProject.technologies;
    if (technologies) {
      if (Array.isArray(technologies)) {
        techArray = technologies;
      } else if (typeof technologies === "string") {
        try {
          techArray = JSON.parse(technologies);
        } catch {
          techArray = technologies.split(",").map((t) => t.trim());
        }
      }
    }

    // Image handling
    let imageData = existingProject.image;
    if (files && files.length > 0) {
      // Delete old images from Cloudinary
      await Promise.all(
        existingProject.image.map((img) =>
          cloudinary.uploader.destroy(img.public_id)
        )
      );

      // Upload new images to Cloudinary
      const uploadedImages = await Promise.all(
        files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            resource_type: "image",
            folder: "shishir/project",
          })
        )
      );

      imageData = uploadedImages.map((img) => ({
        public_id: img.public_id,
        url: img.secure_url,
      }));
    }

    // Update project
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        title: title || existingProject.title,
        description: description || existingProject.description,
        technologies: techArray,
        githubLink: githubLink ?? existingProject.githubLink,
        liveLink: liveLink ?? existingProject.liveLink,
        image: imageData,
      },
      { new: true }
    );

    successResponse(res, {
      statusCode: 200,
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw createError(404, "id is required");
    }
    const response = await Project.findById(id);
    if (!response) {
      throw createError(404, "project not found with this id");
    }

    const deletedResul = await Promise.all(
      response.image.map((img) => cloudinary.uploader.destroy(img.public_id))
    );

    if (deletedResul.result !== "ok") {
      throw createError(400, "faild to delete image");
    }

    await Project.findByIdAndDelete(id);
    successResponse(res, {
      statusCode: 200,
      message: "Project deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
