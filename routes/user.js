const userController = require('../controllers/user');
const express = require('express');
const router = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.post("/updateUserData", userController.updateUserData);

router.post("/changeUserPassword", userController.changeUserPassword);

router.post("/getUserProfile", userController.getUserProfile);

module.exports = router;