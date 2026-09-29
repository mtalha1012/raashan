const express = require("express")
const cartController = require("../controllers/cartController")
const { isAuthenticatedUser } = require("../middleware/auth")
const router = express.Router()

router.route("/cart")
.get(isAuthenticatedUser, cartController.getCart)
.post(isAuthenticatedUser, cartController.addToCart)
.delete(isAuthenticatedUser, cartController.clearCart)

router.route("/cart/:productId")
.put(isAuthenticatedUser, cartController.updateCartItem)
.delete(isAuthenticatedUser, cartController.removeFromCart)

module.exports = router
