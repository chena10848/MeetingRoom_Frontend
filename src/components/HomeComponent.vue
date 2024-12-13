<template>
  <div>
    <!-- Header -->
    <header class="header">
      <h1>會議室租借系統</h1>
    </header>

    <div class="main-container">
      <!-- 左側表單區域 -->
      <div class="form-container">
        <ul class="form-list">
          <li><button @click="showRentForm" :class="{ active: currentForm === 'rent' }">新增會議室</button></li>
          <li><button @click="currentForm = 'update'" :class="{ active: currentForm === 'update' }">更新會議室</button></li>
          <li><button @click="currentForm = 'delete'" :class="{ active: currentForm === 'delete' }">刪除會議室</button></li>
        </ul>
      </div>

      <!-- 右側日曆區域 -->
      <div class="calendar-container">
        <div class="logout">
          <button @click="handleLogout" class="logout-btn">登出</button>
        </div>

        <calendar-component></calendar-component>
      </div>
    </div>

    <!-- 動態表單組件 -->
    <rent-form v-if="currentForm === 'rent'"></rent-form>
    <update-form v-if="currentForm === 'update'"></update-form>
    <delete-form v-if="currentForm === 'delete'"></delete-form>
  </div>
</template>

<script>
import CalendarComponent from './CalendarComponent.vue'
import RentForm from './RentForm.vue'
import UpdateForm from './UpdateForm.vue'
import DeleteForm from './DeleteForm.vue'

export default {
  name: 'HomeComponent',
  components: {
    CalendarComponent,
    RentForm,
    UpdateForm,
    DeleteForm
  },
  data() {
    return {
      currentForm: ''
    }
  },
  methods: {
    handleLogout() {
      this.$emit('logout')
    }
  }
}
</script>

<style scoped>
.header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    background-color: #f4f4f4;
    border-bottom: 1px solid #ccc;
}

.main-container {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding: 20px;
    flex: 1;
    box-sizing: border-box;
}

.form-container {
    width: 250px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.form-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.form-list li {
    display: block;
}

.form-list button {
    width: 100%;
    font-size: 1em;
    padding: 10px;
    background-color: #0078d4;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.form-list button:hover {
    background-color: #005a8d;
}

.form-list button.active {
    background-color: #005a8d;
}

.calendar-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    max-width: 100%;
    box-sizing: border-box;
    flex: 1;
}

.logout {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    padding-right: 20px;
    margin-bottom: 10px;
}

.logout-btn {
    padding: 5px 10px;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.logout-btn:hover {
    background-color: #c0392b;
}
</style> 