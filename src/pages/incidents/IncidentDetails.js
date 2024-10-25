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
import VisibilityIcon from '@mui/icons-material/Visibility';
import Modal from 'react-bootstrap/Modal';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { formatDistanceToNow } from 'date-fns';
import { CircularProgress } from '@mui/material';
import { format, toZonedTime, formatInTimeZone } from 'date-fns-tz';
import {
    getIncidentDetailsById,
    getAllDepartments,
    getAllUserByDepartment,
    getIncidentChats,
    saveIncidentChart,
    uploadDocuments,
    getAllUsers,
    getIncidentHistory
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


const IncidentDetails = (props) => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false)
    const [message, setMessage] = useState('');
    const [selectedSection, setSelectedSection] = useState('Interim Investigation');
    const [caseDescription, setCaseDescription] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [severity, setSeverity] = useState('success');
    const [open, setOpen] = useState(false);
    const [fieldAddDialog, setFieldAddDialog] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [fields, setFields] = useState([]);
    const [currentField, setCurrentField] = useState({ type: 'input', label: '', options: [] });
    const [incidentDetails, setIncidentDetails] = useState(null);
    const [isIncidentDetailsFetched, setIsIncidentDetailsFetched] = useState(false);
    const [summary, setSummary] = useState('')
    const [allUsers, setAllUsers] = useState([])

    const handleDrawerOpen = () => setDrawerOpen(true);
    const handleDrawerClose = () => setDrawerOpen(false);

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
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null);
    const [departments, setDepartments] = useState([])
    const [selectedDepartment, setSelectedDepartment] = useState(null)
    const [incidentChats, setIncidentChats] = useState([]);
    const [chatData, setChatData] = useState('')
    const [incidentFiles, setIncidentFiles] = useState([])
    const [selectedFileUrl, setSelectedFileUrl] = useState(null);
    const [history, setHistory] = useState([])


    const storedUser = JSON.parse(localStorage.getItem('userDetails'));
    const userId = storedUser ? storedUser.userId : null;

    console.log(userId);


    useEffect(() => {
        fetchDepartments()
        fetchDropdowns();

        fetchIncidentDetailsById()
        fetchIncidentCharts()
        fetchAllUsers()
        fetchHistory();
    }, [id]);

    useEffect(() => {
        if (selectedDepartment) {
            fetchUsersByDept(selectedDepartment.id);
        }
    }, [selectedDepartment]);


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
    const fieldDialogOpen = () => {
        setFieldAddDialog(true);
        setDrawerOpen(false)
    };
    const fieldDialogClose = () => {
        setFieldAddDialog(false);
    };
    const fieldTypeOptions = [
        { title: 'Input' },
        { title: 'Dropdown' },
    ];
    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setCurrentField({ ...currentField, [name]: value });
    };
    const handleAddField = () => {
        setFields([...fields, { ...currentField, value: '' }]);
        setCurrentField({ type: '', label: '', options: [''] });
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
    const handleAddOption = () => {
        setCurrentField({ ...currentField, options: [...currentField.options, ''] });
    };
    const confirmDrawerOpen = () => {
        setFieldAddDialog(false);
        // setDrawerOpen(true)
    }

    //get all departments





    const fetchDepartments = async () => {
        try {
            const payload = {
                "orgId": 1
            }
            const response = await axios.post(getAllDepartments, payload)
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


    //fetch all users 

    const fetchAllUsers = async () => {
        try {
            const payload = {
                orgId: 1,
                flag: 'A',
                departmentId: 0
            }
            console.log(payload)
            const response = await axios.post(getAllUsers, payload)
            console.log("uuu", response)
            const alUsersList = response.data.users.map((user) => ({
                id: user.userId,
                title: user.fullName
            }))

            setAllUsers(alUsersList)
        } catch (error) {
            console.log(`Error in fetching all users:`, error)
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
            const userList = response.data.map((user) => ({
                id: user.userId,
                title: user.userName
            }))
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
    const [caseSummary, setCaseSummary] = useState('');
    const [subject, setSubject] = useState('')

    const [showPopup, setShowPopup] = useState(false);

    const handlePopupOpen = () => setShowPopup(true);
    const handlePopupClose = () => setShowPopup(false);

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
    //incident fileupload
    const incidentFileSubmit = async (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) {
            console.log("No files selected");
            setMessage("No files selected, Please select at least one file to upload.");
            setSeverity('error');
            setOpen(true);
            return;
        }

        if (selectedFiles.length > 10) {
            console.log("Cannot upload more than 10 files");
            setMessage("Cannot upload more than 10 files..");
            setSeverity('error');
            setOpen(true);
            return;

        }
        try {

            const formData = new FormData();
            // Append each file to the FormData
            selectedFiles.forEach((file, index) => {
                formData.append('files', file); // 'files' is the key expected by the backend
            });
            // Append other data (incidentId, entityId, source)
            formData.append('incidentId', id);
            formData.append('entityId', id);
            formData.append('source', 'Incident');
            const response = await axios.post(uploadDocuments, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },

            })
            console.log(response)
            if (response.status === 200) {
                console.log('Files uploaded successfully:', response.data);
                setMessage("File uploaded successfully!");
                setSeverity('success');
                setOpen(true);
                setSelectedFiles([])
                const newFiles = response.data.map((file) => ({
                    documentId: file.documentId,
                    documentName: file.documentName,
                    documentSize: file.documentSize,
                    documentUrl: file.documentUrl,
                    documentType: file.documentType,
                    uploadDate: file.uploadDate
                }))
                setIncidentFiles(prevFiles => [...prevFiles, ...newFiles])
            } else {
                console.log('File upload failed:', response);
                setMessage("Failed to upload file.");
                setSeverity('error');
                setOpen(true);
            }
        } catch (error) {
            console.log('Error in upload the incident files, error:', error)
            setMessage("Failed to upload file. Error: " + error.message);
            setSeverity('error');
            setOpen(true);
        }
    }
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


    //incident deatils by id
    const fetchIncidentDetailsById = async () => {
        setLoading(true);
        try {
            const payload = {
                "orgId": 1,
                "incidentId": id,
                "userId":userId
            }
            console.log(payload)
            const response = await axios.post(getIncidentDetailsById, payload)
            console.log(response)
            setIncidentDetails(response.data.incidentDetails)
            setIncidentFiles(response.data.incidentFiles)
            console.log(incidentFiles)
            console.log(incidentDetails)
            setSummary(response.data)
            // setInputs({Source: {value: response.data.incidentDetails.source, options:[]}})
            console.log(response)
            setInputs(prevState => ({
                ...prevState,
                Source: { ...prevState.Source, value: response.data.incidentDetails.source },
                Category: { ...prevState.Category, value: response.data.incidentDetails.category },
                Severity: { ...prevState.Severity, value: response.data.incidentDetails.severity }
            }));

            setSelectedDepartment({
                id: response.data.incidentDetails.departmentId,
                title: response.data.incidentDetails.departmentName
            });

            setSelectedUser({
                id: response.data.incidentDetails.assignedUserId,
                title: response.data.incidentDetails.assignedUser
            });
            console.log(departments)
            setIsIncidentDetailsFetched(true);
        } catch (error) {
            console.error('Error fetching incident details:', error);
        } finally {
            setLoading(false);
        }
    }

    //getIncidentChats
    const fetchIncidentCharts = async () => {
        try {
            const payload = {
                "incidentId": id,
            }
            console.log(payload)
            const response = await axios.post(getIncidentChats, payload)
            console.log(response)
            setIncidentChats(response.data.incidentChatsList)
            console.log(incidentChats)
        } catch (error) {
            console.error('Error fetching incident charts:', error);
        }
    }

    const formatDate = (utcDateString) => {
        const utcDate = new Date(utcDateString);
        const timeZone = 'America/New_York'; // Use your preferred time zone
        const zonedDate = toZonedTime(utcDate, timeZone);

        // Format the date to display hours ago, minutes ago, etc.
        return format(zonedDate, 'yyyy-MM-dd HH:mm:ss'); // You can format as needed
    };

    const formatTimeAgo = (utcDateString) => {
        const utcDate = new Date(utcDateString);
        const timeZone = 'America/New_York'; // Your preferred timezone
        const zonedDate = toZonedTime(utcDate, timeZone); // Adjust to local time

        return formatDistanceToNow(zonedDate, { addSuffix: true });
    };


    // Function to get relative time in IST
    const getTimeAgoInIST = (date) => {
        // Define the time zone for India
        const INDIA_TIME_ZONE = 'Asia/Kolkata';
        const zonedDate = formatInTimeZone(new Date(date), INDIA_TIME_ZONE, 'yyyy-MM-dd HH:mm:ss');
        return formatDistanceToNow(new Date(zonedDate), { addSuffix: true });
    };

    //save incident chat
    const handleChatSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                userId: userId,
                incidentId: id,
                comments: chatData
            }
            console.log('payload of chat', payload)
            const response = await axios.post(saveIncidentChart, payload)
            if (response.data.statusResponse.responseCode === 200) {
                setMessage("Chat posted Successfully");
                setSeverity('success');
                setOpen(true);
                fetchIncidentCharts()
                setChatData('')
            }

            else {
                setMessage("Failed to add chat.");
                setSeverity('error');
                setOpen(true);
            }
        } catch (error) {
            console.log('Error in send the chat:', error);
            setMessage("Failed to submit chat. Error: " + error.message);
            setSeverity('error');
            setOpen(true);
        }
    }

    const handleFilePreview = (fileUrl) => {
        setSelectedFileUrl(fileUrl); // Set the selected file URL
    };

    const downloadFile = (url, fileName) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName; // Set the file name for the download
        document.body.appendChild(link); // Append to body
        link.click(); // Trigger the download
        document.body.removeChild(link); // Clean up
    };

    const fetchHistory = async () => {
        setHistoryLoading(true)
        try {
            const response = await axios.post(getIncidentHistory, { incidentId: id })
            console.log(response)
            const historyData = response.data.incidentHistories;
            const formattedHistory = historyData.map((data) => ({
                id: data.incidentHistoryId,
                incidentId: data.incidentId,
                method: data.method,
                comments: data.comments,
                createdBy: data.createdBy,
                createdAt: data.createdAt,
            }))
            setHistory(formattedHistory);
        } catch (error) {
            console.log('failed to fetch history:', error)
        } finally {
            setHistoryLoading(false);
        }

    }

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
                        <div className='col-md-8 '>
                            {loading ? (
                                // Show a spinner or loading message when data is being fetched
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: "20px" }}>
                                    {/* <CircularProgress /> */}
                                    ...Loading
                                </div>
                            ) : (
                                <>
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
                                                    // value={departments.find((dept) => dept.id === incidentDetails.departmentId) || selectedDepartment}
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
                                                    options={allUsers}
                                                    value={selectedUser}
                                                    // value={users.find((user) => user.id === incidentDetails.assignedUserId) || selectedUser}
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
                                                        value={incidentDetails ? incidentDetails.title : ''}
                                                        onChange={(e) => setSubject(e.target.value)}
                                                    />
                                                </Form.Group>
                                            </div>
                                        </Col>

                                        <Col md={12} sm={6} className='mb-3'>
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
                                                        value={incidentDetails ? incidentDetails.description : ''}
                                                        onChange={(e) => setCaseDescription(e.target.value)}
                                                    />
                                                </Form.Group>
                                            </div>
                                        </Col>
                                    </Row>

                                    <div className="attached-files-info mb-3">
                                        <Row>
                                            <Col md={12} >
                                                <div className='file_upload'>
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
                                                </div>
                                            </Col>

                                        </Row>
                                        <Row>
                                            <Col md={12} >

                                                {selectedFiles && selectedFiles.length > 0 ?
                                                    <div className="attached-files mt-3">
                                                        <ul>
                                                            {selectedFiles.map((file, index) => (
                                                                <li key={index} className='mt-2'>
                                                                    <div className="d-flex align-items-center justify-content-between" style={{ width: "100%" }}>
                                                                        <div className="d-flex align-items-center">
                                                                            <span className="file-icon">
                                                                                <TextSnippetIcon style={{ color: "#533529" }} />
                                                                            </span>
                                                                            <p className="mb-0 ms-2">{file.name}</p>
                                                                        </div>
                                                                        <div className="file-actions d-flex align-items-center">
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

                                    {incidentFiles && incidentFiles.length > 0 && (
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
                                                    Incident Files &nbsp;({`${incidentFiles.length} files`})
                                                </Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>

                                                <Col md={12} className=' mb-3'>
                                                    <ul>
                                                        {incidentFiles.map((file, index) => (
                                                            <li key={index} className='mt-2'>
                                                                <div className="d-flex align-items-center justify-content-between" style={{ width: "100%" }}>
                                                                    <div className="d-flex align-items-center">
                                                                        <span className="file-icon">
                                                                            <TextSnippetIcon style={{ color: "#533529" }} />
                                                                        </span>
                                                                        <p className="mb-0 ms-2">
                                                                            <a href={file.documentUrl} target="_blank" rel="noopener noreferrer">
                                                                                {file.documentName}
                                                                            </a> ({(file.documentSize / 1024).toFixed(2)} KB)
                                                                        </p>
                                                                    </div>
                                                                    <div className="file-actions d-flex align-items-center">
                                                                        <div className="file-download me-2">
                                                                            <ArrowDownwardIcon
                                                                                style={{ marginRight: "5px", cursor: 'pointer' }}
                                                                                onClick={() => downloadFile(file.documentUrl, file.documentName)}
                                                                            />
                                                                        </div>
                                                                        <IconButton onClick={() => handleFilePreview(file.documentUrl)}>
                                                                            <VisibilityIcon />
                                                                        </IconButton>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </Col>
                                                {/* )} */}

                                            </AccordionDetails>
                                        </Accordion>
                                    )}
                                </>
                            )
                            }


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
                                                                // onChange={(e) => handleFieldValueChange(index, e.target.value)}
                                                            />
                                                        </Form.Group>

                                                    ) : (
                                                        <div className='resolve-drop'>
                                                            <Autocomplete
                                                                style={{ width: '100%' }}
                                                                options={field.options}
                                                                value={field.value || null}
                                                                // onChange={(event, newValue) => handleFieldValueChange(index, newValue)}
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

                            {/* Task assigning component */}
                            <div className='row dynamic_below'>
                                <div className='task_assigning'>
                                    <TaskAssign selectedDepartment={selectedDepartment} />
                                </div>
                            </div>
                        </div>


                        {/* Right content */}
                        <div className='col-md-4 '>
                            <div className='mb-3' style={{ display: "flex", justifyContent: "end" }}>
                                <Button
                                    variant='outlined'
                                    className='accordian_submit_btn'
                                    onClick={fieldDialogOpen}

                                    style={{ color: "#533529", fontWeight: "600", }}
                                >
                                    Create new Fields
                                </Button>
                            </div>
                            <div className='dynamic_fields mb-3' style={{ minHeight: "110px", maxHeight: "110px", overflowY: "auto" }}>
                                <h6 style={{ fontSize: "20px", fontWeight: "600" }}>Summary</h6>
                                <p style={{ fontSize: "14px" }}>{summary.summary}</p>
                            </div>
                            <div className="ticket-chat attached-files mb-3" style={{ minHeight: "160px", maxHeight: "160px", overflowY: "auto" }}>
                                <h5 style={{ fontWeight: "600" }}>History</h5>

                                {/* <div className="d-flex align-items-center">
                                    <span className="history_bg">
                                        sp
                                    </span> created new &nbsp; <span style={{ fontWeight: "600" }}>incident</span>&nbsp; 2 days ago
                                </div> */}
                                {historyLoading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        Loading...
                                    </div>
                                ) : (
                                    history.length > 0 ? (
                                        history.map((entry) => {
                                            // Split the 'createdBy' to get the first name
                                            const firstName = entry.createdBy.split(' ')[0];

                                            return (
                                                <div key={entry.id} className="d-flex align-items-center mb-3">
                                                    <span className="history_bg">
                                                        {firstName ? firstName.charAt(0).toUpperCase() : "?"}
                                                    </span>
                                                    {/* <span> {firstName}</span> &nbsp; */}
                                                    <span style={{ fontWeight: "600", fontSize: "14px" }}> {entry.comments}</span> &nbsp;
                                                    <span> {new Date(entry.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p>No history available.</p>
                                    )
                                )}



                            </div>
                            <div className="ticket-chat ">
                                <div className="ticket-chat-head">
                                    <h5 style={{ fontWeight: "600" }}>Incident Chat</h5>
                                    <div className="chat-post-box">
                                        <form onSubmit={handleChatSubmit}>
                                            <textarea
                                                className="form-control mb-3"
                                                rows="4"
                                                style={{ backgroundColor: "#f4f4f4" }}
                                                value={chatData}
                                                onChange={(e) => setChatData(e.target.value)}
                                            >
                                                Post
                                            </textarea>
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
                                {/* {incidentChats.map(chat => ( */}
                                <div className="ticket-chat-body" style={{ maxHeight: "215px", overflowY: "auto" }}>
                                    <ul className="created-tickets-info">
                                        {incidentChats.map(chat => (
                                            <React.Fragment key={chat.incidentChatId}>
                                                <li>
                                                    <div className="ticket-created-user">
                                                        <span className="avatar">
                                                            <AccountCircle />
                                                        </span>
                                                        <div className="user-name">
                                                            <h5><span>{chat.username}</span> posted a comment</h5>
                                                            {/* <span>{getTimeAgoInIST(chat.createdOn)}</span>  */}
                                                            <span>{chat.createdOn}</span>
                                                        </div>
                                                    </div>
                                                </li>
                                                <li className="mt-2">
                                                    <div className="ticket-created-info">
                                                        <h6>{chat.comments}</h6>
                                                        
                                                    </div>
                                                </li>
                                                <hr />
                                            </React.Fragment>
                                        ))}
                                    </ul>
                                    {/* <ul className="created-tickets-info">
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

                                    </ul> */}
                                </div>
                                {/* ))} */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                                                // onChange={(e) => handleFieldValueChange(index, e.target.value)}
                                                fullWidth
                                            />
                                        ) : (
                                            <Autocomplete
                                                options={field.options}
                                                value={field.value || null}
                                                // onChange={(event, newValue) => handleFieldValueChange(index, newValue)}
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

            <Dialog
                open={Boolean(selectedFileUrl)} // Open the dialog if a file is selected
                onClose={() => setSelectedFileUrl(null)} // Close the dialog
                fullWidth // This makes the dialog take the full width of its container
                maxWidth="xl" // Options: 'xs', 'sm', 'md', 'lg', 'xl'
                sx={{
                    '& .MuiDialog-paper': {
                        width: '80vw',
                        maxWidth: 'none',
                    }
                }}
            >
                <DialogContent>
                    {selectedFileUrl && (
                        <iframe
                            src={selectedFileUrl}
                            width="100%"
                            height="500px"
                            style={{ border: 'none' }}
                            title="File Preview"
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedFileUrl(null)} className='accordian_submit_btn' >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

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