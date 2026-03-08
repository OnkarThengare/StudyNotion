const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { mongo, default: mongoose } = require("mongoose");

// CREATE Rating
exports.createRating = async (req, res) => {

    //    GET User Id
    const userId = req.user.body;

    // Fetch Data from req body
    const { rating, review, courseId } = req.body;

    //check if user is enrolled or not
    const courseDetails = await Course.findOne(
        {
            _id: courseId,
            studentEnrolled: { $elemMatch: { $eq: userId } },
        }
    )

    if (!courseDetails) {
        return res.status(404).json({
            success: false,
            message: 'Student is not enrolled in the course',
        });
    }

    // check if user already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
        user: userId,
        course: courseId,
    });

    if (alreadyReviewed) {
        return res.status(403).json({
            success: false,
            message: 'Course is already reviewed by the user'
        })
    }

    ///  Update course with thus Rating /review
    const ratingReview = await RatingAndReview.create({
        rating, review,
        course: courseId,
        user: userId,
    })

    // Updaye course with this Rating/Review
    const updatedCourseDetails = await Course.findByIdAndUpdate({ _id: courseId },
        {
            $push: {
                RatingAndReview: ratingReview._id,
            }
        },
        { new: true },

    )
    console.log(updatedCourseDetails);

    // Return Response
    return res.status(200).json({
        success: true,
        message: "Rating and Review created successfully",
        ratingReview,
    })
}


// getAverageRating
exports.getAverageRating = async (req, res) => {    
    try {
        // Get COurse id
        const courseId = req.body.courseId;

        // Calculate AVg Rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: $rating },
                }
            }
        ])


        // Return Rating
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            })
        }

        // if no Rating/Review exist
        return res.status(200).json({
            success: true,
            message: 'Average Rating is 0, no ratings given till now',
            averageRating: 0,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


// getAllRatingAndReviews
exports.getAllRatingAndReviews = async (req, res) => {
    try {
        const allReviews = await RatingAndReview.find({})
            .sort({ rating: "desc" })
            .populate({
                path: "user",
                select: "firstName lastName email image",
            })
            .populate({
                path: "course",
                select: "courseName",
            })
            .exec();


        // Return Response
        return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}
