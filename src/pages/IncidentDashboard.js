// import React, { useState } from 'react';
// import { MessageCircle, Send, Code2, Lightbulb, Search } from 'lucide-react';
// import {
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper, TextField, IconButton, CircularProgress
// } from '@mui/material';
// import axios from 'axios';
// import { addDashboardWithAI, getSuggestions } from '../api';

// const SuggestionCard = ({ suggestion, onClick }) => (
//   <div
//     onClick={onClick}
//     className="d-flex align-items-center gap-2 p-2 bg-white border border-secondary rounded shadow-sm cursor-pointer transition-all"
//   >
//     <Lightbulb className="me-2 text-primary" />
//     <span className="text-muted">
//       {suggestion}
//     </span>
//   </div>
// );

// const DynamicTable = ({ data }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);


//   if (!Array.isArray(data) || data.length === 0) {
//     return <div style={{ textAlign: 'center', padding: '1rem', color: '#6c757d' }}>No data available</div>;
//   }

//   const columns = [...new Set(data.flatMap(item => Object.keys(item)))]
//     .filter(column => !column.includes('ID') && column !== 'CreatedBy' && column !== 'AttachmentURL');

//   const formatValue = (value) => {
//     if (value === null || value === undefined) return '-';
//     if (typeof value === 'object') return JSON.stringify(value);
//     return String(value);
//   };

//   const filteredData = data.filter(row =>
//     Object.entries(row)
//       .filter(([key]) => columns.includes(key))
//       .some(([_, value]) =>
//         formatValue(value).toLowerCase().includes(searchTerm.toLowerCase())
//       )
//   );

//   const handlePageChange = (event, newPage) => {
//     setPage(newPage)
//   }

//   const handleRowsPerPageChange = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0)
//   }

//   return (
//     // <div className="w-100">
//     //   <div className="input-group mb-3">
//     //     <span className="input-group-text">
//     //       <Search className="text-secondary" />
//     //     </span>
//     //     <input
//     //       type="text"
//     //       placeholder="Search..."
//     //       className="form-control"
//     //       value={searchTerm}
//     //       onChange={(e) => setSearchTerm(e.target.value)}
//     //     />
//     //   </div>

//     //   <div className="table-responsive border rounded">
//     //     <table className="table table-bordered table-hover" >
//     //       <thead className="table-light">
//     //         <tr>
//     //           {columns.map((column, index) => (
//     //             <th
//     //               key={index}
//     //               className="px-4 py-2 text-start text-secondary"
//     //             >
//     //               {column}
//     //             </th>
//     //           ))}
//     //         </tr>
//     //       </thead>
//     //       <tbody>
//     //         {filteredData.map((row, rowIndex) => (
//     //           <tr key={rowIndex}>
//     //             {columns.map((column, colIndex) => (
//     //               <td key={colIndex} className="px-4 py-2 text-secondary">
//     //                 {formatValue(row[column])}
//     //               </td>
//     //             ))}
//     //           </tr>
//     //         ))}
//     //       </tbody>
//     //     </table>
//     //   </div>

//     //   {filteredData.length === 0 && (
//     //     <div className="text-center p-4 text-muted">
//     //       No results found
//     //     </div>
//     //   )}

//     //   <div className="mt-2 text-secondary">
//     //     Showing {filteredData.length} of {data.length} entries
//     //   </div>
//     // </div>
//     <Paper elevation={3} sx={{ overflow: 'hidden' }}>
//       <div style={{ padding: '1rem' }}>
//         <TextField
//           variant="outlined"
//           placeholder="Search..."
//           size="small"
//           fullWidth
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           InputProps={{
//             startAdornment: <Search sx={{ mr: 1, color: 'gray' }} />,
//           }}
//         />
//       </div>
//       <TableContainer sx={{ maxHeight: 400 }}>
//         <Table stickyHeader>
//           <TableHead>
//             <TableRow>
//               {columns.map((column, index) => (
//                 <TableCell key={index} sx={{ fontWeight: 'bold', color: '#6c757d' }}>{column}</TableCell>
//               ))}
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, rowIndex) => (
//               <TableRow key={rowIndex}>
//                 {columns.map((column, colIndex) => (
//                   <TableCell key={colIndex} sx={{ color: '#6c757d' }}>
//                     {formatValue(row[column])}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//       <TablePagination
//         component="div"
//         count={filteredData.length}
//         page={page}
//         onPageChange={handlePageChange}
//         rowsPerPage={rowsPerPage}
//         onRowsPerPageChange={handleRowsPerPageChange}
//         rowsPerPageOptions={[5, 10, 15]}
//       />
//     </Paper>
//   );
// };


// // const DynamicTable = ({ data }) => {
// //   const [searchTerm, setSearchTerm] = useState('');

// //   if (!Array.isArray(data) || data.length === 0) {
// //     return (
// //       <div className="text-center py-4 text-muted">
// //         No data available
// //       </div>
// //     );
// //   }

// //   const columns = [...new Set(data.flatMap(item => Object.keys(item)))]
// //     .filter(column => !column.includes('ID') && column !== 'CreatedBy' && column !== 'AttachmentURL');

// //   const formatValue = (value) => {
// //     if (value === null || value === undefined) return '-';
// //     if (typeof value === 'object') return JSON.stringify(value);
// //     return String(value);
// //   };

// //   const filteredData = data.filter(row => 
// //     Object.entries(row)
// //       .filter(([key]) => columns.includes(key))
// //       .some(([_, value]) => 
// //         formatValue(value).toLowerCase().includes(searchTerm.toLowerCase())
// //       )
// //   );

// //   return (
// //     <div className="w-100">
// //       <div className="input-group mb-3">
// //         <span className="input-group-text">
// //           <Search className="text-secondary" />
// //         </span>
// //         <input
// //           type="text"
// //           placeholder="Search..."
// //           className="form-control"
// //           value={searchTerm}
// //           onChange={(e) => setSearchTerm(e.target.value)}
// //         />
// //       </div>

// //       <div className="table-responsive border rounded">
// //         <table className="table table-bordered table-hover">
// //           <thead className="table-light">
// //             <tr>
// //               {columns.map((column, index) => (
// //                 <th 
// //                   key={index} 
// //                   className="px-4 py-2 text-start text-secondary"
// //                 >
// //                   {column}
// //                 </th>
// //               ))}
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {filteredData.map((row, rowIndex) => (
// //               <tr key={rowIndex}>
// //                 {columns.map((column, colIndex) => (
// //                   <td key={colIndex} className="px-4 py-2 text-secondary">
// //                     {formatValue(row[column])}
// //                   </td>
// //                 ))}
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>

// //       {filteredData.length === 0 && (
// //         <div className="text-center p-4 text-muted">
// //           No results found
// //         </div>
// //       )}

// //       <div className="mt-2 text-secondary">
// //         Showing {filteredData.length} of {data.length} entries
// //       </div>
// //     </div>
// //   );
// // };

// const IncidentDashboard = () => {
//   const [prompt, setPrompt] = useState('');
//   const [jsonData, setJsonData] = useState(null);
//   const [suggestions, setSuggestions] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [messages, setMessages] = useState([
//     { type: 'bot', content: "Hi! I'm your AI assistant." },
//   ]);

//   const handleInputChange = (event) => setPrompt(event.target.value);

//   const handleSubmit = async () => {
//     if (!prompt.trim()) return;

//     setIsLoading(true);
//     setMessages((prev) => [...prev, { type: 'user', content: prompt }]);

//     try {
//       const response = await axios.post(addDashboardWithAI,
//         { userPrompt: prompt },
//         { headers: { 'Content-Type': 'application/json' } }
//       );

//       const data = response.data;
//       setJsonData(data);
//       console.log(jsonData)
//       setMessages((prev) => [
//         ...prev,
//         { type: 'bot', content: "I've processed your data and generated a table view." },
//       ]);

//       try {
//         const suggestionResponse = await axios.post(getSuggestions,
//           { userPrompt: prompt },
//           { headers: { 'Content-Type': 'application/json' } }
//         );

//         const suggestionData = JSON.parse(suggestionResponse.data[0]);
//         setSuggestions(suggestionData.suggestions);
//         console.log(suggestions)
//       } catch (suggestionError) {
//         console.error("Error fetching suggestions:", suggestionError);
//       }

//     } catch (error) {
//       console.error("Error fetching data:", error);
//       setMessages((prev) => [
//         ...prev,
//         { type: 'bot', content: "Sorry, I encountered an error while fetching the data. Please try again." },
//       ]);
//     } finally {
//       setIsLoading(false);
//       setPrompt('');
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSubmit();
//     }
//   };


//   return (
//     // <div style={{minHeight:"100vh"}}>
//     <div className="row g-4 " style={{ height:"85vh", overflowY: 'auto' }}>
//       <div className="col-lg-5" 
//       // style={{ minHeight: '100%' }}
//       >
//         <div className="card shadow-sm d-flex flex-column h-100" style={{ height: '100%' }}>
//           {/* Card Header */}
//           <div className="card-header d-flex align-items-center gap-2">
//             <MessageCircle className="text-primary" />
//             <h2 className="mb-0">AI Assistant</h2>
//           </div>

//           {/* Card Body (Messages Area) */}
//           <div className="card-body flex-grow-1 overflow-auto">
//             {messages.map((message, index) => (
//               <div key={index} className={`d-flex ${message.type === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
//                 <div className={`p-2 rounded ${message.type === 'user' ? 'bg-primary text-white' : 'bg-light text-dark'}`}>
//                   {message.content}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Card Footer */}
//           <div className="card-footer">
//             {suggestions.length > 0 && (
//               <div className="mb-3">
//                 {suggestions.map((suggestion, index) => (
//                   <SuggestionCard key={index} suggestion={suggestion} onClick={() => setPrompt(suggestion)} />
//                 ))}
//               </div>
//             )}

//             <div className="input-group mt-2">
//               <input
//                 type="text"
//                 value={prompt}
//                 onChange={handleInputChange}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Enter your query..."
//                 className="form-control"
//               />
//               <button
//                 onClick={handleSubmit}
//                 disabled={isLoading}
//                 className="btn btn-primary"
//               >
//                 {isLoading ? (
//                   <span className="spinner-border spinner-border-sm"></span>
//                 ) : (
//                   <Send />
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="col-lg-7">
//         <div className="card shadow-sm d-flex flex-column h-100">
//           <div className="card-header d-flex align-items-center gap-2">
//             <Code2 className="text-secondary" />
//             <span>Generated Response</span>
//           </div>
//           <div className="card-body">
//             {jsonData ? (
//               <DynamicTable data={Array.isArray(jsonData) ? jsonData : [jsonData]} />
//             ) : (
//               <div className="text-center text-muted py-4">
//                 Your response will appear here
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//     // </div>
//   );
// }

// export default IncidentDashboard;



import React, { useState } from 'react';
import { MessageCircle, Send, Code2, History, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip, Typography } from "@mui/material";
// import SuggestionCard from '../componnets/SugestionCard';
import DynamicTable from '../componnets/incidents/DynamicTable';
import SendIcon from '@mui/icons-material/Send';
import fevicon from '../assets/images/fevicon.png'

import { addDashboardWithAI } from '../api';

const HistoryItem = ({ item, onLoad }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    // <div className="border rounded-lg overflow-hidden hover:border-blue-500 transition-colors">
    //   <div
    //     className="p-4 bg-gray-50 border-b cursor-pointer flex items-start gap-2"
    //     onClick={() => setIsExpanded(!isExpanded)}
    //   >
    //     {isExpanded ? (
    //       <ChevronDown className="w-5 h-5 mt-1 text-gray-500 flex-shrink-0" />
    //     ) : (
    //       <ChevronRight className="w-5 h-5 mt-1 text-gray-500 flex-shrink-0" />
    //     )}
    //     <div className="flex-grow">
    //       <div className="flex justify-between items-center mb-2">
    //         <span className="text-sm text-gray-500">{item.timestamp}</span>
    //         {/* <button
    //           onClick={(e) => {
    //             e.stopPropagation();
    //             onLoad(item);
    //           }}
    //           className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
    //         >
    //           Load Query
    //         </button> */}
    //       </div>
    //       <div className="font-medium">Query: {item.prompt}</div>
    //     </div>
    //   </div>
    //   {isExpanded && (
    //     <div className="p-4 border-t max-h-[300px] overflow-auto">
    //       {item.tableData ? (
    //         <DynamicTable data={Array.isArray(item.tableData) ? item.tableData : [item.tableData]} />
    //       ) : (
    //         <p className="text-gray-500">No data available for this query</p>
    //       )}
    //     </div>
    //   )}
    // </div>
    <div className="border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="p-4 bg-light cursor-pointer flex items-start gap-3"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          backgroundColor: "#f9fafb",
          borderBottom: "1px solid #e0e0e0",
          flexWrap: "wrap", 
        }}
      >
        {isExpanded ? (
          <ChevronDown style={{ fontSize: 20, color: "#616161", 
            float: "right"
            // marginLeft: "auto"
           }} />
        ) : (
          <ChevronRight style={{ fontSize: 20, color: "#616161", 
            float: "right" 
            // marginLeft: "auto"
          }}
            
             />
        )}
        <div className="flex-grow">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <Typography variant="caption" color="textSecondary"  className="text-truncate">
              {item.timestamp}
            </Typography>
            {/* <Button
              variant="outlined"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onLoad(item);
              }}
              style={{
                borderColor: "#1976d2",
                color: "#1976d2",
                fontSize: "0.75rem",
                padding: "2px 8px",
              }}
            >
              Load Query
            </Button> */}
          </div>
          <Typography variant="subtitle2" color="textPrimary" fontWeight="medium"   className="truncate">
            Query: {item.prompt}
          </Typography>
        </div>
      </div>
      {isExpanded && (
        <div className="p-3 border-top" style={{ backgroundColor: "#ffffff", maxHeight: 300, overflowY: "auto",  wordWrap: "break-word", }}>
          {item.tableData ? (
            <DynamicTable data={Array.isArray(item.tableData) ? item.tableData : [item.tableData]} />
          ) : (
            <Typography variant="body2" color="textSecondary">
              No data available for this query
            </Typography>
          )}
        </div>
      )}
    </div>
  );
};

const IncidentDashboard = () => {
  const [prompt, setPrompt] = useState('');
  const [jsonData, setJsonData] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([
    { type: 'bot', content: "Hi! I'm your AI assistant." },
  ]);

  const [showDialog, setShowDialog] = useState(false);

  const handleInputChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { type: 'user', content: prompt }]);

    try {
      const response = await fetch(addDashboardWithAI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userPrompt: prompt })
      });

      const data = await response.json();
      setJsonData(data);

      // Add to history
      const historyItem = {
        timestamp: new Date().toLocaleString(),
        prompt: prompt,
        tableData: data
      };
      setHistory(prev => [historyItem, ...prev]);

      setMessages((prev) => [
        ...prev,
        { type: 'bot', content: "I've processed your data and generated a table view." },
      ]);

      setShowDialog(false)

      // try {
      //   const suggestionResponse = await fetch('http://3.27.226.110:8084/iassure/api/incident/getSuggestions', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify({ userPrompt: prompt })
      //   });

      //   const suggestionData = await suggestionResponse.json();
      //   const parsedSuggestions = JSON.parse(suggestionData[0]);
      //   setSuggestions(parsedSuggestions.suggestions);
      // } catch (suggestionError) {
      //   console.error("Error fetching suggestions:", suggestionError);
      // }

    } catch (error) {
      console.error("Error fetching data:", error);
      setMessages((prev) => [
        ...prev,
        { type: 'bot', content: "Sorry, I encountered an error while fetching the data. Please try again." },
      ]);
      // setShowDialog(false)
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  const loadHistoryItem = (item) => {
    setJsonData(item.tableData);
    setPrompt(item.prompt);
    setShowHistory(false);
  };


  return (

    <div className="bg-light py-4" style={{ overflow: "hidden" }}>
      <div className="container-lg py-4" style={{ minHeight: "77vh" }}>
        <div className="row g-4">
          {/* Button to Open AI Assistant Dialog */}
          <div className="col-12" style={{ display: "flex", justifyContent: "space-between" }}>
            <Tooltip title="Hi! I'm your AI assistant." arrow placement="top">
              <Button onClick={() => setShowDialog(true)}>
                <img src={fevicon} alt="AI Assistant Icon" style={{ width: "40px", height: "40px", marginRight: "8px" }} />
              </Button>
            </Tooltip>
            <Button type="button" onClick={() => setShowHistory(true)}>
              <History />
            </Button>
          </div>

          {/* Full Width Generated Response Section */}
          <div className="col-12">
            <div className="card shadow-sm h-100">
              <div className="card-header d-flex align-items-center gap-2 p-3" style={{ color: "white", backgroundColor: "#7d4f3d" }}>
                <i className="bi bi-code-slash text-secondary"></i>
                <span className="fw-medium">Generated Response</span>
              </div>
              <div className="card-body" style={{ overflowY: "auto", maxHeight: "500px" }}>
                {jsonData ? (
                  <DynamicTable data={Array.isArray(jsonData) ? jsonData : [jsonData]} />
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100 text-secondary">
                    Your response will appear here
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} fullWidth maxWidth="md">
        <DialogTitle className="d-flex align-items-center justify-content-between dialog_head">
          <span>AI Assistant</span>

        </DialogTitle>
        <DialogContent dividers className='dialog_content'>
          {/* Chat Messages Section */}
          <div className="overflow-auto" style={{ maxHeight: "400px" }}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`d-flex ${message.type === "user" ? "justify-content-end" : "justify-content-start"} mb-3`}
              >
                <div
                  className={'p-3 rounded'}
                  style={{
                    backgroundColor: message.type === "user" ? "#533529" : 'transparent',
                    color: message.type === "user" ? '#fff' : '#533529'
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          {/* Suggestions Section */}

          {/* {suggestions.length > 0 && (
            <div className="mb-3">
              {suggestions.map((suggestion, index) => (
                <Button key={index} variant="outlined" fullWidth onClick={() => setPrompt(suggestion)}>
                  {suggestion}
                </Button>
              ))}
            </div>
          )} */}

          {/* Input Section */}
          <div className="position-relative mt-3">
            <input
              type="text"
              value={prompt}
              onChange={handleInputChange}
              placeholder="Enter your query..."
              className="form-control pe-5"
            />
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="position-absolute end-0 top-50 translate-middle-y btn accordian_cancel_btn me-2"
            >
              {isLoading ? <span className="spinner-border spinner-border-sm" /> : <SendIcon />}
            </Button>
          </div>
        </DialogContent>
        <DialogActions className='dialog_content'>
          <Button onClick={() => setShowDialog(false)} color="primary" className=' accordian_cancel_btn'>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Modal */}

      <Dialog open={showHistory} onClose={() => setShowHistory(false)} fullWidth maxWidth="md">
        <DialogTitle className='dialog_head'>
          Query History
        </DialogTitle>
        <DialogContent dividers className='dialog_content'>
          {history.length === 0 ? (
            <p className="text-center text-muted">No history yet</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {history.map((item, index) => (
                <HistoryItem
                  key={index}
                  item={item}
                  onLoad={loadHistoryItem}
                />
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions className='dialog_content'>
          <Button onClick={() => setShowHistory(false)} className=' accordian_cancel_btn'>
            Close
          </Button>
        </DialogActions>
      </Dialog>


    </div>
  );
};

export default IncidentDashboard;
