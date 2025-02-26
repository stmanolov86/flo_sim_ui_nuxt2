<template>
  <div class="flo-rfm-tabs">
    <v-container fluid v-if="!loading" class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col cols="12">
          <v-tabs v-model="sel_rfm_tab" @change="onTabChanged($event)">
            <v-tab v-if="campaign_lead_by != 'gsma'" :disabled="sel_rfm_tab != 'fields' && disabled" href="#vfiles">Virtual </v-tab>
            <v-tab :disabled="disabled" href="#reads">Read</v-tab>
            <v-tab :disabled="disabled" href="#writes">Write</v-tab>
            <v-tab :disabled="disabled" href="#script">Script</v-tab>
            <template v-if="sel_rfm_tab == 'vfiles'">
              <div class="flex-grow-1"></div>
              <v-btn :disabled="disabled" color="primary" @click="rebuild = true">
                <v-icon left>mdi-file-refresh</v-icon>
                Rebuild
              </v-btn>
            </template>

            <v-tab-item v-if="campaign_lead_by != 'gsma'" value="vfiles">
              <v-card flat outlined class="ma-0 pa-0">
                <v-container fluid class="ma-0 pa-0">
                  <v-row no-gutters>
                    <v-col cols="12">
                      <flo-card-virtual-files v-if="sel_rfm_tab == 'vfiles' || sel_rfm_tab == 'fields'" :vfiles="vfiles" :value="getVfsOperations()" :uicc="uicc" :transport="transport" :disabled="disabled" :readonly="readonly" :parameters="parameters" @change="onRfmVfChange($event)" />
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-tab-item>

            <v-tab-item value="reads">
              <v-card flat outlined class="ma-0 pa-0">
                <v-container fluid class="ma-0 pa-0">
                  <v-row no-gutters>
                    <v-col cols="12">
                      <flo-rfm-read v-if="sel_rfm_tab == 'reads'" :value="getReadsOperation()" :uicc="uicc" :transport="transport" :disabled="disabled" :readonly="readonly" @change="onRfmReadsChange($event)" />
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-tab-item>

            <v-tab-item value="writes">
              <v-card flat outlined class="ma-0 pa-0">
                <v-container fluid class="ma-0 pa-0">
                  <v-row no-gutters>
                    <v-col cols="12">
                      <flo-rfm-write v-if="sel_rfm_tab == 'writes'" :value="getWritesOperation()" :uicc="uicc" :transport="transport" :disabled="disabled" :parameters="parameters" :readonly="readonly" @change="onRfmWritesChange($event)" />
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-tab-item>

            <v-tab-item value="script">
              <v-container fluid class="ma-0 pa-0">
                <v-row no-gutters>
                  <v-col cols="12">
                    <flo-rfm-script v-if="sel_rfm_tab == 'script'" :value="getApdusOperation()" :uicc="uicc" :transport="transport" :disabled="disabled" :readonly="readonly" @change="onRfmScriptChange($event)" />
                  </v-col>
                </v-row>
              </v-container>
            </v-tab-item>
          </v-tabs>
        </v-col>
      </v-row>
      <v-dialog :overlay-opacity="0.4" v-model="rebuild" persistent width="auto ">
        <v-card flat>
          <v-card-title>
            <v-row no-gutters justify="center">
              <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'">
                <v-icon x-large color="warning">mdi-alert</v-icon>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text>
            <v-container fluid class="ma-0 pa-0">
              <v-row no-gutters justify="center">
                <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"><span class="title text--primary">Are you sure you want to fully rebuild the Card Virtual Files?</span> </v-col>
              </v-row>
              <v-row no-gutters justify="center">
                <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"><span class="body-1 text--primary">This will completely reset the card.</span> </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn color="primary" text @click="rebuild = false">Cancel</v-btn>
            <v-btn color="primary" text @click="rebuildCardVirtualFiles()">Rebuild</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script>
import floRfmRead from "../se/floRfmRead.vue";
import floRfmWrite from "../se/floRfmWrite.vue";
import floRfmScript from "../se/floRfmScript.vue";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
import floCardVirtualFiles from "~/components/virtual/floCardVirtualFiles.vue";
export default {
  components: { floRfmRead, floRfmWrite, floRfmScript, floCardVirtualFiles },
  name: "flo-rfm-tabs",
  data() {
    return {
      vfiles: [],
      loading: true,
      rebuild: false,
      sel_rfm_tab_version: 1,
      sel_rfm_tab: "vfiles",
      operations: [],
    };
  },
  props: {
    campaign_lead_by: {
      type: String,
      default: "",
      required: false,
    },
    uicc: {
      type: Object,
      default: () => {},
    },
    iccid: {
      type: String,
      default: "",
    },
    value: {
      type: [Object, Array],
      default: null,
    },
    transport: {
      type: String,
      required: true,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    parameters: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    syncParent() {
      console.log(`flo-rfm-tabs - syncParent - enter - ${JSON.stringify(this.operations)}`);
      this.$emit("change", this.operations);
    },
    async initialize() {
      console.log(`flo-rfm-tabs - initialize - enter`);
      this.loading = true;

      if (null == this.value) {
        this.syncParent();
      } else {
        this.operations = this.value;

        if (this.operations) {
          if (this.operations.length > 0) {
            if (this.operations[0].hasOwnProperty("type")) {
              this.sel_rfm_tab = this.operations[0].type;
              console.log(`flo-rfm-tabs - set selected tab to: ${this.sel_rfm_tab}`);
            }

            if (this.operations[0].length > 0) {
              if ("script" == this.operations[0].type) {
                this.sel_rfm_tab = this.operations[0].type;
                console.log(`flo-rfm-tabs - set selected tab to: ${this.sel_rfm_tab}`);
              }
            }
          }
        }

        console.log(`flo-rfm-tabs - initialize - value (operations): ${JSON.stringify(this.operations)}`);
      }

      if (this.iccid != "") {
        await this.getCardVirtualFiles(this.iccid);
      } else {
        await this.getUiccVirtualFiles(this.uicc.id);
      }

      this.loading = false;
    },
    async rebuildCardVirtualFiles() {
      try {
        let body = {
          iccid: this.iccid,
        };
        let answer = await this.$axios.$post("/api/v1/cards/vf/rebuild", body);
        if (answer) {
          this.vfiles = answer;
          console.log(`flo-rfm-tabs - rebuildCardVirtualFiles - ${JSON.stringify(answer)}`);
          this.rebuild = false;
          this.tellUser("success", `ICCID ${this.iccid} virtual files rebuilt successfully.`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async getCardVirtualFiles(iccid) {
      try {
        let answer = await this.$axios.$get(`/api/v1/cards/vf/${iccid}`);
        this.vfiles = answer;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async getUiccVirtualFiles(uicc_id) {
      try {
        let answer = await this.$axios.$get(`/api/v1/uiccs/vf/${uicc_id}`);
        this.vfiles = answer;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    getReadsOperation() {
      console.log(`flo-rfm-tabs - getReadsOperation - enter`);
      if (!this.operations) {
        return null;
      }

      if (this.operations.length < 1) {
        return null;
      }

      let lop = this.operations[0];
      if (null == lop) {
        return null;
      }

      return lop;
    },
    getVfsOperations() {
      console.log(`flo-rfm-tabs - getVfsOperations - enter`);
      console.log(`flo-rfm-tabs - getVfsOperations - ${JSON.stringify(this.operations)}`);
      let lops = this.operations;

      return lops;
    },
    getWritesOperation() {
      console.log(`flo-rfm-tabs - getWritesOperation - enter`);
      if (!this.operations) {
        return null;
      }

      if (this.operations.length < 1) {
        return null;
      }

      let lop = this.operations[0];
      if (null == lop) {
        return null;
      }

      return lop;
    },
    getApdusOperation() {
      console.log(`flo-rfm-tabs - getApdusOperation - enter`);
      if (!this.operations) {
        return null;
      }

      if (this.operations.length < 1) {
        return null;
      }

      let lop = this.operations[0];
      if (null == lop) {
        return null;
      }

      return lop;
    },
    onTabChanged(event) {
      console.log(`flo-rfm-tabs - onTabChanged - enter - ${JSON.stringify(event)}`);
      this.sel_rfm_tab_version++;

      let l_first_op = null;

      if (this.operations) {
        if (this.operations.length > 0) {
          l_first_op = this.operations[0];
        }
      }

      if (null != l_first_op) {
        if (l_first_op.hasOwnProperty("type")) {
          switch (event) {
            case "vfiles":
              {
                if ("fields" != l_first_op.type) {
                  this.operations = [];
                }
              }
              break;
            default: {
              this.operations = [];
            }
          }
        }
      }
      this.syncParent();
    },
    onRfmVfChange(event) {
      console.log(`flo-rfm-tabs - onRfmVfChange - enter - ${JSON.stringify(event)} - sel_rfm_tab:${this.sel_rfm_tab}`);
      if ("vfiles" == this.sel_rfm_tab) {
        this.$emit("vf_change", event);
      }
    },
    onRfmReadsChange(event) {
      console.log(`flo-rfm-tabs - onRfmReadsChange - enter - ${JSON.stringify(event)} - sel_rfm_tab:${this.sel_rfm_tab}`);
      if ("reads" == this.sel_rfm_tab) {
        let _t = [];
        _t.push(event);

        this.operations = _t;
        this.syncParent();
      }
    },
    onRfmWritesChange(event) {
      console.log(`flo-rfm-tabs - onRfmWritesChange - enter - ${JSON.stringify(event)} - sel_rfm_tab:${this.sel_rfm_tab}`);
      if ("writes" == this.sel_rfm_tab) {
        let _t = [];
        _t.push(event);

        this.operations = _t;
        this.syncParent();
      }
    },
    onRfmScriptChange(event) {
      console.log(`flo-rfm-tabs - onRfmScriptChange - enter - ${JSON.stringify(event)} - sel_rfm_tab:${this.sel_rfm_tab}`);
      if ("script" == this.sel_rfm_tab) {
        this.$emit("script_change", event);
      }
    },
  },
};
</script>
