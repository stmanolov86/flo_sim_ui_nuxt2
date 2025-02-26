<template>
  <div class="error-other">
    <v-container fluid fill-height>
      <v-layout justify-center align-center column>
        <v-card flat class="error-card">
          <v-row justify="center" align="center">
            <v-col cols="12" class="text-center">
              <v-icon large color="red darken-2">mdi-alert-octagon-outline</v-icon>
            </v-col>
            <v-col cols="12" class="text-center">
              <p class="display-2 font-weight-bold error-status">{{ error.statusCode }}</p>
            </v-col>
            <v-col cols="12" class="text-center">
              <p class="headline error-message">{{ error.message || "An unexpected error occurred." }}</p>
            </v-col>
          </v-row>
        </v-card>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "error-other",
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

.error-status {
  color: #e53935;
}

.error-message {
  color: #757575;
}

.v-icon {
  font-size: 64px;
  color: #e53935;
}
</style>
