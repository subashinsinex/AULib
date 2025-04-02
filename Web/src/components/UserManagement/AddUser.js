import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import secret from "../secret";

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    user_cat_id: "",
    user_id: "",
    college_id: "",
    department_id: "",
    degree_id: "",
    branch_id: "",
    batch_in: "",
    batch_out: "",
  });

  const [batchOutYears, setBatchOutYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "batch_in") {
      const startYear = parseInt(value, 10);
      setBatchOutYears(Array.from({ length: 5 }, (_, i) => startYear + i + 1));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://${secret.Server_IP}:${secret.Server_Port}/admin/users/add`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      setSuccessMessage(response.data.message);
      handleClear();
    } catch (error) {
      setError(error.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      name: "",
      email: "",
      mobile: "",
      user_cat_id: "",
      user_id: "",
      college_id: "",
      department_id: "",
      degree_id: "",
      branch_id: "",
      batch_in: "",
      batch_out: "",
    });
    setBatchOutYears([]);
  };

  const currentYear = new Date().getFullYear();
  const batchInYears = Array.from(
    { length: 11 },
    (_, i) => currentYear - 5 + i
  );

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: "#0984e3" }}>
              User Details
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="User ID"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="User Category"
              name="user_cat_id"
              value={formData.user_cat_id}
              onChange={handleChange}
              required
            >
              <MenuItem value="1">Admin</MenuItem>
              <MenuItem value="2">Faculty</MenuItem>
              <MenuItem value="3">Student</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="College"
              name="college_id"
              value={formData.college_id}
              onChange={handleChange}
            >
              <MenuItem value="1">CEG</MenuItem>
              <MenuItem value="2">MIT</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Department"
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
            >
              <MenuItem value="1">IST</MenuItem>
              <MenuItem value="2">CSE</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Degree"
              name="degree_id"
              value={formData.degree_id}
              onChange={handleChange}
            >
              <MenuItem value="1">MCA</MenuItem>
              <MenuItem value="2">MSc</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Branch"
              name="branch_id"
              value={formData.branch_id}
              onChange={handleChange}
            >
              <MenuItem value="1">Computer Application</MenuItem>
              <MenuItem value="2">Computer Science</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Batch In"
              name="batch_in"
              value={formData.batch_in}
              onChange={handleChange}
            >
              {batchInYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Batch Out"
              name="batch_out"
              value={formData.batch_out}
              onChange={handleChange}
              disabled={!formData.batch_in} // Disabled until batch_in is selected
            >
              {batchOutYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Box mt={3} display="flex" justifyContent="center" gap={2}>
          <Button
            type="button"
            variant="contained"
            sx={{
              backgroundColor: "#ff2400",
              "&:hover": { backgroundColor: "#c70039" },
            }}
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: "#0984e3",
              "&:hover": { backgroundColor: "#74b9ff" },
            }}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      </form>

      <Snackbar
        open={error !== null}
        message={error}
        onClose={() => setError(null)}
        autoHideDuration={6000}
      />

      <Snackbar
        open={successMessage !== ""}
        message={successMessage}
        onClose={() => setSuccessMessage("")}
        autoHideDuration={6000}
      />
    </>
  );
};

export default AddUser;
