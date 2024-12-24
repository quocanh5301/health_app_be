const express = require('express');
const heartRateDataController = require('../controllers/heart_rate_data');
const router = express.Router();

router.post('/saveHeartRateData', heartRateDataController.saveHeartRateData);
router.post('/getHeartRateData', heartRateDataController.getHeartRateData);
router.post('/deleteHeartRateData', heartRateDataController.deleteHeartRateData);
router.post('/getHeartRateDataForLast7Days', heartRateDataController.getHeartRateDataForLast7Days);

module.exports = router;
