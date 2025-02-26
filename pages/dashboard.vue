<template>
  <div>
    <flo-dash-default></flo-dash-default>
  </div>
</template>
<script>
export default {
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (localStorage.redirect) {
        vm.$router.push(localStorage.redirect);
        localStorage.removeItem("redirect");
      }
    });
  },
};
</script>
