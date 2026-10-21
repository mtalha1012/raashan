const express = require("express")
const addressController = require("../controllers/addressController")
const { isAuthenticatedUser } = require("../middleware/auth")
const router = express.Router()

router.route("/addresses")
.get(isAuthenticatedUser, addressController.myAddresses)
.post(isAuthenticatedUser, addressController.createAddress)

router.route("/addresses/:id")
.put(isAuthenticatedUser, addressController.updateAddress)
.delete(isAuthenticatedUser, addressController.deleteAddress)

module.exports = router
