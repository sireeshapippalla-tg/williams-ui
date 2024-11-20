import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col } from 'react-bootstrap';
import { Autocomplete, TextField, Button, InputAdornment } from '@mui/material';
import Modal from 'react-bootstrap/Modal';
import { Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import TitleIcon from '@mui/icons-material/Title';
import ManIcon from '@mui/icons-material/Man';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import Person2Icon from '@mui/icons-material/Person2';
import EmailIcon from '@mui/icons-material/Email';
import CallIcon from '@mui/icons-material/Call';
import ApartmentIcon from '@mui/icons-material/Apartment';

import { getAllDepartments, getMastersListByType, createUser, getUserTypes } from '../../api';


const AddUser = () => {
    const navigate = useNavigate();


    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    const [open, setOpen] = useState(false);
    const [departments, setDepartments] = useState([])
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [addUserDialog, setAddUserDialog] = useState(false);
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [contactNumber, setContactNumber] = useState('')
    const [inputs, setInputs] = useState({
        Title: { value: null, options: [] },
        Gender: { value: null, options: [] },

    });
    const [userType, setUserType] = useState([]);
    const [selectedUserType, setSelectedUSerType] = useState(null)


    useEffect(() => {
        fetchDepartments();
        fetchDropdowns();
        fetchUserTypesDropdown();
    }, [])
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };
    const onClickAddUserDialogOpen = () => {
        setAddUserDialog(true);
    };

    const onClickAddUserDialogClose = () => {
        setAddUserDialog(false);
    };
    //get all departments
    const fetchDepartments = async () => {
        try {
            const payload = {
                "orgId": 1
            }
            const response = await axios.post(getAllDepartments, {})
            console.log('departments', response)
            const departmentList = response.data.map((dept) => ({
                id: dept.departmentID,
                title: dept.departmentName
            }))
            setDepartments(departmentList)
            console.log(departments)

        } catch (error) {
            console.log(`Error in fetching the Departments:`, error)
        }
    }

    const handleDepartmentChange = (event, newValue) => {
        setSelectedDepartment(newValue);
    };


    const fetchDropdownsData = async (sourceName) => {
        try {
            const response = await axios.post(getMastersListByType, { sourceName });
            console.log(response)
            return response.data.masterList.map(item => ({ id: item.sourceId, title: item.sourceType }));
        } catch (error) {
            console.error(`Error fetching data for ${sourceName}:`, error);
            return [];
        }
    }

    const fetchDropdowns = async () => {
        try {
            const [genderData, titleData] = await Promise.all([
                fetchDropdownsData("Gender"),
                fetchDropdownsData("Title")

            ]);

            setInputs(prevState => ({
                ...prevState,
                Gender: { ...prevState.Gender, options: genderData },
                Title: { ...prevState.Title, options: titleData },
            }));
            console.log("inputs", inputs)
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    const handleChange = (name) => (event, newValue) => {
        setInputs(prevState => ({
            ...prevState,
            [name]: {
                ...prevState[name],
                value: newValue
            }
        }));
    };

    const fetchUserTypesDropdown = async () => {
        try {
            const response = await axios.post(getUserTypes, {})
            console.log(response)
            const userTypeData = response.data.map((user) => ({
                id: user.userTypeId,
                title: user.userType
            }))
            setUserType(userTypeData)
            console.log(userType)
        } catch (error) {
            console.log('Failed to fetch Usertypes :', error)
        }
    }

    const handleuserTypeChange = (event, newValue) => {
        setSelectedUSerType(newValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("submit")
        try {
            const payload = {
                orgId: 1,
                createdBy: 1,
                firstName: firstName,
                lastName: lastName,
                title: inputs.Title.value ? inputs.Title.value.id : null,
                gender: inputs.Gender.value ? inputs.Gender.value.id : null,
                departmentId: selectedDepartment ? selectedDepartment.id : null,
                username: email,
                userTypeId: selectedUserType ? selectedUserType.id : null

            }

            console.log("userpayload", payload)
            const response = await axios.post(createUser, payload)
            console.log(response)
            if (response.data.statusResponse) {
                const { responseCode, responseMessage } = response.data.statusResponse;

                if (responseCode === 200) {
                    onClickAddUserDialogClose()
                    setMessage("User added successfully!");
                    setSeverity('success');
                    setOpen(true);
                    // Optionally navigate or perform other actions
                    setTimeout(() => navigate('/admin/pannel'), 2000);
                } else if (responseCode === 409) {
                    onClickAddUserDialogClose()
                    setMessage(responseMessage || 'Email already exists');
                    setSeverity('error');
                    setOpen(true);
                } else {
                    onClickAddUserDialogClose()
                    setMessage("Failed to add User.");
                    setSeverity('error');
                    setOpen(true);
                }
            } else {
                onClickAddUserDialogClose()
                setMessage("Unexpected response structure.");
                setSeverity('error');
                setOpen(true);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage("Failed to add User. Error: " + error.message);
            setSeverity('error');
            setOpen(true);
        }


    }
    return (
        <div className=''>
            <h5 style={{ fontSize: '24px', fontWeight: '600', }}>
                Basic details
            </h5>
            <hr style={{ border: "1px solid white" }} />
            <div
                className='adduser-card-main'
            //  style={{ padding: "0px 180px" }}
            >
                <div className='card border-0 adduser-card' style={{ padding: "25px", backgroundColor: "#f4f4f4" }}>
                    <h6 style={{ fontSize: '24px', fontWeight: '600', marginBottom: "20px" }}>
                        Create User
                    </h6>
                    <form>
                        <Row>
                            {/* {Object.entries(inputs).map(([name, { value, options }], index) => (
                                <Col key={index} md={6} sm={12} className="mb-3">
                                    <div className='resolve-drop'>
                                        <Autocomplete
                                            style={{ padding: "0px" }}
                                            value={value}
                                            onChange={handleChange(name)}
                                            filterOptions={(options, params) => {
                                                const filtered = options.filter(option =>
                                                    option.title.toLowerCase().includes(params.inputValue.toLowerCase())
                                                );
                                                const { inputValue } = params;
                                                const isExisting = options.some(option => inputValue === option.title);
                                                if (inputValue !== '' && !isExisting) {
                                                    filtered.push({
                                                        inputValue,
                                                        title: `"${inputValue}"`,
                                                        addOption: true
                                                    });
                                                }
                                                return filtered;
                                            }}
                                            selectOnFocus
                                            clearOnBlur
                                            handleHomeEndKeys
                                            id={`${name}-autocomplete`}
                                            // open={handleToggleOpen[name]}
                                            // onOpen={() => setHandleToggleOpen(prev => ({ ...prev, [name]: true }))}
                                            // onClose={() => setHandleToggleOpen(prev => ({ ...prev, [name]: false }))}
                                            options={options}
                                            getOptionLabel={(option) => {
                                                if (typeof option === 'string') {
                                                    return option;
                                                }
                                                if (option.inputValue) {
                                                    return option.inputValue;
                                                }
                                                return option.title;
                                            }}

                                            renderInput={(params) => (
                                                <TextField {...params}
                                                    label={`${name}`}
                                                    variant="outlined"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        className: 'custom-input-drop' // Apply the custom class
                                                    }}
                                                    className="custom-textfield"
                                                />
                                            )}
                                        />
                                    </div>
                                </Col>
                            ))} */}
                            {Object.entries(inputs).map(([name, { value, options }], index) => {
                                // Select icons based on field name
                                const icon = name === 'Title' ? <TitleIcon /> : name === 'Gender' ? <ManIcon /> : null;

                                return (
                                    <Col key={index} md={6} sm={12} className="mb-3">
                                        <div className='resolve-drop'>
                                            <Autocomplete
                                                style={{ padding: "0px" }}
                                                value={value}
                                                onChange={handleChange(name)}
                                                filterOptions={(options, params) => {
                                                    const filtered = options.filter(option =>
                                                        option.title.toLowerCase().includes(params.inputValue.toLowerCase())
                                                    );
                                                    const { inputValue } = params;
                                                    const isExisting = options.some(option => inputValue === option.title);
                                                    if (inputValue !== '' && !isExisting) {
                                                        filtered.push({
                                                            inputValue,
                                                            title: `"${inputValue}"`,
                                                            addOption: true
                                                        });
                                                    }
                                                    return filtered;
                                                }}
                                                selectOnFocus
                                                clearOnBlur
                                                handleHomeEndKeys
                                                id={`${name}-autocomplete`}
                                                options={options}
                                                getOptionLabel={(option) => {
                                                    if (typeof option === 'string') {
                                                        return option;
                                                    }
                                                    if (option.inputValue) {
                                                        return option.inputValue;
                                                    }
                                                    return option.title;
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label={`${name}`}
                                                        variant="outlined"
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            className: 'custom-input-drop',  // Apply the custom class
                                                            startAdornment: (                 // Add the icon to the left
                                                                <InputAdornment position="start">
                                                                    {icon}
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        className="custom-textfield"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </Col>
                                );
                            })}
                            <Col md={6} sm={12} className="mb-3">
                                <div className='resolve-drop'>
                                    <Autocomplete
                                        style={{ padding: "0px" }}
                                        options={userType}
                                        value={selectedUserType}
                                        onChange={handleuserTypeChange}
                                        getOptionLabel={(option) => option.title}
                                        renderOption={(props, option) => (
                                            <li {...props} style={{ fontSize: '12px', padding: '4px 8px' }}>
                                                {option.title}
                                            </li>
                                        )}
                                        renderInput={(params) => (
                                            <TextField {...params}
                                                label="User type"
                                                variant="outlined"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    className: 'custom-input-drop',
                                                    startAdornment: (                 // Add the icon to the left
                                                        <InputAdornment position="start">
                                                            <GroupIcon />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                className="custom-textfield"
                                            />
                                        )}
                                    />
                                </div>
                            </Col>
                            <Col md={6} sm={12} className="mb-3">
                                <TextField
                                    InputProps={{
                                        className: 'custom-input',
                                        startAdornment: (
                                            <InputAdornment position="start">  {/* Icon on the left */}
                                                <Person2Icon />
                                            </InputAdornment>
                                        ),
                                    }}
                                    className="custom-textfield"
                                    id="outlined-basic"
                                    label="First Name"
                                    variant="outlined"
                                    style={{ width: "100%" }}
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </Col>
                            <Col md={6} sm={12} className="mb-3">
                                <TextField
                                    InputProps={{
                                        className: 'custom-input',
                                        startAdornment: (
                                            <InputAdornment position="start">  {/* Icon on the left */}
                                                <Person2Icon />
                                            </InputAdornment>
                                        ),
                                    }}
                                    className="custom-textfield"
                                    id="outlined-basic"
                                    label="Last Name"
                                    variant="outlined"
                                    style={{ width: "100%" }}
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </Col>
                            <Col md={6} sm={12} className="mb-3">
                                <TextField
                                    InputProps={{
                                        className: 'custom-input',
                                        startAdornment: (
                                            <InputAdornment position="start">  {/* Icon on the left */}
                                                <EmailIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                    className="custom-textfield"
                                    id="outlined-basic"
                                    label="Email"
                                    variant="outlined"
                                    style={{ width: "100%" }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Col>
                            <Col md={6} sm={12} className="mb-3">
                                <TextField
                                    InputProps={{
                                        className: 'custom-input',
                                        startAdornment: (
                                            <InputAdornment position="start">  {/* Icon on the left */}
                                                <CallIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                    className="custom-textfield"
                                    id="outlined-basic"
                                    label="Contact Number"
                                    variant="outlined"
                                    style={{ width: "100%" }}
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                />
                            </Col>
                            <Col md={6} sm={12} className="mb-3">
                                <div className='resolve-drop'>
                                    <Autocomplete
                                        style={{ padding: "0px" }}
                                        options={departments}
                                        value={selectedDepartment}
                                        onChange={handleDepartmentChange}
                                        getOptionLabel={(option) => option.title}
                                        renderOption={(props, option) => (
                                            <li {...props} style={{ fontSize: '12px', padding: '4px 8px' }}>
                                                {option.title}
                                            </li>
                                        )}
                                        renderInput={(params) => (
                                            <TextField {...params}
                                                label="Department"
                                                variant="outlined"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    className: 'custom-input-drop',
                                                    startAdornment: (                 // Add the icon to the left
                                                        <InputAdornment position="start">
                                                            <ApartmentIcon />
                                                        </InputAdornment>
                                                    ),

                                                }}
                                                className="custom-textfield"
                                            />
                                        )}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <Button
                                className='accordian_submit_btn'
                                style={{
                                    color: "#533529",
                                    fontWeight: "600",
                                    // Remove full width styling
                                    width: 'auto',
                                    padding: '6px 16px'
                                }}
                                onClick={onClickAddUserDialogOpen}
                            >
                                Create User
                            </Button>
                        </div>
                    </form>
                    {/* <Button className='accordian_submit_btn mt-3' style={{ color: "#533529", fontWeight: "600", float: "inline-end" }} onClick={onClickAddUserDialog}>Create incident</Button> */}
                </div>
            </div>


            <Modal show={addUserDialog} onHide={onClickAddUserDialogClose}>
                <Modal.Header className='brown_bg '>
                    <Modal.Title>Add User</Modal.Title>
                    <button
                        type='button'
                        className='btn-close bg-white'
                        onClick={onClickAddUserDialogClose}
                    ></button>
                </Modal.Header>
                <Modal.Body className='modal_bg_body'>
                    <label>Are you sure you want to add the User!</label>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='outlined' className='dynamic_btn m-1'
                        onClick={handleSubmit}
                    >Yes</Button>
                    <Button className='m-1 add-Field-btn p-2' onClick={onClickAddUserDialogClose}>No</Button>
                </Modal.Footer>
            </Modal>

            <Snackbar open={open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleClose} severity={severity}>
                    {message}
                </Alert>
            </Snackbar>
        </div >
    )
}

export default AddUser