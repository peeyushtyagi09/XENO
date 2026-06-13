const mongoose = require("mongoose");
const { mongoDB_URI } = require("../../example.env.js");

const connectDB = async () => {
    if (!mongoDB_URI) {
        console.error("❌ mongoDB_URI is not provided ❌");
        return;
    }
    try {
        await mongoose.connect(mongoDB_URI);
        console.log("🙌 Database is successfully connected ....🙌");
    } catch (err) {
        console.error("❌ There was an error connecting to the database ❌");
        console.error(err);
        throw err;
    }
};

module.exports = {
    connectDB
};