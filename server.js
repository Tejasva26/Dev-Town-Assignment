require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());

// Import routes
app.use("/q1", require("./q1/q1Routes"));
app.use("/q2", require("./q2/q2Routes"));
app.use("/q3", require("./q3/q3Routes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
