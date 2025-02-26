<template>
  <div>
    <flo-meta-table v-if="translator !== null" @query="onQuery($event)" @load-data="onLoadData($event)" :translator="translator" :resources="resources" main_resource>
      <template v-slot:view_version="{ fmtrow }">
        <v-chip v-if="fmtrow.version" label color="info">{{ fmtrow.version }}</v-chip>
      </template>
    </flo-meta-table>
  </div>
</template>
<script>
import floMetaTable from "~/components/crud/floMetaTable.vue";
import OTranslator from "~/src/otranslator.js";
export default {
  data: () => ({
    resources: "schema_versions",
    translator: null,
  }),
  components: {
    floMetaTable,
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      let translator = new OTranslator();
      translator.setTimeStamp("stms");
      translator.setTimeStamp("ts");
      this.translator = translator;
    },
    onQuery(query) {
      query["orderby"] = { id: { o: "desc" } };
    },
    onLoadData(data) {
      for (const header of data.headers) {
        switch (header.value) {
          case "id":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "ts":
            {
              header.view = false;
              header.disable_new = true;
              header.disable_new = true;
            }
            break;
        }
      }
    },
  },
};
</script>
