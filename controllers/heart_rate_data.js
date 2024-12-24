const db = require('../data/db');
const moment = require('moment-timezone');


//Date time format “2024-11-20 15:30:00”


// Save Heart Rate Data
async function saveHeartRateData(req, res) {
    try {
        const { userId, measuredAt, heartRate, stressLevel } = req.body;
        // console.log(userId, measuredAt, heartRate, stressLevel);

        if (!userId || !measuredAt || !heartRate || !stressLevel) {
            return res.status(400).json({ message: 'Missing required fields', code: 400 });
        }

        const query = `
            INSERT INTO user_heart_rate_data (user_id, measured_at, heart_rate, stress_level)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, measured_at)
            DO UPDATE SET heart_rate = $3, stress_level = $4;
        `;

        await db.query(query, [userId, measuredAt, heartRate, stressLevel]);
        return res.status(200).json({ mess: 'Heart rate data saved successfully', code: 200 });
    } catch (error) {
        return res.status(500).json({ mess: 'Error saving heart rate data', code: 500, error: error.message });
    }
}

// Get Heart Rate Data
async function getHeartRateData(req, res) {
    try {
        const { userId } = req.body; // Only userId is required since stress level is stored in the database

        if (!userId) {
            return res.status(400).json({ message: 'Missing required userId', code: 400 });
        }

        const query = `
            SELECT user_id, measured_at, heart_rate, stress_level
            FROM user_heart_rate_data
            WHERE user_id = $1
            ORDER BY measured_at desc;
        `;

        const result = await db.query(query, [userId]);
        const data = result.map((row) => ({
            ...row,
            measured_at: moment(row.measured_at).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss'), // Convert to desired time zone
        }));
        return res.status(200).json({ message: 'Success', code: 200, data: data });
    } catch (error) {
        console.error('Error retrieving heart rate data:', error.message);
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

async function getHeartRateDataForLast7Days(req, res, next) {
    try {
        const { userId } = req.body; // Assuming userId is passed in the request body

        if (!userId) {
            return res.status(400).json({ mess: "User ID is required", code: 400 });
        }

        // Define the start and end date for the query
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Set to the end of the current day
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6); // 7 days including today
        sevenDaysAgo.setHours(0, 0, 0, 0); // Set to the start of the day 7 days ago

        // Query to get heart rate data within the last 7 days
        const query = `
            SELECT 
                user_id, 
                measured_at, 
                heart_rate, 
                stress_level
            FROM 
                user_heart_rate_data
            WHERE 
                user_id = $1 
                AND measured_at BETWEEN $2 AND $3
            ORDER BY 
                measured_at DESC;
        `;

        const result = await db.query(query, [userId, sevenDaysAgo, today]);

        if (!result || result.length === 0) {
            return res.status(404).json({ mess: "No heart rate data found for the last 7 days", code: 404 });
        }

        const data = result.map((row) => ({
            ...row,
            measured_at: moment(row.measured_at).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss'), // Convert to desired time zone
        }));

        return res.status(200).json({ mess: "Success", code: 200, data });
    } catch (error) {
        console.error("Error fetching heart rate data:", error);
        return res.status(500).json({ mess: "Error fetching heart rate data", code: 500, error: error.message });
    }
}


module.exports = {
    saveHeartRateData,
    getHeartRateData,
    deleteHeartRateData,
    getHeartRateDataForLast7Days,
};
