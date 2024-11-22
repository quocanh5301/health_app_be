const db = require('../data/db');
const bcrypt = require('bcrypt');

async function registerAccount(req, res) {
    try {
        const email = req.body.email;
        const name = req.body.name;
        const password = req.body.password;

        // Validate required fields
        if (!email || !name || !password) {
            return res.status(401).json({ mess: "Please fill in all fields", code: 401 });
        }

        // Check if the email or username already exists
        const checkQuery = "SELECT user_name FROM account WHERE user_email = $1 OR user_name = $2";
        const existingUser = await db.query(checkQuery, [email, name]);

        if (existingUser.length > 0) {
            return res.status(200).json({ mess: "Email or username already exists", code: 200 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user into the account table
        const insertQuery = `
            INSERT INTO account (user_name, user_email, user_password)
            VALUES ($1, $2, $3)
        `;
        await db.query(insertQuery, [name, email, hashedPassword]);

        // Optionally, send a welcome email (comment out if not needed)
        // await mailer.sendVerificationEmail(email, `http://localhost:3000/welcome`);

        res.status(200).json({ mess: "Registration successful", code: 200 });
    } catch (error) {
        console.error("Error during registration:", error.message);
        res.status(500).json({ mess: `Internal server error: ${error.message}`, code: 500 });
    }
}

module.exports = {
    registerAccount,
};
