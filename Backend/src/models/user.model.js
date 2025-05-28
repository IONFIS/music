import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
   phoneNumber:{
        type:Number,
        required:true
    },
    imageUrl:{
        type:String,
        required:true
    },
    clerkId:{
        type:String,
        required:true,
        unique:true
    },
},{timestamps:true});
export const User = mongoose.model("user",userSchema);