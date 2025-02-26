<template>
  <div class="error-other">
    <v-container fluid fill-height>
      <v-layout justify-center align-center column>
        <v-card flat class="error-card">
          <v-row justify="center" align="center">
            <v-col cols="12" class="text-center">
              <v-icon large color="red darken-2">mdi-timer-sand-empty</v-icon>
            </v-col>
            <v-col cols="12" class="text-center">
              <p class="display-2 font-weight-bold error-status">504 - Gateway Timeout</p>
            </v-col>
            <v-col cols="12" class="text-center">
              <p class="headline grey--text lighten-2 error-message">The server took too long to respond. Please try again later.</p>
            </v-col>
            <v-col cols="12" class="text-center">
              <v-btn outlined large color="info" @click="tryAgain">Try Again</v-btn>
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
  methods: {
    tryAgain() {
      this.$router.go(0);
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

.v-btn {
  font-weight: bold;
  padding: 12px 24px;
}

.v-icon {
  font-size: 64px;
  color: #e53935;
}
</style>
