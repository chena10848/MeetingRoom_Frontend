<template>
  <div class="form-container">
    <h2>更新會議室</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="update-room-name">會議室名稱</label>
        <input 
          type="text" 
          id="update-room-name" 
          v-model="formData.roomName" 
          required
        >
      </div>

      <div class="form-group">
        <label for="update-start-time">開始時間</label>
        <input 
          type="datetime-local" 
          id="update-start-time" 
          v-model="formData.startTime" 
          required
        >
      </div>

      <div class="form-group">
        <label for="update-end-time">結束時間</label>
        <input 
          type="datetime-local" 
          id="update-end-time" 
          v-model="formData.endTime" 
          required
        >
      </div>

      <div class="form-group">
        <label for="update-participants">參加人員</label>
        <input 
          type="text" 
          id="update-participants" 
          v-model="formData.participants" 
          required
        >
      </div>

      <button type="submit">更新會議室</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'UpdateForm',
  data() {
    return {
      formData: {
        roomName: '',
        startTime: '',
        endTime: '',
        participants: ''
      }
    }
  },
  methods: {
    async handleSubmit() {
      try {
        const response = await fetch('http://localhost:8080/api/rooms/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.formData)
        })

        if (response.ok) {
          alert('會議室更新成功！')
          this.resetForm()
        } else {
          throw new Error('更新失敗')
        }
      } catch (error) {
        alert('更新失敗：' + error.message)
      }
    },
    resetForm() {
      this.formData = {
        roomName: '',
        startTime: '',
        endTime: '',
        participants: ''
      }
    }
  }
}
</script>

<style scoped>
.form-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  max-width: 500px;
  margin: 20px auto;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style> 