<template>
  <div>
    <template v-if="tac">
      <flo-tac v-model="tac"></flo-tac>
    </template>
  </div>
</template>
<script>
import floTac from "~/components/pages/resources/tacs/floTac";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
export default {
  components: {
    floTac,
  },
  data: () => ({
    tac: null,
  }),
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    async initialize() {
      await this.loadTac();
    },
    async loadTac() {
      let tac = [];
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
        tac = await this.$axios.$post("api/v1/tacs/list", query);
        if (tac.length > 0) {
          this.tac = tac[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
  },
};
</script>
