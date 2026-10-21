const express = require("express")
const categoryController = require("../controllers/categoryController")
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth")
const router = express.Router()

router.route("/categories").get(categoryController.getAllCategories)
router.route("/categories/:id").get(categoryController.getCategory)

router.route("/admin/categories")
.post(isAuthenticatedUser, authorizedRoles("admin"), categoryController.createCategory)
router.route("/admin/categories/:id")
.put(isAuthenticatedUser, authorizedRoles("admin"), categoryController.updateCategory)
.delete(isAuthenticatedUser, authorizedRoles("admin"), categoryController.deleteCategory)

module.exports = router
