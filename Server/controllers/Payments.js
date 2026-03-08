const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");


// ORDER Creation
// Cpauture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {

    // Get CourseID & UserID
    const { course_id } = req.body;
    const { userId } = req.user.id;

    // Validation
    // Valiid CourseId
    if (!course_id) {
        return res.json({
            success: false,
            message: 'Please provide valid course ID',
        });
    }

    // Valid courseDetails
    let course;
    try {
        course = await Course.findByOne(course_id);
        if (!course) {
            return res.json({
                success: false,
                message: 'Could not find the course',
            });
        }

        // User  already pay for the same course
        const uid = new mongoose.Types.ObjectId(userId); // userId stringid convert into ObjectId
        if (course.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success: true,
                message: 'Student is already enrolled',
            })
        }

    } catch (error) {
        console.error(500);
        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

    // ORDER create
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            courseId: course_id,
            userId,
        }
    };

    // Call the Order Crate Function
    try {
        // Initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        // return Response
        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.thumbnail,
            currency: paymentResponse.id,
            amount: paymentResponse.amount,

        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Could not initiate order",
        })
    }
}

// PAYMENT Authorization
// Verify Signature of Razorpay and server
exports.verifySignature = async (req, res) => {
    const webhookSecret = "123456789";

    const signature = req.headers["x-razorpay-signature"];

    // Hashing
    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    // If Match Means Payment AUTHORISED
    if (signature == digest) {
        console.log("Payment id Authorised");

        // Get Data from Notes
        const { courseId, userId } = req.body.payload.payment.entity.notes;


        // ACTION **********
        try {
            // Fullfill the action

            // Find the course and Enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                { _id: courseId },
                {
                    $push: { studentsEnrolled: userId }
                },
                { new: true },
            );

            // Va;lidation
            if (!enrolledCourse) {
                return res.status(500).json({
                    success: false,
                    message: 'Course not Found',
                });
            }
            console.log(enrolledCourse);

            // Find the Student and  ADD the Course to their list Enrolled Courses me
            const enrolledStudent = await User.findOneAndUpdate(
                { _id: userId },
                { $push: { courses: courseId } },
                { new: true },
            );
            console.log(enrolledStudent);

            // MAIL SEND  kardo CONFIRMATION WALA
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulations from CodeHelp",
                "Congratulations, you are onboarded into new CodeHelp Course",
            );

            console.log(emailResponse);
            return res.status(200).json({
                success: ture,
                message: "Signature Verified and Course Added",
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }


    }else{
        return res.status(400).json({
            success: false,
            message: "Invalid request",
        });
    }
}

