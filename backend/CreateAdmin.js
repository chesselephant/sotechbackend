
import bcrypt from 'bcrypt';
import User from './model/user.js'; // Adjust the path based on your project structure

const SALT_ROUNDS = 10;

export const createAdmin = async () => {
    try {
        // Check if an admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin account already exists.');
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', SALT_ROUNDS);

        // Create the admin user
        const admin = new User({
            name: 'Admin User',
            email: 'admin@sotechafrica.com',
            phoneNum: '1234567890',
            password: hashedPassword,
            role: 'admin',
            status: 'active',
        });

        await admin.save();
        console.log('Admin account created successfully.');
    } catch (error) {
        console.error('Error creating admin account:', error);
    }
};



