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
import { BASE_API_URL } from '../../../api';
import axios from 'axios';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useParams } from 'react-router-dom';
import { Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { saveIncidentInterim, getIncidentInterimDetails, uploadDocuments } from '../../../api';

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

const IntrimAccordian = () => {
    const { id } = useParams();
    const [intrimFindings, setIntrimfindings] = useState('')
    const [interimSelectedFiles, setInterimSelectedFiles] = useState([]);
    const [interimId, setInterimId] = useState()
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    const [open, setOpen] = useState(false);
    const [intrimInvestigationData, setIntrimInvestigationData] = useState('')
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedFileUrl, setSelectedFileUrl] = useState(null);

    const handleDrop = (event) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        setInterimSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    };
    const handleDragOver = (event) => {
        event.preventDefault();
    };
    const interimHandleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setInterimSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    };
    const interimHandleRemoveFile = (index) => {
        setInterimSelectedFiles(interimSelectedFiles.filter((_, i) => i !== index));
    };
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    useEffect(() => {
        fetchIntrimInvestigation()
    }, [])

    const submit_Intirm_Investagation = async () => {
        try {
            const requestBody = {
                findings: intrimFindings,
                incidentId: id,
                // userId: 1,
                createdBy: 1,
                interimId: interimId ? interimId : '0',
                flag: interimId ? 'U' : 'I'
            }

            if (interimSelectedFiles > 10) {
                console.log("Cannot upload more than 10 files");
                setMessage("Cannot upload more than 10 files..");
                setSeverity('error');
                setOpen(true);
                return;
            }


            const formData = new FormData();
            formData.append('interim', JSON.stringify(requestBody));


            if (interimSelectedFiles && interimSelectedFiles.length > 0) {
                interimSelectedFiles.forEach((file, index) => {
                    formData.append('files', file)
                })
            }

            console.log("Submitting investigation:", requestBody);


            const response = await axios.post(saveIncidentInterim, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })
            console.log("intriminvestigation data:", response)

            if (response?.data?.statusResponse?.responseCode === 201) {
                setMessage("Interim investigation created Successfully");
                setSeverity('success');
                setOpen(true);
                setInterimSelectedFiles([])

                const interimFiles = response.data.interimFiles || [];

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

            } else if (response?.data?.statusResponse?.responseCode === 200) {
                setMessage("Interim investigation Updated Successfully");
                setSeverity('success');
                setOpen(true);
                setInterimSelectedFiles([])
                const newFiles = response.data.map((file) => ({
                    documentId: file.documentId,
                    documentName: file.documentName,
                    documentSize: file.documentSize,
                    documentUrl: file.documentUrl,
                    documentType: file.documentType,
                    uploadDate: file.uploadDate
                }))
                setSelectedFiles(prevFiles => [...prevFiles, ...newFiles])
            } else {
                setMessage("Failed to add Interim investigation.");
                setSeverity('error');
                setOpen(true);
            }
        } catch (error) {
            console.log('Error in saving the intriminvestigation:', error)
            setMessage("Failed to submit interim investigation. Error: " + error.message);
            setSeverity('error');
            setOpen(true);
        }
    }


    const fetchIntrimInvestigation = async () => {
        try {
            const requestBody = {
                orgId: 1,
                incidentId: id,
                userId: 1
            }
            console.log(requestBody)
            const response = await axios.post(getIncidentInterimDetails, requestBody)
            console.log(response)

            const intrimData = response.data.incidentInterimDetails
            setIntrimInvestigationData(intrimData)
            setInterimId(intrimData.interimId)
            setSelectedFiles(response.data.interimFiles)
            console.log(selectedFiles)
            console.log("intrimInvestigationData", intrimData)
            if (intrimData) {
                setIntrimfindings(intrimData.findings)
                console.log("findings set to:", intrimData.findings);
            }
        } catch (error) {
            console.log('Failed to fetch Intrim investigation details:', error)
        }
    }

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setInterimSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    };

    const intrimFileSubmit = async (e) => {
        e.preventDefault();
        if (interimSelectedFiles.length === 0) {
            console.log("No files selected");
            setMessage("No files selected, Please select at least one file to upload.");
            setSeverity('error');
            setOpen(true);
            return;
        }

        if (interimSelectedFiles > 10) {
            console.log("Cannot upload more than 10 files");
            setMessage("Cannot upload more than 10 files..");
            setSeverity('error');
            setOpen(true);
            return;
        }

        try {
            const formData = new FormData();
            interimSelectedFiles.forEach((file, index) => {
                formData.append('files', file);

            })
            formData.append('incidentId', id)
            formData.append('entityId', interimId);
            formData.append('source', 'Interim');
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
                setInterimSelectedFiles([])
                const newFiles = response.data.map((file) => ({
                    documentId: file.documentId,
                    documentName: file.documentName,
                    documentSize: file.documentSize,
                    documentUrl: file.documentUrl,
                    documentType: file.documentType,
                    uploadDate: file.uploadDate
                }))
                setSelectedFiles(prevFiles => [...prevFiles, ...newFiles])
            } else {
                console.log('File upload failed:', response);
                setMessage("Failed to upload file.");
                setSeverity('error');
                setOpen(true);
            }
        } catch (error) {
            console.log('Error in upload the Intrim Investigation files, error:', error)
            setMessage("Failed to upload file. Error: " + error.message);
            setSeverity('error');
            setOpen(true);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // First API call - submit_Intirm_Investagation
            await submit_Intirm_Investagation();
            console.log('Interim Investigation submitted successfully');

            // Second API call - intrimFileSubmit
            await intrimFileSubmit(e);
            console.log('Files uploaded successfully');

            setMessage("Interim investigation and files submitted successfully!");
            setSeverity('success');
            setOpen(true);

        } catch (error) {
            console.error('Error in submitting investigation or uploading files:', error);
            setMessage("Failed to submit interim investigation or upload files. Error: " + error.message);
            setSeverity('error');
            setOpen(true);
        }
    };
    const downloadFile = (url, fileName) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName; // Set the file name for the download
        document.body.appendChild(link); // Append to body
        link.click(); // Trigger the download
        document.body.removeChild(link); // Clean up
    };

    const handleFilePreview = (fileUrl) => {
        setSelectedFileUrl(fileUrl); // Set the selected file URL
    };

    return (
        <div className=''>
            <Accordion className='mb-2 border accordian_arrow'>
                <AccordionSummary
                    style={{
                        backgroundColor: '#533529',
                        boxShadow: 'inset 0 -1px 0 rgba(0, 0, 0, .125);',
                        padding: '0px 20px',
                        width: '100%',
                    }}
                    expandIcon={<ExpandMoreIcon className='accordian_arrow' />}
                    aria-controls='panel1-content'
                    id='panel1-header'
                    className='text-primary w-full accordian_sum '
                >
                    <Typography className='accord_typo'>
                        INTERIM INVESTIGATION
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
                                    value={intrimFindings ? intrimFindings : ''}
                                    onChange={(e) => setIntrimfindings(e.target.value)}
                                />
                            </Form.Group>
                        </div>
                        <div className='col-md-6 ps-0 file_upload upload-file-border'>

                            {/* <div className=' col-md-8 file_upload upload-file-border'> */}
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
                            <span style={{ marginLeft: "10px" }}> {interimSelectedFiles.length > 0 ? `${interimSelectedFiles.length} file(s) selected` : 'No file chosen'}</span>

                            {/* <div className='col-md-4'>
                                    <Button
                                        variant='outlined'
                                        className='accordian_submit_btn mt-2 '
                                        onClick={intrimFileSubmit}
                                    >
                                        Upload File
                                    </Button>
                                </div> */}
                            {/* </div> */}

                        </div>
                        {interimSelectedFiles.length > 0 && (
                            interimSelectedFiles.map((file, index) => (
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
                                                            <IconButton
                                                                edge='end'
                                                                aria-label='delete'
                                                                onClick={() => interimHandleRemoveFile(index)}
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
                                <div className="col-xxl-6">
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
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className='d-flex justify-content-end gap-3 mt-3'>
                            <Button className='accordian_submit_btn'
                                onClick={submit_Intirm_Investagation}
                            // onClick={handleSubmit}
                            >Submit</Button>
                            <Button
                                className='accordian_cancel_btn'
                            >
                                Close
                            </Button>
                        </div>
                        {/* <div className='row accordian_row'>

                            
                            <div className='col-md-4 float-end mt-3 p-0'>
                              
                            </div>
                        </div> */}

                    </div>
                </AccordionDetails>
            </Accordion>
            <Snackbar open={open} autoHideDuration={2000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
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
        </div>
    )
}

export default IntrimAccordian