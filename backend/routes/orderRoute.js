const express = require("express")
const orderController = require("../controllers/orderController")
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth")
const router = express.Router()

router.route("/order/new").post(isAuthenticatedUser, orderController.newOrder)
router.route("/orders/me").get(isAuthenticatedUser, orderController.myOrders)
router.route("/order/:id").get(isAuthenticatedUser, orderController.getSingleOrder)
router.route("/order/:id/cancel").put(isAuthenticatedUser, orderController.cancelOrder)

router.route("/admin/orders")
.get(isAuthenticatedUser, authorizedRoles("admin"), orderController.getAllOrders)
router.route("/admin/order/:id")
.put(isAuthenticatedUser, authorizedRoles("admin"), orderController.updateOrder)
.delete(isAuthenticatedUser, authorizedRoles("admin"), orderController.deleteOrder)

module.exports = router
