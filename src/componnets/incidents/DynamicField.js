import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TextField, Autocomplete, FormControl, Checkbox, Typography, Grid, Button, IconButton, CircularProgress, Snackbar, Alert } from '@mui/material';

import { createFields, getIncidentFields, getAllFields, deleteIncidentField, deleteField, submitFields } from '../../api';


const Modal = ({ isOpen, onClose, children, loading }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '600px',
                overflowY: 'auto',
                maxHeight: '90vh',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#aaa'
                    }}
                >
                    <X size={24} />
                </button>
                {loading && <CircularProgress style={{ color: '#533529', margin: '1rem auto', display: 'block' }} />}
                {children}
            </div>
        </div>
    );
};

const DynamicFormFields = ({ incidentId }) => {
    const [incidentFields, setIncidentFields] = useState([]);
    const [availableFields, setAvailableFields] = useState([]);
    const [tempIncidentFields, setTempIncidentFields] = useState([]);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('existing');
    const [selectedExistingFields, setSelectedExistingFields] = useState([]);
    const [newField, setNewField] = useState({
        type: 'text',
        label: '',
        options: [{ value: '', isSelected: false }]
    });
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('');
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const { id } = useParams();
    const fieldTypes = [
        { label: 'Text Field', value: 'text' },
        { label: 'Dropdown', value: 'select' },
    ];

    const fetchAvailableFields = async () => {
        setLoading(true);
        try {
            const response = await axios.post(getAllFields);
            if (response.status === 200) {
                const data = response.data.dynamicFields;
                const parsedFields = data.map(field => {
                    const fieldData = JSON.parse(field.fieldData);
                    return {
                        fieldId: field.id,
                        type: fieldData.type,
                        label: fieldData.label,
                        options: fieldData.options || [],
                        value: fieldData.type === 'text' ? "" : null,
                    };
                });
                setAvailableFields(parsedFields);
            }
        } catch (error) {
            console.error("Error fetching available fields:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchIncidentFields = async () => {
        setLoading(true);
        try {
            const response = await axios.post(getIncidentFields, {
                incidentId: id
            });
            if (response.status === 200) {
                const data = response.data;
                const incidentRelatedFields = data.map(field => ({
                    incidentFieldId: field.incidentFieldId,
                    fieldId: field.fieldId,
                    type: field.type,
                    label: field.label,
                    value: JSON.parse(field.selectedOption).value,
                    options: field.options ? JSON.parse(field.options) : []
                }));
                setIncidentFields(incidentRelatedFields);
            }
        } catch (error) {
            console.error("Error fetching incident fields:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailableFields();
        fetchIncidentFields();
    }, [id]);

    const handleFieldChange = (fieldId, value) => {
        setTempIncidentFields(tempIncidentFields.map(field =>
            field.fieldId === fieldId ? { ...field, value } : field
        ));
    };

    const showSnackbar = (msg, sev) => {
        setMessage(msg);
        setSeverity(sev);
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handleCreateField = async () => {
        if (!newField.label) return;

        const fieldData = {
            type: newField.type,
            label: newField.label,
            ...(newField.type === 'text' ? { value: '' } : { options: newField.options })
        };

        setLoading(true);
        try {
            const response = await axios.post(createFields, fieldData);
            if (response.status === 200) {
                showSnackbar("New field created successfully.", 'success');
                setNewField({ type: 'text', label: '', options: [{ value: '', isSelected: false }] });
                setActiveTab('existing');
                fetchAvailableFields();
            }
        } catch (error) {
            console.error("Error saving field:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExistingFields = () => {
        const fieldsToAdd = availableFields.filter(field =>
            selectedExistingFields.includes(field.fieldId)
        );
        setTempIncidentFields([...tempIncidentFields, ...fieldsToAdd]);
        setSelectedExistingFields([]);
        setIsModalOpen(false);
        showSnackbar("Selected fields added to incident.", 'success');
    };

    const handleDeleteField = async (fieldId) => {
        const fieldInTemp = tempIncidentFields.some(field => field.fieldId === fieldId);

        if (fieldInTemp) {
            setTempIncidentFields(tempIncidentFields.filter(field => field.fieldId !== fieldId));
        } else {
            const fieldInIncident = incidentFields.some(field => field.fieldId === fieldId);

            if (fieldInIncident) {
                setLoading(true);
                try {
                    const response = await axios.post(deleteIncidentField, {
                        "incidentId": id,
                        "fieldId": fieldId
                    });
                    if (response.status === 200) {
                        showSnackbar("Field deleted from incident successfully.", 'success');
                        fetchIncidentFields();
                    }
                } catch (error) {
                    console.error("Error deleting incident field:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(true);
                try {
                    const response = await axios.post(deleteField, { fieldId });
                    if (response.status === 200) {
                        showSnackbar("Field deleted successfully.", 'success');
                        fetchAvailableFields();
                    }
                } catch (error) {
                    console.error("Error deleting field:", error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchAvailableFields();
    };

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...newField.options];
        updatedOptions[index] = { ...updatedOptions[index], value };
        setNewField({
            ...newField,
            options: updatedOptions
        });
    };

    const handleDeleteOption = (index) => {
        const updatedOptions = newField.options.filter((_, i) => i !== index);
        setNewField({
            ...newField,
            options: updatedOptions
        });
    };

    const handleAddOption = () => {
        setNewField({
            ...newField,
            options: [...newField.options, { value: '', isSelected: false }]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fieldsToSubmit = tempIncidentFields.map(field => ({
            field_id: field.fieldId,
            incident_id: id,
            is_active: 1,
            selected_option: field.type === 'select'
                ? { value: field.value, isSelected: true }
                : { value: field.value }
        }));
        console.log(id, "Incident ID");
        if (fieldsToSubmit.length === 0) {
            showSnackbar("No new fields to submit.", 'info');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(submitFields, { fields: fieldsToSubmit });
            if (response.status === 200) {
                showSnackbar("Fields submitted successfully.", 'success');
                setTempIncidentFields([]);
                fetchIncidentFields();
            }
        } catch (error) {
            console.error("Error submitting fields:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: '100%', margin: '0 auto', backgroundColor: 'white', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }}>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>

            <div style={{ background: '#533529', color: 'white', padding: '12px', cursor: "pointer" }}>
                <div onClick={() => setIsAccordionOpen(!isAccordionOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className='accord_typo'>Additional Fields</span>
                    <ExpandMoreIcon style={{ transform: isAccordionOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginRight: "10px" }} />
                </div>
            </div>
            {/* 
            {isAccordionOpen && (
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '1rem' }}>
                    {loading && <div>Loading...</div>}
                    {(incidentFields.length > 0 || tempIncidentFields.length > 0) ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            {[...incidentFields, ...tempIncidentFields].map((field) => (
                                <div key={field.fieldId} style={{ flex: `0 0 calc(33.33% - 1rem)`, boxSizing: 'border-box' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            {field.type === 'text' ? (
                                                <TextField
                                                    label={field.label}
                                                    variant="outlined"
                                                    className="custom-textfield w-100"
                                                    InputProps={{ className: 'custom-input' }}
                                                    value={field.value || ""}
                                                    onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
                                                />
                                            ) : (
                                                <Autocomplete
                                                    options={field.options}
                                                    value={field.options.find(option => option.value === field.value) || null}
                                                    onChange={(event, newValue) => handleFieldChange(field.fieldId, newValue ? newValue.value : "")}
                                                    inputValue={field.value || ''}
                                                    getOptionLabel={(option) => (option && option.value ? option.value : '')}
                                                    renderInput={(params) => <TextField {...params} label={field.label} variant="outlined" />}
                                                />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteField(field.fieldId)}
                                            style={{ padding: '0.5rem', color: '#9CA3AF', cursor: 'pointer', backgroundColor: 'transparent' }}
                                        >
                                            <Trash2 style={{ height: '16px', width: '16px' }} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Typography variant="body1" color="textSecondary" style={{ textAlign: 'center', padding: '1rem' }}>
                            No fields available. Please click on "Add Fields" to add new fields.
                        </Typography>
                    )}
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                        <button className='accordian_cancel_btn' 
                        onClick={(event) => {
                            event.preventDefault(); 
                            setIsModalOpen(true);     
                        }}
                        >
                            <Plus style={{ height: '16px', width: '16px' }} /> Add Fields
                        </button>
                        <button className='accordian_submit_btn' onClick={handleSubmit}>Submit</button>
                    </div>
                </div>
            )} */}
            {isAccordionOpen && (
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '1rem' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                            <CircularProgress />
                        </div>
                    ) : (
                        <>
                            {(incidentFields.length > 0 || tempIncidentFields.length > 0) ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                    {[...incidentFields, ...tempIncidentFields].map((field) => (
                                        <div key={field.fieldId} style={{ flex: `0 0 calc(33.33% - 1rem)`, boxSizing: 'border-box' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    {field.type === 'text' ? (
                                                        <TextField
                                                            label={field.label}
                                                            variant="outlined"
                                                            className="custom-textfield w-100"
                                                            InputProps={{ className: 'custom-input' }}
                                                            value={field.value || ""}
                                                            onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
                                                        />
                                                    ) : (
                                                        <Autocomplete
                                                            options={field.options}
                                                            value={field.options.find(option => option.value === field.value) || null}
                                                            onChange={(event, newValue) => handleFieldChange(field.fieldId, newValue ? newValue.value : "")}
                                                            inputValue={field.value || ''}
                                                            getOptionLabel={(option) => (option && option.value ? option.value : '')}
                                                            renderInput={(params) => <TextField {...params} label={field.label} variant="outlined" />}
                                                        />
                                                    )}
                                                </div>
                                                <div
                                                    onClick={() => handleDeleteField(field.fieldId)}
                                                    style={{ padding: '0.5rem', color: '#9CA3AF', cursor: 'pointer', backgroundColor: 'transparent' }}
                                                >
                                                    <Trash2 style={{ height: '16px', width: '16px', color:"red" }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Typography variant="body1" color="textSecondary" style={{ textAlign: 'center', padding: '1rem' }}>
                                    No fields available. Please click on "Add Fields" to add new fields.
                                </Typography>
                            )}
                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                <button className='accordian_cancel_btn'
                                    onClick={(event) => {
                                        event.preventDefault();
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <Plus style={{ height: '16px', width: '16px' }} /> Add Fields
                                </button>
                                <button className='accordian_submit_btn' onClick={handleSubmit}>Submit</button>
                            </div>
                        </>
                    )}
                </div>
            )}


            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
            // loading={loading}
            >
                <div>
                    <div style={{ display: 'flex', padding: "15px", backgroundColor: "#533529", color: "white" }}>
                        <div onClick={() => setActiveTab('existing')} style={{ cursor: 'pointer', padding: '0.5rem 1rem', borderBottom: activeTab === 'existing' ? '2px solid #2563EB' : 'none' }}>Existing Fields</div>
                        <div onClick={() => setActiveTab('new')} style={{ cursor: 'pointer', padding: '0.5rem 1rem', borderBottom: activeTab === 'new' ? '2px solid #2563EB' : 'none' }}>Create New Field</div>
                    </div>
                    {activeTab === 'existing' ? (
                        <>
                            <div
                                style={{
                                    padding: "24px",
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '10px',
                                    minHeight: "350px",
                                    maxHeight: "350px",
                                    overflowY: 'auto',
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)'
                                }}
                            >
                                {loading ? (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '100%'
                                    }}>
                                        <Typography variant="h6" color="textSecondary">Loading...</Typography>
                                    </div>
                                ) : (
                                    <Grid container spacing={2}>
                                        {availableFields.map((field) => (
                                            <Grid item xs={12} sm={6} key={field.fieldId}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '12px 16px',
                                                    border: '1px solid #E0E0E0',
                                                    borderRadius: '8px',
                                                    backgroundColor: '#F3F4F6',
                                                    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.05)'
                                                }}>
                                                    <Checkbox
                                                        checked={selectedExistingFields.includes(field.fieldId)}
                                                        onChange={() => setSelectedExistingFields(prev =>
                                                            prev.includes(field.fieldId)
                                                                ? prev.filter(id => id !== field.fieldId)
                                                                : [...prev, field.fieldId]
                                                        )}
                                                        color="primary"
                                                    />
                                                    <Typography variant="body1" style={{ flex: 1, fontWeight: 500, color: '#4B5563' }}>
                                                        {field.label}
                                                    </Typography>
                                                    <IconButton
                                                        onClick={() => handleDeleteField(field.fieldId)}
                                                        style={{ color: '#9CA3AF' }}
                                                    >
                                                        <Trash2 style={{ fontSize: '20px', color: '#d9534f' }} />
                                                    </IconButton>
                                                </div>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: "14px" }}>
                                <Button
                                    onClick={handleAddExistingFields}
                                    variant="contained"
                                    color="primary"
                                    className='accordian_submit_btn'
                                    style={{
                                        padding: "10px 24px",
                                        borderRadius: "8px",
                                        fontWeight: '600',
                                        textTransform: 'capitalize',
                                        boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    Add Selected Fields
                                </Button>
                            </div>
                        </>

                    ) : (
                        <>
                            <div style={{
                                padding: "24px",
                                backgroundColor: '#FFFFFF',
                                borderRadius: '10px',
                                minHeight: "350px",
                                maxHeight: "350px",
                                overflowY: 'auto',
                                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)'
                            }}>
                                {/* Field Type Selection */}
                                <FormControl fullWidth margin="normal">
                                    <Autocomplete
                                        options={fieldTypes}
                                        getOptionLabel={(option) => option.label}
                                        onChange={(event, newValue) => setNewField({ ...newField, type: newValue ? newValue.value : '' })}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Field Type"
                                                variant="outlined"
                                                style={{ backgroundColor: '#F9FAFB', borderRadius: '8px' }}
                                            />
                                        )}
                                    />
                                </FormControl>

                                {/* Field Label Input */}
                                <TextField
                                    label="Field Label"
                                    value={newField.label}
                                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    style={{ backgroundColor: '#F9FAFB', borderRadius: '8px' }}
                                />

                                {/* Select Options Section */}
                                {newField.type === 'select' && (
                                    <div style={{ marginTop: '16px' }}>
                                        <Typography variant="subtitle1" style={{ fontWeight: 'bold', marginBottom: '8px' }}>Options</Typography>
                                        {newField.options.map((option, index) => (
                                            <div key={index} style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                                                <TextField
                                                    variant="outlined"
                                                    value={option.value}
                                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                                    style={{ flex: 1, marginRight: '10px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}
                                                />
                                                <IconButton onClick={() => handleDeleteOption(index)} style={{ color: '#d9534f' }}>
                                                    <Trash2 />
                                                </IconButton>
                                            </div>
                                        ))}
                                        <Button
                                            onClick={handleAddOption}
                                            variant="text"
                                            style={{
                                                textTransform: 'capitalize',
                                                color: "#533529",
                                                padding: '8px 12px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Click here to Add Option
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Create Field Button */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '14px' }}>
                                <Button
                                    onClick={handleCreateField}
                                    // variant="contained"
                                    className='accordian_submit_btn'
                                    style={{
                                        padding: "10px 24px",
                                        borderRadius: "8px",
                                        fontWeight: '600',
                                        textTransform: 'capitalize',
                                        boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',

                                    }}
                                >
                                    Create Field
                                </Button>
                            </div>
                        </>

                    )}
                </div>
            </Modal>
        </div>
    );
};

export default DynamicFormFields;
