import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

// 創建帶有默認配置的 axios 實例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 添加請求攔截器，自動添加 token
apiClient.interceptors.request.use(config => {
  const token = getCookie('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 工具函數
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

export const meetingRoomService = {
  async logout() {
    const response = await apiClient.post('/logout')
    return response.data
  },
  // 獲取會議室預約列表
  async getMeetingRoomList(startTime, endTime) {
    const response = await apiClient.get('/getMeetingRoomList', {
      params: { startTime, endTime }
    })
    return response.data
  },

  // 獲取會議室列表
  async getMeetingRooms() {
    const response = await apiClient.get('/getMeetingRoomId')
    return response.data
  },

  // 獲取用戶列表
  async getAllUsers() {
    const response = await apiClient.get('/allUser')
    return response.data
  },

  // 預約會議室
  async bookMeetingRoom(bookingData) {
    const response = await apiClient.post('/leaseMeetingRoom', bookingData)
    return response.data
  },

  // 更新會議室預約
  async updateMeetingRoom(updateData) {
    const response = await apiClient.put('/updateMeetingRoom', updateData)
    return response.data
  },

  // 刪除會議室預約
  async deleteMeetingRoom(meetingRoomId) {
    const response = await apiClient.delete('/deleteMeetingRoom', {
      data: { meetingRoomId }
    })
    return response.data
  },

  //google登入
  async handleGoogleLogin(googleJwt) {
    const response = await apiClient.post('/login/google', googleJwt)
    return response.data
  },

  // 登入
  async generallyLogin(userData) {
    const response = await apiClient.post('/login', userData)
    return response.data
  },

  // 註冊新用戶
  async createUser(userData) {
    const response = await apiClient.post('/createUser', userData)
    return response
  }
} 