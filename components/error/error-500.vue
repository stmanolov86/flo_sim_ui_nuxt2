<template>
  <div class="error-500">
    <v-container fluid fill-height>
      <v-layout justify-center align-center>
        <v-card flat class="error-card">
          <v-row justify="center">
            <v-col cols="12" class="text-center">
              <v-icon large color="red darken-2">mdi-alert-octagon-outline</v-icon>
            </v-col>
            <v-col cols="12" class="text-center">
              <p class="display-2 font-weight-medium error-title">500 - Internal Server Error</p>
            </v-col>
            <v-col cols="12" class="text-center">
              <p class="headline error-message">Something went wrong. Please try again later.</p>
            </v-col>
            <v-col cols="12" class="text-center">
              <p class="caption mt-3">If the issue persists, kindly report it to the R&D team.</p>
            </v-col>
          </v-row>
        </v-card>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "error-500",
  props: {
    error: {
      type: Object,
      default: () => {},
    },
  },
};
</script>

<style scoped>
.error-card {
  padding: 40px;
  max-width: 600px;
}

.error-title {
  color: #f53838;
}

.error-message {
  color: #757575;
}

.caption {
  color: #9e9e9e;
}

.v-icon {
  font-size: 64px;
}
</style>
