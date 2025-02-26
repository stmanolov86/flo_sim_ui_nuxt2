<template>
  <div class="flo-uicc">
    <v-card flat outlined class="ma-0 pa-0">
      <v-card-text class="ma-0 pa-0">
        <v-container fluid class="ma-0 pa-0">
          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <div class="headline">
                UICC: {{ uicc.name }}
                <v-chip v-if="uicc.hasOwnProperty('state')" label class="text-capitalize" :color="getStateColor(uicc.state)">{{ uicc.state }}</v-chip>
              </div>
              <v-row no-gutters>
                <v-col cols="9">
                  <blockquote class="blockquote font-weight-light">
                    Id: <code>{{ uicc.id }}</code>
                    <span v-if="uicc.description != ''">
                      , Description: <code>{{ uicc.description }}</code></span
                    >
                  </blockquote>
                </v-col>
                <div class="flex-grow-1"></div>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" class="mt-5 mr-1" color="primary" :loading="loader" :disabled="loader || !crud.e" @click="exportAll()">
                      <v-icon left>mdi-file-export</v-icon>
                      Export</v-btn
                    >
                  </template>
                  <span>Exports UICC EC Profile, Applications & Key Store</span>
                </v-tooltip>

                <v-btn class="mt-5" v-if="uicc.state == 'active'" color="primary" @click="changeState('deprecate')" :disabled="!crud.e">
                  <v-icon left>mdi-progress-alert</v-icon>
                  Deprecate</v-btn
                >
                <v-btn class="mt-5" v-if="uicc.state == 'deprecated'" color="primary" @click="changeState('activate')" :disabled="!crud.e">
                  <v-icon left>mdi-progress-check</v-icon>
                  Activate</v-btn
                >
              </v-row>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Details" elevation="5">
                <template v-slot:content="{}">
                  <flo-meta-resource-view :value="uicc" resources="uiccs" :ignore="['action']" :translator="translator"></flo-meta-resource-view>
                </template>
              </flo-expand>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Profile" open elevation="5">
                <template v-slot:content="{}">
                  <v-row v-if="Object.keys(formattedTitle()).length > 0" no-gutters>
                    <v-col cols="12" class="ma-1 pa-1 align-center font-weight-regular title">
                      <span class="info--text">Version: </span><span>{{ formattedTitle().version }}, </span> <span class="info--text">revision: </span><span>{{ formattedTitle().revision }}, </span> <span class="info--text">updated at: </span><span>{{ formattedTitle().ts }} </span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="12" class="pa-1">
                      <flo-rfs-field label="Upload Electrical Profile" resource="uiccs" field="ec" :id="uicc.id" accept=".json" @change="electrical_profile_changed($event)" :disabled="!hasPermissionToEdit()"></flo-rfs-field>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="12" class="pa-1">
                      <flo-ec-json v-if="jec" :value="jec" :uicc="uicc" @vf_update="updateVf($event)" @update="updateEc" :readonly="!hasPermissionToEdit()" />
                    </v-col>
                  </v-row>
                </template>
              </flo-expand>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Virtual Files" elevation="5">
                <template v-slot:content="{}">
                  <v-container fluid>
                    <v-row no-gutters>
                      <v-col cols="12" class="pa-1">
                        <flo-meta-table :key="vf_key" v-if="translator !== null" @load-data="onLoadVfData($event)" @pre-new="onPreNewVf($event)" @pre-edit="onPreEditVf($event)" @pre-import-export-create="onPreImportExportCreate($event)" :disableNew="!hasPermissionToEdit()" :disabledEdit="!hasPermissionToEdit()" :can_import="hasPermissionToEdit()" :title="title" :show_title="false" :translator="translator" :hidden_filter="vf_hidden_filter" accept=".json" dialogWidth="1400px" resources="vfile_definitions">
                          <template v-slot:view_type="{ fmtrow }">
                            <v-chip v-if="fmtrow.type" label :color="getType(fmtrow.type).color">{{ getType(fmtrow.type).type }}</v-chip>
                          </template>

                          <template v-slot:edit_fields="{ fmtheader, fmtrow }">
                            <v-col :__qa="helpers.getQATag('vfile_definitions', fmtheader)" cols="12" class="pa-1">
                              <flo-virtual-field-table :readonly="!hasPermissionToEdit()" :resource="fmtrow" :value="formatVirtualFields(fmtrow.fields)" />
                            </v-col>
                          </template>
                        </flo-meta-table>
                      </v-col>
                    </v-row>
                  </v-container>
                </template>
              </flo-expand>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Applications" elevation="5">
                <template v-slot:content="{}">
                  <v-container fluid>
                    <v-row no-gutters>
                      <v-col cols="12" class="pa-1">
                        <flo-meta-table v-if="translator !== null" @load-data="onLoadData($event)" @pre-new="onPreNew($event)" @pre-edit="onPreEdit($event)" @pre-import-export-create="onPreImportExportCreate($event)" :disableNew="!hasPermissionToEdit()" :disabledEdit="!hasPermissionToEdit()" :can_import="hasPermissionToEdit()" :title="title" :show_title="false" :show_filter="false" :show_search="true" :translator="translator" resources="uicc_aids" :hidden_filter="hidden_filter" accept=".json">
                          <template v-slot:edit_uicc_id="{ fmtheader, fmtrow }">
                            <v-col :__qa="helpers.getQATag('uicc_aids', fmtheader)" cols="12" lg="6" xl="6">
                              <v-select v-model="fmtrow.uicc_id" :items="uname" :label="fmtheader.text" :disabled="fmtheader.disable_edit" filled item-text="value" item-value="key"></v-select>
                            </v-col>
                          </template>
                          <template v-slot:edit_uaid="{ fmtheader, fmtrow }">
                            <v-col :__qa="helpers.getQATag('uicc_aids', fmtheader)" cols="12" lg="6" xl="6">
                              <flo-aid :disabled="!hasPermissionToEdit()" v-model="fmtrow.uaid" :header="fmtheader" :pattern="fmtheader.pattern" />
                            </v-col>
                          </template>

                          <template v-slot:view_category="{ fmtrow }">
                            <v-chip v-if="fmtrow.category" label color="info">{{ fmtrow.category }}</v-chip>
                          </template>
                        </flo-meta-table>
                      </v-col>
                    </v-row>
                  </v-container>
                </template>
              </flo-expand>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Key Store" elevation="5">
                <template v-slot:content="{}">
                  <v-container fluid>
                    <v-row no-gutters>
                      <v-col cols="12" class="pa-1">
                        <flo-meta-table v-if="translator != null" @load-data="onLoadCardKeyData($event)" @pre-edit="onPreEdit($event)" @pre-new="onPreNew($event)" @pre-import-export-create="onPreImportExportCreate($event)" :disableNew="!hasPermissionToEdit()" :disabledEdit="!hasPermissionToEdit()" :can_import="hasPermissionToEdit()" :title="title" :show_title="false" :show_filter="false" :show_search="true" :groupBy="['keyset']" resources="uicc_key_store" :hidden_filter="hidden_filter" :translator="translator" accept=".json">
                          <template v-slot:view_state="{ fmtrow }">
                            <v-chip v-if="fmtrow.state" label :color="getKeyStoreStateColor(fmtrow.state)">{{ fmtrow.state }}</v-chip>
                          </template>
                          <template v-slot:view_alg="{ fmtrow }">
                            <v-chip v-if="fmtrow.alg" label :color="fmtrow.scp == '80' ? 'secondary' : 'accent'">{{ fmtrow.alg }}</v-chip>
                          </template>
                          <template v-slot:view_keyset="{ fmtrow }">
                            <v-chip v-if="fmtrow.scp" label :color="fmtrow.scp == '80' ? 'secondary' : 'accent'">{{ fmtrow.keyset }}</v-chip>
                          </template>
                          <template v-slot:view_scp="{ fmtrow }">
                            <v-chip v-if="fmtrow.scp" label :color="fmtrow.scp == '80' ? 'secondary' : 'accent'">{{ fmtrow.scp }}</v-chip>
                          </template>

                          <template v-slot:view_keyid="{ fmtrow }">
                            <v-chip v-if="fmtrow.keyid" label :color="fmtrow.scp == '80' ? 'secondary' : 'accent'">{{ fmtrow.keyid }} - {{ fmtrow.key_type }}</v-chip>
                          </template>

                          <template v-slot:view_name="{ fmtrow }">
                            <template v-if="'' == fmtrow.name">
                              {{ fmtrow.name }}
                            </template>

                            <flo-field-label v-else :value="fmtrow.name">
                              <template v-slot:value="{ value }">
                                <v-form autocomplete="off">
                                  <v-text-field single-line outlined readonly dense class="font-weight-light primary--text ma-0 pa-0 mx-1" :append-icon="card_keys_pass ? 'mdi-eye' : 'mdi-eye-off'" autocomplete="off" @click:append="card_keys_pass = !card_keys_pass" :type="card_keys_pass ? 'text' : 'password'" :value="value" hide-details></v-text-field>
                                </v-form>
                              </template>
                            </flo-field-label>
                          </template>
                        </flo-meta-table>
                      </v-col>
                    </v-row>
                  </v-container>
                </template>
              </flo-expand>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import floAid from "~/components/se/floAid.vue";
import OTranslator from "~/src/otranslator.js";
import floMetaTable from "~/components/crud/floMetaTable.vue";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
import DateUtils from "~/src/dateUtils.js";
import floEcJson from "~/components/se/floEcJson.vue";
import floRfsField from "~/components/rfs/floRfsField.vue";
import floFieldLabel from "~/components/crud/floFieldLabel.vue";
import floVirtualFieldTable from "~/components/virtual/floVirtualFieldTable.vue";
import helpers from "~/src/helpers.js";
import { mapGetters } from "vuex";
export default {
  head() {
    return {
      title: this.title,
    };
  },
  name: "flo-uicc",
  data: () => ({
    helpers,
    title: "UICC",
    translator: null,
    hidden_filter: [],
    vf_hidden_filter: [],
    uname: [],
    vf_data: [],
    app_data: [],
    key_store_data: [],
    uicc: null,
    ec_rfs: null,
    jec: null,
    edit: false,
    crud: null,
    loader: false,
    vf_key: 0,
  }),
  props: {
    value: {
      type: Object,
      required: true,
      default: null,
    },
  },
  computed: {
    ...mapGetters({
      getPermissions: "session/permissions",
    }),
  },
  components: {
    floMetaTable,
    floRfsField,
    floEcJson,
    floAid,
    floFieldLabel,
    floVirtualFieldTable,
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    onLoadCardKeyData(data) {
      this.key_store_data = data.items;
      for (const header of data.headers) {
        switch (header.value) {
          case "id":
          case "ts":
          case "scp":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "key_type":
            {
              header.view = false;
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "name":
          case "uicc_id":
            {
              header.edit = false;
              header.view = false;
              header.disable_new = true;
            }
            break;
        }
      }
    },
    onLoadData(data) {
      this.app_data = data.items;

      for (const header of data.headers) {
        switch (header.value) {
          case "id":
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "uicc_id":
            {
              header.disable_edit = true;
              header.view = false;
            }
            break;
        }
      }
    },
    onLoadVfData(data) {
      this.vf_data = data.items;
      for (const header of data.headers) {
        switch (header.value) {
          case "id":
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "rid":
          case "resource":
            {
              header.view = false;
              header.edit = false;
              header.disable_new = true;
            }
            break;
          case "fields":
            {
              header.view = false;
              header.disable_new = true;
            }
            break;
          case "ui":
          case "gpath":
            {
              header.view = false;
            }
            break;
          case "offset":
            {
              header.text = "Number/Offset";
            }
            break;
        }
      }
    },
    async initialize() {
      this.uicc = this.value;
      this.crud = this.getPermissions.find((f) => "uiccs" == f.res);
      this.uname = [{ key: this.uicc.id, value: this.uicc.name }];
      this.hidden_filter = [
        {
          k: "uicc_id",
          op: "equal",
          v: this.uicc.id,
        },
      ];
      this.vf_hidden_filter = [
        {
          k: "rid",
          op: "equal",
          v: this.uicc.id,
        },
        {
          k: "resource",
          op: "equal",
          v: "uiccs",
        },
      ];
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      translator.setEnumEx("uicc_id", this.uname, true);
      translator.setEnum("alg", "scp_keystore_alg");
      translator.setEnum("keyset_scp80");
      translator.setEnum("keyset_scp81");
      this.translator = translator;
      await this.reload_electrical_profile();
    },
    async ls_ec() {
      let request = {
        field: "ec",
        id: this.uicc.id,
      };

      try {
        let answer = await this.$axios.$post(`/api/v1/uiccs/rfs/list`, request);
        if (answer.length > 0) {
          return answer[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      return null;
    },
    async cat(id) {
      let answer = null;
      try {
        answer = await this.$axios.$get(`/api/v1/uiccs/rfs/${id}`);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      return answer;
    },
    async electrical_profile_changed() {
      await this.reload_electrical_profile();
    },
    async reload_electrical_profile() {
      this.ec_rfs = null;
      this.jec = null;

      let lec = await this.ls_ec();
      if (lec) {
        this.ec_rfs = await this.cat(lec.id);
        let bas64_pos = this.ec_rfs.content.data_url.indexOf(",") + 1;
        let jec = JSON.parse(atob(this.ec_rfs.content.data_url.substring(bas64_pos)));
        this.jec = jec;
      }
    },
    async updateEc(jec) {
      this.jec = jec;
      await this.updateResource();
    },
    async updateVf(event) {
      let request = {
        resource: "uiccs",
        rid: this.uicc.id,
        ...event,
      };

      try {
        let answer = await this.$axios.$post(`/api/v1/vfile_definitions`, request);
        if (answer.length > 0) {
          return answer[0];
        }
        this.vf_key++;
        this.tellUser("success", `Virtual File updated sucessfully.`);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async updateResource() {
      let binaryEncoded = btoa(JSON.stringify(this.jec));
      let item = {
        id: this.ec_rfs.id,
        rtype: "field",
        fname: this.ec_rfs.fname,
        ftype: this.ec_rfs.ftype,
        fsize: this.ec_rfs.fsize,
        resource: this.ec_rfs.resource,
        rid: this.ec_rfs.rid,
        flm: DateUtils.localToLocalLikeIso(new Date()),
        content: { data_url: `data:application/json;base64,${binaryEncoded}` },
      };

      try {
        let answer = await this.$axios.$put(`/api/v1/uiccs/rfs/${this.ec_rfs.id}`, item);
        if (answer != null) {
          this.tellUser("success", `${answer.resource}, File Id: ${answer.id} updated successfully.`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async changeState(action) {
      try {
        let request = { id: this.uicc.id, action };
        let answer = await this.$axios.$post("/api/v1/uiccs/action", request);
        if (answer != null) {
          this.uicc = answer;
          this.tellUser("success", `ID: ${this.uicc.id} state successfully changed to ${this.uicc.state}.`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async exportAll() {
      try {
        let query = {
          select: {},
          where: [
            {
              k: "uicc_id",
              op: "equal",
              v: this.uicc.id,
            },
          ],
        };
        this.loader = true;
        let [aids, key_store] = await Promise.all([this.$axios.$post("/api/v1/uicc_aids/list", query), this.$axios.$post("/api/v1/uicc_key_store/list", query)]);

        let exported = {
          type: "flosim_uicc",
          ec: this.jec,
          aids: aids,
          key_store: key_store,
        };
        this.loader = false;
        let blob = new Blob([JSON.stringify(exported, null, 2)], { type: "text/json" });
        let url = URL.createObjectURL(blob);
        let link = document.createElement("a");
        link.href = url;
        link.download = `flosim_uicc_${this.uicc.name.replace(/\s/g, "_")}.json`;
        link.click();
        link.remove();
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    formattedTitle() {
      const l_title = {};

      if (this.jec) {
        let l_json = this.jec;
        if (l_json.hasOwnProperty("version")) {
          l_title["version"] = l_json.version;
        }
        if (l_json.hasOwnProperty("revision")) {
          l_title["revision"] = l_json.revision;
        }
        if (l_json.hasOwnProperty("ts")) {
          l_title["ts"] = l_json.ts;
        }
      }

      return l_title;
    },
    formatVirtualFields(fields) {
      let formatted = null;

      if (typeof fields == "string") {
        formatted = JSON.parse(fields);
      } else {
        formatted = fields;
      }

      return formatted;
    },
    getKeyStoreStateColor(state) {
      const colorMap = {
        active: "success",
        replace: "warning",
        add: "warning",
        pending: "warning",
        history: "disabled",
        delete: "error",
      };

      return colorMap[state] || "error";
    },
    getStateColor(state) {
      let colorMap = {
        deprecated: "error",
        active: "success",
      };

      return colorMap[state] || "warning";
    },
    getType(type) {
      let ltype = {
        color: "",
        type: "",
      };
      let l_type = "";
      if (type) {
        l_type = type.toLowerCase();
      }
      if (l_type == "binary") {
        ltype.color = "primary";
        ltype.type = "Binary";
      } else if (l_type == "record") {
        ltype.color = "info";
        ltype.type = "Record";
      }

      return ltype;
    },
    hasPermissionToEdit() {
      if (this.uicc.state == "active" && this.crud.c == true) {
        return true;
      }

      return false;
    },
    onPreEdit(data) {
      data.record.uicc_id = this.uname[0].key;
      this.edit = true;
    },
    onPreNew(data) {
      data.record.uicc_id = this.uname[0].key;
      this.edit = false;
    },
    onPreEditVf(data) {
      data.record.rid = this.uicc.id;
      data.record.resource = "uiccs";
    },
    onPreNewVf(data) {
      data.record.rid = this.uicc.id;
      data.record.resource = "uiccs";
    },
    onPreImportExportCreate(event) {
      if (event && event.data) {
        let l_event_data = event.data;
        if (l_event_data.rid) {
          l_event_data.rid = this.uicc.id;
        }
        if (l_event_data.uicc_id) {
          l_event_data.uicc_id = this.uicc.id;
        }
      }
    },
  },
};
</script>
