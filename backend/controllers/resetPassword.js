const User = require('../models/user');
const mailSender = require('../utils/mailSender');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// ================ resetPasswordToken ================
exports.resetPasswordToken = async (req, res) => {
    try {
        // extract email 
        const { email } = req.body;

        // email validation
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Your Email is not registered with us'
            });
        }

        // generate token
        const token = crypto.randomBytes(20).toString("hex");

        // update user by adding token & token expire date
        const updatedUser = await User.findOneAndUpdate(
            { email: email },
            { token: token, resetPasswordTokenExpires: Date.now() + 5 * 60 * 1000 },
            { new: true }); // by marking true, it will return updated user


        // create url using the configured frontend URL (never hardcode a domain)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const url = `${frontendUrl}/update-password/${token}`;

        // send email containing url
        await mailSender(email, 'Password Reset Link', `Password Reset Link : ${url}`);

        // return succes response
        res.status(200).json({
            success: true,
            message: 'Email sent successfully , Please check your mail box and change password'
        })
    }

    catch (error) {
        console.error('Error while creating reset password token:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send password reset email. Please try again.'
        })
    }
}



// ================ resetPassword ================
exports.resetPassword = async (req, res) => {
    try {
        // extract data
        // extract token by anyone from this 3 ways
        const token = req.body?.token || req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

        const { password, confirmPassword } = req.body;

        // validation
        if (!token || !password || !confirmPassword) {
            return res.status(401).json({
                success: false,
                message: "All fiels are required...!"
            });
        }

        // validate both passwords
        if (password !== confirmPassword) {
            return res.status(401).json({
                success: false,
                message: 'Passowrds are not matched'
            });
        }


        // find user by token from DB
        const userDetails = await User.findOne({ token: token });

        // check ==> is this needed or not ==> for security  
        if (token !== userDetails.token) {
            return res.status(401).json({
                success: false,
                message: 'Password Reset token is not matched'
            });
        }

        // console.log('userDetails.resetPasswordExpires = ', userDetails.resetPasswordExpires);

        // check token is expire or not
        if (!(userDetails.resetPasswordTokenExpires > Date.now())) {
            return res.status(401).json({
                success: false,
                message: 'Token is expired, please regenerate token'
            });
        }


        // hash new passoword
        const hashedPassword = await bcrypt.hash(password, 10);

        // update user with New Password
        await User.findOneAndUpdate(
            { token },
            { password: hashedPassword },
            { new: true });

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });
    }

    catch (error) {
        console.error('Error while resetting password:', error);
        res.status(500).json({
            success: false,
            message: 'Password reset failed. Please request a new reset link.'
        });
    }
}