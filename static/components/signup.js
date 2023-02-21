const signup = {
    template: `    
    <div class="card shadow" style="max-width: 45%">
    <link rel="stylesheet" href="../static/login.css">
        <div class="card-body">
            <h1><b>Enter your Credentials!</b></h1><br>
            <form action="" method="post">
                <div class="form-floating pb-4">
                    <input type="email" class="form-control" id="email" name="email" placeholder="Enter your email"
                    v-model="formData.email" required>
                    <label for="email">Enter your email</label>
                </div>
                <div class="form-floating pb-3">
                    <input type="password" class="form-control" id="pass" name="password"
                        placeholder="Enter your password" v-model="formData.password" required>
                    <label for="pass">Enter your password</label>
                </div>
                <div class="form-floating pb-3">
                    <input type="password" class="form-control" id="pass1" name="password1"
                        placeholder="Re-Enter password" required>
                    <label for="pass1">Re-Enter your password</label>
                </div>
                <button type="submit" @click.prevent='signupUser' class="btn btn-dark btn-lg pb-3 mt-2">Submit</button>
            </form>
            Already have a Account? <router-link to="/"> Login Here</router-link>
        </div>
    </div>`,
    data() {
        return {
            formData: {
                email: '',
                password: ''
            }
        }
    },
    methods: {
        async signupUser() {
            if (this.check()) {
                const res = await fetch('/api/user', {
                    method: "post",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(this.formData)
                })
                if (res.status != 409) {
                    const data = await res.json()
                    if (res.ok) {
                        alert('Account created. Please Login now')
                        return this.$router.push('/login')
                    } else {
                        alert(data.error_message)
                    }
                }
                else {
                    alert('Please use a different email')
                }
            }
        },
        check() {
            var email = document.getElementById("email").value
            var p1 = document.getElementById("pass").value
            var p2 = document.getElementById("pass1").value
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
            if (/ /.test(p1) || / /.test(p2) || / /.test(email)) {
                alert("PLease remove space from email/password")
                return false
            }
            if (p1 == p2) {
                return true
            } else {
                alert("Passwords does not match")
                return false
            }
        }
    }
}

export default signup