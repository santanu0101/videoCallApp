import mongoose  from "mongoose";

const userSchema = mongoose.Schema({
    fullname:{
        type: String,
        require: true
    },
    username:{
        type: String,
        require: true,
        unique: true
    },
    email:{
        type:String,
        require: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        minlength:6
    },
    gender:{
        type: String,
        require: true,
        enum:["male", "female"]
    },
    profilePic: {
        type: String,
        default:""
    }
},{timnestamps:true});

export const User = mongoose.model("User", userSchema);