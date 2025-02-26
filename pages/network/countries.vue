<template>
  <div>
    <flo-meta-table @load-data="onLoadData($event)" :translator="translator" :init_filter="init_filter" :resources="resources" main_resource>
      <template v-slot:ex_new="{ fab, color, smAndDown }">
        <v-btn :fab="fab" :small="smAndDown" class="mr-1" :color="color" router :to="{ path: '/network/operators/' }">
          <v-icon :left="!smAndDown">mdi-radio-tower</v-icon>
          {{ !smAndDown ? "Operators" : "" }}
        </v-btn>
      </template>
      <template v-slot:view_mcc="{ fmtrow }">
        <v-chip label color="info">{{ fmtrow.mcc }}</v-chip>
      </template>
      <template v-slot:view_country="{ fmtrow }">
        <v-chip label color="info">{{ helpers.capitalizeAllFLetter(fmtrow.country, " ") }}</v-chip>
      </template>
      <template v-slot:view_continent="{ fmtrow }">
        {{ helpers.capitalizeAllFLetter(fmtrow.continent, " ") }}
      </template>
    </flo-meta-table>
  </div>
</template>
<script>
import OTranslator from "~/src/otranslator.js";
import helpers from "~/src/helpers.js";
export default {
  data: () => ({
    resource: "country",
    resources: "countries",
    translator: null,
    init_filter: [],
    helpers,
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
          case "mcc":
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
  },
};
</script>
