var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");

router.get("/me/dashboard", userController.user_dashboard_get);
router.get("/me/account", userController.user_account_get);

module.exports = router;
