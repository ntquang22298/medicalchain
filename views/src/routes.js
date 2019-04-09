import HomePage from './home/HomePage.vue'
import LoginPage from './login/LoginPage.vue'
import PatientPage from './patient/PatientPage.vue'
import PractitionerPage from "./practitioner/PractitionerPage.vue"
import RegisterPage from "./register/RegisterPage.vue"

export default [
  { path: '/', component: HomePage },
  { path: '/login', component: LoginPage }, 
  { path: '/patient', component: PatientPage},
  { path: '/practitioner', component: PractitionerPage},
  { path: '/register', component: RegisterPage}
]