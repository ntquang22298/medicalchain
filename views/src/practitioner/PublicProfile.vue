<template>
  <div id="public-profile">
    <h3 class="mb-3">Public profile</h3>
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
          <b-form-input id="dob" v-model="user_info.dob" required/>
        </b-form-group>
      </div>
      <div class="col-md-4">
        <b-form-group label="Workplace:">
          <b-form-input id="city" v-model="user_info.workplace.name" required/>
        </b-form-group>
      </div>
      <div class="col-md-4">
        <b-form-group label="Qualifications:">
          <b-form-input id="street" v-model="user_info.qualifications" required/>
        </b-form-group>
      </div>
    </div>

    <div class="float-right mt-3">
      <b-button variant="success" @click="update()" >Update</b-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "public-profile",
  props: {
    user_info: {
      type: Object
    }
  },
  data: {},
  methods: {
    update: function() {
      self = this;

      this.$http.put("/api/practitioner", self.user_info).then(res => {
        if (res.body.message == "success") {

        }
      })
    }
  }
};
</script>

<style>
</style>
