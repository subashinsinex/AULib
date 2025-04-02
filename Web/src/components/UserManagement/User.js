import React, { useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import AddUser from "./AddUser"; // Import AddUser component
import AddCSV from "./AddCsv"; // Import AddCSV component
import ManageUser from "./ManageUser"; // Import ManageUser component

function User() {
  const [activeComponent, setActiveComponent] = useState("AddUser");

  const renderComponent = () => {
    switch (activeComponent) {
      case "AddUser":
        return <AddUser />;
      case "AddCSV":
        return <AddCSV />;
      case "ManageUser":
        return <ManageUser />;
      default:
        return <AddUser />;
    }
  };

  return (
    <>
      {/* Button switcher */}
      <Stack direction="row" spacing={2} sx={{ marginBottom: 1.5 }}>
        <Button
          variant={activeComponent === "AddUser" ? "contained" : "outlined"}
          onClick={() => setActiveComponent("AddUser")}
          sx={{
            backgroundColor:
              activeComponent === "AddUser" ? "#0984e3" : "inherit",
            color: activeComponent === "AddUser" ? "#fff" : "#0984e3",
          }}
        >
          Add User
        </Button>
        <Button
          variant={activeComponent === "AddCSV" ? "contained" : "outlined"}
          onClick={() => setActiveComponent("AddCSV")}
          sx={{
            backgroundColor:
              activeComponent === "AddCSV" ? "#0984e3" : "inherit",
            color: activeComponent === "AddCSV" ? "#fff" : "#0984e3",
          }}
        >
          Add CSV
        </Button>
        <Button
          variant={activeComponent === "ManageUser" ? "contained" : "outlined"}
          onClick={() => setActiveComponent("ManageUser")}
          sx={{
            backgroundColor:
              activeComponent === "ManageUser" ? "#0984e3" : "inherit",
            color: activeComponent === "ManageUser" ? "#fff" : "#0984e3",
          }}
        >
          Manage User
        </Button>
      </Stack>

      {/* Render the selected component */}

      <Box>{renderComponent()}</Box>
    </>
  );
}

export default User;
