import { Message } from '../model/Message.model.js'
import { User } from '../model/User.model.js'
import cloudinary from '../utils/cloudinary.js'
import { getReceiverSocketId, io } from '../utils/socket.js'

//=> To get list of all users in sidebar

export const getUsersForSideBar = async (req, res) => {
    try {

        const loggedInUserId = req.user._id  //first take user id of logged in user 

        const filteredUseres = await User.find({ _id: { $ne: loggedInUserId } }).select("-password") //logged in user sivay bija badha user side ma avva joie. -password means password sivay badha user data ave

        res.status(200).json(filteredUseres)

    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!"
        })
    }
}

//=> To get particular user chat history page

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params      //rename 'id' to 'userToChatId'(user id), jeni chat history jovi hoi teni id

        const sendMeId = req.user._id            //sender id (suppose, I am sender)

        const messages = await Message.find({    //Gives all the messages b/w user to sender OR sender to user 
            $or: [
                { senderId: sendMeId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: sendMeId }
            ],
        })

        res.status(200).json(messages)

    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!"
        })
    }
}

//=> To send messages to a paricular user 

export const sendMessages = async (req, res) => {
    try {
        const { img, text } = req.body        //Msg can be text or in image form

        const { id: receiverId } = req.params //send msg to which user 

        const senderId = req.user._id     //Me -> je bija user ne msg mokalva mange che

        //User input ma image ape to tene clodinary ma upload karo
        let imageUrl;
        if (img) {
            const uploadResponse = await cloudinary.uploader.upload(img)  //upload base64 image to cloudinary
            imageUrl = uploadResponse.secure_url
        }

        const newMessage = new Message({       //new message 
            senderId,
            receiverId,
            text,
            img: imageUrl
        })

        await newMessage.save()

        //socket.io : realtime chat

        const receiverSocketId = getReceiverSocketId(receiverId)

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)   //only send msg to deired user
        }

        res.status(201).json(newMessage)

    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!"
        })
    }
}