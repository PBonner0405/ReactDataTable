import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTable, usePagination } from "react-table";
import GlobalFilter from "./Filters/Filters";
import PaginationActions from "./PaginationActions/PaginationActions";
import {
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableFooter,
  TablePagination,
  Button,
  Icon
} from "@material-ui/core";
import Axios from "axios";

function getTableData(
  url,
  table,
  page,
  pageSize,
  sorted,
  filtered,
  columns,
  handleRetrievedData
) {
  let postObject = {
    _table: table,
    _start: page,
    _length: pageSize,
    _sort: sorted,
    _searchClause: filtered ? filtered : "",
    _columns: columns
  };
  try {
    const data = Axios.post(url, postObject);

    if (handleRetrievedData) {
      return data
        .then(response => handleRetrievedData(response))
        .catch(response => console.log(response));
    } else {
      return {};
    }
  } catch (error) {
    console.error(error);
  }
}

function DataTable({ columns, url, table, newButtonClick }) {
  // We'll start our table without any data
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [filterText, setfilterText] = useState("");
  const [sortColumn, setSortColumn] = useState({
    _column: "uniqueId",
    _direction: "asc"
  });
  const fetchIdRef = useRef(0);

  const tableInstance = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 }, // Pass our hoisted table state
      manualPagination: true, // Tell the usePagination
      // hook that we'll handle our own data fetching
      // This means we'll also have to provide our own
      // pageCount.
      pageCount: pageCount
    },
    usePagination
  );

  //FUNCTION TO FETCH DATA
  const fetchedData = useCallback(
    (pageSize, pageIndex) => {
      // Give this fetch an ID
      const fetchId = ++fetchIdRef.current;
      tableInstance.setPageSize(pageSize);

      // Set the loading state
      setLoading(true);
      if (fetchId === fetchIdRef.current) {
        //gets unique column data fields
        const fields = getDataTableFields(columns);
        //calls server for table data
        //Do YOUR FETCH FROM API ENDPOINT HERE
        const page = pageIndex * pageSize;
        getTableData(
          url,
          table,
          page,
          pageSize,
          sortColumn,
          filterText,
          fields,
          res => {
            let serverData = res.data.data;
            let totalRecords = res.data.recordsTotal;
            setTotalRecords(totalRecords);

            setData(serverData);

            // Your server could send back total page count.
            setPageCount(Math.ceil(totalRecords / pageSize));

            setLoading(false);
          }
        );
      }

      // We'll even set a delay to simulate a server here
    },
    [columns, filterText, sortColumn, tableInstance, url, table]
  );

  // FILTER
  const refetchFilteredData = filter => {
    if (filterText !== filter) {
      tableInstance.state.pageIndex = 0;
    }
    setfilterText(filter);
  };

  useEffect(() => {
    const index = tableInstance.state.pageIndex;
    const size = tableInstance.state.pageSize;
    fetchedData(size, index);
  }, [
    tableInstance.state.pageIndex,
    tableInstance.state.pageSize,
    fetchedData,
    filterText,
    sortColumn
  ]);

  //SORTING
  const sort = column => {
    if (column.Header !== "Actions") {
      const columnId = column.id;
      const newSort = { _column: columnId };

      if (columnId === sortColumn._column) {
        if (sortColumn._direction === "asc") {
          newSort._direction = "desc";
        } else {
          newSort._direction = "asc";
        }
      } else {
        newSort._direction = "asc";
      }
      setSortColumn(newSort);
    }
  };

  const getSortIcon = column => {
    if (column.Header !== "Actions")
      if (column.id === sortColumn._column) {
        if (sortColumn._direction === "asc") {
          return " 🔼";
        } else {
          return " 🔽";
        }
      } else {
        return "";
      }
  };

  //GET COLUMNS FOR FILTER
  function getDataTableFields(columnData) {
    let fields = columnData.map((val, index) => {
      return val.accessor;
    });
    return [...new Set(fields)];
  }

  const handleChangePage = (event, newPage) => {
    tableInstance.gotoPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    tableInstance.setPageSize(Number(event.target.value));
    tableInstance.gotoPage(0);
  };

  const getTableLoader = () => {
    return loading ? (
      <TableRow>
        <TableCell colSpan="10000">Loading...</TableCell>
      </TableRow>
    ) : null;
  };

  const getNewButton = () => {
    if (newButtonClick) {
      return (
        <Button
          variant="contained"
          style={{ float: "right" }}
          color="primary"
          id="btn-new"
          onClick={newButtonClick}
          startIcon={<Icon style={{ fontSize: 30 }}>add_circle</Icon>}
        >
          New
        </Button>
      );
    }
  };

  // Render the UI for your table
  return (
    <>
      <GlobalFilter refetchFilteredTable={refetchFilteredData} />
      {getNewButton()}
      <div>
        <Paper>
          <TableContainer>
            <Table
              stickyHeader
              aria-label="table"
              {...tableInstance.getTableProps()}
            >
              <TableHead>
                {tableInstance.headerGroups.map(headerGroup => (
                  <TableRow {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                      <TableCell
                        onClick={() => sort(column)}
                        {...column.getHeaderProps()}
                      >
                        {column.render("Header")}
                        <span>{getSortIcon(column)}</span>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody {...tableInstance.getTableBodyProps()}>
                {tableInstance.page.map((row, i) => {
                  tableInstance.prepareRow(row);
                  return (
                    <TableRow {...row.getRowProps()}>
                      {row.cells.map(cell => {
                        return (
                          <TableCell {...cell.getCellProps()}>
                            {cell.render("Cell")}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
                {getTableLoader()}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    colSpan={4}
                    count={totalRecords}
                    rowsPerPage={tableInstance.state.pageSize}
                    page={tableInstance.state.pageIndex}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                    onChangePage={handleChangePage}
                    ActionsComponent={PaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Paper>
      </div>
    </>
  );
}

export default DataTable;
