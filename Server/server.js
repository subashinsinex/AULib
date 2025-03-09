require("dotenv").config();
const express = require("express");
const cors = require("cors");

const userAuthRoutes = require("./routes/user_auth");
const favoritesRoutes = require("./routes/favorites");
const searchRoutes = require("./routes/search");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/userAuth", userAuthRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/search", searchRoutes);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST;
app.listen(PORT, () => console.log(`Server running on ${HOST}:${PORT}`));
