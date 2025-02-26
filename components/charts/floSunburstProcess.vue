<template>
  <v-container fluid class="flo-sunburst-orders ma-0 pa-0">
    <v-row no-gutters>
      <v-col>
        <v-card flat :outlined="outlined" class="mx-auto ma-0 pa-0">
          <v-container v-if="showTitle" fluid class="ma-1 pa-1">
            <v-row no-gutters align="start" justify="start">
              <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
                <p class="title font-weight-regular text-capitalize ma-0 pa-0">{{ title }}</p>
              </v-col>
            </v-row>
          </v-container>
          <v-card-text class="ma-0 pa-0">
            <v-card flat>
              <v-row no-gutters>
                <v-col class="pa-1"><floSunburstBasic :color_map="color_map" :chart="chartSetup" :unit="unit" :levels="levels" :rad_factor="levels * 2" :unique="unique" :key="redrawChart" :minHeight="minHeight" :maxHeight="maxHeight" /> </v-col>
              </v-row>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import floSunburstBasic from "~/components/charts/floSunburstBasic";
export default {
  name: "flo-sunburst-process",
  data: function () {
    return {
      redrawChart: 0,
      process: null,
      stats: [],
      chartSetup: {
        groupBy: ["state", "worker"],
        valueBy: "value",
        area: {
          margin: { left: 0, bottom: 0, right: 0, top: 0 },
          width: 0,
          height: 0,
        },
        data: [],
        series: [],
      },
      color_map: [
        {
          name: "ready",
          color: this.$vuetify.theme.currentTheme.success,
        },
        {
          name: "idle",
          color: this.$vuetify.theme.currentTheme.pending,
        },
        {
          name: "start",
          color: this.$vuetify.theme.currentTheme.pending,
        },
        {
          name: "online",
          color: this.$vuetify.theme.currentTheme.pending,
        },
        {
          name: "exit",
          color: this.$vuetify.theme.currentTheme.warning,
        },
        {
          name: "disconnect",
          color: this.$vuetify.theme.currentTheme.warning,
        },
        {
          name: "execption",
          color: this.$vuetify.theme.currentTheme.error,
        },
      ],
    };
  },
  props: {
    unit: {
      type: String,
      required: false,
      default: "",
    },
    unique: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    chart: {
      type: Object,
      required: false,
      default: null,
    },
    outlined: {
      type: Boolean,
      required: false,
      default: true,
    },
    chartData: {
      type: Array,
      required: false,
      default: () => [],
    },
    minHeight: {
      type: String,
      required: false,
      default: "443px",
    },
    maxHeight: {
      type: String,
      required: false,
      default: "443px",
    },
    showTitle: {
      type: Boolean,
      required: false,
      default: true,
    },
    smallIcon: {
      type: Boolean,
      required: false,
      default: false,
    },
    levels: {
      type: Number,
      required: false,
      default: 3,
    },
    marker: {
      type: Number,
      required: false,
      default: 0,
    },
    dashboard: {
      type: Object,
      required: false,
      default: null,
    },
  },
  components: {
    floSunburstBasic,
  },
  watch: {
    marker: function () {
      this.onMarkerChanged();
    },
  },
  created() {
    if (this.dashboard != null && this.dashboard.hasOwnProperty("data")) {
      if (this.dashboard.data.length > 0) {
        let last = this.dashboard.data.slice(-1);
        this.onDashboardChange(last[0]);
      }
    }
    this.syncChartData();
  },
  methods: {
    onMarkerChanged() {
      let l_dashboard = this.dashboard;
      if (!l_dashboard) {
        return;
      }

      if (l_dashboard.hasOwnProperty("data")) {
        if (l_dashboard.data.length > 0) {
          let last = l_dashboard.data.slice(-1);
          this.onDashboardChange(last[0]);
        }
      }
    },
    onDashboardChange(p_change) {
      let l_cur = p_change;
      if (!l_cur) {
        return;
      }
      if (!l_cur.hasOwnProperty("statistics")) {
        return;
      }
      if (!l_cur.statistics) {
        return;
      }

      this.process = l_cur.statistics.reduce((acc, data) => {
        if (data.stat.startsWith("/process/workers/count/")) {
          // /process/workers/count/worker/${l_ctrl_worker_info.type.toLowerCase()}/state/${l_ctrl_worker_info.state.toLowerCase()}
          let [_p0, _p1, _p2, _p3, _p4, worker, _p5, wid, _p6, state] = data.stat.split("/");
          acc.push({
            worker: worker,
            wid: wid,
            state: state,
            value: data.value,
          });
        }

        return acc;
      }, []);

      this.recalculateMetrics();
      this.syncChartData();
      this.redrawChart++;
    },
    syncChartData() {
      this.recalculateMetrics();
      this.chartSetup.data = this.stats;
    },
    recalculateMetrics() {
      if (!this.process) {
        return;
      }

      this.stats = this.process;
    },
  },
};
</script>
