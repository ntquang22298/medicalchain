<template>
  <div id="practitioner">
    <div>
      <b-jumbotron header="Hi doctor" lead="Have a good day!" class="m-0 my-jumb"></b-jumbotron>
    </div>
    <b-tabs content-class="mt-3" pills card>
      <b-tab title="Public profile" active>
        <public-profile v-bind:user_info="user_info"></public-profile>
      </b-tab>
      <b-tab title="Medical records">
        <medical-records v-bind:medical_records="medical_records"></medical-records>
      </b-tab>
      <b-tab title="List of patient">
        <list-patient v-bind:list_patient="list_patient"></list-patient>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import PublicProfile from './PublicProfile'
import MedicalRecords from "./MedicalRecords"
import ListPatient from "./ListPatient"

export default {
  name: "practitioner",
  components: {
    "public-profile": PublicProfile,
    "medical-records": MedicalRecords,
    "list-patient": ListPatient
  },
  data() {
    return {
      user_info: {},
      medical_records: [],
      list_patient: []
    }
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
      this.$http.get("/api/practitioner/init", {params: {cardname: current_user.id}}).then(res => {
        self.user_info = res.body.user_info;
        self.medical_records = res.body.medical_records;
        self.list_patient = res.body.list_patient;
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
