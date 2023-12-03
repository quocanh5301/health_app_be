const express = require('express');
const manganimeController = require('../controllers/manga');
const router = express.Router();

router.get("/getTopManga", manganimeController.getManganimeList)
// router.post

module.exports = router;