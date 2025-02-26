<template>
  <v-container fluid class="flo-timeline-campaign-progress ma-0 pa-0">
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
  name: "flo-timeline-campaign-progress",
  data: () => ({
    groupby: ["l1", "l2", "l3"],
    where: [],
    levels: [
      { level: 1, key: "l1", field: "state", name: "State" },
      { level: 2, key: "l2", field: "name", name: "Campaign" },
      { level: 3, key: "l3", field: "code", name: "Code" },
    ],
    x_value_by: "sts",
    y_value_by: "value",
    values: [],
    loading: true,
    aggregate: "sum",
    unit: "Participants",
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
    campaign_id: {
      type: Number,
      required: false,
      default: 0,
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
      let l_dashboard = p_dashboard;
      if (!l_dashboard) {
        return;
      }

      if (!l_dashboard.hasOwnProperty("data")) {
        return;
      }

      let l_dashboard_campaign_progress = [];
      let l_dashboard_data = l_dashboard.data;

      for (let i = 0; i < l_dashboard_data.length; i++) {
        const l_data = l_dashboard_data[i];
        if (!l_data.hasOwnProperty("statistics")) {
          continue;
        }

        let l_stats = l_data.statistics;

        if (this.campaign_id != 0) {
          l_stats = l_stats.filter((f) => f.stat.match(`/campaigns/${this.campaign_id}/participants/.*`));
        }

        let l_campaign_progress = l_stats.reduce((acc, data) => {
          if (data.stat.match("/campaigns/[0-9]+/participants/.*")) {
            let [start, campaigns, campaign_id, participants, name, name_val, state, state_val, code, code_val] = data.stat.split("/");
            if (!["completed", "canceled"].includes(state_val)) {
              acc.push({
                state: state_val,
                name: name_val,
                code: code_val,
                value: data.value,
                sts: data.sts,
              });
            }
          }

          return acc;
        }, []);

        l_dashboard_campaign_progress = l_dashboard_campaign_progress.concat(l_campaign_progress);
      }

      this.values = l_dashboard_campaign_progress;
    },
    get_y_axis_name() {
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
