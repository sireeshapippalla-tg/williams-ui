import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, IconButton, InputAdornment, Button, Checkbox, FormControlLabel } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Email from '@mui/icons-material/Email';
import williamslogo from '../../assets/images/william-logo.png';
import axios from 'axios';
import { login } from '../../api';

const Login = () => {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);
    const [userName, setUserName] = useState();
    const [password, setPassword] = useState();


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


    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validate the form
        const isUserNameValid = validateUserName();
        const isPasswordValid = validatePassword();
    
        // Check if both fields are valid
        if (!isUserNameValid || !isPasswordValid) {
            return;
        }
    
        try {
            const payload = {
                username: userName,
                password: password
            }
    
            const response = await axios.post(login, payload);
    
            // Check the response code
            const { responseCode, responseMessage } = response.data.statusResponse;
    
            if (responseCode === 200) {
                // Successful login
                if (keepLoggedIn) {
                    localStorage.setItem('keepLoggedIn', 'true');
                }
    
                // Store user details in localStorage 
                localStorage.setItem('userDetails', JSON.stringify(response.data.userLoginDetails));
    
                // Navigate to the /incident page
                navigate('/incident');
            } else if (responseCode === 400) {
                // Invalid credentials - stay on login page and show error message
                setPasswordError(responseMessage); 
            }
        } catch (error) {
            console.log('Error during login:', error);
            setPasswordError('An error occurred during login. Please try again.');
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

                    {/* <div className='float-end'>
                        <a href='/forgot/password'>Forgot password</a>
                    </div> */}

                    <Button onClick={handleSubmit} variant='contained' fullWidth className='mt-2 search_btn '>
                        Log In
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Login;
