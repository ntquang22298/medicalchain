<template>
  <div id="medical-records">
    <h3 class="mb-3">List of medical records</h3>
    <b-table
      selectable
      select-mode="single"
      striped
      hover
      v-bind:items="medical_records"
      v-bind:fields="fields"
      @row-selected="rowSelected"
    />
    <b-modal
      ref="myModalRef"
      size="lg"
      hide-footer
      v-bind:title="'Medical record ' + selected_item.id"
    >
      <div class="">
        <h4>Update new content</h4>
        <div>
          <b-form-textarea
            id="textarea1"
            v-model="new_content"
            placeholder="Enter new content"
            rows="3"
          />
        </div>
        <div class="mt-3 mb-2 text-right">
          <b-button variant="primary" @click="update_medical_record()">
            <b-spinner small v-if="is_waiting" variant="light" label="Spinning" />
            <span v-else>Update</span>
          </b-button>
        </div>
        <b-alert variant="danger" dismissible v-model="error">
          You don't have updating permissions in this medical record !
        </b-alert>
      </div>
      <div class="mt-3">
        <h4>History</h4>
        <b-table striped hover v-bind:items="histories_medical_record"/>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "medical-records",
  props: {
    medical_records: {
      type: Array
    }
  },
  data() {
    return {
      fields: ["id", "version", "content", "patientId"],
      histories_medical_record: [],
      selected_item: {
        id: ""
      },
      new_content: "Second visit: You have a flu",
      error: false,
      is_waiting: false
    };
  },
  methods: {
    rowSelected(items) {
      self = this;
      this.selected_item = items[0];

      this.$refs.myModalRef.show();
      let current_user = JSON.parse(localStorage.getItem("user"));
      this.$http
        .get("/api/practitioner/medicalrecord-details", {
          params: {
            data: {
              mr_id: items[0].id,
              pat_id: items[0].patientId,
              prac_id: items[0].practitionerId,
              cardname: current_user.id
            }
          }
        })
        .then(res => {
          self.histories_medical_record = res.body;
        });
    },
    update_medical_record() {
      self = this;
      this.is_waiting = true;
      let current_user = JSON.parse(localStorage.getItem("user"));
      let data = {
        medicalrecord_id: this.selected_item.id,
        prac_id: this.selected_item.practitionerId,
        content: this.new_content,
        cardname: current_user.id
      }
      this.$http.post("/api/practitioner/update-medical-record", data).then(res => {
        console.log(res);
        if(res.body.message == "success") {
          this.error = false;
          this.is_waiting = false;
          this.$refs.myModalRef.hide();
        }
        else {
          this.error = true;
          this.is_waiting = false;
        }
      })
    }
  }
};
</script>

<style>
</style>
