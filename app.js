// Import required modules
var express = require("express");
var cors = require("cors");
var dotenv = require("dotenv");

// Create an instance of the Express application
const app = express();
app.use(cors());

dotenv.config()

var homeRoutes = require('./routes/home.js');
var endEpochRoutes = require('./routes/end_epoch.js');

app.use('/api/', homeRoutes);
app.use('/api/end_epoch', endEpochRoutes);

// Start the server
app.listen(process.env.PORT, () => {
  console.log('Running on port ' + process.env.PORT)
})