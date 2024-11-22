const db = require('../data/db');

//Date time format “2024-11-20 15:30:00”


// Save Heart Rate Data
async function saveHeartRateData(req, res) {
    try {
        const { userId, measuredAt, heartRate } = req.body;

        const query = `
            INSERT INTO user_heart_rate_data (user_id, measured_at, heart_rate)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, measured_at)
            DO UPDATE SET heart_rate = $3;
        `;

        await db.query(query, [userId, measuredAt, heartRate]);
        return res.status(200).json({ message: 'Heart rate data saved successfully', code: 200 });
    } catch (error) {
        return res.status(500).json({ message: 'Error saving heart rate data', code: 500, error: error.message });
    }
}

// Get Heart Rate Data
async function getHeartRateData(req, res) {
    try {
        const { userId } = req.query;

        const query = `
            SELECT * FROM user_heart_rate_data
            WHERE user_id = $1
            ORDER BY measured_at DESC;
        `;

        const result = await db.query(query, [userId]);
        return res.status(200).json({ message: 'Success', code: 200, data: result });
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving heart rate data', code: 500, error: error.message });
    }
}

// Delete Heart Rate Data
async function deleteHeartRateData(req, res) {
    try {
        const { userId, measuredAt } = req.body;

        const query = `
            DELETE FROM user_heart_rate_data
            WHERE user_id = $1 AND measured_at = $2;
        `;

        await db.query(query, [userId, measuredAt]);
        return res.status(200).json({ message: 'Heart rate data deleted successfully', code: 200 });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting heart rate data', code: 500, error: error.message });
    }
}

module.exports = {
    saveHeartRateData,
    getHeartRateData,
    deleteHeartRateData,
};
