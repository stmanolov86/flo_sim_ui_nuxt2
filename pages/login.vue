<template></template>
<script>
export default {
  beforeCreate() {
    this.$auth.loginWith("keycloak");
  },
};
</script>
