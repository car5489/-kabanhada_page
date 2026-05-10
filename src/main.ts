import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './styles/tokens.css'
import './styles/global.css'
import './styles/vehicle-catalog.css'

createApp(App).use(router).mount('#app')
