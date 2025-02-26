<template>
  <div class="flo-dash-default">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col cols="12" lg="3" class="pa-1">
          <flo-alerts-timeline></flo-alerts-timeline>
        </v-col>

        <v-col cols="12" lg="9">
          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-dashboard-stats></flo-dashboard-stats>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
export default {
  head() {
    return {
      title: "Dashboard",
    };
  },
};
</script>
