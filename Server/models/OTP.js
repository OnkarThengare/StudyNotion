const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const otpTemplate = require("../mail/templates/otpTemplate")

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300,  // 5 minutes
    },
});

// Post Middlerware -> mailSender
// A function  -> to send otp mail
async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(
            email,
            "verification Email from StudyNotion",
            otpTemplate(otp)
        );
        if (mailResponse) {
            console.log("Email sent successfully"); //If mail fails → mailResponse is null → 💥 crash
        }

    } catch (error) {
        console.log("error occured while sending mails: ", error);
        throw error;
    }
}

// Pre Middlerware 
// Document save hone se pehele ye save hona chahiye


// --------------------If email fails → OTP will NOT be saved---------------------


otpSchema.pre("save", async function () {
    console.log("New document saved to database");

    // Only send an email when a new document is created
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);  // object ka data darshata hai        
    }

});

// const OTP = mongoose.model("OTP", otpSchema);

module.exports = mongoose.model("OTP", otpSchema);