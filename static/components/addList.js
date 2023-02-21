const addList = {
    template: `<div>
    <h1><b>Create a new List</b></h1><br>
    <form action="" method="post" style="max-width: 50%;">
        <div class="form-floating pb-4">
            <input type="text" class="form-control" id="Lname" name="Lname" placeholder="List Name"
                v-model="formData.list_name" required>
            <label for="Lname">List Name</label>
        </div>
        <div class="form-floating pb-3">
            <input type="text" class="form-control" id="desc" name="description" placeholder="Description"
                style="height: 70px;" v-model="formData.description" required>
            <label for="desc">Description</label>
        </div>
        <button @click.prevent='newList' type="submit" class="btn btn-success btn-lg mt-2">Submit</button>
        <a href="/" class="btn btn-secondary btn-lg mt-2">Cancel</a>
    </form>
    </div>`,
    data() {
        return {
            formData: {
                list_name: '',
                description: ''
            }
        }
    },
    methods: {
        async newList() {
            if (this.check()) {
                const res = await fetch(`/api/list/${localStorage.getItem('Id')}`,
                    {
                        method: 'post',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(this.formData)
                    })
                if (res.status != 409) {
                    const data = await res.json()
                    if (res.ok) {
                        alert('New List Created')
                        return this.$router.push('/')
                    } else {
                        alert(data.error_message)
                    }
                }
                else {
                    alert('Please use a different list name')
                }
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
    beforeCreate() {
        if (!localStorage.login) {
            return this.$router.push('/login')
        }
    }
}

export default addList