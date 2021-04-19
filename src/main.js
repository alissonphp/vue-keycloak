import Vue from 'vue'
import Keycloack from 'keycloak-js'
import App from './App.vue'

Vue.config.productionTip = false

const keycloak = Keycloack({
  url: 'http://localhost:8080/auth',
  realm: 'development',
  clientId: 'gmkernel-docs',
  onLoad: 'login-required'
})

keycloak.init({ onLoad: 'login-required' })
  .then((auth) => {
    if (!auth) {
      window.location.reload();
    } else {
      console.info("Auth ok")
    }

    new Vue({
      render: h => h(App),
    }).$mount('#app')

    localStorage.setItem("vue-token", keycloak.token);
    localStorage.setItem("vue-refresh-token", keycloak.refreshToken);

    setInterval(() => {
      keycloak.updateToken(70).then((refreshed) => {
        if (refreshed) {
          console.debug('Token refreshed' + refreshed);
        } else {
          console.warn('Token not refreshed, valid for '
            + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
        }
      }).catch(() => {
        console.error('Failed to refresh token');
      });


    }, 60000)
  }).catch((err) => {
    console.error(err)
    console.error("Authenticated Failed");
  })
