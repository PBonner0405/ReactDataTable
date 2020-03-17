import React from "react";
import DataTable from "./Datatable/DataTable";

const App = () => {
  const getTableData = "Your URL here";
  const table = "WHATEVER";
  const columns = [
    {
      Header: "Minimal Data Table",
      accessor: "dataTable",
      sortType: "basic"
    }
  ];

  const newUser = () => {
    // Create A New User
  };

  return (
    <DataTable
      columns={columns}
      url={getTableData}
      table={table}
      newButtonClick={newUser}
    />
  );
};

export default App;
