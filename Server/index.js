const express = require("express");
const app = express();

// ROUTES
const courseRoutes = require("./routes/Course");
const paymentRoutes = require("./routes/Payments");
const profileRoutes = require("./routes/Profile");
const userRoutes = require("./routes/User");

// Imports
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 4000;

// Database connect
database.connect();

// Ṃiddlerwares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
)

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp", //tmp exists by default on Linux / macOS / Cloud servers
    })
)

// Cloudinary Connection
cloudinaryConnect();

// Routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);


// Default Route
app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: 'Your server is up and running...'
    });
});


// Activate Server  
app.listen(PORT, () => {
    console.log(`App is running at ${PORT}`)
})