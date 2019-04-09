<template>
  <div id="app">
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand href="/">
        Merechain - Electronic medical record
      </b-navbar-brand>

      <b-navbar-toggle target="nav_collapse"/>

      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav class="ml-auto">
          <div v-if="user">
            <button class="btn btn-danger" @click="logout()">Log out</button>
          </div>
          <div v-else>
            <router-link to="/register">
              <button class="btn btn-success mr-2">Sign up</button>
            </router-link>
            <router-link to="/login">
              <button class="btn btn-primary">Sign in</button>
            </router-link>
          </div>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      user: null
    };
  },
  created() {
    if (localStorage.getItem("user")) {
      this.user = JSON.parse(localStorage.getItem("user"));
    }
  },
  methods: {
    logout() {
      self = this;
      localStorage.removeItem("user")
      self.$router.push('/login')
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
