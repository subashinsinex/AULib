import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  Button,
  CssBaseline,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Card,
  Stack,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Header from "../components/Header";
import secret from "../components/secret";

const LoginCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2.5),
  margin: "auto",
  borderRadius: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    maxWidth: "500px",
  },
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
  background: theme.palette.background.paper,
}));

const LoginContainer = styled(Stack)(({ theme }) => ({
  height: "100vh",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #74b9ff, #0984e3)",
  backgroundSize: "cover",
  backgroundPosition: "center",
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #74b9ff, #0984e3)",
  color: "#fff",
  fontWeight: 600,
  textTransform: "none",
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
  },
}));

const Login = () => {
  const [user_id, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const clearStorage = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("profile");
    setError("Session expired. Please log in again.");
  };

  const refreshAccessToken = useCallback(async (refreshToken) => {
    try {
      const decodedRefresh = jwtDecode(refreshToken);
      if (decodedRefresh.exp * 1000 < Date.now()) {
        console.log("Refresh token expired, clearing storage...");
        clearStorage();
        return;
      }

      const response = await axios.post(
        `http://${secret.Server_IP}:${secret.Server_Port}/userAuth/refresh`,
        { refreshToken }
      );

      const { accessToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      window.location.href = "/adminpanel";
    } catch (err) {
      console.error("Failed to refresh access token", err);
      clearStorage();
    }
  }, []);

  useEffect(() => {
    const checkTokens = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const profile = localStorage.getItem("profile");

      if (!accessToken || !refreshToken || !profile) return;

      try {
        const decodedAccess = jwtDecode(accessToken);
        if (decodedAccess.exp * 1000 > Date.now()) {
          window.location.href = "/adminpanel";
          return;
        }

        console.log("Access token expired, attempting refresh...");
        await refreshAccessToken(refreshToken);
      } catch (error) {
        console.error("Invalid access token format");
        clearStorage();
      }
    };

    checkTokens();
  }, [refreshAccessToken]);

  const handlePasswordToggle = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!user_id || !password) {
      setError("Please enter your AU ID and password");
      return;
    }
    try {
      const response = await axios.post(
        `http://${secret.Server_IP}:${secret.Server_Port}/userAuth/login`,
        { user_id, password, platform: "web" }
      );

      const { accessToken, refreshToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      const profileResponse = await axios.get(
        `http://${secret.Server_IP}:${secret.Server_Port}/profile/${user_id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      localStorage.setItem("profile", JSON.stringify(profileResponse.data));

      // Show success Snackbar before redirecting
      setSnackbarOpen(true);
      setTimeout(() => {
        window.location.href = "/adminpanel";
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          (err.request
            ? "Server unreachable. Check your network."
            : "Unexpected error occurred.")
      );
    }
  };

  return (
    <>
      <CssBaseline />
      <Header />
      <LoginContainer>
        <LoginCard variant="outlined">
          <Typography
            variant="h1"
            sx={{
              fontSize: "clamp(2rem, 10vw, 2.5rem)",
              fontWeight: 700,
              background: "linear-gradient(135deg, #74b9ff, #0984e3)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Login
          </Typography>
          <Typography component="p" color="text.secondary">
            Please enter your credentials to login.
          </Typography>
          {error && (
            <Typography
              color="error"
              variant="body2"
              textAlign="center"
              sx={{
                padding: "8px",
                border: "1px solid red",
                borderRadius: "8px",
                background: "rgba(255, 0, 0, 0.1)",
              }}
            >
              {error}
            </Typography>
          )}
          <Box
            component="form"
            onSubmit={handleLogin}
            noValidate
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <FormControl>
              <FormLabel htmlFor="userid">Username</FormLabel>
              <TextField
                id="userid"
                type="text"
                value={user_id}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your username"
                required
                fullWidth
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handlePasswordToggle}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>
            <GradientButton type="submit" fullWidth>
              Login
            </GradientButton>
          </Box>
        </LoginCard>
      </LoginContainer>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="success"
          sx={{ backgroundColor: "#4caf50", color: "#fff" }}
        >
          Successfully Logged In!
        </Alert>
      </Snackbar>
    </>
  );
};

export default Login;
