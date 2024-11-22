import React, { useState } from 'react';
import { Search } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper, TextField, Tooltip
} from '@mui/material';

const DynamicTable = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);


  if (!Array.isArray(data) || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '1rem', color: '#6c757d' }}>No data available</div>;
  }

  const columns = [...new Set(data.flatMap(item => Object.keys(item)))]
    .filter(column => !column.includes('ID') && column !== 'CreatedBy' && column !== 'AttachmentURL');

  const formatValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const filteredData = data.filter(row =>
    Object.entries(row)
      .filter(([key]) => columns.includes(key))
      .some(([_, value]) =>
        formatValue(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0)
  }

  return (
    <Paper elevation={3} sx={{ overflow: 'hidden' }} className='tbl table-responsive-container' >
      <div style={{ padding: '1rem' }}>
        <TextField
          variant="outlined"
          placeholder="Search..."
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'gray' }} />,
          }}
        />
      </div>
      <TableContainer className='tablescroll-mobile'
      //  sx={{ maxHeight: 400 }}
      >
        <Table stickyHeader sx={{ minWidth: 450 }}>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell key={index} sx={{ fontWeight: 'bold', color: '#6c757d' }}>{column}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex} sx={{
                    color: '#6c757d',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 150,
                  }}>
                    <Tooltip title={formatValue(row[column])} >
                      <span >{formatValue(row[column])}</span>
                    </Tooltip>
                    {/* {formatValue(row[column])} */}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 15]}
      />
    </Paper>
  );
};

export default DynamicTable;