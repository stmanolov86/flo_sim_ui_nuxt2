<template>
  <v-container fluid class="flo-sunburst-messages ma-0 pa-0">
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
                <v-col class="pa-1">
                  <floSunburstBasic :chart="chartSetup" :unit="unit" :levels="levels" :rad_factor="6" :unique="unique" :key="redrawChart" :minHeight="minHeight" :maxHeight="maxHeight" />
                </v-col>
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
  name: "flo-sunburst-messages",
  data: () => ({
    redrawChart: 0,
    messages: null,
    stats: [],
    chartSetup: {
      groupBy: ["dir", "mtype", "code"],
      valueBy: "value",
      area: {
        margin: { left: 0, bottom: 0, right: 0, top: 0 },
        width: 0,
        height: 0,
      },
      data: [],
      series: [],
    },
  }),
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

      this.messages = l_cur.statistics.reduce((acc, data) => {
        if (data.stat.startsWith("/smss/dir/")) {
          let [start, smss, dir, dir_val, mtype, mtype_val, code, code_val] = data.stat.split("/");
          acc.push({
            dir: (dir_val == "O" ? "Out" : "In").toLowerCase(),
            mtype: mtype_val.toLowerCase(),
            code: code_val.toLowerCase(),
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
      if (!this.messages) {
        return;
      }

      this.stats = this.messages;
    },
  },
};
</script>
