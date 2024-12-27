const db = require('../data/db');


// Get exercises by muscle group or difficulty
// Get exercises by filter type or fetch all exercises
async function getExercises(req, res) {
    try {
        const { filterType, filterValue, page, pageSize } = req.body;

        console.log(filterType, filterValue, page, pageSize);

        const currentPage = parseInt(page, 10) || 1;
        const limit = parseInt(pageSize, 10) || 10;
        const offset = (currentPage - 1) * limit;

        let filterCondition = '';
        let params = [];

        // Determine the filtering condition
        if (filterType === "muscle_group") {
            filterCondition = `
                INNER JOIN exercise_muscle_group emg ON e.id = emg.exercise_id
                INNER JOIN muscle_group mg ON emg.muscle_group_id = mg.id
                WHERE mg.muscle_group_name ILIKE $1
            `;
            params = [`%${filterValue}%`, limit, offset];
        } else if (filterType === "difficulty") {
            filterCondition = `WHERE e.difficulty ILIKE $1`;
            params = [`%${filterValue}%`, limit, offset];
        } else if (filterType === "all") {
            // No filter condition for fetching all exercises
            filterCondition = '';
            params = [limit, offset];
        } else {
            return res.status(400).json({ mess: 'Invalid filter type', code: 400 });
        }

        // Adjust placeholders in the SQL query based on the parameters
        const query = `
            SELECT e.id AS exercise_id, e.exercise_name, e.calor, e.duration, e.difficulty, e.image,
                ARRAY(
                    SELECT mg.muscle_group_name
                    FROM exercise_muscle_group emg
                    INNER JOIN muscle_group mg ON emg.muscle_group_id = mg.id
                    WHERE emg.exercise_id = e.id
                ) AS muscle_groups
            FROM exercise e
            ${filterCondition}
            LIMIT ${filterType === "all" ? "$1" : "$2"} OFFSET ${filterType === "all" ? "$2" : "$3"};
        `;

        const exercises = await db.query(query, params);
        // console.log(exercises);

        return res.status(200).json({
            mess: 'Success',
            code: 200,
            data: exercises,
        });
    } catch (error) {
        console.error('Error fetching exercises:', error.message);
        return res.status(500).json({ mess: 'Error fetching exercises', code: 500, error: error.message });
    }
}


async function getExerciseDetails(req, res) {
    try {
        const { exerciseId, userId } = req.body;

        // Validate input
        if (!exerciseId) {
            return res.status(400).json({ mess: 'Exercise ID is required', code: 400 });
        }

        if (!userId) {
            return res.status(400).json({ mess: 'User ID is required', code: 400 });
        }

        // Fetch exercise details
        const exerciseQuery = `
            SELECT 
                e.id, 
                e.exercise_name, 
                e.calor, 
                e.duration, 
                e.guide, 
                e.difficulty, 
                e.image
            FROM 
                exercise e
            WHERE 
                e.id = $1;
        `;
        const exerciseResult = await db.query(exerciseQuery, [exerciseId]);

        if (exerciseResult.length === 0) {
            return res.status(404).json({ mess: 'Exercise not found', code: 404 });
        }

        const exercise = exerciseResult[0];

        // Fetch related muscle groups
        const muscleGroupsQuery = `
            SELECT 
                mg.muscle_group_name
            FROM 
                muscle_group mg
            INNER JOIN 
                exercise_muscle_group emg ON mg.id = emg.muscle_group_id
            WHERE 
                emg.exercise_id = $1;
        `;
        const muscleGroupsResult = await db.query(muscleGroupsQuery, [exerciseId]);
        exercise.muscle_groups = muscleGroupsResult?.map(row => row.muscle_group_name) || [];

        // Fetch related guide images
        const guideImagesQuery = `
            SELECT 
                eg.image_name, 
                eg.image_order
            FROM 
                exercise_guide_image eg
            WHERE 
                eg.exercise_id = $1
            ORDER BY 
                eg.image_order ASC;
        `;
        const guideImagesResult = await db.query(guideImagesQuery, [exerciseId]);
        exercise.guide_images = guideImagesResult?.map(row => row.image_name) || [];

        // Check if the exercise is marked as favorite by the user
        const favoriteQuery = `
            SELECT 
                1 
            FROM 
                user_favorite_exercise 
            WHERE 
                user_id = $1 
                AND exercise_id = $2;
        `;
        const favoriteResult = await db.query(favoriteQuery, [userId, exerciseId]);
        exercise.is_favorite = favoriteResult.length > 0;

        return res.status(200).json({ mess: 'Success', code: 200, data: exercise });
    } catch (error) {
        console.error('Error fetching exercise details:', error.message);
        return res.status(500).json({ mess: 'Error fetching exercise details', code: 500, error: error.message });
    }
}


// Mark an exercise as favorite
async function markAsFavorite(req, res) {
    try {
        const { userId, exerciseId } = req.body;

        if (!userId || !exerciseId) {
            return res.status(400).json({ message: 'Missing required fields', code: 400 });
        }

        // Check if the exercise is already marked as a favorite
        const checkQuery = `
        SELECT id FROM user_favorite_exercise
        WHERE user_id = $1 AND exercise_id = $2;
      `;
        const result = await db.query(checkQuery, [userId, exerciseId]);

        if (result.length > 0) {
            // If it exists, remove it
            const deleteQuery = `
          DELETE FROM user_favorite_exercise
          WHERE user_id = $1 AND exercise_id = $2;
        `;
            await db.query(deleteQuery, [userId, exerciseId]);
            return res.status(200).json({ mess: 'Success', code: 200 });
        } else {
            // If it doesn't exist, add it
            const insertQuery = `
          INSERT INTO user_favorite_exercise (user_id, exercise_id)
          VALUES ($1, $2);
        `;
            await db.query(insertQuery, [userId, exerciseId]);
            return res.status(200).json({ mess: 'Success', code: 200 });
        }
    } catch (error) {
        console.error('Error toggling favorite status:', error.message);
        return res.status(500).json({ mess: 'Error toggling favorite status', code: 500, error: error.message });
    }
}

// Get all favorite exercises for a user
async function getUserFavoriteExercises(req, res) {
    try {
        const { userId, page, pageSize } = req.body;
        // console.log(userId, page, pageSize);

        const currentPage = parseInt(page, 10) || 1;
        const limit = parseInt(pageSize, 10) || 10;
        const offset = (currentPage - 1) * limit;

        if (!userId) {
            return res.status(400).json({ mess: 'Missing required fields', code: 400 });
        }

        const query = `
        SELECT 
          e.id AS exercise_id,
          e.exercise_name,
          e.calor,
          e.duration,
          e.difficulty,
          e.image,
          ARRAY(
            SELECT mg.muscle_group_name
            FROM exercise_muscle_group emg
            INNER JOIN muscle_group mg ON emg.muscle_group_id = mg.id
            WHERE emg.exercise_id = e.id
          ) AS muscle_groups
        FROM user_favorite_exercise uf
        INNER JOIN exercise e ON uf.exercise_id = e.id
        WHERE uf.user_id = $1
        LIMIT $2 OFFSET $3;
      `;

        const rows = await db.query(query, [userId, limit, offset]);
        // console.log(rows);

        if (rows.length === 0) {
            return res.status(200).json({ mess: 'Success', code: 200, data: rows });
        }

        return res.status(200).json({ mess: 'Success', code: 200, data: rows });
    } catch (error) {
        return res.status(500).json({ mess: 'Error retrieving favorite exercises', code: 500, error: error.message });
    }
}

module.exports = {
    markAsFavorite,
    getUserFavoriteExercises,
    getExercises,
    getExerciseDetails,
};
