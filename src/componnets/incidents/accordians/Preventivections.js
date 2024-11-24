import React from 'react';
import { useState, useEffect } from 'react';
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
import { Snackbar, Dialog, DialogContentText, DialogTitle, DialogActions, DialogContent, Alert } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { savePreventiveAction, getPreventiveActionDetails, downloadFile, deleteFile } from '../../../api';

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

const Preventivections = ({ invokeHistory }) => {
    const { id } = useParams();
    const [preventiveActionData, setPreventiveActionData] = useState('')
    const [preventiveFindings, setPreventiveFindings] = useState('')
    const [preventiveId, setPreventiveId] = useState()
    const [preventiveSelectedFiles, setPreventiveSelectedFiles] = useState([]);
    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState('success');
    const [message, setMessage] = useState('');
    const [preventiveFiles, setPreventiveFiles] = useState([])
    const [filePreview, setFilePreview] = useState(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [fileToDeleteIndex, setFileToDeleteIndex] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false)

    const storedUser = JSON.parse(localStorage.getItem('userDetails'));
    const userId = storedUser ? storedUser.userId : null;

    console.log(userId);

    const preventiveHandleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setPreventiveSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    };
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
                setPreventiveFiles(preventiveFiles.filter(file => file.documentId !== fileToDelete.documentId));
                setPreventiveSelectedFiles(preventiveSelectedFiles.filter(file => file.documentId !== fileToDelete.documentId));

                setMessage("File deleted successfully.");
                setSeverity('success');
                setOpen(true);
            } else {
                setMessage("Failed to delete the file.");
                setSeverity('error');
                setOpen(true);
            }
        } catch (error) {
            console.error("Error deleting the file:", error);
            setMessage("An error occurred while deleting the file.");
            setSeverity('error');
            setOpen(true);
        } finally {
            closeDeleteDialog();
        }
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    useEffect(() => {
        fetch_preventive_Action();
    }, [])

    const formValidation = () => {
        const newErrors = {};
        if (!preventiveFindings.trim()) {
            newErrors.preventiveFindings = "Findings is required"
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const submit_Preventive_Action = async (e) => {
        e.preventDefault();
        if (!formValidation()) {
            console.log("Form validation failed");
            return;
        }
        console.log(preventiveId)
        setLoading(true)
        try {
            const requestBody = {
                findings: preventiveFindings,
                incidentId: id,
                // userId: 1,
                createdBy: 1,
                preventiveId: preventiveId ? preventiveId : '0',
                flag: preventiveId ? 'U' : 'I'
            }
            console.log('requestbody', requestBody)

            if (preventiveSelectedFiles > 10) {
                console.log("Cannot upload more than 10 files");
                setMessage("Cannot upload more than 10 files..");
                setSeverity('error');
                setOpen(true);
                return;
            }

            const formData = new FormData();
            formData.append('preventive', JSON.stringify(requestBody))
            if (preventiveSelectedFiles && preventiveSelectedFiles.length > 0) {
                preventiveSelectedFiles.forEach((file, index) => {
                    formData.append('files', file)
                })

            }
            const response = await axios.post(savePreventiveAction, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })
            console.log('response', response)
            if (response?.data?.statusResponse?.responseCode === 201) {
                setMessage("Preventive action created Successfully");
                setSeverity('success');
                invokeHistory()
                setOpen(true);
                setPreventiveSelectedFiles([])
                fetch_preventive_Action()
            } else if (response.data.statusResponse.responseCode === 200) {
                setMessage("Preventive action Updated Successfully");
                setSeverity('success');
                invokeHistory()
                setOpen(true);
                setPreventiveSelectedFiles([])
                fetch_preventive_Action()
            } else {
                setMessage("Failed to add Preventive action.");
                setSeverity('error');
                setOpen(true);
            }
        } catch (error) {
            console.log('error in saving preventive action:', error)
            setMessage("Failed to submit Preventive action. Error: " + error.message);
            setSeverity('error');
            setOpen(true);
        } finally {
            setLoading(false)
        }
    }

    const fetch_preventive_Action = async () => {
        try {
            const requestBody = {
                orgId: 1,
                incidentId: id,
                userId: userId
            }
            const response = await axios.post(getPreventiveActionDetails, requestBody)
            console.log('response', response);
            const preventiveData = response.data.preventiveActionDetails;
            const pFiles = response.data.preventiveActionFiles
            setPreventiveFiles(pFiles);
            console.log(preventiveData)
            setPreventiveActionData(preventiveData);
            setPreventiveId(preventiveData.preventiveId)
            console.log(preventiveId)
            if (preventiveData) {
                setPreventiveFindings(preventiveData.findings)
                console.log(preventiveFindings)
            }
        } catch (error) {
            console.log('Failed to fetch preventive action details:', error)
        }
    }

    const handleFilePreview = (fileUrl) => {
        console.log("fileclik")
        setFilePreview(fileUrl); // Set the selected file URL
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
            <Accordion>
                <AccordionSummary
                    style={{
                        // color: '#0c63e4',
                        backgroundColor: '#533529',
                        boxShadow: 'inset 0 -1px 0 rgba(0, 0, 0, .125);',
                        padding: '0px 20px',
                    }}
                    expandIcon={<ExpandMoreIcon className='accordian_arrow' />}
                    aria-controls='panel4-content'
                    id='panel4-header'
                >
                    <Typography className='accord_typo'>
                        PREVENTIVE ACTION
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div className='row'>
                        <div className='col-md-6 pe-3'>
                            <Form.Group
                                className=''
                                controlId='exampleForm.ControlTextarea1'
                            >
                                <Form.Control
                                    style={{ backgroundColor: "#f1f0ef" }}
                                    name='findings'
                                    as='textarea'
                                    rows={2}
                                    placeholder='Write your findings'
                                    value={preventiveFindings ? preventiveFindings : ''}
                                    onChange={(e) => {
                                        setPreventiveFindings(e.target.value);
                                        setErrors((prevErrors) => ({
                                            ...prevErrors,
                                            preventiveFindings: undefined,
                                        }));
                                    }}
                                    isInvalid={!!errors.preventiveFindings}
                                />
                                 <Form.Control.Feedback type="invalid">{errors.preventiveFindings}</Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className='col-md-6 ps-0 file_upload upload-file-border fileupload_responsive'>
                            {/* <div className='col-md-12  file_upload'>
                                <input class="form-control" type="file" id="formFileMultiple" multiple onChange={preventiveHandleFileChange} />
                            </div> */}
                            <Button
                                component='label'

                                style={{ color: "black" }}

                            >
                                Choose file
                                <VisuallyHiddenInput
                                    type='file'
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={preventiveHandleFileChange}
                                />
                            </Button>
                            <span className='vertical-line'></span>
                            <span style={{ marginLeft: "10px" }} className='responsive_span'> {preventiveSelectedFiles.length > 0 ? `${preventiveSelectedFiles.length} file(s) selected` : 'No file chosen'}</span>

                        </div>
                    </div>

                    {preventiveSelectedFiles.length > 0 && (
                        preventiveSelectedFiles.map((file, index) => (
                            <div className="row attached-files-info mt-3">
                                <div className="col-xxl-6">
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
                                                        <IconButton edge='end' onClick={() => setPreventiveSelectedFiles(preventiveSelectedFiles.filter((_, i) => i !== index))}>
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
                    {Array.isArray(preventiveFiles) && preventiveFiles.length > 0 && (
                        <div className="row attached-files-info mt-3">
                            <div className="col-xxl-6">
                                <div className="attached-files">
                                    <ul>
                                        {preventiveFiles.map((file, index) => (
                                            <li key={index} className='mt-2'>
                                                <div className="d-flex align-items-center justify-content-between" style={{ width: "100%" }}>
                                                    <div className="d-flex align-items-center">
                                                        <span className="file-icon">
                                                            <TextSnippetIcon style={{ color: "#533529" }} />
                                                        </span>
                                                        <p className="mb-0 ms-2">
                                                            <a target="_blank" rel="noopener noreferrer">
                                                                {file.documentName}
                                                            </a> ({(file.documentSize / 1024).toFixed(2)} KB)
                                                        </p>
                                                    </div>
                                                    <div className="file-actions d-flex align-items-center">
                                                        {/* <div className="file-download me-2"> */}
                                                        <ArrowDownwardIcon
                                                            style={{ marginRight: "5px", cursor: 'pointer' }}
                                                            onClick={() => download(file.documentUrl, file.documentName)}
                                                        />
                                                        {/* </div> */}
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

                    <div className='d-flex justify-content-end gap-3 mt-3'>
                        <Button className='accordian_submit_btn'
                            onClick={submit_Preventive_Action}
                        >
                          {loading ? "Procesing..." : "Submit"}  
                        </Button>
                    </div>
                </AccordionDetails>
            </Accordion>

            {/* <Snackbar open={open} autoHideDuration={2000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleClose} severity={severity} >
                    {message}
                </Alert>
            </Snackbar> */}
            <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
                <DialogTitle className='dialog_head'>Delete Confirmation</DialogTitle>
                <DialogContent className='dialog_content'>
                    <DialogContentText className='mt-4'>Are you sure you want to delete the file "{fileToDelete?.documentName}"?</DialogContentText>
                </DialogContent>
                <DialogActions className='dialog_content'>
                    <Button className='accordian_cancel_btn' onClick={confirmDeleteFile} color="secondary">Delete</Button>
                    <Button className='accordian_submit_btn' onClick={closeDeleteDialog} color="primary">Cancel</Button> </DialogActions>
            </Dialog>

            <Dialog
                open={Boolean(filePreview)}
                onClose={() => filePreview(null)}
                fullWidth
                maxWidth="xl"
                sx={{
                    '& .MuiDialog-paper': {
                        width: '80vw',
                        maxWidth: 'none',
                    }
                }}
            >
                <DialogContent>
                    {filePreview && (
                        <iframe
                            src={filePreview}
                            width="100%"
                            height="500px"
                            style={{ border: 'none' }}
                            title="File Preview"
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFilePreview(null)} className='accordian_submit_btn' >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={open} autoHideDuration={2000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleClose} severity={severity}>{message}</Alert>
            </Snackbar>
        </div>
    )
}

export default Preventivections