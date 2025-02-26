<template>
  <div class="error-resource">
    <v-container fluid fill-height>
      <v-layout justify-center align-center column>
        <v-card flat class="error-card">
          <v-row justify="center" align="center">
            <v-col cols="12" class="text-center">
              <v-icon large color="orange darken-2">mdi-database-off</v-icon>
            </v-col>
            <v-col cols="12" class="text-center">
              <p class="display-2 font-weight-bold error-title">No {{ resource }} data available</p>
            </v-col>
            <v-col cols="12" class="text-center">
              <p class="headline grey--text lighten-2 mt-3">Redirecting to {{ resource }}s screen in {{ countdown }}s...</p>
            </v-col>
            <v-col cols="12" class="text-center">
              <v-btn outlined large color="info" @click="backTo()">Back to {{ resource }}s</v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "error-resource",
  props: {
    error: {
      type: Object,
      default: () => {},
    },
    path: {
      type: String,
      required: true,
      default: "/dashboard",
    },
    resource: {
      type: String,
      required: true,
      default: "resource",
    },
  },
  data: () => ({
    timer: null,
    countdown: 5,
  }),
  created() {
    console.log(`Error loading resource ${this.resource} - redirecting to ${this.path}`);

    this.timer = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        this.backTo();
      }
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    backTo() {
      this.$router.push({ path: this.path });
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
  color: #ff9800;
}

.v-icon {
  font-size: 64px;
  color: #ff9800;
}
</style>
