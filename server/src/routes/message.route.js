import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js'
import {getUsersForSideBar, getMessages, sendMessages} from '../controller/message.controller.js'

const router = express.Router()

router.get('/users', protectRoute, getUsersForSideBar) //To get list of all users in sidebar

router.get('/:id', protectRoute, getMessages)          //To get particular user's chat history page

router.post('/send/:id', protectRoute, sendMessages)   //To send messages to a paricular user

export default router