<template>
  <div class="flo-sunburst-agents-stats">
    <v-card :outlined="outlined">
      <v-container fluid class="ma-0 pa-1">
        <v-row no-gutters>
          <v-col class="pa-1">
            <span v-if="showTitle" class="title font-weight-regular pa-1">{{ title }}</span>
            <floSunburstBasic :color_map="color_map" :chart="chartSetup" :unit="unit" :levels="levels" :rad_factor="levels * 2" :unique="unique" :key="`${unique}-${redrawChart}`" :minHeight="minHeight" :maxHeight="maxHeight" />
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import floSunburstBasic from "~/components/charts/floSunburstBasic";
export default {
  name: "flo-sunburst-agents-stats",
  components: {
    floSunburstBasic,
  },
  data: function () {
    return {
      redrawChart: 0,
      stats: [],
      agent_data: null,
      chartSetup: {
        groupBy: ["state", "name"],
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
          name: "connected",
          color: this.$vuetify.theme.currentTheme.success,
        },
        {
          name: "disconnected",
          color: this.$vuetify.theme.currentTheme.warning,
        },
        {
          name: "disabled",
          color: this.$vuetify.theme.currentTheme.pending,
        },
        {
          name: "broken",
          color: this.$vuetify.theme.currentTheme.error,
        },
      ],
    };
  },
  props: {
    paused: {
      type: Boolean,
      required: false,
    },
    unit: {
      type: String,
      required: false,
      default: "",
    },
    unique: {
      type: String,
      required: true,
    },
    type: {
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

      this.agent_data = l_cur.statistics.reduce((acc, data) => {
        if (data.stat.startsWith(`/agents/type/${this.type}/`)) {
          let [start, agents, type, type_val, name, name_val, enabled, enabled_val, state, state_val] = data.stat.split("/");
          acc.push({
            type: type_val.toLowerCase(),
            name: name_val.toLowerCase(),
            enabled: enabled_val.toLowerCase(),
            state: (!enabled_val ? "disabled" : state_val).toLowerCase(),
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
      if (!this.agent_data) {
        return;
      }

      this.stats = this.agent_data;
    },
  },
};
</script>
