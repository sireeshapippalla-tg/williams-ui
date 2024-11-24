import React, { useState, useEffect } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useParams } from 'react-router-dom';
import { Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Alert } from '@mui/material';
import { saveIncidentInterim, getIncidentInterimDetails, uploadDocuments, downloadFile, deleteFile } from '../../../api';

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

const IntrimAccordian = ({ invokeHistory }) => {
    const { id } = useParams();
    const [intrimFindings, setIntrimfindings] = useState('');
    const [interimSelectedFiles, setInterimSelectedFiles] = useState([]);
    const [interimId, setInterimId] = useState();
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    const [open, setOpen] = useState(false);
    const [intrimInvestigationData, setIntrimInvestigationData] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedFileUrl, setSelectedFileUrl] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [fileToDeleteIndex, setFileToDeleteIndex] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false)

    const storedUser = JSON.parse(localStorage.getItem('userDetails'));
    const userId = storedUser ? storedUser.userId : null;

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
                setInterimSelectedFiles(interimSelectedFiles.filter(file => file.documentId !== fileToDelete.documentId));

                setMessage("File deleted successfully.");
                setSeverity('success');
                setOpen(true);
                invokeHistory()
                setInterimSelectedFiles([])

                const interimFiles = response.data.interimFiles || [];
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
                fetchIntrimInvestigation();
            } else if (response?.data?.statusResponse?.responseCode === 200) {
                setMessage("Interim investigation Updated Successfully");
                setSeverity('success');
                invokeHistory()
                setOpen(true);
                setInterimSelectedFiles([])
                const newFiles = response?.data?.interimFiles?.map((file) => ({
                    documentId: file.documentId,
                    documentName: file.documentName,
                    documentSize: file.documentSize,
                    documentUrl: file.documentUrl,
                    documentType: file.documentType,
                    uploadDate: file.uploadDate
                }))
                setSelectedFiles(prevFiles => [...prevFiles, ...newFiles])
                fetchIntrimInvestigation()
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

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setOpen(false);
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setInterimSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    };

    const handleFilePreview = (fileUrl) => {
        setSelectedFileUrl(fileUrl);
    };

    const download = async (fileName) => {
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

    useEffect(() => {
        fetchIntrimInvestigation();
    }, []);

    const fetchIntrimInvestigation = async () => {
        try {
            const requestBody = { orgId: 1, incidentId: id, userId: userId };
            console.log(requestBody)
            const response = await axios.post(getIncidentInterimDetails, requestBody);
            console.log("interim response", response)
            const intrimData = response.data.incidentInterimDetails;
            console.log("intrimData", intrimData)
            setIntrimInvestigationData(intrimData);
            setInterimId(intrimData.interimId);
            setSelectedFiles(response.data.interimFiles);
            if (intrimData) setIntrimfindings(intrimData.findings);
        } catch (error) {
            console.log('Failed to fetch Intrim investigation details:', error);
        }
    };

    const formValidation = () => {
        const newErrors = {};
        if (!intrimFindings.trim()) {
            newErrors.intrimFindings = "Findings is required"
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }
    const submit_Intirm_Investagation = async (e) => {
        e.preventDefault();
        if (!formValidation()) {
            console.log("Form validation failed");
            return;
        }
        console.log(interimId)
        setLoading(true)
        try {
            const requestBody = {
                findings: intrimFindings,
                incidentId: id,
                createdBy: userId,
                interimId: interimId ? interimId : '0',
                flag: interimId ? 'U' : 'I'
            };

            const formData = new FormData();
            formData.append('interim', JSON.stringify(requestBody));
            interimSelectedFiles.forEach((file) => formData.append('files', file));

            const response = await axios.post(saveIncidentInterim, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

            if (response?.data?.statusResponse?.responseCode === 201) {
                setMessage("Interim investigation created Successfully");
                setSeverity('success');
                invokeHistory()
                setOpen(true);
                setInterimSelectedFiles([]);
                fetchIntrimInvestigation();
            } else if (response?.data?.statusResponse?.responseCode === 200) {
                setMessage("Interim investigation Updated Successfully");
                setSeverity('success');
                setOpen(true);
                setInterimSelectedFiles([]);
                fetchIntrimInvestigation();
            } else {
                setMessage("Failed to add Interim investigation.");
                setSeverity('error');
                setOpen(true);
            }
        } catch (error) {
            setMessage("Failed to submit interim investigation. Error: " + error.message);
            setSeverity('error');
            setOpen(true);
        } finally {
            setLoading(false)
        }
    };

    return (
        <div className=''>
            <Accordion className='mb-2 border accordian_arrow'>
                <AccordionSummary
                    style={{ backgroundColor: '#533529', padding: '0px 20px', width: '100%' }}
                    expandIcon={<ExpandMoreIcon className='accordian_arrow' />}
                    aria-controls='panel1-content'
                    id='panel1-header'
                    className='text-primary w-full accordian_sum '
                >
                    <Typography className='accord_typo'>INTERIM INVESTIGATION</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div className='row'>
                        <div className='col-md-6 col-sm-12 pe-3'>
                            <Form.Group controlId='exampleForm.ControlTextarea1'>
                                <Form.Control
                                    style={{ backgroundColor: "#f1f0ef" }}
                                    name='findings'
                                    as='textarea'
                                    rows={2}
                                    placeholder='Write your findings'
                                    value={intrimFindings || ''}
                                    onChange={(e) => {
                                        setIntrimfindings(e.target.value)
                                        setErrors((prevErrors) => ({
                                            ...prevErrors,
                                            intrimFindings: undefined, 
                                          }));
                                       
                                    }}
                                    isInvalid={!!errors.intrimFindings}
                                    // error={!!errors.intrimFindings}
                                    // helperText={errors.intrimFindings}
                                />
                                <Form.Control.Feedback type="invalid">{errors.intrimFindings}</Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className='col-md-6 col-sm-12 ps-0 file_upload upload-file-border fileupload_responsive'>
                            <Button component='label' style={{ color: "black" }}>Choose file
                                <VisuallyHiddenInput type='file' multiple onChange={handleFileSelect} />
                            </Button>
                            <span className='vertical-line'></span>
                            <span style={{ marginLeft: "10px" }} className='responsive_span'>
                                {interimSelectedFiles.length > 0 ? `${interimSelectedFiles.length} file(s) selected` : 'No file chosen'}
                            </span>
                        </div>
                        {interimSelectedFiles.map((file, index) => (
                            <div className="row attached-files-info mt-3" key={index}>
                                <div className="col-xxl-6">
                                    <ul><li className='mt-2'>
                                        <div className="d-flex align-items-center justify-content-between" style={{ width: "100%" }}>
                                            <div className="d-flex align-items-center">
                                                <TextSnippetIcon style={{ color: "#533529" }} />
                                                <p className="mb-0 ms-2">{file.name}</p>
                                            </div>
                                            <IconButton edge='end' onClick={() => setInterimSelectedFiles(interimSelectedFiles.filter((_, i) => i !== index))}>
                                                <CloseIcon className='close_icon' />
                                            </IconButton>
                                        </div>
                                    </li></ul>
                                </div>
                            </div>
                        ))}
                        {selectedFiles.map((file, index) => (
                            <div className="row attached-files-info mt-3" key={index}>
                                <div className="col-xxl-6"> <div className="attached-files">
                                    <ul>
                                        <li className='mt-2'>
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
                                                    <ArrowDownwardIcon style={{ marginRight: "5px", cursor: 'pointer' }} onClick={() => download(file.documentName)} />
                                                    <IconButton onClick={() => handleFilePreview(file.documentUrl)}>
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                    <IconButton edge='end' onClick={() => openDeleteDialog(file, index)}>
                                                        <CloseIcon className='close_icon' />
                                                    </IconButton>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                </div>
                            </div>
                        ))}
                        <div className='d-flex justify-content-end gap-3 mt-3'>
                            <Button className='accordian_submit_btn' onClick={submit_Intirm_Investagation}>
                                {loading ? "Procesing..." : "Submit"}

                            </Button>
                            {/* <Button className='accordian_cancel_btn'>Close</Button> */}
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>
            <Snackbar open={open} autoHideDuration={2000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleClose} severity={severity}>{message}</Alert>
            </Snackbar>
            <Dialog open={Boolean(selectedFileUrl)} onClose={() => setSelectedFileUrl(null)} fullWidth maxWidth="xl">
                <DialogContent>
                    {selectedFileUrl && <iframe src={selectedFileUrl} width="100%" height="500px" style={{ border: 'none' }} title="File Preview" />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedFileUrl(null)} className='accordian_submit_btn'>Close</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
                <DialogTitle className='dialog_head'>Delete Confirmation</DialogTitle>
                <DialogContent className='dialog_content'>
                    <DialogContentText className='mt-4'>Are you sure you want to delete the file "{fileToDelete?.documentName}"?</DialogContentText>
                </DialogContent>
                <DialogActions className='dialog_content'>
                    <Button className='accordian_cancel_btn' onClick={confirmDeleteFile} color="secondary">Delete</Button>
                    <Button className='accordian_submit_btn' onClick={closeDeleteDialog} color="primary">Cancel</Button></DialogActions>
            </Dialog>
        </div>
    );
};

export default IntrimAccordian;
