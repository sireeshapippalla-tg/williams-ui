import { TextField } from '@mui/material'
import Form from 'react-bootstrap/Form';
import React, { useState, useEffect } from 'react'
import CreateIncident from './CreateIncident';
import TaskAssign from '../../componnets/incidents/TaskAssign';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import AccountCircle from '@mui/icons-material/AccountCircle';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import DynamicField from '../../componnets/incidents/DynamicField';
import { Container, Row, Col } from 'react-bootstrap';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import axios from 'axios';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { Snackbar, Alert, Paper, Typography, Checkbox, Select, MenuItem } from '@mui/material';
import { Grid, List, ListItem, ListItemText } from '@mui/material';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { BASE_API_URL } from '../../api';
import { Drawer, Box, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const IncidentDetails = (props) => {
    const [message, setMessage] = useState('');
    const [selectedSection, setSelectedSection] = useState('Interim Investigation');
    const [caseDescription, setCaseDescription] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [severity, setSeverity] = useState('success');
    const [open, setOpen] = useState(false);

    const handleSectionChange = (section) => {
        setSelectedSection(section);
    };
    const [handleToggleOpen, setHandleToggleOpen] = useState({
        Source: false,
        Category: false,
        Severity: false,
        AssignTo: false,
    });
    const [inputs, setInputs] = useState({
        Source: { value: null, options: [] },
        Category: { value: null, options: [] },
        Severity: { value: null, options: [] },
    });
    useEffect(() => {

        fetchDropdowns();
        fetchUsers();


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
            const [sourceData, categoryData, severityData] = await Promise.all([
                fetchDropdownData("Incident Source"),
                fetchDropdownData("Incident Category"),
                fetchDropdownData("Incident Severity")
            ]);

            setInputs(prevState => ({
                ...prevState,
                Source: { ...prevState.Source, options: sourceData },
                Category: { ...prevState.Category, options: categoryData },
                Severity: { ...prevState.Severity, options: severityData }
            }));
            console.log("inputs", inputs)
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
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
                    value: newValue,  // Ensure value is updated
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
                            value: newOption,  // Ensure value is updated
                            options: [...prevState[name].options, newOption],
                            // sourceId: id
                        }
                    }));

                    setMessage("Option added successfully!");
                    setSeverity('success');
                    setOpen(true);
                } else {
                    setMessage("Failed to add option: ID not returned.");
                    setSeverity('error');
                    setOpen(true);
                }
            } catch (error) {
                console.error("Error adding new option:", error);
                setMessage("Failed to add option.");
                setSeverity('error');
                setOpen(true);
            }
        } else {
            id = newValue ? newValue.sourceId : null;
            setInputs(prevState => ({
                ...prevState,
                [name]: {
                    ...prevState[name],
                    value: newValue,  // Ensure value is updated
                    sourceId: id
                }
            }));
        }
        console.log(`Updated ${name} State:`, inputs[name]);  // Debug log
    };
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null);
    const handleUserChange = (event, newValue) => {
        setSelectedUser(newValue);
        console.log('Selected user:', newValue);
    }
    const [caseSummary, setCaseSummary] = useState('');

    const [showPopup, setShowPopup] = useState(false);

    const handlePopupOpen = () => setShowPopup(true);
    const handlePopupClose = () => setShowPopup(false);
    const fetchUsers = async () => {
        try {
            const payload = {
                "orgId": 1
            }
            const response = await axios.post(BASE_API_URL + 'incident/getAllUsers', payload)
            console.log('users response', payload)
            const userList = response.data.map((user) => ({ id: user.userId, title: user.userName }));
            setUsers(userList);

        } catch (error) {
            console.log(`Error in fetching the users:`, error)
        }
    }
    const [widgets, setWidgets] = useState([]);
    const [dynamicFields, setDynamicFields] = useState({})
    const draggableItems = [
        {
            widgetType: 'dropdown',
            label: 'Product name',
            options: ['Product 1', 'Product 2', 'Product 3'],
        },
        {
            widgetType: 'dropdown',
            label: 'Issue type',
            options: ['Audit', 'Quality', 'Security'],
        },
        {
            widgetType: 'dropdown',
            label: 'Supplier Name',
            options: ['One', 'Two', 'Three'],
        },
        {
            widgetType: 'dropdown',
            label: 'Issue Area',
            options: [
                'Footwear',
                'Apparel',
                'Leather Boots',
                'Production Components and Materials',
                'Work Inprogress',
                'Finished Product waiting for distribution',
            ],
        },
        { widgetType: 'input', label: 'Product Code' },
        { widgetType: 'input', label: 'Batch number' },
        { widgetType: 'input', label: 'Affected quantity' },
    ].filter(
        (item) =>
            !widgets.some(
                (widget) =>
                    widget.label === item.label && widget.widgetType === item.widgetType
            )
    );

    const DragablehandleChange = (name) => (event, newValue) => {
        setWidgets((prevWidgets) =>
            prevWidgets.map((widget) => {
                if (widget.label === name && widget.widgetType === 'dropdown') {
                    let newOptions = widget.options;
                    if (typeof newValue === 'string') {
                        newOptions = [...newOptions, newValue];
                    } else if (newValue && newValue.inputValue) {
                        newOptions = [...newOptions, newValue.inputValue];
                    }
                    return { ...widget, options: newOptions };
                }
                return widget;
            })
        );
        setDynamicFields((prevFields) => ({
            ...prevFields,
            [name]: newValue ? (typeof newValue === 'string' ? newValue : newValue.inputValue || newValue) : event.target.value,
        }));
    };
    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    };
    const handleFileChange = (e) => {
        setSelectedFiles([...e.target.files]);
    };
    const handleRemoveFile = (index) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };
    const staticFile = {
        name: 'file0702202413.pdf',
        downloadLink: '#'
    };
    return (
        <div>
            <div className="page-header">
                <div className="row align-items-center">
                    <div className="col-md-4">
                        <h3 className="page-title mb-0">Incident Details</h3>
                    </div>
                </div>
            </div>
            <hr style={{ border: "1px solid white" }} />
            <div className='row'>
                <div className="ticket-detail-head">
                    <div className='row'>

                        {/* <CreateIncident
                            isCreateNewFieldHide={true}
                            isCraeteNewIncidentButton={true}
                            isCreateDynamicFields={false}
                            isCraeteIncidentHeading={true}
                            // isSummaryVisible={true}
                            isRightContentVisible = {true}
                        /> */}
                        <div className='col-md-8 '>
                            <div className=''>

                                <Row>

                                    {Object.entries(inputs).map(([name, { value, options }], index) => (
                                        <Col key={index} md={3} sm={4} className="mb-3">

                                            <div >
                                                <Autocomplete
                                                    style={{ padding: "0px" }}
                                                    value={value}
                                                    onChange={handleChange(name)}
                                                    filterOptions={(options, params) => {
                                                        const filtered = options.filter(option =>
                                                            option.title.toLowerCase().includes(params.inputValue.toLowerCase())
                                                        );
                                                        const { inputValue } = params;
                                                        const isExisting = options.some(option => inputValue === option.title);
                                                        if (inputValue !== '' && !isExisting) {
                                                            filtered.push({
                                                                inputValue,
                                                                title: `"${inputValue}"`,
                                                                addOption: true
                                                            });
                                                        }
                                                        return filtered;
                                                    }}

                                                    selectOnFocus
                                                    clearOnBlur
                                                    handleHomeEndKeys
                                                    id={`${name}-autocomplete`}
                                                    open={handleToggleOpen[name]}
                                                    onOpen={() => setHandleToggleOpen(prev => ({ ...prev, [name]: true }))}
                                                    onClose={() => setHandleToggleOpen(prev => ({ ...prev, [name]: false }))}
                                                    options={options}
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
                                                    sx={{ width: '100%' }}
                                                    renderInput={(params) => (
                                                        <TextField {...params}
                                                            label={`${name}`}
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

                                        </Col>
                                    ))}


                                    <Col md={3} sm={4} className="mb-3">

                                        <div className='resolve-drop'>
                                            <Autocomplete
                                                style={{ padding: "0px" }}
                                                options={users}
                                                value={selectedUser}
                                                onChange={handleUserChange}
                                                getOptionLabel={(option) => option.title} renderOption={(props, option) => (
                                                    <li {...props} style={{ fontSize: '12px', padding: '4px 8px' }}>
                                                        {option.title}
                                                    </li>
                                                )}
                                                renderInput={(params) => (
                                                    <TextField {...params}
                                                        label="Department"
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
                                    </Col>



                                    <Col md={6} sm={6} className="mb-3">

                                        <div className='resolve-drop'>
                                            <Form.Group
                                                className='mb-0'
                                                controlId='exampleForm.ControlTextarea1'
                                            >
                                                <TextField
                                                    InputProps={{ className: 'custom-input' }}
                                                    placeholder='Subject...'

                                                    label='Subject'
                                                    variant="outlined"
                                                    className='w-100'
                                                    style={{ backgroundColor: "white" }}
                                                    value={caseSummary}
                                                    onChange={(e) => setCaseSummary(e.target.value)}
                                                />
                                            </Form.Group>
                                        </div>
                                    </Col>
                                    <Col md={3} sm={4} className="mb-3">

                                        <div className='resolve-drop'>
                                            <Autocomplete
                                                style={{ padding: "0px" }}
                                                options={users}
                                                value={selectedUser}
                                                onChange={handleUserChange}
                                                getOptionLabel={(option) => option.title} renderOption={(props, option) => (
                                                    <li {...props} style={{ fontSize: '12px', padding: '4px 8px' }}>
                                                        {option.title}
                                                    </li>
                                                )}
                                                renderInput={(params) => (
                                                    <TextField {...params}
                                                        label="Assign To"
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
                                    </Col>

                                    <Col md={3} sm={4} className="mb-3">
                                        <Button variant="contained"

                                            className='accordian_submit_btn'
                                            onClick={handlePopupOpen}>
                                            More Fields...
                                        </Button>
                                        {/* {props.isCreateNewFieldHide === false ?
                                        ""
                                        :
                                        <DynamicField
                                            isSummaryVisible={props.isSummaryVisible ? true : props.isSummaryVisible == undefined ? true : false

                                            }
                                        />

                                    } */}
                                    </Col>

                                </Row>

                                {/* </div> */}
                                <div className='row mb-3'>

                                    <div className='col-md-6 text_field'>
                                        <Form.Group
                                            className='mb-0'
                                            controlId='exampleForm.ControlTextarea1'
                                        >
                                            <TextField
                                                id="outlined-basic"
                                                label="Description"
                                                className='w-100'
                                                multiline={true}
                                                variant="outlined"
                                                minRows={2}
                                                style={{ backgroundColor: "white" }}
                                                value={caseDescription}
                                                onChange={(e) => setCaseDescription(e.target.value)}
                                            />
                                        </Form.Group>
                                    </div>
                                    <div className='col-md-6 mt-3 file_upload'>
                                        {/* <label className="text_color" for="formFileMultiple" class="form-label" onChange={handleFileChange}> Browse</label> */}
                                        <input class="form-control" type="file" id="formFileMultiple" multiple onChange={handleFileSelect} />
                                    </div>
                                </div>

                            </div>
                            <div className="attached-files-info mb-3">
                                <div className="row">
                                    <div className="col-xxl-6">
                                        <div className="attached-files">
                                            <ul>

                                                <li className='mt-2'>
                                                    <div className="d-flex align-items-center justify-content-between" style={{ width: "100%" }}>
                                                        <div className="d-flex align-items-center">
                                                            <span className="file-icon">
                                                                <TextSnippetIcon style={{ color: "#533529" }} />
                                                            </span>
                                                            <p className="mb-0 ms-2">{staticFile.name}</p>
                                                        </div>
                                                        <div className="file-actions d-flex align-items-center">
                                                            <div className="file-download me-2">
                                                                <a href="#">
                                                                    <ArrowDownwardIcon style={{ marginRight: "5px" }} />Download
                                                                </a>
                                                            </div>
                                                            <IconButton
                                                                edge='end'
                                                                aria-label='delete'
                                                            // onClick={() => handleRemoveFile(index)}
                                                            >
                                                                <CloseIcon className='close_icon' />
                                                            </IconButton>
                                                        </div>
                                                    </div>
                                                </li>
                                                {selectedFiles.length > 0 && (
                                                    selectedFiles.map((file, index) => (
                                                        <li key={index} className='mt-2'>
                                                            <div className="d-flex align-items-center justify-content-between" style={{ width: "100%" }}>
                                                                <div className="d-flex align-items-center">
                                                                    <span className="file-icon">
                                                                        <TextSnippetIcon style={{ color: "#533529" }} />
                                                                    </span>
                                                                    <p className="mb-0 ms-2">{file.name}</p>
                                                                </div>
                                                                <div className="file-actions d-flex align-items-center">
                                                                    <div className="file-download me-2">
                                                                        <a href="#">
                                                                            <ArrowDownwardIcon style={{ marginRight: "5px" }} />Download
                                                                        </a>
                                                                    </div>
                                                                    <IconButton
                                                                        edge='end'
                                                                        aria-label='delete'
                                                                        onClick={() => handleRemoveFile(index)}
                                                                    >
                                                                        <CloseIcon className='close_icon' />
                                                                    </IconButton>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='row dynamic_below'>
                                <div className='task_assigning'>
                                    <TaskAssign />
                                </div>
                            </div>
                        </div>


                        {/* Right content */}
                        <div className='col-md-4 '>
                            <div className='dynamic_fields mb-3' style={{ minHeight: "110px", maxHeight: "110px", overflowY: "auto" }}>
                                <h6 style={{ fontSize: "20px", fontWeight: "600" }}>Summary</h6>
                                <p>
                                    Lorem Ipsum is simply dummy text of the printing and

                                </p>
                            </div>
                            <div className="ticket-chat attached-files mb-3" style={{ minHeight: "160px", maxHeight: "160px", overflowY: "auto" }}>
                                <h5 style={{ fontWeight: "600" }}>History</h5>
                                <div className="d-flex align-items-center mb-3">
                                    <span className="history_bg">
                                        sp
                                    </span> changed the &nbsp; <span style={{ fontWeight: "600" }}>task</span>&nbsp; 2 days ago
                                </div>
                                <div className="d-flex align-items-center">
                                    <span className="history_bg">
                                        sp
                                    </span> created new &nbsp; <span style={{ fontWeight: "600" }}>incident</span>&nbsp; 2 days ago
                                </div>
                            </div>
                            <div className="ticket-chat ">
                                <div className="ticket-chat-head">
                                    <h5 style={{ fontWeight: "600" }}>Incident Chat</h5>
                                    <div className="chat-post-box">
                                        <form>
                                            <textarea className="form-control mb-3" rows="4" style={{ backgroundColor: "#f4f4f4" }}>Post</textarea>
                                            <div className="files-attached d-flex justify-content-between align-items-center">
                                                <div className="post-files">
                                                    <a href="#"><i class="la la-image"></i></a>
                                                    <a href="#"><i class="la la-file-video"></i></a>
                                                </div>
                                                <button type="submit">Send</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                <div className="ticket-chat-body">
                                    <ul className="created-tickets-info">
                                        <li>
                                            <div className="ticket-created-user">
                                                <span className="avatar " >
                                                    <AccountCircle />
                                                </span>
                                                <div className="user-name">
                                                    <h5><span>John Doe</span> posted a status</h5>
                                                    <span>5 hours ago</span>
                                                </div>
                                            </div>
                                        </li>

                                        <li className='mt-2'>
                                            <div className="ticket-created-info">
                                                <h6>Impact on Work</h6>
                                                <p>This issue disrupts meetings, delays task completion, and affects my overall productivity.</p>
                                                <a className="comment-text" href="#"><QuestionAnswerIcon className='me-2' />Comments (2)</a>
                                            </div>
                                        </li>
                                        <hr />
                                        <li>
                                            <div className="ticket-created-user">
                                                <span className="avatar " >
                                                    <AccountCircle />
                                                </span>
                                                <div className="user-name">
                                                    <h5>
                                                        <span>Rebecca Velazquez</span>
                                                    </h5>
                                                    <span>2 hours ago</span>
                                                </div>
                                            </div>

                                            <p className="details-text">
                                                Check the System and Application logs in the Event Viewer for warnings or errors that coincide with the times the freezes occur.
                                            </p>
                                        </li>

                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* <Dialog open={showPopup} onClose={handlePopupClose} fullWidth maxWidth="md">
                                    <DialogTitle className='dialog_head'>Additional Fields</DialogTitle>

                                    <DialogContent className='dialog_content'>
                                        <div className="row mt-4">
                                            {draggableItems.map((widget, index) => (
                                                <Col key={index} md={4} sm={12} className="mb-3">
                                                    <Grid container alignItems="center">
                                                        <Grid item xs={2}>
                                                            <Checkbox
                                                                checked={!!dynamicFields[widget.label]}
                                                                onChange={(e) => DragablehandleChange(widget.label)(e, dynamicFields[widget.label] ? '' : (widget.options ? widget.options[0] : ''))}
                                                                color="primary"
                                                            />
                                                        </Grid>
                                                        <Grid item xs={10}>
                                                            {widget.widgetType === 'dropdown' ? (
                                                                <div className='resolve-drop'>
                                                                    <Autocomplete
                                                                        style={{ width: '100%' }}
                                                                        value={dynamicFields[widget.label] || null}
                                                                        onChange={DragablehandleChange(widget.label)}
                                                                        filterOptions={(options, params) => {
                                                                            const filtered = options.filter(option =>
                                                                                option.toLowerCase().includes(params.inputValue.toLowerCase())
                                                                            );
                                                                            if (params.inputValue !== '') {
                                                                                filtered.push({
                                                                                    inputValue: params.inputValue,
                                                                                    title: `Add "${params.inputValue}"`,
                                                                                });
                                                                            }
                                                                            return filtered;
                                                                        }}
                                                                        selectOnFocus
                                                                        clearOnBlur
                                                                        handleHomeEndKeys
                                                                        options={widget.options}
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
                                                                                {option.inputValue ? (
                                                                                    <>
                                                                                        Add "{option.inputValue}"
                                                                                        <AddIcon style={{ marginLeft: "10px" }} />
                                                                                    </>
                                                                                ) : (
                                                                                    option
                                                                                )}
                                                                            </li>
                                                                        )}
                                                                        renderInput={(params) => (
                                                                            <TextField
                                                                                {...params}
                                                                                label={`${widget.label}`}
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
                                                            ) : (
                                                                <Form.Group
                                                                    className='mb-0'
                                                                    controlId='exampleForm.ControlTextarea1 '
                                                                >
                                                                    <TextField
                                                                        id="outlined-basic"
                                                                        InputProps={{ className: 'custom-input' }}
                                                                        className='w-100 custom-textfield'
                                                                        label={` ${widget.label}`}
                                                                        variant="outlined"
                                                                        value={dynamicFields[widget.label] || ''}
                                                                        onChange={DragablehandleChange(widget.label)}
                                                                    />
                                                                </Form.Group>
                                                            )}
                                                        </Grid>
                                                    </Grid>
                                                </Col>
                                            ))}
                                        </div>
                                    </DialogContent>


                                    <DialogActions className='dialog_content'>
                                        <Button onClick={handlePopupClose} className='accordian_submit_btn '>
                                            Save
                                        </Button>
                                        <Button onClick={handlePopupClose} className='accordian_cancel_btn'>
                                            Close
                                        </Button>
                                    </DialogActions>
                                </Dialog> */}

            <Drawer anchor="right" open={showPopup} onClose={handlePopupClose}>
                <Box sx={{ width: 400 }} className="drawer-container">
                    <Box display="flex" justifyContent="space-between" alignItems="center" p={2} className="drawer-header brown-bg">
                        <Typography variant="h6" className='text-white'>Additional Fields</Typography>
                        <IconButton onClick={handlePopupClose}>
                            <CloseIcon className='text-white' />
                        </IconButton>
                    </Box>
                    <Divider />
                    <Box p={2} className="drawer-body modal-bg-body">
                        {draggableItems.map((widget, index) => (
                            <Col key={index} md={12} sm={12} className="mb-3">
                                <Grid container alignItems="center">
                                    <Grid item xs={2}>
                                        <Checkbox
                                            checked={!!dynamicFields[widget.label]}
                                            onChange={(e) => DragablehandleChange(widget.label)(e, dynamicFields[widget.label] ? '' : (widget.options ? widget.options[0] : ''))}
                                            color="primary"
                                        />
                                    </Grid>
                                    <Grid item xs={10}>
                                        {widget.widgetType === 'dropdown' ? (
                                            <div className='resolve-drop'>
                                                <Autocomplete
                                                    style={{ width: '100%' }}
                                                    value={dynamicFields[widget.label] || null}
                                                    onChange={DragablehandleChange(widget.label)}
                                                    filterOptions={(options, params) => {
                                                        const filtered = options.filter(option =>
                                                            option.toLowerCase().includes(params.inputValue.toLowerCase())
                                                        );
                                                        if (params.inputValue !== '') {
                                                            filtered.push({
                                                                inputValue: params.inputValue,
                                                                title: `Add "${params.inputValue}"`,
                                                            });
                                                        }
                                                        return filtered;
                                                    }}
                                                    selectOnFocus
                                                    clearOnBlur
                                                    handleHomeEndKeys
                                                    options={widget.options}
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
                                                            {option.inputValue ? (
                                                                <>
                                                                    Add "{option.inputValue}"
                                                                    <AddIcon style={{ marginLeft: "10px" }} />
                                                                </>
                                                            ) : (
                                                                option
                                                            )}
                                                        </li>
                                                    )}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label={`${widget.label}`}
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
                                        ) : (
                                            <Form.Group
                                                className='mb-0'
                                                controlId='exampleForm.ControlTextarea1 '
                                            >
                                                <TextField
                                                    id="outlined-basic"
                                                    InputProps={{ className: 'custom-input' }}
                                                    className='w-100 custom-textfield'
                                                    label={` ${widget.label}`}
                                                    variant="outlined"
                                                    value={dynamicFields[widget.label] || ''}
                                                    onChange={DragablehandleChange(widget.label)}
                                                />
                                            </Form.Group>
                                        )}
                                    </Grid>
                                </Grid>
                            </Col>
                        ))}
                    </Box>
                    <Divider />
                    <Box p={2} className="drawer-footer " display="flex" justifyContent="space-between">
                        <Button variant='outlined' className='accordian_submit_btn m-1'>Save</Button>
                        <Button variant='outlined' className='accordian_cancel_btn p-2' onClick={handlePopupClose}>Close</Button>
                    </Box>
                </Box>
            </Drawer>
            {/* <Dialog open={showPopup} onClose={handlePopupClose} fullWidth maxWidth="md">
                <DialogTitle className='dialog_head'>Additional Fields</DialogTitle>

                <DialogContent className='dialog_content'>
                    <div className="row mt-4">
                        {draggableItems.map((widget, index) => (
                            <Col key={index} md={4} sm={12} className="mb-3">
                                <Grid container alignItems="center">
                                    <Grid item xs={2}>
                                        <Checkbox
                                            checked={!!dynamicFields[widget.label]}
                                            onChange={(e) => DragablehandleChange(widget.label)(e, dynamicFields[widget.label] ? '' : (widget.options ? widget.options[0] : ''))}
                                            color="primary"
                                        />
                                    </Grid>
                                    <Grid item xs={10}>
                                        {widget.widgetType === 'dropdown' ? (
                                            <div className='resolve-drop'>
                                                <Autocomplete
                                                    style={{ width: '100%' }}
                                                    value={dynamicFields[widget.label] || null}
                                                    onChange={DragablehandleChange(widget.label)}
                                                    filterOptions={(options, params) => {
                                                        const filtered = options.filter(option =>
                                                            option.toLowerCase().includes(params.inputValue.toLowerCase())
                                                        );
                                                        if (params.inputValue !== '') {
                                                            filtered.push({
                                                                inputValue: params.inputValue,
                                                                title: `Add "${params.inputValue}"`,
                                                            });
                                                        }
                                                        return filtered;
                                                    }}
                                                    selectOnFocus
                                                    clearOnBlur
                                                    handleHomeEndKeys
                                                    options={widget.options}
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
                                                            {option.inputValue ? (
                                                                <>
                                                                    Add "{option.inputValue}"
                                                                    <AddIcon style={{ marginLeft: "10px" }} />
                                                                </>
                                                            ) : (
                                                                option
                                                            )}
                                                        </li>
                                                    )}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label={`${widget.label}`}
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
                                        ) : (
                                            <Form.Group
                                                className='mb-0'
                                                controlId='exampleForm.ControlTextarea1 '
                                            >
                                                <TextField
                                                    id="outlined-basic"
                                                    InputProps={{ className: 'custom-input' }}
                                                    className='w-100 custom-textfield'
                                                    label={` ${widget.label}`}
                                                    variant="outlined"
                                                    value={dynamicFields[widget.label] || ''}
                                                    onChange={DragablehandleChange(widget.label)}
                                                />
                                            </Form.Group>
                                        )}
                                    </Grid>
                                </Grid>
                            </Col>
                        ))}
                    </div>
                </DialogContent>


                <DialogActions className='dialog_content'>
                    <Button onClick={handlePopupClose} className='accordian_submit_btn '>
                        Save
                    </Button>
                    <Button onClick={handlePopupClose} className='accordian_cancel_btn'>
                        Close
                    </Button>
                </DialogActions>
            </Dialog> */}

            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleClose} severity={severity}>
                    {message}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default IncidentDetails