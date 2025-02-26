<template>
  <v-container fluid class="flo-node-os-process-stats ma-0 pa-0">
    <v-row no-gutters>
      <v-col cols="12" class="ma-0 pa-0">
        <v-card flat outlined>
          <v-card-text class="ma-0 pa-0">
            <v-container fluid class="ma-0 pa-1">
              <v-row no-gutters align="center" justify="start">
                <v-col cols="12" class="pa-1">
                  <p class="text-no-wrap font-weight-light ma-0 pa-0">DB Connections: {{ pool_info.all }}</p>
                  <v-divider></v-divider>
                  <p class="text-no-wrap font-weight-light ma-0 pa-0">OS CPU: {{ `${Math.floor(os_cpu_cores * 1000)}` }} / {{ os_cpu_tcores * 1000 }} millicores.</p>
                  <v-progress-linear :color="getPercentColor(os_cpu_pused)" :value="os_cpu_pused" height="23" striped>
                    <strong :class="blinkAnimation(os_cpu_pused)">{{ os_cpu_pused }}% Used</strong>
                  </v-progress-linear>

                  <v-divider></v-divider>
                  <p class="text-no-wrap font-weight-light ma-0 pa-0">OS Memory: {{ dhelpers.formatBytes(`${os_mem_total - os_mem_free}`) }}/{{ dhelpers.formatBytes(`${os_mem_total}`) }}</p>
                  <v-progress-linear :color="getPercentColor(os_mem_pused)" :value="os_mem_pused" height="23" striped>
                    <strong :class="blinkAnimation(os_mem_pused)">{{ os_mem_pused }}% Used</strong>
                  </v-progress-linear>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import helpers from "~/src/helpers.js";
export default {
  name: "flo-node-os-process-stats",
  data() {
    return {
      dhelpers: helpers,
      redraw_os_info: 0,
      stats: [],
      os_cpu_info: null,
      os_cpu_cores: 0,
      os_cpu_tcores: 0,
      os_cpu_pused: 0,
      os_mem_free: 0,
      os_mem_total: 0,
      os_mem_pused: 0,
      process_cpu_cores: 0,
      process_cpu_pused: 0,
      process_mem_heap_used: 0,
      process_mem_heap_total: 0,
      process_mem_pused: 0,
      process_mem_rss: 0,
      pool_info: {},
      loading: true,
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
      required: false,
      default: "flo-node-os-process-stats",
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
    dashboard: {
      type: Object,
      required: false,
      default: null,
    },
  },
  created() {
    this.initialize();
  },
  watch: {
    dashboard: function (n) {
      if (!n.hasOwnProperty("data")) {
        return;
      }

      if (n.data.length == 0) {
        return;
      }
      let last = n.data.slice(-1);
      this.onDashboardChange(last[0]);
    },
  },
  methods: {
    getPercentColor(p) {
      if (p <= 50) {
        return "success";
      }

      if (p > 50 && p < 75) {
        return "warning";
      }

      return "error";
    },
    blinkAnimation(p) {
      if (p >= 75) {
        return "blink";
      }
    },
    sum_by_equal(p_data, p_stat) {
      let l_matches = p_data.filter((f) => p_stat == f.stat);
      let l_sum = l_matches.reduce((pv, cv) => {
        return pv + parseInt(cv.value);
      }, 0);
      return l_sum;
    },
    sum_by_start(p_data, p_stat_start) {
      let l_matches = p_data.filter((f) => f.stat.startsWith(p_stat_start));
      let l_sum = l_matches.reduce((pv, cv) => {
        return pv + parseInt(cv.value);
      }, 0);
      return l_sum;
    },
    sum_by_regex(p_data, p_stat_regex) {
      let l_matches = p_data.filter((f) => f.stat.match(p_stat_regex));
      let l_sum = l_matches.reduce((pv, cv) => {
        return pv + parseInt(cv.value);
      }, 0);
      return l_sum;
    },
    onDashboardChange() {
      let l_dashboard = this.dashboard;
      if (!l_dashboard.hasOwnProperty("data")) {
        return;
      }
      if (l_dashboard.data.length < 2) {
        return;
      }

      let l_cur = l_dashboard.data.slice(-1)[0];
      let l_prev = l_dashboard.data.slice(-2, -1)[0];

      if (!l_cur.hasOwnProperty("statistics") || !l_prev.hasOwnProperty("statistics")) {
        return;
      }
      if (!l_cur.statistics || !l_prev.statistics) {
        return;
      }

      // calculate OS memory
      let l_cur_os = l_cur.statistics.filter((f) => f.stat.startsWith("/os/"));
      let l_found = l_cur_os.find((f) => "/os/totalmem" == f.stat);
      if (l_found) {
        this.os_mem_total = l_found.value;
      }

      l_found = l_cur_os.find((f) => "/os/freemem" == f.stat);
      if (l_found) {
        this.os_mem_free = l_found.value;
      }

      this.os_mem_pused = 100 - Math.ceil((this.os_mem_free / this.os_mem_total) * 100);

      // calculate OS CPU
      let l_prev_os = l_prev.statistics.filter((f) => f.stat.startsWith("/os/"));

      let l_cur_cpu = l_cur_os.filter((f) => f.stat.startsWith("/os/cpu/"));
      let l_prev_cpu = l_prev_os.filter((f) => f.stat.startsWith("/os/cpu/"));

      l_found = l_cur_cpu.find((f) => "/os/cpu/cores" == f.stat);
      if (!l_found) {
        return;
      }

      this.os_cpu_tcores = l_found.value;
      let l_cur_sts = new Date(l_found.sts);

      l_found = l_prev_cpu.find((f) => "/os/cpu/cores" == f.stat);
      if (!l_found) {
        return;
      }
      let l_prev_sts = new Date(l_found.sts);
      let l_snap_time_ms = l_cur_sts.getTime() - l_prev_sts.getTime();
      let l_cur_nice = this.sum_by_regex(l_cur_cpu, "/os/cpu/[0-9]+/times/nice");
      let l_cur_user = this.sum_by_regex(l_cur_cpu, "/os/cpu/[0-9]+/times/user");
      let l_cur_sys = this.sum_by_regex(l_cur_cpu, "/os/cpu/[0-9]+/times/sys");
      let l_cur_idle = this.sum_by_regex(l_cur_cpu, "/os/cpu/[0-9]+/times/idle");
      let l_cur_irq = this.sum_by_regex(l_cur_cpu, "/os/cpu/[0-9]+/times/irq");
      let l_cur_all = l_cur_user + l_cur_sys + l_cur_idle + l_cur_irq;

      let l_prev_nice = this.sum_by_regex(l_prev_cpu, "/os/cpu/[0-9]+/times/nice");
      let l_prev_user = this.sum_by_regex(l_prev_cpu, "/os/cpu/[0-9]+/times/user");
      let l_prev_sys = this.sum_by_regex(l_prev_cpu, "/os/cpu/[0-9]+/times/sys");
      let l_prev_idle = this.sum_by_regex(l_prev_cpu, "/os/cpu/[0-9]+/times/idle");
      let l_prev_irq = this.sum_by_regex(l_prev_cpu, "/os/cpu/[0-9]+/times/irq");
      let l_prev_all = l_prev_user + l_prev_sys + l_prev_idle + l_prev_irq;

      let l_delta_cpu = {
        cores: this.os_cpu_tcores,
        elapsed: l_snap_time_ms,
        user: l_cur_user - l_prev_user,
        nice: l_cur_nice - l_prev_nice,
        sys: l_cur_sys - l_prev_sys,
        idle: l_cur_idle - l_prev_idle,
        irq: l_cur_irq - l_prev_irq,
        all: l_cur_all - l_prev_all,
      };

      l_delta_cpu["userp"] = (l_delta_cpu.user / l_delta_cpu.all) * 100;
      l_delta_cpu["nicep"] = (l_delta_cpu.nice / l_delta_cpu.all) * 100;
      l_delta_cpu["sysp"] = (l_delta_cpu.sys / l_delta_cpu.all) * 100;
      l_delta_cpu["idlep"] = (l_delta_cpu.idle / l_delta_cpu.all) * 100;
      l_delta_cpu["irqp"] = (l_delta_cpu.irq / l_delta_cpu.all) * 100;

      let l_os_cpu_info = [
        { type: "user", cpu: l_delta_cpu["userp"] },
        { type: "nice", cpu: l_delta_cpu["nicep"] },
        { type: "sys", cpu: l_delta_cpu["sysp"] },
        { type: "irq", cpu: l_delta_cpu["irqp"] },
      ];

      this.os_cpu_info = l_os_cpu_info;
      this.os_cpu_cores = (l_delta_cpu.all - l_delta_cpu.idle) / l_snap_time_ms;
      this.os_cpu_pused = Math.ceil(l_delta_cpu["userp"] + l_delta_cpu["nicep"] + l_delta_cpu["sysp"] + l_delta_cpu["irqp"]);

      // calculate DB connections
      let l_cur_db = l_cur.statistics.filter((f) => f.stat.startsWith("/process/db/"));

      this.pool_info["all"] = this.sum_by_start(l_cur_db, "/process/db/pool/all");
      this.pool_info["free"] = this.sum_by_start(l_cur_db, "/process/db/pool/free");

      this.loading = false;
      this.redraw_os_info++;
    },
    initialize() {
      if (this.dashboard != null && this.dashboard.hasOwnProperty("data")) {
        if (this.dashboard.data.length > 0) {
          let d = this.dashboard;
          this.onDashboardChange(d);
        }
      }
    },
  },
};
</script>
