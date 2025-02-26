<template>
  <div>
    <flo-meta-table v-if="translator !== null" @query_change="onQueryChange($event)" @load-data="onLoadData($event)" :translator="translator" :init_filter="init_filter" :resources="resources" main_resource>
      <template v-slot:ex_new="{ fab, color, smAndDown }">
        <v-btn :fab="fab" :small="smAndDown" class="mr-1" :color="color" router :to="{ path: '/network/countries/' }">
          <v-icon :left="!smAndDown">mdi-flag</v-icon>
          {{ !smAndDown ? "Countries" : "" }}
        </v-btn>
      </template>
      <template v-slot:view_mccmnc="{ fmtrow }">
        <v-chip label color="info">{{ fmtrow.mccmnc }}</v-chip>
      </template>
      <template v-slot:view_por_mode="{ fmtrow }">
        <v-chip v-if="fmtrow.por_mode == 'submit_sm'" label color="info">Submit</v-chip>
        <v-chip v-else-if="fmtrow.por_mode == 'deliver_sm'" label color="success">Deliver</v-chip>
        <v-chip v-else label color="warning">{{ fmtrow.por_mode }}</v-chip>
      </template>
    </flo-meta-table>
  </div>
</template>
<script>
import { mapActions } from "vuex";
import OTranslator from "~/src/otranslator.js";
export default {
  data: () => ({
    resource: "operator",
    resources: "operators",
    translator: null,
    init_filter: [],
  }),
  created() {
    this.initialize();
  },
  methods: {
    ...mapActions({
      clearResourceCache: "session/clearResourceCache",
    }),
    initialize() {
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      this.translator = translator;
      if (typeof this.$route.query.mccmnc !== "undefined") {
        this.init_filter = [
          {
            k: "mccmnc",
            op: "equal",
            v: this.$route.query.mccmnc,
          },
        ];
      }
    },
    onLoadData(data) {
      for (const header of data.headers) {
        switch (header.value) {
          case "mccmnc":
            {
              header.align = "center";
            }
            break;
          case "id":
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
        }
      }
    },
    onQueryChange() {
      this.clearResourceCache({ module: "main", resource: this.resources });
    },
  },
};
</script>
