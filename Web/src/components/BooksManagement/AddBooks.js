import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import secret from "../secret";
import * as XLSX from "xlsx";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";

function AddExcel() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [errorFile, setErrorFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFile(file);
    setErrorFile(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  const downloadErrorFile = () => {
    if (errorFile) {
      const url = window.URL.createObjectURL(errorFile.blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", errorFile.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `http://${secret.Server_IP}:${secret.Server_Port}/admin/books/uploadExcelRes`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setProgress(percent);
          },
          responseType: "blob",
        }
      );

      const contentType = response.headers["content-type"];

      if (contentType.includes("application/json")) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const result = JSON.parse(reader.result);
            showSnackbar(
              result.message || "Users imported successfully!",
              "success"
            );
          } catch {
            showSnackbar("Unexpected JSON parse error", "error");
          }
        };
        reader.readAsText(response.data);
      } else if (
        contentType.includes(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
      ) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `resource_import_errors_${timestamp}.xlsx`;
        setErrorFile({
          blob: new Blob([response.data]),
          filename,
        });
        showSnackbar(
          "Some rows failed - download error file for details",
          "warning"
        );
      } else {
        showSnackbar("Unexpected response type from server", "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      if (error.response?.data) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const result = JSON.parse(reader.result);
            showSnackbar(result.error || "Failed to upload file", "error");
          } catch {
            showSnackbar("Failed to parse error response", "error");
          }
        };
        reader.readAsText(error.response.data);
      } else {
        showSnackbar("Failed to upload file", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const reset = () => {
    setFile(null);
    setData([]);
    setErrorFile(null);
  };

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: "2px dashed",
          borderRadius: 2,
          p: 6,
          textAlign: "center",
          cursor: "pointer",
          bgcolor: "background.paper",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <input {...getInputProps()} />
        <Typography>
          {file ? file.name : "Drag & drop Excel file here, or click to select"}
        </Typography>
      </Box>

      {data.length > 0 && (
        <>
          <Paper sx={{ mt: 3, maxHeight: 400, overflow: "auto" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {[
                    "title",
                    "publisher",
                    "resource_type",
                    "file_url",
                    "isbn",
                    "issn",
                  ].map((key) => (
                    <TableCell key={key} sx={{ fontWeight: "bold" }}>
                      {key}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i}>
                    {[
                      "title",
                      "publisher",
                      "resource_type",
                      "file_url",
                      "isbn",
                      "issn",
                    ].map((key) => (
                      <TableCell key={`${i}-${key}`}>
                        {row[key] === undefined || row[key] === null
                          ? ""
                          : String(row[key])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              onClick={uploadFile}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? `Uploading (${progress}%)` : "Upload"}
            </Button>

            {errorFile && (
              <Button
                variant="contained"
                color="error"
                onClick={downloadErrorFile}
              >
                Download Error File
              </Button>
            )}

            <Button variant="outlined" onClick={reset}>
              Reset
            </Button>
          </Box>
        </>
      )}

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
}

export default AddExcel;
