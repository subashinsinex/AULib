require("dotenv").config();
const express = require("express");
const cors = require("cors");

const favoritesRoutes = require("./routes/favorites");
const searchRoutes = require("./routes/search");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/favorites", favoritesRoutes);
app.use("/search", searchRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
