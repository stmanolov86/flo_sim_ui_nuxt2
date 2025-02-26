<template>
  <div class="flo-dashboard-stats">
    <v-card v-if="!loading" outlined flat class="ma-0 pa-0">
      <v-fab-transition>
        <template v-if="!paused">
          <v-btn fab small absolute right color="warning" @click="pauseData(true)">
            <v-icon small>mdi-pause</v-icon>
          </v-btn>
        </template>
        <template v-else>
          <v-btn fab small absolute right color="success" @click="pauseData(false)">
            <v-icon small>mdi-play</v-icon>
          </v-btn>
        </template>
      </v-fab-transition>
      <v-container fluid class="ma-0 pa-0">
        <flo-resource-counts :dashboard="dashboard_stats" />

        <v-row no-gutters>
          <v-col v-for="(agent, i) in agents" :key="i" cols="12" lg="3" xl="3" class="pa-1">
            <flo-sunburst-agents-stats :dashboard="dashboard_stats" :marker="dashboard_marker" :paused="paused" :showTitle="true" :type="agent.type" :unique="agent.unique" :title="agent.title" min-height="250px" max-height="250px" />
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col cols="12" class="pa-1">
            <flo-expand elevation="0" title="Cards">
              <template v-slot:content="{}">
                <v-container fluid class="ma-0 pa-0">
                  <v-row no-gutters>
                    <v-col cols="12" lg="3" class="pa-1">
                      <flo-sunburst-card-ota-state :dashboard="dashboard_stats" :marker="dashboard_marker" unique="flo-sunburst-card-ota-state" :showTitle="true" title="Active Cards" min-height="352px" max-height="352px" smallIcon></flo-sunburst-card-ota-state>
                    </v-col>
                    <v-col cols="12" lg="9" class="pa-1">
                      <flo-timeline-card-ota-state :live="live" :dashboard="dashboard_stats" :marker="dashboard_marker" unique="timeline-card-ota-state" :showTitle="true" title="Active Cards Over Time" min-height="300px" max-height="300px"></flo-timeline-card-ota-state>
                    </v-col>
                  </v-row>
                </v-container>
              </template>
            </flo-expand>
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col cols="12" class="pa-1">
            <flo-expand elevation="0" title="Messages">
              <template v-slot:content="{}">
                <v-container fluid class="ma-0 pa-0">
                  <v-row no-gutters>
                    <v-col cols="12" lg="3" class="pa-1">
                      <flo-sunburst-messages :dashboard="dashboard_stats" :marker="dashboard_marker" unique="sunburst-messages" :showTitle="true" title="Card Messages" min-height="352px" max-height="352px" smallIcon></flo-sunburst-messages>
                    </v-col>
                    <v-col cols="12" lg="9" class="pa-1">
                      <flo-timeline-messages :live="live" :dashboard="dashboard_stats" :marker="dashboard_marker" unique="timeline-messages" :showTitle="true" title="Card Messages Over Time" min-height="330px" max-height="333px"></flo-timeline-messages>
                    </v-col>
                  </v-row>
                </v-container>
              </template>
            </flo-expand>
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col cols="12" class="pa-1">
            <flo-expand elevation="0" title="HSM">
              <template v-slot:content="{}">
                <v-container fluid class="ma-0 pa-0">
                  <v-row no-gutters>
                    <v-col cols="12" lg="3" class="pa-1">
                      <flo-sunburst-hsm-keys :dashboard="dashboard_stats" :marker="dashboard_marker" :levels="3" unique="sunburst-hsm-keys" :showTitle="true" title="HSM Keys" min-height="352px" max-height="352px" smallIcon></flo-sunburst-hsm-keys>
                    </v-col>
                    <v-col cols="12" lg="9" class="pa-1">
                      <flo-timeline-hsm-keys-progress :live="live" :dashboard="dashboard_stats" :marker="dashboard_marker" unique="timeline-hsm-keys-progress" :showTitle="true" title="HSM Keys" min-height="300px" max-height="300px"></flo-timeline-hsm-keys-progress>
                    </v-col>
                  </v-row>
                </v-container>
              </template>
            </flo-expand>
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col cols="12" class="pa-1">
            <flo-expand elevation="0" title="Campaigns">
              <template v-slot:content="{}">
                <v-container fluid class="ma-0 pa-0">
                  <v-row no-gutters>
                    <v-col cols="12" lg="3" class="pa-1">
                      <flo-sunburst-campaign :dashboard="dashboard_stats" :marker="dashboard_marker" unique="sunburst-campaign" :showTitle="true" title="Campaigns" min-height="352px" max-height="352px" smallIcon></flo-sunburst-campaign>
                    </v-col>

                    <v-col cols="12" lg="9" class="pa-1">
                      <flo-timeline-campaign-progress :live="live" :dashboard="dashboard_stats" :marker="dashboard_marker" unique="timeline-campaign-progress" :showTitle="true" title="Campaign Participants Activity" min-height="300px" max-height="300px"></flo-timeline-campaign-progress>
                    </v-col>
                  </v-row>
                </v-container>
              </template>
            </flo-expand>
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col cols="12" class="pa-1">
            <flo-expand elevation="0" title="Orders">
              <template v-slot:content="{}">
                <v-container fluid class="ma-0 pa-0">
                  <v-row no-gutters>
                    <v-col cols="12" lg="3" class="pa-1">
                      <flo-sunburst-orders :dashboard="dashboard_stats" :marker="dashboard_marker" unique="sunburst-orders" :showTitle="true" title="Orders" min-height="352px" max-height="352px" smallIcon></flo-sunburst-orders>
                    </v-col>
                    <v-col cols="12" lg="9" class="pa-1">
                      <flo-timeline-order-progress :live="live" :dashboard="dashboard_stats" :marker="dashboard_marker" unique="timeline-order-progress" :showTitle="true" title="Order Items Activity" min-height="300px" max-height="300px"></flo-timeline-order-progress>
                    </v-col>
                  </v-row>
                </v-container>
              </template>
            </flo-expand>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12" class="pa-1">
            <flo-expand elevation="0" title="Workers">
              <template v-slot:content="{}">
                <v-container fluid class="ma-0 pa-0">
                  <v-row no-gutters>
                    <v-col cols="12" lg="3" class="pa-1">
                      <flo-sunburst-process :dashboard="dashboard_stats" :marker="dashboard_marker" unique="sunburst-worker" :showTitle="true" title="Workers" min-height="425px" max-height="425px" smallIcon></flo-sunburst-process>
                    </v-col>
                    <v-col cols="12" lg="9" class="pa-1">
                      <flo-timeline-process :live="live" :dashboard="dashboard_stats" :marker="dashboard_marker" unique="timeline-worker" :showTitle="true" title="Workers Activity" min-height="300px" max-height="300px"></flo-timeline-process>
                    </v-col>
                  </v-row>
                </v-container>
              </template>
            </flo-expand>
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col cols="12" class="pa-1">
            <flo-expand elevation="0" title="System Information">
              <template v-slot:content="{}">
                <v-container fluid class="ma-0 pa-0">
                  <v-row no-gutters>
                    <v-col cols="12" class="pa-1">
                      <flo-json-editor :name="`dashboard-stats`" :mode="`view`" :modes="['view', 'text']" :value="dashboard_stats"></flo-json-editor>
                    </v-col>
                  </v-row>
                </v-container>
              </template>
            </flo-expand>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import floJsonEditor from "~/components/json/floJsonEditor";
import floResourceCounts from "~/components/dashboard/floResourceCounts";
import floSunburstOrders from "~/components/charts/floSunburstOrders";
import floSunburstCampaign from "~/components/charts/floSunburstCampaign";
import floTimelineCampaignProgress from "~/components/charts/floTimelineCampaignProgress";
import floTimelineOrderProgress from "~/components/charts/floTimelineOrderProgress";
import floSunburstCardOtaState from "~/components/charts/floSunburstCardOtaState";
import floSunburstMessages from "~/components/charts/floSunburstMessages";
import floTimelineCardOtaState from "~/components/charts/floTimelineCardOtaState";
import floTimelineMessages from "~/components/charts/floTimelineMessages";
import floSunburstHsmKeys from "~/components/charts/floSunburstHsmKeys";
import floTimelineHsmKeysProgress from "~/components/charts/floTimelineHsmKeysProgress";
import floSunburstProcess from "~/components/charts/floSunburstProcess";
import floTimelineProcess from "~/components/charts/floTimelineProcess";
import floSunburstAgentsStats from "~/components/charts/floSunburstAgentsStats";
export default {
  name: "flo-dashboard-stats",
  components: {
    floJsonEditor,
    floSunburstAgentsStats,
    floSunburstOrders,
    floTimelineOrderProgress,
    floSunburstCampaign,
    floTimelineCampaignProgress,
    floSunburstCardOtaState,
    floSunburstMessages,
    floResourceCounts,
    floTimelineCardOtaState,
    floTimelineMessages,
    floSunburstHsmKeys,
    floTimelineHsmKeysProgress,
    floSunburstProcess,
    floTimelineProcess,
  },
  data: function () {
    return {
      paused: false,
      live: true,
      loading: true,
      event: null,
      agents: [
        { title: "SMSC", type: "smsc", unique: "smsc-stats" },
        { title: "BIP", type: "bip", unique: "bip-stats" },
        { title: "HLR", type: "registrar", unique: "registrar-stats" },
        { title: "HSM", type: "hsm", unique: "hsm-stats" },
      ],
      dashboard_marker: 0,
      dashboard_stats: {},
    };
  },
  created() {
    this.initialize();
  },
  mounted() {
    this.$bus.$on("dashboard", this.onDashboardChange);
  },
  beforeDestroy() {
    this.$bus.$off("dashboard");
  },
  methods: {
    pauseData(value) {
      this.paused = value;
      this.live = !value;

      if (!value) {
        this.onDashboardChange(this.event);
      }
    },
    async getDashboard(p_mark) {
      try {
        let l_dashboard_stats = await this.$axios.$get(`/statistics/v1/dashboard/stats/${p_mark}`);
        return l_dashboard_stats;
      } catch (err) {
        console.error(err);
      }
    },
    async onDashboardChange(p_event) {
      this.event = p_event;
      // console.log(`floDashboardStats - onDashboardChange: enter event mark: ${p_event.mark}`);
      if (this.paused) {
        // console.log(`floDashboardStats - onDashboardChange: paused event mark: ${p_event.mark}`);
        return;
      }

      let l_dashboard = this.dashboard_stats;
      // if we are just watching and there is mark no gaps
      if (l_dashboard.hasOwnProperty("mark")) {
        // console.log(`floDashboardStats - onDashboardChange: event mark: ${p_event.mark} dashboard mark: ${l_dashboard.mark}`);
      }

      if (l_dashboard.hasOwnProperty("mark") && l_dashboard.mark + 1 == p_event.mark) {
        // console.log(`floDashboardStats - onDashboardChange: by pull shift of 1`);
        // if we have no data pull all
        l_dashboard.data.push(p_event);
        l_dashboard.mark = p_event.mark;

        if (l_dashboard.data.length > 50) {
          // shift 1 (hold no more the 50 stats)
          l_dashboard.data.shift();
        }
      } else if (l_dashboard.hasOwnProperty("mark") && l_dashboard.mark < p_event.mark && p_event.mark - l_dashboard.mark < 50) {
        // console.log(`floDashboardStats - onDashboardChange: by pull shift of more than 1 less than 50`);
        // if we less than 50 marks back get only the delta
        let l_delta_dashboard = await this.getDashboard(l_dashboard.mark);
        if (!l_delta_dashboard) {
          return;
        }

        if (l_dashboard.mark > l_delta_dashboard.mark) {
          // if the server was restarted get the entire thing
          l_dashboard = await this.getDashboard(0);
          if (!l_dashboard) {
            return;
          }
        } else {
          l_dashboard.mark = l_delta_dashboard.mark;
          l_dashboard.data = l_dashboard.data.concat(l_delta_dashboard.data);
          if (l_dashboard.data.length > 50) {
            l_dashboard.data = l_dashboard.data.slice(-50);
          }
        }
      } else {
        // console.log(`floDashboardStats - onDashboardChange: else pull all dashboard`);
        // else get the entire dashboard
        l_dashboard = await this.getDashboard(0);
        if (!l_dashboard) {
          return;
        }
      }
      // console.log(`floDashboardStats - onDashboardChange: dashboard mark: ${JSON.stringify(l_dashboard.data.map((m) => m.mark))}`);

      this.dashboard_marker = l_dashboard.mark;
      this.dashboard_stats = l_dashboard;

      // console.log(`floDashboardStats - onDashboardChange: dashboard marker: ${this.dashboard_marker} -> mark ${JSON.stringify(l_dashboard.data.map((m) => m.mark))}`);
    },
    async initialize() {
      try {
        console.log(`floDashboardStats - initialize: getDashboard with mark 0`);
        await this.onDashboardChange({ mark: 0 });
        this.loading = false;
      } catch (err) {
        console.error(err);
      }
    },
  },
};
</script>
