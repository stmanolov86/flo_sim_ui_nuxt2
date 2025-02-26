<template>
  <div class="flo-alerts-timeline">
    <v-card flat outlined class="mx-auto">
      <v-toolbar flat>
        <v-toolbar-title>
          <v-container class="ma-0 pa-0">
            <v-row no-gutters class="d-flex justify-center align-center mt-3">
              <span class="mr-2">{{ $vuetify.breakpoint.mdAndUp ? "Live Alerts" : "Alerts" }}</span>
              <v-badge top overlap color="info" class="ma-2">
                <template v-slot:badge>
                  <span>{{ alerts.stats.info }}</span>
                </template>
                <v-chip outlined small color="info" class="caption">{{ $vuetify.breakpoint.mdAndUp ? "Info" : "I" }}</v-chip>
              </v-badge>

              <v-badge top overlap color="warning" class="ma-2">
                <template v-slot:badge>
                  <span>{{ alerts.stats.warning }}</span>
                </template>
                <v-chip outlined small color="warning" class="caption">{{ $vuetify.breakpoint.mdAndUp ? "Warnings" : "W" }}</v-chip>
              </v-badge>

              <v-badge top overlap color="error" class="ma-2">
                <template v-slot:badge>
                  <span>{{ alerts.stats.error }}</span>
                </template>
                <v-chip outlined small color="error" class="aption">{{ $vuetify.breakpoint.mdAndUp ? "Errors" : "E" }}</v-chip>
              </v-badge>
            </v-row>
          </v-container>
        </v-toolbar-title>

        <v-spacer></v-spacer>
      </v-toolbar>

      <v-list three-line>
        <v-list-item-group v-model="selected" :multiple="false" active-class="primary--text">
          <template v-for="alert in alerts.records">
            <v-list-item nuxt router :to="formatLink(alert)" :key="`li_${alert.id}`">
              <template v-slot:default="{ active }">
                <v-list-item-content>
                  <v-list-item-title>
                    <span>{{ alert.identity }}</span>
                  </v-list-item-title>
                  <v-list-item-subtitle class="text--primary">
                    <span :class="`${alertCodeToColor(alert.code)}--text font-weight-bold`">{{ alertCodeToString(alert.code) }} : {{ alert.mtype }} - {{ alert.msubtype }}</span>
                  </v-list-item-subtitle>
                  <v-list-item-subtitle>{{ formatMessage(alert.msg) }}</v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-list-item-action-text>
                    {{ getTsString(alert.ts) }}
                  </v-list-item-action-text>
                  <v-icon v-if="!active" :color="alertCodeToColor(alert.code)" :small="$vuetify.breakpoint.smAndDown">{{ alertCodeToIcon(alert.code) }}</v-icon>

                  <v-icon v-else :color="alertCodeToColor(alert.code)">{{ alertCodeToIcon(alert.code) }}</v-icon>
                </v-list-item-action>
              </template>
            </v-list-item>
            <v-divider :key="`dv_${alert.id}`"></v-divider>
          </template>
        </v-list-item-group>
      </v-list>
      <v-card-actions>
        <v-btn class="ma-2" text outlined elevation="1" router :to="{ path: '/monitor/alerts/' }">View All</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import helpers from "~/src/helpers.js";
const COLORS = {
  critical: "error",
  error: "error",
  warning: "warning",
  success: "success",
  info: "info",
};
const ICONS = {
  critical: "mdi-alert-circle",
  error: "mdi-alert-circle",
  warning: "mdi-alert",
  success: "mdi-check-circle",
  info: "mdi-information",
};
export default {
  name: "flo-alerts-timeline",
  props: {
    error: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      permissions: { c: 0, r: 0, u: 0, d: 0 },
      selected: [1],
      nonce: 0,
      alerts: {
        stats: { info: 0, warning: 0, error: 0, critical: 0 },
        records: [],
      },
    };
  },
  created() {
    let user_permissions = this.$store.state.session.permissions;
    this.permissions = user_permissions.find((p) => "alerts" == p.res);
    this.reloadData();
  },
  mounted() {
    this.$bus.$on("alert", this.updateAlert);
  },
  beforeDestroy() {
    this.$bus.$off("alert");
  },
  methods: {
    async reloadData() {
      const lmeta = await this.$axios.$get(`/api/v1/alerts/meta`);
      const llist = {
        orderby: { ts: { o: "desc" } },
        page: { limit: 7, offset: 0 },
      };

      const ldata = await this.$axios.$post(`/api/v1/alerts/list`, llist);

      this.alerts = {
        meta: lmeta,
        records: ldata,
        stats: { info: 0, warning: 0, error: 0, critical: 0 },
      };
      return "OK";
    },
    updateAlert(body) {
      console.log(`updateAlert - : ${JSON.stringify(body)}`);
      body.alert.id = "new_" + this.nonce++;
      body.alert.ts = new Date().toISOString();

      this.alerts.stats[this.alertCodeToString(body.alert.code)]++;

      this.alerts.records.unshift(body.alert);

      if (this.alerts.records.length > 7) {
        this.alerts.records.pop();
      }
    },
    formatLink(alert) {
      let to = null;

      switch (alert.mtype) {
        case "card":
        case "cards":
          to = {
            path: "/resources/card/",
            query: { iccid: alert.identity },
          };
          break;
        case "campaigns":
          alert.identity = alert.msg.name;
          to = {
            path: "/resources/campaign/",
            query: { id: alert.msg.id },
          };
          break;
        case "orders":
          alert.identity = alert.msg.name;
          to = {
            path: "/resources/order/",
            query: { id: alert.msg.id },
          };
          break;
        case "subscribers":
          to = {
            path: "/resources/subscriber/",
            query: { imsi: alert.identity },
          };
          break;
        case "hsms":
          to = {
            path: "/network/hsms",
          };
          break;
        case "kafka":
          to = {
            path: "/monitor/alerts",
          };
          break;
        default:
          to = {
            path: `/network/${alert.mtype.slice(0, -1)}/`,
          };
          break;
      }

      return to;
    },
    formatMessage(message) {
      let l_msg = "";
      if (message) {
        if (typeof message == "object") {
          if (message.hasOwnProperty("details")) {
            l_msg = message.details;
          }
        } else if (typeof message == "string") {
          let l_message = JSON.parse(message);
          if (l_message.hasOwnProperty("details")) {
            l_msg = l_message.details;
          }
        }
      }

      return l_msg;
    },
    alertCodeToString(code) {
      switch (code) {
        case 1: {
          return "critical";
        }
        case 2: {
          return "error";
        }
        case 3: {
          return "warning";
        }
        default: {
          return "info";
        }
      }
    },
    alertCodeToIcon(code) {
      return ICONS[this.alertCodeToString(code)];
    },
    alertCodeToColor(code) {
      return COLORS[this.alertCodeToString(code)];
    },
    getTsString(ts) {
      let today = new Date();
      let tsDate = new Date(ts);
      let date = today.getFullYear() + "-" + helpers.pad(today.getMonth() + 1, 2) + "-" + helpers.pad(today.getDate(), 2);
      let tsDay = tsDate.getFullYear() + "-" + helpers.pad(tsDate.getMonth() + 1, 2) + "-" + helpers.pad(tsDate.getDate(), 2);
      let tsString = helpers.toLocalTimeInIsoFormatUi(ts);
      if (tsDay == date) {
        return tsString.substr(11);
      } else {
        return tsString;
      }
    },
  },
};
</script>
