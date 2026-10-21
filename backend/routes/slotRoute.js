const express = require("express")
const slotController = require("../controllers/slotController")
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth")
const router = express.Router()

router.route("/slots").get(slotController.getSlotAvailability)

router.route("/admin/slots")
.get(isAuthenticatedUser, authorizedRoles("admin"), slotController.getAllSlots)
.post(isAuthenticatedUser, authorizedRoles("admin"), slotController.createSlot)
router.route("/admin/slots/:id")
.put(isAuthenticatedUser, authorizedRoles("admin"), slotController.updateSlot)
.delete(isAuthenticatedUser, authorizedRoles("admin"), slotController.deleteSlot)

module.exports = router
