const express = require('express');
const { 
    getExercises, 
    getExerciseDetails, 
} = require('../controllers/exercise');
const router = express.Router();

router.post('/getExercises', getExercises);

// Route to get detailed information of a specific exercise
router.post('/getExerciseDetails', getExerciseDetails);

module.exports = router;
