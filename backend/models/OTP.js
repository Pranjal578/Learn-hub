const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 5 * 60, // Automatically deleted after 5 minutes
    }
});

// Function to send verification email
async function sendVerificationEmail(email, otp) {
    try {
        await mailSender(email, 'Verification Email from LearnHub', `Your OTP for verification is: ${otp}`);
        console.log('Email sent successfully to - ', email);
    } catch (error) {
        console.log('Warning: Could not send email to', email, ':', error.message);
    }
}

// Pre-save middleware to send verification email
OTPSchema.pre('save', async function (next) {
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});

module.exports = mongoose.model('OTP', OTPSchema);