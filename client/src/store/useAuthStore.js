import { create } from 'zustand'
import { axiosInstance } from '../lib/axios.js'
import { toast } from 'react-toastify'
import  io  from 'socket.io-client'

const BASE_URL = import.meta.env.MODE === 'development' ? "http://localhost:3000" : "/"

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isRegistered: false,
    isLoggedIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const response = await axiosInstance.get("/auth/check")
            set({ authUser: response.data })
            get().connectSocket()
        } catch (e) {
            console.log("error", e)
            set({ authUser: null })
        } finally {
            set({ isCheckingAuth: false })
        }
    },

    register: async (data) => {
        set({ isRegistered: true })

        try {
            const response = await axiosInstance.post('/auth/register', data)
            set({ authUser: response.data })
            toast.success("User registered successfully")
            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isRegistered: false })
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true })

        try {
            const res = await axiosInstance.post("/auth/login", data)
            set({ authUser: res.data })
            toast.success("Logged in successfully")
            get().connectSocket()                       //connect to socket
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isLoggingIn: false })
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout')
            toast.success("Logged out successfully")
            get().disconnectSocket()
        } catch (e) {
            toast.error(e.response.data.message)
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true })

        try {
            const res = await axiosInstance.put('/auth/update-profile', data)
            set({ authUser: res.data })
            toast.success("Profile updated successfully")
        } catch (e) {
            toast.error(e.response.data.message)
        } finally {
            set({ isUpdatingProfile: false })
        }
    },

    connectSocket: () => {
        const { authUser } = get()

        if (!authUser || get().socket?.connected)  //If user is not authenticated, don't create any connection
            return

        const socket = io(BASE_URL, {            //*socket is connected to back-end*
            query: {
                userId: authUser._id
            },
        })
        socket.connect()

        set({ socket: socket })

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds })
        })
    },

    disconnectSocket: () => {
        if (get().socket?.connected)
            get().socket.disconnect()

    }

}))