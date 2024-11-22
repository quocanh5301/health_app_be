const express = require('express');
const runDataController = require('../controllers/run_data');
const router = express.Router();

router.post('/saveRunData', runDataController.saveRunData);
router.get('/getRunData', runDataController.getRunData);
router.delete('/deleteRunData', runDataController.deleteRunData);

module.exports = router;
