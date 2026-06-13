const express = require("express");
const app = express();
const cors = require("cors");

const {PORT} = require("./example.env");

app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send("Hello ji..");
});


app.listen("PORT", () => {
    console.log(`👌 Server is perfectly running on PORT: ${PORT} 👌`);
});

