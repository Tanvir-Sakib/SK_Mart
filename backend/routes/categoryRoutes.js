const express = require("express");

const router = express.Router();

const {

createCategory,
getCategories,
getSingleCategory,
updateCategory,
deleteCategory

} = require("../controllers/categoryController");

const authMiddleware = require("../middleware/authMiddleware");

const adminMiddleware = require("../middleware/adminMiddleware");


router.post("/", authMiddleware, adminMiddleware, createCategory);
router.get("/", authMiddleware, adminMiddleware, getCategories);
router.get("/:id", authMiddleware, adminMiddleware, getSingleCategory);
router.put("/:id", authMiddleware, adminMiddleware, updateCategory);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

module.exports = router;