const User = require('../models/user');
const Profile = require('../models/profile');
const bcrypt = require('bcrypt');

const defaultUsers = [
    {
        firstName: 'Test',
        lastName: 'Admin',
        email: 'admin@test.com',
        password: 'password123',
        accountType: 'Admin',
    },
    {
        firstName: 'Test',
        lastName: 'Instructor',
        email: 'instructor@test.com',
        password: 'password123',
        accountType: 'Instructor',
    },
    {
        firstName: 'Test',
        lastName: 'Student',
        email: 'student@test.com',
        password: 'password123',
        accountType: 'Student',
    },
];

exports.seedDefaultUsers = async () => {
    try {
        for (const u of defaultUsers) {
            const existingUser = await User.findOne({ email: u.email });
            if (!existingUser) {
                const profileDetails = await Profile.create({
                    gender: null,
                    dateOfBirth: null,
                    about: null,
                    contactNumber: null,
                });

                const hashedPassword = await bcrypt.hash(u.password, 10);

                await User.create({
                    firstName: u.firstName,
                    lastName: u.lastName,
                    email: u.email,
                    password: hashedPassword,
                    accountType: u.accountType,
                    additionalDetails: profileDetails._id,
                    approved: true,
                    active: true,
                    image: `https://api.dicebear.com/5.x/initials/svg?seed=${u.firstName} ${u.lastName}`,
                });

                console.log(`[Seed] Created test user: ${u.email} (${u.accountType})`);
            }
        }
    } catch (error) {
        console.error('[Seed] Error seeding default users:', error.message);
    }
};
