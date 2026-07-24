const Classroom = require("../models/Classroom");
const User = require("../models/user");

exports.resetClassrooms = async () => {
    try {
        await Classroom.deleteMany({});
        await User.updateMany({}, { $set: { classrooms: [] } });
        console.log("[DB Reset] All classrooms cleared. Database reset to 0 classrooms.");
    } catch (error) {
        console.error("[DB Reset] Error clearing classrooms:", error.message);
    }
};
