// Import required modules
import express from 'express';
import cors from 'cors';

// Create an instance of the Express application
const app = express();
app.use(cors());

// Define a route for the root endpoint
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server
const port = 3000; // Specify the port number
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
