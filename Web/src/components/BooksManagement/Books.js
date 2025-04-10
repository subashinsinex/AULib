import React, { useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import AddBooks from "./AddBooks";
import ManageBooks from "./ManageBooks";

function Books() {
  const [activeComponent, setActiveComponent] = useState("AddBooks");

  const renderComponent = () => {
    switch (activeComponent) {
      case "AddBooks":
        return <AddBooks />;
      case "ManageBooks":
        return <ManageBooks />;
      default:
        return <AddBooks />;
    }
  };

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ marginBottom: 1.5 }}>
        <Button
          variant={activeComponent === "AddBooks" ? "contained" : "outlined"}
          onClick={() => setActiveComponent("AddBooks")}
          sx={{
            backgroundColor:
              activeComponent === "AddBooks" ? "#0984e3" : "inherit",
            color: activeComponent === "AddBooks" ? "#fff" : "#0984e3",
          }}
        >
          Add Books
        </Button>
        <Button
          variant={activeComponent === "ManageBooks" ? "contained" : "outlined"}
          onClick={() => setActiveComponent("ManageBooks")}
          sx={{
            backgroundColor:
              activeComponent === "ManageBooks" ? "#0984e3" : "inherit",
            color: activeComponent === "ManageBooks" ? "#fff" : "#0984e3",
          }}
        >
          Manage Books
        </Button>
      </Stack>

      <Box>{renderComponent()}</Box>
    </>
  );
}

export default Books;
