import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import AddIcon from '@mui/icons-material/Add';
// import { Link } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import DepartmentModal from './Department';
import Button from '@mui/material/Button';
import { Autocomplete, TextField, Menu, MenuItem, InputAdornment } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { CircularProgress } from '@mui/material';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Row, Col } from 'react-bootstrap';
import BuildIcon from '@mui/icons-material/Build';
import { Snackbar, Alert } from '@mui/material';
import TitleIcon from '@mui/icons-material/Title';
import ManIcon from '@mui/icons-material/Man';
import GroupIcon from '@mui/icons-material/Group';
import Person2Icon from '@mui/icons-material/Person2';
import EmailIcon from '@mui/icons-material/Email';
import CallIcon from '@mui/icons-material/Call';
import ApartmentIcon from '@mui/icons-material/Apartment';
import Modal from 'react-bootstrap/Modal';
import { getAllUsers, getAllDepartments, getMastersListByType, createUser, getUserTypes, deleteUser, getUsersById } from '../../api';
import PersonAddIcon from '@mui/icons-material/PersonAdd';



const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: '#0000000a',
    },
    '&:nth-of-type(even)': {
        backgroundColor: theme.palette.background.default,
    },
    // Add any other styles you want for the rows here
}));


const StyledStatusTableCell = styled(TableCell)(({ theme, status }) => ({
    color: status === 'closed' ? 'green' : 'red',
}));

const StyledStatusText = styled('span')(({ theme, status }) => ({
    backgroundColor: status === 'closed' ? '#d7f9e8' : '#f9d7d7',
    padding: '4px 8px',
    borderRadius: '8px',
}));

function createData(userId, name, email, department, role, action) {
    return { userId, name, email, department, role, action };
}

const columns = [
    { id: 'name', label: 'Name', minWidth: 100 },
    { id: 'email', label: 'Email', minWidth: 100 },
    { id: 'department', label: 'Department', minWidth: 100 },
    { id: 'role', label: 'Role', minWidth: 100 },
    { id: 'action', label: 'Action', minWidth: 100 }
];


const User = () => {
    const navigate = useNavigate();
    const userIdRef = useRef(null);
    const organizations = ['org-1', 'org-2', 'org-3', 'org-4'];
    const roles = ['role-1', 'role-2', 'role-3', 'role-4']
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [isLoading, setIsLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    // const [addUserdialogOpen, setAddUserDialogOpen] = useState(false);
    const [deleteUserdialogOpen, setDeleteUserDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([])
    const [rows, setRows] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const open = Boolean(anchorEl);
    const [addUserdialogOpen, setAddUserdialogOpen] = useState(false);
    const [loading, setLoading] = useState(false)




    const [inputs, setInputs] = useState({
        Title: { value: null, options: [] },
        Gender: { value: null, options: [] },

    });

    const [departments, setDepartments] = useState([])
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [addUserDialog, setAddUserDialog] = useState(false);
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [contactNumber, setContactNumber] = useState('')
    const [userTypes, setUserTypes] = useState([]);
    const [selectedUserType, setSelectedUSerType] = useState(null)
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [userIds, setUserIds] = useState()
    const [selectDeleteUserId, setSelectDeleteUserId] = useState(null)
    const [errors, setErrors] = useState({});

    // const selectedUserID = userIdRef.current;

    const resetFields = () => {
        setFirstName('')
        setLastName('')
        setEmail('')
        setContactNumber('')
        setSelectedUSerType(null);
        setSelectedDepartment(null);
        // setInputs({
        //     Title: { value: null, options: [] },
        //     Gender: { value: null, options: [] },
        // });
        setInputs((prevState) => ({
            ...prevState,
            Title: { ...prevState.Title, value: null },
            Gender: { ...prevState.Gender, value: null },
        }));

        setErrors({});

    }



    useEffect(() => {
        fetchDepartments();
        // fetchDropdowns();
        fetchUserTypesDropdown();
        fetchAllUsers();
    }, []);

    useEffect(() => {
        if (!inputs.Gender.options.length || !inputs.Title.options.length) {
            fetchDropdowns();
        }
    }, [inputs]);

    useEffect(() => {
        console.log('Current userIdRef:', userIdRef.current);
    }, [userIdRef.current]);



    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    const toggleDrawer = (open) => (event) => {
        if (
            event &&
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }

        setAddUserdialogOpen(open);
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
        setErrors((prevErrors) => ({
            ...prevErrors,
            selectedDepartment: undefined
        }));
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

    const fetchAllUsers = async () => {
        try {
            const requestBody = {
                orgId: 1,
                flag: 'A',
                departmentId: 0
            }
            const response = await axios.post(getAllUsers, requestBody)
            console.log(response)
            const usersData = response.data.users
            console.log(usersData)
            const formattedData = usersData.map(user =>
                createData(
                    user.userId,
                    user.fullName,
                    user.userName,
                    user.departmentName,
                    user.userType,
                )
            )
            setRows(formattedData);
            setUserIds(usersData.userId)
            console.log(userIds)
            console.log(rows)

        } catch (error) {
            console.error('Error fetching users Details:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleChange = (name) => (event, newValue) => {
        setInputs(prevState => ({
            ...prevState,
            [name]: {
                ...prevState[name],
                value: newValue
            }
        }));

        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: newValue ? null : prevErrors[name]
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
            setUserTypes(userTypeData)
            console.log(userTypes)
        } catch (error) {
            console.log('Failed to fetch Usertypes :', error)
        }
    }

    const handleuserTypeChange = (event, newValue) => {
        setSelectedUSerType(newValue);
        setErrors((prevErrors) => ({
            ...prevErrors,
            selectedUserType: undefined,
        }));
    };




    const handleEdit = async (dialogMode, userId) => {
        console.log('Edit user with id:', userId);
        console.log('Dialog mode:', dialogMode);
        if (!userId) {
            console.error('User ID is undefined.');
            return;
        }
        try {
            const response = await axios.post(getUsersById, {
                userId: userId
            });
            console.log(response)
            if (response.data.statusResponse.responseCode === 200) {
                const user = response.data.users;
                console.log('user:', user);
                const singleUserId = user.userID
                console.log(singleUserId)
                userIdRef.current = singleUserId;


                const [genderData, titleData] = await Promise.all([
                    fetchDropdownsData("Gender"),
                    fetchDropdownsData("Title")
                ]);

                // Find selected value for Title and Gender from the options based on the user data
                const selectedTitle = titleData.find(option => option.id === user.titleId) || null;
                const selectedGender = genderData.find(option => option.title === user.genderName) || null;

                // Populate the fields with the selected user's data

                setFirstName(user.firstName || '');
                setLastName(user.lastName || '');
                setEmail(user.userName || '');
                setSelectedUSerType(user.userTypeId ? userTypes.find(type => type.id === user.userTypeId) : null);
                setInputs({
                    Title: { value: selectedTitle, options: titleData },
                    Gender: { value: selectedGender, options: genderData },
                });
                setSelectedDepartment(user.departmentId ? departments.find(dept => dept.id === user.departmentId) : null)
                setContactNumber(user.contactNumber)

                setAddUserdialogOpen(true); // Open the drawer

            } else {
                console.error('Failed to fetch user data');
            }
        } catch (error) {
            console.log('Error fetching user data:', error)
        }
        setAddUserdialogOpen(true); // Open the drawer
        handleMenuClose(); // Close the menu
    };


    const validateFields = () => {
        const newErrors = {};

        // Validate individual fields
        if (!firstName) newErrors.firstName = "First Name is required.";
        if (!lastName) newErrors.lastName = "Last Name is required.";

        if (!email) newErrors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid.";

        if (!contactNumber) newErrors.contactNumber = "Contact Number is required.";
        // else if (!/^\d{10}$/.test(contactNumber)) newErrors.contactNumber = "Contact Number must be 10 digits.";

        // Validate Autocomplete fields (Title, Gender, UserType, Department)
        console.log("selectedUserType", selectedDepartment)
        if (!selectedUserType) newErrors.selectedUserType = "User Type is required.";
        if (!selectedDepartment) newErrors.selectedDepartment = "Department is required.";

        // if (!inputs.Title.value) newErrors.Title = "Title is required.";
        // if (!inputs.Gender.value) newErrors.Gender = "Gender is required.";
        Object.keys(inputs).forEach((field) => {
            if (!inputs[field].value) {
                newErrors[field] = `${field} is required.`;
            }
        });

        // Set errors in state and return validation status
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("submit")
        const selectedUserID = userIdRef.current;
        console.log('Submit user with id:', selectedUserID);

        console.log(selectedUserID)
        if (!validateFields()) return;

        setLoading(true)

        try {

            const isEditMode = dialogMode === 'edit';
            const payload = {
                orgId: 1,
                createdBy: 1,
                firstName: firstName,
                lastName: lastName,
                title: inputs.Title.value ? inputs.Title.value.id : null,
                gender: inputs.Gender.value ? inputs.Gender.value.id : null,
                departmentId: selectedDepartment ? selectedDepartment.id : null,
                username: email,
                userTypeId: selectedUserType ? selectedUserType.id : null,
                contactNumber: contactNumber,
                flag: isEditMode ? 'U' : 'I',
                userId: isEditMode ? selectedUserID : null

            }

            console.log("userpayload", payload)
            const response = await axios.post(createUser, payload)
            console.log(response)
            if (response.data.statusResponse) {
                const { responseCode, responseMessage } = response.data.statusResponse;

                if (responseCode === 200) {
                    setAddUserdialogOpen(false)
                    setMessage(responseMessage);
                    setSeverity('success');
                    setOpenSnackbar(true);
                    resetFields();

                    // Optionally navigate or perform other actions
                    // setTimeout(() => navigate('/users'), 2000);

                    fetchAllUsers()
                } else if (responseCode === 409) {
                    onClickAddUserDialogClose()
                    setMessage(responseMessage || 'Email already exists');
                    setSeverity('error');
                    resetFields()
                    setOpenSnackbar(true);

                } else {
                    onClickAddUserDialogClose()
                    resetFields();
                    setMessage("Failed to add User.");
                    setSeverity('error');
                    setOpenSnackbar(true);

                }
            } else {
                onClickAddUserDialogClose()
                resetFields();
                setMessage("Unexpected response structure.");
                setSeverity('error');
                setOpenSnackbar(true);

            }
        } catch (error) {
            console.error('Error:', error);
            resetFields();
            setMessage("Failed to add User. Error: " + error.message);
            setSeverity('error');
            setOpenSnackbar(true);
            setAddUserdialogOpen(false)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setAddUserdialogOpen(false)
        resetFields()
    }
    const handleDeleteDialog = (userId) => {
        console.log('Delete user with id:', userId);
        setSelectDeleteUserId(userId)
        setDeleteUserDialogOpen(true)
    };

    const handleUserDelete = async () => {

        console.log(selectDeleteUserId)
        if (!selectDeleteUserId) {
            console.error('No user selected for deletion');
            setMessage('No user selected.');
            setSeverity('error');
            return;
        }
        try {
            const response = await axios.post(deleteUser, { userId: selectDeleteUserId })
            console.log(response)
            if (response?.data?.responseCode === 200) {
                setDeleteUserDialogOpen(false)
                setMessage(response?.data?.responseMessage || 'User deleted successfully');
                setSeverity('success');

                fetchAllUsers()
                setOpenSnackbar(true);
            } else {
                setDeleteUserDialogOpen(false)
                setMessage('Error in deleting user: ' + (response?.data?.responseMessage || 'Unknown error'));
                setSeverity('error');
                setOpenSnackbar(true);
            }

        } catch (error) {
            console.error('Error:', error);
            setDeleteUserDialogOpen(false)
            setMessage("Failed to delete User. Error: " + error.message);
            setSeverity('error');
            setOpenSnackbar(true);
        }
    }
    const handleMenuClick = (event, userId) => {
        setAnchorEl(event.currentTarget);
        setSelectedUserId(userId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUserId(null);
    };


    const handleCloseDeleteUserDialog = () => {
        setDeleteUserDialogOpen(false)
    }




    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };


    return (
        <div className='border-0'>
            <div className='row' style={{ marginBottom: "15px" }}>
                <div className='col-md-6 route-head incident_mbl'>
                    <h3 className='mb-0'>Admin Panel</h3>
                    <Breadcrumbs aria-label="breadcrumb" className="breadcrumbs">
                        <Link underline="hover" color="inherit" href="/incident/dashboard">
                        Dashboard
                        </Link>

                        <Link underline="hover" color="inherit" href='#'>
                        Admin Panel
                        </Link>
                    </Breadcrumbs>

                </div>
        
                <div className=' col-lg-6 col-md-12 col-sm-12 btn_incident_create incident_mbl user-responsive-btn' style={{ float: "right" }}>
                    <Button className='me-2'
                        startIcon={<PersonAddIcon />}
                        onClick={() => {
                            setDialogMode('add');
                            setAddUserdialogOpen(true)
                        }}
                    >
                        Add User
                    </Button>
                    <DepartmentModal onUpdateDepartments={fetchDepartments} />

                </div>


            </div>

            <div className="row">

                <div className="mt-2 table-responsive-container">
                    <Paper className='tbl' sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer className='tablescroll-mobile'>
                            <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow>
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column.id}
                                                align={column.align}
                                                style={{ minWidth: column.minWidth }}
                                            >
                                                {column.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                {isLoading ?
                                    <TableBody>
                                        <TableRow>
                                            <TableCell colSpan={columns.length} style={{ textAlign: 'center', height: '300px' }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        height: '100%',
                                                    }}
                                                >
                                                    <CircularProgress />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                    :
                                    <TableBody>
                                        {rows
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((row) => (
                                                <TableRow hover role="checkbox" tabIndex={-1} key={row.userId}>
                                                    {columns.map((column) => {
                                                        const value = row[column.id];
                                                        return (
                                                            <TableCell key={column.id} align={column.align} >
                                                                {column.id === 'action' ? (
                                                                    <div className='user-table-button-responsive'>
                                                                        <Button
                                                                            variant="contained"
                                                                            color="primary"
                                                                            onClick={() => {
                                                                                setDialogMode('edit');
                                                                                handleEdit('edit', row.userId);
                                                                            }}
                                                                            style={{ marginRight: '8px' }}
                                                                        >
                                                                            Edit
                                                                        </Button>
                                                                        <Button
                                                                            className='userCancel_btn'
                                                                            variant="contained"
                                                                            color="error"
                                                                            onClick={() => handleDeleteDialog(row.userId)}
                                                                        >
                                                                            Delete
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    column.format && typeof value === 'number'
                                                                        ? column.format(value)
                                                                        : value
                                                                )}
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            ))}
                                    </TableBody>

                                }


                            </Table>
                        </TableContainer>
                        <div>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 20, 40, 100]}
                                component="div"
                                count={rows.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </div>
                    </Paper>
                </div>
            </div>

            {/* add user drawer */}

            <SwipeableDrawer
                anchor="right"
                open={addUserdialogOpen}
                onClose={toggleDrawer(false)}
                onOpen={toggleDrawer(true)}
            >
                <Box sx={{ width: 450, padding: 2 }} className="drawer-width-mbl">
                    <form>
                        <Row>
                            <Col md={12} sm={12} className="mb-3">
                                <div className='resolve-drop'>
                                    <Autocomplete
                                        style={{ padding: "0px" }}
                                        options={userTypes}
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
                                                error={!!errors.selectedUserType}
                                                helperText={errors.selectedUserType}
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
                            {Object.entries(inputs).map(([name, { value, options }], index) => {
                                // Select icons based on field name
                                const icon = name === 'Title' ? <TitleIcon /> : name === 'Gender' ? <ManIcon /> : null;

                                return (
                                    <Col key={index} md={12} sm={12} className="mb-3">
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
                                                        error={!!errors[name]}
                                                        helperText={errors[name]}
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            className: 'custom-input-drop',
                                                            startAdornment: (
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

                            <Col md={12} sm={12} className="mb-3">
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
                                    onChange={(e) => {
                                        setFirstName(e.target.value);
                                        if (e.target.value) {
                                            setErrors((prevErrors) => ({ ...prevErrors, firstName: "" }));
                                        }
                                    }}
                                    // onChange={(e) => setFirstName(e.target.value)}
                                    error={!!errors.firstName}
                                    helperText={errors.firstName}
                                />
                            </Col>
                            <Col md={12} sm={12} className="mb-3">
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
                                    // onChange={(e) => setLastName(e.target.value)}
                                    onChange={(e) => {
                                        setLastName(e.target.value);
                                        if (e.target.value) {
                                            setErrors((prevErrors) => ({ ...prevErrors, lastName: "" }));
                                        }
                                    }}
                                    error={!!errors.lastName}
                                    helperText={errors.lastName}
                                />
                            </Col>
                            <Col md={12} sm={12} className="mb-3">
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
                                    // onChange={(e) => setEmail(e.target.value)}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (e.target.value) {
                                            setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
                                        }
                                    }}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                />
                            </Col>
                            <Col md={12} sm={12} className="mb-3">
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
                                    type='number'
                                    label="Contact Number"
                                    variant="outlined"
                                    style={{ width: "100%" }}
                                    value={contactNumber}
                                    // onChange={(e) => setContactNumber(e.target.value)}
                                    onChange={(e) => {
                                        setContactNumber(e.target.value);
                                        if (e.target.value) {
                                            setErrors((prevErrors) => ({ ...prevErrors, contactNumber: "" }));
                                        }
                                    }}
                                    error={!!errors.contactNumber}
                                    helperText={errors.contactNumber}
                                />
                            </Col>
                            <Col md={12} sm={12} className="mb-3">
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
                                                error={!!errors.selectedDepartment}
                                                helperText={errors.selectedDepartment}
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
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: "2px" }}>
                            <Button
                                className='accordian_submit_btn'
                                style={{
                                    color: "#533529",
                                    fontWeight: "600",
                                    // Remove full width styling
                                    width: 'auto',
                                    padding: '6px 16px'
                                }}
                                onClick={handleSubmit}
                            >
                                {loading ? "Processing..." : dialogMode === 'add' ? 'Create User' : 'Update User'}
                                {/* {dialogMode === 'add' ? 'Create User' : 'Update User'} */}
                            </Button>
                            <Button
                                className='accordian_cancel_btn '
                                style={{
                                    color: "#533529",
                                    fontWeight: "600",
                                    // Remove full width styling
                                    width: 'auto',
                                    padding: '6px 16px'
                                }}
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Box>
            </SwipeableDrawer>

            {/* user delete dialog */}


            <Modal show={deleteUserdialogOpen} onHide={handleCloseDeleteUserDialog}>
                <Modal.Header className='brown_bg '>
                    <Modal.Title> Delete User</Modal.Title>
                    <button
                        type='button'
                        className='btn-close bg-white'
                        onClick={handleCloseDeleteUserDialog}
                    ></button>
                </Modal.Header>
                <Modal.Body className='modal_bg_body'>
                    <label>Are you sure want to delete this {"user"}!</label>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='outlined' className='dynamic_btn m-1'
                        onClick={handleUserDelete}
                    >Yes</Button>
                    <Button className='m-1 add-Field-btn p-2' onClick={handleCloseDeleteUserDialog}>No</Button>
                </Modal.Footer>
            </Modal>

            <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleCloseSnackbar} severity={severity}>
                    {message}
                </Alert>
            </Snackbar>
        </div >
    )
}

export default User