import React, { useState, useEffect } from 'react'
import OTPInput from 'react-otp-input';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { sendOtp, signup } from '../services/operations/authAPI';

const VerifyEmail = () => {
    const { signupData, loading } = useSelector((state) => state.auth);
    const [otp, setOtp] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const handleOnSubmit = (e) => {
        e.preventDefault();

        const {
            accountType,
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
        } = signupData;

        dispatch(signup(accountType, firstName, lastName, email, password, confirmPassword, otp, navigate));
    }

    useEffect(() => {
        if (!signupData) {
            navigate("/signup");
        }
    }, [])

    return (
        <div className='text-white flex items-center justify-center mt-[150px]'>
            {
                loading ?
                    (
                        <div>Loading...</div>
                    ) :
                    (
                        <div>
                            <h1>Verify Email</h1>
                            <p>A Verification code has been sent to you. Enter the code below</p>

                            <form onSubmit={handleOnSubmit}>
                                <OTPInput
                                    value={otp}
                                    onChange={setOtp}
                                    numInputs={6}
                                    renderSeparator={<span>-</span>}
                                    renderInput={(props) => (<input {...props}
                                        className='bg-richblack-800'
                                    />)}

                                />

                                <button type='submit'>
                                    Verify Email
                                </button>
                            </form>

                            <div>
                                <div>
                                    <Link to="/login">
                                        Back to Login
                                    </Link>
                                </div>

                                <button
                                    onClick={() => dispatch(sendOtp(signupData.email, navigate))}
                                >
                                    Resend it
                                </button>
                            </div>

                        </div>
                    )
            }
        </div>
    )
}

export default VerifyEmail