const express = require('express');
const { 
    markAsFavorite,
    getUserFavoriteExercises,
    getExercises, 
    getExerciseDetails, 
} = require('../controllers/exercise');
const router = express.Router();

router.post('/getExercises', getExercises);

// Route to get detailed information of a specific exercise
router.post('/getExerciseDetails', getExerciseDetails);

router.post('/markAsFavorite', markAsFavorite);

// Get all favorite exercises for a user
router.post('/getFavorites', getUserFavoriteExercises);

module.exports = router;
