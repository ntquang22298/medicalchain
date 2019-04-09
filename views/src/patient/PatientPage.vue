<template>
  <div id="patient">
    <div>
      <b-jumbotron header="Hi patient" lead="Have a good day!" class="m-0 my-jumb"></b-jumbotron>
    </div>
    <b-tabs content-class="mt-3" pills card>
      <b-tab title="Personal details" active>
        <personal-details v-bind:user_info="user_info"></personal-details>
      </b-tab>
      <b-tab title="Medical records">
        <medical-records v-bind:medical_records="medical_records"></medical-records>
      </b-tab>
      <b-tab title="Access management">
        <access-management :list_prac="list_prac"></access-management>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import PersonalDetails from "./PersonalDetails";
import MedicalRecords from "./MedicalRecords";
import AccessManagement from "./AccessManagement";

export default {
  name: "patient",
  components: {
    "personal-details": PersonalDetails,
    "medical-records": MedicalRecords,
    "access-management": AccessManagement
  },
  data() {
    return {
      user_info: {},
      medical_records: [],
      list_prac: []
    };
  },
  created() {
    this.fetchData();
  },
  watch: {
    $route: "fetchData"
  },
  methods: {
    fetchData() {
      self = this;
      let current_user = JSON.parse(localStorage.getItem("user"));
      this.$http.get("/api/patient/init", {params: {cardname: current_user.id}}).then(res => {
        self.user_info = res.body.user_info;
        self.medical_records = res.body.medical_records;
        self.list_prac = res.body.list_prac;
      })
    }
  }
};
</script>

<style>
.my-jumb {
  padding: 2rem 1rem !important;
}
</style>