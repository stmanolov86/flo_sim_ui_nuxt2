<template>
  <div>
    <flo-meta-table @load-data="onLoadData($event)" :translator="translator" :resources="resources"> </flo-meta-table>
  </div>
</template>
<script>
import OTranslator from "~/src/otranslator.js";
export default {
  data: () => ({
    resources: "imsi_domains",
    translator: null,
  }),
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
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
  },
};
</script>
