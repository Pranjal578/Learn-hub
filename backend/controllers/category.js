const Category = require('../models/category')

// get Random Integer
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

// ================ create Category ================
exports.createCategory = async (req, res) => {
    try {
        // extract data
        const { name, description } = req.body;

        // validation
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const categoryDetails = await Category.create({
            name: name, description: description
        });

        res.status(200).json({
            success: true,
            message: 'Category created successfully'
        });
    }
    catch (error) {
        console.error('Error while creating Category:', error);
        res.status(500).json({
            success: false,
            message: 'Error while creating Category'
        })
    }
}


// ================ get All Category ================
exports.showAllCategories = async (req, res) => {
    try {
        // get all category from DB
        let allCategories = await Category.find({}, { name: true, description: true });

        // Auto-seed default categories if empty
        if (!allCategories || allCategories.length === 0) {
            const defaultCategories = [
                { name: "Web Development", description: "Learn HTML, CSS, JavaScript, React, Node.js and full-stack web development." },
                { name: "Mobile Development", description: "Build iOS and Android applications using React Native, Flutter, and Swift." },
                { name: "DevOps & Cloud", description: "Master Docker, Kubernetes, AWS, CI/CD pipelines, and cloud computing." },
                { name: "Data Science & AI", description: "Explore Python, Data Analysis, Machine Learning, and Artificial Intelligence." },
                { name: "Cybersecurity", description: "Ethical hacking, network security, web application security, and cryptography." },
                { name: "Software Engineering", description: "Data structures, algorithms, system design, and object-oriented programming." }
            ];
            await Category.insertMany(defaultCategories);
            allCategories = await Category.find({}, { name: true, description: true });
        }

        // return response
        res.status(200).json({
            success: true,
            data: allCategories,
            message: 'All categories fetched successfully'
        })
    }
    catch (error) {
        console.log('Error while fetching all categories');
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error while fetching all categories'
        })
    }
}



// ================ Get Category Page Details ================
exports.getCategoryPageDetails = async (req, res) => {
    try {
        const { categoryId } = req.body

        // Get courses for the specified category
        const selectedCategory = await Category.findById(categoryId)
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: "ratingAndReviews",
            })
            .exec()

        if (!selectedCategory) {
            return res.status(404).json({ success: false, message: "Category not found" })
        }

        // Get courses for other categories
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
        })

        let differentCategory = null;
        if (categoriesExceptSelected.length > 0) {
            differentCategory = await Category.findById(
                categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]._id
            )
                .populate({
                    path: "courses",
                    match: { status: "Published" },
                })
                .exec();
        }

        // Get top-selling courses across all categories
        const allCategories = await Category.find()
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: {
                    path: "instructor",
                },
            })
            .exec()

        const allCourses = allCategories.flatMap((category) => category.courses || [])
        const mostSellingCourses = allCourses
            .sort((a, b) => (b.sold || 0) - (a.sold || 0))
            .slice(0, 10)

        res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategory,
                mostSellingCourses,
            },
        })
    } catch (error) {
        console.error('Error while getting category page details:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}