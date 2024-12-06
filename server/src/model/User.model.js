import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
        trim: true
    },
    profilePic: {
        type: String,
        default: ""
    }

}, {timestamps: true})

export const User = mongoose.model('User', userSchema) 