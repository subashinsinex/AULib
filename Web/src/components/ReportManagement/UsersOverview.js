import React, { useEffect, useState } from "react";
import secret from "../secret";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Box,
  useTheme,
  CircularProgress,
  Skeleton,
  Alert,
  Divider,
  Paper,
} from "@mui/material";
import {
  People,
  CheckCircle,
  TrendingUp,
  InsertChartOutlined,
  School,
  CalendarToday,
  Refresh,
  Group,
  Event,
} from "@mui/icons-material";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        padding: "12px",
        borderRadius: "12px",
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="subtitle2" fontWeight="600" gutterBottom>
        {label || payload[0].name}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "2px",
            backgroundColor: payload[0].color,
          }}
        />
        <Typography variant="body2">
          Count: <strong>{payload[0].value}</strong>
        </Typography>
      </Box>
      {payload[0].payload.percentage && (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Percentage: <strong>{payload[0].payload.percentage}%</strong>
        </Typography>
      )}
    </Paper>
  );
};

const StatCard = ({ title, value, icon, color, loading, subtitle }) => {
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

const EmptyState = ({ message, icon }) => (
  <Box
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      py: 4,
      color: "text.secondary",
    }}
  >
    {icon || <InsertChartOutlined sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />}
    <Typography variant="body1" sx={{ maxWidth: "80%", textAlign: "center" }}>
      {message || "No data available"}
    </Typography>
  </Box>
);

const UsersOverview = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
  });
  const [categoryData, setCategoryData] = useState([]);
  const [collegeData, setCollegeData] = useState([]);
  const [batchData, setBatchData] = useState([]);
  const [activityData, setActivityData] = useState({
    metrics: {
      activeNow: 0,
      activeToday: 0,
      activeThisWeek: 0,
      activeThisMonth: 0,
      totalUsers: 0,
    },
  });

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, categoryRes, collegeRes, batchRes, activeRes] =
        await Promise.all([
          fetch(
            `http://${secret.Server_IP}:${secret.Server_Port}/admin/report/dashboard-stats`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                "Content-Type": "application/json",
              },
            }
          ),
          fetch(
            `http://${secret.Server_IP}:${secret.Server_Port}/admin/report/users-by-category`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                "Content-Type": "application/json",
              },
            }
          ),
          fetch(
            `http://${secret.Server_IP}:${secret.Server_Port}/admin/report/users-by-college`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                "Content-Type": "application/json",
              },
            }
          ),
          fetch(
            `http://${secret.Server_IP}:${secret.Server_Port}/admin/report/users-by-batch`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                "Content-Type": "application/json",
              },
            }
          ),
          fetch(
            `http://${secret.Server_IP}:${secret.Server_Port}/admin/report/users-active-status`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                "Content-Type": "application/json",
              },
            }
          ),
        ]);

      const checkStatus = (res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      };

      const [statsData, categoryData, collegeData, batchData, activeData] =
        await Promise.all([
          checkStatus(statsRes),
          checkStatus(categoryRes),
          checkStatus(collegeRes),
          checkStatus(batchRes),
          checkStatus(activeRes),
        ]);

      setStats(statsData);
      setCategoryData(categoryData);
      setCollegeData(collegeData);
      setBatchData(batchData);

      setActivityData({
        metrics: {
          activeNow: parseInt(activeData.activeNow || 0),
          activeToday: parseInt(activeData.activeToday || 0),
          activeThisWeek: parseInt(activeData.activeThisWeek || 0),
          activeThisMonth: parseInt(activeData.activeThisMonth || 0),
          totalUsers: parseInt(
            activeData.totalUsers || statsData.totalUsers || 0
          ),
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (error) {
    return (
      <Box sx={{ marginBottom: 5 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading dashboard data: {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchData}
          sx={{ borderRadius: "8px" }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ marginBottom: 5 }}>
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
            User Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Insights into user demographics and activity patterns
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchData}
          disabled={loading}
          sx={{ borderRadius: "8px" }}
        >
          Refresh Data
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<People />}
            color={theme.palette.primary.main}
            loading={loading}
            subtitle="All registered users"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={<CheckCircle />}
            color={theme.palette.success.main}
            loading={loading}
            subtitle="Currently logged in"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="New Users"
            value={stats.newUsers}
            icon={<TrendingUp />}
            color={theme.palette.warning.main}
            loading={loading}
            subtitle="Added this month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Active Now"
            value={activityData.metrics.activeNow}
            icon={<Group />}
            color={theme.palette.info.main}
            loading={loading}
            subtitle="Currently active"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        {/* Users by Category (Pie chart) */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              },
            }}
          >
            <CardHeader
              title={
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  Users by Category
                </Typography>
              }
              subheader="Distribution of user types"
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                py: 2,
              }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              {loading ? (
                <Box
                  sx={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={2}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      iconType="circle"
                      iconSize={10}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No category data available" />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Users by College (Bar chart) */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              },
            }}
          >
            <CardHeader
              title={
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  Users by College
                </Typography>
              }
              subheader="Distribution across colleges"
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                py: 2,
              }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              {loading ? (
                <Box
                  sx={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : collegeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={collegeData}
                    margin={{ top: 15, right: 15, left: 0, bottom: 15 }}
                    layout="vertical"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      opacity={0.2}
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="college_name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      tickFormatter={(value) =>
                        value.length > 20
                          ? `${value.substring(0, 20)}...`
                          : value
                      }
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    />
                    <Bar
                      dataKey="user_count"
                      name="Users"
                      fill={theme.palette.primary.main}
                      radius={[0, 4, 4, 0]}
                      animationBegin={200}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  message="No college data available"
                  icon={<School sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Users by Batch Year (Line chart) */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              },
            }}
          >
            <CardHeader
              title={
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  Users by Batch Year
                </Typography>
              }
              subheader="Distribution across graduation years"
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                py: 2,
              }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              {loading ? (
                <Box
                  sx={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : batchData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={batchData}
                    margin={{ top: 15, right: 15, left: 0, bottom: 15 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      opacity={0.2}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      domain={[0, "dataMax + 2"]}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Students"
                      stroke={theme.palette.secondary.main}
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        strokeWidth: 2,
                        fill: theme.palette.secondary.light,
                      }}
                      activeDot={{
                        r: 6,
                        stroke: theme.palette.secondary.dark,
                        strokeWidth: 2,
                        fill: theme.palette.secondary.main,
                      }}
                      animationBegin={400}
                      animationDuration={2000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  message="No batch data available"
                  icon={
                    <CalendarToday sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                  }
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* User Activity Status (Bar chart) */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              },
            }}
          >
            <CardHeader
              title={
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  User Activity Status
                </Typography>
              }
              subheader="Breakdown of user engagement"
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                py: 2,
              }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              {loading ? (
                <Box
                  sx={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : activityData.metrics.totalUsers > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        status: "Active Now",
                        count: parseInt(activityData.metrics.activeNow),
                        percentage: (
                          (parseInt(activityData.metrics.activeNow) /
                            activityData.metrics.totalUsers) *
                          100
                        ).toFixed(1),
                      },
                      {
                        status: "Active Today",
                        count: parseInt(activityData.metrics.activeToday),
                        percentage: (
                          (parseInt(activityData.metrics.activeToday) /
                            activityData.metrics.totalUsers) *
                          100
                        ).toFixed(1),
                      },
                      {
                        status: "Active This Week",
                        count: parseInt(activityData.metrics.activeThisWeek),
                        percentage: (
                          (parseInt(activityData.metrics.activeThisWeek) /
                            activityData.metrics.totalUsers) *
                          100
                        ).toFixed(1),
                      },
                      {
                        status: "Active This Month",
                        count: parseInt(activityData.metrics.activeThisMonth),
                        percentage: (
                          (parseInt(activityData.metrics.activeThisMonth) /
                            activityData.metrics.totalUsers) *
                          100
                        ).toFixed(1),
                      },
                      {
                        status: "Never Active",
                        count:
                          activityData.metrics.totalUsers -
                          parseInt(activityData.metrics.activeThisMonth),
                        percentage: (
                          ((activityData.metrics.totalUsers -
                            parseInt(activityData.metrics.activeThisMonth)) /
                            activityData.metrics.totalUsers) *
                          100
                        ).toFixed(1),
                      },
                    ]}
                    margin={{ top: 15, right: 15, left: 0, bottom: 15 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      opacity={0.2}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="status"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      tickFormatter={(value) => {
                        if (value === "Active Now") return "Now";
                        if (value === "Active Today") return "Today";
                        if (value === "Active This Week") return "This Week";
                        if (value === "Active This Month") return "This Month";
                        if (value === "Never Active") return "Never";
                        return value;
                      }}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    />
                    <Bar
                      dataKey="count"
                      name="Users"
                      radius={[4, 4, 0, 0]}
                      animationBegin={200}
                      animationDuration={1500}
                    >
                      {[
                        theme.palette.success.main,
                        theme.palette.info.main,
                        theme.palette.warning.main,
                        theme.palette.primary.main,
                        theme.palette.grey[500],
                      ].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  message="No activity data available"
                  icon={<Event sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UsersOverview;
