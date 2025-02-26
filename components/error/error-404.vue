<template>
  <div class="error-404">
    <v-container fill-height>
      <v-layout justify-center align-center column>
        <v-card flat class="error-card">
          <v-row justify="center" align="center">
            <v-col cols="12" class="text-center">
              <v-icon large color="blue darken-2">mdi-emoticon-sad-outline</v-icon>
            </v-col>
            <v-col cols="12" class="text-center">
              <p class="display-2 font-weight-bold error-title">Error 404</p>
            </v-col>
            <v-col cols="12" class="text-center">
              <p class="headline grey--text lighten-2 mt-3">This page doesn't exist.</p>
            </v-col>
            <v-col cols="12" class="text-center">
              <p class="body-1 paragraph-text grey--text mx-2">The link may be broken or no longer exist.</p>
            </v-col>
          </v-row>
        </v-card>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "error-404",
  props: {
    error: {
      type: Object,
      default: () => {},
    },
  },
  beforeCreate() {
    this.$router.push({ name: "login" });
  },
};
</script>

<style scoped>
.error-card {
  padding: 40px;
  max-width: 600px;
}

.error-title {
  color: #2196f3;
}

.paragraph-text {
  color: #9e9e9e;
}

.v-icon {
  font-size: 64px;
  color: #2196f3;
}
</style>
