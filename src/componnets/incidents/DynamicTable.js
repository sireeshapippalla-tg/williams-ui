import React, { useState } from 'react';
import { Search } from 'lucide-react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper, TextField, IconButton, CircularProgress
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
      // <div className="w-100">
      //   <div className="input-group mb-3">
      //     <span className="input-group-text">
      //       <Search className="text-secondary" />
      //     </span>
      //     <input
      //       type="text"
      //       placeholder="Search..."
      //       className="form-control"
      //       value={searchTerm}
      //       onChange={(e) => setSearchTerm(e.target.value)}
      //     />
      //   </div>
  
      //   <div className="table-responsive border rounded">
      //     <table className="table table-bordered table-hover" >
      //       <thead className="table-light">
      //         <tr>
      //           {columns.map((column, index) => (
      //             <th
      //               key={index}
      //               className="px-4 py-2 text-start text-secondary"
      //             >
      //               {column}
      //             </th>
      //           ))}
      //         </tr>
      //       </thead>
      //       <tbody>
      //         {filteredData.map((row, rowIndex) => (
      //           <tr key={rowIndex}>
      //             {columns.map((column, colIndex) => (
      //               <td key={colIndex} className="px-4 py-2 text-secondary">
      //                 {formatValue(row[column])}
      //               </td>
      //             ))}
      //           </tr>
      //         ))}
      //       </tbody>
      //     </table>
      //   </div>
  
      //   {filteredData.length === 0 && (
      //     <div className="text-center p-4 text-muted">
      //       No results found
      //     </div>
      //   )}
  
      //   <div className="mt-2 text-secondary">
      //     Showing {filteredData.length} of {data.length} entries
      //   </div>
      // </div>
      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
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
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
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
                    <TableCell key={colIndex} sx={{ color: '#6c757d' }}>
                      {formatValue(row[column])}
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