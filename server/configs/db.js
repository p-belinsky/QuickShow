import mongoose, { mongo } from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', ()=> console.log('DB Connected'));
        await mongoose.connect(`${process.env.MONGODB_URI}`);
        

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;