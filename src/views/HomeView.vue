<template>
  <div class="home-container">
    <header class="header">
      <h1>會議室預約系統</h1>
      <div class="user-controls">
        <span class="user-name">{{ userData.userName }}</span>
        <button class="logout-btn" @click="handleLogout">登出</button>
      </div>
    </header>

    <div class="main-content">
      <div class="sidebar" :class="{ 'collapsed': uiState.isSidebarCollapsed }">
        <div class="sidebar-toggle" @click="toggleSidebar">
          <i class="toggle-icon">{{ uiState.isSidebarCollapsed ? '→' : '←' }}</i>
        </div>
        <div class="room-list">
          <div class="room-header">
            <h2>{{ uiState.isSidebarCollapsed ? '會議室' : '會議室列表' }}</h2>
            <button class="add-room-btn" @click="openAddModal">
              {{ uiState.isSidebarCollapsed ? '+' : '預約會議室' }}
            </button>
          </div>
          <div class="room-items">
            <div 
              v-for="room in roomData.meetingRooms" 
              :key="room.ID"
              :class="['room-item', roomData.selectedRoom?.ID === room.ID ? 'active' : '']"
              @click="selectRoom(room)"
            >
              <div class="room-icon">
                <svg class="meeting-room-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 6v15H3v-2h2V3h9v3h-2zm3-4h7v18h-7v-3h2v1h3V5h-3v1h-2V2zm-3 
                  8h-2v2h2v-2zm-2 4h2v2h-2v-2zm8-8h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm-6-8h2v2h-2V6zm0 
                  4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
                </svg>
              </div>
              <div class="room-info" v-if="!uiState.isSidebarCollapsed">
                <span class="room-name">{{ room.RoomName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content" :class="{ 'sidebar-collapsed': uiState.isSidebarCollapsed }">
        <calendar-component
          :bookings="roomData.bookings"
          @update:bookings="roomData.bookings = $event"
          @update-booking="handleUpdateRoomClick"
          @delete-booking="openDeleteModal"
          @slot-click="handleSlotClick"
          @date-change="handleDateChange"
        />
      </div>
    </div>

    <div v-if="uiState.showAddRoomModal" class="modal">
      <div class="modal-content">
        <h3>預約會議室</h3>
        <form @submit.prevent="handleAddRoom">
          <div class="form-group">
            <label>開始時間</label>
            <input type="datetime-local" v-model="forms.add.startDateTime" required>
          </div>
          <div class="form-group">
            <label>結束時間</label>
            <input type="datetime-local" v-model="forms.add.endDateTime" required>
          </div>
          <div class="form-group">
            <label>會議室</label>
            <select v-model="forms.add.roomId" required>
              <option value="">請選擇會議室</option>
              <option v-for="room in roomData.meetingRooms" 
                      :key="room.ID" 
                      :value="room.ID">
                {{ room.RoomName }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>參與者</label>
            <div class="user-checkbox-list">
              <div v-for="user in userData.allUsers" :key="user.ID" class="user-checkbox-item">
                <input 
                  type="checkbox" 
                  :id="'add-user-' + user.ID" 
                  :value="user.ID" 
                  v-model="forms.add.userIds"
                >
                <label :for="'add-user-' + user.ID">
                  {{ user.UserName }} (Email: {{ user.Email }})
                </label>
              </div>
            </div>
          </div>
          <div class="modal-buttons">
            <button type="submit" :disabled="uiState.isSubmitting">
              <span v-if="uiState.isSubmitting">處理中...</span>
              <span v-else>確認</span>
            </button>
            <button type="button" @click="uiState.showAddRoomModal = false">取消</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="uiState.showUpdateModal" class="modal">
      <div class="modal-content">
        <h3>更新會議室預約</h3>
        <form @submit.prevent="handleUpdateRoom">
          <div class="form-group">
            <label>開始時間</label>
            <input type="datetime-local" v-model="forms.update.startTime" required>
          </div>
          <div class="form-group">
            <label>結束時間</label>
            <input type="datetime-local" v-model="forms.update.endTime" required>
          </div>
          <div class="form-group">
            <label>會議室</label>
            <select v-model="forms.update.id" required>
              <option value="">請選擇會議室</option>
              <option 
                v-for="room in roomData.meetingRooms" 
                :key="room.ID" 
                :value="room.ID"
                :selected="room.ID == forms.update.meetingRoomId"
              >
                {{ room.RoomName }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>參與者</label>
            <div class="user-checkbox-list">
              <div v-for="user in userData.allUsers" :key="user.ID" class="user-checkbox-item">
                <input 
                  type="checkbox" 
                  :id="'update-add-user-' + user.ID" 
                  :value="user.ID"
                  v-model="forms.update.createUserIds"
                  :checked="forms.update.createUserIds.includes(user.ID)"
                >
                <label :for="'update-add-user-' + user.ID">
                  {{ user.UserName }} (Email: {{ user.Email }})
                </label>
              </div>
            </div>
          </div>
          <div class="modal-buttons">
            <button type="submit">確認</button>
            <button type="button" @click="uiState.showUpdateModal = false">取消</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="uiState.showDeleteModal" class="modal">
      <div class="modal-content delete-confirm">
        <h3>刪除確認</h3>
        <p class="confirm-message">確定要刪除此預約嗎？</p>
        <div class="modal-buttons">
          <button @click="handleDeleteRoom" class="delete-btn">確認刪除</button>
          <button type="button" @click="uiState.showDeleteModal = false;">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { isPlainObject } from '@vue/shared';
import CalendarComponent from '../components/CalendarComponent.vue'
import { meetingRoomService } from '@/services/meetingRoomService'

export default {
  name: 'HomeView',
  components: {
    CalendarComponent
  },
  
  data() {
    return {
      // UI 狀態
      uiState: {
        isSidebarCollapsed: false,
        showAddRoomModal: false,
        showUpdateModal: false,
        showDeleteModal: false,
        isSubmitting: false
      },
      
      // 數據
      userData: {
        userName: '',
        allUsers: []
      },
      
      roomData: {
        selectedRoom: null,
        meetingRooms: [],
        bookings: []
      },
      
      // 表單數據
      forms: {
        add: {
          startTime: '',
          startDateTime: '',
          endTime: '',
          endDateTime: '',
          roomId: '',
          userIds: []
        },
        update: {
          id: '',
          startTime: '',
          endTime: '',
          meetingRoomId: '',
          createUserIds: [],
          deleteUserIds: []
        },
        delete: {
          bookingId: ''
        }
      }
    }
  },

  methods: {
    // 數據加載
    async loadInitialData() {
      try {
        const [bookings, rooms] = await Promise.all([
          this.fetchMeetingRoomList(),
          this.fetchMeetingRooms()
        ])
        
        this.roomData.bookings = bookings
        this.roomData.meetingRooms = rooms
      } catch (error) {
        this.handleError(error, '初始化數據加載失敗')
      }
    },

    async fetchMeetingRoomList() {
      try {
        const { sunday, saturday } = this.getWeekRange(new Date())
        return await meetingRoomService.getMeetingRoomList(
          sunday.toISOString().slice(0, 19),
          saturday.toISOString().slice(0, 19)
        )
      } catch (error) {
        this.handleError(error, '獲取預約記錄失敗')
        return []
      }
    },

    async fetchMeetingRooms() {
      try {
        return await meetingRoomService.getMeetingRooms()
      } catch (error) {
        this.handleError(error, '獲取會議室列表失敗')
        return []
      }
    },

    async handleAddRoom() {
      if (this.uiState.isSubmitting) return

      try {
        this.uiState.isSubmitting = true

        await meetingRoomService.bookMeetingRoom({
          lesseeRoomId: parseInt(this.forms.add.roomId),
          startTime: this.forms.add.startDateTime,
          endTime: this.forms.add.endDateTime,
          participants: this.forms.add.userIds
        })

        await this.loadInitialData()
        this.closeAddModal()
        this.roomData.selectedRoom = '';
      } catch (error) {
        this.handleError(error, '預約失敗')
      } finally {
        this.uiState.isSubmitting = false
      }
    },

    async handleUpdateRoom() {
      try {

        const payload = {
          meetingRoomId: this.forms.update.meetingRoomId,
          ...(this.forms.update.startTime && { startTime: this.forms.update.startTime }),
          ...(this.forms.update.endTime && { endTime: this.forms.update.endTime })
        }
        
        // 從 UserList 中獲取需要排除的 UserId
        const excludeUserIds = this.roomData.bookings.find(booking => booking.ID === this.forms.update.meetingRoomId)?.UserList || [];

        console.log("excludeUserIds : " + JSON.stringify(excludeUserIds))
        // 過濾掉已存在的參與者
        const filteredUserIds = this.forms.update.createUserIds.filter(id => !excludeUserIds.some(user => user.UserId === id))

        if (filteredUserIds.length) {
          payload.createUserId = [];
          payload.createUserId = filteredUserIds
        }
        console.log(this.forms.update.createUserIds)
        const deleteUserList = excludeUserIds.filter(user => !this.forms.update.createUserIds.includes(user.UserId));
        const userIds = deleteUserList.map(user => user.UserId);
        console.log("userIds : " + JSON.stringify(userIds))
        if(deleteUserList.length > 0) {
          payload.deleteUserId = [];
          payload.deleteUserId = userIds;
        }

        await meetingRoomService.updateMeetingRoom(payload)
        await this.loadInitialData()
        this.closeUpdateModal()
      } catch (error) {
        this.handleError(error, '更新失敗')
      }
    },

    async handleLogout() {
      try {
        await meetingRoomService.logout()
        this.$router.push('/login')
      } catch (error) {
        this.handleError(error, '登出失敗')
      }
    },

    async handleDeleteRoom() {
      try {
        await meetingRoomService.deleteMeetingRoom(this.forms.delete.bookingId)
        await this.loadInitialData()
        this.closeDeleteModal()
      } catch (error) {
        this.handleError(error, '刪除失敗')
      }
    },

    // 模態框操作
    async openAddModal() {
      try {
        // 獲取用戶列表和會議室列表
        const [users, rooms] = await Promise.all([
          meetingRoomService.getAllUsers(),
          meetingRoomService.getMeetingRooms()
        ])
        
        this.userData.allUsers = users
        this.roomData.meetingRooms = rooms
        
        // 設置當前時間為默認開始時間
        const now = new Date()
        this.forms.add.startTime = this.formatDateTime(now, now.getHours())
        this.forms.add.endTime = this.formatDateTime(now, now.getHours() + 1)
        
        // 顯示模態框
        this.uiState.showAddRoomModal = true
      } catch (error) {
        this.handleError(error, '獲取數據失敗')
      }
    },

    async openUpdateModal(booking) {
      try {
        // 獲取用戶列表和會議室列表
        const [users, rooms] = await Promise.all([
          meetingRoomService.getAllUsers(),
          meetingRoomService.getMeetingRooms()
        ])
        this.userData.allUsers = users
        this.roomData.meetingRooms = rooms
        // 設置表單數據
        this.forms.update = {
          id: booking.MeetingRoomNameId,
          startTime: booking.StartTime.slice(0, 16),
          endTime: booking.EndTime.slice(0, 16),
          meetingRoomId: booking.ID,
          createUserIds: booking.UserList.map(user => user.UserId),
          deleteUserIds: []
        }
        
        this.uiState.showUpdateModal = true
      } catch (error) {
        this.handleError(error, '獲取數據失敗')
      }
    },

    openDeleteModal(booking) {
      this.forms.delete.bookingId = booking.ID
      this.uiState.showDeleteModal = true
    },

    // 關閉模態框
    closeAddModal() {
      this.uiState.showAddRoomModal = false
      this.resetForm('add')
    },

    closeUpdateModal() {
      this.uiState.showUpdateModal = false
      this.resetForm('update')
    },

    closeDeleteModal() {
      this.uiState.showDeleteModal = false
      this.resetForm('delete')
    },

    selectRoom(room) {

      this.openAddModal()
      this.forms.add.roomId = room.ID
    },

    // 工具方法
    resetForm(formType) {
      const initialState = {
        add: {
          startTime: '',
          endTime: '',
          roomId: '',
          userIds: []
        },
        update: {
          startTime: '',
          endTime: '',
          meetingRoomId: '',
          createUserIds: [],
          deleteUserIds: []
        },
        delete: {
          bookingId: ''
        }
      }
      
      this.forms[formType] = { ...initialState[formType] }
    },

    getWeekRange(date) {
      const sunday = new Date(date)
      sunday.setDate(date.getDate() - date.getDay())
      sunday.setHours(0, 0, 0, 0)

      const saturday = new Date(sunday)
      saturday.setDate(sunday.getDate() + 6)
      saturday.setHours(23, 59, 59, 999)

      return { sunday, saturday }
    },

    handleError(error, defaultMessage) {
      console.error(defaultMessage, error)
      const errorMessage = error.response?.data?.message || defaultMessage
      alert(errorMessage)
    },

    // UI 操作
    toggleSidebar() {
      this.uiState.isSidebarCollapsed = !this.uiState.isSidebarCollapsed
    },

    handleSlotClick({ date, hour }) {
      this.forms.add.startTime = this.formatDateTime(date, hour)
      this.forms.add.endTime = this.formatDateTime(date, hour + 1)
      this.openAddModal()
    },

    async handleDateChange(newDate) {
      try {
        const { sunday, saturday } = this.getWeekRange(newDate)
        const response = await meetingRoomService.getMeetingRoomList(
          sunday.toISOString().slice(0, 19),
          saturday.toISOString().slice(0, 19)
        )
        this.roomData.bookings = response
      } catch (error) {
        this.handleError(error, '取預約記錄失敗')
      }
    },

    // 格式化日期時間
    formatDateTime(date, hour) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00`
    },

    async handleUpdateRoomClick(booking) {
      await this.openUpdateModal(booking)
    },
  },

  created() {
    this.loadInitialData()
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.main-content {
  display: flex;
  width: 100%;
  min-height: calc(100vh - 64px);
}

.sidebar {
  width: 300px;
  background-color: #f5f6fa;
  padding: 1rem;
  overflow-y: auto;
  position: relative;
  transition: all 0.3s ease;
}

.sidebar.collapsed {
  width: 80px;
  padding: 1rem 0.5rem;
}

.sidebar-toggle {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: #2c3e50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.sidebar-toggle:hover {
  background: #34495e;
}

.toggle-icon {
  font-style: normal;
  font-size: 12px;
}

.room-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.room-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.room-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.room-item.active {
  background-color: #3498db;
  color: white;
}

.room-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.meeting-room-icon {
  width: 20px;
  height: 20px;
}

.room-item.active .meeting-room-icon {
  color: white;
}

.room-item:hover .meeting-room-icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

.room-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.room-name {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.room-status {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  margin-top: 0.25rem;
}

.room-status.available {
  background-color: #2ecc71;
  color: white;
}

.room-status.occupied {
  background-color: #e74c3c;
  color: white;
}

.room-item.active .room-status {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.sidebar.collapsed .room-item {
  padding: 0.75rem;
  justify-content: center;
}

.sidebar.collapsed .room-icon {
  margin: 0;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.add-room-btn {
  padding: 0.5rem 1rem;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.user-select {
  position: relative;
}

.user-select select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 100px;
}

.user-select small {
  display: block;
  color: #666;
  margin-top: 0.25rem;
  font-size: 0.8rem;
}

select option {
  padding: 0.5rem;
}

select option:checked {
  background-color: #3498db;
  color: white;
}

.user-checkbox-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem;
}

.user-checkbox-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  gap: 0.5rem;
}

.user-checkbox-item:hover {
  background-color: #f5f6fa;
}

.user-checkbox-item input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.user-checkbox-item label {
  margin: 0;
  cursor: pointer;
  flex: 1;
}

.content {
  flex: 1;
  padding: 1rem;
  max-width: calc(100% - 300px);
  box-sizing: border-box;
}

.content.sidebar-collapsed {
  margin-left: 80px;
  max-width: calc(100% - 80px);
}

:deep(.calendar-container) {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

:deep(.calendar-grid) {
  width: 100%;
  overflow-x: auto;
}

:deep(.day-column) {
  min-width: 120px;
  flex: 1 0 auto;
}

.action-buttons {
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* 模態框樣式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.modal-buttons button {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.modal-buttons button[type="submit"] {
  background-color: #3498db;
  color: white;
}

.modal-buttons button[type="submit"]:hover {
  background-color: #2980b9;
}

.modal-buttons button[type="button"] {
  background-color: #95a5a6;
  color: white;
}

.modal-buttons button[type="button"]:hover {
  background-color: #7f8c8d;
}

.modal-buttons button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

/* 美化滾動條 */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.delete-confirm {
  max-width: 400px;
  padding: 1.5rem;
}

.confirm-message {
  margin: 1.5rem 0;
  text-align: center;
  color: #2c3e50;
  font-size: 1.1rem;
}

.delete-btn {
  background-color: #e74c3c !important;
}

.delete-btn:hover {
  background-color: #c0392b !important;
}
</style> 