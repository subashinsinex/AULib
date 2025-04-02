import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import axios from "axios";
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
} from "@mui/material";

function AddCsv() {
  const [csvData, setCsvData] = useState([]);
  const [errorCsv, setErrorCsv] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result;
        Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setCsvData(result.data);
            setErrorCsv([]);
            setErrorMessage("");
            setSuccessMessage("");
            setShowErrorMessage(false);
            setShowSuccessMessage(false);
          },
          error: () => {
            setErrorMessage("Error reading CSV file.");
            setShowErrorMessage(true);
          },
        });
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
  });

  const verifyData = () => {
    const errors = [];
    const validData = [];
    const seen = new Set();

    csvData.forEach((row) => {
      if (!row.name || !row.password) {
        errors.push({ row, error: "Missing name or password" });
      } else if (seen.has(row.name)) {
        errors.push({ row, error: "Duplicate username" });
      } else if (row.name.length > 255 || row.password.length > 255) {
        errors.push({ row, error: "Name or password exceeds length limit" });
      } else {
        validData.push(row);
        seen.add(row.name);
      }
    });

    if (errors.length > 0) {
      setErrorCsv(errors);
      setErrorMessage("Some rows have errors. Please download the error CSV.");
      setShowErrorMessage(true);
    } else {
      setSuccessMessage("Data is valid and ready for upload.");
      setShowSuccessMessage(true);
    }

    return validData;
  };

  const uploadCsv = async () => {
    const validData = verifyData();
    if (validData.length === 0) return;

    try {
      await axios.post("http://localhost:5000/uploadCsv", { data: validData });
      setSuccessMessage("CSV data uploaded successfully!");
      setShowSuccessMessage(true);
    } catch {
      setErrorMessage("Failed to upload CSV data.");
      setShowErrorMessage(true);
    }
  };

  const downloadErrorCsv = () => {
    if (!errorCsv.length) return;

    const header = ["name", "password", "error"];
    const rows = errorCsv.map((e) => [e.row.name, e.row.password, e.error]);
    const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "error_data.csv";
    link.click();
  };

  const clearData = () => {
    setCsvData([]);
    setErrorCsv([]);
    setErrorMessage("");
    setSuccessMessage("");
    setShowErrorMessage(false);
    setShowSuccessMessage(false);
  };

  return (
    <Box>
      {csvData.length === 0 && (
        <Box
          {...getRootProps()}
          sx={{
            border: "2px dashed #ccc",
            borderRadius: "8px",
            padding: "20px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: "#f8f9fa",
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <input {...getInputProps()} />
          <Typography variant="body1">
            Drag and drop a CSV file here, or click to select one
          </Typography>
        </Box>
      )}

      {csvData.length > 0 && (
        <Box mt={3}>
          <Typography variant="h6">CSV Data Preview:</Typography>
          <Paper sx={{ maxHeight: 300, overflowY: "scroll", mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  {Object.keys(csvData[0]).map((key) => (
                    <TableCell key={key}>{key}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {csvData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Object.values(row).map((value, colIndex) => (
                      <TableCell key={colIndex}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={uploadCsv}
              sx={{ mr: 2 }}
            >
              Upload to Database
            </Button>
            {errorCsv.length > 0 && (
              <Button
                variant="contained"
                color="secondary"
                onClick={downloadErrorCsv}
              >
                Download Error CSV
              </Button>
            )}
          </Box>
        </Box>
      )}

      {showErrorMessage && (
        <Box
          mt={3}
          sx={{
            backgroundColor: "#f8d7da",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <Typography variant="body2" color="error">
            {errorMessage}
          </Typography>
        </Box>
      )}

      {showSuccessMessage && (
        <Box
          mt={3}
          sx={{
            backgroundColor: "#d4edda",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <Typography variant="body2" color="success">
            {successMessage}
          </Typography>
        </Box>
      )}

      <Box mt={3}>
        <Button variant="contained" color="error" onClick={clearData}>
          Clear Data
        </Button>
      </Box>
    </Box>
  );
}

export default AddCsv;
