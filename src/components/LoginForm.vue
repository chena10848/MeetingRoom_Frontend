<template>
  <div class="login-container">
    <div class="login-box">
      <h2>會議室預約系統</h2>
      <p class="subtitle">請登入您的電子信箱及密碼</p>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">
            <i class="fas fa-envelope"></i>
            電子信箱
          </label>
          <input 
            type="email" 
            id="email"
            v-model="email"
            placeholder="請輸入電子信箱"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="password">
            <i class="fas fa-lock"></i>
            密碼
          </label>
          <input 
            type="password" 
            id="password"
            v-model="password"
            placeholder="請輸入密碼"
            required
          >
        </div>

        <div v-if="errorMessage" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          {{ errorMessage }}
        </div>

        <button type="submit" :disabled="isLoading">
          <span v-if="isLoading">
            <i class="fas fa-spinner fa-spin"></i>
            登入中...
          </span>
          <span v-else>登入</span>
        </button>

        <div class="additional-links">
          <router-link to="/register">註冊新帳號</router-link>
        </div>

        <div>
          <div class="google_button" id="google-sign-in-button"></div>
        </div>


      </form>
    </div>
  </div>
</template>

<script>
import { meetingRoomService } from '@/services/meetingRoomService'

export default {
  name: 'LoginForm',
  props: {
    width: {
      type: String,
      default: null
    },
    height: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      email: '',
      password: '',
      isLoading: false,
      errorMessage: ''
    }
  },
  mounted() {
      //建立google第三方登入的連結
      window.google.accounts.id.initialize({
        client_id: "167214762151-kqnd5rshmlgmhacbhra3pdpp80bknvs5.apps.googleusercontent.com",
        callback: this.handleCredentialResponse
      });
      //建立登入按鈕
      window.google.accounts.id.renderButton(
        document.getElementById("google-sign-in-button"),
        {
          theme: "outline",
          size: "large",
          shape: "pill",
        }
      );
  },
  methods: {

    async handleSubmit() {
      this.isLoading = true
      this.errorMessage = ''
      
      try {
        const payload = {
          email: this.email,
          password: this.password
        }
        
        const response = await meetingRoomService.generallyLogin(payload)

        // 2. 響應處理邏輯可以優化
        // - 應該先解析 JSON 再檢查狀態
        // - 需要更明確的錯誤處理
        
        if (response.status != 200) {
          throw new Error(data.message || `登入失敗 (${response.status})`);
        }
        // 3. 登入成功處理可以更完整
        if (response.data) {
          // 保存 token
          document.cookie = `token=${response.data}; path=/; max-age=86400; secure; samesite=strict`;
          // 導航到首頁
          this.$router.push('/home');
        } else {
          throw new Error('登入響應缺少必要資訊');
        }

      } catch (error) {
        // 4. 錯誤訊息應該更具體
        if (error.name === 'TypeError') {
          this.errorMessage = '網路連接錯誤，請檢查網路狀態'
        } else {
          this.errorMessage = error.message || '登入失敗，請稍後再試'
        }
        console.error('登入錯誤：', error)
      } finally {
        this.isLoading = false
      }
    },
    // 取得User資料
    handleCredentialResponse(response) {
      console.log(response.credential)
      this.handleGoogleLogin(response.credential);
    },
    async handleGoogleLogin(googleJwt) {
      try {
        const payload = {
          token: googleJwt
        }
        
        const response = await meetingRoomService.handleGoogleLogin(payload)

        if(response.status === 200){
          document.cookie = `token=${response.data}; path=/; max-age=86400; secure; samesite=strict`;
          this.$router.push('/home');
        }
      } catch (error) {
        if (error.name === 'TypeError') {
          this.errorMessage = '網路連接錯誤，請檢查網路狀態'
        } else {
          this.errorMessage = error.message || '登入失敗，請稍後再試'
        }
        console.error('登入錯誤：', error)
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 10px;
  font-size: 28px;
}

.subtitle {
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 30px;
  font-size: 16px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #34495e;
  font-weight: 500;
}

label i {
  margin-right: 8px;
  color: #7f8c8d;
}

input {
  width: 92%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
}

input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

button {
  width: 100%;
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: #2980b9;
}

button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.error-message {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.error-message i {
  margin-right: 8px;
}

.additional-links {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.additional-links a {
  color: #3498db;
  text-decoration: none;
  transition: color 0.3s ease;
}

.additional-links a:hover {
  color: #2980b9;
}

@media (max-width: 480px) {
  .login-box {
    padding: 20px;
  }
}

.google_button {
  margin-top: 20px;
  text-align: center;
  justify-content: center;
}
</style> 