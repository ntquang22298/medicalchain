<template>
  <div id="register" class="container">
    <div class="page-header">
      <h1 class="mb-4">REGISTER AN ACCOUNT</h1>
    </div>
    <div class="panel panel-primary">
      <div class="panel-body">
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
        <b-form-group
          id="cardname"
          label="Identity card number:"
          label-for="exampleInput1"
          description="This will be used for login page."
        >
          <b-form-input
            id="exampleInput1"
            v-model="user.cardname"
            required
            placeholder="Enter your identity card number"
          />
        </b-form-group>
        <b-form-group
          id
          label="Firstname:"
          label-for="exampleInput2"
        >
          <b-form-input
            id="exampleInput2"
            v-model="user.firstname"
            required
            placeholder="Enter your firstname"
          />
        </b-form-group>
        <b-form-group
          id
          label="Lastname:"
          label-for="exampleInput3"
        >
          <b-form-input
            id="exampleInput3"
            v-model="user.lastname"
            required
            placeholder="Enter your lastname"
          />
        </b-form-group>
        <b-form-group
          id
          label="Email:"
          label-for="exampleInput4"
        >
          <b-form-input
            id="exampleInput4"
            type="email"
            v-model="user.email"
            required
            placeholder="Enter your email"
          />
        </b-form-group>
        <div class="form-group">
          <b-alert variant="danger" dismissible v-model="error">
            Fail! Use another identity card number or check your information.
          </b-alert>
          <b-alert variant="success" dismissible v-model="success">
            Success! <router-link to="/login">Go to login page.</router-link>
          </b-alert>
          <button class="btn btn-primary btn-block" @click="register()">
            <b-spinner small v-if="is_waiting" variant="light" label="Spinning" />
            <span v-else>Register</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "register",
  data() {
    return {
      user: {
        cardname: "16020919",
        firstname: "Monkey D.",
        lastname: "Luffy",
        email: "luffy@onepieces.com"
      },
      type_user: "",
      error: false,
      success: false,
      is_waiting: false
    };
  },
  methods: {
    register() {
      self = this;
      console.log(self.user);
      this.is_waiting = true;
      if (this.type_user == "Patient") {
        this.$http.post("/api/register-patient", self.user).then(res => {
          console.log(res);
          if (res.body.message == "success") {
            self.success = true;
            self.error = false;
            self.is_waiting = false;
          }
          else {
            self.success = false;
            self.error = true;
            self.is_waiting = false;
          }
        })
      }
      if (this.type_user == "Practitioner") {
        this.$http.post("/api/register-practitioner", self.user).then(res => {
          console.log(res);
          if (res.body.message == "success") {
            self.success = true;
            self.error = false;
            self.is_waiting = false;
          }
          else {
            self.success = false;
            self.error = true;
            self.is_waiting = false;
          }
        })
      }
    }
  }
};
</script>

<style>
#register {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 700px;
  height: 500px;
  margin-top: 20px;
}
</style>
