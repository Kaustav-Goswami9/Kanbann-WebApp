const editCard = {
    template: `<div>
    <h1><b>Edit {{cardData.title}}</b></h1><br>
    <form action="" method="post" style="max-width: 45%" class="ms-2">
        <div class="form-floating pb-4">
            <input type="text" class="form-control" id="Cname" name="Cname" placeholder="Card Name"
                v-model="cardData.title" disabled>
            <label for="Cname">Card Name</label>
        </div>
        <div class="form-floating pb-3">
            <input type="text" class="form-control" id="content" name="content" placeholder="Content"
                style="height: 70px;" v-model="cardData.content" required>
            <label for="content">Content</label>
        </div>
        <div class="form-floating pb-4">
            <input type="datetime-local" name="deadline" id="time" class="form-control" placeholder="Deadline"
                v-model="cardData.deadline" required>
            <label for="time">Deadline</label>
        </div>
        <div>
            List Name:
            <select name="list_id" id="options">
                <option :value="list.list_id" :selected="list.list_id==cardData.list_id"
                    v-for="list in listData">{{list.name}} </option>
            </select>
        </div>
        <div class="form-check form-switch ms-1">
            <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault"
                v-model="cardData.flag">
            <label class="form-check-label" for="flexSwitchCheckDefault">Mark as completed</label>
        </div>
        <button @click.prevent='updateCard' type="submit" class="btn btn-success btn-lg">Submit</button>
        <router-link to="/" class="btn btn-secondary btn-lg mt-2">Cancel</router-link>
        <button @click.prevent='deleteCard' type="submit" class="btn btn-warning btn-lg mt-2"> 
            <i class="bi bi-trash3-fill"></i> Delete Card
        </button>
    </form>
    </div>`,
    data() {
        return {
            cardData: {
                title: '',
                content: '',
                deadline: '',
                flag: false
            },
            listData: {}
        }
    },
    methods: {
        async updateCard() {
            var select = document.getElementById('options');
            this.cardData['list_id'] = select.options[select.selectedIndex].value;
            if (this.check()) {
                const res = await fetch(`/api/card/${this.$route.params.lid}/${this.$route.params.cid}`,
                    {
                        method: 'put',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(this.cardData)
                    })
                if (res.status != 404) {
                    const data = await res.json()
                    if (res.ok) {
                        alert('Card details Updated')
                        return this.$router.push('/')
                    } else {
                        alert(data.error_message)
                    }
                }
                else {
                    alert('Card details not found')
                }
            }
        },
        deleteCard() {
            fetch(`/api/card/${this.$route.params.lid}/${this.$route.params.cid}`,
                { method: 'delete', headers: { "Content-Type": "application/json" } })
            alert('Card  Deleted successfully')
            return this.$router.push('/')
        },
        check() {
            var lname = document.getElementById("Cname").value
            var des = document.getElementById("content").value
            var dead = document.getElementById("time").value
            if (lname.length == 0) {
                alert('Please enter a Card title')
                return false
            }
            if (des.length == 0) {
                alert('Please enter a Card content')
                return false
            }
            if (dead.length == 0) {
                alert('Please provide a deadline')
                return false
            }
            return true
        }
    },
    async beforeMount() {
        if (!localStorage.login) {
            return this.$router.push('/login')
        }
        const res = await fetch(`/api/card/${this.$route.params.lid}`, { method: 'get' })
        if (res.ok) {
            fetch(`/api/list/${localStorage.getItem('Id')}`, { method: 'get' })
                .then(resp => resp.json())
                .then(da => this.listData = da)
            const data = await res.json()
            const card = data.filter(i => i.card_id == this.$route.params.cid)
            if (card.length == 0) {
                alert("Invalid Card details")
                return this.$router.push(`/`)
            }
            else {
                this.cardData = card[0]
            }
        } else {
            alert("Invalid List id")
            return this.$router.push('/')
        }
    }
}
export default editCard