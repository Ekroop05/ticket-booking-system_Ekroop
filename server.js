const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const bookingRoutes = require("./routes/booking");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api", bookingRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});