import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cookieParser from "cookie-parser"
import cors from 'cors'
import path from 'path'
import {connectToDB} from "./database/db.js"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"

import { app, server } from "./utils/socket.js"  //socket.io setup

app.use(express.json())       //req,body -> allows user to extract JSON data out of body
app.use(cookieParser())
app.use(cors ({
    origin: "http://localhost:5173",
    credentials: true
}))

const __dirname = path.resolve()

app.use('/api/auth', authRoutes)

app.use('/api/messages', messageRoutes)

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, "../client/dist")))

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../client", "dist", "index.html"))  //entry point for react application
    })
}

server.listen(process.env.PORT, () => {
    connectToDB()
    console.log("Server is running...")
})