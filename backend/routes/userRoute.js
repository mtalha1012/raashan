const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth")

router.route("/register").post(userController.registerUser)
router.route("/login").post(userController.loginUser)
router.route("/logout").get(userController.logout)
router.route("/password/forgot").post(userController.forgotPassword)
router.route("/password/reset/:token").put(userController.resetPassword)

router.route("/me").get(isAuthenticatedUser, userController.getUserDetails)
router.route("/me/update").put(isAuthenticatedUser, userController.updateProfile)
router.route("/password/update").put(isAuthenticatedUser, userController.updatePassword)

router.route("/admin/users")
.get(isAuthenticatedUser, authorizedRoles("admin"), userController.getAllUsers)
router.route("/admin/user/:id")
.get(isAuthenticatedUser, authorizedRoles("admin"), userController.getSingleUser)
.put(isAuthenticatedUser, authorizedRoles("admin"), userController.updateUserRole)
.delete(isAuthenticatedUser, authorizedRoles("admin"), userController.deleteUser)

module.exports = router
