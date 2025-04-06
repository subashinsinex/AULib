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
} from "@mui/material";
import {
  People,
  CheckCircle,
  TrendingUp,
  InsertChartOutlined,
} from "@mui/icons-material";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <Card
      sx={{
        padding: "12px",
        borderRadius: "8px",
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
    </Card>
  );
};

const StatCard = ({ title, value, icon, color, loading }) => {
  return (
    <Card
      sx={{
        minWidth: 160,
        p: 2,
        borderRadius: "10px",
        background: `linear-gradient(135deg, ${color}20, ${color}10)`,
        borderLeft: `4px solid ${color}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "8px",
            background: `${color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color,
          }}
        >
          {React.cloneElement(icon, { fontSize: "small" })}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={60} height={32} />
          ) : (
            <Typography variant="h6" fontWeight="700">
              {value}
            </Typography>
          )}
        </Box>
      </Box>
    </Card>
  );
};

const EmptyState = ({ message }) => (
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
    <InsertChartOutlined sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
    <Typography>{message || "No data available"}</Typography>
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
    theme.palette.success.main, // Active Today (green)
    theme.palette.info.main, // Active This Week (blue)
    theme.palette.warning.main, // Active This Month (yellow)
    theme.palette.error.light, // Inactive (red)
    theme.palette.grey[500], // Never Active (grey)
  ];

  useEffect(() => {
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

    fetchData();
  }, []);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading dashboard data: {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
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
        <Typography variant="h4" fontWeight="700">
          User Analytics Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<People />}
            color={theme.palette.primary.main}
            loading={loading}
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={<CheckCircle />}
            color={theme.palette.success.main}
            loading={loading}
          />
          <StatCard
            title="New This Month"
            value={stats.newUsers}
            icon={<TrendingUp />}
            color={theme.palette.warning.main}
            loading={loading}
          />
        </Box>
      </Box>

      <Grid
        container
        spacing={3}
        sx={{
          [theme.breakpoints.down("sm")]: {
            "& .MuiGrid-item": { paddingTop: "0 !important" },
            gap: 2,
          },
        }}
      >
        <Grid item xs={12} md={6} lg={3}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardHeader
              title={
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  Users by Category
                </Typography>
              }
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                py: 1.5,
              }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              {loading ? (
                <Box
                  sx={{
                    height: 250,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                      paddingAngle={5}
                      labelLine={false}
                      label={({ name, percent }) => (
                        <text
                          x={0}
                          y={0}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#fff"
                          fontSize="12px"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      )}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CustomTooltip theme={theme} />}
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No category data available" />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardHeader
              title={
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  Users by College
                </Typography>
              }
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                py: 1.5,
              }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              {loading ? (
                <Box
                  sx={{
                    height: 250,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : collegeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={collegeData}
                    margin={{ top: 15, right: 15, left: 0, bottom: 15 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      opacity={0.3}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="college_name"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                    <Tooltip
                      content={<CustomTooltip theme={theme} />}
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    />
                    <Bar
                      dataKey="user_count"
                      name="Users"
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                      animationBegin={200}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No college data available" />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardHeader
              title={
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  Users by Batch Year
                </Typography>
              }
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                py: 1.5,
              }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              {loading ? (
                <Box
                  sx={{
                    height: 250,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : batchData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart
                    data={batchData}
                    margin={{ top: 15, right: 15, left: 0, bottom: 15 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      opacity={0.3}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                    <Tooltip
                      content={<CustomTooltip theme={theme} />}
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Students"
                      stroke={theme.palette.secondary.main}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      animationBegin={400}
                      animationDuration={2000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No batch data available" />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardHeader
              title={
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  User Activity Status
                </Typography>
              }
              subheader={
                !loading && (
                  <Typography variant="body2" color="text.secondary">
                    {`${activityData.metrics.activeToday} active today | ${activityData.metrics.activeThisWeek} active this week`}
                  </Typography>
                )
              }
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                py: 1.5,
              }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              {loading ? (
                <Box
                  sx={{
                    height: 250,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : activityData.metrics.totalUsers > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
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
                      opacity={0.3}
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
                      content={<CustomTooltip theme={theme} />}
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
                        theme.palette.success.main, // Active Now (green)
                        theme.palette.info.main, // Active Today (blue)
                        theme.palette.warning.main, // Active This Week (yellow)
                        theme.palette.primary.main, // Active This Month (primary)
                        theme.palette.grey[500], // Never Active (grey)
                      ].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No activity data available" />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UsersOverview;
