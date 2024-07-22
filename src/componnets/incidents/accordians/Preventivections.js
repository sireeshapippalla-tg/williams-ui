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
    const [preventiveFindings, setPreventiveFindings] = useState('')
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
                        <div className='col-md-6 ps-0'>
                            <div className='col-md-12  file_upload'>
                                {/* <label className="text_color" for="formFileMultiple" class="form-label" onChange={handleFileChange}> Browse</label> */}
                                <input class="form-control" type="file" id="formFileMultiple" multiple onChange={preventiveHandleFileChange} />
                            </div>
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
                                <Button className='accordian_submit_btn' >Submit</Button>
                                <Button
                                    className='accordian_cancel_btn mr-1'
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>


                    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                        <Alert onClose={handleClose} severity={severity}>
                            {message}
                        </Alert>
                    </Snackbar>
                </AccordionDetails>
            </Accordion>
        </div>
    )
}

export default Preventivections