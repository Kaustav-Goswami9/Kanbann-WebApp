import addCard from './components/addCard.js'
import addList from './components/addList.js'
import editList from './components/editList.js'
import dashboard from './components/dashboard.js'
import editCard from './components/editCard.js'
import login from './components/login.js'
import signup from './components/signup.js'
import summary from './components/summary.js'

const router = new VueRouter({
    routes: [
        { path: '/', component: dashboard, name: 'dashboard' },
        { path: '/login', component: login, name: 'login' },
        { path: '/signup', component: signup, name: 'signup' },
        { path: '/addCard/:lid', component: addCard, name: 'addCard' },
        { path: '/addList', component: addList, name: 'addList' },
        { path: '/editCard/:lid/:cid', component: editCard, name: 'editCard' },
        { path: '/editList/:lid', component: editList, name: 'editList' },
        { path: '/summary', component: summary, name: 'summary' }
    ],
    base: '/'
})

new Vue({
    el: '#app',
    router: router
})