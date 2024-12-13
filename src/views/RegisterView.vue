<template>
  <div class="register-view">
    <register-form></register-form>
  </div>
</template>

<script>
import RegisterForm from '../components/RegisterForm.vue'

export default {
  name: 'RegisterView',
  components: {
    RegisterForm
  }
}
</script>

<style scoped>
.register-view {
  min-height: 100vh;
}
</style>
