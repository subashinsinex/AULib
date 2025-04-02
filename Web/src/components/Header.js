import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import logo from "../assets/images/logo.png";

const Header = () => {
  const theme = useTheme();

  return (
    <AppBar
      position="absolute"
      sx={{
        backgroundColor: "#ffffff",
        color: "#2c3e50",
        boxShadow: "0 7px 5px rgba(0,0,0,0.1)",
        paddingTop: "15px",
        paddingBottom: "10px",
      }}
    >
      <Toolbar>
        <Box>
          <Typography
            variant="h4"
            sx={{
              display: "flex",
              alignItems: "center",
              fontWeight: 700,
              color: theme.palette.primary.main,
              fontSize: "clamp(20px, 0vw, 20px)", // Matches Sidebar
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{ width: 50, height: 50, marginRight: 10 }} // Matches Sidebar
            />
            Anna University
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
