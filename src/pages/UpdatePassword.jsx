import React from 'react'
import { useState } from 'react';
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { resetPassword } from '../services/operations/authAPI';


const UpdatePassword = () => {

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    })

    const location = useLocation();
    const dispatch = useDispatch();    

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { loading } = useSelector((state) => state.auth);

    const { password, confirmPassword } = formData;

    const handleOnChange = (e) => {
        // const token = location.pathname.split('/').at(-1);
        setFormData((prevData) => (
            {
                ...prevData,
                [e.target.name]: e.target.value,
            }
        ))
    }

    const handleOnSubmit = (e) => {
        e.preventDefault();
        const token = location.pathname.split('/').at(-1);
        dispatch(resetPassword(password, confirmPassword, token));
    }

    return (
        <div className='text-white'>
            {
                loading ?
                    (
                        <div>  </div>
                    ) :
                    (
                        <div>
                            <h1>Choose new Password</h1>
                            <p>Almost done. Enter your new Password and your all set.</p>

                            <form onSubmit={handleOnSubmit}>
                                <label>
                                    <p>New Password</p>
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        name='password'
                                        value={password}
                                        onChange={handleOnChange}
                                        placeholder='Password'
                                        className='text-black'
                                    />
                                    <span
                                        onClick={() => setShowPassword((prev) => !prev)}
                                    >
                                        {
                                            showPassword ? <AiFillEyeInvisible fontSize={24} /> : <AiFillEye fontSize={24} />
                                        }
                                    </span>
                                </label>

                                <label>
                                    <p>Confirm New Password</p>
                                    <input
                                        required
                                        type={showConfirmPassword ? "text" : "password"}
                                        name='confirmPassword'
                                        value={confirmPassword}
                                        onChange={handleOnChange}
                                        placeholder='Confirm Password'
                                        className='text-black'
                                    />
                                    <span
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    >
                                        {
                                            showConfirmPassword ? <AiFillEyeInvisible fontSize={24} /> : <AiFillEye fontSize={24} />
                                        }
                                    </span>
                                </label>

                                <button type='submit'>
                                    Reset Password
                                </button>
                            </form>

                            <div>
                                <Link to="/login">
                                    <p>Back to Login</p>
                                </Link>
                            </div>
                        </div>
                    )
            }
        </div>

    )
}

export default UpdatePassword