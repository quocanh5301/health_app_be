const db = require('../data/db');

// Get exercises by muscle group or difficulty
// Get exercises by filter type or fetch all exercises
async function getExercises(req, res) {
    
    try {
        const { filterType, filterValue, page, pageSize } = req.body;
        console.log('getExercises filterType:', filterType);
        const currentPage = parseInt(page, 10) || 1;
        const limit = parseInt(pageSize, 10) || 10;
        const offset = (currentPage - 1) * limit;

        let filterCondition = '';
        let params = [];

        // Determine the filtering condition
        if (filterType === "muscle group") {
            filterCondition = `
                INNER JOIN exercise_muscle_group emg ON e.id = emg.exercise_id
                INNER JOIN muscle_group mg ON emg.muscle_group_id = mg.id
                WHERE mg.muscle_group_name ILIKE $1
            `;
            params = [`%${filterValue}%`, limit, offset];
        } else if (filterType === "difficulty") {
            filterCondition = `WHERE e.difficulty ILIKE $1`;
            params = [`%${filterValue}%`, limit, offset];
        } else if (filterType === 'all') {
            // No filter condition for fetching all exercises
            filterCondition = '';
            params = [limit, offset];
        } else {
            return res.status(400).json({ mess: 'Invalid filter type', code: 400 });
        }

        const query = `
            SELECT e.id AS exercise_id, e.exercise_name, e.calor, e.duration, e.difficulty, e.image,
                ARRAY(
                    SELECT mg.muscle_group_name
                    FROM exercise_muscle_group emg
                    INNER JOIN muscle_group mg ON emg.muscle_group_id = mg.id
                    WHERE emg.exercise_id = e.id
                ) AS muscle_groups,
                ARRAY(
                    SELECT eg.image_name
                    FROM exercise_guide_image eg
                    WHERE eg.exercise_id = e.id
                    ORDER BY eg.image_order
                ) AS guide_images
            FROM exercise e
            ${filterCondition}
            LIMIT $2 OFFSET $3;
        `;

        const exercises = await db.query(query, params);

        return res.status(200).json({
            mess: 'Success',
            code: 200,
            data: exercises,
            // pagination: {
            //     currentPage,
            //     pageSize: limit,
            //     totalItems: exercises.length, // This assumes the query is paginated correctly
            // },
        });
    } catch (error) {
        console.error('Error fetching exercises:', error.message);
        return res.status(500).json({ mess: 'Error fetching exercises', code: 500, error: error.message });
    }
}

async function getExerciseDetails(req, res) {
    try {
        const { exerciseId } = req.body;

        // Validate input
        if (!exerciseId) {
            return res.status(400).json({ mess: 'Exercise ID is required', code: 400 });
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

        console.log('exerciseResult:', exerciseResult);

        // Ensure the result is in the expected structure
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

        console.log('muscleGroupsResult:', muscleGroupsResult);
        // Handle missing data gracefully
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

        // Handle missing data gracefully
        exercise.guide_images = guideImagesResult?.map(row => row.image_name) || [];

        return res.status(200).json({ mess: 'Success', code: 200, data: exercise });
    } catch (error) {
        console.error('Error fetching exercise details:', error.message);
        return res.status(500).json({ mess: 'Error fetching exercise details', code: 500, error: error.message });
    }
}


module.exports = { 
    getExercises,
    getExerciseDetails,
};
