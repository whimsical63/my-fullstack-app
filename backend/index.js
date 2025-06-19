const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

app.use(cors({})); // Allow cross-origin requests and frontend to call API
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});