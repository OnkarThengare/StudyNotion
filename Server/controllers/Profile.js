// Update Profile - Bcouse we already create profile
const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");


// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        //Get Data 
        const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;

        // Get UserId
        const id = req.user.id;

        // Find the Profile by id
        const userDetails = await User.findById(id);
        const profile = await Profile.findById(userDetails.additionalDetails);

        // Update Profile
        profile.dateOfBirth = dateOfBirth;
        profile.about = about;
        profile.contactNumber = contactNumber;

        // Save the Updated profile
        await profile.save();

        // // Validation
        // if (!contactNumber || !gender | !id) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'All fields are required',
        //     });
        // }

        // //  Find Profile
        // const profileId = userDetails.additionalDetails;
        // const profileDetails = await Profile.findById(profileId);


        // profileDetails.gender = gender;        

        // Return Response
        return res.status(200).json({
            success: true,
            message: 'Profile Updated Successfully',
            profile,
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        })
    }
}

// delete Account

exports.deleteAccount = async (req, res) => {
    try {
        // get Id
        const id = req.user.id;

        // validation
        const user = await User.findById({ _id: id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // delete profile
        await Profile.findByIdAndDelete({ _id: user.additionalDetails });

        // TODO: HW -> Unenroll user form all enrolled courses
        // const enrolledCourses = userDetails.studentsEnrolled;



        // delete user
        await User.findByIdAndDelete({ _id: id });


        // await Course.findByIdAndUpdate(
        //     studentsEnrolled,
        //     {
        //         $pull: {
        //             studentsEnrolled: id
        //         },
        //     },
        //     { new: true },

        // )


        // return response
        return res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        })



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User cannot be deleted successfully',
        })
    }
}

// GetALL User Deatils

exports.getAllUserDetails = async (req, res) => {
    try {

        // get id
        const id = req.user.id;

        // validation & get User Details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        // return response
        return res.status(200).json({
            success: true,
            message: 'User Data Fetched Succfully',
            data: userDetails,
        });


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// UpdateDisplayPicture
exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture;
        const userId = req.user.id;
        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        )
        console.log(image)
        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        )
        res.send({
            success: true,
            message: `Image Updated successfully`,
            data: updatedProfile,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};


// GetEnrolledCourses
exports.getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id
        const userDetails = await User.findOne({
            _id: userId,
        })
            .populate("courses")
            .exec()
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userDetails}`,
            })
        }
        return res.status(200).json({
            success: true,
            data: userDetails.courses,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};