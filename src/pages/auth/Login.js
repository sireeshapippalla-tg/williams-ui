import React, { useState } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { TextField, IconButton, InputAdornment, Button, Checkbox, FormControlLabel } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Email from '@mui/icons-material/Email';
import { Snackbar, Alert } from '@mui/material';
import williamslogo from '../../assets/images/william-logo.png';
import axios from 'axios';
import { login } from '../../api';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);
    const [userName, setUserName] = useState();
    const [password, setPassword] = useState();
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    const [open, setOpen] = useState(false);


    // Validation states
    const [userNameError, setUserNameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleCheckboxChange = (event) => {
        setKeepLoggedIn(event.target.checked);
    };

    const validateUserName = () => {
        if (!userName) {
            setUserNameError('Username is required');
            return false;
        } else {
            setUserNameError('');
            return true;
        }
    };

    const validatePassword = () => {
        if (!password) {
            setPasswordError('Password is required');
            return false;
        } else {
            setPasswordError('');
            return true;
        }
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setOpen(false);
      };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate the form
        const isUserNameValid = validateUserName();
        const isPasswordValid = validatePassword();

        // Check if both fields are valid
        if (!isUserNameValid || !isPasswordValid) {
            return;
        }

        setLoading(true);

        try {
            const payload = {
                username: userName,
                password: password
            }

            const response = await axios.post(login, payload);

            // Check the response code
            const { responseCode, responseMessage } = response.data.statusResponse;
            if (responseCode === 203) {
                setMessage(`${responseMessage} For change the password click on forgot password`);
                setSeverity('error');
                setOpen(true);
            } else if (responseCode === 200) {
                // Successful login
                if (keepLoggedIn) {
                    localStorage.setItem('keepLoggedIn', 'true');
                }

                // Store user details in localStorage 
                localStorage.setItem('userDetails', JSON.stringify(response.data.userLoginDetails));
                localStorage.setItem('userTypeId', JSON.stringify(response.data.userLoginDetails.userTypeId));
                const redirectUrl = new URLSearchParams(location.search).get('redirect');
                
                // Navigate to the /incident page
                setMessage("Login successfully!");
                setSeverity('success');
                setOpen(true);
                setTimeout(() => {
                    navigate(redirectUrl || '/incident');
                }, 2000);
             
            }
            else if (responseCode === 400) {
                // Invalid credentials - stay on login page and show error message
                setPasswordError(responseMessage);
                setMessage(responseMessage);
                setSeverity('error');
                setOpen(true);
            }
        } catch (error) {
            console.log('Error during login:', error);
            setPasswordError('An error occurred during login. Please try again.');
            // setMessage(responseMessage);
            setSeverity('error');
            setOpen(true);
        }finally {
            setLoading(false); 
        }
    };


    return (
        <div className='wraper'>
            <div className='login card'>
                <div className='p-3'>
                    <img src={williamslogo} style={{ height: "45px", width: "100%" }} alt="Logo" />
                </div>
                <form>
                    <div className='mb-2 mt-4'>
                        {/* <label htmlFor='email'>Email Address</label> */}
                        <TextField
                            placeholder='User Name'
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            InputProps={{
                                className: 'custom-input',
                                startAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="email"
                                            edge="start"
                                        >
                                            <Email />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            className="custom-textfield"
                            id="outlined-basic"
                            variant="outlined"
                            type='email'
                            style={{ width: "100%" }}
                            error={Boolean(userNameError)}
                            helperText={userNameError}
                        />
                    </div>
                    <div className='mb-2'>
                        {/* <label htmlFor='password'>Password</label> */}
                        <TextField
                            placeholder='Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                className: 'custom-input',
                                startAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            edge="start"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            className="custom-textfield"
                            id="outlined-basic"
                            variant="outlined"
                            type={showPassword ? "text" : "password"}
                            style={{ width: "100%" }}
                            error={Boolean(passwordError)}
                            helperText={passwordError}
                        />
                    </div>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={keepLoggedIn}
                                onChange={handleCheckboxChange}
                                color="primary"
                            />
                        }
                        label="Keep me logged in"
                    />

                    <div className='float-end'>
                        <a href='/forgotPassword'>Forgot password</a>
                    </div>

                    <Button onClick={handleSubmit} variant='contained' fullWidth className='mt-2 search_btn '>
                    {loading ? 'Processing...' : 'Log In'}
                    </Button>
                </form>
            </div>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleClose} severity={severity}>
                    {message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Login;
