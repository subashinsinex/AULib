import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Chip,
  Box,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
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
  Search,
  Sort,
  Edit,
  Save,
  Close,
  ToggleOn,
  ToggleOff,
  Person,
} from "@mui/icons-material";

const UserCard = styled(Card)(({ category, expanded, editing }) => ({
  width: "240px",
  height: expanded === "true" || editing === "true" ? "auto" : "120px",
  borderRadius: "8px",
  margin: "8px",
  padding: "12px",
  transition: "all 0.3s ease",
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

const ActionBar = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#f7f9fc",
  borderRadius: "8px",
  marginBottom: "16px",
  flexWrap: "wrap",
  gap: "12px",
});

const FilterSection = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
});

const EditableField = ({
  value,
  onChange,
  disabled,
  placeholder,
  fullWidth = true,
}) => {
  return (
    <TextField
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      variant="standard"
      size="small"
      fullWidth={fullWidth}
      placeholder={placeholder}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      sx={{
        "& .MuiInputBase-input": {
          fontSize: "0.8rem",
          padding: "2px 0",
        },
        "& .Mui-disabled": {
          color: "inherit",
          WebkitTextFillColor: "inherit",
        },
      }}
    />
  );
};

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandedCard, setExpandedCard] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [batchOutYears, setBatchOutYears] = useState([]);

  const currentYear = new Date().getFullYear();
  const batchInYears = Array.from(
    { length: 11 },
    (_, i) => currentYear - 5 + i
  );

  // Get unique batches for filter
  const uniqueBatches = [
    ...new Set(
      users
        .filter((user) => user.batch_in)
        .map((user) =>
          user.batch_out
            ? `${user.batch_in}-${user.batch_out}`
            : `${user.batch_in}-`
        )
    ),
  ].sort((a, b) => {
    const aYear = parseInt(a.split("-")[0]) || 0;
    const bYear = parseInt(b.split("-")[0]) || 0;
    return bYear - aYear;
  });

  // Fetch users
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
        setFilteredUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        showSnackbar("Failed to fetch users", "error");
      }
    };

    fetchUsers();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...users];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.mobile.toLowerCase().includes(term) ||
          user.user_id.toString().includes(term) ||
          (user.college_name &&
            user.college_name.toLowerCase().includes(term)) ||
          (user.department_name &&
            user.department_name.toLowerCase().includes(term))
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((user) => user.category_name === categoryFilter);
    }

    // Apply batch filter
    if (batchFilter !== "all") {
      const [filterBatchIn, filterBatchOut] = batchFilter.split("-");
      result = result.filter((user) => {
        const userBatchIn = String(user.batch_in || "");
        const userBatchOut = String(user.batch_out || "");
        if (filterBatchIn && filterBatchOut) {
          return (
            userBatchIn === filterBatchIn && userBatchOut === filterBatchOut
          );
        } else if (filterBatchIn) {
          return userBatchIn === filterBatchIn;
        }
        return false;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "user_id":
          comparison = a.user_id - b.user_id;
          break;
        case "category":
          comparison = a.category_name.localeCompare(b.category_name);
          break;
        case "batch":
          const aBatchIn = String(a.batch_in || "");
          const bBatchIn = String(b.batch_in || "");
          comparison = aBatchIn.localeCompare(bBatchIn);
          if (comparison === 0) {
            const aBatchOut = String(a.batch_out || "");
            const bBatchOut = String(b.batch_out || "");
            comparison = aBatchOut.localeCompare(bBatchOut);
          }
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredUsers(result);
  }, [users, searchTerm, categoryFilter, batchFilter, sortBy, sortOrder]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const handleBatchFilterChange = (e) => {
    setBatchFilter(e.target.value);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCardClick = (userId) => {
    if (editingUser !== null) return;
    setExpandedCard(expandedCard === userId ? null : userId);
  };

  const handleEditClick = (user, e) => {
    e.stopPropagation();
    setEditingUser(user.user_id);
    setEditedData({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      college_id: user.college_id || "",
      department_id: user.department_id || "",
      degree_id: user.degree_id || "",
      branch_id: user.branch_id || "",
      batch_in: user.batch_in || "",
      batch_out: user.batch_out || "",
      college_name: user.college_name || "",
      department_name: user.department_name || "",
      degree_name: user.degree_name || "",
      branch_name: user.branch_name || "",
      category_name: user.category_name || "",
    });

    if (user.batch_in) {
      const startYear = parseInt(user.batch_in, 10);
      setBatchOutYears(Array.from({ length: 5 }, (_, i) => startYear + i + 1));
    } else {
      setBatchOutYears([]);
    }
  };

  const handleCancelEdit = (e) => {
    e?.stopPropagation();
    setEditingUser(null);
    setEditedData({});
    setBatchOutYears([]);
  };

  const handleFieldChange = (field, value) => {
    setEditedData({ ...editedData, [field]: value });

    if (field === "batch_in") {
      const startYear = parseInt(value, 10);
      setBatchOutYears(Array.from({ length: 5 }, (_, i) => startYear + i + 1));
      setEditedData((prev) => ({ ...prev, batch_out: "" }));
    }
  };

  const handleSaveChanges = async (e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("accessToken");

      const updateData = {
        name: editedData.name,
        email: editedData.email,
        mobile: editedData.mobile,
        user_cat_id: editedData.user_cat_id || null,
        college_id: editedData.college_id
          ? Number(editedData.college_id)
          : null,
        department_id: editedData.department_id
          ? Number(editedData.department_id)
          : null,
        degree_id: editedData.degree_id ? Number(editedData.degree_id) : null,
        branch_id: editedData.branch_id ? Number(editedData.branch_id) : null,
        batch_in: editedData.batch_in || null,
        batch_out: editedData.batch_out || null,
      };

      await axios.put(
        `http://${secret.Server_IP}:${secret.Server_Port}/admin/users/updateUser/${editingUser}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const refreshResponse = await axios.get(
        `http://${secret.Server_IP}:${secret.Server_Port}/admin/users/getUsers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(refreshResponse.data);

      setEditingUser(null);
      setEditedData({});
      setBatchOutYears([]);
      showSnackbar("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      showSnackbar("Failed to update user", "error");
    }
  };

  const handleToggleStatus = async (user, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("accessToken");
      const newStatus = !user.is_active;
      await axios.put(
        `http://${secret.Server_IP}:${secret.Server_Port}/admin/users/toggleUserStatus/${user.user_id}`,
        { is_active: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers(
        users.map((u) =>
          u.user_id === user.user_id ? { ...u, is_active: newStatus } : u
        )
      );
      showSnackbar(`User ${newStatus ? "enabled" : "disabled"} successfully`);
    } catch (error) {
      console.error("Error toggling user status:", error);
      showSnackbar("Failed to toggle user status", "error");
    }
  };

  return (
    <Box>
      <ActionBar>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by name, email, or ID..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />,
          }}
          sx={{ minWidth: 400 }}
        />

        <FilterSection>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
              label="Category"
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="faculty">Faculty</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Batch</InputLabel>
            <Select
              value={batchFilter}
              onChange={handleBatchFilterChange}
              label="Batch"
            >
              <MenuItem value="all">All Batches</MenuItem>
              {uniqueBatches.map((batch) => (
                <MenuItem key={batch} value={batch}>
                  {batch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Sort by Name">
              <IconButton
                size="medium"
                onClick={() => handleSortChange("name")}
                color={sortBy === "name" ? "primary" : "default"}
              >
                <Sort
                  sx={{
                    transform:
                      sortBy === "name" && sortOrder === "desc"
                        ? "rotate(180deg)"
                        : "none",
                  }}
                />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  Name
                </Typography>
              </IconButton>
            </Tooltip>

            <Tooltip title="Sort by ID">
              <IconButton
                size="medium"
                onClick={() => handleSortChange("user_id")}
                color={sortBy === "user_id" ? "primary" : "default"}
              >
                <Person
                  sx={{
                    transform:
                      sortBy === "user_id" && sortOrder === "desc"
                        ? "rotate(180deg)"
                        : "none",
                  }}
                />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  ID
                </Typography>
              </IconButton>
            </Tooltip>

            <Tooltip title="Sort by Batch">
              <IconButton
                size="medium"
                onClick={() => handleSortChange("batch")}
                color={sortBy === "batch" ? "primary" : "default"}
              >
                <CalendarToday
                  sx={{
                    transform:
                      sortBy === "batch" && sortOrder === "desc"
                        ? "rotate(180deg)"
                        : "none",
                  }}
                />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  Batch
                </Typography>
              </IconButton>
            </Tooltip>
          </Box>
        </FilterSection>
      </ActionBar>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-start",
          overflow: "auto",
          flex: 1,
          paddingBottom: "32px",
        }}
      >
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const isEditing = editingUser === user.user_id;
            const isExpanded = expandedCard === user.user_id || isEditing;

            return (
              <UserCard
                key={user.user_id}
                category={user.category_name}
                expanded={(
                  expandedCard === user.user_id || isEditing
                ).toString()}
                editing={isEditing.toString()}
                onClick={() => !isEditing && handleCardClick(user.user_id)}
                sx={{
                  opacity: user.is_active ? 1 : 0.5,
                  backgroundColor: user.is_active ? "" : "#f5f5f5",
                }}
              >
                {/* Header Row */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    {isEditing ? (
                      <EditableField
                        value={editedData.name}
                        onChange={(e) =>
                          handleFieldChange("name", e.target.value)
                        }
                        placeholder="Full Name"
                      />
                    ) : (
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {user.user_id}
                        </Typography>
                      </>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={user.category_name}
                      size="small"
                      sx={{
                        fontSize: "0.7rem",
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
                    <Tooltip
                      title={user.is_active ? "Disable user" : "Enable user"}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => handleToggleStatus(user, e)}
                        color={user.is_active ? "success" : "error"}
                        sx={{ p: 0 }}
                      >
                        {user.is_active ? <ToggleOn /> : <ToggleOff />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Compact Grid Layout */}
                <Grid container spacing={1}>
                  {/* Email */}
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Email
                        fontSize="small"
                        sx={{ mr: 1, color: "action.active" }}
                      />
                      {isEditing ? (
                        <EditableField
                          value={editedData.email}
                          onChange={(e) =>
                            handleFieldChange("email", e.target.value)
                          }
                          placeholder="Email"
                        />
                      ) : (
                        <Typography variant="body2" noWrap>
                          {user.email}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  {/* Phone */}
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Phone
                        fontSize="small"
                        sx={{ mr: 1, color: "action.active" }}
                      />
                      {isEditing ? (
                        <EditableField
                          value={editedData.mobile}
                          onChange={(e) =>
                            handleFieldChange("mobile", e.target.value)
                          }
                          placeholder="Phone"
                        />
                      ) : (
                        <Typography variant="body2">
                          {user.mobile || "Not provided"}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  {/* College */}
                  {(user.college_name || isEditing) && (
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <School
                          fontSize="small"
                          sx={{ mr: 1, color: "action.active" }}
                        />
                        {isEditing ? (
                          <FormControl
                            fullWidth
                            size="small"
                            variant="standard"
                          >
                            <InputLabel>College</InputLabel>
                            <Select
                              value={editedData.college_id || ""}
                              onChange={(e) =>
                                handleFieldChange("college_id", e.target.value)
                              }
                              label="College"
                            >
                              <MenuItem value="1">CEG</MenuItem>
                              <MenuItem value="2">MIT</MenuItem>
                              <MenuItem value="">None</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography variant="body2">
                            {user.college_name}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  )}

                  {/* Department */}
                  {(user.department_name || isEditing) && (
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Class
                          fontSize="small"
                          sx={{ mr: 1, color: "action.active" }}
                        />
                        {isEditing ? (
                          <FormControl
                            fullWidth
                            size="small"
                            variant="standard"
                          >
                            <InputLabel>Department</InputLabel>
                            <Select
                              value={editedData.department_id || ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  "department_id",
                                  e.target.value
                                )
                              }
                              label="Department"
                            >
                              <MenuItem value="1">IST</MenuItem>
                              <MenuItem value="2">CSE</MenuItem>
                              <MenuItem value="">None</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography variant="body2">
                            {user.department_name}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  )}

                  {/* Degree and Branch */}
                  {(user.degree_name || isEditing) && (
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Grade
                          fontSize="small"
                          sx={{ mr: 1, color: "action.active" }}
                        />
                        {isEditing ? (
                          <FormControl
                            fullWidth
                            size="small"
                            variant="standard"
                          >
                            <InputLabel>Degree</InputLabel>
                            <Select
                              value={editedData.degree_id || ""}
                              onChange={(e) =>
                                handleFieldChange("degree_id", e.target.value)
                              }
                              label="Degree"
                            >
                              <MenuItem value="1">MCA</MenuItem>
                              <MenuItem value="2">MSc</MenuItem>
                              <MenuItem value="">None</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography variant="body2">
                            {user.degree_name}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  )}
                  {(user.branch_name || isEditing) && (
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Class
                          fontSize="small"
                          sx={{ mr: 1, color: "action.active" }}
                        />
                        {isEditing ? (
                          <FormControl
                            fullWidth
                            size="small"
                            variant="standard"
                          >
                            <InputLabel>Branch</InputLabel>
                            <Select
                              value={editedData.branch_id || ""}
                              onChange={(e) =>
                                handleFieldChange("branch_id", e.target.value)
                              }
                              label="Branch"
                            >
                              <MenuItem value="1">
                                Computer Application
                              </MenuItem>
                              <MenuItem value="2">Computer Science</MenuItem>
                              <MenuItem value="">None</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <>
                            <Typography variant="body2">
                              {user.branch_name}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Grid>
                  )}

                  {/* Batch */}
                  {(user.batch_in || user.batch_out || isEditing) && (
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CalendarToday
                          fontSize="small"
                          sx={{ mr: 1, color: "action.active" }}
                        />
                        {isEditing ? (
                          <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                            <FormControl
                              fullWidth
                              size="small"
                              variant="standard"
                            >
                              <InputLabel>Batch In</InputLabel>
                              <Select
                                value={editedData.batch_in || ""}
                                onChange={(e) =>
                                  handleFieldChange("batch_in", e.target.value)
                                }
                                label="Batch In"
                              >
                                <MenuItem value="">None</MenuItem>
                                {batchInYears.map((year) => (
                                  <MenuItem key={year} value={year}>
                                    {year}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Typography>-</Typography>
                            <FormControl
                              fullWidth
                              size="small"
                              variant="standard"
                            >
                              <InputLabel>Batch Out</InputLabel>
                              <Select
                                value={editedData.batch_out || ""}
                                onChange={(e) =>
                                  handleFieldChange("batch_out", e.target.value)
                                }
                                label="Batch Out"
                                disabled={!editedData.batch_in}
                              >
                                <MenuItem value="">None</MenuItem>
                                {batchOutYears.map((year) => (
                                  <MenuItem key={year} value={year}>
                                    {year}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>
                        ) : (
                          <Typography variant="body2">
                            {user.batch_in || "N/A"}-{user.batch_out || "N/A"}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  )}
                </Grid>

                {/* Action Buttons */}
                {isExpanded && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mt: 1,
                      gap: 1,
                    }}
                  >
                    {isEditing ? (
                      <>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Close />}
                          onClick={(e) => handleCancelEdit(e)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Save />}
                          onClick={(e) => handleSaveChanges(e)}
                          disabled={
                            !editedData.name ||
                            !editedData.email ||
                            (user.category_name === "student" &&
                              (!editedData.college_id ||
                                !editedData.department_id))
                          }
                        >
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Edit />}
                        onClick={(e) => handleEditClick(user, e)}
                      >
                        Edit
                      </Button>
                    )}
                  </Box>
                )}
              </UserCard>
            );
          })
        ) : (
          <Box
            sx={{
              width: "100%",
              textAlign: "center",
              p: 4,
              color: "text.secondary",
            }}
          >
            <Typography variant="h6">No users found</Typography>
            <Typography variant="body2">
              Try adjusting your search or filter criteria
            </Typography>
          </Box>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageUser;
