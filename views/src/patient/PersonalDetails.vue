<template>
  <div id="personal-details">
    <h3 class="mb-3">Personal details</h3>
    <div class="row">
      <div class="col-md-4">
        <b-form-group label="First name:">
          <b-form-input id="firstname" v-model="user_info.firstname" required/>
        </b-form-group>
      </div>
      <div class="col-md-4">
        <b-form-group label="Last name:">
          <b-form-input id="lastname" v-model="user_info.lastname" required/>
        </b-form-group>
      </div>
      <div class="col-md-4">
        <b-form-group label="Email">
          <b-form-input id="email" type="email" v-model="user_info.email" required/>
        </b-form-group>
      </div>
      <div class="col-md-4">
        <b-form-group label="Date of birth:">
          <b-form-input id="dob" v-model="user_info.Dob" required/>
        </b-form-group>
      </div>
      <div class="col-md-4">
        <b-form-group label="City:">
          <b-form-input id="city" v-model="user_info.address.city" required/>
        </b-form-group>
      </div>
      <div class="col-md-4">
        <b-form-group label="Street:">
          <b-form-input id="street" v-model="user_info.address.street" required/>
        </b-form-group>
      </div>
    </div>

    <div class="float-right mt-3">
      <b-button variant="success" @click="update()" >
        <b-spinner small v-if="is_waiting" variant="light" label="Spinning" />
        <span v-else>Update</span>
      </b-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "personal-details",
  props: {
    user_info: {
      type: Object
    }
  },
  data() {
    return {
      is_waiting: false
    }
  },
  methods: {
    update: function() {
      self = this;
      this.is_waiting = true;
      let current_user = JSON.parse(localStorage.getItem("user"));
      let data = {
        cardname: current_user.id,
        user_info: self.user_info
      }
      this.$http.put("/api/patient", data).then(res => {
        if (res.body.message == "success") {
          this.is_waiting = false;
        }
      })
    }
  }
};
</script>

<style>
</style>
