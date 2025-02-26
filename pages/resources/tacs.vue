<template>
  <div>
    <flo-meta-table @load-data="onLoadData($event)" :resources="resources" :translator="translator" item_title="Equipment" main_resource>
      <template v-slot:view_tac="{ fmtrow, fmtpermissions }">
        <v-container class="d-flex flex-nowrap">
          <span class="align-self-center text-center ml-n3">{{ fmtrow.tac }}</span>
          <v-btn
            class="ml-1"
            icon
            elevation="0"
            router
            :disabled="!fmtpermissions.r"
            :to="{
              path: '/resources/tac/',
              query: { id: fmtrow.id },
            }"
          >
            <v-icon center color="info">mdi-link</v-icon>
          </v-btn>
        </v-container>
      </template>
    </flo-meta-table>
  </div>
</template>
<script>
import OTranslator from "~/src/otranslator.js";
export default {
  data: () => ({
    resource: "tac",
    resources: "tacs",
    translator: null,
  }),
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      this.translator = translator;
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
