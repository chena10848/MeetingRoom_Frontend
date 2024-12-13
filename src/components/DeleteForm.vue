<template>
  <div class="form-container">
    <h2>刪除會議室</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="delete-date">日期</label>
        <input 
          type="date" 
          id="delete-date" 
          v-model="formData.date" 
          required
        >
      </div>

      <button type="submit">刪除會議室</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'DeleteForm',
  data() {
    return {
      formData: {
        date: ''
      }
    }
  },
  methods: {
    async handleSubmit() {
      try {
        const response = await fetch('http://localhost:8080/api/rooms/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.formData)
        })

        if (response.ok) {
          alert('會議室刪除成功！')
          this.resetForm()
        } else {
          throw new Error('刪除失敗')
        }
      } catch (error) {
        alert('刪除失敗：' + error.message)
      }
    },
    resetForm() {
      this.formData = {
        date: ''
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
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #c82333;
}
</style> 