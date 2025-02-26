<template>
  <v-container fluid class="flo-timeline-campaign-progress ma-0 pa-0">
    <v-row no-gutters>
      <v-col>
        <floTimelineStats v-if="!loading" :live="live" :x_value_by="x_value_by" :y_value_by="y_value_by" :y_axis_name="get_y_axis_name()" :x_axis_name="get_x_axis_name()" :levels="levels" :values="values" :title="title" :unique="unique" :type="type" :start="start" :end="end" :l1="l1" :l2="l2" :resolution="resolution" :aggregate="aggregate" :outlined="outlined" :min-height="minHeight" :max-height="maxHeight" :groupby="groupby" :where="where">
          <template v-slot:filter="{}">
            <v-row no-gutters>
              <v-col cols="3" class="pa-1">
                <v-select @change="onStatisticChange($event)" :value="statistic.value" :items="statistic.items" :label="statistic.label" :hint="statistic.hint" item-text="value" item-value="key" persistent-hint dense outlined></v-select>
              </v-col>
              <v-col v-if="statistic.value == 'db' || statistic.value == 'http' || statistic.value == 'async'" cols="3" class="pa-1">
                <v-select @change="onSubStatisticChange($event)" :value="sub_statistic.value" :items="filterSubStatistics(statistic.value)" :label="sub_statistic.label" :hint="sub_statistic.hint" item-text="value" item-value="key" persistent-hint dense outlined></v-select>
              </v-col>
            </v-row>
          </template>
        </floTimelineStats>
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
      { level: 1, key: "l1", field: "stat", name: "Statistic" },
      { level: 2, key: "l2", field: "worker", name: "Worker" },
      { level: 3, key: "l3", field: "wid", name: "Worker Id" },
    ],
    statistic: {
      value: "http",
      items: [
        { key: "db", value: "DB" },
        { key: "cpu", value: "CPU" },
        { key: "http", value: "HTTP" },
        { key: "async", value: "Async" },
        { key: "resource", value: "Resource" },
        { key: "memory", value: "Memory" },
      ],
      label: "Statistic",
      hint: "Select Statistic",
    },
    sub_statistic: {
      value: "traffic",
      label: "Sub-Statistic",
      hint: "Select Sub-Statistic",
    },
    x_value_by: "sts",
    y_value_by: "value",
    values: [],
    loading: true,
    aggregate: "sum",
    unit: "",
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
    onStatisticChange(event) {
      this.statistic.value = event;

      if (event == "http") {
        this.sub_statistic.value = "traffic";
      } else if (event == "db") {
        this.sub_statistic.value = "activity";
      } else if (event == "async") {
        this.sub_statistic.value = "link";
      } else {
        this.sub_statistic.value = "";
      }
      this.onDashboardChange(this.dashboard);
    },
    onSubStatisticChange(event) {
      this.sub_statistic.value = event;
      this.onDashboardChange(this.dashboard);
    },
    onMarkerChanged() {
      this.onDashboardChange(this.dashboard);
    },
    onDashboardChange(p_dashboard) {
      let l_dashboard = p_dashboard;
      if (!l_dashboard) {
        return;
      }

      if (!l_dashboard.hasOwnProperty("data")) {
        return;
      }

      let l_dashboard_process = [];
      let l_dashboard_data = l_dashboard.data;
      let l_unit = "";
      for (let i = 0; i < l_dashboard_data.length; i++) {
        const l_data = l_dashboard_data[i];
        if (!l_data.hasOwnProperty("statistics")) {
          continue;
        }

        let l_stat_section = this.statistic.value;
        let l_stat_sub_section = this.sub_statistic.value;

        let l_process = l_data.statistics.reduce((acc, data) => {
          switch (l_stat_section) {
            case "memory":
              {
                if (data.stat.startsWith("/process/memory/")) {
                  if ("" == l_unit) {
                    l_unit = data.unit;
                  }
                  let [_p1, _p2, _p3, stat] = data.stat.split("/");
                  acc.push({
                    worker: data.worker,
                    wid: data.wid,
                    stat: stat,
                    value: data.value,
                    sts: data.sts,
                  });
                }
              }
              break;
            case "cpu":
              {
                if (data.stat.startsWith("/process/cpu/")) {
                  if ("" == l_unit) {
                    l_unit = data.unit;
                  }
                  let [_p1, _p2, _p3, stat] = data.stat.split("/");
                  acc.push({
                    worker: data.worker,
                    wid: data.wid,
                    stat: stat,
                    value: data.value,
                    sts: data.sts,
                  });
                }
              }
              break;
            case "db":
              {
                if (data.stat.startsWith(`/process/db/${l_stat_sub_section}`)) {
                  if ("" == l_unit) {
                    l_unit = data.unit;
                  }
                  let [_p1, _p2, _p3, _p4, stat] = data.stat.split("/");
                  acc.push({
                    worker: data.worker,
                    wid: data.wid,
                    stat: stat,
                    value: data.value,
                    sts: data.sts,
                  });
                }
              }
              break;
            case "http":
              {
                if (data.stat.startsWith(`/process/http/${l_stat_sub_section}`)) {
                  if ("" == l_unit) {
                    l_unit = data.unit;
                  }
                  let [_p1, _p2, _p3, _p4, stat] = data.stat.split("/");
                  acc.push({
                    worker: data.worker,
                    wid: data.wid,
                    stat: stat,
                    value: data.value,
                    sts: data.sts,
                  });
                }
              }
              break;
            case "async":
              {
                if ("link" == l_stat_sub_section) {
                  if (data.stat.startsWith(`/process/async/${l_stat_sub_section}`)) {
                    if ("" == l_unit) {
                      l_unit = data.unit;
                    }
                    let [_p1, _p2, _p3, _p4, stat] = data.stat.split("/");
                    acc.push({
                      worker: data.worker,
                      wid: data.wid,
                      stat: stat,
                      value: data.value,
                      sts: data.sts,
                    });
                  }
                } else if ("lag/k" == l_stat_sub_section) {
                  if (data.stat.startsWith(`/process/async/${l_stat_sub_section}`)) {
                    if ("" == l_unit) {
                      l_unit = data.unit;
                    }
                    let [_p1, _p2, _p3, _p4, stat] = data.stat.split("/");
                    acc.push({
                      worker: data.worker,
                      wid: data.wid,
                      stat: stat,
                      value: data.value,
                      sts: data.sts,
                    });
                  }
                } else if ("lag/q" == l_stat_sub_section) {
                  if (data.stat.startsWith(`/process/async/${l_stat_sub_section}`)) {
                    if ("" == l_unit) {
                      l_unit = data.unit;
                    }
                    let [_p1, _p2, _p3, _p4, stat] = data.stat.split("/");
                    acc.push({
                      worker: data.worker,
                      wid: data.wid,
                      stat: stat,
                      value: data.value,
                      sts: data.sts,
                    });
                  }
                } else if ("topics" == l_stat_sub_section) {
                  if (data.stat.startsWith(`/process/async/${l_stat_sub_section}`)) {
                    if (data.stat.endsWith(`/messages`)) {
                      if ("" == l_unit) {
                        l_unit = data.unit;
                      }
                      // /process/async/topics/${l_topic}/partition/${otpi.id}/messages
                      let [_p0, _p1, _p2, _p3, _topic, _p4, _partition_id] = data.stat.split("/");
                      acc.push({
                        worker: data.worker,
                        wid: data.wid,
                        // stat: `${_topic}:${_partition_id}`,
                        stat: `${_topic}`,
                        value: data.value,
                        sts: data.sts,
                      });
                    }
                  }
                }
              }
              break;
            case "resource": {
              if (data.stat.startsWith("/process/resource/")) {
                if ("" == l_unit) {
                  l_unit = data.unit;
                }
                let [_p1, _p2, _p3, stat] = data.stat.split("/");
                acc.push({
                  worker: data.worker,
                  wid: data.wid,
                  stat: stat,
                  value: data.value,
                  sts: data.sts,
                });
              }
            }
          }

          return acc;
        }, []);

        l_dashboard_process = l_dashboard_process.concat(l_process);
      }
      this.unit = l_unit;
      this.values = l_dashboard_process;
    },
    filterSubStatistics(statistic) {
      let l_sub_stats = [];

      if (statistic == "http") {
        l_sub_stats.push({ key: "calls", value: "Calls" }, { key: "traffic", value: "Traffic" });
      } else if (statistic == "db") {
        l_sub_stats.push({ key: "activity", value: "Activity" }, { key: "pool", value: "Pool" });
      } else if (statistic == "async") {
        l_sub_stats.push({ key: "link", value: "Link" }, { key: "topics", value: "Topics" }, { key: "lag/k", value: "Kafka Lag" }, { key: "lag/q", value: "Internal Queue Lag" });
      }

      return l_sub_stats;
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
