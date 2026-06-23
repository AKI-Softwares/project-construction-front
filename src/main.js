import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faBuilding as farBuilding
} from '@fortawesome/free-regular-svg-icons'
import {
  faBuildingCircleArrowRight,
  faChartSimple,
  faChartBar,
  faChartLine,
  faPenToSquare,
  faPen,
  faPlus,
  faGear,
  faArrowRightFromBracket,
  faArrowLeft,
  faCalendarDays,
  faUsers,
  faUser,
  faUserPlus,
  faCircleExclamation,
  faCircleCheck,
  faCircleInfo,
  faClock,
  faEnvelopeCircleCheck,
  faEye,
  faEyeSlash,
  faLock,
  faTrash,
  faTriangleExclamation,
  faClipboardList,
  faClipboardCheck,
  faDoorOpen,
  faScrewdriverWrench,
  faRotate,
  faSitemap,
  faBook,
  faShieldHalved,
  faFilter,
  faChevronDown,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'

library.add(
  farBuilding,
  faBuildingCircleArrowRight,
  faChartSimple,
  faChartBar,
  faChartLine,
  faPenToSquare,
  faPen,
  faPlus,
  faGear,
  faArrowRightFromBracket,
  faArrowLeft,
  faCalendarDays,
  faUsers,
  faUser,
  faUserPlus,
  faCircleExclamation,
  faCircleCheck,
  faCircleInfo,
  faClock,
  faEnvelopeCircleCheck,
  faEye,
  faEyeSlash,
  faLock,
  faTrash,
  faTriangleExclamation,
  faClipboardList,
  faClipboardCheck,
  faDoorOpen,
  faScrewdriverWrench,
  faRotate,
  faSitemap,
  faBook,
  faShieldHalved,
  faFilter,
  faChevronDown,
  faChevronRight,
)

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.mount('#app')
```
