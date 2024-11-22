const db = require('../data/db');
const jwtHelper = require('../utils/jwt_helper');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

async function logIn(req, res) {
    try {
        const { email, password } = req.body;

        // Fetch user details from the account table
        const rows = await db.query('SELECT * FROM account WHERE user_email = $1', [email]);
        if (rows.length === 0) return res.status(401).json({ mess: "Email is incorrect", code: 401 });

        // Check password
        const validPassword = await bcrypt.compare(password, rows[0].user_password);
        if (!validPassword) return res.status(401).json({ mess: "Incorrect password", code: 401 });

        // Generate JWT tokens
        const tokens = jwtHelper.jwtTokens(rows[0]);

        // Check login status and update or insert the session token
        const loggedInRows = await db.query('SELECT * FROM account_login_status WHERE user_email = $1', [email]);
        if (loggedInRows.length === 0) {
            await db.query("INSERT INTO account_login_status (user_email, session_token) VALUES ($1, $2);", [email, tokens.accessToken]);
        } else {
            await db.query("UPDATE account_login_status SET session_token = $1 WHERE user_email = $2;", [tokens.accessToken, email]);
        }

        return res.json({ mess: "success", data: tokens, code: 200 });
    } catch (error) {
        return res.status(500).json({ mess: error.message, code: 500 });
    }
}


async function refreshToken(req, res) {
    try {
        const { userEmail, refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ mess: "Refresh token is required", code: 401 });

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (error, user) => {
            if (error) return res.status(403).json({ mess: "Invalid refresh token", code: 403 });

            // Fetch the user from the database
            const rows = await db.query('SELECT * FROM account WHERE user_email = $1', [userEmail]);
            if (rows.length === 0) return res.status(404).json({ mess: "User not found", code: 404 });

            // Generate new tokens
            const tokens = jwtHelper.jwtTokens(rows[0]);

            // Update the session token in account_login_status
            await db.query("UPDATE account_login_status SET session_token = $1 WHERE user_email = $2;", [tokens.accessToken, userEmail]);

            return res.status(200).json({ data: tokens, mess: "success", code: 200 });
        });
    } catch (error) {
        return res.status(500).json({ mess: error.message, code: 500 });
    }
}

async function logOut(req, res) {
    try {
        const { email, accessToken, userId, firebaseToken } = req.body;

        if (!accessToken) return res.status(401).json({ mess: "Access token is required", code: 401 });

        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (error, user) => {
            if (error) return res.status(403).json({ mess: "Invalid access token", code: 403 });
            if (user.user_email !== email || user.id !== userId) {
                return res.status(401).json({ mess: "Invalid user details", code: 401 });
            }

            // Delete Firebase messaging token
            await db.query('DELETE FROM firebase_messaging_token WHERE account_id = $1 OR firebase_token = $2', [userId, firebaseToken]);

            // Delete the session token from account_login_status
            await db.query("DELETE FROM account_login_status WHERE user_email = $1", [email]);

            return res.status(200).json({ mess: "success", code: 200 });
        });
    } catch (error) {
        return res.status(500).json({ mess: error.message, code: 500 });
    }
}

module.exports = {
    logIn: logIn,
    logOut: logOut,
    refreshToken: refreshToken
}