import React, { useState } from 'react';
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

const filterOptions = (options, params) => {
  const filtered = options.filter(option =>
    option.toLowerCase().includes(params.inputValue.toLowerCase())
  );

  const { inputValue } = params;
  const isExisting = options.some(option => inputValue === option);

  if (inputValue !== '' && !isExisting) {
    filtered.push({
      inputValue,
      title: `Add "${inputValue}"`,
    });
  }

  return filtered;
};


const TaskAssign = () => {
  const [selectedSection, setSelectedSection] = useState('Interim Investigation');
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
  const assignOptions = ['Person 1', 'Person 2', 'Person 3', 'Person 4'];
  const ccOptions = ['CC 1', 'CC 2', 'CC 3', 'CC 4'];

  const toggleModal3 = () => {
    setShowModal3(!showModal3);
  };
  const handleSectionChange = (section) => {
    if (section === 'Corrective action' && selectedSection === 'Preventive Action') {
      setSelectedSection('Corrective action');
    } else if (section === 'Preventive Action' && selectedSection === 'Corrective action') {
      setSelectedSection('Preventive Action');
    } else {
      setSelectedSection(section);
    }
  };

  const handleFieldChange = (section, field, value) => {
    switch (section) {
      case 'Interim Investigation':
        setInterimInvestigation({ ...interimInvestigation, [field]: value });
        break;
      // case 'Root cause analysis':
      //     setRootCauseAnalysis({ ...rootCauseAnalysis, [field]: value });
      //     break;
      case 'Corrective action':
        setCorrectiveAction({ ...correctiveAction, [field]: value });
        break;
      case 'Preventive Action':
        setPreventiveAction({ ...preventiveAction, [field]: value });
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <div className='ticket-purpose'>
        <h5 className='subhead_lbl mb-3 fw-bold'>Task assigning</h5>
        <Row >
          <Col md={4} sm={12}>
            <label
              class='form-check-label'
              for='flexCheckDefault'
              className='text_color '
              style={{ fontWeight: "500" }}
            >
              Interim investigation
              <Checkbox
                checked={selectedSection === 'Interim Investigation'}
                onChange={() =>
                  handleSectionChange('Interim Investigation')
                }
              />
            </label>
          </Col>
          <Col md={4} sm={12}>
            <label
              class='form-check-label'
              for='flexCheckDefault'
              className='text_color ml-3'
              style={{ fontWeight: "500" }}
            >
              Corrective action
              <Checkbox
                checked={selectedSection === 'Corrective action'}
                onChange={() => handleSectionChange('Corrective action')}
              />
            </label>
          </Col>
          <Col md={4} sm={12}>
            <label
              class='form-check-label'
              for='flexCheckDefault'
              className='text_color ml-3'
              style={{ fontWeight: "500" }}
            >
              Preventive Action
              <Checkbox
                checked={selectedSection === 'Preventive Action'}
                onChange={() => handleSectionChange('Preventive Action')}
              />
            </label>
          </Col>
        </Row>
        <hr />
        {selectedSection && (
          <div className='mb-3'>
            <div className='col-md-9'>
              <div className='row assigntask_row'>
                {/* <div>{selectedSection}</div> */}


                <div className='col-md-4'>
                  <Form.Group className='' controlId='assignTo'>
                    <Autocomplete
                      options={assignOptions}
                      value={
                        selectedSection === 'Interim Investigation'
                          ? interimInvestigation.assignTo
                          : selectedSection === 'Corrective action'
                            ? correctiveAction.assignTo
                            : preventiveAction.assignTo
                      }
                      onChange={(event, newValue) =>
                        handleFieldChange(selectedSection, 'assignTo', newValue)
                      }
                      renderInput={(params) => (
                        <TextField {...params}
                         className='input_border custom-textfield'
                          label='Assign To' 
                          variant='outlined' 
                          InputProps={{
                            ...params.InputProps,
                            className: 'custom-input-drop' // Apply the custom class
                          }}
                          />
                      )}
                    />
                  </Form.Group>
                </div>

                <div className='col-md-4'>
                  <Form.Group className='' controlId='cc'>
                    <Autocomplete
                      options={ccOptions}
                      value={
                        selectedSection === 'Interim Investigation'
                          ? interimInvestigation.cc
                          : selectedSection === 'Root cause analysis'
                            ? rootCauseAnalysis.cc
                            : selectedSection === 'Corrective action'
                              ? correctiveAction.cc
                              : preventiveAction.cc
                      }
                      onChange={(event, newValue) =>
                        handleFieldChange(selectedSection, 'cc', newValue)
                      }
                      renderInput={(params) => (
                        <TextField {...params} 
                        className='input_border custom-textfield' 
                        label='CC' variant='outlined'
                        InputProps={{
                          ...params.InputProps,
                          className: 'custom-input-drop' // Apply the custom class
                        }}
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
                        selectedSection === 'Interim Investigation'
                          ? interimInvestigation.redo
                          : selectedSection === 'Root cause analysis'
                            ? rootCauseAnalysis.redo
                            : selectedSection === 'Corrective action'
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
            <Form.Group
              className=''
              controlId='exampleForm.ControlTextarea1'
            >
              <Form.Label className='text_color mb-0'>Comments</Form.Label>
              <Form.Control
                style={{ backgroundColor: "#f4f4f4" }}
                className='input_border'
                as='textarea'
                rows={2}
                placeholder='Write your comments'
              />
            </Form.Group>
          </div>
          <div col-md-3></div>

          <div className='mt-3 col-md-3'>
            <Button
              className='close_incident_btn'
              onClick={toggleModal3}
              style={{
                textTransform: 'capitalize',
              }}
            >
              Close the incident
            </Button>
            <Modal show={showModal3} onHide={toggleModal3}>
              <Modal.Header className='blue-bg '>
                <Modal.Title>Close the incident</Modal.Title>
                <button
                  type='button'
                  className='btn-close bg-white'
                  onClick={toggleModal3}
                ></button>
              </Modal.Header>
              <Modal.Body>
                <label>Are you sure you want to close the incident!</label>
              </Modal.Body>
              <Modal.Footer>
                <button className='blue-bg border-0 text-white rounded btn-blue'>
                  Yes
                </button>
                <button
                  className='btn btn-danger btn-orange'
                  onClick={toggleModal3}
                >
                  No
                </button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>

        {/* <hr className='mt-5' /> */}

      </div>

      {/* Accordians */}
      <div className='accordian_s'>
        <IntrimAccordian selectedSection={selectedSection} />
        <RootCauseAnalysisAccordian selectedSection={selectedSection} />
        {selectedSection === 'Corrective action' && <CorrectiveAction selectedSection={selectedSection} />}
        {selectedSection === 'Preventive Action' && <Preventivections selectedSection={selectedSection} />}
      </div>
    </div>
  )
}

export default TaskAssign;