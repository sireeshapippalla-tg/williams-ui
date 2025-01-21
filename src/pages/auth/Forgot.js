import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, IconButton, InputAdornment, Button, Snackbar, Alert } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Email from '@mui/icons-material/Email';
import williamslogo from '../../assets/images/william-logo.png';
import axios from 'axios';

import { forgotPassword } from '../../api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    const [open, setOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [userName, setUserName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [userNameError, setUserNameError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [generalError, setGeneralError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

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
        if (newPassword.length < 8 || !/\d/.test(newPassword)) {
            setNewPasswordError('Password must be at least 8 characters and include a number.');
            return false;
        } else {
            setNewPasswordError('');
            return true;
        }
    };

    const validateConfirmPassword = () => {
        if (confirmPassword !== newPassword) {
            setConfirmPasswordError('Passwords do not match.');
            return false;
        } else {
            setConfirmPasswordError('');
            return true;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isUserNameValid = validateUserName();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();

        if (!isUserNameValid || !isPasswordValid || !isConfirmPasswordValid) return;
        setLoading(true);

        try {
            const payload = { username: userName, password: newPassword };
            const response = await axios.post(forgotPassword, payload);
            console.log(response);
            if (response.data.responseCode === 200) {
                // setSuccessMessage('Password changed successfully!');
                setGeneralError('');
                setMessage("Password changed successfully!");
                setSeverity('success');
                setOpen(true);
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                setMessage("Failed to change password. Please check your username.");
                setSeverity('error');
                setOpen(true);
                // setGeneralError('Failed to change password. Please check your username.');
            }
        } catch (error) {
            // setGeneralError('An error occurred. Please try again later.');
            setMessage("An error occurred. Please try again later.");
            setSeverity('error');
            setOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='wraper'>
            <div className='login card'>
                <div className='p-3'>
                    <img src={williamslogo} style={{ height: "45px", width: "100%" }} alt="RM Williams Logo" />
                </div>
                <form onSubmit={handleSubmit}>
                    <div className='mb-2 mt-4'>
                        <TextField
                            placeholder='Username (Email)'
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton edge="start">
                                            <Email />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            variant="outlined"
                            fullWidth
                            error={Boolean(userNameError)}
                            helperText={userNameError}
                        />
                    </div>
                    <div className='mb-2'>
                        <TextField
                            placeholder='New Password'
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            type={showPassword ? "text" : "password"}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleClickShowPassword} edge="start">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            variant="outlined"
                            fullWidth
                            error={Boolean(newPasswordError)}
                            helperText={newPasswordError || "Password must be at least 8 characters with a number."}
                        />
                    </div>
                    <div className='mb-2'>
                        <TextField
                            placeholder='Confirm New Password'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            type={showConfirmPassword ? "text" : "password"}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleClickShowConfirmPassword} edge="start">
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            variant="outlined"
                            fullWidth
                            error={Boolean(confirmPasswordError)}
                            helperText={confirmPasswordError}
                        />
                    </div>

                    {generalError && <p className='error-text'>{generalError}</p>}
                    {successMessage && <p className='success-text'>{successMessage}</p>}

                    <Button type='submit' variant='contained' fullWidth className='mt-2 search_btn'>
                        {loading ? 'Processing...' : 'Change Password'}
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

export default ForgotPassword;
