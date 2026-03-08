const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
    try {
        // Data fetch
        const { sectionName, courseId } = req.body;

        // data validation
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: 'Missing Properties',
            });
        }

        // create Section
        const newSection = await Section.create({ sectionName });

        // Update Course with section objecId
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id,
                },

            },
            { new: true },
        )
            .populate(
                {
                    path: "courseContent",
                    populate: {
                        path: "subSection",
                    }
                }
            )
            .exec();

        // HW: use populate to replace sections/sub-sections

        // return response
        return res.status(200).json({
            success: true,
            message: 'Section created successfully',
            updatedCourse,
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to create section, plase try again',
            error: error.message,
        })
    }
}


// UPDATED a Section
exports.updateSection = async (req, res) => {
    try {
        // Data Input
        const { sectionName, sectionId } = req.body;

        // Update Data
        const section = await Section.findByIdAndUpdate(
            sectionId,
            { sectionName },
            { new: true }
        );

        // // Data Validation
        // if (!sectionName || !sectionId) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Missing Properties',
        //     });
        // }


        // Retunr Response
        return res.status(200).json({
            success: true,
            message: Section,
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to Update section, plase try again',
            error: error.message,
        })
    }
}


// DELETE a Section
exports.deleteSection = async (req, res) => {
    try {

        // Get Id- assuming that we are sending ID in params
        // const { sectionId, courseId } = req.params;
        const { sectionId } = req.body;

        // Use FindByIdDelete
        await Section.findByIdAndDelete(sectionId);

        // Validation
        // if (!sectionId || !courseId) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Missing Properties',
        //     });
        // }

        // // remove section reference from course
        // await Course.findByIdAndUpdate(courseId, {
        //     $pull: {
        //         courseContent: sectionId,
        //     },
        // });



        // TODO[Testing] : do we need to delete the entry from the course schema

        // Return Response
        return res.status(200).json({
            success: true,
            message: 'Section Deleted Successfully',
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to delete section, please try again',
            error: error.message,
        })
    }
}