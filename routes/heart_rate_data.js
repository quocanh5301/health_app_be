const express = require('express');
const heartRateDataController = require('../controllers/heart_rate_data');
const router = express.Router();

router.post('/saveHeartRateData', heartRateDataController.saveHeartRateData);
router.get('/getHeartRateData', heartRateDataController.getHeartRateData);
router.delete('/deleteHeartRateData', heartRateDataController.deleteHeartRateData);

module.exports = router;
