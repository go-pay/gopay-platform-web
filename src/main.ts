import { createApp } from 'vue'
import vuetify from './plugins/vuetify'
import './styles/global.css'
import App from './App.vue'
import router from './router'
import pinia from './store'

const app = createApp(App)

app.use(vuetify)
app.use(router)
app.use(pinia)

app.mount('#app')
