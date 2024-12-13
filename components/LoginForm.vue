<template>
    <div class="login-container">
        <h2>登入</h2>
        <form @submit.prevent="handleSubmit">
            <label for="email">電子信箱</label>
            <input 
                type="email" 
                id="email" 
                v-model="email" 
                placeholder="輸入使用者電子信箱" 
                required
            >

            <label for="password">密碼</label>
            <input 
                type="password" 
                id="password" 
                v-model="password" 
                placeholder="輸入密碼" 
                required
            >

            <div class="error" v-if="error">{{ error }}</div>

            <button type="submit" :disabled="isLoading">
                {{ isLoading ? '登入中...' : '登入' }}
            </button>
        </form>
    </div>
</template>

<script>
export default {
    name: 'LoginForm',
    data() {
        return {
            email: '',
            password: '',
            error: '',
            isLoading: false
        }
    },
    methods: {
        async handleSubmit() {
            try {
                this.isLoading = true
                this.error = ''

                if (!this.email || !this.password) {
                    this.error = '請填寫所有欄位'
                    return
                }

                const response = await fetch('http://localhost:8080/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: this.email,
                        password: this.password
                    })
                })

                const data = await response.json()

                if (response.status === 200) {
                    // 設置 cookie
                    document.cookie = `token=${data.data}; path=/;`
                    // 跳轉到主頁面
                    window.location.href = '../index.html'
                } else {
                    this.error = data.message || '登入失敗，請檢查帳號或密碼'
                }
            } catch (err) {
                console.error('登入錯誤：', err)
                this.error = '登入失敗，請稍後再試'
            } finally {
                this.isLoading = false
            }
        }
    }
}
</script>

<style scoped>
body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f9;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}

.login-container {
    background: #ffffff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

.login-container h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #333333;
}

.login-container label {
    display: block;
    margin-bottom: 8px;
    color: #555555;
}

.login-container input {
    width: 95%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #cccccc;
    border-radius: 4px;
}

.login-container button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: #ffffff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.login-container button:hover {
    background-color: #0056b3;
}

.login-container button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.login-container .error {
    color: red;
    font-size: 14px;
    text-align: center;
    margin-bottom: 10px;
}
</style> 