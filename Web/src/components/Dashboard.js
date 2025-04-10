import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  useTheme,
  Skeleton,
  Alert,
} from "@mui/material";
import {
  People,
  MenuBook,
  LocalLibrary,
  TrendingUp,
  Refresh,
  CollectionsBookmark,
} from "@mui/icons-material";
import secret from "./secret";

const StatCard = ({ title, value, icon, color, loading = false, subtitle }) => {
  return (
    <Card
      sx={{
        minWidth: 180,
        p: 2,
        borderRadius: "12px",
        background: `linear-gradient(135deg, ${color}10, ${color}05)`,
        borderLeft: `4px solid ${color}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 4px 12px ${color}20`,
        },
        height: 70,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color,
          }}
        >
          {React.cloneElement(icon, { fontSize: "medium" })}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={80} height={36} />
          ) : (
            <Typography variant="h5" fontWeight="700">
              {value}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </Card>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    totalResources: 0,
    totalAccesses: 0,
    newResources: 0,
  });
  const [error, setError] = useState(null);

  const profile = localStorage.getItem("profile");
  if (!profile) {
    window.location.href = "/login";
  }
  const user = profile ? JSON.parse(profile) : null;
  const userName = user ? user.name : "Guest";

  const capitalizeFirstLetter = (str) => {
    if (str && str.length > 0) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return str;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [statsRes, eresourceRes] = await Promise.all([
        fetch(
          `http://${secret.Server_IP}:${secret.Server_Port}/admin/report/dashboard-stats`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        ),
        fetch(
          `http://${secret.Server_IP}:${secret.Server_Port}/admin/report/eresource-stats`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        ),
      ]);

      // Check responses
      if (!statsRes.ok) throw new Error("Failed to fetch dashboard stats");
      if (!eresourceRes.ok) throw new Error("Failed to fetch e-resource stats");

      // Parse responses
      const statsData = await statsRes.json();
      const eresourceData = await eresourceRes.json();

      // Update state
      setStats({
        totalUsers: statsData.totalUsers || 0,
        activeUsers: statsData.activeUsers || 0,
        newUsers: statsData.newUsers || 0,
        totalResources: eresourceData.totalResources || 0,
        totalAccesses: eresourceData.totalAccesses || 0,
        newResources: eresourceData.newResources || 0,
      });
    } catch (err) {
      setError(err.message);
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refreshData = () => {
    fetchDashboardData();
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading dashboard data: {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={refreshData}
          sx={{ borderRadius: "8px" }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header Section */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="700" gutterBottom>
            Library Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of your library's performance and metrics
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={refreshData}
          disabled={loading}
          sx={{ borderRadius: "8px" }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Welcome Banner */}
      <Card
        sx={{
          mb: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
          color: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          p: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="600" gutterBottom>
              Welcome, {capitalizeFirstLetter(userName)}!
            </Typography>
            <Typography variant="body1">
              Your library is running smoothly. Here's what's happening today.
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<People />}
            color={theme.palette.primary.main}
            loading={loading}
            subtitle="All registered users"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={<People color="success" />}
            color={theme.palette.success.main}
            loading={loading}
            subtitle="Currently logged in"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <StatCard
            title="New Users"
            value={stats.newUsers}
            icon={<TrendingUp />}
            color={theme.palette.warning.main}
            loading={loading}
            subtitle="This month"
          />
        </Grid>
      </Grid>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <StatCard
            title="Total Resources"
            value={stats.totalResources.toLocaleString()}
            icon={<MenuBook />}
            color={theme.palette.info.main}
            loading={loading}
            subtitle="In catalog"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <StatCard
            title="Resource Accesses"
            value={stats.totalAccesses.toLocaleString()}
            icon={<LocalLibrary />}
            color={theme.palette.secondary.main}
            loading={loading}
            subtitle="All-time"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <StatCard
            title="New Resources"
            value={stats.newResources}
            icon={<CollectionsBookmark />}
            color={theme.palette.error.main}
            loading={loading}
            subtitle="This month"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
