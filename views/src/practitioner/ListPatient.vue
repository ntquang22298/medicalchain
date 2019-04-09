<template>
  <div id="list-patient">
    <h3 class="mb-3">List of patient</h3>
    <div class="row m-0">
      <div v-for="patient in list_patient" class="col-md-3 mb-1">
        <div class="p-3" style="background-color: #eee">
          <p class="m-1 title">{{ patient.firstname + " " + patient.lastname }}</p>
          <p class="m-0 info">{{ "ID: " + patient.owner.split("#").slice(-1)[0]}}</p>
          <p class="m-0 info">{{ "Email: " + patient.email }}</p>
          <div class="mt-2 text-right">
            <b-button variant="success" size="sm" @click="show_modal(patient)">
              Create medical record
            </b-button>
          </div>
        </div>
      </div>
    </div>
    <b-modal
      ref="modal"
      hide-footer
      title="Create medical record"
    >
      <div class="p-3">
        <b-row>
          <b-col md="3">
            <p>Patient ID: </p>
          </b-col>
          <b-col md="9">
            <p>{{ (selected_patient.owner) ? selected_patient.owner.split("#").slice(-1)[0] : "" }}</p>
          </b-col>
          <b-col md="3">
            <p>Content: </p>
          </b-col>
          <b-col md="9">
            <b-form-textarea
              id="textarea1"
              v-model="new_content"
              placeholder="Enter new content"
              rows="3"
            />
          </b-col>
        </b-row>
        <div class="mt-3 mb-2 text-right">
          <b-alert variant="danger" dismissible v-model="error">
            Error !
          </b-alert>
          <b-button variant="primary" @click="create_new_medicalrecord()">
            <b-spinner small v-if="is_waiting" variant="light" label="Spinning" />
            <span v-else>Create</span>
          </b-button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "list-patient",
  props: {
    list_patient: {
      type: Array
    }
  },
  data() {
    return {
      selected_patient: {},
      new_content: "First visit: You are overweight",
      is_waiting: false,
      error: false
    }
  },
  methods: {
    show_modal(patient) {
      this.selected_patient = patient;
      this.$refs.modal.show();
    },
    create_new_medicalrecord() {
      this.is_waiting = true;
      let current_user = JSON.parse(localStorage.getItem("user")) 
      let data = {
        prac_id: current_user.id,
        pat_id: this.selected_patient.owner.split("#").slice(-1)[0],
        content: this.new_content,
        cardname: current_user.id
      } 
      self = this;
      this.$http.post("/api/practitioner/create-medical-record", data).then(res => {
        if (res.body.message == "success") {
          self.is_waiting = false;
          self.error = false;
          self.$refs.modal.hide();
        }
        else {
          self.error = false;
          self.is_waiting = false;
        }
      })
    }
  } 
}
</script>

<style>
.title {
  font-size: 22px;
  font-weight: 700;
}

.info {
  font-size: 14px;
  font-weight: 300;
  color: gray;
}
</style>
