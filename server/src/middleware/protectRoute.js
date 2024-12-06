import jwt from 'jsonwebtoken'
import {User} from '../model/User.model.js'

export const protectRoute = async (req, res, next) => {
    try{
        const token = req.cookies.token

        if(!token){
            return res.status(401).json({
                success: false,
                message: "Unauthorized- no token provided"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)

        if(!decoded){
            return res.status(401).json({
                success: false,
                message: "Unauthorized- no token provided"
            })
        }

        const user = await User.findById(decoded.userId).select("-password")

        if(!user){
            return res.status(401).json({
                success: false,
                message: "User not found"
            })
        }

        req.user = user

        next()   //next updateProfileController will be called

    }catch(e){
        return res.status(500).json({
            success: false,
            message: "Something went wrong!"
        })
    }
}

