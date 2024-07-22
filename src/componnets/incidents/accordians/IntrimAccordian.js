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
    const [intrimFindings, setIntrimfindings] = useState('')
    const [interimSelectedFiles, setInterimSelectedFiles] = useState([]);
    const [incidentDetails, setIncidentDetails] = useState(null);
    const [isIncidentDetailsFetched, setIsIncidentDetailsFetched] = useState(false);


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
                        <div className='col-md-6 ps-0'>
                            <div className='col-md-12  file_upload'>
                                {/* <label className="text_color" for="formFileMultiple" class="form-label" onChange={handleFileChange}> Browse</label> */}
                                <input class="form-control" type="file" id="formFileMultiple" multiple onChange={interimHandleFileChange} />
                            </div>

                        </div>
                        <div className='row accordian_row'>

                            <div className='col-md-8 attached-files-info mt-3'>
                                <div className="row">
                                    <div className="col-xxl-6">
                                        <div className="attached-files">
                                            <ul>
                                                {interimSelectedFiles.length > 0 && (
                                                    interimSelectedFiles.map((file, index) => (
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
                                                                        <VisibilityIcon/>
                                                                    </IconButton>
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
                                                    ))
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-md-4 float-end mt-3 p-0'>
                                <div className='d-flex justify-content-end gap-3 '>
                                    <Button className='accordian_submit_btn' >Submit</Button>
                                    <Button
                                        className='accordian_cancel_btn'
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    )
}

export default IntrimAccordian