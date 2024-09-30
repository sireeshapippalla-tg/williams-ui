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
import { Alert } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { Snackbar } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { savePreventiveAction, getPreventiveActionDetails } from '../../../api';

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

const Preventivections = () => {
    const { id } = useParams();
    const[preventiveActionData, setPreventiveActionData] = useState('')
    const [preventiveFindings, setPreventiveFindings] = useState('')
    const [preventiveId, setPreventiveId] = useState()
    const [preventingList, setPreventingList] = useState()
    const [preventiveSelectedFiles, setPreventiveSelectedFiles] = useState([]);
    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState('success');
    const [message, setMessage] = useState('');

    const preventiveHandleFileChange = (e) => {
        setPreventiveSelectedFiles([...e.target.files]);
    };
    const preventiveHandleRemoveFile = (index) => {
        setPreventiveSelectedFiles(preventiveSelectedFiles.filter((_, i) => i !== index));
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        setPreventiveSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    };
    const handleDragOver = (event) => {
        event.preventDefault();
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

    const submit_Preventive_Action = async () => {
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
            if(preventiveSelectedFiles && preventiveSelectedFiles.length > 0) {
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
                setOpen(true);
                setPreventiveSelectedFiles([])

            } else if (response.data.statusResponse.responseCode === 200) {
                setMessage("Preventive action Updated Successfully");
                setSeverity('success');
                setOpen(true);

                setPreventiveSelectedFiles([])
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
        }
    }

    const fetch_preventive_Action = async () => {
        try {
            const requestBody = {
                orgId: 1,
                incidentId: id,
                userId: 1
            }
            const response = await axios.post(getPreventiveActionDetails, requestBody)
            console.log('response', response);
            const preventiveData = response.data.preventiveActionDetails;
            console.log(preventiveData)
            setPreventiveActionData(preventiveData);
            setPreventiveId(preventiveData.preventiveId)
            console.log(preventiveId)
            if(preventiveData) {
                setPreventiveFindings(preventiveData.findings)
                console.log(preventiveFindings)
            }
        } catch (error) {
            console.log('Failed to fetch preventive action details:', error)
        }
    }

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
                                    onChange={(e) => setPreventiveFindings(e.target.value)}
                                />
                            </Form.Group>
                        </div>
                        <div className='col-md-6 ps-0 file_upload upload-file-border'>
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
                            <span style={{ marginLeft: "10px" }}> {preventiveSelectedFiles.length > 0 ? `${preventiveSelectedFiles.length} file(s) selected` : 'No file chosen'}</span>

                        </div>
                    </div>
                    <div className='row accordian_row'>

                        <div className='col-md-8 ps-0 attached-files-info mt-3'>
                            <div className="row">
                                <div className="col-xxl-6">
                                    <div className="attached-files">
                                        <ul>
                                            {preventiveSelectedFiles.length > 0 && (
                                                preventiveSelectedFiles.map((file, index) => (
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
                                                                        <ArrowDownwardIcon style={{ marginRight: "5px" }} />
                                                                    </a>
                                                                </div>
                                                                <IconButton>
                                                                    <VisibilityIcon />
                                                                </IconButton>
                                                                <IconButton
                                                                    edge='end'
                                                                    aria-label='delete'
                                                                    onClick={() => preventiveHandleRemoveFile(index)}
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
                        {/* <div className='col-md-2' >
                            <Button className='accordian_submit_btn' style={{ float: "none" }}>Submit</Button>

                        </div>
                        <div className='col-md-2'>
                            <Button className='accordian_cancel_btn'>Close</Button>
                        </div> */}
                        <div className='col-md-4 float-end mt-3 '>
                            <div className='d-flex justify-content-end gap-3 '>
                                <Button className='accordian_submit_btn' onClick={submit_Preventive_Action}>Submit</Button>
                                <Button
                                    className='accordian_cancel_btn mr-1'
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>
            <Snackbar open={open} autoHideDuration={2000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleClose} severity={severity}>
                    {message}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default Preventivections