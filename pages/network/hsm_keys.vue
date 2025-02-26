<template>
  <div v-if="hsm.length > 0" class="hsm-keys">
    <v-card flat outlined class="ma-0 pa-0">
      <v-card-text class="ma-0 pa-0">
        <v-container fluid class="ma-0 pa-0">
          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Details" open elevation="5">
                <template v-slot:content="{}">
                  <flo-meta-resource-view :value="hsms" resources="hsms" :ignore="formatIgnore()"> </flo-meta-resource-view>
                </template>
              </flo-expand>
            </v-col>
          </v-row>

          <v-row v-if="crud" no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Keys" open elevation="5">
                <template v-slot:content="{}">
                  <v-container fluid>
                    <v-row no-gutters v-if="capacity && hsm_keys.total != 0">
                      <v-col cols="12" class="pa-1">
                        <v-card flat outlined>
                          <v-row no-gutters>
                            <v-col cols="12" class="pa-1">
                              <p class="text-subtitle-2 font-weight-light success--text ma-0 pa-0 mx-1" v-if="hsm_keys.active">Active: {{ formatCapacity(hsm_keys.active) }}</p>
                              <p class="text-subtitle-2 font-weight-light error--text ma-0 pa-0 mx-1" v-if="hsm_keys.delete">Scheduled For Deletion: {{ formatCapacity(hsm_keys.delete) }}</p>
                              <p class="text-subtitle-2 font-weight-light primary--text ma-0 pa-0 mx-1">Used Capacity: {{ formatCapacity(hsm_keys.total) }}</p>
                              <p class="text-subtitle-2 font-weight-light info--text ma-0 pa-0 mx-1 mb-1">Total Capacity: {{ formatCapacity(capacity) }}</p>
                            </v-col>
                          </v-row>
                          <v-row no-gutters>
                            <v-col cols="12" class="pa-1 mb-1">
                              <v-progress-linear :color="capacityColor()" height="18" :value="hsm_keys.combined" rounded striped>
                                <template v-slot:default="{ value }">
                                  <strong>{{ value }}% Used</strong>
                                </template>
                              </v-progress-linear>
                            </v-col>
                          </v-row>
                        </v-card>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="12" class="pa-1">
                        <flo-meta-table v-if="translator !== null" @load-data="onLoadData($event)" @pre-new="onPreNew($event)" @pre-view="onPreView($event)" @pre-import-export-create="onPreImportExportCreate($event)" @pre-import-export-update="onPreImportExportUpdate($event)" :show_title="false" :title="title" :translator="translator" :resources="resources" :hidden_filter="hidden_filter" :can_export="false" :disableExport="!crud.c" accept=".csv">
                          <template v-slot:ex_new="{ fab, color, smAndDown }">
                            <v-btn :fab="fab" :small="smAndDown" class="mr-1" :color="color" @click="calc_opc_dialog = true">
                              <v-icon :left="!smAndDown">mdi-calculator</v-icon>
                              {{ !smAndDown ? "Calc OPC" : "" }}
                            </v-btn>
                          </template>

                          <template v-slot:edit_path="{ fmtheader, fmtrow }">
                            <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" xl="6">
                              <flo-account-select :disabled="edit" v-model="fmtrow.path" :label="fmtheader.text" :hint="fmtheader.hint" persistent-hint />
                            </v-col>
                          </template>

                          <template v-slot:view_key_type="{ fmtrow }">
                            <v-chip v-if="fmtrow.key_type" label color="info">{{ fmtrow.key_type }}</v-chip>
                          </template>

                          <template v-slot:edit_key_type="{ fmtheader, fmtrow }">
                            <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" xl="6">
                              <v-select v-model="fmtrow.key_type" :disabled="edit" :items="translator.getValues('key_type')" :label="fmtheader.text" @change="setExport($event, fmtrow)" filled></v-select>
                            </v-col>
                          </template>

                          <template v-slot:edit_type="{ fmtheader, fmtrow, fmtpermissions }">
                            <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" xl="6">
                              <v-select v-model="fmtrow.type" :items="filterType(fmtrow.exportable)" :label="fmtheader.text" @change="clearValue()" :disabled="!fmtpermissions.e" filled item-text="value" item-value="key"></v-select>
                            </v-col>
                          </template>

                          <template v-slot:view_exportable="{ fmtrow }">
                            <v-chip label :color="fmtrow.exportable ? 'success' : 'error'">{{ fmtrow.exportable ? "Yes" : "No" }}</v-chip>
                          </template>

                          <template v-slot:view_shared="{ fmtrow }">
                            <v-chip label :color="fmtrow.shared ? 'success' : 'info'">{{ fmtrow.shared ? "Yes" : "No" }}</v-chip>
                          </template>

                          <template v-slot:view_status="{ fmtrow }">
                            <v-chip v-if="fmtrow.status" label :color="fmtrow.status == 'active' ? 'success' : 'error'" class="text-capitalize">{{ fmtrow.status }}</v-chip>
                          </template>

                          <template v-slot:edit_exportable="{ fmtheader, fmtrow }">
                            <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" xl="6">
                              <v-switch :disabled="edit" v-model="fmtrow.exportable" :label="fmtheader.text" color="success" inset></v-switch>
                            </v-col>
                          </template>

                          <template v-slot:edit_override="{ fmtheader, fmtrow }">
                            <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" xl="6">
                              <v-switch v-if="!edit" :disabled="edit" v-model="fmtrow.override" :label="fmtheader.text" color="success" inset></v-switch>
                            </v-col>
                          </template>

                          <template v-slot:edit_value="{ fmtheader, fmtrow }">
                            <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" xl="6">
                              <v-text-field v-if="edit && exp_val && exp_val.id == fmtrow.id" :value="exp_val.value" :rules="val_rule" :label="fmtheader.text" :append-icon="visible ? 'mdi-eye' : 'mdi-eye-off'" @click:append="visible = !visible" :readonly="edit" :type="visible ? 'text' : 'password'" counter></v-text-field>
                              <v-text-field v-if="!edit && fmtrow.type != 'generate' && fmtrow.type != 'map_existing'" :rules="val_rule" v-model="fmtrow.value" :label="fmtheader.text" counter></v-text-field>
                            </v-col>
                          </template>

                          <template v-slot:edit_tk="{ fmtheader, fmtrow }">
                            <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" xl="6">
                              <v-select v-if="showTk(fmtrow.type)" v-model="fmtrow.tk" :items="tk" @click="loadTks()" :label="fmtheader.text" filled item-text="v" item-value="k"></v-select>
                            </v-col>

                            <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" xl="6" v-if="edit && fmtrow.type">
                              <v-btn :disabled="fmtrow.tk == undefined && fmtrow.type != 'raw' ? true : false" color="primary" @click="fmtrow.exportable && fmtrow.type == 'export' ? exportItem(fmtrow) : fmtrow.type == 'encrypted' ? encryptItem(fmtrow) : fmtrow.type == 'wrapped' ? wrapItem(fmtrow) : fmtrow.type == 'raw' ? rawItem(fmtrow) : ''">
                                <v-icon left>{{ getType(fmtrow.type).icon }}</v-icon>
                                {{ getType(fmtrow.type).label }}
                              </v-btn>
                            </v-col>
                          </template>

                          <template v-slot:edit_hsm_id="{ fmtheader, fmtrow }">
                            <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" xl="6">
                              <v-select v-model="fmtrow.hsm_id" :items="hsm" :label="fmtheader.text" :disabled="fmtheader.disable_edit" filled item-text="value" item-value="key"></v-select>
                            </v-col>
                          </template>
                          <template v-slot:external="{ import_export_tabs, import_export_dialog }">
                            <flo-hsm-encryption :resources="resources" :tabs="import_export_tabs" :dialog="import_export_dialog" :hsm_id="hsm_id" @change="onChange($event)" />
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
    <v-dialog :overlay-opacity="0.4" v-model="calc_opc_dialog" max-width="700" persistent>
      <v-card>
        <v-card-title>
          <span class="headline">Calculate OPC</span>
          <span class="body-1"> Note: Computed Operation between OP (Operator Key) and KI (Subscriber Key) </span>
        </v-card-title>

        <v-card-text class="py-3">
          <v-container fluid class="ma-0 pa-0">
            <v-form v-model="valid">
              <v-row no-gutters>
                <v-col class="pa-1" cols="12" lg="6" xl="6">
                  <v-text-field v-model="ki.value" :label="ki.label" :hint="ki.hint" :rules="ki.rule" class="mt-3" persistent-hint></v-text-field>
                </v-col>
                <v-col class="pa-1" cols="12" lg="6" xl="6">
                  <v-autocomplete v-model="op.value" :label="op.label" :hint="op.hint" :items="op.items" :rules="op.rule" item-text="value" item-value="key" persistent-hint filled @paste="onPaste($event)"></v-autocomplete>
                </v-col>
              </v-row>
            </v-form>
            <v-row v-if="opc.value" no-gutters>
              <v-col class="pa-1" cols="12" lg="6" xl="6">
                <v-text-field :value="opc.value" :label="opc.label" :hint="opc.hint" persistent-hint readonly></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="closeCalcOpcDialog()">Close</v-btn>
          <v-btn color="primary" text :disabled="!valid" @click="calculateOpc()">Calculate</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <error-resource v-else-if="!loading && !hsm.length" resource="hsm" path="/network/hsms/"></error-resource>
</template>
<script>
import floHsmEncryption from "~/components/widgets/floHsmEncryption";
import errorResource from "~/components/error/error-resource.vue";
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import { mapGetters, mapActions } from "vuex";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  head() {
    return {
      title: this.title,
    };
  },
  components: { errorResource, floHsmEncryption },
  data: () => ({
    helpers,
    valid: false,
    visible: false,
    title: "HSM",
    resource: "hsm_key",
    resources: "hsm_keys",
    translator: null,
    exp_val: null,
    hidden_filter: [],
    calc_opc_dialog: false,
    edit: false,
    loading: true,
    hsm: [],
    hsms: {},
    hsm_id: "",
    capacity: 0,
    encryption: null,
    crud: null,
    tk: [],
    ki: {
      value: "",
      label: "KI",
      hint: "Specify Subscriber Key",
      rule: [(v) => /^[0-9A-Fa-f]{32}$/.test(v) || "Invalid KI."],
    },
    op: {
      value: "",
      label: "OP",
      hint: "Select Operator Key",
      items: [],
      rule: [(v) => !!v || "Operator Key is required."],
    },
    opc: {
      value: "",
      label: "OPC",
      hint: "Operator-Subscriber Computed Operation",
    },
    hsm_keys: {
      active: 0,
      delete: 0,
      combined: 0,
      total: 0,
    },
    val_rule: [(v) => /^[0-9a-fA-F]{32}?$/.test(v) || "Field length is 32 HEX value."],
    dashboard_marker: 0,
    dashboard_stats: {},
  }),
  computed: {
    ...mapGetters({
      getResourceKey: "session/getResourceKey",
      getPermissions: "session/permissions",
    }),
  },
  async created() {
    await this.initialize();
  },
  mounted() {
    this.$bus.$on("dashboard", this.onDashboardChange);
  },
  beforeDestroy() {
    this.$bus.$off("dashboard");
  },
  mixins: [tellUser, parseNetError],
  methods: {
    ...mapActions({
      addToResourceCache: "session/addToResourceCache",
    }),
    onLoadData(data) {
      data.headers.splice(7, 0, {
        text: "Override",
        value: "override",
        type: "string",
        disable_edit: true,
        disable_new: false,
        view: false,
        edit: true,
        gpath: "/Method",
      });

      data.headers.splice(8, 0, {
        text: "Type",
        value: "type",
        type: "string",
        disable_edit: false,
        disable_new: false,
        view: false,
        edit: true,
        gpath: "/Method",
      });
      data.headers.push({
        text: "Transport Key",
        value: "tk",
        type: "string",
        disable_edit: true,
        disable_new: false,
        view: false,
        edit: true,
        gpath: "/Method",
      });

      for (const header of data.headers) {
        switch (header.value) {
          case "id":
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "order_id":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "path":
          case "hsm_id":
          case "version":
            {
              header.view = false;
            }
            break;
          case "aid":
            {
              header.view = false;
              header.edit = false;
            }
            break;
          case "value":
            {
              header.view = false;
              header.gpath = "/Method";
            }
            break;
          case "status":
            {
              header.disable_new = true;
            }
            break;
          case "exportable":
          case "shared":
            {
              header.gpath = "/Method";
            }
            break;
        }
      }
    },
    async initialize() {
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      translator.setEnum("key_type");
      this.translator = translator;
      this.crud = this.getPermissions.find((f) => this.resources == f.res);
      await this.loadOrder(translator);
      if (this.$route.query.hasOwnProperty("id")) {
        this.hsm_id = this.$route.query.id;
        this.hidden_filter = [
          {
            k: "hsm_id",
            op: "equal",
            v: this.hsm_id,
          },
        ];

        await this.loadHsm(translator, this.hsm_id);
        if (this.crud) {
          await this.loadTks();
          await this.loadOps();
          if (this.hsms.hasOwnProperty("capacity")) {
            this.capacity = this.hsms.capacity;
            if (this.capacity != 0) {
              await this.onDashboardChange({ mark: 0 });
            }
          }
        }
      }

      this.loading = false;
    },
    async loadHsm(translator, id) {
      let hsms = [];
      try {
        let query = {
          select: {},
          where: [
            {
              k: "id",
              op: "equal",
              v: id,
            },
          ],
        };

        hsms = await this.$axios.$post("api/v1/hsms/list", query);
        if (hsms.length > 0) {
          this.hsms = hsms[0];
          this.hsm = [{ key: this.hsms.id, value: this.hsms.name }];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      translator.setEnumEx("hsm_id", this.hsm, true);
      this.translator = translator;
    },
    async loadOrder(translator) {
      try {
        let order_name = await this.$axios.$post("api/v1/orders/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        translator.setEnumEx("order_id", order_name, true);
        this.translator = translator;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    capacityColor() {
      let l_keys = this.hsm_keys.combined;
      if (l_keys <= 50) {
        return "success";
      }
      if (l_keys > 50 && l_keys < 75) {
        return "warning";
      }

      return "error";
    },
    formatCapacity(p) {
      let l_p = helpers.abbreviateNumber(p);
      if (l_p == 1) {
        return `${l_p} key.`;
      } else {
        return `${l_p} keys.`;
      }
    },
    formatIgnore() {
      if (this.capacity != 0) {
        return ["action", "capacity"];
      } else {
        return ["action"];
      }
    },
    async getDashboard(mark) {
      try {
        let l_dashboard_stats = await this.$axios.$get(`/statistics/v1/dashboard/stats/${mark}`);
        return l_dashboard_stats;
      } catch (err) {
        console.error(err);
      }
    },
    filterType() {
      let type = [];
      if (this.edit) {
        type = [
          { key: "encrypted", value: "Encrypted" },
          { key: "wrapped", value: "Wrapped" },
          { key: "raw", value: "Raw" },
        ];
      } else {
        type = [
          { key: "map_existing", value: "Map Existing" },
          { key: "generate", value: "Generate" },
          { key: "encrypted", value: "Encrypted" },
          { key: "wrapped", value: "Wrapped" },
          { key: "raw", value: "Raw" },
        ];
      }

      return type;
    },
    getType(type) {
      switch (type) {
        case "encrypted":
          return {
            label: "Encrypt",
            icon: "mdi-lock",
          };
        case "wrapped":
          return {
            label: "Wrap",
            icon: "mdi-lock-reset",
          };
        case "raw":
          return {
            label: "Raw",
            icon: "mdi-export-variant",
          };
        default:
          return {
            label: "Unknown",
            icon: "mdi-export-variant",
          };
      }
    },
    showTk(type) {
      if (type == "wrapped" || type == "encrypted" || type == "wrapped") return true;
    },
    setExport(key_type, row) {
      if (key_type == "TK") {
        row.exportable = 1;
      }
    },
    clearValue() {
      this.exp_val = null;
    },
    rawItem(item) {
      this.setItem(item);
    },
    exportItem(item) {
      this.setItem(item);
    },
    encryptItem(item) {
      this.setItem(item);
    },
    wrapItem(item) {
      this.setItem(item);
    },
    async setItem(item) {
      try {
        let request = {
          hsm_id: item.hsm_id,
          tk_id: item.tk,
          key_id: item.id,
          type: item.type,
        };
        let answer = await this.$axios.$post("api/v1/hsm_keys/wrap", request);
        this.exp_val = {
          id: item.id,
          value: answer[0].value,
        };
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async calculateOpc() {
      try {
        let request = {
          hsm_id: this.hsm_id,
          ki: this.ki.value,
          op: this.op.value,
        };
        let answer = await this.$axios.$post("api/v1/hsm_keys/calcopc", request);
        if (answer) {
          this.opc.value = answer.value;
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
        this.opc.value = "";
      }
    },
    async loadTks() {
      try {
        let hsm_keys = await this.$axios.$post("api/v1/hsm_keys/list", {
          select: {
            k: { k: "id" },
            v: { k: "name" },
          },
          where: [
            {
              k: "key_type",
              op: "equal",
              v: "tk",
            },
            {
              k: "hsm_id",
              op: "equal",
              v: this.hsm_id,
            },
          ],
        });
        this.tk = hsm_keys;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      this.tk.forEach((k) => {
        k.v = `${k.v} (${k.k})`;
      });
    },
    async loadOps() {
      this.op.items = [];
      try {
        let query = {
          select: {
            id: {},
            name: {},
          },
          where: [
            {
              k: "hsm_id",
              op: "equal",
              v: this.hsm_id,
            },
            {
              k: "key_type",
              op: "equal",
              v: "op",
            },
            {
              k: "status",
              op: "equal",
              v: "active",
            },
          ],
        };

        this.op.items = (await this.$axios.$post("api/v1/hsm_keys/list", query)).map(({ id, name }) => ({
          key: id,
          value: name,
        }));
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    onPreView(data) {
      data.record.hsm_id = this.hsm[0].key;
      this.edit = true;
    },
    onPreNew(data) {
      data.record.hsm_id = this.hsm[0].key;
      data.record.override = false;
      this.edit = false;
    },
    onPaste(event) {
      this.op.value = event.clipboardData.getData("text/plain");
    },
    onPreImportExportCreate(event) {
      if (event && event.data) {
        let l_event_data = event.data;
        l_event_data["path"] = ",1,";

        if (this.encryption) {
          l_event_data["path"] = this.encryption.path;
          l_event_data["tk_id"] = this.encryption.tk ? this.encryption.tk : null;
          l_event_data["type"] = this.encryption.ota_wrap_mode;
          l_event_data["hsm_id"] = this.encryption.hsm_id;
        }
      }
    },
    onPreImportExportUpdate(event) {
      if (event && event.data) {
        let l_event_data = event.data;
        l_event_data["path"] = ",1,";

        if (this.encryption) {
          l_event_data["path"] = this.encryption.path;
          l_event_data["tk_id"] = this.encryption.tk ? this.encryption.tk : null;
          l_event_data["type"] = this.encryption.ota_wrap_mode;
          l_event_data["hsm_id"] = this.encryption.hsm_id;
        }
      }
    },
    onChange(event) {
      this.encryption = event;
    },
    closeCalcOpcDialog() {
      this.ki.value = "";
      this.op.value = "";
      this.opc.value = "";
      this.calc_opc_dialog = false;
    },
    async onDashboardChange(p_event) {
      this.event = p_event;
      let l_dashboard = this.dashboard_stats;

      if (l_dashboard.hasOwnProperty("mark") && l_dashboard.mark + 1 == p_event.mark) {
        l_dashboard.data.push(p_event);
        l_dashboard.mark = p_event.mark;

        if (l_dashboard.data.length > 50) {
          l_dashboard.data.shift();
        }
      } else if (l_dashboard.hasOwnProperty("mark") && l_dashboard.mark < p_event.mark && p_event.mark - l_dashboard.mark < 50) {
        let l_delta_dashboard = await this.getDashboard(l_dashboard.mark);
        if (!l_delta_dashboard) {
          return;
        }

        if (l_dashboard.mark > l_delta_dashboard.mark) {
          l_dashboard = await this.getDashboard(0);
          if (!l_dashboard) {
            return;
          }
        } else {
          l_dashboard.mark = l_delta_dashboard.mark;
          l_dashboard.data = l_dashboard.data.concat(l_delta_dashboard.data);
          if (l_dashboard.data.length > 50) {
            l_dashboard.data = l_dashboard.data.slice(-50);
          }
        }
      } else {
        l_dashboard = await this.getDashboard(0);
        if (!l_dashboard) {
          return;
        }
      }

      this.dashboard_marker = l_dashboard.mark;
      this.dashboard_stats = l_dashboard;
      this.hsm_keys.active = 0;
      this.hsm_keys.delete = 0;
      this.hsm_keys.total = 0;
      this.hsm_keys.combined = 0;

      let last = this.dashboard_stats.data.slice(-1);
      if (last.length > 0) {
        last[0].statistics
          .filter((f) => f.stat.match(`/hsm/${this.hsm_id}`))
          .map((m) => {
            if (m.stat.endsWith("active")) {
              this.hsm_keys.active += m.value;
            } else {
              this.hsm_keys.delete += m.value;
            }
            let l_add = this.hsm_keys.active + this.hsm_keys.delete;
            let l_val = Math.ceil((l_add / this.capacity) * 100);
            this.hsm_keys.total = l_add;
            this.hsm_keys.combined = l_val;
          });
      }
    },
  },
};
</script>
