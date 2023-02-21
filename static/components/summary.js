const summary = {
    template: `<div>
        <div class="position-relative">
            <p class="text-capitalize fs-1 fw-bold ms-3" :user="user">Welcome {{user}} - Summary</p>
            <div class="text-end me-5 mt-3 position-absolute top-0 end-0">
                <router-link to="/" class="btn btn-info" role="button" style="font-size: large;">
                    Go To Dashboard
                </router-link>
                <button @click="logout"  role="button"style="font-size: large;" class="btn btn-info">
                    Logout <i class="bi bi-box-arrow-right"></i>
                </button>
            </div>
        </div>
        <div v-if="!ready"><h1>Please wait Loading</h1></div>
        <div v-else-if="listData.length == undefined" class="text-center">
            <img src="../static/notFound.jpg"  alt="No image Found" class="pt-2">
        </div>
        <div class="row" v-else>
            <div class="col-sm-4" v-for="list in listData" :key="list.list_id">
                <div class="card position-relative mb-3" style="transform:translateX(2%)">
                    <div class="card-body text-center">
                        <h2 class="card-title">{{list.name}}</h2><br>
                        <h3 v-if="list.total==0">This list has no cards in it.</h3>
                        <h5 v-else-if="list.overdue">Number of Tasks overdue: {{list.overdue}}.</h5>
                        <h5 v-if="list.total">
                            Number of Tasks completed: {{list.completed}}.<br>
                            Total number of Tasks created: {{list.total}}.<br><br>
                            <img v-if="list.completed" :src="'../static/'+list.list_id+'.jpg'" alt="No image Found"
                                class="pt-2" height="400px" width="470px">
                            <p v-else style="color:violet">Complete a task to generate the graph</p>
                        </h5>
                    </div>
                </div>
            </div>
        </div>
    </div>`,
    data() {
        return {
            user: localStorage.getItem('user'),
            listData: {},
            cardData: {},
            ready: false
        }
    },
    async beforeCreate() {
        if (localStorage.getItem('login') === null) {
            return this.$router.push('/login')
        }
        else {
            const res = await fetch(`/api/list/${localStorage.getItem('Id')}`, { method: 'get' })
            const data = await res.json()
            if (data.length != 0) {
                this.listData = data
                for (const i of data) {
                    await fetch(`/graph/${i.list_id}`, { method: 'get' })
                    let cards = await (await fetch(`/api/card/${i.list_id}`, { method: 'get' })).json()
                    this.cardData[i.name] = cards.reverse()
                    i['completed'] = cards.filter(c => c.flag).length
                    i['overdue'] = cards.filter(c => !c.flag && (new Date(c.deadline.replace('T', ' ')) < new Date())).length
                    i['total'] = cards.length
                }
            }
        }
        this.ready = true
    },
    methods: {
        async logout() {
            const res = await fetch('/logout', { method: 'GET' })
            const data = await res.json()
            if (res.ok) {
                window.localStorage.clear()
                alert(data)
                return this.$router.push('/login')
            }
        },
    }
}

export default summary