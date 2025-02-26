<template>
  <v-container fluid class="flo-sunburst-hsm-keys ma-0 pa-0">
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
                <v-col class="pa-1"><floSunburstBasic :chart="chartSetup" :unit="unit" :levels="levels" :rad_factor="levels * 2" :unique="unique" :key="redrawChart" :minHeight="minHeight" :maxHeight="maxHeight" /> </v-col>
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
  name: "flo-sunburst-hsm-keys",
  data: () => ({
    redrawChart: 0,
    hsms_keys: null,
    stats: [],
    chartSetup: {
      groupBy: ["name", "status", "key_type"],
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
      default: 2,
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

      this.hsms_keys = l_cur.statistics.reduce((acc, data) => {
        if (data.stat.startsWith("/hsm/")) {
          let [start, hsm, hsm_val, name, hsm_name, keys, type, type_val, status, status_val] = data.stat.split("/");
          acc.push({
            name: hsm_name.toLowerCase(),
            status: status_val.toLowerCase(),
            key_type: type_val.toLowerCase(),
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
      if (!this.hsms_keys) {
        return;
      }

      this.stats = this.hsms_keys;
    },
  },
};
</script>
