const addCard = {
    template: `<div>
    <h1><b>Add a new Card to {{list_name}} List</b></h1><br>
    <form action="" method="post" style="max-width: 45%" class="ms-2">
        <div class="form-floating pb-4">
            <input type="text" class="form-control" id="Cname" name="Cname" placeholder="Card Name"
                v-model="formData.title" required>
            <label for="Cname">Card Name</label>
        </div>
        <div class="form-floating pb-3">
            <input type="text" class="form-control" id="content" name="content" placeholder="Content"
                style="height: 70px;" v-model="formData.content" required>
            <label for="content">Content</label>
        </div>
        <div class="form-floating pb-4">
            <input type="datetime-local" name="deadline" id="time" class="form-control" placeholder="Deadline"
                v-model="formData.deadline" required>
            <label for="time">Deadline</label>
        </div>
        <div class="form-check form-switch ms-1">
            <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault"
                v-model="formData.flag">
            <label class="form-check-label" for="flexSwitchCheckDefault">Mark as completed</label>
        </div>
        <button @click.prevent='newCard' type="submit" class="btn btn-success btn-lg">Submit</button>
        <a href="/" class="btn btn-secondary btn-lg">Cancel</a>
    </form>
    </div>`,
    data() {
        return {
            formData: {
                title: '',
                content: '',
                deadline: '',
                flag: false
            },
            list_name: ''
        }
    },
    methods: {
        async newCard() {
            if (this.check()) {
                const res = await fetch(`/api/card/${this.$route.params.lid}`,
                    {
                        method: 'post',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(this.formData)
                    })
                if (res.status != 409) {
                    const data = await res.json()
                    if (res.ok) {
                        alert('New Card Created')
                        return this.$router.push('/')
                    } else {
                        alert(data.error_message)
                    }
                }
                else {
                    alert('Please use a different Card title')
                }
            }
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
        const res = await fetch(`/api/list/${localStorage.getItem('Id')}`,
            { method: 'get', headers: { "Content-Type": "application/json" } })
        const data = await res.json()
        const list = data.filter(i => i.list_id == this.$route.params.lid)
        if (list.length == 0) {
            alert("Invalid list details")
            return this.$router.push('/')
        } else {
            this.list_name = list[0].name
        }
    }
}

export default addCard