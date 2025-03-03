import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Link, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import BuildIcon from '@mui/icons-material/Build';
import { styled } from '@mui/material/styles';
import { TextField, InputAdornment } from '@mui/material';
import axios from 'axios';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { BASE_API_URL } from "../../api"
import { Dialog, DialogTitle, DialogContent, DialogActions, Menu, MenuItem } from '@mui/material';
import AiPrompt from '../../componnets/incidents/AiPrompt';





const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#0000000a',
  },
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.background.default,
  },
  // Add any other styles you want for the rows here
}));


const StyledStatusTableCell = styled(TableCell)(({ theme, status }) => ({
  color: status === 'closed' ? 'green' : 'red',
}));

const StyledStatusText = styled('span')(({ theme, status }) => ({
  backgroundColor: status === 'closed' ? '#d7f9e8' : '#f9d7d7',
  padding: '4px 8px',
  borderRadius: '8px',
}));


const columns = [
  {
    id: 'id',
    label: 'Incident id',
  },
  {
    id: 'subject',
    label: 'Subject',
  },
  {
    id: 'orgName',
    label: 'Organization name',
  },
  {
    id: 'category',
    label: 'Category',
  },
  {
    id: 'severity',
    label: 'Severity',
  },
  {
    id: 'created',
    label: 'Created On',

  },
  {
    id: 'status',
    label: 'Status',
    align: 'center',

  },
  {
    id: 'action',
    label: 'Action',

  }
];

function createData(id, subject, orgName, category, severity, created, status, action) {

  return { id, subject, orgName, category, severity, created, status, action };
}
const getStatusColor = (status) => {
  return status === 'open' ? 'green' : 'red';
};
const Incident = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [num, setNum] = React.useState('');
  const [rows, setRows] = React.useState([]);
  const [incidentCount, setIncidentCount] = useState()
  const [isLoading, setIsLoading] = useState(true);
  const [inputs, setInputs] = useState({
    Severity: { value: null, options: [] },
    Status: { value: null, options: ["Pending", "Approved", "Returned"] },
  });

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [value, setValue] = useState([null, null]);
  const [aiPromptOpen, setAiPromptOpen] = useState(false)
  const [prompt, setPromt] = useState()

  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleAiPrompt = () => {
    setAiPromptOpen(true)
    handleClose();
  };
  const handleWithoutAiPrompt = () => {
    navigate('/incident/create')
    handleClose();
  };
  const handeClickAiPromptDialog = () => {
    setAiPromptOpen(!aiPromptOpen)
  }
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchClick = () => {
    // Implement your search logic here
    console.log("Search clicked with query: ", searchQuery);
  };
  useEffect(() => {
    fetchDropdowns();

    const fetchIncidentDetails = async () => {
      try {
        const response = await axios.post(BASE_API_URL + 'incident/fetchIncidentDetailsDashboard', {
          orgId: 1,
          incidentStatusId: 34,
          userId: 1
        });
        const incidentData = response.data.dashboardList;



        const formattedData = incidentData.map(incident =>
          createData(
            incident.incidentId,
            incident.subject,
            incident.organizationName,
            incident.category,
            incident.severity,
            incident.createdOn,
            incident.status,
            <BuildIcon />
          )
        );
        setRows(formattedData);
      } catch (error) {
        console.error('Error fetching incident Details:', error);
      } finally {
        setIsLoading(false);
      }

    };

    fetchIncidentDetails();
    getIncidentCountDetails();
  }, []);

  const fetchDropdownData = async (sourceName) => {
    try {
      const response = await axios.post(BASE_API_URL + 'incident/getMastersListByType', { sourceName });
      console.log('dropresponse', response)
      return response.data.masterList.map(item => ({ id: item.sourceId, title: item.sourceType }));

    } catch (error) {
      console.error(`Error fetching data for ${sourceName}:`, error);
      return [];
    }
  };


  const fetchDropdowns = async () => {
    try {
      const severityData = await fetchDropdownData("Incident Severity");

      setInputs(prevState => ({
        ...prevState,
        Severity: { ...prevState.Severity, options: severityData },
      }));
      console.log("inputs", inputs);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const getIncidentCountDetails = async () => {
    try {
      const response = await axios.post(BASE_API_URL + 'incident/getIncidentCountDetails', {
        "orgId": 1,
        "userId": 1
      });
      const count = response.data.incidentCount;
      setIncidentCount(count);
    } catch (error) {
      console.error('Error fetching incident count:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const handleChange = (name) => async (event, newValue) => {
    console.log(`handleChange called for ${name} with newValue:`, newValue);  // Debug log
    let id;
    if (newValue && newValue.id) {
      id = newValue.id;
      setInputs(prevState => ({
        ...prevState,
        [name]: {
          ...prevState[name],
          value: newValue,
          sourceId: id
        }
      }));
    } else if (newValue && newValue.inputValue) {
      try {
        const payload = {
          sourceName: "Incident " + name,
          sourceType: newValue.inputValue
        };
        console.log('Payload:', payload);
        const response = await axios.post(BASE_API_URL + "incident/addMasterByType", payload);

        if (response && response.data && response.data.masterSource && response.data.masterSource.sourceId) {
          id = response.data.masterSource.sourceId;
          const newOption = { title: newValue.inputValue, id: id };
          console.log('New Option:', newOption);

          setInputs(prevState => ({
            ...prevState,
            [name]: {
              ...prevState[name],
              value: newOption,
              options: [...prevState[name].options],
            }
          }));

          // setMessage("Option added successfully!");
          // setSeverity('success');
          // setOpen(true);
        } else {
          // setMessage("Failed to add option: ID not returned.");
          // setSeverity('error');
          // setOpen(true);
        }
      } catch (error) {
        console.error("Error adding new option:", error);
        // setMessage("Failed to add option.");
        // setSeverity('error');
        // setOpen(true);
      }
    } else {
      id = newValue ? newValue.sourceId : null;
      setInputs(prevState => ({
        ...prevState,
        [name]: {
          ...prevState[name],
          value: newValue,
          sourceId: id
        }
      }));
    }
    console.log(`Updated ${name} State:`, inputs[name]);  // Debug log
  };

  // const handleChange = (event, newValue) => {
  //   setSelectSeverity(newValue)
  // }




  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const createincidenthandler = () => {
    navigate('/incident/create')
  }


  const clickHandlerresolve = (id) => {
    navigate(`/incident/details/${id}`)
  }
  return (

    <div className='border-0'>
      <div className='row' style={{ marginBottom: "15px" }}>
        <div className='col-md-6 route-head incident_mbl'>
          <h3 className='mb-0'>Incidents</h3>
          <div>
            <Link href="#">Home</Link> <span> / Incidents</span>

          </div>
        </div>
        {/* <div className='col-md-6 btn_incident_create incident_mbl' style={{ float: "right" }}>
          <Button className='me-2 '

            onClick={handeClickAiPromptDialog}
          >
            Add New Incident &nbsp; <span><AddIcon /></span></Button>
        </div> */}
        <div className='col-md-6 btn_incident_create incident_mbl' style={{ float: "right" }}>
          <Button
            className='me-2'
            aria-controls={open ? 'add-incident-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            Add New Incident &nbsp; <AddIcon />
          </Button>
          <Menu
            className='mt-1 brown-menu'
            id="add-incident-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'add-incident-button',
            }}
          >
            <MenuItem className="brown-menu-item" onClick={handleAiPrompt}>Create Incident by AI Prompt</MenuItem>
            <MenuItem className="brown-menu-item" onClick={handleWithoutAiPrompt}>Create Incident without AI Prompt</MenuItem>
          </Menu>
        </div>

      </div>
      {isLoading ? (
        <div className='m-auto'>Loading...</div>
      ) :
        <div class="row mb-5 ">
          <div class="col-md-12">
            <div class="card-group gap-4">
              <div class="card card_incident">
                <div class="card-body">
                  <div class="d-flex justify-content-between mb-3">
                    <div>
                      <span class="d-block" style={{ fontWeight: "600" }}>Total Incidents</span>
                    </div>

                    <div>
                      <span class="text-success fw-bold">+10%</span>
                    </div>
                  </div>
                  {/* <h3 class="mb-3 fw-bold">{incidentCount.total}</h3> */}
                  <h3 class="mb-3 fw-bold">10</h3>
                  <div class="progress mb-2" style={{ height: "5px" }}>
                    <div class="progress-bar bg-success" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100"
                      style={{ width: "70%" }}>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card card_incident">
                <div class="card-body">
                  <div class="d-flex justify-content-between mb-3">
                    <div>
                      <span class="d-block" style={{ fontWeight: "600" }}>Pending Incidents</span>
                    </div>
                    <div>
                      <span class="text-danger fw-bold">-2.8%</span>
                    </div>
                  </div>
                  <h3 class="mb-3 fw-bold">100</h3>
                  <div class="progress mb-2" style={{ height: "5px" }}>
                    <div class="progress-bar bg-warning" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100"
                      style={{ width: "70%" }}>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card card_incident">
                <div class="card-body">
                  <div class="d-flex justify-content-between mb-3">
                    <div>
                      <span class="d-block" style={{ fontWeight: "600" }}>Resolved Incident</span>
                    </div>
                    <div>
                      <span class="text-success fw-bold">+12.5%</span>
                    </div>
                  </div>
                  <h3 class="mb-3 fw-bold">12</h3>
                  <div class="progress mb-2" style={{ height: "5px" }}>
                    <div class="progress-bar bg-info" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100"
                      style={{ width: "70%" }}>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card card_incident">
                <div class="card-body">
                  <div class="d-flex justify-content-between mb-3">
                    <div>
                      <span class="d-block" style={{ fontWeight: "600" }}>Open Incidents</span>
                    </div>
                    <div>
                      <span class="text-danger fw-bold">-75%</span>
                    </div>
                  </div>
                  <h3 class="mb-3 fw-bold">12</h3>
                  <div class="progress mb-2" style={{ height: "5px" }}>
                    <div class="progress-bar bg-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100"
                      style={{ width: "70%" }}>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <div className="row">
        <div className="col-sm-6 col-md-6 col-lg-3 col-xl-2 col-12 mb-2">
          <TextField
            InputProps={{ className: 'custom-input' }}
            className="custom-textfield"
            id="outlined-basic"
            label="Organization Name"
            variant="outlined"
            style={{ width: "100%" }}
          />
        </div>
        <div className=" col-sm-6 col-md-6 col-lg-3 col-xl-2 col-12 mb-2">
          <div className='resolve-drop'>
            <Autocomplete
              value={inputs.Status.value}
              onChange={handleChange('Status')}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id={`Status-autocomplete`}
              options={inputs.Status.options}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option;
                }
                if (option.inputValue) {
                  return option.inputValue;
                }
                return option;
              }}
              renderOption={(props, option) => (
                <li {...props} style={{ fontSize: '12px', padding: '4px 8px' }}>
                  {option}
                </li>
              )}


              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`Status`}
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    className: 'custom-input-drop' // Apply the custom class
                  }}
                  className="custom-textfield"
                />
              )}
            />
          </div>
        </div>
        <div className="col-sm-6 col-md-6 col-lg-3 col-xl-2 col-12 mb-2">
          <div className='resolve-drop'>
            <Autocomplete
              value={inputs.Severity.value}
              onChange={handleChange('Severity')}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id={`Severity-autocomplete`}
              options={inputs.Severity.options || []}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option;
                }
                if (option.inputValue) {
                  return option.inputValue;
                }
                return option.title;
              }}
              renderOption={(props, option) => (
                <li {...props} style={{ fontSize: '12px', padding: '4px 8px' }}>
                  {option.addOption ? (
                    <>
                      {option.title}
                      <AddIcon style={{ marginLeft: "10px" }} />
                    </>
                  ) : (
                    option.title
                  )}
                </li>
              )}
              renderInput={(params) => (
                <TextField {...params} label={`Severity`} variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    className: 'custom-input-drop' // Apply the custom class
                  }}
                  className="custom-textfield"
                />
              )}
            />
          </div>
        </div>
        <div className="col-sm-6 col-md-6 col-lg-3 col-xl-2 col-12 calendar_align mb-2">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="From Date"
            />
          </LocalizationProvider>
        </div>
        <div className="col-sm-6 col-md-6 col-lg-3 col-xl-2 col-12 calendar_align mb-2">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="To Date"
            />
          </LocalizationProvider>
        </div>
        <div className="col-sm-6 col-md-6 col-lg-3 col-xl-2 col-12 mb-2">
          <Button variant="fw-bold " className='search_btn'>Search</Button>
        </div>



        <div className="mt-2">

          <Paper className='tbl' sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer className='tablescroll-mobile'>
              <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                {isLoading ?
                  <div >Loading...</div>
                  :
                  <TableBody>

                    {rows
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => (
                        <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                          {columns.map((column) => {
                            const value = row[column.id];
                            if (column.id === 'status') {
                              return (
                                <StyledStatusTableCell key={column.id} align={column.align} status={row.status}>
                                  <StyledStatusText status={row.status}>
                                    {value}
                                  </StyledStatusText>
                                </StyledStatusTableCell>
                              );
                            }
                            return (
                              <TableCell
                                style={{ cursor: "pointer" }}
                                key={column.id}
                                align={column.align}
                                onClick={() => clickHandlerresolve(row.id)}
                              >
                                {column.format && typeof value === 'number'
                                  ? column.format(value)
                                  : value}
                              </TableCell>
                            );
                          })}
                        </StyledTableRow>
                      ))}
                  </TableBody>
                }

              </Table>
            </TableContainer>
            <div>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20, 40, 100]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </div>
          </Paper>
        </div>
      </div>
      {/* Ai promt diapog */}
      <Dialog open={aiPromptOpen} onClose={handeClickAiPromptDialog}>
        <DialogTitle className='dialog_head'>Create incident with AI prompt</DialogTitle>
        <DialogContent className='dialog_content'>
          {/* <AiPrompt /> */}
          <TextField
            placeholder='Write your prompt here...'
            id="outlined-basic"
            variant="outlined"
            className='w-100 mt-4'
            multiline={true}
            minRows={3}
            style={{ border: "1px solid #533529", borderRadius: "6px" }}
            value={prompt}
            onChange={(e) => setPromt(e.target.value)}
          />
        </DialogContent>
        <DialogActions className='dialog_content'>
          <Button className='accordian_submit_btn ' onClick={handeClickAiPromptDialog}>Cancel</Button>
          <Button className='accordian_cancel_btn' onClick={createincidenthandler} color="primary">OK</Button>
        </DialogActions>
      </Dialog>

    </div >
  )
}

export default Incident