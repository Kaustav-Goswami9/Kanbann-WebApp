const dashboard = {
    template: `
    <div>
        <div class="position-relative">
            <p class="text-capitalize fs-1 fw-bold ms-3" :user="user">Welcome {{user}}</p>
            <div class="text-end me-5 mt-3 position-absolute top-0 end-0">
                <router-link to="/summary" class="btn btn-info" role="button" style="font-size: large;">
                    Summary
                </router-link>
                <button @click="exportAll"  role="button"style="font-size: large;" class="btn btn-info">
                    <i class="bi bi-cloud-arrow-down-fill"></i> Export
                </button>
                <button @click="logout"  role="button"style="font-size: large;" class="btn btn-info">
                    Logout <i class="bi bi-box-arrow-right"></i>
                </button>
            </div>
        </div>
        <div v-if="!ready"><h1>Please wait Loading</h1></div>
        <div v-else-if="listData.length == undefined" class="text-center">
            <img src="../static/notFound.jpg" alt="No image Found" class="pt-2">
        </div>
        <div class="row" v-else>
            <div class="col-sm-4" v-for="list in listData" :key="list.list_id">
                <div class="card position-relative mb-3" style="transform:translateX(2%)">
                    <div class="card-body">
                        <h3 class="card-title text-center">{{list.name}}</h3>
                        <router-link :to="'/addCard/'+ list.list_id" 
                            class="btn btn-primary position-absolute top-0 end-2 mt-2 me-2">
                            <i class="bi bi-plugin"></i> Add a Card
                        </router-link>
                        <router-link :to="'/editList/'+ list.list_id" 
                            class="btn btn-primary position-absolute top-0 end-0 mt-2 me-2">
                            <i class="bi bi-pencil-square"></i> Edit List
                        </router-link>
                        <div v-if="cardData[list.name].length != 0">
                            <div class="card" v-for="c in cardData[list.name]" :key="c.card_id"
                                :style="[c.flag?completed:'' || isOverdue(c.deadline)?overdue:'']">
                                <div class="card-body">
                                    <h4 class="card-title">{{c.title}}</h4>
                                    <router-link :to="'/editCard/'+ list.list_id + '/' + c.card_id" 
                                        class="btn btn-primary btn-small position-absolute top-0 end-0 mt-1 me-2">
                                        <i class="bi bi-pencil-square"></i> Edit
                                    </router-link>
                                    <button @click="exportCard(c.card_id)" 
                                        class="btn btn-primary btn-small position-absolute end-0 mb-2 me-1">
                                        <i class="bi bi-cloud-arrow-down-fill"></i> Export
                                    </button>
                                    <p class="card-text">{{c.content}}</p>
                                </div>
                            </div>
                        </div>
                        <span>
                            <button @click="exportList(list.list_id)" class="btn btn-primary btn-lg ms-5 mt-1">
                                <i class="bi bi-cloud-arrow-down-fill"></i> Export
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div class="text-center">
            <router-link to="/addList" class="btn btn-dark btn-lg m-2" style="font-size: larger;">
                <i class="bi bi-plus-circle-fill"></i> Create a new List
            </router-link>
        </div>
    </div>`,
    data() {
        return {
            user: localStorage.getItem('user'),
            listData: {},
            cardData: {},
            ready: false,
            completed: { backgroundColor: 'green' },
            overdue: { backgroundColor: 'red' }
        }
    },
    methods: {
        isOverdue(time) {
            return new Date(time.replace('T', ' ')) < new Date()
        },
        async logout() {
            const res = await fetch('/logout', { method: 'GET' })
            const data = await res.json()
            if (res.ok) {
                window.localStorage.clear()
                alert(data)
                return this.$router.push('/login')
            }
        },
        exportAll() {
            fetch('/exportList/-1', { method: 'get' })
            alert("Document has been sent to email")
        },
        exportList(lid) {
            fetch('/exportList/' + lid, { method: 'get' })
            alert("Document has been sent to email")
        },
        exportCard(cid) {
            fetch('/exportCard/' + cid, { method: 'get' })
            alert("Document has been sent to email")
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
                    this.cardData[i.name] = (await (await fetch(`/api/card/${i.list_id}`, { method: 'get' })).json()).reverse()
                }
            }
        }
        this.ready = true
    }
}

export default dashboard