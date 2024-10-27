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


import { getMastersListByType, addMasterByType, saveTasksForCap, getTasksForIncident, saveCorrectiveAction, getIncidentCAPDetails, addTasksWithAI, deleteFile, downloadFile } from '../../../api';
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

const CorrectiveAction = ({ invokeHistory }) => {
    const { id } = useParams();
    console.log(id)

    const [correctiveRows, setCorrectiveRows] = useState([
        { id: 1, task: '', taskId: '', dueDate: '', resolved: false },
    ]);
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

    console.log(userId);



    const handeClickAiPromptDialog = () => {
        setAiPromptOpen(!aiPromptOpen)
    }
    const handleAiPrompt = () => {
        setAiPromptOpen(true)
    };

    const createTaskhandlerwithAiPrompt = async () => {
        try {
            const response = await axios.post(addTasksWithAI, {
                userPrompt: prompt
            });
            const data = response.data
            setPromptData(data)
            console.log('aidata', data, taskOptions)
            console.log('duedateAI', data.dueDate, data.taskId)

            const newRow = {
                id: "",
                task: data.taskName || '',
                taskId: taskOptions.some(opt => opt.id === data.taskId) ? data.taskId : 0,
                dueDate: data.dueDate || '',
                resolved: data.isResolved || false,
                capTaskId: "",
            };
            let isTaskFound = taskOptions.find((item) => item.title == data.taskName);
            if (isTaskFound) {

            } else {
                setTaskOptions([...taskOptions, { id: 0, title: data.taskName }]);

            }

            // setCorrectiveRows((prevRows) => [...prevRows, newRow]);
            setAiPromptOpen(false)
            setPromt('')
            if (correctiveRows && correctiveRows.length > 0) {
                if (correctiveRows[0].taskId) {
                    setCorrectiveRows([...correctiveRows, newRow]);

                } else {
                    setCorrectiveRows([newRow]);

                }
            } else {
                setCorrectiveRows([newRow]);
            }


            console.log('aiproData', promptData)
        } catch (error) {
            console.log('Error creating incident with ai prompt:', error)
        }

    }

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
        const newRow = {
            id: "",
            task: '',
            taskId: '',
            dueDate: '',
            resolved: false,
            capTaskId: "",
        };
        setCorrectiveRows([...correctiveRows, newRow]);

        // Initialize an empty array for selected files for the new row
        setTableCorectiveSelectedFiles(prevState => ({
            ...prevState,
            [newRow.id]: [] // Initialize an empty array for files specific to the new row
        }));
    };

    const correctivehandleDeleteRow = (id) => {
        if (correctiveRows.length === 1) {
            console.log('Cannot delete the only row.');
            setCorrectieShowAlert(true);
        } else {
            const updatedRows = correctiveRows.filter((row) => row.id !== id);
            console.log("updatedRows", updatedRows)
            setCorrectiveRows(updatedRows);
            // setCorrectiveRows(updatedRows.length > 0 ? updatedRows : [{ id: 1, task: "", taskId: "", dueDate: "", resolved: false }]);
        }
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


    const correctiveRowshandleChange = (rowId, field, value) => {
        console.log(rowId, field, value)
        const updatedRows = correctiveRows.map((row) =>
            row.id === rowId ? { ...row, [field]: value } : row
        );
        setCorrectiveRows(updatedRows);
    };
    const tableCorrectiveHandleFileChange = (e, rowId) => {
        const selectedFiles = [...e.target.files];
        setTableCorectiveSelectedFiles(prevState => ({
            ...prevState,
            [rowId]: selectedFiles // Store files for the specific row by rowId
        }));

    };
    // const tableCorrectiveHandleRemoveFile = (rowId, fileIndex) => {
    //     setTableCorectiveSelectedFiles(prevState => {
    //         const updatedFiles = prevState[rowId].filter((_, index) => index !== fileIndex);
    //         return {
    //             ...prevState,
    //             [rowId]: updatedFiles
    //         };
    //     });
    // };
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


    useEffect(() => {
        fetchTaskDropdown();
        fetchTaskIncident();
        fetchCorrectiveAction();
    }, [])

    const fetchTaskDropdown = async () => {
        try {
            const payload = {
                sourceName: "Incident Task"
            }
            const response = await axios.post(getMastersListByType, payload)
            console.log(response)

            const taskOption = response.data.masterList.map((task) => ({
                id: task.sourceId,
                title: task.sourceType
            }));
            setTaskOptions(taskOption);

        } catch (error) {
            console.log('Failed to fetch Task dropdown options:', error)
        }

    }

    const handleTaskDropdownChange = async (newValue) => {
        if (newValue && newValue.inputValue) {
            try {
                const payload = {
                    sourceName: "Incident Task",
                    sourceType: newValue.inputValue
                }
                const response = await axios.post(addMasterByType, payload);

                if (response && response.data && response.data.masterSource && response.data.masterSource.sourceId) {
                    const newTaskOption = { title: newValue.inputValue, id: response.data.masterSource.sourceId };
                    setTaskOptions(prev => [...prev, newTaskOption]);
                    console.error("Failed to add new task option: ID not returned.");

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

    const handleTaskSave = async (row) => {
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
                taskName:row.taskId ? "" : row.task

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
                fetchTaskIncident();
                setMessage('Task created sucessfully');
                setSeverity('success')
                invokeHistory()
                setOpen(true)
            } else if (response.data.statusResponse.responseCode === 200) {
                fetchTaskIncident();
                setMessage('Task Updated sucessfully');
                setSeverity('success')
                invokeHistory()
                setOpen(true)
            } else {
                setMessage("Failed to assign task.");
                setSeverity('error');
                invokeHistory()
                fetchTaskIncident();
                setOpen(true);
            }
        } catch (error) {
            console.log('Error in assigning the task:', error)
            setMessage("Failed to submit Task assigning. Error: " + error.message);
            setSeverity('error');
            invokeHistory()

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

            const data = response.data.taskListDetails;
            console.log(data);

            const taskIds = data.map(task => task.capTaskId);
            setIncidentTaskId(taskIds);
            console.log(incidentTaskId)

            const taskData = data.map((task) => ({
                id: task.capTaskId || 0, // Use capTaskId for the task id
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
                setCorrectiveRows([{ id: 1, task: '', taskId: '', dueDate: '', resolved: false, capTaskId: "" },])
            }


            // Map files to tasks
            const files = response.data.taskFileDetails;

            const taskFilesMap = {}; // Create a map to hold files for each task

            files.forEach(file => {
                const taskId = file.entityId2; // Use entityId2 for mapping
                if (!taskFilesMap[taskId]) {
                    taskFilesMap[taskId] = []; // Initialize if not present
                }
                taskFilesMap[taskId].push(file); // Add the file to the corresponding task
            });

            setTableCorectiveSelectedFiles(taskFilesMap); // Set the mapped files in the state
        } catch (error) {
            console.log('Error in fetching task details', error);
        }
    };


    const submit_corrective_action = async () => {
        // {
        //     "flag":"U",
        //         "incidentId":15,
        //         "incidentActionPlanId":1, 
        //         "comments":"This is test for CAP  comments updated",
        //         "userId":1

        //     }

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

                const correctiveFiles = response.data.correctiveFiles || [];
                console.log(correctiveFiles)
                if (correctiveFiles.length > 0) {
                    const newFiles = correctiveFiles.map((file) => ({
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
            } else if (response?.data?.statusResponse?.responseCode === 200) {
                setMessage("corrective action Updated Successfully");
                setSeverity('success');
                setOpen(true);
                setCorrectiveSelectecFiles([])
                const newFiles = response?.data?.correctiveFiles?.map((file) => ({
                    documentId: file.documentId,
                    documentName: file.documentName,
                    documentSize: file.documentSize,
                    documentUrl: file.documentUrl,
                    documentType: file.documentType,
                    uploadDate: file.uploadDate
                }))
                setSelectedFiles(prevFiles => [...prevFiles, ...newFiles])
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
            setCorrectiveId(correctiveData.incidentActionPlanId)
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
            } else if (response?.data?.statusResponse?.responseCode === 200) {
                setMessage("Interim investigation Updated Successfully");
                setSeverity('success');
                invokeHistory()
                setOpen(true);
                setCorrectiveSelectecFiles([])
                const newFiles = response?.data?.correctiveFiles?.map((file) => ({
                    documentId: file.documentId,
                    documentName: file.documentName,
                    documentSize: file.documentSize,
                    documentUrl: file.documentUrl,
                    documentType: file.documentType,
                    uploadDate: file.uploadDate
                }))
                setSelectedFiles(prevFiles => [...prevFiles, ...newFiles])
                fetchCorrectiveAction()
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
                    <div className='pb-3'>
                        <Button
                            className='mb-3 accordian_cancel_btn mt-2'
                            style={{ float: "right" }}
                            onClick={handleAiPrompt}
                        >
                            Create Task with AI Prompt </Button>
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
                                    {correctiveRows.map((row) => (
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
                                                    {/* <Button
                                                        color='success'
                                                        style={{ fontWeight: "600" }}
                                                        // variant='contained'
                                                        onClick={() => handleTaskSave(row)}
                                                    >Save</Button> */}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
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
                            <div className='ps-0 file_upload upload-file-border'>
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
                                <span style={{ marginLeft: "10px" }}> {correctiveSelectedFiles.length > 0 ? `${correctiveSelectedFiles.length} file(s) selected` : 'No file chosen'}</span>
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
                                    onChange={(e) => setComments(e.target.value)}
                                />
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
                                <Button className='accordian_submit_btn' onClick={submit_corrective_action}>Submit</Button>
                                <Button
                                    className='accordian_cancel_btn'
                                >
                                    Close
                                </Button>
                            </div>
                        </div>

                        <div className='row accordian_row'>
                            {/* <div className='col-md-8 ps-0 file_upload upload-file-border'>
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
                                <span style={{ marginLeft: "10px" }}> {correctiveSelectedFiles.length > 0 ? `${correctiveSelectedFiles.length} file(s) selected` : 'No file chosen'}</span>
                            </div> */}





                        </div>

                    </div>

                </AccordionDetails>
            </Accordion>

            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
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