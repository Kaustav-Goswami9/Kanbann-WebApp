const editList = {
    template: `<div>
    <h1><b>Edit {{formData.name}}</b></h1><br>
    <form action="" method="post" style="max-width: 50%;">
        <div class="form-floating pb-4">
            <input type="text" class="form-control" id="Lname" name="Lname" placeholder="List Name"
                v-model="formData.name" disabled>
            <label for="Lname">List Name</label>
        </div>
        <div class="form-floating pb-3">
            <input type="text" class="form-control" id="desc" name="description" placeholder="Description"
                style="height: 70px;" v-model="formData.description" required>
            <label for="desc">Description</label>
        </div>
        <button @click.prevent='updateList' type="submit" class="btn btn-success btn-lg mt-2">Submit</button>
        <router-link to="/" class="btn btn-secondary btn-lg mt-2">Cancel</router-link>
        <button @click.prevent='deleteList' class="btn btn-warning btn-lg mt-2"> 
            <i class="bi bi-trash3-fill"></i> Delete List
        </button>
    </form>
    </div>`,
    data() {
        return {
            formData: {
                name: '',
                description: ''
            }
        }
    },
    methods: {
        async updateList() {
            if (this.check()) {
                const res = await fetch(`/api/list/${localStorage.getItem('Id')}/${this.$route.params.lid}`,
                    {
                        method: 'PUT',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(this.formData)
                    })
                if (res.status != 404) {
                    const data = await res.json()
                    if (res.ok) {
                        alert('List details Updated')
                        return this.$router.push('/')
                    } else {
                        alert(data.error_message)
                    }
                }
                else {
                    alert('List details not found')
                }
            }
        },
        async deleteList() {
            const card_list_res = await fetch(`/api/card/${this.$route.params.lid}`,
                { method: 'get', headers: { "Content-Type": "application/json" } })
            const card_list_len = (await card_list_res.json()).length
            if (card_list_len == 0 || (card_list_len != 0 && confirm("This List has cards. Delete this List"))) {
                fetch(`/api/list/${localStorage.getItem('Id')}/${this.$route.params.lid}`,
                    { method: 'delete', headers: { "Content-Type": "application/json" } })
                alert('List Deleted successfully')
                return this.$router.push('/')
            }
        },
        check() {
            var lname = document.getElementById("Lname").value
            var des = document.getElementById("desc").value
            if (lname.length == 0) {
                alert('Please enter a List name')
                return false
            }
            if (des.length == 0) {
                alert('Please enter a Description')
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
            this.formData.name = list[0].name
            this.formData.description = list[0].description
        }
    }
}
export default editList