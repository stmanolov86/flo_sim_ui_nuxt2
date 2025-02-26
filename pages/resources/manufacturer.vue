<template>
  <div v-if="manufacturer">
    <flo-manufacturer :value="manufacturer"></flo-manufacturer>
  </div>
  <error-resource v-else-if="!loading && !manufacturer" resource="manufacturer" path="/resources/manufacturers/"></error-resource>
</template>

<script>
import floManufacturer from "~/components/pages/resources/manufacturers/floManufacturer.vue";
import errorResource from "~/components/error/error-resource.vue";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
export default {
  data: () => ({
    manufacturer: null,
    loading: true,
  }),
  components: {
    floManufacturer,
    errorResource,
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    async initialize() {
      await this.loadManufacturer();
    },
    async loadManufacturer() {
      let manufacturer = [];
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
        manufacturer = await this.$axios.$post("api/v1/manufacturers/list", query);
        if (manufacturer.length > 0) {
          this.manufacturer = manufacturer[0];
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
