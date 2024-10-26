import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Modal = ({ isOpen, onClose, children }) => {
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
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                padding: '24px',
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
                {children}
            </div>
        </div>
    );
};

const DynamicFormFields = ({ incidentId }) => {
    const [availableFields, setAvailableFields] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [newlyAddedFields, setNewlyAddedFields] = useState([]);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('existing');
    const [selectedExistingFields, setSelectedExistingFields] = useState([]);
    const [newField, setNewField] = useState({
        type: 'text',
        label: '',
        options: [{ value: '', isSelected: false }]
    });
    const { id } = useParams();

    const fetchAvailableFields = async () => {
        try {
            const response = await axios.post(`http://13.127.196.228:8084/iassure/api/incident/getAllFields`);
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
        }
    };

    const fetchIncidentFields = async () => {
        try {
            const response = await axios.post(`http://13.127.196.228:8084/iassure/api/incident/getIncidentFields`, {
                incidentId: id
            });
            if (response.status === 200) {
                const data = response.data;
                const incidentFields = data.map(field => ({
                    incidentFieldId: field.incidentFieldId,
                    fieldId: field.fieldId,
                    type: field.type,
                    label: field.label,
                    value: JSON.parse(field.selectedOption).value,
                    options: field.options ? JSON.parse(field.options) : []
                }));
                setSelectedFields(incidentFields);
            }
        } catch (error) {
            console.error("Error fetching incident fields:", error);
        }
    };

    useEffect(() => {
        fetchAvailableFields();
        fetchIncidentFields();
    }, [id]);

    const handleFieldChange = (fieldId, value) => {
        setSelectedFields(selectedFields.map(field =>
            field.fieldId === fieldId ? { ...field, value } : field
        ));
        setNewlyAddedFields(newlyAddedFields.map(field =>
            field.fieldId === fieldId ? { ...field, value } : field
        ));
    };

    const handleAddExistingFields = () => {
        const fieldsToAdd = availableFields.filter(field =>
            selectedExistingFields.includes(field.fieldId) &&
            !selectedFields.find(f => f.fieldId === field.fieldId)
        ).map(field => ({
            ...field,
            incidentFieldId: null
        }));

        setSelectedFields([...selectedFields, ...fieldsToAdd]);
        setSelectedExistingFields([]);
        setIsModalOpen(false);
    };

    const handleCreateField = async () => {
        if (!newField.label) return;

        const fieldData = {
            type: newField.type,
            label: newField.label,
            isActive: 1,
            ...(newField.type === 'text' ? { value: '' } : { options: newField.options })
        };

        try {
            const response = await axios.post("http://13.127.196.228:8084/iassure/api/incident/createFields", fieldData);
            if (response.status === 200) {
                const newId = Math.max(...availableFields.map(f => f.fieldId), 0) + 1;
                const fieldToAdd = { fieldId: newId, value: "", ...fieldData };
                setNewlyAddedFields([...newlyAddedFields, fieldToAdd]);
                setNewField({ type: 'text', label: '', options: [{ value: '', isSelected: false }] });
                setIsModalOpen(false);

                fetchAvailableFields();
                fetchIncidentFields();
            }
        } catch (error) {
            console.error("Error saving field:", error);
        }
    };

    const handleAddOption = () => {
        setNewField({
            ...newField,
            options: [...newField.options, { value: '', isSelected: false }]
        });
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

    const handleDeleteField = async (fieldId, isIncidentField = false) => {
        if (isIncidentField) {
            // Handle deleting a field associated with an incident
            const field = selectedFields.find(f => f.fieldId === fieldId);

            if (field) {
                if (field.incidentFieldId) {
                    // Delete from the server if it has an incidentFieldId
                    try {
                        const response = await axios.post("http://13.127.196.228:8084/iassure/api/incident/deleteIncidentField", { incidentFieldId: field.incidentFieldId });
                        if (response.status === 200) {
                            alert(response.data.responseMessage);
                            setSelectedFields(prevFields => prevFields.filter(f => f.fieldId !== fieldId));
                        }
                    } catch (error) {
                        alert("Error deleting incident field.");
                        console.error("Error deleting incident field:", error);
                    }
                } else {
                    // Remove locally if it doesn't have an incidentFieldId
                    setSelectedFields(prevFields => prevFields.filter(f => f.fieldId !== fieldId));
                }
            }
        } else {
            // Handle deleting a newly created field
            const field = newlyAddedFields.find(f => f.fieldId === fieldId);

            if (field) {
                if (field.fieldId) {
                    // Delete from the server if it has a fieldId
                    try {
                        const response = await axios.post("http://13.127.196.228:8084/iassure/api/incident/deleteField", { fieldId });
                        if (response.status === 200) {
                            alert(response.data.responseMessage);
                            setNewlyAddedFields(prevFields => prevFields.filter(f => f.fieldId !== fieldId));
                        }
                    } catch (error) {
                        alert("Error deleting newly added field.");
                        console.error("Error deleting newly added field:", error);
                    }
                } else {
                    // Remove locally if it doesn't have a fieldId
                    setNewlyAddedFields(prevFields => prevFields.filter(f => f.fieldId !== fieldId));
                }
            }
        }
    };


    const handleSubmit = async () => {
        const newFieldsData = newlyAddedFields.map(field => {
            const selectedOption = field.type === 'select'
                ? { value: field.value, isSelected: true }
                : { value: field.value };

            return {
                field_id: field.fieldId,
                incident_id: id,
                is_active: 1,
                selected_option: selectedOption
            };
        });

        if (newFieldsData.length === 0) {
            console.log("No new fields to submit");
            return;
        }

        try {
            const response = await axios.post("http://13.127.196.228:8084/iassure/api/incident/submitFields", { fields: newFieldsData });
            if (response.status === 200) {
                alert("New fields submitted successfully.");
                setNewlyAddedFields([]);
            }
        } catch (error) {
            alert("Error submitting new fields.");
            console.error("Error submitting new fields:", error);
        }
    };

    return (
        <div style={{
            width: '100%',
            // maxWidth: '768px',
            margin: '0 auto',
            backgroundColor: 'white',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.15)',
            // borderRadius: '12px',
            overflow: 'hidden'
        }}>
            <div style={{
                background: '#533529',
                color: 'white',
                padding: '12px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0px 8px 0px 15px;' }}>
                    <div>
                        <span className='accord_typo'>Dynamic Form Builder</span>
                    </div>
                    <div className='d-flex'>
                        {/* <button
                            className='accordian_cancel_btn'
                            onClick={() => setIsModalOpen(true)}>
                            <Plus style={{ height: '16px', width: '16px' }} />
                            Add Fields
                        </button> */}
                        <button
                            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: '#E0E7FF',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {/* <span>Dynamic Form Builder</span> */}
                            <span
                                style={{
                                    transform: isAccordionOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s'
                                }}
                            >
                                {/* ▼ */}
                                <ExpandMoreIcon className='accordian_arrow' />
                            </span>
                        </button>

                    </div>

                </div>
            </div>

            {isAccordionOpen && (
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '1rem' }}>
                    {[...selectedFields, ...newlyAddedFields].map((field) => (
                        <div key={field.fieldId} style={{
                            padding: '1rem',
                            borderBottom: '1px solid #E5E7EB',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '8rem', fontSize: '0.875rem', fontWeight: '500', color: '#4B5563' }}>
                                    {field.label} ({field.type})
                                </div>
                                <div style={{ flex: 1 }}>
                                    {field.type === 'text' ? (
                                        <input
                                            type="text"
                                            value={field.value || ""}
                                            onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '0.375rem'
                                            }}
                                        />
                                    ) : (
                                        <select
                                            value={field.value || ""}
                                            onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '0.375rem'
                                            }}
                                        >
                                            <option value="">{field.label}</option>
                                            {field.options.map((option, idx) => (
                                                <option key={idx} value={option.value}>
                                                    {option.value}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDeleteField(field.fieldId, !!field.incidentFieldId)}
                                    style={{
                                        padding: '0.5rem',
                                        color: '#9CA3AF',
                                        cursor: 'pointer',
                                        borderRadius: '0.375rem',
                                        border: 'none',
                                        backgroundColor: 'transparent'
                                    }}
                                >
                                    <Trash2 style={{ height: '16px', width: '16px' }} />
                                </button>
                            </div>
                        </div>
                    ))}
                    <div>
                        <button
                            className='accordian_cancel_btn'
                            onClick={() => setIsModalOpen(true)}>
                            <Plus style={{ height: '16px', width: '16px' }} />
                            Add Fields
                        </button>
                        <button
                        className='accordian_submit_btn'
                        style={{float:"right"}}
                            onClick={handleSubmit}
                        >
                            Submit1
                        </button>
                    </div>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setNewField({ type: 'text', label: '', options: [{ value: '', isSelected: false }] });
                    setSelectedExistingFields([]);
                    setActiveTab('existing');
                }}
            >
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <button onClick={() => setActiveTab('existing')} style={{ fontWeight: activeTab === 'existing' ? 'bold' : 'normal' }}>Existing Fields</button>
                        <button onClick={() => setActiveTab('new')} style={{ fontWeight: activeTab === 'new' ? 'bold' : 'normal' }}>Create New Field</button>
                    </div>
                    {activeTab === 'existing' ? (
                        <div>
                            {availableFields.map((field) => (
                                <label key={field.fieldId} style={{ display: 'flex', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid #E5E7EB' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedExistingFields.includes(field.fieldId)}
                                        onChange={() => {
                                            setSelectedExistingFields(selectedExistingFields.includes(field.fieldId)
                                                ? selectedExistingFields.filter(id => id !== field.fieldId)
                                                : [...selectedExistingFields, field.fieldId]);
                                        }}
                                    />
                                    <div style={{ marginLeft: '0.75rem' }}>
                                        {field.label} ({field.type})
                                        {field.type === 'select' && (
                                            <ul style={{ marginTop: '0.5rem' }}>
                                                {field.options.map((opt, idx) => <li key={idx} style={{ fontSize: '0.875rem', color: '#4B5563' }}>{opt.value}</li>)}
                                            </ul>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteField(field.fieldId)}
                                        style={{
                                            padding: '0.5rem',
                                            color: '#9CA3AF',
                                            cursor: 'pointer',
                                            borderRadius: '0.375rem',
                                            border: 'none',
                                            backgroundColor: 'transparent'
                                        }}
                                    >
                                        <Trash2 style={{ height: '16px', width: '16px' }} />
                                    </button>
                                </label>
                            ))}
                            <button onClick={handleAddExistingFields} style={{
                                marginTop: '1rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: '#2563EB',
                                color: 'white',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                border: 'none'
                            }}>Add Selected Fields</button>
                        </div>
                    ) : (
                        <div>
                            <h2>Create New Field</h2>
                            <div>
                                <label>Field Type</label>
                                <select value={newField.type} onChange={(e) => setNewField({ ...newField, type: e.target.value })}>
                                    <option value="text">Text Field</option>
                                    <option value="select">Dropdown</option>
                                </select>
                            </div>
                            <div>
                                <label>Field Label</label>
                                <input
                                    type="text"
                                    value={newField.label}
                                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                                />
                            </div>
                            {newField.type === 'select' && (
                                <div>
                                    <label>Options</label>
                                    {newField.options.map((option, index) => (
                                        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                value={option.value}
                                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                            />
                                            <button onClick={() => handleDeleteOption(index)}><Trash2 /></button>
                                        </div>
                                    ))}
                                    <button onClick={handleAddOption}>Add Option</button>
                                </div>
                            )}
                            <button onClick={handleCreateField} style={{
                                marginTop: '1rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: '#2563EB',
                                color: 'white',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                border: 'none'
                            }}>Create Field</button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default DynamicFormFields;
