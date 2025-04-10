import React, { useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import UsersOverview from "./UsersOverview";
import EResourceReport from "./EResourceReport";

function Report() {
  const [activeComponent, setActiveComponent] = useState("UsersOverview");

  const renderComponent = () => {
    switch (activeComponent) {
      case "UsersOverview":
        return <UsersOverview />;
      case "EresourceReport":
        return <EResourceReport />;
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
          onClick={() => setActiveComponent("UsersOverview")}
          sx={{
            backgroundColor:
              activeComponent === "UsersOverview" ? "#0984e3" : "inherit",
            color: activeComponent === "UsersOverview" ? "#fff" : "#0984e3",
          }}
        >
          Users Overview
        </Button>
        <Button
          variant={
            activeComponent === "EresourceReport" ? "contained" : "outlined"
          }
          onClick={() => setActiveComponent("EresourceReport")}
          sx={{
            backgroundColor:
              activeComponent === "EresourceReport" ? "#0984e3" : "inherit",
            color: activeComponent === "EresourceReport" ? "#fff" : "#0984e3",
          }}
        >
          Eresource Overview
        </Button>
      </Stack>

      <Box>{renderComponent()}</Box>
    </>
  );
}

export default Report;
