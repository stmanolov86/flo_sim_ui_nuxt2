<template>
  <div>
    <flo-meta-table @load-data="onLoadData($event)" :translator="translator" :resources="resources" main_resource>
      <template v-slot:view_imsi="{ fmtrow }">
        <span>{{ fmtrow.imsi }}</span>
        <v-btn
          class="ml-2"
          icon
          elevation="0"
          router
          :to="{
            path: '/resources/subscribers/',
            query: { imsi: fmtrow.imsi },
          }"
        >
          <v-icon center color="info">mdi-link</v-icon>
        </v-btn>
      </template>
    </flo-meta-table>
  </div>
</template>
<script>
import OTranslator from "~/src/otranslator.js";
export default {
  data: () => ({
    resource: "boot",
    resources: "boots",
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
