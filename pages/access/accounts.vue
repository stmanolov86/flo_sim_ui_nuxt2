<template>
  <div>
    <flo-meta-table @query="onQuery($event)" @pre-new="onPreNew($event)" @pre-edit="onPreEdit($event)" @load-data="onLoadData($event)" :translator="translator" :init_filter="init_filter" :lookup="lookup" :item_title="resource" :title="resources" :resources="resources" disableNew disabledEdit main_resource>
      <template v-slot:view_name="{ fmtrow }">
        <v-chip label color="info">{{ fmtrow.name }}</v-chip>
      </template>

      <template v-slot:edit_path="{ fmtheader, fmtrow }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <flo-account-select v-model="fmtrow.path" :label="fmtheader.text" :hint="fmtheader.hint" disabled persistent-hint />
        </v-col>
      </template>
    </flo-meta-table>
  </div>
</template>
<script>
import OTranslator from "~/src/otranslator.js";
import helpers from "~/src/helpers.js";
export default {
  data: () => ({
    helpers,
    resource: "account",
    resources: "accounts",
    translator: null,
    init_filter: [],
    lookup: "",
  }),
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      this.translator = new OTranslator();
      this.translator.setTimeStamp("ts");
    },
    onQuery(query) {
      query["select"] = { id: {}, name: {}, description: {}, session_expire: {}, path: {}, ts: {} };
    },
    onLoadData(data) {
      for (const header of data.headers) {
        switch (header.value) {
          case "name":
            {
              header.align = "start";
            }
            break;
          case "attr":
            {
              header.edit = false;
              header.view = false;
            }
            break;
          case "session_expire":
            {
              header.view = false;
              header.disable_new = true;
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
    onPreNew(data) {
      data.record.path = this.$store.state.session.membership.path;
    },
    onPreEdit(data) {
      data.continue = false;
      this.$router.push({
        path: "/access/account/",
        query: { id: data.record.id, name: data.record.name },
      });
    },
  },
};
</script>
