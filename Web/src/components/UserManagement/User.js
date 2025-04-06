import React, { useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import AddUser from "./AddUser";
import AddExcel from "./AddExcel";
import ManageUser from "./ManageUser";

function User() {
  const [activeComponent, setActiveComponent] = useState("AddUser");

  const renderComponent = () => {
    switch (activeComponent) {
      case "AddUser":
        return <AddUser />;
      case "AddExcel":
        return <AddExcel />;
      case "ManageUser":
        return <ManageUser />;
      default:
        return <AddUser />;
    }
  };

  return (
    <>
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
          variant={activeComponent === "AddExcel" ? "contained" : "outlined"}
          onClick={() => setActiveComponent("AddExcel")}
          sx={{
            backgroundColor:
              activeComponent === "AddExcel" ? "#0984e3" : "inherit",
            color: activeComponent === "AddExcel" ? "#fff" : "#0984e3",
          }}
        >
          Add Many
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

      <Box>{renderComponent()}</Box>
    </>
  );
}

export default User;
