const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

// Send OTP
exports.sendOtp = async (req, res) => {
    try {
        // fetch email from request ki body
        const { email } = req.body;

        // check if user already exist
        const checkUserPresent = await User.findOne({ email });

        // if user already exist then return a response
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: `User already registered`,
            })
        }

        // Generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        // check unique or not
        const result = await OTP.findOne({ otp: otp });

        // console.log("Result is Generate OTP Func");
        // console.log("OTP", otp);
        // console.log("Result", result);

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            // result = await OTP.findOne({ otp });
        }

        const otpPayload = { email, otp };

        const otpBody = await OTP.create(otpPayload);

        await OTP.create(otpPayload);

        res.status(200).json({
            success: true,
            message: `OTP Sent Successful`,
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }

}

// signup
exports.signUp = async (req, res) => {
    try {
        // Data Fetch from request ki body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;

        // validate Karlo
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: 'All Fields are required',
            })
        }

        // Check if password match karo or not
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirmPassword Value does not match, Try Again",
            })
        }

        // check User already exist or not
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User is already registered. Please sign in to continue.',
            })
        }

        // find most recent OTP stored for the user
        const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);

        // Validate OTP 
        if (recentOtp.length === 0) {
            // Otp not found for the email
            return res.status(400).json({
                success: false,
                message: 'OTP not found, or expired',
            })
        } else if (otp !== recentOtp[0].otp) {
            // Invalid Otp
            return res.status(400).json({
                success: false,
                message: 'Invalid otp',
            })
        }

        // Hash Password 
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the User
        let approved = "";
        approved === "Instructor" ? (approved = false) : (approved = true);

        // Entry create in DB
        const profileDeatils = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })


        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType: accountType,
            additionalDetails: profileDeatils._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}`,
        })

        // Return Response
        return res.status(200).json({
            success: true,
            message: 'User is registered Successfully',
            user,
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'User cannot be registered. Please try again.'
        });
    }


}


// login controller for authenticating users
exports.login = async (req, res) => {
    try {
        // get data from req body
        const { email, password } = req.body;

        // validate data
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All Fill fields are required, please try again'
            });
        }

        // user check exist or not // // Find user with provided email
        const user = await User.findOne({ email }).populate("additionalDetails");

        // If user not found with provided email
        if (!user) {
            // Return 401 Unauthorized status code with error message
            return res.status(401).json({
                success: false,
                message: `User is not Registered with Us Please SignUp to Continue`,
            })
        }

        // Generate JWT, after password matching  // Generate JWT token and Compare Password
        // const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (await bcrypt.compare(password, user.password)) {

            // const payload = {
            //     email: user.email,
            //     id: user._id,
            //     accountType: user.accountType,
            // }

            const token = jwt.sign(
                { email: user.email, id: user._id, accountType: user.accountType },
                process.env.JWT_SECRET, {
                expiresIn: "2h",
            }
            );

            // Save token to user document in database
            user.token = token;
            user.password = undefined;


            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: `User Login Success`,
            });

        } else {
            return res.status(401).json({
                success: false,
                message: `Password is incorrect`,
            });
        }

    } catch (error) {
        console.log(error);
        // Return 500 Internal Server Error status code with error message
        return res.status(500).json({
            success: false,
            message: `Login Failure Please Try Again`,
        })
    }
}


// ChangePassword   :HW
exports.changePassword = async (req, res) => {
    try {
        // get data from req body
        const userDetails = await User.findById(req.user.id);

        // Get old Password, new Password, and Confirm new Password from req.body
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        // validation old Password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password,
        );
        if (!isPasswordMatch) {
            // If old password does not match, return a 401 (Unauthorized) error
            return res.status(401).json({
                success: false,
                message: 'The Password is Incorrect',
            });
        }

        // Match New password and Confirm new Password
        if (newPassword !== confirmNewPassword) {
            // if new Password & confirm new Password do not match, return a 400
            return res.status(400).json({
                success: false,
                message: 'The password & confirm password does not match',
            });
        };

        // update Password in DB
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true },
        );

        // Send Notification email
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                // "Password Updated",
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
            console.log("Email sent successfully: ", emailResponse.response);
        } catch (error) {
            // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
            console.error("error occured while sending email", error);
            return res.status(500).json({
                success: false,
                message: 'Error occured while sending email',
                error: error.message,
            })
        }

        // return response
        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        })

    } catch (error) {
        // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
        console.error("Error occured while updating password: ", error);
        return res.status(500).json({
            success: false,
            message: "Error while changing password",
            error: error.message,
        });
    }
};