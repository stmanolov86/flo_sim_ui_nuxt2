<template>
  <div v-if="uicc">
    <flo-uicc :value="uicc"></flo-uicc>
  </div>
  <error-resource v-else-if="!loading && !uicc" resource="uicc" path="/resources/uiccs/"></error-resource>
</template>

<script>
import floUicc from "~/components/pages/resources/uiccs/floUicc.vue";
import errorResource from "~/components/error/error-resource.vue";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
export default {
  data: () => ({
    uicc: null,
    loading: true,
  }),
  components: {
    floUicc,
    errorResource,
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    async initialize() {
      await this.loadUicc();
    },
    async loadUicc() {
      let uicc = [];
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
        uicc = await this.$axios.$post("api/v1/uiccs/list", query);
        if (uicc.length > 0) {
          this.uicc = uicc[0];
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
