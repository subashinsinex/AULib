require("dotenv").config();
const express = require("express");
const cors = require("cors");

const userAuthRoutes = require("./routes/user_auth");
const favoritesRoutes = require("./routes/favorites");
const searchRoutes = require("./routes/search");
const profileRoutes = require("./routes/profile");
const statsRoutes = require("./routes/stats");
const eresourcesRoutes = require("./routes/eresources");
const adminUsersRoutes = require("./routes/admin_users");
const reportRoutes = require("./routes/admin_report");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/userAuth", userAuthRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/search", searchRoutes);
app.use("/profile", profileRoutes);
app.use("/stats", statsRoutes);
app.use("/eresources", eresourcesRoutes);
app.use("/admin/users", adminUsersRoutes);
app.use("/admin/report", reportRoutes);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST;
app.listen(PORT, () => console.log(`Server running on ${HOST}:${PORT}`));
