const express = require("express")
const householdController = require("../controllers/householdController")
const listController = require("../controllers/listController")
const { isAuthenticatedUser } = require("../middleware/auth")
const { requireHousehold, requireHouseholdOwner } = require("../middleware/household")
const router = express.Router()

// Every route here needs a logged in user; most also need their household loaded
const member = [isAuthenticatedUser, requireHousehold]
const owner = [...member, requireHouseholdOwner]

router.route("/household")
.get(isAuthenticatedUser, householdController.getMyHousehold)
.post(isAuthenticatedUser, householdController.createHousehold)
.put(owner, householdController.updateHousehold)
.delete(owner, householdController.deleteHousehold)

router.route("/household/join").post(isAuthenticatedUser, householdController.joinHousehold)
router.route("/household/leave").post(member, householdController.leaveHousehold)
router.route("/household/nickname").put(member, householdController.updateNickname)
router.route("/household/invite-code").put(owner, householdController.regenerateInviteCode)
router.route("/household/members/:userId").delete(owner, householdController.removeMember)
router.route("/household/orders").get(member, householdController.householdOrders)

// The shared list
router.route("/household/list")
.get(member, listController.getList)
.post(member, listController.addItem)

router.route("/household/list/parse").post(member, listController.parseMessage)
router.route("/household/list/bulk").post(member, listController.addItems)
router.route("/household/list/to-cart").post(member, listController.moveToCart)
router.route("/household/list/done").delete(member, listController.clearDone)

router.route("/household/list/:id")
.put(member, listController.updateItem)
.delete(member, listController.deleteItem)

module.exports = router
