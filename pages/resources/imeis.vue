<template>
  <div>
    <flo-meta-table @load-data="onLoadData($event)" @query_change="onQueryChange($event)" :translator="translator" :resources="resources" main_resource>
      <template v-slot:edit_path="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <flo-account-select v-model="fmtrow.path" :label="fmtheader.text" :disabled="!fmtpermissions.u" :hint="fmtheader.hint" persistent-hint />
        </v-col>
      </template>

      <template v-slot:view_name="{ fmtrow, fmtpermissions }">
        <span>{{ fmtrow.name }}</span>
        <v-btn
          class="ml-1"
          icon
          elevation="0"
          router
          :disabled="!fmtpermissions.u"
          :to="{
            path: '/resources/imei_ranges/',
            query: { name: fmtrow.name },
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
import helpers from "~/src/helpers.js";
import { mapActions } from "vuex";
export default {
  data: () => ({
    helpers,
    resource: "imei",
    resources: "imeis",
    translator: null,
  }),
  created() {
    this.initialize();
  },
  methods: {
    ...mapActions({
      clearResourceCache: "session/clearResourceCache",
    }),
    onLoadData(data) {
      for (const header of data.headers) {
        switch (header.value) {
          case "name":
            {
              header.disable_edit = true;
              header.disable_new = false;
            }
            break;
          case "id":
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "aid":
          case "aname":
            {
              header.view = false;
              header.edit = false;
            }
            break;
          case "path":
            {
              header.view = false;
            }
            break;
        }
      }
    },
    initialize() {
      this.translator = new OTranslator();
      this.translator.setTimeStamp("ts");
    },
    onQueryChange() {
      this.clearResourceCache({ module: "main", resource: this.resources });
    },
  },
};
</script>
