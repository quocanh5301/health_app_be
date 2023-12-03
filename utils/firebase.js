const firebaseAdmin = require('firebase-admin');
// const firebaseConfig = {
//     apiKey: process.env.API_KEY,
//     authDomain: process.env.AUTH_DOMAIN,
//     projectId: process.env.PROJECT_ID,
//     storageBucket: process.env.STORAGE_BUCKET,
//     messagingSenderId: process.env.MESSAGING_SENDER_ID,
//     appId: process.env.APP_ID,
//     measurementId: process.env.MEARSUREMENT_ID
// };
var serviceAccount = require("./animelis_adminsdk.json");

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    storageBucket: process.env.STORAGE_BUCKET,
    // databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`, // databaseURL is optional
  });

exports.firebaseAdmin = firebaseAdmin
