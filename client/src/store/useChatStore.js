import { create } from 'zustand'
import { axiosInstance } from '../lib/axios.js'
import { toast } from 'react-toastify'
import { useAuthStore } from './useAuthStore.js'

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMsgLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true })

        try {
            const res = await axiosInstance.get('/messages/users')
            set({ users: res.data })
        } catch (e) {
            toast.error(e.response.data.message)
        } finally {
            set({ isUsersLoading: false })
        }
    },

    getMessages: async (userId) => {
        set({ isMsgLoading: true })

        try {
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({ messages: res.data })
        } catch (e) {
            toast.error(e.response.data.message)
        } finally {
            set({ isMsgLoading: false })
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get()
        try {
          const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData)
          set({ messages: [...messages, res.data] })
        } catch (error) {
          toast.error(error.response.data.message)
        }
      },
    
      subscribeToMessages: () => {
        const { selectedUser } = get()
        if (!selectedUser) return
    
        const socket = useAuthStore.getState().socket
    
        socket.on("newMessage", (newMessage) => {
          const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id
          if (!isMessageSentFromSelectedUser) return
    
          set({
            messages: [...get().messages, newMessage],
          })
        })
      },
    
      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket
        socket.off("newMessage")
      },    

    setSelectedUser: (selectedUser) =>
        set({ selectedUser })

}))