import React from "react";
import { Box, Typography, Card, Grid, Button } from "@mui/material";
import { styled } from "@mui/system";

// Stats Card Component with Gradient Background and White Text
const StatsCard = styled(Card)(() => ({
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  padding: "16px",
  background: "linear-gradient(135deg, #0984e3, #74b9ff)",
  color: "#fff",
}));

const Dashboard = () => {
  const profile = localStorage.getItem("profile"); // Fetch profile from localStorage
  if (!profile) {
    window.location.href = "/login"; // Redirect to login if no profile found
  }
  const user = profile ? JSON.parse(profile) : null;
  const userName = user ? user.name : "Guest"; // Default to "Guest" if no name

  // Function to capitalize the first letter of a string
  const capitalizeFirstLetter = (str) => {
    if (str && str.length > 0) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return str;
  };

  return (
    <Box>
      {/* Welcome Banner */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0984e3, #74b9ff)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>
            Welcome! {capitalizeFirstLetter(userName)}
          </Typography>
          <Typography variant="body1" sx={{ color: "white" }}>
            Bingo! Your eLibrary is live. Let users know about it.
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            sx={{
              marginRight: 1,
              backgroundColor: "white",
              color: "#0984e3",
            }}
          >
            Make Announcement
          </Button>
        </Box>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatsCard>
            <Typography variant="h5" sx={{ color: "white" }}>
              18
            </Typography>
            <Typography variant="body1" sx={{ color: "white" }}>
              Publishers in your catalog
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard>
            <Typography variant="h5" sx={{ color: "white" }}>
              59,723
            </Typography>
            <Typography variant="body1" sx={{ color: "white" }}>
              Publications in your catalog
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard>
            <Typography variant="h5" sx={{ color: "white" }}>
              5,324
            </Typography>
            <Typography variant="body1" sx={{ color: "white" }}>
              Active users
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard>
            <Typography variant="h5" sx={{ color: "white" }}>
              234
            </Typography>
            <Typography variant="body1" sx={{ color: "white" }}>
              New members this month
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard>
            <Typography variant="h5" sx={{ color: "white" }}>
              67
            </Typography>
            <Typography variant="body1" sx={{ color: "white" }}>
              Popular publications
            </Typography>
          </StatsCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
