import React, { useState } from "react";
import logo from "../assets/images/logo-white.png";
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import BarChartIcon from "@mui/icons-material/BarChart";
import LayersIcon from "@mui/icons-material/Layers";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import axios from "axios";
import secret from "./secret";
import { useNavigate } from "react-router-dom";
import { MenuBook } from "@mui/icons-material";

const NAVIGATION = [
  { segment: "dashboard", title: "Dashboard", icon: <DashboardIcon /> },
  { segment: "user", title: "User Management", icon: <PersonIcon /> },
  { segment: "books", title: "Books", icon: <MenuBook /> },
  { segment: "reports", title: "Reports", icon: <BarChartIcon /> },
  { segment: "integrations", title: "Integrations", icon: <LayersIcon /> },
];

const Sidebar = ({ onSelectItem, selected, isOpen, toggleSidebar }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const navigate = useNavigate();

  const drawerWidth = isOpen ? 240 : 60;

  const onLogout = async () => {
    try {
      const profile = localStorage.getItem("profile");
      const { user_id } = JSON.parse(profile);
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error("No access token found.");
      }

      const response = await axios.post(
        `http://${secret.Server_IP}:${secret.Server_Port}/userAuth/logout`,
        { user_id },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.success) {
        localStorage.removeItem("profile");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        setSnackbarMessage("Successfully logged out!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);

        navigate("/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      setSnackbarMessage("Error during logout. Please try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);

      navigate("/login");
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          overflow: "hidden",
          backgroundColor: "#0984e3",
          color: "white",
          borderRadius: "0 12.5px 12.5px 0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          paddingRight: 0.5,
          height: "100vh",
        },
      }}
    >
      {/* Sidebar Header */}
      <Box
        sx={{
          padding: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: isOpen ? "space-between" : "center",
          backgroundColor: "#0984e3",
        }}
      >
        <IconButton onClick={toggleSidebar} sx={{ color: "white" }}>
          <img src={logo} alt="Logo" style={{ width: 40, height: 40 }} />
        </IconButton>
        {isOpen && (
          <Typography
            sx={{
              fontSize: "1.1rem",
              marginLeft: "15px",
              fontWeight: "bold",
              color: "white",
              textAlign: "center",
            }}
          >
            Anna University Library
          </Typography>
        )}
      </Box>

      <Divider sx={{ borderColor: "#fff" }} />

      {/* Navigation List */}
      <List>
        {NAVIGATION.map((item) => (
          <ListItem
            key={item.segment}
            onClick={() => onSelectItem(item.segment)}
            sx={{
              backgroundColor:
                selected === item.segment ? "#74b9ff" : "inherit",
              "&:hover": { backgroundColor: "#74b9ff" },
              cursor: "pointer",
            }}
          >
            <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
            {isOpen && <ListItemText primary={item.title} />}
          </ListItem>
        ))}
      </List>

      {/* Logout Button at the Bottom */}
      <Box sx={{ marginTop: "auto", paddingBottom: 2 }}>
        <Divider sx={{ borderColor: "#fff" }} />
        <ListItem
          onClick={onLogout}
          sx={{
            backgroundColor: "inherit",
            "&:hover": { backgroundColor: "red" },
            cursor: "pointer",
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <ExitToAppIcon />
          </ListItemIcon>
          {isOpen && <ListItemText primary="Logout" />}
        </ListItem>
      </Box>

      {/* Snackbar for success or error messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Drawer>
  );
};

export default Sidebar;
