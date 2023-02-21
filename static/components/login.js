const login = {
    template: `    
    <div class="card" style="max-width: 45%">
    <link rel="stylesheet" href="../static/login.css">
        <div class="card-body">
            <h1><b>Sign In!</b></h1><br>
            <form action='' method="post">
                <div class="form-floating pb-4">
                    <input type="email" class="form-control" id="email" name="email" placeholder="Email"
                        v-model="formData.email" required>
                    <label for="email">Email</label>
                </div>
                <div class="form-floating pb-3">
                    <input type="password" class="form-control" id="pass" name="password" placeholder="Password"
                        v-model="formData.password" required>
                    <label for="pass">Password</label>
                </div>
                <button @click.prevent='loginUser' type="submit" class="btn btn-success btn-lg">Submit</button>
            </form>
            <p class="mt-3">
                Not a member? <router-link to="/signup">Create a new Account</router-link>
            </p>
        </div>
    </div>`,
    data() {
        return {
            formData: {
                email: "",
                password: ""
            }
        }
    },
    methods: {
        async loginUser() {
            if (this.check()) {
                const res = await fetch('/login', {
                    method: "post",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(this.formData)
                })
                const data = await res.json()
                if (res.ok) {
                    localStorage.setItem('email', this.formData.email);
                    localStorage.setItem('login', true);
                    localStorage.setItem('Id', data.id)
                    localStorage.setItem('user', this.formData.email.split('@')[0])
                    return this.$router.push('/')
                } else {
                    alert(data.message)
                }
            }
        },
        check() {
            var email = document.getElementById("email").value
            var p1 = document.getElementById("pass").value
            if (! /.+@.+\.com$/.test(email)) {
                alert("PLease provide a valid email")
                return false
            }
            if (email.length == 0) {
                alert('Please enter a email')
                return false
            }
            if (p1.length == 0) {
                alert('Please enter a password')
                return false
            }
            if (/ /.test(p1) || / /.test(email)) {
                alert("PLease remove space from email/password")
                return false
            }
            return true
        }
    }
}

export default login