import mongoose from "mongoose";
export const connectDB = async ()=>{
    try {
       const conn= await mongoose.connect(process.env.MONGODB_URI);
        console.log(`conneecteed to mongodb ${conn.connection.host}`)
    } catch (error) {
        console.log("failed to connect to db",error);
        process.exit(1);
        
    }
}