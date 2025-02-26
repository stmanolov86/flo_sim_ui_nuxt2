<template>
  <div class="flo-imp-exp">
    <v-container fluid class="ma-0 pa-0">
      <v-card flat min-width="600px">
        <v-card-title>
          <span class="headline text-capitalize">{{ formatDialogTitle() }}</span>
        </v-card-title>
        <v-card-text>
          <v-row no-gutters>
            <v-col cols="12" class="my-1 pa-1">
              <blockquote class="subtitle-1">
                <span v-html="formatDialogSubtitle()"></span>
              </blockquote>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <v-tabs v-model="tab" @change="onTabImportExportChange($event)">
                <v-tab v-for="(tab, i) in importExportTabs()" :key="i" :href="`#${tab.key}`" :disabled="tab.disabled"> {{ tab.value }} </v-tab>
              </v-tabs>
            </v-col>
          </v-row>

          <v-row no-gutters v-if="tab == 'import' && !disabled() && !local">
            <v-col cols="12" class="px-1">
              <v-row no-gutters>
                <v-col cols="12" class="pa-1">
                  <v-tabs :value="selected_imp_tab">
                    <v-tab v-for="tab in importExportCrudTabs()" @click="onTabImpChange(tab.key)" :key="tab.key" :disabled="tab.disabled">{{ tab.value }}</v-tab>
                  </v-tabs>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <v-tabs-items v-model="tab">
                <v-tab-item v-for="(tab, i) in importExportTabs()" :key="i" :value="tab.key">
                  <template v-if="tab.key == 'import'">
                    <v-container fluid class="ma-0 pa-0">
                      <v-card v-if="external || upload.file" flat class="ma-0 pa-0" :disabled="uploadInProgress()">
                        <slot name="external"> </slot>
                      </v-card>
                      <v-row v-else no-gutters>
                        <v-col cols="12" class="pa-1">
                          <v-file-input v-model="upload.file" :disabled="uploadInProgress()" :accept="accept" :error="upload.error" :error-messages="upload.error_message" @change="uploadChanged($event)" :truncate-length="$vuetify.breakpoint.xs ? 25 : 50" outlined dense clearable label="Upload File"></v-file-input>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12" class="pa-1">
                          <v-alert v-if="upload.failure_count > 0" outlined dense type="error"
                            >Import failures: {{ upload.failure_count }} out of
                            {{ upload.parsing_count }}
                          </v-alert>
                          <v-alert v-else-if="upload.progress != ''" outlined dense :type="`${upload.parse_error ? 'error' : 'success'}`">{{ upload.progress }} </v-alert>
                        </v-col>
                      </v-row>

                      <v-row v-if="upload.saved_count" no-gutters>
                        <v-col cols="12" class="pa-1">
                          <v-progress-linear active rounded striped :background-opacity="0.3" :height="15" :value="upload.saved_percent" color="light-blue">
                            <strong>{{ Math.floor(upload.saved_percent) }}%</strong>
                          </v-progress-linear>
                        </v-col>
                      </v-row>
                    </v-container>
                  </template>
                  <template v-else-if="tab.key == 'export'">
                    <v-container fluid class="ma-0 pa-0">
                      <v-card v-if="exportExternal()" flat class="ma-0 pa-0" :disabled="exportInProgress()">
                        <slot name="external"> </slot>
                      </v-card>
                      <v-row v-else no-gutters>
                        <v-col cols="12" class="pa-1">
                          <v-select v-model="exported.file_type" :items="exportFileTypes()" @change="onChange()" item-text="value" item-value="key" no-data-text="Unsupported file type." label="Select File Type" hide-details dense outlined></v-select>
                        </v-col>
                      </v-row>
                      <v-row v-if="exported.loading" no-gutters>
                        <v-col cols="12" class="pa-1">
                          <v-progress-linear active rounded :background-opacity="0.3" :height="15" indeterminate color="light-blue">
                            <strong>Fetching records, please wait...</strong>
                          </v-progress-linear>
                        </v-col>
                      </v-row>

                      <v-row v-if="exported.count" no-gutters>
                        <v-col cols="12" class="pa-1">
                          <v-progress-linear active rounded striped :background-opacity="0.3" :height="15" :value="exported.percent" color="light-blue">
                            <strong>{{ Math.floor(exported.percent) }}%</strong>
                          </v-progress-linear>
                        </v-col>
                      </v-row>
                    </v-container>
                  </template>
                </v-tab-item>
              </v-tabs-items>
            </v-col>
          </v-row>

          <v-row no-gutters v-if="upload.fields.length > 0">
            <v-col cols="12" class="pa-1">
              <v-card flat outlined class="ma-0 pa-0">
                <v-card-title class="ma-1 pa-1 align-center font-weight-regular title">{{ formatTitle() }}</v-card-title>
                <v-card-text class="ma-0 pa-0">
                  <v-container fluid class="ma-0 pa-0">
                    <v-row no-gutters v-if="exported.file_type == '.csv' && selected_imp_exp_tab == 1">
                      <v-col cols="12" lg="4" xl="4" class="pa-1">
                        <v-select v-model="delimiter" :disabled="uploadInProgress()" item-text="value" item-value="key" :items="delimiters" label="Select Delimiter" no-data-text="Unsupported delimiter." hint="Select CSV delimiter." persistent-hint dense outlined></v-select>
                      </v-col>
                    </v-row>
                    <v-row v-if="upload.dpkeys.length > 0 && selected_imp_tab != 0" no-gutters>
                      <v-col cols="12" lg="4" xl="4" class="pa-1">
                        <v-select v-model="upload.pkeys" :items="filterPrimarykeys()" :disabled="uploadInProgress()" item-text="value" item-value="key" label="Select Primary Keys" no-data-text="Unsupported Primary Key." multiple hide-details dense outlined></v-select>
                      </v-col>

                      <v-col cols="12" lg="4" xl="4" class="pa-1">
                        <v-select v-model="upload.ikeys" :items="filterIgnoredkeys()" :disabled="uploadInProgress()" item-text="value" item-value="key" label="Select Ignored Fields" no-data-text="Unsupported Ignore Fields." multiple hide-details dense outlined></v-select>
                      </v-col>
                    </v-row>

                    <v-row :key="external_data_key" no-gutters>
                      <v-col cols="12" class="pa-1">
                        <flo-meta-table :redraw="upload.saved_count" :local="true" :show_title="false" :show_reload="false" :single_page="false" :translator="translator" :resources="resources" :local_data="upload.fields" :local_meta="getLocalMeta()" :local_permissions="getLocalPermissions()">
                          <template v-slot:ex_new="{ fab, color, smAndDown }">
                            <v-btn :fab="fab" :small="smAndDown" :color="color" @click="_export(true)" :disabled="uploadInProgress()" v-if="canExportRes()">
                              <v-icon :left="!smAndDown">mdi-file-export</v-icon>
                              {{ !smAndDown ? "Export" : "" }}
                            </v-btn>
                          </template>
                          <template v-slot:view__result_status="{ fmtrow }">
                            <v-chip v-if="fmtrow._result_status" label :color="getStatusColor(fmtrow._result_status)">
                              {{ fmtrow._result_status }}
                            </v-chip>
                          </template>
                          <template v-slot:view__result_ts="{ fmtrow }">
                            <span v-if="fmtrow._result_ts">{{ helpers.toLocalTimeInIsoFormatUi(fmtrow._result_ts) }}</span>
                            <span v-else></span>
                          </template>
                        </flo-meta-table>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn v-if="!finished" color="primary" text @click="cancel()">Cancel</v-btn>
          <v-btn v-if="finished" color="primary" text @click="cancel()">Close</v-btn>
          <slot v-if="external" name="external_action"> </slot>
          <v-btn v-else-if="tab == 'import' && !finished" :disabled="disableExecute()" color="primary" text @click="_execute()">Execute</v-btn>
          <v-btn v-else-if="tab == 'export' && !finished" :disabled="disableExport()" color="primary" text @click="_export(false)">Export</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  name: "flo-imp-exp",
  components: {
    floMetaTable: () => import("./floMetaTable.vue"),
  },
  data: () => ({
    helpers,
    selected_imp_exp_tab: 0,
    selected_imp_tab: 0,
    translator: null,
    finished: false,
    tab: "",
    cancel_action: false,
    external_data_key: 0,
    imp_exp_permissions: null,
    delimiter: ",",
    delimiters: [
      { key: ",", value: "Comma" },
      // { key: ":", value: "Colon" },
      { key: ";", value: "Semicolon" },
      { key: "=", value: "Equal Sign" },
      // { key: " ", value: "Whitespace" },
      { key: "    ", value: "Tab" },
    ],
    exported: {
      file_type: "",
      loading: false,
      offset: 0,
      limit: 100,
      count: 0,
      percent: 0,
    },
    upload: {
      file: null,
      dialog: false,
      parsing_count: 0,
      reading_count: 0,
      saved_count: 0,
      saved_percent: 0,
      failure_count: 0,
      loading: false,
      progress: "",
      parse_error: false,
      error: false,
      error_message: "",
      path: "floLive",
      fields: [],
      headers: [],
      dpkeys: [],
      pkeys: [],
      ikeys: [],
    },
  }),
  props: {
    accept: {
      type: String,
      required: false,
    },
    resources: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      required: false,
    },
    permissions: {
      type: Object,
      required: false,
      default: null,
    },
    pkeys: {
      type: Array,
      required: false,
      default: () => [],
    },
    header_map: {
      type: Array,
      required: false,
      default: () => [],
    },
    headers: {
      type: Array,
      required: false,
      default: () => [],
    },
    hidden_filter: {
      type: Array,
      required: false,
      default: () => [],
    },
    external_data: {
      type: Array,
      required: false,
      default: () => [],
    },
    external: {
      type: Boolean,
      required: false,
      default: false,
    },
    export_limit: {
      type: Number,
      required: false,
      default: 15,
    },
    local: {
      type: Boolean,
      required: false,
      default: false,
    },
    local_permissions: {
      type: Object,
      required: false,
      default: null,
    },
    can_export: {
      type: Boolean,
      required: false,
    },
    can_import: {
      type: Boolean,
      required: false,
    },
  },
  watch: {
    external_data(val) {
      this.upload.fields = [];
      this.upload.headers = [];
      if (val.length > 0) {
        this.upload.fields = val;
        Object.keys(val[0]).map((m) => {
          this.upload.headers.push({ key: m.toLowerCase(), value: helpers.formatString(m) });
        });
        this.external_data_key++;
      }
      if (this.exportExternal()) {
        this.exported.file_type = this.accept;
      }
    },
  },
  created() {
    this.initialize();
  },
  mixins: [parseNetError, tellUser],
  methods: {
    initialize() {
      this.imp_exp_permissions = this.local_permissions ?? this.permissions;
      this.setDefaultTab();
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      this.translator = translator;
    },
    async load() {
      let l_data = [];
      this.upload.fields = [];
      this.cancel_action = false;

      if (this.exported.file_type == "csv") {
        await helpers
          .readFileAsText(this.upload.file)
          .then((text) => {
            let lines = text.split(/\r?\n/);
            let l_delimiter = this.delimiters.map((m) => m.key).filter((f) => lines[0].includes(f));
            let l_headers = [];

            if (l_delimiter.length > 0) {
              l_headers = helpers.parseCSV(lines[0], l_delimiter).map((m) => {
                this.upload.headers.push({ key: m.toLowerCase(), value: helpers.formatString(m) });

                return m.toLowerCase();
              });
            } else {
              l_headers.push(lines[0].toLowerCase());
              this.upload.headers.push({ key: lines[0].toLowerCase(), value: helpers.formatString(lines[0]) });
            }

            this.upload.loading = true;

            for (let i = 1; i < lines.length; i++) {
              if (lines[i].trim() == "") {
                continue;
              }

              let l_fields = [];
              if (l_delimiter.length > 0) {
                l_fields = helpers.parseCSV(lines[i], l_delimiter);
              } else {
                l_fields.push(lines[i]);
              }

              if (this.local) {
                if (this.resources == "campaign_participants") {
                  let has_iccid = l_headers.some((s) => s == "iccid");
                  if (!has_iccid) {
                    this.upload.error = true;
                    this.upload.error_message = "File is missing ICCID.";
                    return;
                  }

                  if (this.header_map.length > 0) {
                    if (this.header_map.length != l_headers.length) {
                      this.upload.error_message = `Expected headers: ${helpers.capitalizeAll(this.header_map, ",")} - found: ${helpers.capitalizeAll(l_headers, ",")}.`;
                      this.upload.error = true;

                      return;
                    }
                  }
                }
              }

              if (l_headers.length != l_fields.length) {
                this.upload.progress = `Error at line: ${i + 1}, ${l_headers.length} fields are expected, but ${l_fields.length} found.`;
                this.upload.parse_error = true;
                return;
              }

              let l_obj = {};
              for (let idx = 0; idx < l_headers.length; idx++) {
                l_obj[l_headers[idx]] = l_fields[idx];
              }

              l_data.push(l_obj);
              this.upload.fields = l_data;
              this.upload.reading_count++;
              this.upload.parsing_count++;
              this.upload.progress = `Lines: ${this.upload.reading_count}, Parsed: ${this.upload.reading_count}`;
            }
            this.upload.loading = false;
          })
          .catch((err) => {
            this.upload.progress = `Import error '${err}'.`;
            this.upload.parse_error = true;
          });
      }

      if (this.exported.file_type == "json") {
        await helpers
          .readFileAsText(this.upload.file)
          .then((text) => {
            this.upload.loading = true;
            l_data = JSON.parse(text);

            if (this.local) {
              if (!l_data.hasOwnProperty("type")) {
                this.upload.error = true;
                this.upload.error_message = "File has no type.";
                return;
              }
              if (l_data.type != `${this.module}/${this.resources.toLowerCase()}`) {
                this.upload.error = true;
                this.upload.error_message = "Resource mismatch.";
                return;
              }

              if (this.resources == "campaign_participants") {
                for (let i = 0; i < l_data.data.length; i++) {
                  const data = l_data.data[i];
                  if (!data.hasOwnProperty("iccid")) {
                    this.upload.error = true;
                    this.upload.error_message = `Data entry ${i + 1} is missing ICCID.`;

                    return;
                  }

                  if (this.header_map.length > 0) {
                    if (this.header_map.length != Object.keys(data).length) {
                      this.upload.error_message = `Expected headers for data entry ${i + 1}: ${helpers.capitalizeAll(this.header_map, ",")} - found: ${helpers.capitalizeAll(Object.keys(data), ",")}.`;
                      this.upload.error = true;

                      return;
                    }
                  }
                }
              }

              l_data = l_data.data;
            }

            let headers = Object.keys(l_data[0]).map((m) => {
              this.upload.headers.push({ key: m.toLowerCase(), value: helpers.formatString(m) });
              return m.toLowerCase();
            });

            for (let idx = 0; idx < l_data.length; idx++) {
              let data = Object.keys(l_data[idx]);

              if (headers.length != data.length) {
                this.upload.progress = `Error at line: ${idx + 1}, ${headers.length} fields are expected, but ${data.length} found.`;
                this.upload.parse_error = true;
                return;
              }

              this.upload.fields = l_data;
              this.upload.reading_count++;
              this.upload.parsing_count++;
              this.upload.progress = `Lines: ${this.upload.reading_count}, Parsed: ${this.upload.reading_count}`;
            }
          })
          .catch((err) => {
            this.upload.progress = `Import error '${err}'.`;
            this.upload.parse_error = true;
          });
      }

      if (l_data.length > 0) {
        let l_first = l_data[0];
        if (l_first.hasOwnProperty("id")) {
          this.upload.dpkeys.push("id");
          this.upload.pkeys.push("id");
        } else {
          let l_first_key = "";
          if (this.pkeys.length > 0) {
            l_first_key = this.pkeys[0];
          } else {
            l_first_key = Object.keys(l_first)[0];
          }
          this.upload.dpkeys.push(l_first_key);
          this.upload.pkeys.push(l_first_key);
        }
      }

      this.$emit("loaded", l_data);
      return l_data;
    },
    async _import(action) {
      let l_records = this.upload.fields;
      try {
        for (let i = 0; i < l_records.length; i++) {
          let record = l_records[i];

          // Do not allow to update TS
          if (record.hasOwnProperty("_result_ts")) {
            delete record._result_ts;
          }

          if (record.hasOwnProperty("_result_status")) {
            delete record._result_status;
          }

          if (record.hasOwnProperty("_result_message")) {
            delete record._result_message;
          }

          // Deep copy of the record
          let l_dc_record = JSON.parse(JSON.stringify(record));

          // List of record fields to ignore
          for (let i = 0; i < this.upload.ikeys.length; i++) {
            const ekey = this.upload.ikeys[i];
            if (l_dc_record.hasOwnProperty(ekey)) {
              delete l_dc_record[ekey];
            }
          }
          for (let key in l_dc_record) {
            if (typeof l_dc_record[key] == "string") {
              l_dc_record[key] = l_dc_record[key].trim();
            }
          }
          let l_it = {
            data: l_dc_record,
            pms: null,
            pkeys: this.upload.pkeys,
          };
          if (this.local) {
            l_it["type"] = `${this.module}/${this.resources.toLowerCase()}`;
          }

          this.$emit(action, l_it);

          try {
            if (l_it.pms === null) {
              return;
            }
            if (!this.local) {
              try {
                await l_it.pms;
                record["_result_ts"] = helpers.toLocalTimeInIsoFormat(Date.now());
                record["_result_status"] = 200;
                if (this.local) {
                  record["_result_message"] = "Resource added successfully.";
                } else {
                  record["_result_message"] = `Resource ${action}d successfully.`;
                }
              } catch (err) {
                let lerr = this.parseNetError(err);
                this.tellUser("error", lerr);
                record["_result_ts"] = helpers.toLocalTimeInIsoFormat(Date.now());
                record["_result_status"] = lerr.statusCode;
                record["_result_message"] = lerr.message;
              }
            }
          } catch (err) {
            this.upload.failure_count++;
            if (err.hasOwnProperty("response")) {
              let lerr = this.parseNetError(err);
              record["_result_ts"] = helpers.toLocalTimeInIsoFormat(Date.now());
              record["_result_status"] = lerr.statusCode;
              record["_result_message"] = lerr.message;
              this.tellUser("error", lerr);
            }
          }

          if (this.cancel_action) {
            return;
          }

          this.upload.saved_count++;
          this.upload.saved_percent = this.upload.saved_count / (this.upload.parsing_count / 100);
        }
        this.upload.saved_count = 0;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async fetch() {
      let l_final_data = [];
      let l_continue = true;
      let l_offset = 0;
      this.cancel_action = false;

      while (l_continue && !this.cancel_action) {
        let l_data = [];

        let l_it = {
          offset: l_offset,
          limit: this.exported.limit,
          pms: null,
        };
        this.$emit("fetch", l_it);

        if (l_it.pms === null) {
          return;
        }

        try {
          let l_pms = await l_it.pms;

          l_data = l_pms;

          if (!this.exported.loading) {
            this.exported.count++;
            this.exported.percent = this.exported.count / (this.exported.offset / this.exported.limit / 100);
          }

          if (l_it.limit > l_data.length) {
            l_continue = false;
          }

          l_offset += l_data.length;
          l_final_data = l_final_data.concat(l_data);
        } catch (err) {
          console.log(err);
        }
      }

      if (l_final_data.length > 0) {
        Object.keys(l_final_data[0]).map((m) => {
          this.upload.headers.push({ key: m.toLowerCase(), value: helpers.formatString(m) });
        });
      }

      this.exported.offset = l_offset;
      this.upload.fields = l_final_data;

      if (this.local) {
        if (this.exported.file_type.endsWith("json")) {
          let l_json = {
            type: `${this.module}/${this.resources.toLowerCase()}`,
            data: l_final_data,
          };
          l_final_data = l_json;
        }
      }
      this.$emit("export-data", l_final_data);
      this.exported.count = 0;
      return l_final_data;
    },
    async _execute() {
      let l_action = "";
      this.scrollToTop();
      switch (this.selected_imp_tab) {
        case 0:
          await this._import("create");
          this.finished = true;
          break;
        case 1:
          if (this.canUpdate()) {
            l_action = "update";
          } else {
            l_action = "delete";
          }
          await this._import(l_action);
          this.finished = true;
          break;
        case 2:
          await this._import("delete");
          this.finished = true;
          break;
      }
    },
    async _export(local) {
      let l_data = [];
      let l_type = this.exported.file_type.trim();
      this.scrollToTop();

      if (local) {
        l_data = this.upload.fields;
      } else if (this.external_data.length > 0 && this.exportExternal()) {
        l_data = this.upload.fields;
      } else {
        l_data = await this.fetch();
      }
      if (l_data) {
        l_data = l_data.map((m) =>
          Object.entries(m).reduce((mapped, [k, v]) => {
            mapped[k] = null;
            let type = typeof v;
            switch (type) {
              case "object":
                mapped[k] = JSON.parse(JSON.stringify(v));
                break;
              case "string":
                mapped[k] = v.trim();
                break;
              default:
                mapped[k] = v;
                break;
            }
            return mapped;
          }, {}),
        );

        if (l_type.endsWith("json")) {
          let blob = new Blob([JSON.stringify(l_data, null, 2)], { type: "text/json" });
          let url = URL.createObjectURL(blob);
          let link = document.createElement("a");
          link.href = url;
          link.download = `${this.resources.toLowerCase()}.json`;
          link.click();
          link.remove();
        }

        if (l_type.endsWith("csv")) {
          let l_csv = helpers.JSONToXSV(l_data, this.delimiter);
          let link = document.createElement("a");
          link.href = "data:text/csv;charset=utf-8," + encodeURI(l_csv);
          link.download = `${this.resources.toLowerCase()}.csv`;
          link.click();
          link.remove();
        }
      }

      this.finished = true;
    },
    scrollToTop() {
      document.getElementsByClassName("flo-imp-exp")[0].scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest", scrollMode: "always" });
    },
    cancel() {
      this.setDefaultTab();
      this.clear();
      this.$emit("cancel");
    },
    setDefaultTab() {
      let importExportCrudTabs = this.importExportCrudTabs();
      if (importExportCrudTabs.length > 0) {
        this.selected_imp_tab = importExportCrudTabs[0].key;
      }
    },
    async uploadChanged(event) {
      this.clear();
      if (event) {
        if (!event.type) {
          this.upload.error = true;
          this.upload.error_message = "File has no type.";
          return;
        }

        this.exported.file_type = event.name.slice(((event.name.lastIndexOf(".") - 1) >>> 0) + 2);
        if (!this.accept.includes(this.exported.file_type)) {
          this.upload.error = true;
          this.upload.error_message = "Unsupported file type.";
          return;
        }
        this.upload.file = event;

        await this.load();
      }
    },
    uploadInProgress() {
      return this.upload.saved_count !== 0;
    },
    exportInProgress() {
      return this.exported.count !== 0;
    },
    clear() {
      this.exported.offset = 0;
      this.exported.count = 0;
      this.upload.reading_count = 0;
      this.upload.parsing_count = 0;
      this.upload.failure_count = 0;
      this.upload.saved_count = 0;
      this.upload.progress = "";
      this.upload.parse_error = "";
      this.upload.error_message = "";
      this.upload.fields = [];
      this.upload.headers = [];
      this.upload.dpkeys = [];
      this.upload.pkeys = [];
      this.upload.ikeys = [];
      this.upload.file = null;
      this.upload.error = false;
      this.cancel_action = true;
      this.finished = false;
      this.exported.file_type = "";
    },
    disabled() {
      let disabled = false;

      if (!this.upload.file || this.upload.error || this.upload.parse_error || this.upload.saved_count) {
        disabled = true;
      }

      return disabled;
    },
    disableExecute() {
      let disabled = false;
      if (this.disabled()) {
        disabled = true;
      }
      return disabled;
    },
    disableExport() {
      let disabled = false;

      if (!this.exported.file_type) {
        disabled = true;
      } else if (this.upload.fields.length == 0) {
        disabled = true;
      } else {
        disabled = false;
      }

      return disabled;
    },
    getStatusColor(status) {
      switch (status) {
        case 0:
          return "info";
        case 100:
          return "info";
        case 101:
          return "accent";
        case 200:
          return "success";
        case 400:
          return "error";
        case 404:
          return "error";
        case 500:
          return "error";
        default:
          return "warning";
      }
    },
    exportFileTypes() {
      let l_file_types = [];

      l_file_types = this.accept.split(",").map((m) => {
        let l_accept = {
          key: m,
          value: `Export as ${m} file.`,
        };

        return l_accept;
      });

      return l_file_types;
    },
    filterPrimarykeys() {
      let l_keys = [];

      if (this.upload.headers.length > 0) {
        l_keys = this.upload.headers.filter((f) => !this.upload.ikeys.includes(f.key));
      }
      if (this.pkeys.length > 0) {
        l_keys = l_keys.filter((f) => this.pkeys.includes(f.key));
      }
      return l_keys;
    },
    filterIgnoredkeys() {
      let l_keys = [];

      if (this.upload.headers.length > 0) {
        l_keys = this.upload.headers.filter((f) => !this.upload.pkeys.includes(f.key));
      }

      return l_keys;
    },
    formatTitle() {
      let l_resources = helpers.formatString(this.resources);
      let titleMap = {
        0: `${this.canCreate() ? "Create" : "Delete"} ${l_resources}`,
        1: `${this.canUpdate() ? "Update" : "Delete"} ${l_resources}`,
        2: `Delete ${l_resources}`,
      };

      if (this.selected_imp_exp_tab || this.exportExternal()) {
        return `Export ${l_resources}`;
      }
      return titleMap[this.selected_imp_tab];
    },
    formatDialogTitle() {
      let formatted = this.helpers.formatString(this.resources);
      let importText = this.can_import ? `Import ${formatted}` : "";
      let exportText = this.can_export ? `Export ${formatted}` : "";

      return this.can_import && this.can_export ? `Import/Export ${formatted}` : importText + exportText;
    },
    formatDialogSubtitle() {
      let length = this.accept.split(",").length;
      let subtitle = `Note: Supported file ${length == 1 ? "type is" : "types are"} <code>${this.accept}</code> with the following headers:`;

      let headers = [];
      if (this.headers.length > 0) {
        headers = this.headers
          .filter((f) => f.hasOwnProperty("value") && f.value != "id" && f.value != "action" && f.type != "timestamp")
          .map((f) => {
            return f.value;
          });
      }

      let formattedHeaders = headers.join(", ");

      return `${subtitle}<br /><code class="text-uppercase">${formattedHeaders}</code>`;
    },

    async onChange() {
      this.exported.loading = true;
      await this.fetch();
      this.exported.loading = false;
    },
    onTabImportExportChange(event) {
      if (event) {
        this.tab = event;
        this.clear();
        this.$emit("on_tab_imp_exp_change", event);
      }
    },
    onTabImpChange(event) {
      let found = this.importExportCrudTabs().find((f) => f.key == event);
      if (found) {
        this.selected_imp_tab = event;
      }

      this.upload.reading_count = 0;
      this.upload.failure_count = 0;
      this.upload.saved_count = 0;
      this.upload.progress = "";
      this.upload.parse_error = "";
      this.upload.error_message = "";
      this.upload.error = false;
      this.$emit("on_tab_imp_change", event);
    },
    importExportTabs() {
      let tabs = [
        { key: "import", value: "Import", visible: this.canImport(), disabled: this.uploadInProgress() },
        { key: "export", value: "Export", visible: this.canExport(), disabled: this.uploadInProgress() },
      ];

      return tabs.filter((f) => f.visible);
    },
    importExportCrudTabs() {
      let tabs = [
        { key: 0, value: "Create", visible: this.canCreate(), disabled: this.uploadInProgress() },
        { key: 1, value: "Update", visible: this.canUpdate(), disabled: this.uploadInProgress() },
        { key: 2, value: "Delete", visible: this.canDelete(), disabled: this.uploadInProgress() },
      ];

      return tabs.filter((f) => f.visible);
    },
    canImport() {
      return this.imp_exp_permissions.r && this.can_import;
    },
    canExport() {
      return this.imp_exp_permissions.r && this.can_export;
    },
    exportExternal() {
      const tabs = this.importExportTabs();
      return this.external && tabs.length == 1 && tabs[0].key == "export";
    },
    canCreate() {
      return this.imp_exp_permissions.c;
    },
    canUpdate() {
      return this.imp_exp_permissions.u;
    },
    canDelete() {
      return this.imp_exp_permissions.d;
    },
    canExportRes() {
      let l_export_res = false;
      if (this.upload.fields.length > 0) {
        let last = this.upload.fields[this.upload.fields.length - 1];
        if (last.hasOwnProperty("status") && last.hasOwnProperty("message")) {
          l_export_res = true;
        }
      }
      return l_export_res;
    },
    getLocalPermissions() {
      return this.local_permissions ?? { res: this.resources, c: false, r: false, u: false, d: false, e: false };
    },
    getLocalMeta() {
      let l_meta = {
        crud: {
          c: false,
          d: false,
          r: true,
          u: false,
        },
        indexes: {
          primary: {
            0: "pos",
          },
        },
        isolated: true,
        item_name: this.helpers.formatString(this.resources),
        limit: 100,
        screen_name: `${this.helpers.formatString(this.resources)}s`,
        group: "none",
        table: "none",
        keys: {},
      };

      this.upload.headers.map((m) => {
        let found = this.headers.find((f) => f.value == m.key);
        if (found && m.key != "ts") {
          l_meta.keys[m.key] = {
            default: "",
            desc: helpers.formatString(m.key),
            hint: found.hint,
            sortable: found.sortable,
            type: found.type,
            disable_edit: found.disable_edit,
            disable_new: found.disable_new,
            view: found.view,
            edit: found.edit,
          };
        }
      });

      l_meta.keys["_result_status"] = {
        default: "",
        desc: "Status",
        hint: "Status",
        sortable: true,
        type: "number",
        disable_edit: true,
        disable_new: true,
        view: true,
        edit: true,
      };
      l_meta.keys["_result_message"] = {
        default: "",
        desc: "Message",
        hint: "Message",
        sortable: true,
        type: "string",
        disable_edit: true,
        disable_new: true,
        view: true,
        edit: true,
      };

      return l_meta;
    },
  },
};
</script>
