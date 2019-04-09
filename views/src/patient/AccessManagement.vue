<template>
  <div id="access-management">
    <div class="text-right">
      <b-button variant="success" @click="showGrantModal()">Grant new doctor</b-button>
    </div>
    <br>
    <h3 class="mb-3"> 
      List of granted doctor
    </h3>
    <div class="row m-0">
      <div v-for="prac in list_prac.list_authorized_prac" class="col-md-3 mb-1">
        <div class="p-3" style="background-color: #eee">
          <p class="m-1 title">{{ prac.firstname + " " + prac.lastname }}</p>
          <p class="m-0 info">{{ "ID: " + prac.id}}</p>
          <p class="m-0 info">{{ "Email: " + prac.email }}</p>
          <div class="mt-2 text-right">
            <b-button variant="danger" size="sm" @click="revoke(prac)">
              <b-spinner small v-if="is_waiting2" variant="light" label="Spinning" />
              <span v-else>Revoke</span>
            </b-button>
          </div>
        </div>
      </div>
    </div>
    <b-modal
      ref="grant_modal"
      size="md"
      hide-footer
      title="Grant new doctor"
    >
      <div class="row">
        <div class="col-md-12 mb-2" v-for="prac in list_prac.list_unauthorized_prac">
          <div class="p-2" style="background-color: #eee">
            <p class="m-1 title">
              {{ prac.firstname + " " + prac.lastname}}
            </p>
            <p class="m-0 info">{{ "ID: " + prac.id}}</p>
            <p class="m-0 info">{{ "Email: " + prac.email }}</p>
            <div class="mt-2 text-right">
              <b-button variant="success" size="sm" @click="grant_new(prac)">
                <b-spinner small v-if="is_waiting" variant="light" label="Spinning" />
                <span v-else>Grant</span>
              </b-button>
            </div>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "access-management",
  props: {
    list_prac: {
      type: Object
    }
  },
  data() {
    return {
      is_waiting: false,
      is_waiting2: false
    }
  },
  methods: {
    showGrantModal() {
      this.$refs.grant_modal.show();
    },
    grant_new(prac) {
      self = this;
      this.is_waiting = true;
      let current_user = JSON.parse(localStorage.getItem("user"));
      
      this.$http.post("/api/grant-access-medical-record", {
        pat_id: current_user.id,
        prac_id: prac.id
      }).then((res) => {
        if (res.body.message == "success") {
          self.list_prac.list_authorized_prac.push(prac);

          for (var i = 0; i < self.list_prac.list_unauthorized_prac.length ; i++) {
            if (self.list_prac.list_unauthorized_prac[i].id == prac.id) {
              self.list_prac.list_unauthorized_prac.splice(i, 1);
            }
          }
          self.is_waiting = false;
          this.$refs.grant_modal.hide();
        }
        else {
          self.is_waiting = false;
        }
      }).catch((err) => {
        
      });
    },
    revoke(prac) {
      self = this;
      this.is_waiting2 = true;
      let current_user = JSON.parse(localStorage.getItem("user"));
      
      this.$http.post("/api/revoke-access-medical-record", {
        pat_id: current_user.id,
        prac_id: prac.id
      }).then((res) => {
        if (res.body.message == "success") {
          self.list_prac.list_unauthorized_prac.push(prac);
          for (var i = 0; i < self.list_prac.list_authorized_prac.length ; i++) {
            if (self.list_prac.list_authorized_prac[i].id == prac.id) {
              self.list_prac.list_authorized_prac.splice(i, 1);
            }
          }
        }
        self.is_waiting2 = false;
      }).catch((err) => {
        self.is_waiting2 = false;
      });
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
  color:gray;
}
</style>
