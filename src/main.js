import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
// import { api_request } from '@/services/api_helper'; <--- REMOVIDO
// As configurações de axios.defaults e interceptors foram REMOVIDAS daqui
// pois agora vivem dentro do api_helper.js

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.my-app-dark',
        }
    }
});

app.mount('#app')