<template>
  <div id="login" class="container">
    <div class="page-header">
      <h1>Login</h1>
    </div>
    <div class="panel panel-primary">
      <div class="panel-body">
        <div class="form-group">
          <!-- <div class="input-group-prepend">
              <span class="input-group-text">
                <i class="fa fa-lock"></i>
              </span>
          </div>-->
          <input
            type="idcard"
            class="form-control"
            id="cardname"
            placeholder="Enter your identity card number"
            v-model="cardname"
            required
          >
        </div>
        <b-form-group label="You are ...">
          <b-form-radio-group
            id="radio-slots"
            v-model="type_user"
            name="radioOptionsSlots"
            required
          >
            <b-form-radio value="Patient">Patient</b-form-radio>
            <b-form-radio value="Practitioner">Doctor</b-form-radio>
          </b-form-radio-group>
        </b-form-group>
        <div class="form-group">
          <b-alert variant="danger" dismissible v-model="error">
            Login fail ! Check your identity card number.
          </b-alert>
          <button class="btn btn-primary btn-block" @click="login()">
            <b-spinner small v-if="is_logging_in" variant="light" label="Spinning" />
            <span v-else>Login</span>
          </button>
        </div>
        <p class="text-center">
          Not registered?
          <router-link to="/register">Create an account</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      cardname: "",
      type_user: "",
      is_logging_in: false,
      error: false
    };
  },
  methods: {
    login() {
      self = this;
      this.is_logging_in = true;
      this.$http
        .post("/api/login", {
          cardname: this.cardname,
          type_user: this.type_user
        })
        .then(res => {
          console.log(res);
          if (res.body.message == "success") {
            self.error = false
            let arr = res.body.user["$class"].split(".");
            let type = arr[arr.length - 1]
            let user = {
              "id": res.body.user.id,
              "type": type
            }
            console.log(user);
            localStorage.setItem('user', JSON.stringify(user));
            self.is_logging_in = false;
            if (user.type == "Patient") {
              self.$router.push('patient') 
            }
            if (user.type == "Practitioner") {
              self.$router.push("practitioner")
            }
          }
          else {
            self.is_logging_in = false;
            self.error = true;
          }
        });
    }
  }
};
</script>

<style>
#login {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 500px;
  height: 500px;
  margin-top: 20px;
}
</style>
