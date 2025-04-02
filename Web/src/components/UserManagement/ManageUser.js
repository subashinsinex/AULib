import React, { useEffect, useState } from "react";
import { Card, Typography, Chip, Box, Grid } from "@mui/material";
import styled from "@emotion/styled";
import axios from "axios";
import secret from "../secret";
import {
  Email,
  Phone,
  School,
  Class,
  Grade,
  CalendarToday,
} from "@mui/icons-material";

const CompactUserCard = styled(Card)(({ category }) => ({
  width: "240px",
  height: "110px",
  borderRadius: "8px",
  margin: "8px",
  padding: "12px",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  borderLeft: `4px solid ${
    category === "admin"
      ? "#ff5252"
      : category === "student"
        ? "#4caf50"
        : "#2196f3"
  }`,
  display: "flex",
  flexDirection: "column",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
}));

const DetailRow = styled("div")({
  display: "flex",
  alignItems: "center",
  marginBottom: "4px",
  "& svg": {
    marginRight: "8px",
    fontSize: "16px",
    color: "#5c6bc0",
    flexShrink: 0,
  },
  "& .MuiTypography-root": {
    fontSize: "0.8rem",
    lineHeight: 1.2,
  },
});

const AcademicGrid = styled(Grid)({
  "& .MuiGrid-item": {
    display: "flex",
    alignItems: "center",
  },
  "& svg": {
    marginRight: "4px",
    fontSize: "16px",
    color: "#5c6bc0",
  },
});

const ManageUser = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          `http://${secret.Server_IP}:${secret.Server_Port}/admin/users/getUsers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        alignContent: "space-between",
        p: 1,
        overflow: "auto",
        maxHeight: "calc(100vh - 64px)",
      }}
    >
      {users.map((user) => (
        <CompactUserCard key={user.user_id} category={user.category_name}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, lineHeight: 1.2 }}
            >
              {user.name}
            </Typography>
            <Chip
              label={user.category_name}
              size="small"
              sx={{
                height: "20px",
                fontSize: "0.65rem",
                fontWeight: 600,
                bgcolor:
                  user.category_name === "admin"
                    ? "#ffebee"
                    : user.category_name === "student"
                      ? "#e8f5e9"
                      : "#e3f2fd",
                color:
                  user.category_name === "admin"
                    ? "#ff5252"
                    : user.category_name === "student"
                      ? "#4caf50"
                      : "#2196f3",
              }}
            />
          </Box>

          <DetailRow>
            <Email fontSize="inherit" />
            <Typography noWrap title={user.email}>
              {user.email}
            </Typography>
          </DetailRow>

          <DetailRow>
            <Phone fontSize="inherit" />
            <Typography>{user.mobile}</Typography>
          </DetailRow>

          {(user.college_name ||
            user.department_name ||
            user.degree_name ||
            user.batch_in) && (
            <AcademicGrid container spacing={0}>
              {user.college_name && (
                <Grid item xs={6}>
                  <School fontSize="inherit" />
                  <Typography variant="caption">{user.college_name}</Typography>
                </Grid>
              )}

              {user.department_name && (
                <Grid item xs={6}>
                  <Class fontSize="inherit" />
                  <Typography variant="caption">
                    {user.department_name}
                  </Typography>
                </Grid>
              )}

              {user.degree_name && (
                <Grid item xs={6}>
                  <Grade fontSize="inherit" />
                  <Typography variant="caption">{user.degree_name}</Typography>
                </Grid>
              )}

              {user.batch_in && user.batch_out && (
                <Grid item xs={6}>
                  <CalendarToday fontSize="inherit" />
                  <Typography variant="caption">
                    {user.batch_in}-{user.batch_out}
                  </Typography>
                </Grid>
              )}
            </AcademicGrid>
          )}
        </CompactUserCard>
      ))}
    </Box>
  );
};

export default ManageUser;
