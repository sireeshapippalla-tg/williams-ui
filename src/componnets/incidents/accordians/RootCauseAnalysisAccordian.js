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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useParams } from 'react-router-dom';
import { Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import { DialogContentText, DialogTitle } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { saveRootCause, getRootCauseDetails, downloadFile, deleteFile, deleteProblemRootCause } from '../../../api';


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

const RootCauseAnalysisAccordian = ({ invokeHistory }) => {

    const { id } = useParams();
    console.log(id)

    // const [whyInputs, setWhyInputs] = useState([
    //     { label: 'First Why', value: ['', '', ''] },
    // ]);
    const whyLabels = ["Man", "Material", "Method", "Measurement", "Machine", "Environment"];
    const [whyInputs, setWhyInputs] = useState([
        {
            label: whyLabels[0],
            value: ["", "", ""],
            id: 0
        }
    ]);
    const [problemDescription, setProblemDescription] = useState('');
    const [summary, setSummary] = useState('')
    const [rootSelectedFiles, setRootSelectedFiles] = useState([]);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    const [open, setOpen] = useState(false);
    const [fetchedFiles, setFetchedFiles] = useState([])
    const [selectedFileUrl, setSelectedFileUrl] = useState(null);
    const [rootCauseId, setRootCauseId] = useState()
    const [problemStageId, setProblemStageId] = useState()
    const [filePreview, setFilePreview] = useState(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [fileToDeleteIndex, setFileToDeleteIndex] = useState(null);
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})


    const storedUser = JSON.parse(localStorage.getItem('userDetails'));
    const userId = storedUser ? storedUser.userId : null;

    console.log(userId);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const getOrdinalWord = (index) => {
        const ordinals = ["First", "Second", "Third", "Fourth", "Fifth"];
        return ordinals[index] || `${index + 1}th`;
    };


    const whyInputshandleAddRow = () => {
        // Find the first label in whyLabels that is not already in use in whyInputs
        const usedLabels = whyInputs.map(input => input.label);
        const availableLabels = whyLabels.filter(label => !usedLabels.includes(label));

        if (availableLabels.length > 0) {
            const newInputs = [
                ...whyInputs,
                { label: availableLabels[0], value: ['', '', ''] } // Add the first available label
            ];
            setWhyInputs(newInputs);
        }
    };
    // const whyInputshandleRemoveRow = (indexToRemove) => {
    //     // Filter out the row being removed
    //     const updatedInputs = whyInputs.filter((_, index) => index !== indexToRemove);
    //     setWhyInputs(updatedInputs);
    // };

    const whyInputshandleInputChange = (index, subIndex, value) => {
        const updatedInputs = [...whyInputs];
        updatedInputs[index].value[subIndex] = value;
        setWhyInputs(updatedInputs);
    };





    useEffect(() => {
        fetch_rootcause_analysis();
    }, [])

    const formValidation = () => {
        const newErrors = {}
        // if (!intrimFindings.trim()) {
        //     newErrors.intrimFindings = "Findings is required"
        // }
        // setErrors(newErrors);
        // return Object.keys(newErrors).length === 0;
        if (!problemDescription.trim()) {
            newErrors.problemDescription = "Problem description required"            
        }
        if(!summary.trim()) {
            newErrors.summary = "Summary is required"
        }
        setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
    }

    const handleRootCauseSubmit = async (e) => {
        e.preventDefault();
        if (!formValidation()) {
            console.log("Form validation failed");
            return;
        }
        setLoading(true)

        try {
            const problems = whyInputs.map((input, index) => ({
                problemStatusId: input.id ? input.id : 0,
                stage: input.label,
                stageNumber: index + 1,
                occur: input.value[0],
                undetected: input.value[1],
                prevented: input.value[2]
            }));
            const requestBody = {
                "orgId": 1,
                "flag": rootCauseId ? "U" : "I",
                "userId": userId,
                "incidentId": id,
                "rootCauseId": rootCauseId ? rootCauseId : 0,
                "problemDescription": problemDescription,
                "rootCauseSummary": summary,
                "problems": problems
            }
            console.log(requestBody)

            const formData = new FormData();
            formData.append('rootCause', JSON.stringify(requestBody))

            if (rootSelectedFiles && rootSelectedFiles.length > 10) {
                console.log("Cannot upload more than 10 files");
                setMessage("Cannot upload more than 10 files..");
                setSeverity('error');
                setOpen(true);
                return;
            }

            if (rootSelectedFiles && rootSelectedFiles.length > 0) {
                rootSelectedFiles.forEach((file, index) => {
                    formData.append('files', file)
                })
            }
            console.log(rootSelectedFiles)
            console.log(formData)
            const response = await axios.post(saveRootCause, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })

            console.log(response)

            if (response?.data?.statusResponse?.responseCode === 201) {
                setMessage("Root cause analysis created Successfully");
                setSeverity('success');
                invokeHistory()
                setOpen(true);
                setRootSelectedFiles([])
                fetch_rootcause_analysis();

            } else if (response?.data?.statusResponse?.responseCode === 200) {
                setMessage("Root cause analysis Updated Successfully");
                setSeverity('success');
                invokeHistory()
                setOpen(true);

                setRootSelectedFiles([])
                fetch_rootcause_analysis()
            } else {
                setMessage("Failed to add Root cause analysis");
                setSeverity('error');
                invokeHistory()
                setOpen(true);
            }


        } catch (error) {
            console.log(error)
            setMessage("Failed to submit Root cause analysis. Error: " + error.message);
            setSeverity('error');
            setOpen(true);
        } finally {
            setLoading(false)
        }

    }


    const fetch_rootcause_analysis = async () => {
        try {
            const requestBody = {
                "orgId": 1,
                "incidentId": id,
                "userId": userId
            }
            const response = await axios.post(getRootCauseDetails, requestBody);
            console.log(response)
            const data = response.data.incidentRootCauseDetails;


            console.log(data)
            // Set problem description and summary
            setProblemDescription(data.problemDescription)
            setSummary(data.rootCauseSummary)
            setFetchedFiles(response.data.rootCauseFiles)
            setRootCauseId(data.rootCauseId)


            // Map root cause details to whyInputs
            const detailsData = response.data.rootCauseDetails.map((details) => ({
                label: `${details.stage}`,
                value: [details.occur, details.undetected, details.prevented],
                id: details.problemStageId
            }))
            setWhyInputs(detailsData)
            console.log(detailsData)

        } catch (error) {
            console.log('error in fetching root cause data:', error)
        }

    }

    const handleFilePreview = (fileUrl) => {
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

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setRootSelectedFiles((prevFiles) => [...prevFiles, ...files]);
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
                setFetchedFiles(fetchedFiles.filter(file => file.documentId !== fileToDelete.documentId));
                setRootSelectedFiles(rootSelectedFiles.filter(file => file.documentId !== fileToDelete.documentId));

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

    const whyInputshandleRemoveRow = async (indexToRemove) => {
        const row = whyInputs[indexToRemove];
        let message = "";

        // Check if the row has an ID, indicating it is from the API
        if (row.id) {
            try {
                const payload = {
                    problemStageId: row.id,
                    incidentId: id
                };
                console.log(payload)
                // Make the API call to delete the row
                await axios.post(deleteProblemRootCause, payload);
                message = `"${row.label}" deleted successfully.`;
                setMessage(`"${row.label}" deleted successfully.`)
                setSeverity('success')
                setOpen(true)
            } catch (error) {
                console.log('Error deleting row from server:', error);
                setMessage("Failed to delete . Please try again.");
                setSeverity('error');
                setOpen(true);
                return; // Exit if there's an error in deletion
            }
        } else {
            message = ` "${row.label}" deleted Successfully.`;
            setMessage(`Row with label "${row.label}" deleted Successfully.`)
            setSeverity('success')
            setOpen(true)
        }

        // Filter out the row from whyInputs (whether it was deleted locally or via the API)
        const updatedInputs = whyInputs.filter((_, index) => index !== indexToRemove);
        setWhyInputs(updatedInputs);

        // Set success message based on deletion type
        setMessage(message);
        setSeverity('success');
        setOpen(true);
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
                    aria-controls='panel2-content'
                    id='panel2-header'
                >
                    <Typography className='accord_typo'>
                        ROOT CAUSE ANALYSIS
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div>
                        <div className='table-responsive-container pb-3'>

                            <TableContainer className='border tbl_scrool'>
                                <Table >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell></TableCell>{' '}
                                         
                                            <TableCell>
                                                <div className='accordian_tbl_txt'>Why did this specific issue occur?</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className='accordian_tbl_txt'>
                                                    Why did this problem go undetected
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className='accordian_tbl_txt' >
                                                    Why was the problem not prevented?
                                                </div>
                                            </TableCell >
                                            <TableCell >
                                                
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody >
                                        <TableRow>
                                            <TableCell style={{ width: "150px" }}>
                                                <label className='accordian_tbl_txt'>
                                                    Problem description
                                                </label>
                                            </TableCell>
                                            <TableCell colSpan={4}>
                                                <textarea
                                                    className='form-control'
                                                    style={{ backgroundColor: '#f1f0ef' }}
                                                    fullWidth
                                                    value={problemDescription}
                                                    onChange={(e) => {
                                                        setProblemDescription(e.target.value)
                                                        setErrors((prevErrors) => ({
                                                            ...prevErrors,
                                                            problemDescription: undefined,
                                                        }));

                                                    }}
                                                />
                                                {errors.problemDescription && (
                                                    <div style={{ color: 'red', fontSize: '0.875em' }}>{errors.problemDescription}</div>
                                                )}
                                            </TableCell>
                                        </TableRow>

                                        {whyInputs.map((input, index) => (
                                            <TableRow key={index}>
                                                <TableCell style={{ minWidth: "150px", textAlign: "center" }}>
                                                    <label className='accordian_tbl_txt'>{input.label}</label>
                                                </TableCell>
                                                <TableCell style={{ minWidth: "150px" }}>
                                                    <textarea
                                                        className='form-control'
                                                        style={{ backgroundColor: '#f1f0ef' }}
                                                        fullWidth
                                                        value={input.value[0]}
                                                        onChange={(e) =>
                                                            whyInputshandleInputChange(
                                                                index,
                                                                0,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell style={{ minWidth: "150px" }}>
                                                    <textarea
                                                        className='form-control'
                                                        style={{ backgroundColor: '#f1f0ef' }}
                                                        fullWidth
                                                        value={input.value[1]}
                                                        onChange={(e) =>
                                                            whyInputshandleInputChange(
                                                                index,
                                                                1,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell style={{ minWidth: "150px" }}>
                                                    <textarea
                                                        className='form-control'
                                                        style={{ backgroundColor: '#f1f0ef' }}
                                                        fullWidth
                                                        value={input.value[2]}
                                                        onChange={(e) =>
                                                            whyInputshandleInputChange(
                                                                index,
                                                                2,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {index !== 0 && (
                                                        <IconButton
                                                            onClick={() =>
                                                                whyInputshandleRemoveRow(index)
                                                            }
                                                        >
                                                            <CloseIcon style={{ color: 'red', fontSize: '18px', }} />
                                                        </IconButton>
                                                    )}
                                                    <IconButton
                                                        onClick={whyInputshandleAddRow}
                                                        disabled={whyInputs.length >= 6}
                                                    >
                                                        <AddIcon
                                                            className='blue'
                                                            style={{
                                                                fontSize: '20px',
                                                                // fontWeight: '500',
                                                            }}
                                                        />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                        </div>
                        <div className='row'>
                            <div className='col-md-6 pe-3'>
                                <Form.Group
                                    // className='mb-3'
                                    controlId='exampleForm.ControlTextarea1'
                                >

                                    <Form.Control
                                        className='input_border'
                                        as='textarea'
                                        rows={2}
                                        placeholder='Write your Summary'
                                        style={{ backgroundColor: "#f1f0ef" }}
                                        value={summary}
                                        onChange={(e) =>{
                                            setSummary(e.target.value)
                                            setErrors((prevErrors) => ({
                                                ...prevErrors,
                                                summary: undefined,
                                            }));
                                        }}
                                        isInvalid={!!errors.summary}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.summary}</Form.Control.Feedback>
                                </Form.Group>
                            </div>
                            <div className='col-md-6 ps-0 file_upload upload-file-border fileupload_responsive'>
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
                                <span style={{ marginLeft: "10px" }} className='responsive_span' > {rootSelectedFiles.length > 0 ? `${rootSelectedFiles.length} file(s) selected` : 'No file chosen'}</span>
                            </div>
                        </div>
                        {rootSelectedFiles.length > 0 && (
                            rootSelectedFiles.map((file, index) => (
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
                                                                onClick={() => setRootSelectedFiles(rootSelectedFiles.filter((_, i) => i !== index))}
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

                        {fetchedFiles && fetchedFiles.length > 0 && (
                            <div className="row attached-files-info mt-3">
                                <div className="col-xxl-6">
                                    <div className="attached-files">
                                        {/* <h5 style={{ fontWeight: "600" }}>Incident Files</h5> */}
                                        <ul>
                                            {fetchedFiles.map((file, index) => (
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

                        <div className='row accordian_row'>
                            <div className='d-flex justify-content-end gap-3 mt-3'>
                                <Button className='accordian_submit_btn  ' style={{ float: "none", marginRight: "15px" }} onClick={handleRootCauseSubmit}>
                                    {loading ? "Processing..." : "Submit"}
                                </Button>
                                {/* <Button className='accordian_cancel_btn'>Close</Button> */}
                            </div>
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>


            <Dialog
                open={Boolean(filePreview)} // Open the dialog if a file is selected
                onClose={() => setFilePreview(null)} // Close the dialog
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
            <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
                <DialogTitle className='dialog_head'>Delete Confirmation</DialogTitle>
                <DialogContent className='dialog_content'>
                    <DialogContentText className='mt-4'>Are you sure you want to delete the file "{fileToDelete?.documentName}"?</DialogContentText>
                </DialogContent>
                <DialogActions className='dialog_content'>
                    <Button className='accordian_cancel_btn' onClick={confirmDeleteFile} color="secondary">Delete</Button>
                    <Button className='accordian_submit_btn' onClick={closeDeleteDialog} color="primary">Cancel</Button> </DialogActions>
            </Dialog>


            <Snackbar open={open} autoHideDuration={2000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleClose} severity={severity}>
                    {message}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default RootCauseAnalysisAccordian







// import React, { useState } from 'react';
// import {
//     Accordion, AccordionSummary, AccordionDetails, Typography, Button,
//     Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
//     IconButton, List, ListItem, ListItemText, ListItemSecondaryAction
// } from '@mui/material';
// import { styled } from '@mui/material/styles';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import CloseIcon from '@mui/icons-material/Close';
// import AddIcon from '@mui/icons-material/Add';
// import Form from 'react-bootstrap/Form';


// const VisuallyHiddenInput = styled('input')({
//     clip: 'rect(0 0 0 0)',
//     clipPath: 'inset(50%)',
//     height: 1,
//     overflow: 'hidden',
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     whiteSpace: 'nowrap',
//     width: 1,
// });

// const RootCauseAnalysisAccordion = () => {
//     const [whyInputs, setWhyInputs] = useState([{ label: 'first why', value: ['', '', ''] }]);
//     const [problemDescription, setProblemDescription] = useState('');
//     const [rootSelectedFiles, setRootSelectedFiles] = useState([]);

//     function numberToWords(number) {
//         const units = [
//             '', 'first', 'second', 'third', 'fourth', 'fifth',
//             'sixth', 'seventh', 'eighth', 'ninth',
//         ];
//         const teens = [
//             'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth',
//             'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth',
//         ];
//         const tens = [
//             '', '', 'twentieth', 'thirtieth', 'fortieth', 'fiftieth',
//             'sixtieth', 'seventieth', 'eightieth', 'ninetieth',
//         ];

//         if (number < 10) return units[number];
//         if (number < 20) return teens[number - 10];
//         if (number < 100) return `${tens[Math.floor(number / 10)]} ${units[number % 10]}`.trim();
//         return number.toString();
//     }

//     const whyInputshandleAddRow = () => {
//         if (whyInputs.length < 5) {
//             setWhyInputs([...whyInputs, { label: `Why ${whyInputs.length + 1}`, value: ['', '', ''] }]);
//         }
//     };

//     const whyInputshandleRemoveRow = (index) => {
//         const updatedInputs = [...whyInputs];
//         updatedInputs.splice(index, 1);
//         setWhyInputs(updatedInputs);
//     };

//     const whyInputshandleInputChange = (index, subIndex, value) => {
//         const updatedInputs = [...whyInputs];
//         updatedInputs[index].value[subIndex] = value;
//         setWhyInputs(updatedInputs);
//     };

//     const handleDrop = (event) => {
//         event.preventDefault();
//         const files = Array.from(event.dataTransfer.files);
//         setRootSelectedFiles((prevFiles) => [...prevFiles, ...files]);
//     };

//     const rootHandleFileChange = (e) => {
//         setRootSelectedFiles([...e.target.files]);
//     };

//     const rootHandleRemoveFile = (index) => {
//         setRootSelectedFiles(rootSelectedFiles.filter((_, i) => i !== index));
//     };

//     const handleDragOver = (event) => {
//         event.preventDefault();
//     };

//     return (
//         <div>
//             <Accordion className='mb-2'>
//                 <AccordionSummary
//                     style={{
//                         backgroundColor: '#b7885a',
//                         boxShadow: 'inset 0 -1px 0 rgba(0, 0, 0, .125);',
//                         padding: '0px 20px',
//                     }}
//                     expandIcon={<ExpandMoreIcon />}
//                     aria-controls='panel2-content'
//                     id='panel2-header'
//                 >
//                     <Typography className='accord_typo'>
//                         ROOT CAUSE ANALYSIS
//                     </Typography>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                     <div>
//                         <div className='row d-flex justify-content-between'>
//                             <div>
//                                 <TableContainer className='border'>
//                                     <Table>
//                                         <TableHead>
//                                             <TableRow className='rootCause_tbl'>
//                                                 <TableCell></TableCell>
//                                                 <TableCell className='rootCause_table_header'>
//                                                     <div className='trianglediv'>
//                                                         <em className='triangle'></em>Why did this specific issue occur?
//                                                     </div>
//                                                 </TableCell>
//                                                 <TableCell className='rootCause_table_header'>
//                                                     <div className='trianglediv'>
//                                                         <em className='triangle'></em>Why did this problem go undetected?
//                                                     </div>
//                                                 </TableCell>
//                                                 <TableCell className='rootCause_table_header'>
//                                                     <div className='trianglediv'>
//                                                         <em className='triangle'></em>Why was the problem not prevented?
//                                                     </div>
//                                                 </TableCell>
//                                                 <TableCell>
//                                                 </TableCell>
//                                             </TableRow>
//                                         </TableHead>
//                                         <TableBody>
//                                             <TableRow>
//                                                 <TableCell className='rootCause_label_cell'>
//                                                     <label>Problem description</label>
//                                                 </TableCell>
//                                                 <TableCell colSpan={4}>
//                                                     <textarea
//                                                         className='form-control'
//                                                         style={{ backgroundColor: '#f1f0ef' }}
//                                                         fullWidth
//                                                         value={problemDescription}
//                                                         onChange={(e) => setProblemDescription(e.target.value)}
//                                                     />
//                                                 </TableCell>
//                                             </TableRow>

//                                             {whyInputs.map((input, index) => (
//                                                 <TableRow key={index}>
//                                                     <TableCell className='rootCause_label_cell'>
//                                                         <label className='rootcause_label'>{`${numberToWords(index + 1)} why`}</label>
//                                                     </TableCell>
//                                                     <TableCell>
//                                                         <textarea
//                                                             className='form-control'
//                                                             style={{ backgroundColor: '#f1f0ef' }}
//                                                             fullWidth
//                                                             value={input.value[0]}
//                                                             onChange={(e) => whyInputshandleInputChange(index, 0, e.target.value)}
//                                                         />
//                                                     </TableCell>
//                                                     <TableCell>
//                                                         <textarea
//                                                             className='form-control'
//                                                             style={{ backgroundColor: '#f1f0ef' }}
//                                                             fullWidth
//                                                             value={input.value[1]}
//                                                             onChange={(e) => whyInputshandleInputChange(index, 1, e.target.value)}
//                                                         />
//                                                     </TableCell>
//                                                     <TableCell>
//                                                         <textarea
//                                                             className='form-control'
//                                                             style={{ backgroundColor: '#f1f0ef' }}
//                                                             fullWidth
//                                                             value={input.value[2]}
//                                                             onChange={(e) => whyInputshandleInputChange(index, 2, e.target.value)}
//                                                         />
//                                                     </TableCell>
//                                                     <TableCell>
//                                                         {index !== 0 && (
//                                                             <IconButton onClick={() => whyInputshandleRemoveRow(index)}>
//                                                                 <CloseIcon style={{ color: 'red', fontSize: '18px' }} />
//                                                             </IconButton>
//                                                         )}
//                                                         <IconButton
//                                                             onClick={whyInputshandleAddRow}
//                                                             disabled={whyInputs.length >= 5}
//                                                         >
//                                                             <AddIcon className='blue' style={{ fontSize: '20px' }} />
//                                                         </IconButton>
//                                                     </TableCell>
//                                                 </TableRow>
//                                             ))}
//                                         </TableBody>
//                                     </Table>
//                                 </TableContainer>
//                             </div>
//                         </div>
//                         <div className='row mt-3'>
//                             <div className='col-md-6'>
//                                 <Form.Group controlId='exampleForm.ControlTextarea1'>
//                                     <Form.Control
//                                         className='input_border'
//                                         as='textarea'
//                                         rows={2}
//                                         placeholder='Write your Summary'
//                                     />
//                                 </Form.Group>
//                             </div>
//                             <div className='col-md-6'>
//                                 <div className='col-md-12 mt-3 file_upload'>
//                                     <input
//                                         className='form-control'
//                                         type='file'
//                                         id='formFileMultiple'
//                                         multiple
//                                         onChange={rootHandleFileChange}
//                                     />
//                                 </div>
//                                 {rootSelectedFiles.length > 0 && (
//                                     <List>
//                                         {rootSelectedFiles.map((file, index) => (
//                                             <ListItem key={index} divider>
//                                                 <ListItemText primary={file.name} />
//                                                 <ListItemSecondaryAction>
//                                                     <IconButton
//                                                         edge='end'
//                                                         aria-label='delete'
//                                                         onClick={() => rootHandleRemoveFile(index)}
//                                                     >
//                                                         <CloseIcon />
//                                                     </IconButton>
//                                                 </ListItemSecondaryAction>
//                                             </ListItem>
//                                         ))}
//                                     </List>
//                                 )}
//                             </div>
//                         </div>
//                         <div className='d-flex justify-content-end gap-3'>
//                             <Button className='add-Field-btn'>Submit</Button>
//                             <Button className='dynamic_btn'>Close</Button>
//                         </div>
//                     </div>
//                 </AccordionDetails>
//             </Accordion>
//         </div>
//     );
// };

// export default RootCauseAnalysisAccordion;
