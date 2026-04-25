const {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getSingleBlog,
} = require("../controllers/blogControllers");

const upload = require("../uploder/imageUploder");
const { protected } = require("../middlewares/authMiddilewares");

const blogRoute = require("express").Router();

blogRoute.get("/", getBlogs);
blogRoute.get("/:id", getSingleBlog);
blogRoute.post("/", protected, upload.single("image"), createBlog);
blogRoute.put("/:id", protected, upload.single("image"), updateBlog);
blogRoute.delete("/:id", protected, deleteBlog);

module.exports = blogRoute;