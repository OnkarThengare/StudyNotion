// Import the Required modules
const express = require("express");
const router = express.Router();

const { capturePayment, verifySignature } = require("../controllers/Payments");
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth");


router.post("/caturePayment", auth, isStudent, capturePayment);
router.post("/verifySignature", verifySignature);

module.exports = router;