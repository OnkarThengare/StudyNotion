// Import the requied Modules
const express = require("express");
const router = express.Router();



// Import the Controllers

// Course Controllers Import
const { createCourse, getAllCourses, getCourseDetails } = require("../controllers/Course");

// Categories Controller Import
const { showAllCategories, createCategory, categoryPageDetails } = require("../controllers/Category");

// Section Controllers Import
const { createSection, updateSection, deleteSection } = require("../controllers/Section");

//  Sub-Section Controllers Import
const { createSubSection, updateSubSection, deleteSubSection } = require("../controllers/SubSection");

// Ṛating Controllers Import
const { createRating, getAverageRating, getAllRatingAndReviews } = require("../controllers/RatingAndReview");


//---------Importing Middlewares-------//
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth");


// ----------- TESTING----------//
// console.log({
//     createCourse,
//     getAllCourses,
//     getCourseDetails,
// });

// console.log({
//     auth,
//     isInstructor,
//     createCourse,
//     createSection,
//     updateSection,
//     deleteSection,
//     createSubSection,
//     updateSubSection,
//     deleteSubSection,
// });



// **************************************************************************************
//                          Course Routes
// **************************************************************************************

// Coursea can only be Created by Instructor
router.post("/createCourse", auth, isInstructor, createCourse);

// Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection);

// Update a Section
router.post("/updateSection", auth, isInstructor, updateSection);

// Delete a Section
router.post("/deleteSection", auth, isInstructor, deleteSection);

// Edit Sub-Section
router.post("/updateSubSection", auth, isInstructor, updateSubSection);

// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);

// Add a Sub-Section to a Section
router.post("/addSubSection", auth, isInstructor, createSubSection);

// Get ALL Registered Courses
router.get("/getAllCourses", getAllCourses);

// Get Details for a Specific Courses
router.get("/getCourseDetails", getCourseDetails);


// **************************************************************************************
//                          Category Routes (Only by Admin)
// **************************************************************************************


// -----------TESTING----------//
// console.log({
//     auth,
//     isAdmin,
//     createCategory,
//     showAllCategories,
//     categoryPageDetails,
// });


// Category can Only Crated by Admin
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryPageDetails", categoryPageDetails);


// **************************************************************************************
//                          Rating And Reviews
// **************************************************************************************

router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getAllRatingAndReviews", getAllRatingAndReviews);


module.exports = router;