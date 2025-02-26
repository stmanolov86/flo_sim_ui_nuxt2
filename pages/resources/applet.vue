<template>
  <div v-if="applet">
    <flo-applet :value="applet"></flo-applet>
  </div>
  <error-resource v-else-if="!loading && !applet" resource="applet" path="/resources/applets/"></error-resource>
</template>
<script>
import floApplet from "~/components/pages/resources/applets/floApplet.vue";
import errorResource from "~/components/error/error-resource.vue";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
export default {
  data: () => ({
    applet: null,
    loading: true,
  }),
  components: {
    floApplet,
    errorResource,
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    async initialize() {
      await this.loadApplet();
    },
    async loadApplet() {
      let applet = [];
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
        applet = await this.$axios.$post("api/v1/applets/list", query);
        if (applet.length > 0) {
          this.applet = applet[0];
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
