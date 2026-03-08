const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");


// createCourse handler function
exports.createCourse = async (req, res) => {
    try {
        // Get User Id from request object
        const userId = req.user.id;

        //   Fetch Data
        let { courseName, courseDescription, whatYouWillLearn, price, category, tag, status, instructions } = req.body;

        // get thumbnail 
        const thumbnail = req.files.thumbnailImage;

        // Validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            })
        }

        if (!status || status === undefined) {
            status = "Draft";
        }

        // check if the user is an  Instructor 
        const instructorDetails = await User.findOne({
            _id: userId,
            accountType: "Instructor",
        });

        console.log("Intructor Details: ", instructorDetails);
        // TODO: Verify that usedId and instructorDeatails._id are same or different ?   

        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: 'Instructor Deatils not found',
            })
        }
        // check if tge tag given is valid
        const categoryDetails = await Category.findById(category);

        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: 'Category Details not found',
            });
        }

        // Upload Image top Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        console.log(thumbnailImage);

        // Create an Entry for New Course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            status: status,
            instructions: instructions,
        });

        // Add the new course to the user schema of Instructo
        await User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            { new: true },
        );

        //  Update the TAG ka Schema --- HW
        await Category.findByIdAndUpdate(
            { _id: category },
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            { new: true }
        );



        // Return Response
        return res.status(200).json({
            success: true,
            message: "Course Create Successfully",
            data: newCourse,
        });


    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'failed to create course',
            error: error.message,
        })
    }
};


// GetALlCourses Handler Function
exports.getAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find(
            {},
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true,
            }
        )
            .populate("instructor")
            .exec();

        return res.status(200).json({
            success: true,
            message: 'Data for all courses fetched successfully',
            data: allCourses,
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Cannot fetch course data',
            error: error.message,
        });
    }

}


// getCourseDetails
exports.getCourseDetails = async (req, res) => {
    try {
        // Get ID
        const { courseId } = req.body;

        // Find Course Details
        const courseDetails = await Course.find(
            { _id: courseId }
        )
            .populate(
                {
                    path: "instructor",
                    populate: {
                        path: "additionalDetails",
                    }
                }
            )
            .populate("category")
            .populate("ratingAndReviews") //populate() uses schema field names, not model names
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                }
            })
            .exec();

        // Validation
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find the course with ${courseId}`,
            });
        }

        // Return Response
        return res.status(200).json({
            success: true,
            message: "Course Details fetched successfully",
            data: courseDetails,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}