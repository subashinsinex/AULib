import React, { useEffect, useState, useMemo } from "react";
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
  Snackbar,
  Alert,
} from "@mui/material";
import styled from "@emotion/styled";
import axios from "axios";
import secret from "../secret";
import {
  Book,
  ImportContacts,
  Search,
  LibraryBooks,
  Category,
} from "@mui/icons-material";

const BookCard = styled(Card)(({ resourceType }) => ({
  width: "280px",
  height: "145px",
  borderRadius: "8px",
  margin: "8px",
  padding: "12px",
  transition: "all 0.3s ease",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  borderLeft: `4px solid ${resourceType === "ebook" ? "#4caf50" : "#2196f3"}`,
  display: "flex",
  flexDirection: "column",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
}));

const TitleText = styled(Typography)({
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  lineHeight: "1.2rem",
  maxHeight: "2.4rem", // 2 lines
});

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

const ManageBooks = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [publisherFilter, setPublisherFilter] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Memoized unique publishers and types for filters
  const { uniquePublishers, uniqueTypes } = useMemo(() => {
    const publishers = [
      ...new Set(resources.map((res) => res.publisher_name)),
    ].filter(Boolean);
    const types = [
      ...new Set(resources.map((res) => res.resource_type)),
    ].filter(Boolean);
    return { uniquePublishers: publishers, uniqueTypes: types };
  }, [resources]);

  // Fetch all necessary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("accessToken");

        // Fetch all data in parallel
        const [publishersResponse, typesResponse, resourcesResponse] =
          await Promise.all([
            axios.get(
              `http://${secret.Server_IP}:${secret.Server_Port}/admin/books/publishers`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            axios.get(
              `http://${secret.Server_IP}:${secret.Server_Port}/admin/books/resource-types`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            axios.get(
              `http://${secret.Server_IP}:${secret.Server_Port}/admin/books/resources-all`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
          ]);

        // Transform the data
        const transformedData = resourcesResponse.data.map((resource) => {
          const publisher = publishersResponse.data.find(
            (p) => p.pub_id === resource.pub_id
          );
          const resourceType = typesResponse.data.find(
            (t) => t.res_type_id === resource.res_type_id
          );

          return {
            ...resource,
            publisher_name: publisher ? publisher.publish_name : "Unknown",
            resource_type: resourceType ? resourceType.type_name : "Unknown",
            identifier: resource.isbn
              ? `ISBN: ${resource.isbn}`
              : resource.issn
                ? `ISSN: ${resource.issn}`
                : "No identifier",
          };
        });

        setResources(transformedData);
        setFilteredResources(transformedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        showSnackbar("Failed to fetch resources", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...resources];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (res) =>
          res.title.toLowerCase().includes(term) ||
          (res.isbn && res.isbn.toLowerCase().includes(term)) ||
          (res.issn && res.issn.toLowerCase().includes(term)) ||
          res.res_id.toString().includes(term) ||
          (res.publisher_name &&
            res.publisher_name.toLowerCase().includes(term)) ||
          (res.resource_type && res.resource_type.toLowerCase().includes(term))
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((res) => res.resource_type === typeFilter);
    }

    // Apply publisher filter
    if (publisherFilter !== "all") {
      result = result.filter((res) => res.publisher_name === publisherFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "publisher":
          comparison = (a.publisher_name || "").localeCompare(
            b.publisher_name || ""
          );
          break;
        case "type":
          comparison = (a.resource_type || "").localeCompare(
            b.resource_type || ""
          );
          break;
        case "id":
          comparison = a.res_id - b.res_id;
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredResources(result);
  }, [resources, searchTerm, typeFilter, publisherFilter, sortBy, sortOrder]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
  };

  const handlePublisherFilterChange = (e) => {
    setPublisherFilter(e.target.value);
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

  return (
    <Box>
      <ActionBar>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by title, ISBN/ISSN, or publisher..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />,
          }}
          sx={{ minWidth: 400 }}
        />

        <FilterSection>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Resource Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={handleTypeFilterChange}
              label="Resource Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              {uniqueTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Publisher</InputLabel>
            <Select
              value={publisherFilter}
              onChange={handlePublisherFilterChange}
              label="Publisher"
            >
              <MenuItem value="all">All Publishers</MenuItem>
              {uniquePublishers.map((publisher) => (
                <MenuItem key={publisher} value={publisher}>
                  {publisher}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Sort by Title">
              <IconButton
                size="medium"
                onClick={() => handleSortChange("title")}
                color={sortBy === "title" ? "primary" : "default"}
              >
                <Book
                  sx={{
                    transform:
                      sortBy === "title" && sortOrder === "desc"
                        ? "rotate(180deg)"
                        : "none",
                  }}
                />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  Title
                </Typography>
              </IconButton>
            </Tooltip>

            <Tooltip title="Sort by Publisher">
              <IconButton
                size="medium"
                onClick={() => handleSortChange("publisher")}
                color={sortBy === "publisher" ? "primary" : "default"}
              >
                <LibraryBooks
                  sx={{
                    transform:
                      sortBy === "publisher" && sortOrder === "desc"
                        ? "rotate(180deg)"
                        : "none",
                  }}
                />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  Publisher
                </Typography>
              </IconButton>
            </Tooltip>

            <Tooltip title="Sort by Type">
              <IconButton
                size="medium"
                onClick={() => handleSortChange("type")}
                color={sortBy === "type" ? "primary" : "default"}
              >
                <Category
                  sx={{
                    transform:
                      sortBy === "type" && sortOrder === "desc"
                        ? "rotate(180deg)"
                        : "none",
                  }}
                />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  Type
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
          minHeight: "200px",
          position: "relative",
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              width: "100%",
              textAlign: "center",
              p: 4,
              color: "text.secondary",
            }}
          >
            <Typography variant="h6">Loading resources...</Typography>
          </Box>
        ) : filteredResources.length > 0 ? (
          filteredResources.map((resource) => {
            const isEbook = resource.resource_type === "eBook";

            return (
              <BookCard
                key={resource.res_id}
                resourceType={isEbook ? "ebook" : "eJournal"}
              >
                {/* Header Row */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Box sx={{ width: "calc(100% - 60px)" }}>
                    <TitleText variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {resource.title}
                    </TitleText>
                    <Typography variant="caption" color="textSecondary">
                      ID: {resource.res_id}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Chip
                      label={resource.resource_type}
                      size="small"
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        bgcolor: isEbook ? "#e8f5e9" : "#e3f2fd",
                        color: isEbook ? "#4caf50" : "#2196f3",
                      }}
                    />
                  </Box>
                </Box>

                {/* Compact Grid Layout */}
                <Grid container spacing={1}>
                  {/* Publisher */}
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <LibraryBooks
                        fontSize="small"
                        sx={{ mr: 1, color: "action.active" }}
                      />
                      <Typography variant="body2" noWrap>
                        {resource.publisher_name || "Unknown publisher"}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* ISBN/ISSN */}
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ImportContacts
                        fontSize="small"
                        sx={{ mr: 1, color: "action.active" }}
                      />
                      <Typography variant="body2" noWrap>
                        {resource.identifier}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* File URL */}
                  {resource.file_url && (
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <ImportContacts
                          fontSize="small"
                          sx={{ mr: 1, color: "action.active" }}
                        />
                        <Typography variant="body2" noWrap>
                          <a
                            href={resource.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#1976d2", textDecoration: "none" }}
                          >
                            View Resource
                          </a>
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </BookCard>
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
            <Typography variant="h6">No resources found</Typography>
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

export default ManageBooks;
