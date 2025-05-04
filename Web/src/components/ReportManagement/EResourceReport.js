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
  Book,
  LibraryBooks,
  Category,
  Refresh,
  TrendingUp,
  Person,
  LocalLibrary,
  CalendarMonth,
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
    {icon || <LibraryBooks sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />}
    <Typography variant="body1" sx={{ maxWidth: "80%", textAlign: "center" }}>
      {message || "No data available"}
    </Typography>
  </Box>
);

const EResourceReport = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalResources: 0,
    totalAccesses: 0,
    newResources: 0,
  });
  const [typeData, setTypeData] = useState([]);
  const [topResources, setTopResources] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [accessTrends, setAccessTrends] = useState([]);
  const [publisherData, setPublisherData] = useState([]);
  const [topPublishers, setTopPublishers] = useState([]);

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

      const [
        statsRes,
        typeRes,
        topResourcesRes,
        topUsersRes,
        trendsRes,
        publisherRes,
        topPublishersRes,
      ] = await Promise.all([
        fetch(
          `http://${secret.Server_IP}:${secret.Server_Port}/admin/report/eresource-stats`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
          }
        ),
        fetch(
          `http://${secret.Server_IP}:${secret.Server_Port}/admin/report/eresources-by-type`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
          }
        ),
        fetch(
          `http://${secret.Server_IP}:${secret.Server_Port}/admin/report/top-eresources`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
          }
        ),
        fetch(
          `http://${secret.Server_IP}:${secret.Server_Port}/admin/report/top-users-by-access`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
          }
        ),
        fetch(
          `http://${secret.Server_IP}:${secret.Server_Port}/admin/report/access-trends`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
          }
        ),
        fetch(
          `http://${secret.Server_IP}:${secret.Server_Port}/admin/report/eresources-by-publisher`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
          }
        ),
        fetch(
          `http://${secret.Server_IP}:${secret.Server_Port}/admin/report/top-publishers`,
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

      const [
        statsData,
        typeData,
        topResourcesData,
        topUsersData,
        trendsData,
        publisherData,
        topPublishersData,
      ] = await Promise.all([
        checkStatus(statsRes),
        checkStatus(typeRes),
        checkStatus(topResourcesRes),
        checkStatus(topUsersRes),
        checkStatus(trendsRes),
        checkStatus(publisherRes),
        checkStatus(topPublishersRes),
      ]);

      setStats(statsData);
      setTypeData(typeData);
      setTopResources(topResourcesData);
      setTopUsers(topUsersData);
      setAccessTrends(trendsData);
      setPublisherData(publisherData);
      setTopPublishers(topPublishersData);
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
            E-Resource Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Insights into electronic resource usage and access patterns
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
            title="Total Resources"
            value={stats.totalResources}
            icon={<Book />}
            color={theme.palette.primary.main}
            loading={loading}
            subtitle="All e-resources"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Total Accesses"
            value={stats.totalAccesses}
            icon={<TrendingUp />}
            color={theme.palette.success.main}
            loading={loading}
            subtitle="All-time views"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="New Resources"
            value={stats.newResources}
            icon={<LocalLibrary />}
            color={theme.palette.warning.main}
            loading={loading}
            subtitle="Added this month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Daily Avg."
            value={
              accessTrends.length > 0
                ? Math.round(
                    accessTrends.reduce((sum, day) => sum + day.count, 0) /
                      accessTrends.length
                  )
                : 0
            }
            icon={<CalendarMonth />}
            color={theme.palette.info.main}
            loading={loading}
            subtitle="Average daily accesses"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        {/* Resources by Type (Pie chart) */}
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
                  Resources by Type
                </Typography>
              }
              subheader="Distribution of e-resource types"
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
              ) : typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={2}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      {typeData.map((entry, index) => (
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
                <EmptyState
                  message="No type data available"
                  icon={<Category sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Most Accessed E-Resources (Bar chart) */}
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
                  Most Accessed Resources
                </Typography>
              }
              subheader="Top 10 frequently accessed e-resources"
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
              ) : topResources.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={topResources}
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
                      dataKey="title"
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
                      dataKey="access_count"
                      name="Accesses"
                      fill={theme.palette.primary.main}
                      radius={[0, 4, 4, 0]}
                      animationBegin={200}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No resource access data available" />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top 10 Users by Access Frequency (Bar chart) */}
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
                  Top Users by Access
                </Typography>
              }
              subheader="Most active users by resource access"
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
              ) : topUsers.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={topUsers}
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
                      dataKey="user_name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    />
                    <Bar
                      dataKey="access_count"
                      name="Accesses"
                      fill={theme.palette.secondary.main}
                      radius={[0, 4, 4, 0]}
                      animationBegin={200}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  message="No user access data available"
                  icon={<Person sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Daily/Monthly Access Trends (Line chart) */}
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
                  Access Trends
                </Typography>
              }
              subheader="Daily resource access patterns"
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
              ) : accessTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={accessTrends}
                    margin={{ top: 15, right: 15, left: 0, bottom: 15 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      opacity={0.2}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 14, // Increased font size
                        fontWeight: 500,
                        fill: theme.palette.text.primary,
                      }}
                      tickLine={false}
                      height={40} // Increased height for XAxis
                      padding={{ left: 10, right: 10 }} // Add padding if needed
                    />
                    <YAxis
                      tick={{
                        fontSize: 14, // Increased font size
                        fontWeight: 500,
                        fill: theme.palette.text.primary,
                      }}
                      tickLine={false}
                      width={40} // Increased width for YAxis
                      domain={[0, "maxCount + 5"]}
                      label={{
                        value: "Access Count",
                        angle: -90,
                        position: "insideLeft",
                        fontSize: 14,
                        fill: theme.palette.text.primary,
                      }}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Daily Accesses"
                      stroke={theme.palette.success.main}
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        strokeWidth: 2,
                        fill: theme.palette.success.light,
                      }}
                      activeDot={{
                        r: 6,
                        stroke: theme.palette.success.dark,
                        strokeWidth: 2,
                        fill: theme.palette.success.main,
                      }}
                      animationBegin={400}
                      animationDuration={2000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  message="No access trend data available"
                  icon={
                    <TrendingUp sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                  }
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Resources by Publisher (Pie chart) */}
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
                  Resources by Publisher
                </Typography>
              }
              subheader="Distribution across publishers"
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
              ) : publisherData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={publisherData}
                      dataKey="count"
                      nameKey="publisher"
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
                      {publisherData.map((entry, index) => (
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
                <EmptyState
                  message="No publisher data available"
                  icon={
                    <LibraryBooks sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                  }
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Accessed Publishers (Bar chart) */}
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
                  Top Accessed Publishers
                </Typography>
              }
              subheader="Publishers with most accessed resources"
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                py: 2,
              }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              {loading ? (
                <Box
                  sx={{
                    height: 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : topPublishers.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={topPublishers}
                    margin={{ top: 15, right: 15, left: 15, bottom: 15 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      opacity={0.2}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="publisher"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      tickFormatter={(value) =>
                        value.length > 15
                          ? `${value.substring(0, 15)}...`
                          : value
                      }
                    />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    />
                    <Bar
                      dataKey="access_count"
                      name="Accesses"
                      radius={[4, 4, 0, 0]}
                      animationBegin={200}
                      animationDuration={1500}
                      fill={theme.palette.info.main}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No publisher access data available" />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EResourceReport;
