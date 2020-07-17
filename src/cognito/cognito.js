import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js'
import { Config, CognitoIdentityCredentials } from 'aws-sdk'

export default class Cognito {
  configure (config) {
    if (config.userPool) {
      this.userPool = config.userPool
    } else {
      this.userPool = new CognitoUserPool({
        UserPoolId: config.UserPoolId,
        ClientId: config.ClientId
      })
    }
    Config.region = config.region
    Config.credentials = new CognitoIdentityCredentials({
      IdentityPoolId: config.IdentityPoolId
    })
    this.options = config
  }

  static install = (Vue, options) => {
    Object.defineProperty(Vue.prototype, '$cognito', {
      get () { return this.$root._cognito }
    })

    Vue.mixin({
      beforeCreate () {
        if (this.$options.cognito) {
          this._cognito = this.$options.cognito
          this._cognito.configure(options)
        }
      }
    })
  }

  /**
   * username, passwordでサインアップ
   * username = emailとしてUserAttributeにも登録
   */
  signUp (username, password) {
    const dataEmail = { Name: 'email', Value: username }
    const attributeList = []
    attributeList.push(new CognitoUserAttribute(dataEmail))
    return new Promise((resolve, reject) => {
      this.userPool.signUp(username, password, attributeList, null, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  /**
   * 確認コードからユーザーを有効化する
   */
  confirmation (username, confirmationCode) {
    const userData = { Username: username, Pool: this.userPool }
    const cognitoUser = new CognitoUser(userData)
    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  /**
   * username, passwordでログイン
   */
  login (username, password) {
    const userData = { Username: username, Pool: this.userPool }
    const cognitoUser = new CognitoUser(userData)
    const authenticationData = { Username: username, Password: password }
    const authenticationDetails = new AuthenticationDetails(authenticationData)
    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          // 実際にはクレデンシャルなどをここで取得する(今回は省略)
          resolve(result)
        },
        onFailure: (err) => {
          reject(err)
        }
      })
    })
  }

  /**
   * ログアウト
   */
  logout () {
    this.userPool.getCurrentUser().signOut()
  }

  /**
   * ログインしているかの判定
   */
  isAuthenticated () {
    const cognitoUser = this.userPool.getCurrentUser()
    return new Promise((resolve, reject) => {
      if (cognitoUser === null) { reject(cognitoUser) }
      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err)
        } else {
          if (!session.isValid()) {
            reject(session)
          } else {
            resolve(session)
          }
        }
      })
    })
  }

  /**
   * 確認コードからユーザーを有効化し、同時にログインまで行う。
   */
  confirmationAndLogin (username, confirmationCode, password) {
    const userData = { Username: username, Pool: this.userPool }
    const cognitoUser = new CognitoUser(userData)
    const authenticationData = { Username: username, Password: password }
    const authenticationDetails = new AuthenticationDetails(authenticationData)

    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
        if (err) {
          console.log(err)
        } else {
          cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
              // 実際にはクレデンシャルなどをここで取得する(今回は省略)
              resolve(result)
            },
            onFailure: (err) => {
              reject(err)
            }
          })
        }
      })
    })
  }

  /**
   * 認証コード再送
   */
  resendConfirmationByEmail (username) {
    return new Promise((resolve, reject) => {
      const userData = { Username: username, Pool: this.userPool }
      const cognitoUser = new CognitoUser(userData)
      cognitoUser.resendConfirmationCode(function (err, result) {
        if (err) reject(err)
        else resolve(result)
      })
    })
  }

  /**
   * パスワードリセット
   */
  resetPassword (username) {
    return new Promise((resolve, reject) => {
      const userData = { Username: username, Pool: this.userPool }
      const cognitoUser = new CognitoUser(userData)
      cognitoUser.forgotPassword({
        onSuccess: (data) => {
          console.log(data)
        },
        onFailure: (err) => {
          console.log(err)
        },
        inputVerificationCode: (data) => {
          console.log('Code sent to:' + data)
          var verificationCode = prompt('確認コードを入力', '')
          var newPassword = prompt('新たなパスワードを入力', '')
          cognitoUser.confirmPassword(verificationCode, newPassword, {
            onSuccess: (res) => {
              console.log('Password confirmed!')
              resolve(res)
            },
            onFailure: (err) => {
              console.log('Password not confirmed!', err)
              reject(err)
            }
          })
        }
      })
    })
  }
}
