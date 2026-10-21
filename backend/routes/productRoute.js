const express = require("express")
const productController = require("../controllers/productController")
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth")
const router = express.Router()

router.route("/products").get(productController.getAllProducts)
router.route("/products/new")
.post(isAuthenticatedUser, authorizedRoles("admin"), productController.createProduct)
router.route("/products/:id").put(isAuthenticatedUser, authorizedRoles("admin"), productController.updateProduct)
.delete(isAuthenticatedUser, authorizedRoles("admin"),  productController.deleteProduct)
.get(productController.getProductDetails)

router.route("/admin/products")
.get(isAuthenticatedUser, authorizedRoles("admin"), productController.getAdminProducts)

module.exports = router
