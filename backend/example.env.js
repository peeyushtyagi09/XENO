require("dotenv").config();

const PORT = process.env.PORT;
const mongoDB_URI = process.env.mongoDB_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("key:", GEMINI_API_KEY)

module.exports = {
    PORT,
    mongoDB_URI,
    GEMINI_API_KEY
};