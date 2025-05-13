require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json()); 

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connection successful."))
  .catch((err) => console.error("MongoDB connection error:", err));

const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/note');


app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

app.get("/", (req, res) => {
  res.send("Emotional Reservoir API works! 🚀");
});

app.use(express.static(path.join(__dirname, 'client/build')));

  // Herhangi bir URL'ye yönlendirildiğinde index.html döndürme
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} .`);
});
