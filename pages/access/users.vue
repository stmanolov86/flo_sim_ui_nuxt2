<template>
  <div>
    <flo-meta-table @query="onQuery($event)" @pre-new="onPreNew($event)" @pre-edit="onPreEdit($event)" @load-data="onLoadData($event)" :translator="translator" :show_filter="show_filter" :lookup="lookup" :item_title="resource" :title="resources" :resources="resources" main_resource>
      <template v-slot:edit_path="{ fmtheader, fmtrow }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <flo-account-select v-if="fmtrow.path !== 'undefined'" v-model="fmtrow.path" :label="fmtheader.text" :hint="fmtheader.hint" persistent-hint />
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
    resource: "user",
    resources: "users",
    translator: null,
    lookup: "",
    show_filter: false,
  }),
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      this.lookup = this.$route.query.name;
      this.translator = new OTranslator();
      this.translator.setTimeStamp("ts");
    },
    onQuery(query) {
      query["select"] = { id: {}, name: {}, email: {}, last_seen: {}, ts: {} };
    },
    onLoadData(data) {
      data.headers.push({
        text: "Parent Account",
        align: "",
        sortable: true,
        value: "path",
        type: "string",
        pattern: ".*",
        disable_edit: true,
        disable_new: false,
        view: false,
        edit: true,
      });

      for (const header of data.headers) {
        switch (header.value) {
          case "email":
          case "name":
            {
              header.align = "start";
            }
            break;
          case "password":
          case "attr":
          case "session_expire":
            {
              header.edit = false;
              header.view = false;
            }
            break;
          case "last_ip":
            {
              header.edit = false;
              header.view = false;
            }
            break;
          case "last_seen":
            {
              header.edit = false;
              header.view = true;
            }
            break;
          case "id":
          case "uuid":
            {
              header.view = true;
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
        }
      }
    },
    onNewSave(event) {
      if (this.account.hasOwnProperty("uuid")) {
        event.update.path = this.account.path;
      }
    },
    onEditSave(event) {
      if (this.account.hasOwnProperty("uuid")) {
        event.update.path = this.account.path;
      }
    },
    onAccountInput(event) {
      this.account = event;
    },
    onPreNew(data) {
      data.record["path"] = this.$store.state.session.membership.path;
    },
    onPreEdit(data) {
      data.continue = false;
      this.$router.push({
        path: "/access/user/",
        query: { id: data.record.id, email: data.record.email },
      });
    },
  },
};
</script>
