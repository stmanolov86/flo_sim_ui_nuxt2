<template>
  <div v-if="campaign">
    <flo-campaign :value="campaign" />
  </div>
  <error-resource v-else-if="!loading && !campaign" resource="campaign" path="/resources/campaigns/"></error-resource>
</template>
<script>
import floCampaign from "~/components/pages/resources/campaigns/floCampaign.vue";
import errorResource from "~/components/error/error-resource.vue";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
export default {
  head() {
    return {
      title: "Campaign",
    };
  },
  async fetch({ store }) {
    let lmcc = await store.dispatch("session/getFromCache", "/denum/mcc");
    if (lmcc == null) {
      let query = {
        select: {
          key: { k: "mcc" },
          value: { k: "country" },
        },
      };

      let array = [];
      try {
        array = await store.$axios.$post(`/api/v1/countries/list`, query);

        for (let i = 0; i < array.length; i++) {
          array[i].value = `${array[i].key}: ${array[i].value}`;
        }

        await store.dispatch("session/addToCache", {
          key: "/denum/mcc",
          value: array,
          expire: 60 * 10,
        });
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    }
  },
  data: () => ({
    campaign: null,
    loading: true,
  }),
  components: {
    floCampaign,
    errorResource,
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    async initialize() {
      await this.loadCampaign();
    },
    async loadCampaign() {
      try {
        let query = {
          select: {},
          where: [
            {
              k: "id",
              op: "equal",
              v: this.$route.query.id,
            },
          ],
        };
        let campaign = await this.$axios.$post("api/v1/campaigns/list", query);
        if (campaign.length > 0) {
          this.campaign = campaign[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      this.loading = false;
    },
  },
};
</script>
