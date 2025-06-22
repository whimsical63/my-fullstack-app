import express from "express";
import cors from "cors";
import axios from "axios";
const app = express();
const PORT = 4000;

// Allow cross-origin requests and frontend to call API
app.use(
  cors({
    origin: "http://localhost:3000", // Adjust this to your frontend's URL
    credentials: true, // Allow credentials if needed
  })
);
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://api.sampleapis.com/coffee/hot");
    const data = response.data;
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
