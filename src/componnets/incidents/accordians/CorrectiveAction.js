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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { TextField, Autocomplete, Alert } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';




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

const CorrectiveAction = () => {
    const [correctiveRows, setCorrectiveRows] = useState([
        { id: 1, task: '', dueDate: '', comment: '', resolved: false },
    ]);
    const [tableCorrectveSelectedFiles, setTableCorectiveSelectedFiles] = useState([]);
    const [correctiveShowAlert, setCorrectieShowAlert] = useState(false);
    const [correctiveSelectedFiles, setCorrectiveSelectecFiles] = useState([]);

    const options = [
        { label: 'Cleaned properly', value: 'Cleaned properly' },
        { label: 'Clean the Floor and sink', value: 'Clean the Floor and sink' },
        { label: 'Wash Again', value: 'Wash Again' },
        { label: 'Cleaned the walls again', value: 'Cleaned the walls again' },
    ];
    const CorrectivehandleAddRow = () => {
        const newRow = {
            id: correctiveRows.length + 1,
            task: '',
            dueDate: '',
            comment: '',
            resolved: false,
        };
        setCorrectiveRows([...correctiveRows, newRow]);
    };

    const correctivehandleDeleteRow = (id) => {
        if (correctiveRows.length === 1) {
            console.log('Cannot delete the only row.');
            setCorrectieShowAlert(true);
        } else {
            const updatedRows = correctiveRows.filter((row) => row.id !== id);
            setCorrectiveRows(updatedRows);
        }
    };

    const correctiveHandleFileChange = (e) => {
        setCorrectiveSelectecFiles([...e.target.files]);
    };

    const correctiveHandleCloseAlert = () => {
        setCorrectieShowAlert(false);
    };


    const correctiveRowshandleChange = (id, field, value) => {
        const updatedRows = correctiveRows.map((row) =>
            row.id === id ? { ...row, [field]: value } : row
        );
        setCorrectiveRows(updatedRows);
    };
    const tableCorrectiveHandleFileChange = (e) => {
        setTableCorectiveSelectedFiles([...e.target.files]);
    };
    const tableCorrectiveHandleRemoveFile = (index) => {
        setTableCorectiveSelectedFiles(tableCorrectveSelectedFiles.filter((_, i) => i !== index));
    };
    const handleDrop = (event) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        setCorrectiveSelectecFiles((prevFiles) => [...prevFiles, ...files]);
    };
    const handleDragOver = (event) => {
        event.preventDefault();
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
                                        <TableCell className='accordian_tbl_txt'>
                                            Tentative Date
                                        </TableCell>
                                        {/* <TableCell className='accordian_tbl_txt'>
                                            AI Prompt
                                        </TableCell> */}
                                        {/* <TableCell className='text-center fs-6 fw-bold text-white'>Comment</TableCell> */}
                                        <TableCell
                                            className='accordian_tbl_txt'

                                        >
                                            Is Resolved
                                        </TableCell>
                                        {/* <TableCell className='text-center fs-6 fw-bold text-white' style={{ width: "250px" }}>Supporting Document</TableCell> */}
                                        <TableCell className='accordian_tbl_txt'>
                                            Action
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
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
                                                {/* <select
                                                    value={row.task}
                                                    onChange={(e) =>
                                                        correctiveRowshandleChange(
                                                            row.id,
                                                            'task',
                                                            e.target.value
                                                        )
                                                    }
                                                    className='form-select'
                                                    aria-label='Default select example'
                                                    style={{ padding: "5px", fontSize: "14px" }}
                                                >
                                                    <option value=''>Please Select</option>
                                                    <option value='Cleaned properly'>
                                                        Cleaned properly
                                                    </option>
                                                    <option value='Clean the Floor and sink'>
                                                        Clean the Floor and sink
                                                    </option>
                                                    <option value='Wash Again'>Wash Again</option>
                                                    <option value='Cleaned the walls again'>
                                                        Cleaned the walls again
                                                    </option>
                                                </select> */}

                                                <Autocomplete
                                                    value={options.find((option) => option.value === row.task) || null}
                                                    onChange={(event, newValue) => {
                                                        correctiveRowshandleChange(row.id, 'task', newValue ? newValue.value : '');
                                                    }}
                                                    options={options}
                                                    getOptionLabel={(option) => option.label}
                                                    renderInput={(params) => (
                                                        <TextField {...params} label="Task" variant="outlined" />
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell
                                                style={{ margin: 'auto', textAlign: 'center', minWidth: "200px" }}
                                            >

                                                <Button
                                                    component='label'
                                                    variant='contained'
                                                    style={{ textTransform: 'capitalize', padding: "12px 29px" }}
                                                // startIcon={<CloudUploadIcon />}
                                                >
                                                    Upload file
                                                    <VisuallyHiddenInput
                                                        type='file'
                                                        multiple
                                                        style={{ display: 'none' }}
                                                        onChange={tableCorrectiveHandleFileChange}
                                                    />
                                                </Button>


                                                {tableCorrectveSelectedFiles.length > 0 && (
                                                    <List style={{ marginLeft: 20, padding: 0 }}>
                                                        {tableCorrectveSelectedFiles.map((file, index) => (
                                                            <ListItem key={index} style={{ padding: '0 0px' }}>
                                                                <ListItemText primary={file.name} style={{ textDecoration: 'none' }} />
                                                                <ListItemSecondaryAction>
                                                                    <IconButton
                                                                        edge='end'
                                                                        aria-label='delete'
                                                                        onClick={() => tableCorrectiveHandleRemoveFile(index)}
                                                                    >
                                                                        <CloseIcon />
                                                                    </IconButton>
                                                                </ListItemSecondaryAction>
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                )}
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
                                            {/* <TableCell
                                                style={{ margin: 'auto', textAlign: 'center', minWidth:"200px" }}
                                            >
                                                <TextField
                                                    type='text'
                                                    variant='outlined'
                                                    className='date-bg'

                                                />
                                            </TableCell> */}

                                            <TableCell
                                                style={{ margin: 'auto', textAlign: 'center' }}
                                            >
                                                <Checkbox
                                                    className='checkbox_color'
                                                    checked={correctiveRows.resolved}
                                                    onChange={(e) =>
                                                        correctiveRowshandleChange(
                                                            row.id,
                                                            'resolved',
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                            </TableCell>

                                            <TableCell
                                                className='d-flex'
                                                style={{
                                                    textAlign: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
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
                                />
                            </Form.Group>
                        </div>
                        <div className='col-md-6 pe-3'>
                            <Form.Group
                                className='mb-0'
                                controlId='exampleForm.ControlTextarea1'
                            >
                                <Form.Control
                                    className='input_border'
                                    as='textarea'
                                    rows={2}
                                    placeholder='Create Incident with AI Prompt'
                                    style={{ backgroundColor: "#f1f0ef" }}
                                />
                            </Form.Group>
                        </div>
                        <div className='row accordian_row'>
                            <div className='col-md-8 ps-0'>
                                <div className='col-md-12 file_upload'>
                                    <input class="form-control" type="file" id="formFileMultiple" multiple onChange={correctiveHandleFileChange} />
                                </div>
                                {correctiveSelectedFiles.length > 0 && (
                                    <List>
                                        {correctiveSelectedFiles.map((file, index) => (
                                            <ListItem key={index} divider>
                                                <ListItemText primary={file.name} />
                                                <ListItemSecondaryAction>
                                                    <IconButton
                                                        edge='end'
                                                        aria-label='delete'
                                                        onClick={() => correctiveHandleRemoveFile(index)}
                                                    >
                                                        <CloseIcon />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </div>
                            {/* <div className='col-md-2' >
                                <Button className='accordian_submit_btn' style={{ float: "none" }}>Submit</Button>

                            </div>
                            <div className='col-md-2'>
                                <Button className='accordian_cancel_btn'>Close</Button>
                            </div> */}
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

export default CorrectiveAction