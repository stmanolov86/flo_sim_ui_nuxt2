<template>
  <div>
    <flo-meta-table @load-data="onLoadData($event)" @query_change="onQueryChange($event)" :translator="translator" :init_filter="init_filter" :lookup="lookup" :resources="resources" main_resource>
      <template v-slot:view_apn="{ fmtrow }">
        <v-chip label color="info">{{ fmtrow.apn }}</v-chip>
      </template>
    </flo-meta-table>
  </div>
</template>
<script>
import { mapActions } from "vuex";
import OTranslator from "~/src/otranslator.js";
export default {
  data: () => ({
    resource: "apn",
    resources: "apns",
    translator: null,
    init_filter: [],
    lookup: "",
  }),
  created() {
    this.initialize();
  },
  methods: {
    ...mapActions({
      clearResourceCache: "session/clearResourceCache",
    }),
    initialize() {
      if (this.$route.query.name) {
        this.init_filter = [
          {
            k: "apn",
            op: "equal",
            v: this.$route.query.name,
          },
        ];
      }
      this.translator = new OTranslator();
      this.translator.setTimeStamp("ts");
    },
    onLoadData(data) {
      for (const header of data.headers) {
        switch (header.value) {
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
