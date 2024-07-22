import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Modal from 'react-bootstrap/Modal';
import { Autocomplete, TextField } from '@mui/material';
import { Col, Row } from 'react-bootstrap';
import { Grid, Checkbox, Drawer, Box, Typography, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

const DynamicField = (props) => {
    const [fieldAddDialog, setFieldAddDialog] = useState(false);
    const [fields, setFields] = useState([]);
    const [currentField, setCurrentField] = useState({ type: 'input', label: '', options: [] });
    const [confirmAddFieldDialog, setConfirmAddFieldDialog] = useState(false)
    const [pendingField, setPendingField] = useState(null);



    const handleAddField = () => {
        setFields([...fields, { ...currentField, value: '' }]);
        setCurrentField({ type: '', label: '', options: [''] });
    };


    const handleCheckboxChange = (index) => (event) => {
        const newFields = [...fields];
        newFields[index].checked = event.target.checked;
        setFields(newFields);
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setCurrentField({ ...currentField, [name]: value });
    };

    const handleAddOption = () => {
        setCurrentField({ ...currentField, options: [...currentField.options, ''] });
    };
    const handleFieldValueChange = (index, value) => {
        const newFields = [...fields];
        if (newFields[index]) {
            newFields[index].value = value; // Update 'value' in fields
            setFields(newFields);
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...currentField.options];
        newOptions[index] = value;
        setCurrentField({ ...currentField, options: newOptions });
    };

    const fieldTypeOptions = [
        { title: 'Input' },
        { title: 'Dropdown' },
    ];

    const fieldDialogOpen = () => {
        setFieldAddDialog(true);
    };
    const fieldDialogClose = () => {
        setFieldAddDialog(false);
    };

    const confirmDialogOpen = () => {
        setConfirmAddFieldDialog(true)
        setFieldAddDialog(false);
    }
    const confirmDialogClose = () => {
        setConfirmAddFieldDialog(false)
        setFieldAddDialog(false);
    }
    const handleConfirmAddField = () => {
        setFields([...fields, pendingField]); // Add pending field to fields
        setPendingField(null); // Clear pending field
        setConfirmAddFieldDialog(false);
    };


    return (
        <div className=' '>
            <Button
                // style={{
                //     textTransform: "capitalize", backgroundColor: "#533529", color
                //         : "white", border: "none", padding: "10px 15px", fontWeight: "600"
                // }}
                style={{color:"#533529", fontWeight:"600", marginTop:"10px"}}

                onClick={fieldDialogOpen}

            >
                Create new Fields
            </Button>

            <Modal show={fieldAddDialog} onHide={fieldDialogOpen}>
                <Modal.Header className='brown_bg '>
                    <Modal.Title>Create Field</Modal.Title>
                    <button
                        type='button'
                        className='btn-close bg-white'
                        onClick={fieldDialogClose}
                    ></button>
                </Modal.Header>
                <Modal.Body className='modal_bg_body'>
                    <div>
                        <div className='row'>
                            <Col md={6} sm={12} className="mb-3">
                                <Autocomplete
                                    options={fieldTypeOptions}
                                    value={fieldTypeOptions.find(option => option.title.toLowerCase() === currentField.type) || null}
                                    onChange={(event, newValue) => setCurrentField({ ...currentField, type: newValue ? newValue.title.toLowerCase() : '' })}
                                    getOptionLabel={(option) => option.title}
                                    renderOption={(props, option) => (
                                        <li {...props} style={{ fontSize: '12px', padding: '4px 8px' }}>
                                            {option.title}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField {...params}
                                            label="Field Type"
                                            variant="outlined"
                                            InputProps={{
                                                ...params.InputProps,
                                                className: 'custom-input-drop' // Apply the custom class
                                            }}
                                            className="custom-textfield"
                                        />
                                    )}
                                />
                            </Col>
                            <Col md={6} sm={12} className="mb-3">
                                <TextField
                                    InputProps={{ className: 'custom-input' }}
                                    className="custom-textfield"
                                    id="outlined-basic"
                                    label="Label Name"
                                    variant="outlined"
                                    type="text"
                                    name="label"
                                    value={currentField.label}
                                    onChange={handleFieldChange}
                                />
                            </Col>
                            {currentField.type === 'dropdown' && (
                                <div className='mt-0'>
                                    <label className='fw-bold'>Options:</label>
                                    <br />
                                    <TextField
                                        InputProps={{ className: 'custom-input' }}
                                        className="custom-textfield m-1"
                                        type="text"

                                        label="Option 1"
                                        value={currentField.options[0]}
                                        onChange={(e) => handleOptionChange(0, e.target.value)}
                                    />
                                    <Button className=' dynamic_btn' onClick={handleAddOption}>Add Option</Button>
                                    {currentField.options.slice(1).map((option, index) => (
                                        <div key={index}>
                                            <TextField
                                                type="text"
                                                InputProps={{ className: 'custom-input m-1' }}
                                                className="custom-textfield"
                                                label={`Option ${index + 2}`}
                                                value={option}
                                                onChange={(e) => handleOptionChange(index + 1, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Button className='add-Field-btn' onClick={handleAddField}>Add Field</Button>
                        <h6 className='mt-5 font-weight-bold'>Generated Fields</h6>


                        <form>
                            {fields.map((field, index) => (
                                index % 2 === 0 && ( // Render two fields per row
                                    <Row key={index} className='mb-3'>
                                        <Col md={6} sm={6}>
                                            <Grid container alignItems="center">
                                                <Grid item xs={2}>
                                                    <Checkbox
                                                        checked={!!field.value && field.value.trim() !== ''}
                                                        onChange={handleCheckboxChange(index)}
                                                        color="primary"
                                                    />
                                                </Grid>
                                                <Grid item xs={10}>
                                                    {field.type === 'input' ? (
                                                        <TextField
                                                            InputProps={{ className: 'custom-input' }}
                                                            className="custom-textfield"
                                                            type="text"
                                                            label={field.label}
                                                            name={field.label}
                                                            value={field.value || ''}
                                                            onChange={(e) => handleFieldValueChange(index, e.target.value)}
                                                        />
                                                    ) : (
                                                        <Autocomplete
                                                            options={field.options}
                                                            value={field.value || null}
                                                            onChange={(event, newValue) => handleFieldValueChange(index, newValue)}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    label={field.label}
                                                                    variant="outlined"
                                                                    InputProps={{
                                                                        ...params.InputProps,
                                                                        className: 'custom-input-drop' // Apply the custom class
                                                                    }}
                                                                    className="custom-textfield"
                                                                />
                                                            )}
                                                        />
                                                    )}
                                                </Grid>
                                            </Grid>
                                        </Col>
                                        {index + 1 < fields.length && ( // Ensure not out of bounds
                                            <Col md={6} sm={6}>
                                                <Grid container alignItems="center">
                                                    <Grid item xs={2}>
                                                        <Checkbox
                                                            checked={!!fields[index + 1].value && fields[index + 1].value.trim() !== ''}
                                                            onChange={handleCheckboxChange(index + 1)}
                                                            color="primary"
                                                        />
                                                    </Grid>
                                                    <Grid item xs={10}>
                                                        {fields[index + 1].type === 'input' ? (
                                                            <TextField
                                                                InputProps={{ className: 'custom-input' }}
                                                                className="custom-textfield"
                                                                type="text"
                                                                label={fields[index + 1].label}
                                                                name={fields[index + 1].label}
                                                                value={fields[index + 1].value || ''}
                                                                onChange={(e) => handleFieldValueChange(index + 1, e.target.value)}
                                                            />
                                                        ) : (
                                                            <Autocomplete
                                                                options={fields[index + 1].options}
                                                                value={fields[index + 1].value || null}
                                                                onChange={(event, newValue) => handleFieldValueChange(index + 1, newValue)}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        {...params}
                                                                        label={fields[index + 1].label}
                                                                        variant="outlined"
                                                                        InputProps={{
                                                                            ...params.InputProps,
                                                                            className: 'custom-input-drop' // Apply the custom class
                                                                        }}
                                                                        className="custom-textfield"
                                                                    />
                                                                )}
                                                            />
                                                        )}
                                                    </Grid>
                                                </Grid>
                                            </Col>
                                        )}
                                    </Row>
                                )
                            ))}
                        </form>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='outlined' className='dynamic_btn m-1'
                    // onClick={confirmDialogOpen}
                    >Yes</Button>
                    <Button variant='outlined' className='m-1 add-Field-btn p-2' onClick={fieldDialogClose}>No</Button>
                </Modal.Footer>
            </Modal>

            {/* <Drawer anchor="right" open={fieldAddDialog} onClose={fieldDialogClose}>
                <Box sx={{ width: 400 }} className="drawer-container">
                    <Box display="flex" justifyContent="space-between" alignItems="center" p={2} className="drawer-header brown-bg">
                        <Typography variant="h6" className='text-white'>Create Field</Typography>
                        <IconButton onClick={fieldDialogClose}>
                            <CloseIcon className='text-white' />
                        </IconButton>
                    </Box>
                    <Divider />
                    <Box p={2} className="drawer-body modal-bg-body">
                        <div className='row'>
                            <Col md={6} sm={12} className="mb-3">
                                <Autocomplete
                                    options={fieldTypeOptions}
                                    value={fieldTypeOptions.find(option => option.title.toLowerCase() === currentField.type) || null}
                                    onChange={(event, newValue) => setCurrentField({ ...currentField, type: newValue ? newValue.title.toLowerCase() : '' })}
                                    getOptionLabel={(option) => option.title}
                                    renderOption={(props, option) => (
                                        <li {...props} style={{ fontSize: '12px', padding: '4px 8px' }}>
                                            {option.title}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField {...params}
                                            label="Field Type"
                                            variant="outlined"
                                            InputProps={{
                                                ...params.InputProps,
                                                className: 'custom-input-drop' // Apply the custom class
                                            }}
                                            className="custom-textfield"
                                        />
                                    )}
                                />
                            </Col>
                            <Col md={6} sm={12} className="mb-3">
                                <TextField
                                    InputProps={{ className: 'custom-input' }}
                                    className="custom-textfield"
                                    id="outlined-basic"
                                    label="Label Name"
                                    variant="outlined"
                                    type="text"
                                    name="label"
                                    value={currentField.label}
                                    onChange={handleFieldChange}
                                />
                            </Col>
                            {currentField.type === 'dropdown' && (
                                <div className='mt-0'>
                                    <label className='fw-bold'>Options:</label>
                                    <br />
                                    <TextField
                                        InputProps={{ className: 'custom-input' }}
                                        className="custom-textfield m-1"
                                        type="text"
                                        label="Option 1"
                                        value={currentField.options[0]}
                                        onChange={(e) => handleOptionChange(0, e.target.value)}
                                    />
                                    <Button className='accordian_cancel_btn mt-2' onClick={handleAddOption}>Add Option</Button>
                                    {currentField.options.slice(1).map((option, index) => (
                                        <div key={index}>
                                            <TextField
                                                type="text"
                                                InputProps={{ className: 'custom-input m-1' }}
                                                className="custom-textfield"
                                                label={`Option ${index + 2}`}
                                                value={option}
                                                onChange={(e) => handleOptionChange(index + 1, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Button className='dynamic_btn mt-2 float-end' onClick={handleAddField}>Add Field</Button>
                        <Typography variant="h6" className='mt-5 font-weight-bold'>Generated Fields</Typography>
                        <form>
                            {fields.map((field, index) => (
                                <Grid container key={index} className='mb-3'>
                                    <Grid item xs={12}>
                                        <Grid container alignItems="center">
                                            <Grid item xs={2}>
                                                <Checkbox
                                                    checked={!!field.value && field.value.trim() !== ''}
                                                    onChange={handleCheckboxChange(index)}
                                                    color="primary"
                                                />
                                            </Grid>
                                            <Grid item xs={10}>
                                                {field.type === 'input' ? (
                                                    <TextField
                                                        InputProps={{ className: 'custom-input' }}
                                                        className="custom-textfield"
                                                        style={{ width: "100%" }}
                                                        type="text"
                                                        label={field.label}
                                                        name={field.label}
                                                        value={field.value || ''}
                                                        onChange={(e) => handleFieldValueChange(index, e.target.value)}
                                                    />
                                                ) : (
                                                    <Autocomplete
                                                        options={field.options}
                                                        value={field.value || null}
                                                        onChange={(event, newValue) => handleFieldValueChange(index, newValue)}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label={field.label}
                                                                variant="outlined"
                                                                InputProps={{
                                                                    ...params.InputProps,
                                                                    className: 'custom-input-drop' // Apply the custom class
                                                                }}
                                                                className="custom-textfield"
                                                            />
                                                        )}
                                                    />
                                                )}
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            ))}
                        </form>
                    </Box>
                    <Divider />
                    <Box p={2} className="drawer-footer " display="flex" justifyContent="space-between">
                        <Button variant='outlined' className='accordian_submit_btn m-1'>Yes</Button>
                        <Button variant='outlined' className='accordian_cancel_btn p-2' onClick={fieldDialogClose}>No</Button>
                    </Box>
                </Box>
            </Drawer> */}
            <Modal show={confirmAddFieldDialog}>
                <Modal.Header className='brown_bg'>
                    <Modal.Title>Create Fields</Modal.Title>
                    <button
                        type='button'
                        className='btn-close bg-white'
                        onClick={confirmDialogClose}
                    ></button>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Are you sure you want to create these fields
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='outlined' className='dynamic_btn m-1' onClick={handleConfirmAddField}>Yes</Button>
                    <Button variant='outlined' className='m-1 add-Field-btn p-2' onClick={confirmDialogClose}>No</Button>
                </Modal.Footer>
            </Modal>


        </div>
    );
};

export default DynamicField;
