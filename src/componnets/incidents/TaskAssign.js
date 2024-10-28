import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/material/styles';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { Snackbar } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import IntrimAccordian from './accordians/IntrimAccordian';
import RootCauseAnalysisAccordian from './accordians/RootCauseAnalysisAccordian';
import CorrectiveAction from './accordians/CorrectiveAction';
import Preventivections from './accordians/Preventivections';
import { useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import { getEmployeesAndManager, getAllUsers, saveIncidentAssign, getIncidentAssignDetails } from '../../api';

// Mapping section names to their respective IDs
const SECTION_IDS = {
  interimInvestigation: 1,
  correctiveAction: 2,
  preventiveAction: 3,
};

const TaskAssign = ({ selectedDepartment, invokeHistory }) => {

  const { id } = useParams();


  const [selectedSection, setSelectedSection] = useState(SECTION_IDS.interimInvestigation);
  const [showModal3, setShowModal3] = useState(false);
  const [interimInvestigation, setInterimInvestigation] = useState({
    assignTo: '',
    cc: '',
    redo: false,
  });
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState({
    assignTo: '',
    cc: '',
    redo: false,
  });
  const [correctiveAction, setCorrectiveAction] = useState({
    assignTo: '',
    cc: '',
    redo: false,
  });
  const [preventiveAction, setPreventiveAction] = useState({
    assignTo: '',
    cc: '',
    redo: false,
  });
  const [assignToOptions, setAssignToOptions] = useState([]);
  const [ccOptions, setCcOptions] = useState([]);
  const [allCcOptions, setAllCcOptions] = useState([]);
  const [comments, setComments] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const [open, setOpen] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const[assigningId, setAssigningId] = useState()


  const storedUser = JSON.parse(localStorage.getItem('userDetails'));
  const userId = storedUser ? storedUser.userId : null;

  console.log(userId);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const toggleModal3 = () => {
    setShowModal3(!showModal3);
  };

  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
  };


  const handleFieldChange = (sectionId, field, value) => {
    if (sectionId === SECTION_IDS.interimInvestigation) {
      setInterimInvestigation((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else if (sectionId === SECTION_IDS.correctiveAction) {
      setCorrectiveAction((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else if (sectionId === SECTION_IDS.preventiveAction) {
      setPreventiveAction((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };


  useEffect(() => {
    fetchAllCC();
    fetchAssignToTask();
  }, []);

  // useEffect(() => {
  //   if (selectedDepartment) {
  //     fetchAssignToOptions(selectedDepartment.id);
  //     fetchCcOptions(selectedDepartment.id);
  //   }
  // }, [selectedDepartment]);
  useEffect(() => {
    if (selectedDepartment && assignToOptions.length === 0) { // Ensure it's only called when options are empty
      setLoadingOptions(true); // Start loading
      Promise.all([
        fetchAssignToOptions(selectedDepartment.id), // Fetch based on department
        fetchAllCC() // Fetch all CC options (without department filter)
      ]).then(() => setLoadingOptions(false)) // Mark loading as complete
      .catch((error) => {
        console.error('Error while loading options:', error);
        setLoadingOptions(false); // Reset loading even if there was an error
      });
    }
  }, [selectedDepartment]);

  useEffect(() => {
    if (!loadingOptions && assignToOptions.length > 0 && allCcOptions.length > 0) {
      fetchAssignToTask(); // Call fetchAssignToTask only when options are loaded
    }
  }, [loadingOptions, assignToOptions, allCcOptions]);

  const fetchAssignToOptions = async (departmentId) => {
    try {
      const requestBody = {
        orgId: 1,
        flag: 'E',
        departmentId: departmentId,
      };
      const response = await axios.post(getEmployeesAndManager, requestBody);
      const fetchedEmployees = response.data.map((emp) => ({
        id: emp.userId,
        title: emp.userName,
      }));
      setAssignToOptions(fetchedEmployees);
    } catch (error) {
      console.log('Failed to fetch assign to options:', error);
    }
  };

  const fetchCcOptions = async (departmentId) => {
    try {
      const requestBody = {
        orgId: 1,
        flag: 'M',
        departmentId: departmentId,
      };
      const response = await axios.post(getEmployeesAndManager, requestBody);
      const fetchCc = response.data.map((cc) => ({
        id: cc.userId,
        title: cc.userName,
      }));
      setCcOptions(fetchCc);
    } catch (error) {
      console.log('Failed to fetch cc options:', error);
    }
  };

  const fetchAllCC = async () => {
    try {
      const requestBody = {
        orgId: 1,
        flag: 'M',
        departmentId: 0,
      };
      const response = await axios.post(getAllUsers, requestBody);
      console.log(response)
      const allCc = response.data.users.map((user) => ({
        id: user.userId,
        title: user.fullName,
      }));
      setAllCcOptions(allCc);
    } catch (error) {
      console.log('Failed to fetch all CC options:', error);
    }
  };



  const fetchAssignToTask = async () => {
    try {
      const response = await axios.post(getIncidentAssignDetails, { incidentId: id });
      const assignToDetails = response.data.incidentAssignDetails;
      console.log(assignToDetails.assigningId)
      setAssigningId(assignToDetails.assigningId)
      console.log(assigningId)

      if (!loadingOptions) {
        // Find the assignTo and cc users from the options
        const assignToUser = assignToOptions.find(option => option.id === assignToDetails.assignTo);
        const ccUser = allCcOptions.find(option => option.id === assignToDetails.ccUserId); // Fetch from all CC options

        if (assignToDetails.assignTypeId === SECTION_IDS.interimInvestigation) {
          handleSectionChange(SECTION_IDS.interimInvestigation);
          setInterimInvestigation({
            assignTo: assignToUser || '',
            cc: ccUser || '',
            redo: assignToDetails.redoFlag === 1,
          });
        } else if (assignToDetails.assignTypeId === SECTION_IDS.correctiveAction) {
          handleSectionChange(SECTION_IDS.correctiveAction);
          setCorrectiveAction({
            assignTo: assignToUser || '',
            cc: ccUser || '',
            redo: assignToDetails.redoFlag === 1,
          });
        } else if (assignToDetails.assignTypeId === SECTION_IDS.preventiveAction) {
          handleSectionChange(SECTION_IDS.preventiveAction);
          setPreventiveAction({
            assignTo: assignToUser || '',
            cc: ccUser || '',
            redo: assignToDetails.redoFlag === 1,
          });
        }

        setComments(assignToDetails.comments);
      } else {
        console.error('Options are not loaded yet.');
      }
    } catch (error) {
      console.log(error, 'Failed to fetch Assign To task');
    }
  };

  const handleSubmitTaskAssign = async () => {
    try {
      console.log('Selected Section ID:', selectedSection);
      console.log('incidentId', id)
      console.log('assigningId', assigningId)
      const incidentIdNumber = Number(id);
      const requestBody = {
        incidentId: incidentIdNumber,
        flag: assigningId ? 'U' : 'I',
        assigningId: assigningId ? assigningId : '0',
        assignTypeId: selectedSection,
        assignTo: selectedSection === SECTION_IDS.interimInvestigation
          ? interimInvestigation.assignTo?.id
          : selectedSection === SECTION_IDS.correctiveAction
            ? correctiveAction.assignTo?.id
            : preventiveAction.assignTo?.id,
        managerId: selectedSection === SECTION_IDS.interimInvestigation
          ? interimInvestigation.cc?.id
          : selectedSection === SECTION_IDS.correctiveAction
            ? correctiveAction.cc?.id
            : preventiveAction.cc?.id,
        comments: comments,
        redoFlag: selectedSection === SECTION_IDS.interimInvestigation
          ? (interimInvestigation.redo ? 1 : 0)
          : selectedSection === SECTION_IDS.correctiveAction
            ? (correctiveAction.redo ? 1 : 0)
            : (preventiveAction.redo ? 1 : 0)
      }
      console.log(requestBody)
      const response = await axios.post(saveIncidentAssign, requestBody)
      console.log(response)
      if (response?.data?.statusResponse?.responseCode === 201) {
        fetchAssignToTask()
        setMessage("Task assigned Successfully");
        setSeverity('success');
        invokeHistory()
        setOpen(true);
      } else if (response?.data?.statusResponse?.responseCode === 200) {
        fetchAssignToTask()
        setMessage("Task Updated Successfully");
        setSeverity('success');
        invokeHistory()
        setOpen(true);
      } else {
        setMessage("Failed to assign task.");
        setSeverity('error');
        invokeHistory()
        setOpen(true);
      }
    } catch (error) {
      console.log('Error in assigning the task:', error)
      setMessage("Failed to submit Task assigning. Error: " + error.message);
      setSeverity('error');
      invokeHistory();
      setOpen(true);
    }
  };

  return (
    <div>
      <div className='ticket-purpose'>
        <h5 className='subhead_lbl mb-3 fw-bold'>Task assigning</h5>
        {loadingOptions ? (
          <div>Loading...</div>
        ) : (
          <>
            <Row>
              <Col md={4} sm={12}>
                <label className='text_color' style={{ fontWeight: '500' }}>
                  Interim investigation
                  <Checkbox
                    checked={selectedSection === SECTION_IDS.interimInvestigation}
                    onChange={() => handleSectionChange(SECTION_IDS.interimInvestigation)}
                  />
                </label>
              </Col>
              <Col md={4} sm={12}>
                <label className='text_color ml-3' style={{ fontWeight: '500' }}>
                  Corrective action
                  <Checkbox
                    checked={selectedSection === SECTION_IDS.correctiveAction}
                    onChange={() => handleSectionChange(SECTION_IDS.correctiveAction)}
                  />
                </label>
              </Col>
              <Col md={4} sm={12}>
                <label className='text_color ml-3' style={{ fontWeight: '500' }}>
                  Preventive Action
                  <Checkbox
                    checked={selectedSection === SECTION_IDS.preventiveAction}
                    onChange={() => handleSectionChange(SECTION_IDS.preventiveAction)}
                  />
                </label>
              </Col>
            </Row>
            < hr />
            {selectedSection && (
              <div className='mb-3'>
                <div className='col-md-9'>
                  <div className='row assigntask_row'>
                    <div className='col-md-4'>
                      <Form.Group controlId='assignTo'>
                        <Autocomplete
                          options={assignToOptions}
                          value={
                            selectedSection === SECTION_IDS.interimInvestigation
                              ? interimInvestigation.assignTo
                              : selectedSection === SECTION_IDS.correctiveAction
                                ? correctiveAction.assignTo
                                : preventiveAction.assignTo
                          }
                          // loading={assignToOptions.length === 0}
                          onChange={(event, newValue) =>
                            handleFieldChange(selectedSection, 'assignTo', newValue)
                          }
                          getOptionLabel={(option) => option.title || ''}
                          renderInput={(params) => (
                            <TextField {...params}
                              // label={`Assign To ${selectedSection}`}
                              label='Assign To'
                              variant='outlined'
                            // InputProps={{
                            //   ...params.InputProps,
                            //   className: 'custom-input-drop' 
                            // }} 
                            />
                          )}
                        />
                      </Form.Group>
                    </div>
                    {/* Similar setup for the CC and Redo fields */}

                    <div className='col-md-4'>
                      <Form.Group controlId='cc'>
                        <Autocomplete
                          options={allCcOptions}
                          getOptionLabel={(option) => option.title || ''}
                          value={
                            selectedSection === SECTION_IDS.interimInvestigation
                              ? interimInvestigation.cc
                              : selectedSection === SECTION_IDS.correctiveAction
                                ? correctiveAction.cc
                                : preventiveAction.cc
                          }
                          onChange={(event, newValue) =>
                            handleFieldChange(selectedSection, 'cc', newValue)
                          }
                          renderInput={(params) => (
                            <TextField {...params}
                              className='input_border custom-textfield'
                              // label={`CC ${selectedSection}`}
                              label='CC'
                              variant='outlined'
                            // InputProps={{
                            //   ...params.InputProps,
                            //   className: 'custom-input-drop' // Apply the custom class
                            // }}
                            />
                          )}
                        />
                      </Form.Group>
                    </div>

                    <div className='col-md-3'>
                      <Form.Group className='mt-2' controlId='redo'>
                        <Form.Label className='text_color'>
                          Redo
                        </Form.Label>
                        <Checkbox
                          label='Redo'
                          id='redoCheckbox'
                          checked={
                            selectedSection === SECTION_IDS.interimInvestigation
                              ? interimInvestigation.redo
                              : selectedSection === SECTION_IDS.correctiveAction
                                ? correctiveAction.redo
                                : preventiveAction.redo
                          }
                          onChange={(e) =>
                            handleFieldChange(selectedSection, 'redo', e.target.checked)
                          }
                        />
                      </Form.Group>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className='row'>
              <div className='col-md-9'>
                <Form.Group controlId='exampleForm.ControlTextarea1'>
                  <Form.Label className='text_color mb-0'>Comments</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows={2}
                    placeholder='Write your comments'
                    value={comments}
                    onChange={(e) => setComments(e.target.value)} />
                </Form.Group>
              </div>
              <div className='mb-3 col-md-12 float-right'>
                <Button className='close_incident_btn' onClick={handleSubmitTaskAssign}>
                  Submit
                </Button>
              </div>
            </div>
          </>
        )
        }



        {/* Accordians */}
        <div className='accordian_s'>
          <IntrimAccordian selectedSection={selectedSection} invokeHistory={invokeHistory}/>
          <RootCauseAnalysisAccordian selectedSection={selectedSection} invokeHistory={invokeHistory}/>
          {selectedSection === SECTION_IDS.correctiveAction && <CorrectiveAction invokeHistory={invokeHistory}/>}
          {selectedSection === SECTION_IDS.preventiveAction && <Preventivections invokeHistory={invokeHistory}/>}
        </div>
      </div>

      <Snackbar open={open} autoHideDuration={2000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleClose} severity={severity}>
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TaskAssign;
