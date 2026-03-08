const User = require("../models/User");
const nodemailer = require("nodemailer");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");


// resetPasswordToken -- mail send it
exports.resetPasswordToken = async (req, res) => {
    try {
        // get email from req body.
        const email = req.body.email;

        // check user for thu email,email validation
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.json({
                success: false,
                message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
            });
        }

        // generate token
        // const token = crypto.randomUUID();
        const token = crypto.randomBytes(20).toString("hex");

        // update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                // resetPasswordExpires: Date.now() + 5 * 60 * 1000,
                resetPasswordExpires: Date.now() + 3600000,
            },
            {
                new: true,
            }
        )
        console.log("Details", updatedDetails);

        // create url
        const url = `http://localhost:3000/update-password/${token}`;

        // send mail containing the user
        await mailSender(email,
            "Password Reset Link",
            `Your Link for email verification is ${url}. Please click this url to reset your password.`
        );

        // return response
        return res.json({
            success: true,
            message: 'Email sent successfully, please check email and change pwd'
        })



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Something went wromg, Please check mail again',
        })
    }
}


// resetPassword
exports.resetPassword = async (req, res) => {
    try {
        // data fetch
        const { password, confirmPassword, token } = req.body;

        // validation
        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: 'Password is not Matching',
            });
        }

        // get userDetails from db using token
        const userDetails = await User.findOne({ token: token });

        // if no entry - invalid token
        if (!userDetails) {
            return res.json({
                success: false,
                message: 'Token is Invalid',
            })
        }

        // token time check
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message: 'Token is expired, please regenerate your password',
            });
        }

        // Hash Password
        // const hashedPassword = await bcrypt.hash(password, 10);
        const hashedPassword = await bcrypt.hash(password, 10);

        // password update
        await User.findOneAndUpdate(
            { token: token },
            {
                password: hashedPassword,
                token: undefined,
                resetPasswordExpires: undefined,
            },
            { new: true },
        );

        // return response
        return res.json({
            success: true,
            message: 'Password reset successful',
        })

    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: 'Something went wrong while send reset email',
        })
    }
}

