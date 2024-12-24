const db = require('../data/db');
const jwtHelper = require('../utils/jwt_helper');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

async function logIn(req, res) {
    try {
        const { email, password } = req.body;

        // Fetch user details from the account table
        const result = await db.query('SELECT * FROM account WHERE user_email = $1', [email]);
        if (result.length === 0) {
            return res.status(401).json({ mess: "Email is incorrect", code: 401 });
        }

        const user = result[0];

        // Check password
        const validPassword = await bcrypt.compare(password, user.user_password);
        if (!validPassword) {
            return res.status(401).json({ mess: "Incorrect password", code: 401 });
        }

        // Generate JWT tokens
        const tokens = jwtHelper.jwtTokens(user);

        // Check login status and update or insert the session token
        const sessionResult = await db.query('SELECT * FROM account_login_status WHERE user_id = $1', [user.id]);
        if (sessionResult.length === 0) {
            // Insert new session token
            await db.query(
                "INSERT INTO account_login_status (user_id, session_token) VALUES ($1, $2);",
                [user.id, tokens.accessToken]
            );
        } else {
            // Update existing session token
            await db.query(
                "UPDATE account_login_status SET session_token = $1 WHERE user_id = $2;",
                [tokens.accessToken, user.id]
            );
        }

        return res.status(200).json({ mess: "Login successful", data: tokens, code: 200 });
    } catch (error) {
        console.error('Error during login:', error.message);
        return res.status(500).json({ mess: error.message, code: 500 });
    }
}

async function refreshToken(req, res) {
    try {
        const { userId, refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ mess: "Refresh token is required", code: 401 });
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (error, user) => {
            if (error) {
                return res.status(403).json({ mess: "Invalid refresh token", code: 403 });
            }

            // Fetch the user from the database
            const result = await db.query('SELECT * FROM account WHERE id = $1', [userId]);
            // console.log(result);
            if (result.length === 0) {
                console.error('User not found');
                return res.status(404).json({ mess: "User not found", code: 404 });
            }

            const fetchedUser = result[0];

            // Generate new tokens
            const tokens = jwtHelper.jwtTokens(fetchedUser);

            // Update the session token in account_login_status
            await db.query(
                "UPDATE account_login_status SET session_token = $1 WHERE user_id = $2;",
                [tokens.accessToken, userId]
            );

            return res.status(200).json({ data: tokens, mess: "success", code: 200 });
        });
    } catch (error) {
        console.error('Error during token refresh:', error.message);
        return res.status(500).json({ mess: error.message, code: 500 });
    }
}

async function logOut(req, res) {
    try {
        const { accessToken, userId } = req.body;

        if (!accessToken) {
            return res.status(401).json({ mess: "Access token is required", code: 401 });
        }

        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (error, user) => {
            if (error) {
                return res.status(403).json({ mess: "Invalid access token", code: 403 });
            }

            if (user.id != userId) {
                return res.status(401).json({ mess: "Invalid user details", code: 401 });
            }

            // Delete the session token from account_login_status
            await db.query("DELETE FROM account_login_status WHERE user_id = $1", [userId]);

            return res.status(200).json({ mess: "Logout successful", code: 200 });
        });
    } catch (error) {
        console.error('Error during logout:', error.message);
        return res.status(500).json({ mess: error.message, code: 500 });
    }
}

module.exports = {
    logIn,
    refreshToken,
    logOut,
};
