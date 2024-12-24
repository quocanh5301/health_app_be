const db = require('../data/db');
const moment = require('moment-timezone');


//Date time format “2024-11-20 15:30:00”
//Durations send in seconds

// Save Run Data
async function saveRunData(req, res) {
    try {
        const { userId, runDate, distance, stepsCount, duration } = req.body;
        // console.log(userId, runDate, distance, stepsCount, duration);

        const query = `
            INSERT INTO user_run_data (user_id, run_date, distance, steps_count, duration)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id, run_date)
            DO UPDATE SET distance = $3, steps_count = $4, duration = $5;
        `;

        await db.query(query, [userId, runDate, distance, stepsCount, duration]);
        return res.status(200).json({ mess: 'Run data saved successfully', code: 200 });
    } catch (error) {
        return res.status(500).json({ mess: 'Error saving run data', code: 500, error: error.message });
    }
}

// Get Run Data
async function getRunData(req, res) {
    try {
        const { userId } = req.body;

        const query = `
            SELECT * FROM user_run_data
            WHERE user_id = $1
            ORDER BY run_date DESC;
        `;

        const result = await db.query(query, [userId]);
        const data = result.map((row) => ({
            ...row,
            run_date: moment(row.run_date).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss'), // Convert to desired time zone
        }));
        return res.status(200).json({ message: 'Success', code: 200, data: data });
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving run data', code: 500, error: error.message });
    }
}

// Delete Run Data
async function deleteRunData(req, res) {
    try {
        const { userId, runDate } = req.body;

        const query = `
            DELETE FROM user_run_data
            WHERE user_id = $1 AND run_date = $2;
        `;

        await db.query(query, [userId, runDate]);
        return res.status(200).json({ message: 'Run data deleted successfully', code: 200 });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting run data', code: 500, error: error.message });
    }
}

async function getRunDataForCurrentAndPreviousWeek(req, res) {
    try {
        const today = moment();
        const startOfCurrentWeek = today.clone().startOf('week').format('YYYY-MM-DD HH:mm:ss');
        const endOfCurrentWeek = today.clone().endOf('week').format('YYYY-MM-DD HH:mm:ss');

        const startOfPreviousWeek = today.clone().subtract(1, 'week').startOf('week').format('YYYY-MM-DD HH:mm:ss');
        const endOfPreviousWeek = today.clone().subtract(1, 'week').endOf('week').format('YYYY-MM-DD HH:mm:ss');

        // SQL query groups data by date (ignoring time) and aggregates distance, steps, and duration
        const query = `
            SELECT 
                to_char(run_date, 'YYYY-MM-DD') AS run_date, -- Group by date only
                SUM(distance) AS total_distance,
                SUM(steps_count) AS total_steps,
                SUM(duration) AS total_duration
            FROM user_run_data
            WHERE user_id = $1
            AND (
                (run_date BETWEEN $2 AND $3) OR
                (run_date BETWEEN $4 AND $5)
            )
            GROUP BY to_char(run_date, 'YYYY-MM-DD') -- Grouping by date
            ORDER BY run_date;
        `;

        const userId = req.user?.id || 1; // Replace with your logic for fetching user ID
        const values = [
            userId,
            startOfCurrentWeek,
            endOfCurrentWeek,
            startOfPreviousWeek,
            endOfPreviousWeek,
        ];

        const result = await db.query(query, values);

        // Separate data into current and previous week
        const currentWeek = [];
        const previousWeek = [];

        result.forEach(row => {
            const data = {
                run_date: row.run_date, // Already grouped by date
                total_distance: parseFloat(row.total_distance).toFixed(2), // Distance in km with 2 decimals
                total_steps: parseInt(row.total_steps, 10), // Integer steps count
                total_duration: parseInt(row.total_duration, 10), // Total duration in seconds
            };

            if (moment(row.run_date).isBetween(startOfCurrentWeek, endOfCurrentWeek, null, '[]')) {
                currentWeek.push(data);
            } else if (moment(row.run_date).isBetween(startOfPreviousWeek, endOfPreviousWeek, null, '[]')) {
                previousWeek.push(data);
            }
        });

        res.json({
            mess: 'Success',
            code: 200,
            data: {
                currentWeek,
                previousWeek,
            },
        });
    } catch (error) {
        console.error('Error fetching run data:', error);
        res.status(500).json({
            mess: 'Error fetching run data',
            code: 500,
            error: error.message,
        });
    }
};


module.exports = {
    saveRunData,
    getRunData,
    deleteRunData,
    getRunDataForCurrentAndPreviousWeek,
};
