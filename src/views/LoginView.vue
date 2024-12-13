<template>
  <div class="login-view">
    <login-form></login-form>
  </div>
</template>

<script>
import LoginForm from '../components/LoginForm.vue'

export default {
  name: 'LoginView',
  components: {
    LoginForm
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
}
</style> 