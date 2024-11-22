const db = require('../data/db');

//Date time format “2024-11-20 15:30:00”
//Durations send in millisecond

// Save Run Data
async function saveRunData(req, res) {
    try {
        const { userId, runDate, distance, stepsCount, duration } = req.body;

        const query = `
            INSERT INTO user_run_data (user_id, run_date, distance, steps_count, duration)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id, run_date)
            DO UPDATE SET distance = $3, steps_count = $4, duration = $5;
        `;

        await db.query(query, [userId, runDate, distance, stepsCount, duration]);
        return res.status(200).json({ message: 'Run data saved successfully', code: 200 });
    } catch (error) {
        return res.status(500).json({ message: 'Error saving run data', code: 500, error: error.message });
    }
}

// Get Run Data
async function getRunData(req, res) {
    try {
        const { userId } = req.query;

        const query = `
            SELECT * FROM user_run_data
            WHERE user_id = $1
            ORDER BY run_date DESC;
        `;

        const result = await db.query(query, [userId]);
        return res.status(200).json({ message: 'Success', code: 200, data: result });
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

module.exports = {
    saveRunData,
    getRunData,
    deleteRunData,
};
