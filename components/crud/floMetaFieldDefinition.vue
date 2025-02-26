<template>
  <div class="flo-meta-field-definition">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col cols="12" class="pa-1">
          <flo-meta-table :disableNew="readonly" :disabledEdit="readonly" :disableExport="readonly" @cancel-local-changes="onCancelLocalChanges($event)" @save-local-changes="onSaveLocalChanges($event)" @import-export-create="onImportExportCreate($event)" @load-data="onLoadData($event)" :header_map="header_map" :local_meta="getLocalMeta('parameter')" :local_data="getLocalData()" :local_permissions="getLocalPermissions()" :resources="resources" :module="module" import_export :single_page="false" :show_filter="false" :disable_sort="true" :local="true" :local_delete="true" :show_title="false" :show_reload="false" :can_import="can_import" :can_export="can_export" @element-move="onUnsavedAction(true)" @post-import="onUnsavedAction(true)" @post-new="onUnsavedAction(true)" @post-update="onUnsavedAction(true)" @post-delete="onUnsavedAction(true)" @post-delete-all="onUnsavedAction(true)">
            <template v-slot:view_default="{ fmtrow }">
              {{ shrinkBigLine(fmtrow.default) }}
            </template>
          </flo-meta-table>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  name: "flo-meta-field-definition",
  data() {
    return { helpers };
  },
  props: {
    value: {
      type: Object,
      required: true,
      default: null,
    },
    resources: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      required: true,
    },
    local: {
      type: Boolean,
      required: false,
      default: false,
    },
    local_meta: {
      type: Object,
      required: false,
      default: null,
    },
    local_permissions: {
      type: Object,
      required: false,
      default: null,
    },
    local_data: {
      type: Array,
      required: false,
      default: () => [],
    },
    header_map: {
      type: Array,
      required: false,
      default: () => [],
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
    can_export: {
      type: Boolean,
      required: false,
      default: true,
    },
    can_import: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  mixins: [tellUser, parseNetError],
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
          case "pattern":
            {
              header.view = false;
              header.edit = true;
              header.disable_edit = false;
              header.disable_new = false;
            }
            break;
          case "pos":
            {
              header.view = false;
              header.edit = false;
              header.disable_edit = false;
              header.disable_new = false;
            }
            break;
        }
      }
    },
    getLocalPermissions() {
      let l_permissions = [];
      let user_permissions = this.$store.state.session.permissions;

      if (this.local_permissions) {
        l_permissions = this.local_permissions;
      } else {
        l_permissions = user_permissions.find((p) => this.resources == p.res);
      }

      return l_permissions;
    },
    getLocalMeta(val) {
      let l_meta = null;

      if (this.local_meta) {
        l_meta = this.local_meta;
      } else {
        l_meta = {
          crud: {
            c: true,
            d: true,
            r: true,
            u: true,
          },

          indexes: {
            primary: {
              0: "pos",
            },
          },

          isolated: true,
          item_name: this.helpers.capitalizeFLetter(val),
          limit: 100,
          screen_name: `${this.helpers.capitalizeFLetter(val)}s`,
          group: "none",
          table: "none",
          keys: {
            pos: {
              default: 1,
              desc: "Pos",
              hint: "Position",
              nullable: false,
              pattern: "^[0-9]*$",
              scale: 0,
              size: 10,
              type: "number",
            },
            name: {
              default: "",
              desc: "Name",
              hint: "Item Name",
              nullable: false,
              pattern: "^[0-9a-z._]*$",
              scale: null,
              size: 50,
              type: "string",
            },
            desc: {
              default: "",
              desc: "Description",
              hint: "Item Description",
              nullable: false,
              pattern: "^[^\\s].*[^\\s]$",
              scale: null,
              size: 250,
              type: "string",
            },
            hint: {
              default: "",
              desc: "Hint",
              hint: "Item Hint",
              nullable: false,
              pattern: ".*",
              scale: null,
              size: 250,
              type: "string",
            },
            default: {
              default: "",
              desc: "Default",
              hint: "Default Value",
              nullable: false,
              pattern: ".*",
              scale: null,
              size: 250,
              type: "string",
            },
            origin: {
              default: "participants",
              desc: "Origin",
              hint: "Origin",
              nullable: false,
              pattern: "enum",
              scale: null,
              size: 250,
              type: "string",
              enum: [
                { key: "campaign", value: "Campaign" },
                { key: "participants", value: "Participants" },
              ],
            },
            type: {
              default: "string",
              desc: "Type",
              hint: "Data Type",
              nullable: false,
              pattern: "enum",
              scale: null,
              size: 250,
              type: "string",
              enum: [
                { key: "string", value: "String" },
                { key: "boolean", value: "Boolean" },
                { key: "number", value: "Number" },
              ],
            },
            pattern: {
              default: ".*$",
              desc: "Pattern",
              hint: "Validation Pattern",
              nullable: false,
              pattern: ".*",
              scale: null,
              size: 250,
              type: "string",
            },
            required: {
              default: 1,
              desc: "Required",
              nullable: false,
              pattern: "^[01]$",
              scale: 0,
              size: 1,
              type: "boolean",
            },
          },
        };
      }

      return l_meta;
    },
    getLocalData() {
      let l_recs = JSON.parse(JSON.stringify([]));

      if (this.local) {
        l_recs = this.local_data;
      } else {
        let l_param = this.getParam();
        if (!l_param) {
          return l_recs;
        }

        if (!l_param.hasOwnProperty("data")) {
          return l_recs;
        }

        let l_data = l_param.data;

        l_recs = JSON.parse(JSON.stringify(l_data));
      }

      return l_recs;
    },
    shrinkBigLine(p_line) {
      let l_msg = p_line;
      if (l_msg.length > 64) {
        l_msg = l_msg.substr(0, 64) + " ...";
      }
      return l_msg;
    },
    onUnsavedAction(action) {
      this.$emit("unsaved-action", action);
    },
    getParam() {
      if (!this.value.hasOwnProperty("param_def")) {
        return null;
      }
      return this.value.param_def;
    },
    onSaveLocalChanges(event) {
      let l_val = this.getParam();

      if (!l_val) {
        l_val = {};
      }

      let lrecs = event.records;
      for (let i = 0; i < lrecs.length; i++) {
        let lro = lrecs[i];
        lro.pos = i + 1;

        if (lro.type == "number") {
          lro.default = +lro.default;
        } else if (lro.type == "boolean") {
          lro.default = +lro.default;
        }
      }

      l_val.data = lrecs;
      this.$emit("save-local-changes", l_val);
    },
    onImportExportCreate(event) {
      this.$emit("import-export-create", event);
    },
    onCancelLocalChanges(event) {
      event.records = this.getLocalData();
      this.onUnsavedAction(false);
    },
  },
};
</script>
