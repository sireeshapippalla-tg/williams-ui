import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from '@mui/material/Button';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import { useEffect } from 'react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import AddIcon from '@mui/icons-material/Add';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { Snackbar, Alert, Paper, Typography, Checkbox, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DynamicField from '../../componnets/incidents/DynamicField';
import { BASE_API_URL } from '../../api';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Grid, List, ListItem, ListItemText } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircle from '@mui/icons-material/AccountCircle';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { Drawer, Box, Divider } from '@mui/material';
import Modal from 'react-bootstrap/Modal';



const CreateIncident = (props) => {
    // const [fields, setFields] = useState(initialFields);
    const [widgets, setWidgets] = useState([]);
    const [movingDivTop, setMovingDivTop] = useState(200);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [caseSummary, setCaseSummary] = useState('');
    const [caseDescription, setCaseDescription] = useState('');
    const [dynamicFields, setDynamicFields] = useState({})
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    const [open, setOpen] = useState(false);
    const [inputs, setInputs] = useState({
        Source: { value: null, options: [] },
        Category: { value: null, options: [] },
        Severity: { value: null, options: [] },
    });
    const [handleToggleOpen, setHandleToggleOpen] = useState({
        Source: false,
        Category: false,
        Severity: false,
        AssignTo: false,
    });
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleDrawerOpen = () => setDrawerOpen(true);
    const handleDrawerClose = () => setDrawerOpen(false);

    const [fieldAddDialog, setFieldAddDialog] = useState(false);
    const [fields, setFields] = useState([]);
    const [currentField, setCurrentField] = useState({ type: 'input', label: '', options: [] });
    const [confirmAddFieldDialog, setConfirmAddFieldDialog] = useState(false)
    const [pendingField, setPendingField] = useState(null);


    const navigate = useNavigate();

    const handleAddField = () => {
        setFields([...fields, { ...currentField, value: '' }]);
        setCurrentField({ type: '', label: '', options: [''] });
    };


    const handleCheckboxChange = (index) => (event) => {
        const newFields = [...fields];
        newFields[index].checked = event.target.checked;
        setFields(newFields);
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setCurrentField({ ...currentField, [name]: value });
    };

    const handleAddOption = () => {
        setCurrentField({ ...currentField, options: [...currentField.options, ''] });
    };
    const handleFieldValueChange = (index, value) => {
        const newFields = [...fields];
        if (newFields[index]) {
            newFields[index].value = value; // Update 'value' in fields
            setFields(newFields);
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...currentField.options];
        newOptions[index] = value;
        setCurrentField({ ...currentField, options: newOptions });
    };

    const fieldTypeOptions = [
        { title: 'Input' },
        { title: 'Dropdown' },
    ];

    const fieldDialogOpen = () => {
        setFieldAddDialog(true);
        setDrawerOpen(false)
    };
    const fieldDialogClose = () => {
        setFieldAddDialog(false);
    };

    const confirmDialogOpen = () => {
        setConfirmAddFieldDialog(true)
        setFieldAddDialog(false);
    }
    const confirmDialogClose = () => {
        setConfirmAddFieldDialog(false)
        setFieldAddDialog(false);
    }
    const handleConfirmAddField = () => {
        setFields([...fields, pendingField]); // Add pending field to fields
        setPendingField(null); // Clear pending field
        setConfirmAddFieldDialog(false);
    };

    const confirmDrawerOpen = () => {
        setFieldAddDialog(false);
        setDrawerOpen(true)
    }
    const handleFileChange = (e) => {
        setSelectedFiles([...e.target.files]);
    };


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
    useEffect(() => {

        fetchDropdowns();
        fetchUsers();

        const handleScroll = () => {
            setMovingDivTop(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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

    // Get all users

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("submit")

        try {
            const payload = {
                orgId: 1,
                caseSummary,
                caseDescription,
                sourceId: inputs.Source.value ? inputs.Source.value.id : null,
                categoryId: inputs.Category.value ? inputs.Category.value.id : null,
                severityId: inputs.Severity.value ? inputs.Severity.value.id : null,
                assignedUserId: selectedUser ? selectedUser.id : null,
                attachmentUrl: 'URL4',
                incidentStatusId: 34,
                userId: 1
                // assignedUserID: 2,
            }
            console.log("incdentpayload", payload)
            const response = await axios.post(BASE_API_URL + 'incident/addIncident', payload)

            if (response.status === 201 || response.data.statusResponse.responseCode === 201) {
                setMessage("Incident added successfully!");
                setSeverity('success');
                setOpen(true);
                setTimeout(() => {
                    navigate('/incident');
                }, 2000);
            } else {
                setMessage("Failed to add incident.");
                setSeverity('error');
                setOpen(true);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage("Failed to add incident. Error: " + error.message);
            setSeverity('error');
            setOpen(true);
        }
    }


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

    const handleUserChange = (event, newValue) => {
        setSelectedUser(newValue);
        console.log('Selected user:', newValue);
    }


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



    const setSummaryVisible = () => {
        if (props.isSummaryVisible == true) {
            return true;
        }
        if (props.isSummaryVisible == undefined) {
            return true;
        }
        return false;
    }



    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };
    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    };
    const handleRemoveFile = (index) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const staticFile = {
        name: 'file0702202413.pdf',
        downloadLink: '#'
    };
    return (
        <div className='right-cont'>

            <form onSubmit={handleSubmit}>
                <div className='row'>
                    {props.isCraeteIncidentHeading == true ? "" :
                        <h5 style={{ fontSize: '24px', fontWeight: '600', }}>
                            Incident Case details
                        </h5>
                    }
                    <hr style={{ border: "1px solid white" }} />
                    <div className='col-md-8 mt-3'>
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
                                    <Button variant="contained" className='accordian_submit_btn'  onClick={handleDrawerOpen}>
                                        More Fields...
                                    </Button>

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

                                {/* <Col md={3} sm={4} className="mb-3">
                                    <Button variant="contained" className='accordian_submit_btn' onClick={handleDrawerOpen}>
                                        More Fields...
                                    </Button>

                                </Col> */}

                            </Row>


                            {/* </div> */}
                            <div className='row mb-3'>

                                <div className='col-md-12 text_field'>
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
                                {/* <div className='col-md-6 mt-3 file_upload'>
                                  
                                    <input class="form-control" type="file" id="formFileMultiple" multiple onChange={handleFileSelect} />
                                </div> */}
                            </div>

                        </div>
                        <div className="attached-files-info mb-3">
                            <div className="row">
                            <div className='col-md-4  file_upload'>
                                    {/* <label className="text_color" for="formFileMultiple" class="form-label" onChange={handleFileChange}> Browse</label> */}
                                    <input class="form-control" type="file" id="formFileMultiple" multiple onChange={handleFileSelect} />
                                </div>
                                {/* <div className="col-xxl-6"> */}
                                <div className='col-md-8'>
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
                    </div>
                    {console.log("issummary", props.isSummaryVisible)}


                    {props.isRightContentVisible == true ? <div className='col-md-4'></div> :
                        <div className='col-md-4 mt-3'>
                            <div className="ticket-chat attached-files mb-3" >
                                <h5 style={{ fontWeight: "600" }}>History</h5>
                                {/* <TextField
                                    InputProps={{ className: 'custom-input' }}
                                    className="custom-textfield"
                                    id="outlined-basic"
                                    // label="Organization Name"
                                    variant="outlined"
                                    style={{ width: "100%" }}
                                    placeholder='Write history here...'
                                /> */}
                                <p>History not yet created</p>
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

                            </div>

                        </div>
                    }
                    {props.isCraeteNewIncidentButton == true ?
                        <div></div>
                        :
                        <div className=' col-md-2 float-end'>
                            <Button className='search_btn' type='submit'>Create incident</Button>
                        </div>
                    }

                    <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerOpen}>
                        <Box sx={{ width: 400 }} className="drawer-container">
                            <Box display="flex" justifyContent="space-between" alignItems="center" p={2} className="drawer-header brown-bg">
                                <Typography variant="h6" className='text-white'>Additional Fields</Typography>
                                <IconButton onClick={handleDrawerClose}>
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

                                {/* <Divider />
                                <Button
                                 
                                    style={{ color: "#533529", fontWeight: "600", marginTop: "10px" }}

                                    onClick={fieldDialogOpen}

                                >
                                    Create new Fields
                                </Button> */}

                                <form>
                                    {fields.map((field, index) => (
                                        index % 2 === 0 && ( // Render two fields per row
                                            <Row key={index} className='mb-3'>
                                                <Col md={12} sm={12} className='mb-3'>
                                                    <Grid container alignItems="center">
                                                        <Grid item xs={2}>
                                                            <Checkbox
                                                                checked={!!field.value && field.value.trim() !== ''}
                                                                onChange={handleCheckboxChange(index)}
                                                                color="primary"
                                                            />
                                                        </Grid>
                                                        <Grid item xs={10}>
                                                            {field.type === 'input' ? (
                                                                <TextField
                                                                    InputProps={{ className: 'custom-input' }}
                                                                    className='w-100 custom-textfield'
                                                                    type="text"
                                                                    label={field.label}
                                                                    name={field.label}
                                                                    value={field.value || ''}
                                                                    onChange={(e) => handleFieldValueChange(index, e.target.value)}
                                                                />
                                                            ) : (
                                                                <Autocomplete
                                                                    options={field.options}
                                                                    value={field.value || null}
                                                                    onChange={(event, newValue) => handleFieldValueChange(index, newValue)}
                                                                    renderInput={(params) => (
                                                                        <TextField
                                                                            {...params}
                                                                            label={field.label}
                                                                            variant="outlined"
                                                                            InputProps={{
                                                                                ...params.InputProps,
                                                                                className: 'custom-input-drop' // Apply the custom class
                                                                            }}
                                                                            className="custom-textfield"
                                                                        />
                                                                    )}
                                                                />
                                                            )}
                                                        </Grid>
                                                    </Grid>
                                                </Col>
                                                {index + 1 < fields.length && ( // Ensure not out of bounds
                                                    <Col md={12} sm={12}>
                                                        <Grid container alignItems="center">
                                                            <Grid item xs={2}>
                                                                <Checkbox
                                                                    checked={!!fields[index + 1].value && fields[index + 1].value.trim() !== ''}
                                                                    onChange={handleCheckboxChange(index + 1)}
                                                                    color="primary"
                                                                />
                                                            </Grid>
                                                            <Grid item xs={10}>
                                                                {fields[index + 1].type === 'input' ? (
                                                                    <TextField

                                                                        InputProps={{ className: 'custom-input' }}
                                                                        className='w-100 custom-textfield mb-2'
                                                                        type="text"
                                                                        label={fields[index + 1].label}
                                                                        name={fields[index + 1].label}
                                                                        value={fields[index + 1].value || ''}
                                                                        onChange={(e) => handleFieldValueChange(index + 1, e.target.value)}
                                                                    />
                                                                ) : (
                                                                    <Autocomplete

                                                                        options={fields[index + 1].options}
                                                                        value={fields[index + 1].value || null}
                                                                        onChange={(event, newValue) => handleFieldValueChange(index + 1, newValue)}
                                                                        renderInput={(params) => (
                                                                            <TextField
                                                                                {...params}
                                                                                label={fields[index + 1].label}
                                                                                variant="outlined"
                                                                                InputProps={{
                                                                                    ...params.InputProps,
                                                                                    className: 'custom-input-drop' // Apply the custom class
                                                                                }}
                                                                                className="custom-textfield"
                                                                            />
                                                                        )}
                                                                    />
                                                                )}
                                                            </Grid>
                                                        </Grid>
                                                    </Col>
                                                )}
                                            </Row>
                                        )
                                    ))}
                                </form>
                            </Box>
                            <Divider />
                            <Box p={2} className="drawer-footer " display="flex" justifyContent="space-between">
                                <Button
                                    variant='outlined' className='accordian_submit_btn '
                                    onClick={fieldDialogOpen}
                                >
                                    Create new Fields
                                </Button>
                                {/* <Button variant='outlined' className='accordian_submit_btn m-1'>Save</Button> */}
                                <Button variant='outlined' className='accordian_cancel_btn p-2' >Save</Button>
                            </Box>

                        </Box>
                    </Drawer>

                    <Modal show={fieldAddDialog} onHide={fieldDialogOpen}>
                        <Modal.Header className='brown_bg '>
                            <Modal.Title>Create Field</Modal.Title>
                            <button
                                type='button'
                                className='btn-close bg-white'
                                onClick={fieldDialogClose}
                            ></button>
                        </Modal.Header>
                        <Modal.Body className='modal_bg_body'>
                            <div>
                                <div className='row'>
                                    <Col md={6} sm={12} className="mb-3">
                                        <Autocomplete
                                            options={fieldTypeOptions}
                                            value={fieldTypeOptions.find(option => option.title.toLowerCase() === currentField.type) || null}
                                            onChange={(event, newValue) => setCurrentField({ ...currentField, type: newValue ? newValue.title.toLowerCase() : '' })}
                                            getOptionLabel={(option) => option.title}
                                            renderOption={(props, option) => (
                                                <li {...props} style={{ fontSize: '12px', padding: '4px 8px' }}>
                                                    {option.title}
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField {...params}
                                                    label="Field Type"
                                                    variant="outlined"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        className: 'custom-input-drop' // Apply the custom class
                                                    }}
                                                    className="custom-textfield"
                                                />
                                            )}
                                        />
                                    </Col>
                                    <Col md={6} sm={12} className="mb-3">
                                        <TextField
                                            InputProps={{ className: 'custom-input' }}
                                            className="custom-textfield"
                                            id="outlined-basic"
                                            label="Label Name"
                                            variant="outlined"
                                            type="text"
                                            name="label"
                                            value={currentField.label}
                                            onChange={handleFieldChange}
                                        />
                                    </Col>
                                    {currentField.type === 'dropdown' && (
                                        <div className='mt-0'>
                                            <label className='fw-bold'>Options:</label>
                                            <br />
                                            <TextField
                                                InputProps={{ className: 'custom-input' }}
                                                className="custom-textfield m-1"
                                                type="text"

                                                label="Option 1"
                                                value={currentField.options[0]}
                                                onChange={(e) => handleOptionChange(0, e.target.value)}
                                            />
                                            <Button className=' dynamic_btn' onClick={handleAddOption}>Add Option</Button>
                                            {currentField.options.slice(1).map((option, index) => (
                                                <div key={index}>
                                                    <TextField
                                                        type="text"
                                                        InputProps={{ className: 'custom-input m-1' }}
                                                        className="custom-textfield"
                                                        label={`Option ${index + 2}`}
                                                        value={option}
                                                        onChange={(e) => handleOptionChange(index + 1, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Button className='add-Field-btn' onClick={handleAddField}>Add Field</Button>
                                <h6 className='mt-5 font-weight-bold'>Generated Fields</h6>


                                <form>
                                    {fields.map((field, index) => (
                                        index % 2 === 0 && ( // Render two fields per row
                                            <Row key={index} className='mb-3'>
                                                <Col md={6} sm={6}>
                                                    <Grid container alignItems="center">
                                                        <Grid item xs={2}>
                                                            <Checkbox
                                                                checked={!!field.value && field.value.trim() !== ''}
                                                                onChange={handleCheckboxChange(index)}
                                                                color="primary"
                                                            />
                                                        </Grid>
                                                        <Grid item xs={10}>
                                                            {field.type === 'input' ? (
                                                                <TextField
                                                                    InputProps={{ className: 'custom-input' }}
                                                                    className="custom-textfield"
                                                                    type="text"
                                                                    label={field.label}
                                                                    name={field.label}
                                                                    value={field.value || ''}
                                                                    onChange={(e) => handleFieldValueChange(index, e.target.value)}
                                                                />
                                                            ) : (
                                                                <Autocomplete
                                                                    options={field.options}
                                                                    value={field.value || null}
                                                                    onChange={(event, newValue) => handleFieldValueChange(index, newValue)}
                                                                    renderInput={(params) => (
                                                                        <TextField
                                                                            {...params}
                                                                            label={field.label}
                                                                            variant="outlined"
                                                                            InputProps={{
                                                                                ...params.InputProps,
                                                                                className: 'custom-input-drop' // Apply the custom class
                                                                            }}
                                                                            className="custom-textfield"
                                                                        />
                                                                    )}
                                                                />
                                                            )}
                                                        </Grid>
                                                    </Grid>
                                                </Col>
                                                {index + 1 < fields.length && ( // Ensure not out of bounds
                                                    <Col md={6} sm={6}>
                                                        <Grid container alignItems="center">
                                                            <Grid item xs={2}>
                                                                <Checkbox
                                                                    checked={!!fields[index + 1].value && fields[index + 1].value.trim() !== ''}
                                                                    onChange={handleCheckboxChange(index + 1)}
                                                                    color="primary"
                                                                />
                                                            </Grid>
                                                            <Grid item xs={10}>
                                                                {fields[index + 1].type === 'input' ? (
                                                                    <TextField
                                                                        InputProps={{ className: 'custom-input' }}
                                                                        className="custom-textfield"
                                                                        type="text"
                                                                        label={fields[index + 1].label}
                                                                        name={fields[index + 1].label}
                                                                        value={fields[index + 1].value || ''}
                                                                        onChange={(e) => handleFieldValueChange(index + 1, e.target.value)}
                                                                    />
                                                                ) : (
                                                                    <Autocomplete
                                                                        options={fields[index + 1].options}
                                                                        value={fields[index + 1].value || null}
                                                                        onChange={(event, newValue) => handleFieldValueChange(index + 1, newValue)}
                                                                        renderInput={(params) => (
                                                                            <TextField
                                                                                {...params}
                                                                                label={fields[index + 1].label}
                                                                                variant="outlined"
                                                                                InputProps={{
                                                                                    ...params.InputProps,
                                                                                    className: 'custom-input-drop' // Apply the custom class
                                                                                }}
                                                                                className="custom-textfield"
                                                                            />
                                                                        )}
                                                                    />
                                                                )}
                                                            </Grid>
                                                        </Grid>
                                                    </Col>
                                                )}
                                            </Row>
                                        )
                                    ))}
                                </form>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant='outlined' className='dynamic_btn m-1'
                                onClick={confirmDrawerOpen}
                            >Yes</Button>
                            <Button variant='outlined' className='m-1 add-Field-btn p-2' onClick={fieldDialogClose}>No</Button>
                        </Modal.Footer>
                    </Modal>

                    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                        <Alert onClose={handleClose} severity={severity}>
                            {message}
                        </Alert>
                    </Snackbar>
                </div>
            </form>

        </div>
    );
};

export default CreateIncident;
