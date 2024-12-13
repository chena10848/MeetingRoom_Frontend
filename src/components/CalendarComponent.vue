<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <button @click="previousWeek" class="nav-button">
        <span>&#8592;</span> 上週
      </button>
      <h2>{{ currentWeekDisplay }}</h2>
      <button @click="nextWeek" class="nav-button">
        下週 <span>&#8594;</span>
      </button>
    </div>

    <div class="calendar-grid">
      <!-- 時間軸 -->
      <div class="time-column">
        <div class="time-header">時間</div>
        <div v-for="hour in hours" :key="hour" class="time-slot">
          {{ formatHour(hour) }}
        </div>
      </div>

      <!-- 每天的預約情況 -->
      <div v-for="day in weekDays" 
           :key="day.date" 
           class="day-column"
           :class="{ 'weekend': day.name === '週六' || day.name === '週日' }">
        <div class="day-header" :class="{ 'today': day.isToday }">
          {{ formatDate(day.date) }}
          <div class="day-name">{{ day.name }}</div>
        </div>
        <div class="day-grid">
          <div v-if="day.isToday" 
               class="current-time-line"
               :style="currentTimeLineStyle">
            <div class="time-dot"></div>
            <span class="current-time">{{ currentTimeDisplay }}</span>
          </div>
          <div 
            v-for="hour in hours" 
            :key="hour" 
            class="hour-slot"
          >
            <!-- 預約顯示部分 -->
            <div
              v-for="booking in getRoomForTimeSlot(day.date, hour)"
              :key="booking.ID"
              class="booking-item"
              :style="getBookingStyle(booking)"
              @click="showBookingDetails(booking)"
            >
              <div class="booking-content">
                <div class="booking-title">{{ booking.MeetRoomName }}</div>
                <div class="booking-time">
                  {{ new Date(booking.StartTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }) }} - {{ new Date(booking.EndTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加會議室詳情彈窗 -->
    <div v-if="selectedBooking" class="booking-modal" @click="closeBookingDetails">
      <div class="booking-modal-content" @click.stop>
        <div class="modal-header">
          <h3>會議室預約詳情</h3>
          <button class="close-btn" @click="closeBookingDetails">&times;</button>
        </div>
        <div class="modal-body">
          <div class="info-row">
            <span class="label">會議室：</span>
            <span>{{ selectedBooking.MeetRoomName }}</span>
          </div>
          <div class="info-row">
            <span class="label">預約時間：</span>
            <span>{{ new Date(selectedBooking.StartTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }) }} - {{ new Date(selectedBooking.EndTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }) }}</span>
          </div>
          <div class="info-row">
            <span class="label">預約者：</span>
            <span>{{ selectedBooking.UserName }}</span>
          </div>
          <div class="info-row" v-if="selectedBooking.UserList.length > 0">
            <span class="label">參與者：</span>
            <div class="participants-list">
              <div v-for="user in selectedBooking.UserList" 
                   :key="user.UserId" 
                   class="participant-item"
                   @console.log(selectedBooking.UserList)>
                   
                {{ user.UserName }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn update" @click="handleUpdateClick">
            <span class="icon">&#9998;</span>
            更新預約
          </button>
          <button class="action-btn delete" @click="handleDeleteClick">
            <span class="icon">&#128465;</span>
            刪除預約
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'CalendarComponent',
  props: {
    bookings: {
      type: Array,
      default: () => []
    }
  },
  emits: ['date-change', 'update:bookings', 'update-booking', 'delete-booking'],
  data() {
    return {
      currentDate: new Date(),
      hours: Array.from({ length: 13 }, (_, i) => i + 8), // 8:00 - 20:00
      selectedBooking: null,
      roomColors: {
        '601會議室': '#8adb34',
        '602會議室': '#2ecc71',
        '603會議室': '#e74c3c',
        '604會議室': '#f1c40f',
        '605會議室': '#9b59b6'
      },
      currentTime: new Date(),
      timeUpdateInterval: null,
    }
  },
  computed: {
    weekDays() {
      return this.calculateWeekDays()
    },
    currentWeekDisplay() {
      const start = this.weekDays[0].date
      const end = this.weekDays[6].date
      return `${this.formatDate(start)} - ${this.formatDate(end)}`
    },
    currentTimeLineStyle() {
      const hours = this.currentTime.getHours()
      const minutes = this.currentTime.getMinutes()
      const totalMinutes = (hours - 8) * 60 + minutes // 8點是起始時間
      return {
        top: `${totalMinutes}px`
      }
    },
    currentTimeDisplay() {
      return this.currentTime.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  },
  watch: {
    currentDate: {
      handler(newDate) {
        this.$emit('date-change', newDate)
      }
    }
  },
  mounted() {
    // 每分鐘更新一次時間
    this.timeUpdateInterval = setInterval(() => {
      this.currentTime = new Date()
    }, 60000)
  },
  beforeUnmount() {
    // 清理定時器
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval)
    }
  },
  methods: {
    calculateWeekDays() {
      const days = []
      const weekStart = new Date(this.currentDate)
      weekStart.setDate(this.currentDate.getDate() - this.currentDate.getDay())
      weekStart.setHours(0, 0, 0, 0)

      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart)
        date.setDate(weekStart.getDate() + i)
        days.push({
          date: date,
          name: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][i],
          isToday: this.isSameDay(date, new Date())
        })
      }
      return days
    },
    isSameDay(date1, date2) {
      const d1 = new Date(date1)
      const d2 = new Date(date2)

      return d1.getFullYear() === d2.getFullYear() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getDate() === d2.getDate()
    },
    formatHour(hour) {
      return `${hour.toString().padStart(2, '0')}:00`
    },
    formatDate(date) {
      return `${date.getMonth() + 1}/${date.getDate()}`
    },
    getRoomForTimeSlot(date, hour) {
      if (!this.bookings?.length) return []
      
      return this.bookings.filter(booking => {
        try {
          const startTime = new Date(booking.StartTime)
          return this.isSameDay(startTime, date) && 
                 startTime.getHours() === hour
        } catch (error) {
          console.error('處理預約時出錯:', error, booking)
          return false
        }
      })
    },
    getBookingStyle(booking) {
      try {
        const { startMinutes, durationMinutes } = this.calculateBookingTime(booking)
        const { width, left } = this.calculateBookingPosition(booking)

        return {
          position: 'absolute',
          top: `${startMinutes}px`,
          height: `${durationMinutes}px`,
          width,
          left,
          backgroundColor: this.getRoomColor(booking.MeetRoomName),
          borderRadius: '8px',
          padding: '8px',
          color: 'white',
          fontSize: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 1
        }
      } catch (error) {
        console.error('生成預約樣式時出錯:', error)
        return {}
      }
    },
    calculateBookingTime(booking) {
      const startTime = new Date(booking.StartTime)
      const endTime = new Date(booking.EndTime)
      
      return {
        startMinutes: startTime.getMinutes(),
        durationMinutes: (endTime - startTime) / (1000 * 60)
      }
    },
    calculateBookingPosition(booking) {
      const startTime = new Date(booking.StartTime)
      
      const sameTimeBookings = this.bookings.filter(b => {
        const bStartTime = new Date(b.StartTime)
        
        return bStartTime.getHours() === startTime.getHours() &&
               this.isSameDay(bStartTime, startTime)
      })

      const index = sameTimeBookings.findIndex(b => b.ID === booking.ID)
      const total = sameTimeBookings.length

      return {
        width: `calc((100% - 15px) / ${Math.max(1, total)})`,
        left: `calc(0px + (100% - 10px) * ${index} / ${Math.max(1, total)})`
      }
    },
    getRoomColor(roomName) {
      return this.roomColors[roomName] || '#95a5a6'
    },
    showBookingDetails(booking) {
      this.selectedBooking = booking
    },
    closeBookingDetails() {
      this.selectedBooking = null
    },
    handleUpdateClick() {
      this.$emit('update-booking', this.selectedBooking)
      this.closeBookingDetails()
    },
    handleDeleteClick() {
      console.log('Emitting delete-booking event with booking:', this.selectedBooking)
      this.$emit('delete-booking', this.selectedBooking)
      this.closeBookingDetails()
    },
    previousWeek() {
      const newDate = new Date(this.currentDate)
      newDate.setDate(this.currentDate.getDate() - 7)
      this.currentDate = newDate
    },
    nextWeek() {
      const newDate = new Date(this.currentDate)
      newDate.setDate(this.currentDate.getDate() + 7)
      this.currentDate = newDate
    }
  }
}
</script>

<style scoped>
.calendar-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 1.5rem;
  width: 100%;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
}

.calendar-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.nav-button {
  padding: 0.75rem 1.25rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.nav-button:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.calendar-grid {
  display: flex;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
  width: 100%;
}

.time-column {
  width: 80px;
  border-right: 1px solid #e9ecef;
  background: #f8f9fa;
  flex-shrink: 0;
}

.time-header, .day-header {
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  text-align: center;
  font-weight: 600;
  font-size: 1rem;
  height: 70px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}

.day-name {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 0.25rem;
  font-weight: normal;
}

.time-slot {
  height: 60px;
  padding: 0.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
  box-sizing: border-box;
}

.hour-slot {
  height: 60px;
  border-bottom: 1px solid #e9ecef;
  position: relative;
  box-sizing: border-box;
}

.hour-slot:hover {
  background-color: #f8f9fa;
}

/* 預約項目樣式 */
.booking-item {
  position: absolute;
  padding: 0.75rem;
  border-radius: 8px;
  color: white;
  font-size: 0.85rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 2;
}

.booking-item:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.booking-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.25rem;
}

.booking-title {
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.booking-time {
  font-size: 0.8rem;
  opacity: 0.9;
}

.booking-user,
.booking-participants {
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 漸變效果 */
.booking-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.1), transparent);
  pointer-events: none;
}

/* 當天日期特殊標記 */
.day-header.today {
  background-color: #e8f4f8;
  color: #3498db;
}

/* 週末特殊樣式 */
.day-column:first-child .day-header,
.day-column:last-child .day-header {
  background-color: #f8f9fa;
  color: #e74c3c;
}

.day-column {
  flex: 1;
  min-width: 120px;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
}

.day-column:last-child {
  border-right: none;
}

.day-grid {
  flex: 1;
  position: relative;
}

.day-name {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 0.25rem;
  font-weight: normal;
}

/* 確保最後一列的邊框顯示正確 */
.time-slot:last-child,
.hour-slot:last-child {
  border-bottom: none;
}

/* 移除所有的 overflow 屬性，避免容被截斷 */
.time-column,
.day-column,
.day-grid,
.hour-slot {
  overflow: visible;
}

.booking-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.booking-modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.modal-header {
  background: #3498db;
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem;
  max-height: calc(80vh - 200px);
  overflow-y: auto;
}

.info-row {
  margin-bottom: 1rem;
}

.info-row .label {
  color: #666;
  margin-right: 0.5rem;
  font-weight: 500;
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.participant-item {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #2c3e50;
}

/* 週末樣式 */
.weekend .day-header {
  color: #e74c3c;
}

.weekend .day-name {
  color: #e74c3c;
}

/* 修正時間軸對齊 */
.time-slot {
  height: 60px;
  padding: 0.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
  box-sizing: border-box;
}

.booking-item {
  cursor: pointer;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  background: #f8f9fa;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.action-btn .icon {
  font-size: 1.1rem;
}

.action-btn.update {
  background-color: #3498db;
  color: white;
}

.action-btn.update:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
}

.action-btn.delete {
  background-color: #e74c3c;
  color: white;
}

.action-btn.delete:hover {
  background-color: #c0392b;
  transform: translateY(-1px);
}

.current-time-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: #3498db;
  z-index: 3;
  display: flex;
  align-items: center;
}

.time-dot {
  position: absolute;
  left: -4px;
  width: 8px;
  height: 8px;
  background-color: #3498db;
  border-radius: 50%;
}

.current-time {
  position: absolute;
  left: -65px;
  background-color: #3498db;
  color: white;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 12px;
}
</style> 