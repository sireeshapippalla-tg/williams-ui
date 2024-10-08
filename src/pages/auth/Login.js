import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, IconButton, InputAdornment, Button } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import Email from '@mui/icons-material/Email';



const Login = () => {
    const navigate = useNavigate();

    const [showPassword, setShowPasword] = useState(false)

    const handleClickShowPasword = () => {
        setShowPasword(!showPassword)
    }

    const handleSubmit = () => {
        navigate('/dashboard')
    }
    return (
        <div className='wraper'>
            <div className='login card'>
                <h5 className='mb-3'>Login</h5>
                <form>
                    <div className='mb-2'>
                        <label htmlFor='email'>Email Address</label>
                        <TextField
                            InputProps={{
                                className: 'custom-input',
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="email"
                                            // onClick={handleClickShowPasword}
                                            edge="end"
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
                        />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor='password'>Password</label>
                        <TextField
                            InputProps={{
                                className: 'custom-input',
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPasword}
                                            edge="end"
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
                        />
                    </div>

                    <div className='float-end'>
                        <a href='/forgot/password'>Forgot password</a>
                    </div>
                    <Button onClick={handleSubmit} variant='contained' fullWidth className='mt-2 search_btn '>
                        Sign in
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default Login