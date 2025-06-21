const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

// Allow cross-origin requests and frontend to call API
app.use(cors({
     origin: 'http://localhost:3000', // Adjust this to your frontend's URL
     credentials: true, // Allow credentials if needed
})); 
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});