const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");


// Create SubSection
exports.createSubSection = async (req, res) => {
    try {
        //------------------------------TESTING---------------------------//
        // console.log("HEADERS:", req.headers["content-type"]);
        // console.log("FILES:", req.files);
        // console.log("BODY:", req.body);


        // Fetch data from req body
        const { sectionId, title, timeDuration, description } = req.body;

        // extract file/video
        const video = req.files.video;

        // validation
        if (!sectionId || !title || !timeDuration || !description) {
            return res.status(400).json({
                success: false,
                message: 'ALL fields are created',
            })
        }

        if (!req.files || !req.files.video) {
            return res.status(400).json({
                success: false,
                message: "Video file is required"
            })
        }

        // upload video to cloudinary
        const uploadDeatails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        // create a sub-section
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadDeatails.secure_url,
        })

        // update section with this sub section ObjectId
        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $push: {
                    subSection: subSectionDetails._id,
                },
            },
            { new: true }
        )
            .populate("subSection");


        // Retun response
        return res.status(200).json({
            success: true,
            message: 'Sub Section Created Successfully',
            updatedSection,
        })


    } catch (error) {

        return res.status(500).json({
            success: true,
            message: 'Internal Server error',
            error: error.message,
        })
    }
}

//HW:  UpdateSubSection
// Update title / description / timeDuration
// Update video only if new video is provided

exports.updateSubSection = async (req, res) => {
    try {
        // get Data
        const { subSectionId, title, timeDuration, description } = req.body;

        // validation
        if (!subSectionId) {
            return res.status(400).json({
                success: false,
                message: 'SubSection ID is required',
            })
        }

        // Find ID
        const subSection = await SubSection.findById(subSectionId);

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: 'SubSection not found',
            })
        }

        // Data update
        if (title) subSection.title = title;
        if (timeDuration) subSection.timeDuration = timeDuration;
        if (description) subSection.description = description;

        if (req.files && req.files.videoFile) {
            const uploadDetails = await uploadImageToCloudinary(
                req.files.videoFile,
                process.env.FOLDER_NAME
            );
            subSection.videoUrl = uploadDetails.secure_url;
        }
        // Data save
        await subSection.save();

        // return response
        return res.status(200).json({
            success: true,
            message: 'SubSection Updated Successfully',
        });


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
}


// HW: DeleteSubSection
// Remove subsection reference from Section
// Delete subsection from DB

exports.deleteSubSection = async (req, res) => {
    try {
        // Get Data
        const { subSectionId, sectionId } = req.body;

        // validation
        if (!subSectionId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: 'SubSection ID and Section ID are required',
            })
        }

        // remove ref from section
        await Section.findByIdAndUpdate(sectionId, {

            $pull: { subSection: subSectionId }, //To avoid dangling ObjectIds inside the parent document.
        });

        // Delete subsection from DB
        await SubSection.findByIdAndDelete(subSectionId);

        // return response
        return res.status(200).json({
            success: true,
            message: 'SubSection deleted successfully'
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}