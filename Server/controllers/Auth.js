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

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is Required",
            })
        }

        // check if user already exist
        const checkUserPresent = await User.findOne({ email });

        // if user already exist then return a response
        if (checkUserPresent) {
            return res.status(400).json({
                success: false,
                message: 'User already registered',
            })
        }

        // Generate OTP     --- BAD Code Practice
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log("OTP generated: ", otp);

        // check unique or not
        let result = await OTP.findOne({ otp: otp });

        console.log("Result is Generate OTP fucnt");
        console.log("OTP", otp); //Never log OTP in production.
        console.log("Result", result);

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });

            // fhirse DB  me check kar raha hai
            result = await OTP.findOne({ otp: otp });
        }

        // otp ki entry DB mi karni hai
        const otpPayload = { email, otp };

        // create an entry in DB  for otp
        // const otpBody = await OTP.create(otpPayload);
        await OTP.create(otpPayload);
        // console.log(otpBody);

        // return respons successful
        res.status(200).json({
            success: true,
            message: 'OTP Sent Successful',
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

        // 2 password match karo
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
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(recentOtp);

        // Validate OTP 
        if (recentOtp.length === 0) {
            // Otp not found
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
            accountType,
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
            return res.status(403).json({
                success: false,
                message: 'All fields are required, please try again'
            });
        }

        // user check exist or not
        const user = await User.findOne({ email }).populate("additionalDetails");

        if (!user) {
            return res.status(403).json({
                success: false,
                message: "User is not registered, please signup first",
            })
        }

        // Generate JWT, after password matching
        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (isPasswordMatch) {

            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });

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
                message: 'Logged in successfully',
            });

        } else {
            return res.status(401).json({
                success: false,
                message: 'Password is incorrect',
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Login failure, please try again',
        })
    }
}


// ChangePassword   :HW
exports.changePassword = async (req, res) => {
    try {
        // get data from req body
        const userDetails = await User.findById(req.user.id);

        // Get old Password, new Password, and Confirm new Password from req.body
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // validation old Password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password,
        );
        if (!isPasswordMatch) {
            // if old password does not match, return a 401 error
            return res.status(401).json({
                success: false,
                message: 'The Password is Incorrect',
            });
        }

        // Match New password and Confirm new Password
        if (newPassword !== confirmPassword) {
            // if new Password & confirm new Password do not match, return a 400
            return res.status(400).json({
                success: false,
                message: 'The password & confirm password does not match',
            });
        };

        // update pwd in DB
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
                "Password Updated",
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
            console.log("Email sent successfully: ", emailResponse.response);
        } catch (error) {
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
        console.error("Error occured while updating password: ", error);
        return res.status(500).json({
            success: false,
            message: "Error while changing password",
        });
    }
};