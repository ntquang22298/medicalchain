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
      v-bind:title="'History of medical record ' + selected_item.id"
    >
      <b-table striped hover v-bind:items="histories_medical_record"/>
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
      fields: ["id", "version", "content", "creatorId"],
      histories_medical_record: [],
      selected_item: {
        id: ""
      }
    };
  },
  methods: {
    rowSelected(items) {
      self = this;
      this.selected_item = items[0];

      this.$refs.myModalRef.show();

      let current_user = JSON.parse(localStorage.getItem("user"));
      this.$http
        .get("/api/patient/medicalrecord-details", {
          params: {
            data: {
              mr_id: items[0].id,
              pat_id: items[0].ownerId,
              prac_id: items[0].creatorId
            },
            cardname: current_user.id
          }
        })
        .then(res => {
          self.histories_medical_record = res.body;
        });
    }
  }
};
</script>

<style>
</style>
