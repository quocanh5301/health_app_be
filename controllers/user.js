const db = require('../data/db');
const e = require('express');
const bcrypt = require('bcrypt');
const dateTime = require('../utils/date_time');

async function getUserProfile(req, res) {
    try {
        const userId = req.body.userId; //!qa num follower needed?
        const userQuery = "SELECT  id, user_name, user_email, description, num_of_followers, update_at, join_at, user_image  FROM account WHERE id = $1";
        const userResult = await db.query(userQuery, [userId]);
        userResult[0].update_at = new Date(userResult[0].update_at).getTime();
        userResult[0].join_at = new Date(userResult[0].join_at).getTime();

        return res.status(200).json({ mess: "success", code: 200, data: userResult[0] });
    } catch (error) {
        return res.status(500).json({ mess: error.message, code: 500 });
    }
}

async function updateUserData(req, res) {
    try {
        const userId = req.body.userId;
        const userName = req.body.userName;
        const userEmail = req.body.userEmail;
        const description = req.body.description;
        const updateUserQuery = "UPDATE account SET user_name = $1, user_email = $2, description = $3, update_at = $4 WHERE id = $5";
        await db.query(updateUserQuery, [userName, userEmail, description, dateTime.currentDateDMY(), userId]);
        return res.status(200).json({ mess: "success", code: 200, data: { userName: userName, userEmail: userEmail, description: description } });
    } catch (error) {
        return res.status(500).json({ mess: 'Error updating user data ' + error, code: 500 });
    }
}

async function changeUserPassword(req, res) {
    try {
        const userId = req.body.userId;
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;
        const userQuery = "SELECT user_password FROM account WHERE id = $1";
        const userResult = await db.query(userQuery, [userId]);
        const validPassword = await bcrypt.compare(oldPassword, userResult[0].user_password);
        if (!validPassword) return res.status(200).json({ mess: "Incorrect old password", code: 200 });
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateUserQuery = "UPDATE account SET user_password = $1, update_at = $2 WHERE id = $3";
        await db.query(updateUserQuery, [hashedPassword, dateTime.currentDateDMY_HM(), userId]);
        return res.status(200).json({ mess: "success", code: 200 });
    } catch (error) {
        return res.status(500).json({ mess: 'Error updating user password' + error, code: 500 });
    }
}

module.exports = {
    getUserProfile: getUserProfile,
    updateUserData: updateUserData,
    changeUserPassword: changeUserPassword,
}