const express = require('express');
const runDataController = require('../controllers/run_data');
const router = express.Router();

router.post('/saveRunData', runDataController.saveRunData);
router.post('/getRunData', runDataController.getRunData);
router.post('/deleteRunData', runDataController.deleteRunData);
router.post('/getRunDataForCurrentAndPreviousWeek', runDataController.getRunDataForCurrentAndPreviousWeek);

module.exports = router;
