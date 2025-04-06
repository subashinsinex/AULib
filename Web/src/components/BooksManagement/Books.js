import React, { useState } from "react";
import { Box, Button, Stack } from "@mui/material";

function Books() {
  const [activeComponent, setActiveComponent] = useState("AddBooks");

  const renderComponent = () => {
    switch (activeComponent) {
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
          variant={activeComponent === "ManageUser" ? "contained" : "outlined"}
          onClick={() => setActiveComponent("ManageUser")}
          sx={{
            backgroundColor:
              activeComponent === "ManageUser" ? "#0984e3" : "inherit",
            color: activeComponent === "ManageUser" ? "#fff" : "#0984e3",
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
