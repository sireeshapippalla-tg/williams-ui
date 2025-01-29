import React, { useState, useEffect } from 'react';
import { Modal,  Tabs, Tab, Form } from 'react-bootstrap';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import { Alert, Snackbar, Button, } from '@mui/material';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';


import { getAllDepartments, saveDepartment } from '../../api';

function DepartmentModal({ onUpdateDepartments }) {
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('departments');
    const [departments, setDepartments] = useState([]);
    const [newDeptName, setNewDeptName] = useState('');
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const handleDeptClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const fetchDepartments = async () => {
        try {
            const response = await axios.post(getAllDepartments);
            const departmentData = response.data;

            // Map department data including IDs and names
            setDepartments(departmentData);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    // const handleCreateDepartment = async () => {
    //     try {
    //         const response = await axios.post(`http://13.236.54.105:8084/iassure/api/users/saveDepartment?deptName=${encodeURIComponent(newDeptName)}`);
           
    //         // if (response.data.statusResponse.responseCode === 200) {
    //         //     setMessage('Department created successfully!');
    //         //     setSeverity('success')
    //         //     setOpen(true)
    //         //     setNewDeptName('')
    //         //     fetchDepartments(); 
    //         //     setActiveTab('departments')
    //         // }else{
    //         //     setMessage('Failed to add department!');
    //         //     setSeverity('error')
    //         //     setOpen(true)
    //         // }
    //         setMessage('Department created successfully!...');
    //         setSeverity('success')
    //         setOpen(true)
    //         setNewDeptName('');  // Clear input field
    //         fetchDepartments();  // Refresh department list
    //         setActiveTab('departments')
    //         onUpdateDepartments();
    //     } catch (error) {
    //         console.log('Error creating department:', error);
    //         setMessage('Error creating department:', error);
    //         setSeverity(error);
    //         setOpen(true)
    //     }
    // };

    const handleCreateDepartment = async () => {
        if (!newDeptName || typeof newDeptName !== "string") {
            setMessage("Invalid department name!");
            setSeverity("error");
            setOpen(true);
            return;
        }
    
        try {
            const response = await axios.post(saveDepartment(newDeptName));
    
            setMessage("Department created successfully!");
            setSeverity("success");
            setOpen(true);
            setNewDeptName("");
            fetchDepartments();
            setActiveTab("departments");
            onUpdateDepartments();
        } catch (error) {
            console.log("Error creating department:", error);
            setMessage("Error creating department!");
            setSeverity("error");
            setOpen(true);
        }
    };
    useEffect(() => {
        if (activeTab === 'departments') {
            fetchDepartments();
        }
    }, [activeTab]);

    return (
        <div className='col-md-6  ' style={{ float: "right", borderRadius: "6px" }}>
          
            <Button className='me-2'
                startIcon={<LibraryAddIcon />}
                onClick={handleShow}
            >
                 Add Department
                {/* <span><AddIcon /></span> */}
            </Button>

            <Modal show={showModal} onHide={handleClose} centered >
                <Modal.Header closeButton className="modal-header-custom" >
                    <Modal.Title>Manage Departments</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <Tabs activeKey={activeTab} onSelect={(tab) => setActiveTab(tab)} className="mb-3">
                        <Tab eventKey="departments" title="Departments">
                            <ul className="list-group">
                                {departments.map(dept => (
                                    <li key={dept.departmentID} className="list-group-item d-flex justify-content-between align-items-center">
                                        <span>{dept.departmentName}</span>
                                        <span className="badge bg-primary rounded-pill">ID: {dept.departmentID}</span>
                                    </li>
                                ))}
                            </ul>
                        </Tab>
                        <Tab eventKey="create" title="Create Department">
                            <Form>
                                <Form.Group className="mb-3" controlId="formDeptName">
                                    <Form.Label>Department Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Department Name"
                                        value={newDeptName}
                                        onChange={(e) => setNewDeptName(e.target.value)}
                                    />
                                </Form.Group>
                                <Button variant="success" onClick={handleCreateDepartment} disabled={!newDeptName.trim()} className='accordian_submit_btn'>
                                    Add Department
                                </Button>
                            </Form>
                        </Tab>
                    </Tabs>
                </Modal.Body>
                <Snackbar open={open} autoHideDuration={3000} onClose={handleDeptClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} className='snackbar-close-btn'>
                <Alert onClose={handleDeptClose} severity={severity} >
                    {message}
                </Alert>
            </Snackbar>
            </Modal>

           
        </div>
    );
}

export default DepartmentModal;
