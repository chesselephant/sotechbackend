import mongoose from 'mongoose';


export const connectDB = async () => {
    try {
        console.log(`db****${process.env.MONGO_URI}`)
        const conn = await mongoose.connect(process.env.MONGO_URI);

        
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};


