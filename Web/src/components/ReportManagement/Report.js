import React, { useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import UsersOverview from "./UsersOverview";

function Report() {
  const [activeComponent, setActiveComponent] = useState("AddBooks");

  const renderComponent = () => {
    switch (activeComponent) {
      case "UsersOverview":
        return <UsersOverview />;
      default:
        return <UsersOverview />;
    }
  };

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ marginBottom: 1.5 }}>
        <Button
          variant={
            activeComponent === "UsersOverview" ? "contained" : "outlined"
          }
          onClick={() => setActiveComponent("AddBooks")}
          sx={{
            backgroundColor:
              activeComponent === "UsersOverview" ? "#0984e3" : "inherit",
            color: activeComponent === "UsersOverview" ? "#fff" : "#0984e3",
          }}
        >
          Users Overview
        </Button>
      </Stack>

      <Box>{renderComponent()}</Box>
    </>
  );
}

export default Report;
