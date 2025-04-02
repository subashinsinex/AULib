import React from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";
import Dashboard from "./Dashboard";
import User from "./UserManagement/User";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import BarChartIcon from "@mui/icons-material/BarChart";
import LayersIcon from "@mui/icons-material/Layers";

const NAVIGATION = {
  dashboard: { title: "Dashboard", icon: <DashboardIcon /> },
  user: { title: "User Management", icon: <PersonIcon /> },
  reports: { title: "Reports", icon: <BarChartIcon /> },
  integrations: { title: "Integrations", icon: <LayersIcon /> },
};

const BodyWrapper = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  backgroundColor: "#f7f9fc",
  height: "100vh",
  padding: "24px",
  overflowX: "hidden",
}));

const Header = styled(Box)(() => ({
  background: "linear-gradient(135deg, #0984e3, #74b9ff)",
  color: "#fff",
  padding: "16px",
  borderRadius: "8px",
  marginBottom: "24px",
  display: "flex",
  alignItems: "center",
}));

const Body = ({ component, isSidebarOpen }) => {
  const renderComponent = () => {
    switch (component) {
      case "dashboard":
        return <Dashboard />;
      case "user":
        return <User />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <BodyWrapper>
      <Header>
        {NAVIGATION[component] && (
          <>
            <Box sx={{ marginRight: "10px" }}>{NAVIGATION[component].icon}</Box>
            <Typography variant="h5">{NAVIGATION[component].title}</Typography>
          </>
        )}
      </Header>
      {renderComponent()}
    </BodyWrapper>
  );
};

export default Body;
