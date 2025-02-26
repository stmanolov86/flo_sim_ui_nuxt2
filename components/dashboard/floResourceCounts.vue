<template>
  <div class="flo-resource-counts">
    <v-container v-if="!loading" fluid class="ma-0 pa-0">
      <v-row no-gutters :key="redraw_resource_counts">
        <v-col v-for="(item, i) in resources" class="pa-1" :key="i">
          <flo-dashboard-counter :counter="item.items" :name="item.name" :description="item.description" :icon="item.icon" :link="item.link" />
        </v-col>

        <v-col class="pa-1" key="last">
          <flo-node-os-process-stats :dashboard="dashboard" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import floDashboardCounter from "~/components/dashboard/floDashboardCounter";
import floNodeOsProcessStats from "~/components/dashboard/floNodeOsProcessStats";
export default {
  name: "flo-resource-counts",
  components: { floDashboardCounter, floNodeOsProcessStats },
  data() {
    return {
      resources: [],
      loading: true,
      redraw_resource_counts: 1,
    };
  },
  props: {
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
    sum_by_regex(p_data, p_stat_regex) {
      let l_matches = p_data.filter((f) => f.stat.match(p_stat_regex));
      let l_sum = l_matches.reduce((pv, cv) => {
        return pv + parseInt(cv.value);
      }, 0);
      return l_sum;
    },
    onDashboardChange(p_change) {
      this.resources = [];
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

      let l_found_cards = l_cur.statistics.find((f) => "/cards" == f.stat);
      if (l_found_cards) {
        let l_card = { name: "cards", items: l_found_cards.value, description: "Cards", icon: "mdi-sim", link: "/resources/cards" };
        this.resources.push(l_card);
      }
      let l_found_subs = l_cur.statistics.find((f) => "/subscribers" == f.stat);

      if (l_found_subs) {
        let l_sub = { name: "subscribers", items: l_found_subs.value, description: "Subscribers", icon: "mdi-account-multiple", link: "/resources/subscribers" };
        this.resources.push(l_sub);
      }

      let l_hsm_keys = l_cur.statistics.filter((f) => f.stat.match("/hsm/[0-9]+/name/.*"));
      if (l_hsm_keys) {
        let l_sum_keys = this.sum_by_regex(l_hsm_keys, "/hsm/[0-9]+/name/.*");
        if (l_sum_keys) {
          let l_hsm_key = { name: "keys", items: l_sum_keys, description: "HSM Keys", icon: "mdi-shield-key", link: "/network/hsms" };
          if (l_hsm_key) {
            this.resources.push(l_hsm_key);
          }
        }
      }

      this.loading = false;
      this.redraw_resource_counts++;
    },
    initialize() {
      if (this.dashboard != null && this.dashboard.hasOwnProperty("data")) {
        if (this.dashboard.data.length > 1) {
          let last = this.dashboard.data.slice(-1);
          this.onDashboardChange(last[0]);
        }
      }
    },
  },
};
</script>
