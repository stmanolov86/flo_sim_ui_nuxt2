<template>
  <div>
    <flo-meta-table @load-data="onLoadData($event)" @pre-new="onPreNew($event)" :translator="translator" :hidden_filter="hidden_filter" :resources="resources"></flo-meta-table>
  </div>
</template>
<script>
import OTranslator from "~/src/otranslator.js";
export default {
  data: () => ({
    resource: "imei_range",
    resources: "imei_ranges",
    translator: null,
    hidden_filter: [],
    imeis: "",
  }),
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      this.imeis = this.$route.query.name;
      this.hidden_filter = [
        {
          k: "name",
          op: "equal",
          v: this.$route.query.name,
        },
      ];
      let translator = new OTranslator();
      translator.setEnum("apn_mode", "apn_mode");
      translator.setTimeStamp("ts");
      this.translator = translator;
    },
    onPreNew(data) {
      data.record.name = this.imeis;
    },
    onLoadData(data) {
      for (const header of data.headers) {
        switch (header.value) {
          case "name":
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
  },
};
</script>
