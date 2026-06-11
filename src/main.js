import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faBuilding as farBuilding } from '@fortawesome/free-regular-svg-icons'
import {
  faBuildingCircleArrowRight,
  faChartSimple,
  faPenToSquare,
  faGear,
  faArrowRightFromBracket,
  faCalendarDays,
  faUsers,
  faCircleExclamation,
  faClock,
  faCircleCheck,
  faUserPlus,
  faUser,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons'

library.add(
  farBuilding,
  faBuildingCircleArrowRight,
  faChartSimple,
  faPenToSquare,
  faGear,
  faArrowRightFromBracket,
  faCalendarDays,
  faUsers,
  faCircleExclamation,
  faClock,
  faCircleCheck,
  faUserPlus,
  faUser,
  faChevronDown,
)

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.mount('#app')