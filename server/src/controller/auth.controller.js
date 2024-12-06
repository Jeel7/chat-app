import { User } from "../model/User.model.js"
import bcrypt from "bcryptjs"
import { createTokenAndSetCookie } from "../utils/createTokenAndSetCookie.js"
import cloudinary from '../utils/cloudinary.js'

export const registerController = async (req, res) => {
    try {

        const { fullName, email, password } = req.body

        try {

            if(!fullName || !email || !password){
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                })
            }

            if(password.length < 6){
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 6 characters long"
                })
            }

            const checkExistingUser = await User.findOne({ email })

            if (checkExistingUser) {
                return res.json(400).json({
                    success: false,
                    message: "User is already registered, Please do login!"
                })
            }

            //hash password 
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)

            const user = new User({
                fullName,
                email,
                password: hashedPassword,
            })

            createTokenAndSetCookie(res, user._id)

            await user.save()

            res.status(201).json({
                success: true,
                messsage: "User registered successfully",
                user : {
                    ...user._doc,
                    password: undefined
                }
            })

        } catch (e) {
            res.status(400).json({
                success: false,
                message: "Something went wrong!"
            })
        }

    } catch (e) {
        console.log(e)
        res.status(500).json({
            success: false,
            message: "Something went wrong!"
        })
    }
}

export const loginController = async (req, res) => {
    try {

        const {email, password} = req.body

        try{

            const user = await User.findOne({email})

            if(!user){
                return res.status(400).json({
                    success: false,
                    message: "User not found, Do register first"
                })
            }

            const isPasswordMatching = await bcrypt.compare(password, user.password)

            if(!isPasswordMatching){
                return res.status(400).json({
                    success: false,
                    message: "Invalid credentials!"
                })
            }

            createTokenAndSetCookie(res, user._id)

            await user.save()

            res.status(200).json({
                success: true,
                message: "Logged in successfully",
                user : {
                    ...user._doc,
                    password: undefined
                }
            })

        }catch(e){
            res.status(400).json({
                success: false,
                message: "Something went wrong!"
            })
        }

    } catch (e) {
        console.log(e)
        res.status(500).json({
            success: false,
            message: "Something went wrong!"
        })
    }
}

export const logoutController = async (req, res) => {
    res.clearCookie('token')
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    })
}

export const updateProfileController = async(req, res) => {
    try{
        const {profilePic} = req.body

        const userId = req.user._id

        if(!profilePic){
            return res.status(400).json({
                message: "Profile pic is required"
            })
        }

        const uploadResopnse = await cloudinary.uploader.upload(profilePic)

        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResopnse.secure_url},{new: true})

        res.status(200).json({
            updatedUser
        })

    }catch(e){
        console.log(e)
        res.status(500).json({
            success: false,
            message: "Something went wrong!"
        })
    }
}

//Give user data only if user is authenticated
export const checkAuth = (req, res) => {
    try{

        res.status(200).json(req.user)

    }catch(e){
        console.log(e)
        res.status(500).json({
            success: false,
            message: "Something went wrong!"
        })
    }
}