const express = require("express");
const cookieParser =  require("cookie-parser");
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');
const dotenv = require("dotenv");

const app = express();
dotenv.config();

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));

const recipeRoutes = require('./routes/recipe');
const userRoutes = require('./routes/user');
const registerRoutes = require('./routes/register');
const authenticateRoutes = require('./routes/authenticate');

// app.use('/manganime', authenticateToken, manganimeRoutes);

app.use('/user', 
authenticateToken,
 userRoutes);

 app.use('/recipe', 
authenticateToken,
 recipeRoutes);

app.use('/register', registerRoutes);
app.use('/authenticate', authenticateRoutes);
app.listen(3000);


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']; //Bearer TOKEN
    const accessToken = authHeader && authHeader.split(' ')[1];
    if (accessToken == null) return res.status(401).json({mess:"Null token", code: 401});
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
      if (error) return res.status(403).json({mess : error.message, code: 403});
      req.user = user;
      next();
    });
  }