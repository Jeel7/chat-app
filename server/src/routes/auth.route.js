import express from 'express'
import {registerController, loginController, logoutController, updateProfileController, checkAuth} from '../controller/auth.controller.js'
import { protectRoute } from '../middleware/protectRoute.js'

const router = express.Router()

router.post('/register', registerController)

router.post('/login', loginController)

router.post('/logout', logoutController)

router.put('/update-profile', protectRoute, updateProfileController)  //protected route: for logged in user only

router.get('/check', protectRoute, checkAuth)

export default router