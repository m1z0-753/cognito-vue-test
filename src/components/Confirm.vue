<template>
  <div class="confirm">
    <h2>確認コード入力</h2>
    <form @submit.prevent="confirmAndLogin">
      <div>
        メール:
        <input type="text" placeholder="メール" v-model="username" required>
      </div>
      <div>
        確認コード:
        <input type="text" placeholder="確認コード" v-model="confirmationCode" required>
      </div>
      <div>
        パスワード:
        <input type="password" placeholder="パスワード" v-model="password" required>
      </div>
      <button>確認</button>
    </form>
    <div>
      <button @click='resendConfirmationByEmail()'>確認コード再送</button>
    </div>
    <router-link to="/login">ログイン</router-link>
    <router-link to="/singup">ユーザー登録</router-link>
  </div>
</template>

<script>
export default {
  name: 'Confirm',
  data () {
    return {
      username: '',
      confirmationCode: '',
      password: ''
    }
  },
  methods: {
    confirm () {
      this.$cognito.confirmation(this.username, this.confirmationCode)
        .then(result => {
          console.log(result)
          this.$router.replace('/login')
        })
        .catch(err => {
          console.log(err)
        })
    },
    confirmAndLogin () {
      this.$cognito.confirmationAndLogin(this.username, this.confirmationCode, this.password)
        .then(result => {
          console.log(result)
          this.$router.replace('/home')
        })
        .catch(err => {
          console.log(err)
        })
    },
    resendConfirmationByEmail () {
      this.$cognito.resendConfirmationByEmail(this.username)
    }
  }
}
</script>
