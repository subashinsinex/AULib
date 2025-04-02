import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Body from "../components/Body";

const AdminPanelContainer = styled(Box)(() => ({
  display: "flex",
  width: "100%",
  height: "100vh",
  margin: 0,
  padding: 0,
  overflow: "hidden",
}));

const MainContent = styled(Box)(({ sidebarWidth }) => ({
  flexGrow: 1,
  overflowY: "auto",
  marginLeft: sidebarWidth,
}));

const AdminPanel = () => {
  const [selectedComponent, setSelectedComponent] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const checkLocalStorageKeys = (...keys) => {
    return keys.every((key) => localStorage.getItem(key));
  };

  useEffect(() => {
    if (!checkLocalStorageKeys("profile", "accessToken", "refreshToken")) {
      // Redirect to login if any of the required keys are missing
      navigate("/login");
    } else {
      const profile = JSON.parse(localStorage.getItem("profile"));
      const userId = profile ? profile.user_id : null;
      if (!userId) {
        // If userId is not found in profile, redirect to login
        navigate("/login");
      }
    }
  }, [navigate]);

  return (
    <AdminPanelContainer>
      <Sidebar
        onSelectItem={setSelectedComponent}
        selected={selectedComponent}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />
      <MainContent>
        <Body component={selectedComponent} />
      </MainContent>
    </AdminPanelContainer>
  );
};

export default AdminPanel;
