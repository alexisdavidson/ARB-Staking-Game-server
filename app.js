// Import required modules
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'

// Create an instance of the Express application
const app = express();
app.use(cors());

dotenv.config()

import homeRoutes from './routes/home.js';
import endEpochRoutes from './routes/end_epoch.js';

app.use('/api/', homeRoutes);
app.use('/api/end_epoch', endEpochRoutes);

// Start the server
app.listen(process.env.PORT, () => {
  console.log('Running on port ' + process.env.PORT)
})