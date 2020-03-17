import React, { useEffect, useState } from "react";
import { TextField } from "@material-ui/core";

// Define a default UI for filtering
const GlobalFilter = props => {
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    props.refetchFilteredTable(filterText);
  }, [props, filterText]);

  return (
    <form noValidate autoComplete="off">
      <TextField
        label="Search"
        onChange={e => {
          setFilterText(e.target.value);
        }}
      />
    </form>
  );
};

export default GlobalFilter;
