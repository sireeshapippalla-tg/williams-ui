import React, { useState, useEffect } from 'react';
import { Modal, Button, Tabs, Tab, Form } from 'react-bootstrap';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';

function DepartmentModal() {
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('departments');
    const [departments, setDepartments] = useState([]);
    const [newDeptName, setNewDeptName] = useState('');

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const fetchDepartments = async () => {
        try {
            const response = await axios.post('http://13.127.196.228:8084/iassure/api/users/getAllDepartments');
            const departmentData = response.data;

            // Map department data including IDs and names
            setDepartments(departmentData);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleCreateDepartment = async () => {
        try {
            await axios.post(`http://13.127.196.228:8084/iassure/api/users/saveDepartment?deptName=${encodeURIComponent(newDeptName)}`);
    
            setNewDeptName('');  // Clear input field
            fetchDepartments();  // Refresh department list
        } catch (error) {
            console.error('Error creating department:', error);
        }
    };

    useEffect(() => {
        if (activeTab === 'departments') {
            fetchDepartments();
        }
    }, [activeTab]);

    return (
        <div className='col-md-6 btn_incident_create incident_mbl' style={{ float: "right" }}>
            <Button variant="primary" className='me-2' onClick={handleShow}>
                Add Department &nbsp; <span><AddIcon /></span>
            </Button>

            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton style={{ backgroundColor: '#533529', color: 'white' }}>
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
            </Modal>
        </div>
    );
}

export default DepartmentModal;
