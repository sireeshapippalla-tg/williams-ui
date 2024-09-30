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
import VisibilityIcon from '@mui/icons-material/Visibility';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import {
    getAllDepartments,
    getAllUserByDepartment,
    getMastersListByType,
    addIncident,
    saveIncidentChart
} from '../../api';


const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});


const CreateIncident = (props) => {
    const navigate = useNavigate();
    const location = useLocation();

    const data = location.state || {}

    // const [fields, setFields] = useState(initialFields);
    const [widgets, setWidgets] = useState([]);
    const [movingDivTop, setMovingDivTop] = useState(200);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [fileInputKey, setFileInputKey] = useState(Date.now());
    const [caseSummary, setCaseSummary] = useState('');
    const [confirmAddFieldDialog, setConfirmAddFieldDialog] = useState(false)
    const [pendingField, setPendingField] = useState(null);

    const [dynamicFields, setDynamicFields] = useState({})
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    const [open, setOpen] = useState(false);
    const [inputs, setInputs] = useState({
        Source: { value: null, options: [] },
        Category: { value: null, options: [] },
        Severity: { value: null, options: [] },
    });
    const [caseDescription, setCaseDescription] = useState('');
    const [subject, setSubject] = useState('')
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

    const [departments, setDepartments] = useState([])
    const [selectedDepartment, setSelectedDepartment] = useState(null)
    const [isAIGenerated, setIsAIGenerated] = useState(false);
    const [showModal3, setShowModal3] = useState(false);
    const toggleModal3 = () => {
        setShowModal3(!showModal3);
    };

    // useEffect(() => {
    //     if (data) {
    //         // Populate the form with AI-generated data
    //         setCaseDescription(data.description || "");
    //         setSubject(data.title || "");
    //         setInputs(prevState => ({
    //             ...prevState,
    //             Source: { ...prevState.Source, value: data.source || "" },
    //             Category: { ...prevState.Category, value: data.category || "" },
    //             Severity: { ...prevState.Severity, value: data.severity || "" }
    //         }));
    //         setSelectedDepartment({ id: 0, title: data.department || "" });
    //         setSelectedUser(null);
    //         setIsAIGenerated(true);
    //     }
    // }, []);


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

    const handleRemoveField = (index) => {
        const newFields = fields.filter((_, i) => i !== index);
        setFields(newFields);
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
        // setDrawerOpen(true)
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
        // fetchUsers();
        fetchDepartments()

    }, []);
    useEffect(() => {
        if (data) {
            populateAiData(data);
        }
    }, [departments]);

    const fetchDropdownData = async (sourceName) => {
        try {
            const response = await axios.post(getMastersListByType, { sourceName });
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

    //get all departments


    const fetchDepartments = async () => {
        try {
            const payload = {
                "orgId": 1
            }
            const response = await axios.post(getAllDepartments, {})
            console.log('departments', response)
            const departmentList = response.data.map((dept) => ({
                id: dept.departmentID,
                title: dept.departmentName
            }))
            setDepartments(departmentList)

        } catch (error) {
            console.log(`Error in fetching the Departments:`, error)
        }
    }
    // Get all users by department

    const fetchUsersByDept = async (departmentID) => {
        try {
            const payload = {
                "orgId": 1,
                "departmentId": departmentID
            }
            const response = await axios.post(getAllUserByDepartment, payload)
            console.log('getusersbydept', response)
            const userList = response.data.map((user) => ({ id: user.userId, title: user.userName }))
            setUsers(userList)
            console.log('depUSer', users)
        } catch (error) {
            console.log(`Error in fetching the users by dept:`, error)
        }
    }
    const handleDepartmentChange = (event, newValue) => {
        setSelectedDepartment(newValue);
        if (newValue) {
            fetchUsersByDept(newValue.id)
        } else {
            setUsers([])
        }
        console.log('Selected department:', newValue);
    }

    const handleUserChange = (event, newValue) => {
        setSelectedUser(newValue);
        console.log('Selected user:', newValue);
    }

    // const fetchUsers = async () => {
    //     try {
    //         const payload = {
    //             "orgId": 1
    //         }
    //         const response = await axios.post(BASE_API_URL + 'incident/getAllUsers', payload)
    //         console.log('users response', payload)
    //         const userList = response.data.map((user) => ({ id: user.userId, title: user.userName }));
    //         setUsers(userList);

    //     } catch (error) {
    //         console.log(`Error in fetching the users:`, error)
    //     }
    // }

    const populateAiData = (aiResponse) => {
        // setSubject(aiResponse.title || '')
        // setCaseDescription(aiResponse.description || '');
        const department = departments.find(dept => dept.title.toLowerCase() === (aiResponse.department || '').toLowerCase());
        if (department) {
            setSelectedDepartment(department);
            fetchUsersByDept(department.id);
        }
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("submit")

        try {
            const isAIGenerated = !!data;

            const payload = {
                orgId: 1,
                description: caseDescription,
                sourceId: inputs.Source.value ? inputs.Source.value.id : null,
                categoryId: inputs.Category.value ? inputs.Category.value.id : null,
                severityId: inputs.Severity.value ? inputs.Severity.value.id : null,
                departmentId: selectedDepartment ? selectedDepartment.id : null, // Add departmentId to the payload
                assignedUserId: selectedUser ? selectedUser.id : null,
                attachmentUrl: 'URL4',
                incidentStatusId: 34,
                title: subject,
                userId: 1
            }
            // const payload = {
            //     orgId: 1,
            //     description: caseDescription,
            //     assignedUserId: isAIGenerated ? 0 : (selectedUser ? selectedUser.id : null),
            //     attachmentUrl: 'URL4',
            //     incidentStatusId: 34,
            //     title: subject,
            //     userId: 1,
            //     departmentId: isAIGenerated ? 0 : (selectedDepartment ? selectedDepartment.id : null),
            //     source: isAIGenerated ? 0 : (inputs ?  inputs.Source.value : null),
            //     category: isAIGenerated ? 0 : (inputs ? inputs.Category.value: null),
            //     severity:isAIGenerated ? 0 : (inputs ?  inputs.Severity.value: null)
            // };
            console.log("incdentpayload", payload)

            const formData = new FormData();
            formData.append('incident', JSON.stringify(payload))
            if(selectedFiles && selectedFiles.length > 0) {
                selectedFiles.forEach((file, index) => {
                    formData.append('files', file)
                })
            }

            console.log('formdata payload:', formData)
            const response = await axios.post(addIncident, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })

            if (response.status === 201 || response.data.statusResponse.responseCode === 201) {
                setMessage("Incident added successfully!");
                setSeverity('success');
                setShowModal3(false)
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
    // const handleRemoveFile = (index) => {
    //     setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    // };
    const handleRemoveFile = (index) => {
        setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const staticFile = {
        name: 'file0702202413.pdf',
        downloadLink: '#'
    };
    return (
        <div className='right-cont'>

            <form >
                {/* <form > */}
                <div className='row'>
                    {props.isCraeteIncidentHeading == true ? "" :
                        <h5 style={{ fontSize: '24px', fontWeight: '600', }}>
                            Incident Case details
                        </h5>
                    }
                    <hr className='white-line'/>
                    <div className='col-md-8 '>
                        <Row>
                            {Object.entries(inputs).map(([name, { value, options }], index) => (
                                <Col key={index} md={4} sm={4} className="mb-3">
                                    <div className='resolve-drop'>
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

                            <Col md={4} sm={4} className="mb-3">
                                <div className='resolve-drop'>
                                    <Autocomplete
                                        style={{ padding: "0px" }}
                                        options={departments}
                                        value={selectedDepartment}
                                        onChange={handleDepartmentChange}
                                        getOptionLabel={(option) => option.title}
                                        renderOption={(props, option) => (
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

                            <Col md={4} sm={4} className="mb-3">
                                <div className='resolve-drop'>
                                    <Autocomplete
                                        style={{ padding: "0px" }}
                                        options={users}
                                        value={selectedUser}
                                        onChange={handleUserChange}
                                        getOptionLabel={(option) => option.title}
                                        renderOption={(props, option) => (
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

                            <Col md={4} sm={4} className="mb-3">
                                <div className='resolve-drop'>
                                    <Form.Group className='mb-0' controlId='exampleForm.ControlTextarea1'>
                                        <TextField
                                            id="outlined-basic"
                                            InputProps={{ className: 'custom-input' }}
                                            className='w-100 custom-textfield'
                                            placeholder='Subject...'
                                            label='Subject'
                                            variant="outlined"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>

                            <Col md={12} sm={6}>
                                <div className='resolve-drop'>
                                    <Form.Group className='mb-0' controlId='exampleForm.ControlTextarea1'>
                                        <TextField
                                            id="outlined-basic"
                                            label="Description"
                                            className='w-100'
                                            multiline={true}
                                            variant="outlined"
                                            minRows={3}
                                            style={{ backgroundColor: "white", borderRadius: "6px" }}
                                            value={caseDescription}
                                            onChange={(e) => setCaseDescription(e.target.value)}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                        </Row>

                        <div className="attached-files-info ">
                            <Row style={{ padding: "10px" }}>
                                <Col md={12} className='' style={{ margin: "12px 0px 0px 0px", backgroundColor: "white", borderRadius: "6px" }}>
                                    <Button
                                        component='label'

                                        style={{ color: "black" }}

                                    >
                                        Choose file
                                        <VisuallyHiddenInput
                                            type='file'
                                            multiple
                                            style={{ display: 'none' }}
                                            onChange={handleFileSelect}
                                        />
                                    </Button>
                                    <span className='vertical-line'></span>

                                    <span style={{ marginLeft: "10px" }}> {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'No file chosen'}</span>
                                </Col>
                                <Col md={12} className='mt-3 p-0'>

                                    {selectedFiles && selectedFiles.length > 0 ?
                                        <div className="attached-files">
                                            <ul>
                                                {selectedFiles.map((file, index) => (
                                                    <li key={index} className='mt-2'>
                                                        <div className="selectedFiles" style={{ width: "100%" }}>
                                                            <div className="file-left-content">
                                                                <span className="file-icon">
                                                                    <TextSnippetIcon style={{ color: "#533529" }} />
                                                                </span>
                                                                <p className="mb-0 ms-2">{file.name}</p>
                                                            </div>
                                                            <div className="file-actions file-left-content">
                                                                <div className="file-download me-2">
                                                                    <a href="#">
                                                                        <ArrowDownwardIcon style={{ marginRight: "5px" }} />
                                                                    </a>
                                                                </div>
                                                                <IconButton>
                                                                    <VisibilityIcon />
                                                                </IconButton>
                                                                <IconButton edge='end' aria-label='delete' onClick={() => handleRemoveFile(index)}>
                                                                    <CloseIcon className='close_icon' />
                                                                </IconButton>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        : ""
                                    }
                                  
                                </Col>
                            </Row>
                        </div>

                        <Accordion className='mb-2 accordian_arrow'>
                            <AccordionSummary
                                style={{
                                    // color: '#0c63e4',
                                    backgroundColor: '#533529',
                                    boxShadow: 'inset 0 -1px 0 rgba(0, 0, 0, .125);',
                                    padding: '0px 20px',
                                }}
                                expandIcon={<ExpandMoreIcon className='accordian_arrow' />}
                                aria-controls='panel3-content'
                                id='panel3-header'
                            >
                                <Typography className='accord_typo'>
                                    Additional Fields
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container alignItems="center" spacing={2}>
                                    {draggableItems.map((widget, index) => (
                                        <Grid item xs={4} key={index}>
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
                                    ))}


                                    {fields.map((field, index) => (
                                        <>
                                            <Grid item xs={4} key={index}>
                                                {field.type === 'input' ? (
                                                    <Form.Group
                                                        className='mb-0'
                                                        controlId='exampleForm.ControlTextarea1 '
                                                    >
                                                        <TextField
                                                            id="outlined-basic"
                                                            InputProps={{ className: 'custom-input' }}
                                                            className='w-100 custom-textfield'
                                                            label={field.label}
                                                            variant="outlined"
                                                            name={field.label}
                                                            value={field.value || ''}
                                                            onChange={(e) => handleFieldValueChange(index, e.target.value)}
                                                        />
                                                    </Form.Group>

                                                ) : (
                                                    <div className='resolve-drop'>
                                                        <Autocomplete
                                                            style={{ width: '100%' }}
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
                                                    </div>
                                                )}
                                            </Grid>




                                        </>

                                    ))}

                                </Grid>

                            </AccordionDetails>



                        </Accordion>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Button
                                variant='outlined'
                                className='accordian_submit_btn'
                                onClick={fieldDialogOpen}

                                style={{ color: "#533529", fontWeight: "600", }}
                            >
                                Create new Fields
                            </Button>
                            {/* <Button className='accordian_submit_btn 'style={{ color: "#533529", fontWeight: "600",}} type='submit'>Create incident</Button> */}


                        </div>
                        {/* <div className='col-md-2'></div> */}
                        {/* <div className=' col-md-6 float-end'>
                            
                        </div> */}

                    </div>
                    {console.log("issummary", props.isSummaryVisible)}
                    {/* right content */}

                    {props.isRightContentVisible == true ? <div className='col-md-4'></div> :
                        <div className='col-md-4 '>
                            {/* <div className='mb-3' style={{ display: "flex", justifyContent: "end" }}>
                                <Button
                                    variant='outlined'
                                    className='accordian_submit_btn'
                                    onClick={fieldDialogOpen}

                                    style={{ color: "#533529", fontWeight: "600", }}
                                >
                                    Create new Fields
                                </Button>
                            </div> */}

                            <div className="ticket-chat attached-files mb-3 p-4" >
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
                            <div className="ticket-chat p-4">
                                <div className="ticket-chat-head">
                                    <h5 style={{ fontWeight: "600", marginBottom:"20px" }}>Incident Chat</h5>
                                    <div className="chat-post-box card p-4">
                                        {/* <form>
                                            <textarea className="form-control mb-3" rows="4" style={{ backgroundColor: "#f4f4f4" }}>Post</textarea>
                                            <div className="files-attached d-flex justify-content-between align-items-center">
                                                <div className="post-files">
                                                    <a href="#"><i class="la la-image"></i></a>
                                                    <a href="#"><i class="la la-file-video"></i></a>
                                                </div>
                                                <button type="submit">Send</button>
                                            </div>
                                        </form> */}
                                        <p>Incident chat created not yet, you can chat after create incident</p>
                                    </div>
                                </div>

                            </div>
                            {/* <Button className='accordian_submit_btn mt-3' style={{ color: "#533529", fontWeight: "600", float: "inline-end" }} onClick={toggleModal3}>Create incident</Button> */}
                            <Button className='accordian_submit_btn mt-3' style={{ color: "#533529", fontWeight: "600", float: "inline-end" }} onClick={toggleModal3}>Create incident</Button>

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
                                    <Col md={5} sm={12} className="mb-3">
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
                                    <Col md={5} sm={12} className="mb-3">
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
                                    <Col md={2} >
                                        <IconButton className='dynamic-addicon' onClick={handleAddField}>
                                            <AddIcon />
                                        </IconButton>
                                    </Col>
                                    {currentField.type === 'dropdown' && (
                                        <div className='mt-0'>
                                            <label>Dropdown options:</label>
                                            <br />
                                            <Col md={6} className='mb-2'>
                                                <Grid container alignItems="center">
                                                    <Grid item xs={11}>
                                                        <TextField
                                                            InputProps={{ className: 'custom-input' }}
                                                            className="custom-textfield m-1"
                                                            type="text"

                                                            label="Option 1"
                                                            value={currentField.options[0]}
                                                            onChange={(e) => handleOptionChange(0, e.target.value)}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={1}>
                                                        <IconButton onClick={handleAddOption}>
                                                            <AddIcon />
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            </Col>


                                            {/* <Button className=' dynamic_btn' onClick={handleAddOption}>Add Option</Button> */}
                                            {currentField.options.slice(1).map((option, index) => (
                                                <Col md={6} className='mb-2'>
                                                    <Grid container alignItems="center">
                                                        <Grid item xs={11}>
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
                                                        </Grid>
                                                    </Grid>
                                                </Col>

                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* <Button className='add-Field-btn' onClick={handleAddField}>Add Field</Button> */}
                                <h6 style={{ fontWeight: "600" }}>Generated Fields</h6>
                                <form>
                                    {fields.map((field, index) => (
                                        <Row key={index} className='mb-3'>
                                            <Col md={10} sm={12}>
                                                {field.type === 'input' ? (
                                                    <TextField
                                                        InputProps={{ className: 'custom-input' }}
                                                        className="custom-textfield"
                                                        type="text"
                                                        label={field.label}
                                                        name={field.label}
                                                        value={field.value || ''}
                                                        onChange={(e) => handleFieldValueChange(index, e.target.value)}
                                                        fullWidth
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
                                                                fullWidth
                                                            />
                                                        )}
                                                    />
                                                )}
                                            </Col>
                                            <Col md={2}>
                                                <IconButton onClick={() => handleRemoveField(index)}>
                                                    <CloseIcon className='close_icon' />
                                                </IconButton>

                                            </Col>
                                        </Row>
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

                    
                    <Modal show={showModal3} onHide={toggleModal3}>
                        <Modal.Header className='brown_bg '>
                            <Modal.Title>Create the incident</Modal.Title>
                            <button
                                type='button'
                                className='btn-close bg-white'
                                onClick={toggleModal3}
                            ></button>
                        </Modal.Header>
                        <Modal.Body className='modal_bg_body'>
                            <label>Are you sure you want to create the incident!</label>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant='outlined' className='dynamic_btn m-1'
                                onClick={handleSubmit}
                            >Yes</Button>
                            <Button className='m-1 add-Field-btn p-2' onClick={toggleModal3}>No</Button>
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
