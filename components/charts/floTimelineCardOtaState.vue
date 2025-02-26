<template>
  <v-container fluid class="flo-timeline-card-ota-state ma-0 pa-0">
    <v-row no-gutters>
      <v-col>
        <floTimelineStats v-if="!loading" :live="live" :x_value_by="x_value_by" :y_value_by="y_value_by" :y_axis_name="get_y_axis_name()" :x_axis_name="get_x_axis_name()" :levels="levels" :values="values" :title="title" :unique="unique" :type="type" :start="start" :end="end" :l1="l1" :l2="l2" :resolution="resolution" :aggregate="aggregate" :outlined="outlined" :min-height="minHeight" :max-height="maxHeight" :groupby="groupby" :where="where" />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import floTimelineStats from "~/components/charts/floTimelineStats";
import DateUtils from "~/src/dateUtils.js";
export default {
  name: "flo-timeline-card-ota-state",
  data: () => ({
    groupby: ["l1", "l2"],
    where: [],
    levels: [
      { level: 1, key: "l1", field: "ota_state", name: "OTA State" },
      { level: 2, key: "l2", field: "scp_state", name: "SCP State" },
    ],
    x_value_by: "sts",
    y_value_by: "value",
    values: [],
    loading: true,
    aggregate: "sum",
    unit: "Cards",
  }),
  components: {
    floTimelineStats,
  },
  props: {
    title: {
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
      required: false,
      default: "bar",
    },
    start: {
      type: String,
      required: false,
      default: "",
    },
    end: {
      type: String,
      required: false,
      default: "",
    },
    l1: {
      type: String,
      required: false,
      default: null,
    },
    l2: {
      type: String,
      required: false,
      default: null,
    },
    resolution: {
      type: String,
      required: false,
      default: "toStartOfThirtySecond",
    },
    live: {
      type: Boolean,
      required: false,
      default: false,
    },
    outlined: {
      type: Boolean,
      required: false,
      default: true,
    },
    minHeight: {
      type: String,
      required: false,
      default: "440px",
    },
    maxHeight: {
      type: String,
      required: false,
      default: "440px",
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
    this.initialize();
  },
  methods: {
    onMarkerChanged() {
      let l_dashboard = this.dashboard;
      if (!l_dashboard) {
        return;
      }

      if (l_dashboard.hasOwnProperty("data")) {
        if (l_dashboard.data.length > 0) {
          this.onDashboardChange(l_dashboard);
        }
      }
    },
    onDashboardChange(p_dashboard) {
      if (!p_dashboard.hasOwnProperty("data")) {
        return;
      }

      let l_dashboard_card_ota_state = [];
      let l_dashboard_data = p_dashboard.data;
      // let l_unit = "Cards";
      for (let i = 0; i < l_dashboard_data.length; i++) {
        const l_data = l_dashboard_data[i];

        if (!l_data.hasOwnProperty("statistics")) {
          continue;
        }

        let l_card_ota_state = l_data.statistics.reduce((acc, data) => {
          if (data.stat.startsWith("/cards/ota_state/")) {
            // if ("" == l_unit) {
            //   l_unit = data.unit;
            // }
            let [start, cards, ota_state, ota_state_val, scp_state, scp_state_val] = data.stat.split("/");
            acc.push({
              ota_state: ota_state_val,
              scp_state: scp_state_val,
              value: data.value,
              sts: data.sts,
            });
          }
          return acc;
        }, []);

        l_dashboard_card_ota_state = l_dashboard_card_ota_state.concat(l_card_ota_state);
      }
      // this.unit = l_unit;
      this.values = l_dashboard_card_ota_state;
    },
    get_y_axis_name() {
      // let r = DateUtils.get_resolution_by_func_name(this.resolution);
      let l_message = "";
      if ("" != this.unit) {
        l_message += `${this.unit} `;
      }
      l_message += `(${this.aggregate})`;
      return l_message;
    },
    get_x_axis_name() {
      let r = DateUtils.get_resolution_by_func_name(this.resolution);
      let l_message = "Time";
      l_message += ` (${r.value} ${r.r})`;
      return l_message;
    },
    initialize() {
      this.onDashboardChange(this.dashboard);

      this.loading = false;
    },
  },
};
</script>
