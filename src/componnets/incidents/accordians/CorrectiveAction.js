import React, { useEffect, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Form from 'react-bootstrap/Form';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { TextField, Autocomplete, Alert, Snackbar } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';
import { CircularProgress } from '@mui/material';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchDepartments } from '../../../features/departmentsSlice';


import {
    getMastersListByType,
    addMasterByType, saveTasksForCap, getTasksForIncident, saveCorrectiveAction,
    getIncidentCAPDetails, addTasksWithAI, deleteFile, downloadFile, getTasksByDepartment, saveTasksForDepartment
} from '../../../api';
import DoneIcon from '@mui/icons-material/Done';



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

const initialCorrectiveRow = () => ({
    id: Date.now(), // Unique ID for each row
    task: '',
    taskId: '',
    dueDate: '',
    resolved: false,
    capTaskId: '',
});

const CorrectiveAction = ({ invokeHistory, selectedDepartment }) => {
    const { id } = useParams();
    console.log(id)
    console.log(selectedDepartment)

    // const dispatch = useDispatch();
    // const { list, loading, error } = useSelector((state) => (state.departments || {}));

    // useEffect(() => {
    //     console.log("Dispatching fetchDepartments");
    //     dispatch(fetchDepartments())
    // }, [dispatch])

    // if (loading) return <div>Loading...</div>;
    // if (error) return <div>Error: {error}</div>;

    // useEffect(() => {
    //     if (list && list.length > 0) {
    //         console.log('Department List:', list);  
    //     }
    // }, [list]);

    // const [correctiveRows, setCorrectiveRows] = useState([
    //     { id: 1, task: '', taskId: '', dueDate: '', resolved: false },
    // ]);

    const [correctiveRows, setCorrectiveRows] = useState([initialCorrectiveRow()]);
    const [tableCorrectveSelectedFiles, setTableCorectiveSelectedFiles] = useState([]);
    const [correctiveShowAlert, setCorrectieShowAlert] = useState(false);
    const [correctiveSelectedFiles, setCorrectiveSelectecFiles] = useState([]);
    const [taskOptions, setTaskOptions] = useState([])
    const [severity, setSeverity] = useState('success');
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [incidentTaskId, setIncidentTaskId] = useState([])
    const [comments, setComments] = useState();
    const [correctiveId, setCorrectiveId] = useState()
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedFileUrl, setSelectedFileUrl] = useState(null);
    const [aiPromptOpen, setAiPromptOpen] = useState(false)
    const [prompt, setPromt] = useState()
    const [promptData, setPromptData] = useState()

    const storedUser = JSON.parse(localStorage.getItem('userDetails'));
    const userId = storedUser ? storedUser.userId : null;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [fileToDeleteIndex, setFileToDeleteIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({})
    const [rowErrors, setRowErrors] = useState({});
    const [taskByDept, setTasksByDept] = useState([])


    console.log(userId);



    const handeClickAiPromptDialog = () => {
        setAiPromptOpen(!aiPromptOpen)
    }
    const handleAiPrompt = () => {
        setAiPromptOpen(true)
    };


    const createTaskhandlerwithAiPrompt = async () => {
        try {
            // Ensure taskOptions is an empty array if not set
            const initializedTaskOptions = taskOptions || [];

            const response = await axios.post(addTasksWithAI, {
                userPrompt: prompt
            });
            const data = response.data;
            setPromptData(data);

            console.log('aidata', data, initializedTaskOptions);
            console.log('duedateAI', data.dueDate, data.taskId);


            const newRow = {
                id: "",
                task: data.taskName || '',
                taskId: initializedTaskOptions.some(opt => opt.id === data.taskId) ? data.taskId : 0,
                dueDate: data.dueDate || '',
                resolved: data.isResolved || false,
                capTaskId: "",
                departmentId: selectedDepartment.id
            };

            const isTaskFound = initializedTaskOptions.find((item) => item.title === data.taskName);

            if (!isTaskFound && data.taskName) {
                setTaskOptions([...initializedTaskOptions, { id: 0, title: data.taskName, departmentId: selectedDepartment.id }]);
            }

            // Close the dialog only after updating corrective rows and clearing prompt
            setCorrectiveRows((prevRows) => {
                if (prevRows && prevRows.length > 0 && prevRows[0].taskId) {
                    return [...prevRows, newRow];
                } else {
                    return [newRow];
                }
            });

            setAiPromptOpen(false); // Close dialog
            setPromt('');          // Clear prompt

            console.log('aiproData', data);

        } catch (error) {
            console.log('Error creating incident with AI prompt:', error);
        }
    };


    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setCorrectiveSelectecFiles((prevFiles) => [...prevFiles, ...files]);
    };


    const handleFilePreview = (fileUrl) => {
        setSelectedFileUrl(fileUrl); // Set the selected file URL
    };

    const CorrectivehandleAddRow = () => {
        const newRow = initialCorrectiveRow();
        setCorrectiveRows([...correctiveRows, newRow]);
        setTableCorectiveSelectedFiles(prevState => ({
            ...prevState,
            [newRow.id]: []
        }));
    };




    const correctiveHandleFileChange = (e) => {
        setCorrectiveSelectecFiles([...e.target.files]);
    };

    const correctiveHandleRemoveFile = (index) => {
        setCorrectiveSelectecFiles(correctiveSelectedFiles.filter((_, i) => i !== index));
    };

    const correctiveHandleCloseAlert = () => {
        setCorrectieShowAlert(false);
    };


    // const correctiveRowshandleChange = (rowId, field, value) => {

    //     console.log(rowId, field, value)
    //     const updatedRows = correctiveRows.map((row) =>
    //         row.id === rowId ? { ...row, [field]: value } : row
    //     );
    //     setCorrectiveRows(updatedRows);
    // };

    const correctiveRowshandleChange = (rowId, field, value) => {
        setCorrectiveRows((prevRows) =>
            prevRows.map((row) =>
                row.id === rowId ? { ...row, [field]: value } : row
            )
        );
    };


    const tableCorrectiveHandleFileChange = (e, rowId) => {
        const selectedFiles = [...e.target.files];
        setTableCorectiveSelectedFiles(prevState => ({
            ...prevState,
            [rowId]: selectedFiles // Store files for the specific row by rowId
        }));

    };

    useEffect(() => {
        // fetchTaskDropdown();
        fetchTaskIncident();
        fetchCorrectiveAction();
    }, [])


    useEffect(() => {
        if (selectedDepartment && selectedDepartment.id) {
            fetchTaskbyDepartment(selectedDepartment.id)
        }

    }, [selectedDepartment])

    useEffect(() => {
        console.log("Updated taskOptions:", taskOptions);
    }, [taskOptions]);


    const fetchTaskbyDepartment = async (departmentId) => {
        setLoading(true);
        setErrors(null)
        try {
            const response = await axios.post(getTasksByDepartment, { departmentId })
            console.log("taskByDept", departmentId)
            console.log(response)
            if (response?.data?.statusResponse?.responseCode === 200) {
                const taskOption = response.data.tasks.map((task) => ({
                    id: task.taskId,
                    title: task.taskName,
                    deptId: task.departmentId
                }))
                // setTasksByDept(taskOptionByDept);
                // console.log(taskByDept)  

                if (taskOption.length == 0) {
                    setTaskOptions([]);
                    console.log("No tasks found for this department");
                } else {
                    setTaskOptions(taskOption);
                }


                // Initialize taskObj to null
                let taskObj = null;

                if (promptData && promptData.taskName) {
                    // Check if promptData.taskName exists in taskOption
                    const isPromptTaskFound = taskOption.find(
                        (item) => item.title.toLowerCase() == promptData.taskName.toLowerCase()
                    );

                    // Set taskObj to the matched task or a new entry
                    taskObj = isPromptTaskFound || { id: 0, title: promptData.taskName, departmentId: selectedDepartment.id };
                    console.log(isPromptTaskFound)
                    // If taskObj is new, add it to taskOptions
                    if (!isPromptTaskFound) {
                        setTaskOptions((prevOptions) => [...prevOptions, taskObj]);
                    }
                    // setTaskOptions(taskObj)
                    console.log('Task object based on promptData:', taskObj);
                }
            } else {
                setErrors('Failed to fetch tasks');
            }

        } catch (error) {
            setErrors('Error fetching tasks');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }


    const tableCorrectiveHandleRemoveFile = async (rowId, fileIndex) => {
        // Check if the selected file exists in the row's files
        const fileToDelete = tableCorrectveSelectedFiles[rowId][fileIndex];
        if (!fileToDelete) return;

        try {
            const payload = {
                documentId: fileToDelete.documentId,
                documentName: fileToDelete.documentName
            };

            const response = await axios.post(deleteFile, payload);

            if (response.status === 200) {
                setTableCorectiveSelectedFiles(prevState => {
                    const updatedFiles = prevState[rowId].filter((_, index) => index !== fileIndex);
                    return {
                        ...prevState,
                        [rowId]: updatedFiles
                    };
                });
                setMessage("File deleted successfully.");
                setSeverity('success');
                setOpen(true);
                invokeHistory();
                fetchTaskIncident();
            } else {
                setMessage("Failed to delete the file.");
                setSeverity('error');
                setOpen(true);
                invokeHistory();
            }
        } catch (error) {
            console.error("Error deleting the file:", error);
            setMessage("An error occurred while deleting the file.");
            setSeverity('error');
            setOpen(true);
            invokeHistory();
        }
    };




    // const fetchTaskDropdown = async () => {
    //     try {
    //         const payload = {
    //             sourceName: "Incident Task"
    //         }
    //         const response = await axios.post(getMastersListByType, payload)
    //         console.log(response)

    //         const taskOption = response.data.masterList.map((task) => ({
    //             id: task.sourceId,
    //             title: task.sourceType
    //         }));
    //         console.log('Mapped task options:', taskOption);
    //         setTaskOptions(taskOption);
    //         // console.log("taskOptions", taskOptions)
    //         console.log(promptData)
    //         let taskObj;
    //         if (taskOptions && taskOptions.length > 0) {
    //             // if (promptData && promptData.taskName) {
    //             //     let isPromptTaskFound = taskOptions.find((item) => item.title.toLowerCase() == promptData.taskName.toLowerCase())

    //             //     if (isPromptTaskFound) {
    //             //         taskObj = isPromptTaskFound
    //             //     } else {
    //             //         taskObj = { id: 0, title: promptData.taskName }
    //             //     }
    //             // }

    //             if (taskOption.length > 0 && promptData && promptData.taskName) {
    //                 // Search in taskOption directly
    //                 const isPromptTaskFound = taskOption.find(
    //                     (item) => item.title.toLowerCase() === promptData.taskName.toLowerCase()
    //                 );

    //                 // Set taskObj to either the found task or a new entry
    //                 taskObj = isPromptTaskFound || { id: 0, title: promptData.taskName };
    //                 console.log('Task object based on promptData:', taskObj);
    //             }
    //         }
    //         // setTaskOptions(taskObj)
    //         console.log(taskOptions)

    //     } catch (error) {
    //         console.log('Failed to fetch Task dropdown options:', error)
    //     }

    // }

    // const fetchTaskDropdown = async () => {
    //     try {
    //         const payload = {
    //             sourceName: "Incident Task"
    //         };
    //         const response = await axios.post(getMastersListByType, payload);
    //         console.log(response)

    //         const taskOption = response.data.masterList.map((task) => ({
    //             id: task.sourceId,
    //             title: task.sourceType
    //         }));

    //         console.log('Mapped task options:', taskOption);

    //         // Set taskOptions with taskOption fetched from the API
    //         setTaskOptions(taskOption);

    //         // Initialize taskObj to null
    //         let taskObj = null;

    //         if (promptData && promptData.taskName) {
    //             // Check if promptData.taskName exists in taskOption
    //             const isPromptTaskFound = taskOption.find(
    //                 (item) => item.title.toLowerCase() == promptData.taskName.toLowerCase()
    //             );

    //             // Set taskObj to the matched task or a new entry
    //             taskObj = isPromptTaskFound || { id: 0, title: promptData.taskName };
    //             console.log(isPromptTaskFound)
    //             // If taskObj is new, add it to taskOptions
    //             if (!isPromptTaskFound) {
    //                 setTaskOptions((prevOptions) => [...prevOptions, taskObj]);
    //             }
    //             // setTaskOptions(taskObj)
    //             console.log('Task object based on promptData:', taskObj);
    //         }

    //     } catch (error) {
    //         console.log('Failed to fetch Task dropdown options:', error);
    //     }
    // };


    const handleTaskDropdownChange = async (newValue) => {
        if (newValue && newValue.inputValue) {
            try {
                const payload = {
                    // sourceName: "Incident Task",
                    // sourceType: newValue.inputValue
                    departmentId: selectedDepartment.id,
                    taskName: newValue.inputValue
                }
                const response = await axios.post(saveTasksForDepartment, payload);
                // if (response?.data?.statusResponse?.responseCode === 200) {
                //     const createdTask = {
                //         id: response.data.taskId,
                //         title: response.data.taskName,
                //         deptId: selectedDepartment.id,
                //     };

                //     // Update taskOptions with the newly created task
                //     setTaskOptions((prevOptions) => [...prevOptions, createdTask]);
                //     console.log("Task created and added to options:", createdTask);

                if (response && response.data && response.data.tasks && response.data.tasks) {
                    const newTaskOption = {
                        // title: newValue.inputValue,
                        id: response.data.tasks.taskId,
                        title: response.data.tasks.taskName,
                        deptId: response.data.tasks.departmentId
                    };
                    setTaskOptions(prev => [...prev, newTaskOption]);
                    console.error("Failed to add new task option: ID not returned.");
                    // id: task.taskId,
                    // title: task.taskName,
                    // deptId: task.departmentId
                    setMessage('Option added successfully!');
                    setSeverity('success')
                    setOpen(true);
                } else {
                    setMessage("Failed to add option: ID not returned.");
                    setSeverity('error');
                    setOpen(true);
                }
            } catch (error) {
                console.error("Error adding new task:", error);
                setMessage("Failed to add option.");
                setSeverity('error');
                setOpen(true);
            }
        }
    }

    // const handleTaskDropdownChange = async (newValue) => {
    //     if (newValue && newValue.inputValue) {
    //         try {
    //             const payload = {
    //                 sourceName: "Incident Task",
    //                 sourceType: newValue.inputValue
    //             }
    //             const response = await axios.post(addMasterByType, payload);

    //             if (response && response.data && response.data.masterSource && response.data.masterSource.sourceId) {
    //                 const newTaskOption = { title: newValue.inputValue, id: response.data.masterSource.sourceId };
    //                 setTaskOptions(prev => [...prev, newTaskOption]);
    //                 console.error("Failed to add new task option: ID not returned.");

    //                 setMessage('Option added successfully!');
    //                 setSeverity('success')
    //                 setOpen(true);
    //             } else {
    //                 setMessage("Failed to add option: ID not returned.");
    //                 setSeverity('error');
    //                 setOpen(true);
    //             }
    //         } catch (error) {
    //             console.error("Error adding new task:", error);
    //             setMessage("Failed to add option.");
    //             setSeverity('error');
    //             setOpen(true);
    //         }
    //     }
    // }

    const validateTaskSave = (row) => {
        const validateErrors = {};
        // if (!row.taskId) {
        //     validateErrors.taskId = 'Task is required';
        // }
        // if (!row.taskId == undefined) {
        //     validateErrors.taskId = 'Task is required or invalid';
        // }

        if (!row.taskId && !row.task) {
            validateErrors.taskId = 'Task is required.';
        }
        //  else if (row.taskId === undefined || row.taskId === 0) {
        //     validateErrors.taskId = 'Invalid task selection.';
        // }
        if (!row.dueDate) {
            validateErrors.dueDate = 'Due date is required';
        } else if (new Date(row.dueDate) < new Date()) {
            validateErrors.dueDate = 'Due date cannot be in the past or current date';
        }
        setRowErrors(prev => ({ ...prev, [row.id]: validateErrors }));
        return Object.keys(validateErrors).length === 0;
    }

    const handleTaskSave = async (row) => {

        if (!validateTaskSave(row)) {
            console.log('validation failed')
            return
        }

        setLoading(true);
        try {
            const formData = new FormData();
            const payload = {
                createdBy: 1,
                flag: row.capTaskId ? 'U' : 'I',
                incidentId: id,
                capTaskId: row.capTaskId ? row.capTaskId : 0,
                taskId: row.taskId,
                dueDate: row.dueDate || '',
                resolvedFlag: row.resolved ? 1 : 0,
                taskName: row.taskId ? "" : row.task,
                departmentId: selectedDepartment.id

            }
            console.log(payload)
            formData.append('tasks', JSON.stringify(payload));
            fetchTaskIncident();

            const selectedFiles = tableCorrectveSelectedFiles[row.id];
            if (selectedFiles && Array.isArray(selectedFiles) && selectedFiles.length > 0) {
                selectedFiles.forEach((file) => {
                    formData.append('files', file);
                });
            }

            const response = await axios.post(saveTasksForCap, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })

            console.log("correction action table data:", response)
            if (response.data.statusResponse.responseCode === 201) {
                // await fetchTaskDropdown();
                await fetchTaskbyDepartment(selectedDepartment.id)
                await fetchTaskIncident();
                setMessage('Task created sucessfully');
                setSeverity('success')
                invokeHistory()
                setOpen(true)
                // window.location.reload()
            } else if (response.data.statusResponse.responseCode === 200) {
                await fetchTaskbyDepartment(selectedDepartment.id)
                await fetchTaskIncident();
                setMessage('Task Updated sucessfully');
                setSeverity('success')
                invokeHistory()
                setOpen(true)
                // window.location.reload()

            } else {
                setMessage("Failed to assign task.");
                setSeverity('error');
                invokeHistory()
                await fetchTaskIncident();
                setOpen(true);
            }
        } catch (error) {
            console.log('Error in assigning the task:', error)
            setMessage("Failed to submit Task assigning. Error: " + error.message);
            setSeverity('error');
            invokeHistory()

            setOpen(true);
        } finally {
            setLoading(false);
            setOpen(true);
        }
    }

    const fetchTaskIncident = async () => {
        setCorrectiveRows([])
        try {
            const payload = {
                incidentId: id,
                orgId: 1
            };
            const response = await axios.post(getTasksForIncident, payload);
            console.log(response);

            const data = response.data.taskListDetails || [];;
            console.log(data);

            const taskIds = data.map(task => task.capTaskId);
            setIncidentTaskId(taskIds);
            console.log(incidentTaskId)

            const taskData = data.map((task) => ({
                id: task.capTaskId || Date.now(), // Use capTaskId for the task id
                task: task.taskName || '',
                taskId: task.taskID || '',
                dueDate: task.dueDate ? task.dueDate.split(' ')[0] : '',
                resolved: task.resolvedFlag === 1,
                capTaskId: task.capTaskId
            }));
            console.log("taskData", taskData)
            if (taskData && taskData.length > 0) {
                setCorrectiveRows(taskData);

            } else {
                // setCorrectiveRows([{ 
                //     id: 1, 
                //     task: '', taskId: '', dueDate: '', resolved: false, capTaskId: "" },])
                setCorrectiveRows([{
                    id: Date.now(), // Unique ID
                    task: '',
                    taskId: '',
                    dueDate: '',
                    resolved: false,
                    capTaskId: ''
                }]);
            }


            // Map files to tasks
            const files = response.data.taskFileDetails || [];

            const taskFilesMap = {};

            files.forEach(file => {
                const taskId = file.entityId2;
                if (!taskFilesMap[taskId]) {
                    taskFilesMap[taskId] = [];
                }
                taskFilesMap[taskId].push(file);
            });

            setTableCorectiveSelectedFiles(taskFilesMap);
        } catch (error) {
            console.log('Error in fetching task details', error);
            setCorrectiveRows([{
                id: Date.now(), // Unique ID
                task: '',
                taskId: '',
                dueDate: '',
                resolved: false,
                capTaskId: ''
            }]);
        }
    };

    const validateCorrectiveAction = () => {
        const newErrors = {}
        if (!comments || comments.trim() === '') {
            newErrors.comments = 'Comments is required'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0;
    }
    const submit_corrective_action = async (e) => {
        e.preventDefault();
        if (!validateCorrectiveAction()) {
            console.log("Form validation failed");
            return;
        }
        setLoading(true)
        try {
            const requestBody = {
                incidentId: id,
                flag: correctiveId ? 'U' : 'I',
                userId: userId,
                comments: comments,
                incidentActionPlanId: correctiveId ? correctiveId : '0'
            }

            console.log(requestBody)


            if (correctiveSelectedFiles > 10) {
                console.log("Cannot upload more than 10 files");
                setMessage("Cannot upload more than 10 files..");
                setSeverity('error');
                setOpen(true);
                return;
            }


            const formData = new FormData();
            formData.append('corrective', JSON.stringify(requestBody));


            if (correctiveSelectedFiles && correctiveSelectedFiles.length > 0) {
                correctiveSelectedFiles.forEach((file, index) => {
                    formData.append('files', file)
                })
            }

            console.log("Submitting investigation:", requestBody);


            const response = await axios.post(saveCorrectiveAction, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })
            console.log("corrective action data:", response)

            if (response?.data?.statusResponse?.responseCode === 201) {
                setMessage("corrective action created Successfully");
                setSeverity('success');
                setOpen(true);
                setCorrectiveSelectecFiles([])
                fetchCorrectiveAction();
            } else if (response?.data?.statusResponse?.responseCode === 200) {
                setMessage("corrective action Updated Successfully");
                setSeverity('success');
                setOpen(true);
                setCorrectiveSelectecFiles([])
                fetchCorrectiveAction()
            } else {
                setMessage("Failed to add corrective action.");
                setSeverity('error');
                setOpen(true);
            }
        } catch (error) {
            console.log('Error in saving the corrective action:', error)
            setMessage("Failed to submit corrective action. Error: " + error.message);
            setSeverity('error');
            setOpen(true);
        } finally {
            setLoading(false)
        }
    }

    const fetchCorrectiveAction = async () => {
        try {
            const requestBody = {
                orgId: 1,
                incidentId: id,
                userId: userId
            }
            console.log(requestBody)
            const response = await axios.post(getIncidentCAPDetails, requestBody)
            console.log(response)

            const correctiveData = response.data.incidentCorrectiveActionPlanDetails
            // setIntrimInvestigationData(intrimData)
            setCorrectiveId(correctiveData?.incidentActionPlanId)
            console.log(correctiveId)

            setSelectedFiles(response.data.capFileDetails)
            console.log(selectedFiles)
            console.log("intrimCorrectiveAction", correctiveData)
            if (correctiveData) {
                setComments(correctiveData.comments)
                console.log(correctiveData.comments);
            }
        } catch (error) {
            console.log('Failed to fetch Intrim investigation details:', error)
        }
    }

    const openDeleteDialog = (file, index) => {
        setFileToDelete(file);
        setFileToDeleteIndex(index);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setFileToDelete(null);
        setFileToDeleteIndex(null);
    };

    const confirmDeleteFile = async () => {
        if (!fileToDelete) return;
        try {
            const payload = {
                documentId: fileToDelete.documentId,
                documentName: fileToDelete.documentName
            };

            const response = await axios.post(deleteFile, payload);

            if (response.status === 200) {
                setSelectedFiles(selectedFiles.filter(file => file.documentId !== fileToDelete.documentId));
                setCorrectiveSelectecFiles(correctiveSelectedFiles.filter(file => file.documentId !== fileToDelete.documentId));

                setMessage("File deleted successfully.");
                setSeverity('success');
                setOpen(true);
                invokeHistory()
                setCorrectiveSelectecFiles([])

                const interimFiles = response.data.correctiveFiles || [];
                console.log(interimFiles)
                if (interimFiles.length > 0) {
                    const newFiles = interimFiles.map((file) => ({
                        documentId: file.documentId,
                        documentName: file.documentName,
                        documentSize: file.documentSize,
                        documentUrl: file.documentUrl,
                        documentType: file.documentType,
                        uploadDate: file.uploadDate
                    }));
                    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
                }
                fetchCorrectiveAction();
            } else {
                setMessage("Failed to delete the file.");
                setSeverity('error');
                invokeHistory()
                setOpen(true);
            }
        } catch (error) {
            console.error("Error deleting the file:", error);
            setMessage("An error occurred while deleting the file.");
            setSeverity('error');
            invokeHistory()
            setOpen(true);
        } finally {
            closeDeleteDialog();
        }
    };
    const download = async (url, fileName) => {
        try {
            const payload = { documentName: fileName };
            const response = await axios.post(downloadFile, payload, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const link = document.createElement('a');
            const url = window.URL.createObjectURL(blob);
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error in downloading file:', error);
        }
    };

    const correctivehandleDeleteRow = async (row) => {
        if (correctiveRows.length === 1) {
            console.log('Cannot delete the only row.');
            setCorrectieShowAlert(true);
            return;
        }

        if (row.capTaskId) {
            setLoading(true);
            try {
                const formData = new FormData();
                const payload = {
                    createdBy: 1,
                    flag: 'D',
                    incidentId: id,
                    capTaskId: row.capTaskId,
                    taskId: row.taskId,
                    dueDate: row.dueDate || '',
                    resolvedFlag: row.resolved ? 1 : 0,
                    taskName: row.taskId ? "" : row.task,
                    departmentId: selectedDepartment.id
                };
                console.log(payload)

                formData.append('tasks', JSON.stringify(payload));
                // formData.append('files', '')

                // Call the API to delete the row
                const response = await axios.post(saveTasksForCap, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
                console.log(response)
                if (response.data.statusResponse.responseCode === 203) {
                    fetchTaskIncident()
                    setMessage('Task deleted successfully');
                    setSeverity('success');
                } else {
                    setMessage("Failed to delete the task.");
                    setSeverity('error');
                }
            } catch (error) {
                console.log('Error in deleting the task:', error);
                setMessage("Error deleting task: " + error.message);
                setSeverity('error');
            } finally {
                setLoading(false);
                setOpen(true);
            }
        } else {
            // If no `capTaskId`, it's a locally created row; just delete locally
            const updatedRows = correctiveRows.filter((r) => r.id !== row.id);
            setCorrectiveRows(updatedRows);
            setMessage('Local task row deleted');
            setSeverity('success');
            setOpen(true);
        }
    };
    return (
        <div>
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
                        CORRECTIVE ACTION
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div className='pb-3 table-responsive-container'>
                        <Button
                            className='mb-3 accordian_cancel_btn mt-2'
                            style={{ float: "right" }}
                            onClick={handleAiPrompt}
                        >
                            Create Task with AI Prompt
                        </Button>
                        <TableContainer className='border tbl_scrool'>
                            <Table >
                                <TableHead>
                                    <TableRow>
                                        <TableCell
                                            className='accordian_tbl_txt'
                                            style={{ width: "200px" }}
                                        >
                                            Action taken
                                        </TableCell>
                                        <TableCell
                                            className='accordian_tbl_txt'
                                        >
                                            Supporting Document
                                        </TableCell>
                                        <TableCell className='accordian_tbl_txt'>
                                            Due Date
                                        </TableCell>

                                        <TableCell
                                            className='accordian_tbl_txt'

                                        >
                                            Is Resolved
                                        </TableCell>

                                        <TableCell className='accordian_tbl_txt'>
                                            Action
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                {console.log("correctiveRows", correctiveRows)}
                                <TableBody>
                                    {loading ?
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                <CircularProgress />
                                            </TableCell>
                                        </TableRow>

                                        : (
                                            correctiveRows.map((row) => (
                                                <TableRow
                                                    key={row.id}
                                                    style={{
                                                        backgroundColor: 'rgba(34, 41, 47, 0.05)',
                                                    }}
                                                >
                                                    <TableCell
                                                        style={{ margin: 'auto', textAlign: 'center', minWidth: "200px" }}
                                                    >

                                                        {/* <Autocomplete
                                                            value={taskOptions?.find((option) => option.id === row.taskId) || null}
                                                            onChange={async (event, newValue) => {
                                                                if (newValue) {
                                                                    if (newValue.inputValue) {
                                                                        // If newValue contains inputValue (i.e., a new task is being added)
                                                                        await handleTaskDropdownChange(newValue);  // Call handleTaskChange to add the new task
                                                                    } else {
                                                                        // If existing task is selected
                                                                        correctiveRowshandleChange(row.id, 'taskId', newValue.id); // Set task id for selected task
                                                                    }
                                                                } else {
                                                                    correctiveRowshandleChange(row.id, 'taskId', ''); // Clear the value if no task is selected
                                                                }
                                                                setRowErrors((prev) => ({
                                                                    ...prev,
                                                                    [row.id]: { ...prev[row.id], taskId: undefined }
                                                                }));

                                                            }}
                                                            filterOptions={(options, params) => {
                                                                const { inputValue } = params;
                                                                const filtered = options.filter(option =>
                                                                    option.title.toLowerCase().includes(inputValue.toLowerCase())
                                                                );

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
                                                            options={taskOptions || []}
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
                                                                <li {...props}>
                                                                    {option.addOption ? (
                                                                        <>
                                                                            {option.inputValue} <AddIcon />
                                                                        </>
                                                                    ) : (
                                                                        option.title
                                                                    )}
                                                                </li>
                                                            )}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    label="Task"
                                                                    variant="outlined"
                                                                    error={!!(rowErrors[row.id]?.taskId)}
                                                                    helperText={rowErrors[row.id]?.taskId}
                                                                />
                                                            )}

                                                        /> */}
                                                        <Autocomplete
                                                            // value={
                                                            //     taskOptions.length == 0
                                                            //         ? null 
                                                            //         : taskOptions.find((option) => option.id === row.taskId) || null
                                                            // }
                                                            value={
                                                                taskOptions.find((option) => option.id === row.taskId) || null
                                                            }
                                                            onChange={async (event, newValue) => {
                                                                if (newValue) {
                                                                    if (newValue.inputValue) {
                                                                        // If newValue contains inputValue (i.e., a new task is being added)
                                                                        await handleTaskDropdownChange(newValue); // Call handleTaskChange to add the new task
                                                                    } else {
                                                                        // If existing task is selected
                                                                        correctiveRowshandleChange(row.id, 'taskId', newValue.id); // Set task id for selected task
                                                                    }
                                                                } else {
                                                                    correctiveRowshandleChange(row.id, 'taskId', ''); // Clear the value if no task is selected
                                                                }
                                                                setRowErrors((prev) => ({
                                                                    ...prev,
                                                                    [row.id]: { ...prev[row.id], taskId: undefined }
                                                                }));
                                                            }}
                                                            filterOptions={(options, params) => {
                                                                const { inputValue } = params;
                                                                const filtered = options.filter(option =>
                                                                    option.title.toLowerCase().includes(inputValue.toLowerCase())
                                                                );

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
                                                            options={taskOptions || []}
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
                                                                <li {...props}>
                                                                    {option.addOption ? (
                                                                        <>
                                                                            {option.inputValue} <AddIcon />
                                                                        </>
                                                                    ) : (
                                                                        option.title
                                                                    )}
                                                                </li>
                                                            )}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    label="Task"
                                                                    variant="outlined"
                                                                    error={!!(rowErrors[row.id]?.taskId)}
                                                                    helperText={rowErrors[row.id]?.taskId}
                                                                />
                                                            )}
                                                        />



                                                    </TableCell>
                                                    <TableCell
                                                        style={{ margin: 'auto', textAlign: 'center', minWidth: "200px" }}
                                                    >

                                                        {tableCorrectveSelectedFiles[row.id] && tableCorrectveSelectedFiles[row.id].length > 0
                                                            ?
                                                            <List className='p-0 corrective-list'>
                                                                {tableCorrectveSelectedFiles[row.id].map((file, index) => (
                                                                    <ListItem key={index} className='p-0 file-name'>
                                                                        {console.log("FILE", file)}
                                                                        <ListItemText className='p-0 ' primary={file.name ? file.name : file.documentName} style={{ textDecoration: 'none' }} />



                                                                        <ListItemSecondaryAction>
                                                                            {file.documentName && (
                                                                                <IconButton
                                                                                    edge='end'
                                                                                    aria-label='download'
                                                                                // onClick={() => handleDownloadFile(file.documentName)} // Define this function
                                                                                >
                                                                                    <ArrowDownwardIcon
                                                                                        style={{ marginLeft: "5px", cursor: 'pointer', color: "blue" }}
                                                                                        onClick={() => download(file.documentUrl, file.documentName)}
                                                                                    />
                                                                                </IconButton>
                                                                            )}
                                                                            <IconButton
                                                                                edge='end'
                                                                                aria-label='delete'
                                                                                onClick={() => tableCorrectiveHandleRemoveFile(row.id, index)}
                                                                            >
                                                                                <CloseIcon style={{ color: "red" }} />
                                                                            </IconButton>

                                                                        </ListItemSecondaryAction>
                                                                    </ListItem>
                                                                ))}
                                                            </List>
                                                            :
                                                            <Button
                                                                component='label'
                                                                variant='contained'
                                                                style={{ textTransform: 'capitalize', padding: "12px 29px", backgroundColor: '#533529' }}
                                                                startIcon={<CloudUploadIcon />}
                                                            >
                                                                Upload file
                                                                <VisuallyHiddenInput
                                                                    type='file'
                                                                    multiple
                                                                    style={{ display: 'none' }}
                                                                    onChange={(e) => tableCorrectiveHandleFileChange(e, row.id)}
                                                                />
                                                            </Button>
                                                        }

                                                    </TableCell>
                                                    <TableCell
                                                        style={{ margin: 'auto', textAlign: 'center' }}
                                                    >
                                                        <TextField
                                                            value={row.dueDate}
                                                            onChange={(e) => {
                                                                correctiveRowshandleChange(
                                                                    row.id,
                                                                    'dueDate',
                                                                    e.target.value
                                                                );
                                                                setRowErrors((prevErrors) => ({
                                                                    ...prevErrors,
                                                                    [row.id]: { ...prevErrors[row.id], dueDate: undefined }, // Clear the error for this row's due date
                                                                }));
                                                            }}
                                                            type='date'
                                                            variant='outlined'
                                                            className='date-bg'
                                                            error={!!rowErrors[row.id]?.dueDate}
                                                            helperText={rowErrors[row.id]?.dueDate}

                                                        />
                                                    </TableCell>

                                                    <TableCell
                                                        style={{ margin: 'auto', textAlign: 'center' }}
                                                    >
                                                        <Checkbox
                                                            className='checkbox_color'
                                                            checked={row.resolved}
                                                            onChange={(e) =>
                                                                correctiveRowshandleChange(
                                                                    row.id,
                                                                    'resolved',
                                                                    e.target.checked
                                                                )
                                                            }
                                                        />
                                                    </TableCell>

                                                    <TableCell >
                                                        <div className='d-flex'>
                                                            <IconButton
                                                                onClick={() =>
                                                                    correctivehandleDeleteRow(row)
                                                                    // correctivehandleDeleteRow(row.id)
                                                                }
                                                            >
                                                                <CloseIcon style={{ color: 'red', fontSize: '18px', }} />
                                                            </IconButton>
                                                            <IconButton onClick={CorrectivehandleAddRow}>
                                                                <AddIcon

                                                                    style={{
                                                                        fontSize: '20px',
                                                                        color: "blue"
                                                                    }}
                                                                />
                                                            </IconButton>
                                                            <IconButton onClick={() => handleTaskSave(row)}>
                                                                <DoneIcon
                                                                    style={{
                                                                        fontSize: '20px',
                                                                        color: "green"
                                                                    }}
                                                                />

                                                            </IconButton>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    {/* {correctiveRows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            style={{
                                                backgroundColor: 'rgba(34, 41, 47, 0.05)',
                                            }}
                                        >
                                            <TableCell
                                                style={{ margin: 'auto', textAlign: 'center', minWidth: "200px" }}
                                            >

                                                <Autocomplete
                                                    value={taskOptions.find((option) => option.id === row.taskId) || null}
                                                    onChange={async (event, newValue) => {
                                                        if (newValue) {
                                                            if (newValue.inputValue) {
                                                                // If newValue contains inputValue (i.e., a new task is being added)
                                                                await handleTaskDropdownChange(newValue);  // Call handleTaskChange to add the new task
                                                            } else {
                                                                // If existing task is selected
                                                                correctiveRowshandleChange(row.id, 'taskId', newValue.id); // Set task id for selected task
                                                            }
                                                        } else {
                                                            correctiveRowshandleChange(row.id, 'taskId', ''); // Clear the value if no task is selected
                                                        }
                                                    }}
                                                    filterOptions={(options, params) => {
                                                        const { inputValue } = params;
                                                        const filtered = options.filter(option =>
                                                            option.title.toLowerCase().includes(inputValue.toLowerCase())
                                                        );

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
                                                    options={taskOptions}
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
                                                        <li {...props}>
                                                            {option.addOption ? (
                                                                <>
                                                                    {option.inputValue} <AddIcon />
                                                                </>
                                                            ) : (
                                                                option.title
                                                            )}
                                                        </li>
                                                    )}
                                                    renderInput={(params) => (
                                                        <TextField {...params} label="Task" variant="outlined" />
                                                    )}

                                                />


                                            </TableCell>
                                            <TableCell
                                                style={{ margin: 'auto', textAlign: 'center', minWidth: "200px" }}
                                            >

                                                {tableCorrectveSelectedFiles[row.id] && tableCorrectveSelectedFiles[row.id].length > 0
                                                    ?
                                                    <List className='p-0 corrective-list'>
                                                        {tableCorrectveSelectedFiles[row.id].map((file, index) => (
                                                            <ListItem key={index} className='p-0 file-name'>
                                                                {console.log("FILE", file)}
                                                                <ListItemText className='p-0 ' primary={file.name ? file.name : file.documentName} style={{ textDecoration: 'none' }} />



                                                                <ListItemSecondaryAction>
                                                                    {file.documentName && (
                                                                        <IconButton
                                                                            edge='end'
                                                                            aria-label='download'
                                                                        // onClick={() => handleDownloadFile(file.documentName)} // Define this function
                                                                        >
                                                                            <ArrowDownwardIcon
                                                                                style={{ marginLeft: "5px", cursor: 'pointer', color: "blue" }}
                                                                                onClick={() => download(file.documentUrl, file.documentName)}
                                                                            />
                                                                        </IconButton>
                                                                    )}
                                                                    <IconButton
                                                                        edge='end'
                                                                        aria-label='delete'
                                                                        onClick={() => tableCorrectiveHandleRemoveFile(row.id, index)}
                                                                    >
                                                                        <CloseIcon style={{ color: "red" }} />
                                                                    </IconButton>

                                                                </ListItemSecondaryAction>
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                    :
                                                    <Button
                                                        component='label'
                                                        variant='contained'
                                                        style={{ textTransform: 'capitalize', padding: "12px 29px", backgroundColor: '#533529' }}
                                                        startIcon={<CloudUploadIcon />}
                                                    >
                                                        Upload file
                                                        <VisuallyHiddenInput
                                                            type='file'
                                                            multiple
                                                            style={{ display: 'none' }}
                                                            onChange={(e) => tableCorrectiveHandleFileChange(e, row.id)}
                                                        />
                                                    </Button>
                                                }

                                            </TableCell>
                                            <TableCell
                                                style={{ margin: 'auto', textAlign: 'center' }}
                                            >
                                                <TextField
                                                    value={row.dueDate}
                                                    onChange={(e) =>
                                                        correctiveRowshandleChange(
                                                            row.id,
                                                            'dueDate',
                                                            e.target.value
                                                        )
                                                    }
                                                    type='date'
                                                    variant='outlined'
                                                    className='date-bg'

                                                />
                                            </TableCell>

                                            <TableCell
                                                style={{ margin: 'auto', textAlign: 'center' }}
                                            >
                                                <Checkbox
                                                    className='checkbox_color'
                                                    checked={row.resolved}
                                                    onChange={(e) =>
                                                        correctiveRowshandleChange(
                                                            row.id,
                                                            'resolved',
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                            </TableCell>

                                            <TableCell >
                                                <div className='d-flex'>
                                                    <IconButton
                                                        onClick={() =>
                                                            correctivehandleDeleteRow(row.id)
                                                        }
                                                    >
                                                        <CloseIcon style={{ color: 'red', fontSize: '18px', }} />
                                                    </IconButton>
                                                    <IconButton onClick={CorrectivehandleAddRow}>
                                                        <AddIcon

                                                            style={{
                                                                fontSize: '20px',
                                                                color: "blue"
                                                            }}
                                                        />
                                                    </IconButton>
                                                    <IconButton onClick={() => handleTaskSave(row)}>
                                                        <DoneIcon
                                                            style={{
                                                                fontSize: '20px',
                                                                color: "green"
                                                            }}
                                                        />

                                                    </IconButton>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))} */}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {correctiveShowAlert && (
                            <Alert
                                severity='error'
                                onClose={correctiveHandleCloseAlert}
                            >
                                Cannot delete the only row.
                            </Alert>
                        )}
                    </div>
                    <div className='row'>
                        <div className='col-md-6 pe-3'>
                            <div className='ps-0 file_upload upload-file-border fileupload_responsive'>
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
                                <span style={{ marginLeft: "10px" }} className='responsive_span'> {correctiveSelectedFiles.length > 0 ? `${correctiveSelectedFiles.length} file(s) selected` : 'No file chosen'}</span>
                            </div>
                        </div>
                        <div className='col-md-6 pe-3 mbl_mb'>
                            <Form.Group
                                className='mb-0'
                                controlId='exampleForm.ControlTextarea1'
                            >
                                <Form.Control
                                    style={{ backgroundColor: "#f1f0ef" }}
                                    className='input_border'
                                    as='textarea'
                                    rows={2}
                                    placeholder='Write the comment'
                                    value={comments}
                                    onChange={(e) => {
                                        setComments(e.target.value);
                                        setErrors((prevErrors) => ({
                                            ...prevErrors,
                                            comments: undefined,
                                        }));
                                    }}
                                    isInvalid={!!errors?.comments}
                                />
                                <Form.Control.Feedback type="invalid">{errors?.comments}</Form.Control.Feedback>
                            </Form.Group>
                        </div>

                        {correctiveSelectedFiles.length > 0 && (

                            correctiveSelectedFiles.map((file, index) => (

                                <div className="row attached-files-info mt-3">

                                    <div className="col-md-8">
                                        <div className="attached-files">

                                            <ul>
                                                <li key={index} className='mt-2'>
                                                    <div className="d-flex align-items-center justify-content-between" style={{ width: "100%" }}>
                                                        <div className="d-flex align-items-center">
                                                            <span className="file-icon">
                                                                <TextSnippetIcon style={{ color: "#533529" }} />
                                                            </span>
                                                            <p className="mb-0 ms-2">{file.name}</p>
                                                        </div>
                                                        <div className="file-actions d-flex align-items-center">
                                                            <IconButton
                                                                edge='end'
                                                                aria-label='delete'
                                                                onClick={() => correctiveHandleRemoveFile(index)}
                                                            >
                                                                <CloseIcon className='close_icon' />
                                                            </IconButton>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                            ))
                        )}
                        {selectedFiles && selectedFiles.length > 0 && (
                            <div className="row attached-files-info mt-3">
                                <div className="col-md-8">
                                    <div className="attached-files">
                                        <ul>
                                            {selectedFiles.map((file, index) => (
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
                                                                    onClick={() => download(file.documentUrl, file.documentName)}
                                                                />
                                                            </div>
                                                            <IconButton onClick={() => handleFilePreview(file.documentUrl)}>
                                                                <VisibilityIcon />
                                                            </IconButton>
                                                            <IconButton edge='end' onClick={() => openDeleteDialog(file, index)}>
                                                                <CloseIcon className='close_icon' />
                                                            </IconButton>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className='float-end mt-3 p-0 me-2'>
                            <div className='d-flex justify-content-end gap-3 '>
                                <Button className='accordian_submit_btn' onClick={submit_corrective_action}>
                                    {loading ? "Processing..." : "Submit"}
                                </Button>
                                {/* <Button
                                    className='accordian_cancel_btn'
                                >
                                    Close
                                </Button> */}
                            </div>
                        </div>

                    </div>

                </AccordionDetails>
            </Accordion>

            <Snackbar open={open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleClose} severity={severity}>
                    {message}
                </Alert>
            </Snackbar>

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

            {/* Ai promt diapog */}
            <Dialog maxWidth="sm" fullWidth open={aiPromptOpen} onClose={handeClickAiPromptDialog}>
                <DialogTitle className='dialog_head'>Create Task with AI prompt</DialogTitle>
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
                    <Button className='accordian_submit_btn' onClick={createTaskhandlerwithAiPrompt} color="primary">OK</Button>
                    <Button className=' accordian_cancel_btn' onClick={handeClickAiPromptDialog}>Cancel</Button>

                </DialogActions>
            </Dialog>

            <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
                <DialogTitle className='dialog_head'>Delete Confirmation</DialogTitle>
                <DialogContent className='dialog_content'>
                    <DialogContentText className='mt-4'>Are you sure you want to delete the file "{fileToDelete?.documentName}"?</DialogContentText>
                </DialogContent>
                <DialogActions className='dialog_content'>
                    <Button className='accordian_cancel_btn' onClick={confirmDeleteFile} color="secondary">Delete</Button>
                    <Button className='accordian_submit_btn' onClick={closeDeleteDialog} color="primary">Cancel</Button>  </DialogActions>
            </Dialog>
        </div>
    )
}

export default CorrectiveAction