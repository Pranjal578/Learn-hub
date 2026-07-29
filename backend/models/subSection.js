const mongoose = require('mongoose');

const subSectionSchema = new mongoose.Schema({
    title: {
        type: String
    },
    timeDuration: {
        type: String
    },
    description: {
        type: String
    },
    videoUrl: {
        type: String
    },
    isQuiz: {
        type: Boolean,
        default: false
    },
    quizUrl: {
        type: String,
        default: ""
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }
});

module.exports = mongoose.model('SubSection', subSectionSchema)