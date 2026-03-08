const Category = require("../models/Category");

// create Tag ka handler function
exports.createCategory = async (req, res) => {
    try {
        // get data
        const { name, description } = req.body;

        // validation
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        // create entry in db
        const categoryDetails = await Category.create({
            name: name,
            description: description,
        });
        console.log(categoryDetails);

        // return response
        return res.status(200).json({
            success: true,
            message: 'Category created successfully',
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


// get All tags handler function
exports.showAllCategories = async (req, res) => {
    try {
        const allCategory = await Category.find(
            {},
            { name: true, description: true });

        res.status(200).json({
            success: true,
            message: 'All Category return successfully',
            data: allCategory,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


// CategoryPageDetails

exports.categoryPageDetails = async (req, res) => {
    try {
        // get categoryId
        const { categoryId } = req.body;

        // get courses for special categoryId
        const selectedCategory = await Category.findById(categoryId)
            .populate('courses')
            .exec();

        // validation
        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Data not found',
            })
        }

        // get course for difficult categories
        const differentCategories = await Category.find({
            _id: { $ne: categoryId },
        })
            .populate("courses")
            .exec();


        // get Top 10 selling courses ----- HW
        const allCategories = await Category.find().populate("courses");
        const allCourses = allCategories.flatMap(
            (category) => category.courses || []
        );
        const topSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10);

        ///retur response
        return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategories,
                topSellingCourses,
                // topSellingCategories
            },
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server error',
            error: error.message,
        })
    }
}