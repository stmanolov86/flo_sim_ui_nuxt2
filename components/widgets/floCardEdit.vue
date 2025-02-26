<template>
  <div class="flo-card-edit">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col cols="12" class="pa-1">
          <v-card flat>
            <v-card-text class="ma-0 pa-0">
              <v-container fluid class="ma-0 pa-1">
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-stepper :value="getStateStep()" class="elevation-0">
                      <v-stepper-header>
                        <v-stepper-step :class="`${getStepTextStyle(1)} mt-0 pt-0 mb-0 pb-0`" :complete="getStateStep() > 1" step="1" complete-icon="mdi-arrow-right" :color="getStepColor(1)">
                          Idle
                          <small :class="getStepTextStyleSmall(1)">Card is idle</small>
                        </v-stepper-step>
                        <v-divider></v-divider>

                        <v-stepper-step :class="`${getStepTextStyle(2)} mt-0 pt-0 mb-0 pb-0`" :complete="getStateStep() > 2" step="2" error-icon="mdi-sim-alert" :color="getStepColor(2)">
                          Edit
                          <small :class="getStepTextStyleSmall(2)">{{ getChangeCount() == 0 ? "Make your changes" : getChangeCount() }}</small>
                        </v-stepper-step>

                        <v-divider></v-divider>
                        <v-stepper-step color="error" v-if="isOtaResponseError()" :class="`${getStepTextStyle(3)} mt-0 pt-0 mb-0 pb-0`" :complete="getStateStep() > 3" step="3" error-icon="mdi-sim-alert">
                          Wait
                          <small class="error--text">{{ getNiceOtaError() }}</small>
                        </v-stepper-step>

                        <v-stepper-step v-else :class="`${getStepTextStyle(3)} mt-0 pt-0 mb-0 pb-0`" :complete="getStateStep() > 3" step="3" error-icon="mdi-sim-alert" :color="getStepColor(3)">
                          Wait
                          <small :class="getStepTextStyleSmall(3)">{{ getStateWaitDescription() }} {{ getChangeCount() }}</small>
                        </v-stepper-step>
                        <v-divider></v-divider>

                        <v-stepper-step :class="`${getStepTextStyle(4)} mt-0 pt-0 mb-0 pb-0`" step="4" error-icon="mdi-sim-alert" :color="getStepColor(4)">
                          Sync
                          <small :class="getStepTextStyleSmall(4)"> {{ getStateSyncDescription() }} {{ getChangeCount() }}</small>
                        </v-stepper-step>
                      </v-stepper-header>
                    </v-stepper>
                  </v-col>
                </v-row>

                <template v-if="!scp_loading">
                  <v-row no-gutters>
                    <v-col cols="1" class="pa-1">
                      <v-tooltip right>
                        <template v-slot:activator="{ on }">
                          <div v-on="on">
                            <v-switch v-model="inspect" class="subheading font-weight-light" dense color="success" hide-details label="Inspect"></v-switch>
                          </div>
                        </template>
                        <span>Debug mode</span>
                      </v-tooltip>
                    </v-col>
                  </v-row>
                </template>

                <v-row no-gutters v-if="inspect">
                  <v-col cols="12" lg="4" class="pa-1">
                    <flo-json-editor name="stack" mode="code" :modes="['view', 'code', 'text']" :key="`js-s-${totalVersion}`" height="250px" :value="lresource.record.ota_stack ? lresource.record.ota_stack : {}" @model-update="onJsonStackUpdate($event)"></flo-json-editor>
                  </v-col>
                  <v-col cols="12" lg="4" class="pa-1">
                    <flo-json-editor name="Request" mode="code" :modes="['view', 'code', 'text']" :key="`js-c-${totalVersion}`" height="250px" :value="lresource.record.ota_command ? lresource.record.ota_command : {}" @model-update="onJsonRequestUpdate($event)"></flo-json-editor>
                  </v-col>
                  <v-col cols="12" lg="4" class="pa-1">
                    <v-textarea name="input-7-1" filled label="Response:" no-resize rows="8" readonly outlined height="250px" :value="`${lresource.record.ota_response ? JSON.stringify(lresource.record.ota_response, null, 1) : ''}`" :background-color="getOtaResponseColor()" hide-details></v-textarea>
                  </v-col>
                </v-row>

                <v-row :key="ota_stack_version" no-gutters>
                  <v-col cols="12" class="pa-1">
                    <flo-card-scp :spi="spi" :kic_algo="kic_algo" :kid_algo="kid_algo" :push_spi="push_spi" :keysets80="keysets80" :keysets81="keysets81" :keyset80="keyset80" :keyset81="keyset81" @change="onScpChange($event)" @sync="onSyncChange($event)" @scp_loading="onScpLoading($event)" @send_ram="onSendRam($event)" :disabled="canEditScp()" :readonly="!canEdit()" :value="getScpStackChange()" :iccid="lresource.record.iccid" :uicc_id="lresource.record.uicc_id" :bip_bindings="bip_bindings" :card_applets="card_applets" :is_multi_imsi="is_multi_imsi" :changes_amount="changes_amount" />
                  </v-col>
                </v-row>

                <template v-if="!scp_loading">
                  <v-card-actions :key="`stact-${totalVersion}`">
                    <v-container fluid class="ma-0 pa-0">
                      <v-row no-gutters v-if="lresource.record.ota_response && Object.keys(lresource.record.ota_response).length > 0">
                        <v-col cols="12" class="pa-1">
                          <p :class="`${formatResponse(lresource.record.ota_response).color}--text`">
                            <v-icon :color="formatResponse(lresource.record.ota_response).color">{{ formatResponse(lresource.record.ota_response).icon }}</v-icon> {{ formatResponse(lresource.record.ota_response).text }}
                          </p>
                        </v-col>
                      </v-row>
                      <v-row v-if="keysets80.length > 0" no-gutters>
                        <template v-if="getStateStep() == 1">
                          <v-btn class="ma-1" color="primary" :disabled="!hasPermissionToEdit()" @click="enterEditStep()">Begin</v-btn>
                        </template>

                        <template v-if="getStateStep() == 2">
                          <v-row no-gutters>
                            <v-btn :disabled="disableSync()" class="mr-1" color="primary" @click="enterWaitStep(false)">Wait</v-btn>
                            <v-btn :loading="loading_synchronize" :disabled="disableSync() || !canSynchronize() || loading_synchronize" class="mr-1" color="primary" @click="enterSyncStep(false)">Synchronize</v-btn>
                            <v-btn :loading="loading_query" color="primary" v-if="lresource.record.scp_state == 'wait_deliver'" @click="sendQuery()" class="mr-1">Query</v-btn>
                            <v-btn :disabled="disableSync()" class="mr-1" color="warning" @click="enterUpdateDatabaseOnly()"> Storage only </v-btn>
                            <v-btn color="primary" @click="cancelEditStep()">Cancel</v-btn>
                          </v-row>
                        </template>

                        <template v-if="getStateStep() == 3">
                          <v-row no-gutters>
                            <v-btn :loading="loading_synchronize" :disabled="disableSync() || !canSynchronize() || loading_synchronize" color="primary" @click="enterSyncStep(false)" class="mr-1">{{ isOtaResponseError() ? "Retry" : "Synchronize" }}</v-btn>
                            <v-btn color="primary" v-if="lresource.record.scp_state == 'wait_deliver'" @click="sendQuery()" class="mr-1">Query</v-btn>
                            <v-btn color="primary" @click="backWaitStep()" class="mr-1">Back</v-btn>
                            <v-btn color="primary" @click="cancelWaitStep()">Cancel</v-btn>
                          </v-row>
                        </template>

                        <template v-if="getStateStep() == 4">
                          <v-row no-gutters>
                            <v-btn color="primary" @click="cancelSyncStep()">Cancel</v-btn>
                          </v-row>
                        </template>

                        <div class="flex-grow-1"></div>
                        <v-tooltip top>
                          <template v-slot:activator="{ on }">
                            <v-btn v-if="getSuspendCardBillingInfo().visible" :disabled="!hasPermissionToEdit()" class="mr-1" color="primary" v-on="on" @click="suspendCardBillingCmd()">
                              <v-icon>
                                {{ getSuspendCardBillingInfo().icon }}
                              </v-icon>
                              {{ getSuspendCardBillingInfo().text }}
                            </v-btn>
                          </template>
                          <span>Suspend Billing</span>
                        </v-tooltip>

                        <v-tooltip top>
                          <template v-slot:activator="{ on }">
                            <v-btn v-if="getSuspendCardRegistrarInfo().visible" :disabled="!hasPermissionToEdit()" color="primary" v-on="on" @click="suspendCardRegistrarCmd()">
                              <v-icon> {{ getSuspendCardRegistrarInfo().icon }}</v-icon>
                              {{ getSuspendCardRegistrarInfo().text }}
                            </v-btn>
                          </template>
                          <span>Suspend HSS</span>
                        </v-tooltip>
                      </v-row>
                      <v-row v-else no-gutters>
                        <v-col cols="12" align="center">
                          <v-icon color="warning" large>mdi-alert</v-icon>
                          <span class="text-subtitle-1 font-weight-light primary--text">There are no active SCP80 keysets associated with this card. Go to Details <v-icon>mdi-arrow-right-bold</v-icon> Keystore to create one.</span>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-actions>

                  <v-row v-if="lresource.record" no-gutters>
                    <v-col cols="12" class="pa-1">
                      <flo-expand title="Log" elevation="5">
                        <template v-slot:content="{}">
                          <v-container fluid class="ma-0 pa-0">
                            <v-row no-gutters>
                              <v-col cols="12" class="pa-1">
                                <flo-card-log :iccid="lresource.record.iccid" :hidden_filter="scp_hidden_filter()"></flo-card-log>
                              </v-col>
                            </v-row>
                          </v-container>
                        </template>
                      </flo-expand>
                    </v-col>
                  </v-row>
                </template>
              </v-container>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import floCardScp from "~/components/widgets/floCardScp.vue";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
import { mapGetters } from "vuex";
export default {
  name: "flo-card-edit",
  components: {
    floCardScp,
  },
  data() {
    return {
      helpers,
      transport: "",
      changes_amount: 0,
      totalVersion: 1,
      ota_stack_version: 1,
      loading_synchronize: false,
      loading_query: false,
      loading_cancel: false,
      scp_loading: true,
      inspect: false,
      updateInProgress: false,
      lresource: this.resource,
    };
  },
  props: {
    resource: {
      type: Object,
      default: () => {},
    },
    resource_data: {
      type: Object,
      default: () => {},
    },
    keysets81: {
      type: Array,
      required: false,
      default: () => [],
    },
    keysets80: {
      type: Array,
      required: false,
      default: () => [],
    },
    keyset81: {
      type: Number,
      required: false,
      default: 0,
    },
    keyset80: {
      type: Number,
      required: false,
      default: 0,
    },
    spi: {
      type: String,
      required: false,
      default: "",
    },
    kic_algo: {
      type: String,
      required: false,
      default: "",
    },
    kid_algo: {
      type: String,
      required: false,
      default: "",
    },
    push_spi: {
      type: String,
      required: false,
      default: "",
    },
    bip_bindings: {
      type: Array,
      default: () => [],
    },
    is_multi_imsi: {
      type: Boolean,
      default: false,
    },
    card_applets: {
      type: [Number, String, Object, Array],
      default: null,
    },
  },
  computed: {
    ...mapGetters({
      permissions: "session/permissions",
    }),
  },
  mixins: [tellUser, parseNetError],
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      console.log(`flo-card-edit - initialize - enter`);
      console.log(`flo-card-edit - initialize - keysets80:${JSON.stringify(this.keysets80)}`);
      console.log(`flo-card-edit - initialize - keysets81:${JSON.stringify(this.keysets81)}`);
    },
    scp_hidden_filter() {
      let scp_filter = [
        {
          k: "iccid",
          op: "equal",
          v: this.lresource.record.iccid,
        },
        {
          k: "mtype",
          op: "clike",
          v: "scp%",
        },
      ];

      return scp_filter;
    },
    getNiceOtaError() {
      let response = this.lresource.record.ota_response;
      if (!response) {
        return "";
      }

      let lstatus = undefined;
      if (response.statusCode) {
        lstatus = response.statusCode;
      } else if (response.status) {
        lstatus = response.status;
      }

      if (!lstatus) {
        return "";
      }

      let lmessage = "";
      if (response.message) {
        lmessage = ` - ${response.message}`;
      }

      return `${lstatus}${lmessage}`;
    },
    getStateStep() {
      switch (this.getOtaState()) {
        case "idle":
          return 1;
        case "edit":
          return 2;
        case "wait":
          return 3;
        case "sync":
          return 4;
        default:
          return 1;
      }
    },
    getStepTextStyle(step) {
      let lstep = this.getStateStep();
      if (lstep == step) {
        return `title`;
      }
      return "body-1";
    },
    getStepTextStyleSmall(step) {
      let lstep = this.getStateStep();
      if (lstep == step) {
        return `body-2 ${this.getStepColor(lstep)}--text`;
      }
      return "caption";
    },
    getStepColor(step) {
      let lstep = this.getStateStep();
      if (lstep == step) {
        return "accent";
      }
      return "primary";
    },
    getChangeCount(type) {
      let changes_amount = 0;
      let c_type = "";
      let cc_type = "";
      let changes = this.getChanges(type);

      if (this.getOtaState() == "idle") {
        this.changes_amount = 0;
        return;
      }

      if (changes.length > 0) {
        let lchanges = changes[0];
        if (lchanges.hasOwnProperty("type")) {
          if (lchanges.type == "flolive") {
            c_type = "Applet";
          } else {
            c_type = "SCP";
          }
          cc_type = lchanges.type.toUpperCase();
        }

        if (lchanges.hasOwnProperty("operations")) {
          let l_opp = lchanges.operations[0];
          if (l_opp != null) {
            if (cc_type == "RFM") {
              if (l_opp.hasOwnProperty("reads") || l_opp.hasOwnProperty("writes")) {
                let ltype = l_opp.type;
                changes_amount = l_opp[ltype].length;
              } else {
                let lopp = lchanges.operations;
                changes_amount = lopp.length;
              }
            } else if (cc_type == "FLOLIVE" || cc_type == "RAM") {
              let lopp = lchanges.operations;
              if (!lopp.includes(null)) {
                changes_amount = lopp.length;
              }
            }
          }
        }
        this.changes_amount = changes_amount;

        return `Operation type is ${c_type} - ${cc_type}, you have ${changes_amount} ${changes_amount == 1 ? "change." : "changes."}`;
      }
    },
    getChanges(type, id) {
      if (!this.lresource.record.ota_stack) {
        this.lresource.record["ota_stack"] = {};
      }

      if (!this.lresource.record.ota_stack.changes) {
        this.lresource.record.ota_stack["changes"] = [];
      }

      let changes = this.lresource.record.ota_stack.changes;
      if (!type) {
        return changes;
      } else if (!id) {
        return changes.filter((c) => c.type == type);
      } else {
        return changes.filter((c) => this.filterChange(type, id, c));
      }
    },
    disableSync() {
      let ldisable = true;
      if (this.lresource.record.ota_stack.hasOwnProperty("changes")) {
        let lchanges = this.lresource.record.ota_stack.changes;
        if (lchanges.length > 0) {
          if (lchanges[0].hasOwnProperty("operations")) {
            let loperations = lchanges[0].operations;
            if (loperations[0] != null && loperations[0] != []) {
              if (loperations[0].hasOwnProperty("type")) {
                let ltype = loperations[0].type;
                if (ltype == "fields") {
                  if (loperations[0][ltype].length > 0) {
                    ldisable = false;
                  }
                } else if (ltype == "writes") {
                  loperations[0][ltype].forEach((op) => {
                    if (op.hasOwnProperty("type")) {
                      if (op[op.type].hasOwnProperty("value")) {
                        let l_val = op[op.type].value;
                        if (l_val != "") {
                          let lpattern = new RegExp(/^(..)*$/);
                          let valid = lpattern.test(l_val);
                          if (valid && op.address != "") {
                            ldisable = false;
                          } else {
                            ldisable = true;
                          }
                        }
                      }
                    }
                  });
                } else if (ltype == "reads") {
                  loperations[0][ltype].forEach((op) => {
                    if (op.address != "") {
                      ldisable = false;
                    } else {
                      ldisable = true;
                    }
                  });
                } else if (ltype == "script") {
                  loperations.forEach((op) => {
                    op[ltype].forEach((script) => {
                      let l_val = script.a;
                      let lpattern = new RegExp(/^(..)*$/);
                      let valid = lpattern.test(l_val);
                      if (valid) {
                        ldisable = false;
                      } else {
                        ldisable = true;
                      }
                    });
                  });
                } else {
                  if (loperations.length > 0) {
                    ldisable = false;
                  } else {
                    ldisable = true;
                  }
                }
              }
            }
          }
        }
      }
      return ldisable;
    },
    getStateWaitDescription() {
      if (this.lresource.record.hasOwnProperty("ota_state")) {
        switch (this.getOtaState()) {
          case "edit":
          case "idle":
          case "sync": {
            return "";
          }

          case "wait": {
            if (this.lresource.record.hasOwnProperty("scp_state")) {
              switch (this.lresource.record.scp_state) {
                case "wait_deliver": {
                  return `Waiting For SCP DELIVER. Expires at ${helpers.toLocalTimeInIsoFormatUi(this.lresource.record.scp_expiry)}.`;
                }
                case "wait_por": {
                  return `Waiting for SCP POR (Proof Of Receipt). Expires at ${helpers.toLocalTimeInIsoFormatUi(this.lresource.record.scp_expiry)}.`;
                }
                case "exception": {
                  return "BIP Session Exception, See Log.";
                }
                case "wait_handshake": {
                  return "Waiting for SCP BIP handshake.";
                }
                case "wait_register": {
                  return "Waiting for Registration.";
                }
                case "progress": {
                  return `BIP Session In Progress. Expires at ${helpers.toLocalTimeInIsoFormatUi(this.lresource.record.scp_expiry)}.`;
                }
                case "completed": {
                  let c = this.getScpStackChange();
                  if (null != c) {
                    if (c.hasOwnProperty("transport")) {
                      let t = c.transport;
                      if (t == "sms") {
                        return "SCP SMS Completed.";
                      } else if (t == "https" || t == "cat_tp") {
                        return "SCP BIP Completed.";
                      }
                    }
                  }
                  return "Completed.";
                }
              }
            }
          }
        }
      }

      return "Wait for the card next restart.";
    },
    getStateSyncDescription() {
      if (this.lresource.record.hasOwnProperty("ota_state")) {
        switch (this.getOtaState()) {
          case "edit":
          case "idle":
          case "wait": {
            return "";
          }
          case "sync": {
            if (this.lresource.record.hasOwnProperty("scp_state")) {
              switch (this.lresource.record.scp_state) {
                // case "wait_deliver": {
                //   return `Waiting For SCP DELIVER. Expires at ${helpers.toLocalTimeInIsoFormatUi(this.lresource.record.scp_expiry)}.`;
                // case "wait_por": {
                //   return `Waiting for SCP POR (Proof Of Receipt). Expires at ${helpers.toLocalTimeInIsoFormatUi(this.lresource.record.scp_expiry)}.`;
                case "exception": {
                  return "BIP Session Exception, See Log.";
                }
                case "progress": {
                  return `BIP Session In Progress. Expires at ${helpers.toLocalTimeInIsoFormatUi(this.lresource.record.scp_expiry)}.`;
                }
                case "completed": {
                  return "BIP Session Completed.";
                }
              }
            }
          }
        }
      }

      return "Card is now syncing.";
    },
    transportVisibility() {
      let visible = false;
      console.log(`flo-card-edit - transportVisibility - transport: ${this.transport}`);
      if (this.lresource.record.ota_stack.hasOwnProperty("changes")) {
        let lchanges = this.lresource.record.ota_stack.changes;
        console.log(`flo-card-edit - transportVisibility - stack: ${JSON.stringify(this.lresource.record.ota_stack)}`);
        if (lchanges.length > 0) {
          let ltype = lchanges[0].type;
          console.log(`flo-card-edit - transportVisibility - type: ${JSON.stringify(ltype)}`);
          visible = true;
        }
      }

      return visible;
    },
    getOtaState() {
      return this.lresource.record.ota_state;
    },
    isOtaResponseError() {
      let response = this.lresource.record.ota_response;

      if (!response) {
        return false;
      }

      let lstatus = undefined;
      if (response.statusCode) {
        lstatus = response.statusCode;
      } else if (response.status) {
        lstatus = response.status;
      }

      if (!lstatus) {
        return false;
      }

      if (lstatus < 199 || lstatus == 202) {
        return false;
      }

      if (lstatus == 200) {
        return false;
      }

      if (lstatus > 299) {
        return true;
      }

      return false;
    },
    formatResponse(response) {
      let lres = {
        icon: "mdi-alert-outline",
        color: "warning",
        text: "Unknown response.",
      };

      if (!response) {
        return lres;
      }

      if (response.hasOwnProperty("status")) {
        if (response.status >= 204 && response.status <= 600) {
          lres.color = "error";
          lres.icon = "mdi-alert-circle-outline";
        } else if (response.status >= 100 && response.status <= 203) {
          lres.color = "success";
          lres.icon = "mdi-check-all";
        } else {
          lres.color = "warning";
          lres.icon = "mdi-alert-outline";
        }

        lres.text = `Status: ${response.status}`;
      }
      if (response.hasOwnProperty("message")) {
        lres.text = `${lres.text} Message: ${response.message}`;
      } else if (response.hasOwnProperty("sw_decoded")) {
        lres.text = `${lres.text} Message: ${response.sw_decoded}`;
      }

      return lres;
    },
    getOtaResponseColor() {
      let response = this.lresource.record.ota_response;

      if (!response) {
        return "none";
      }

      let lstatus = undefined;
      if (response.statusCode) {
        lstatus = response.statusCode;
      } else if (response.status) {
        lstatus = response.status;
      }

      if (!lstatus) {
        return "none";
      }

      if (lstatus < 199 || lstatus == 202) {
        return "warning";
      }

      if (lstatus == 200) {
        return "success";
      }

      if (lstatus > 299) {
        return "error";
      }

      return "none";
    },
    onJsonStackUpdate(event) {
      this.lresource.record.ota_stack = event;
      this.ota_stack_version++;
    },
    onJsonRequestUpdate(event) {
      this.lresource.record.ota_command = event;
      this.ota_stack_version++;
    },
    hasPermissionToEdit() {
      console.log("flo-card-edit - hasPermissionToEdit - enter");
      if (this.lresource.permissions.u == true && this.lresource.permissions.e == true) {
        return true;
      }
      return false;
    },
    canEnterBeginMode() {
      if (!this.hasPermissionToEdit()) {
        return false;
      }
      return this.getOtaState() == "edit";
    },
    canEnterEditMode() {
      if (!this.hasPermissionToEdit()) {
        return false;
      }
      return this.getOtaState() == "idle" || this.getOtaState() == "wait";
    },
    canEnterWaitMode() {
      if (!this.hasPermissionToEdit()) {
        return false;
      }
      return this.getOtaState() == "edit" || this.getOtaState() == "sync";
    },
    canEnterSyncMode() {
      if (!this.hasPermissionToEdit()) {
        return false;
      }
      if (this.getOtaState() == "wait" || this.getOtaState() == "edit") {
        return true;
      }
      return false;
    },
    async enterEditStep() {
      console.log("flo-card-edit - enterEditStep - enter");
      if (!this.canEnterEditMode()) {
        return false;
      }
      await this.updateOtaState("edit");
    },
    async enterBeginStep(p_force, p_cancel) {
      console.log("flo-card-edit - enterBeginStep - enter");
      if (!p_force) {
        if (!this.canEnterBeginMode()) {
          return false;
        }
      }

      let l_action = "idle";
      if (p_cancel) {
        l_action = p_cancel;
      }
      await this.updateOtaState(l_action);
    },
    async enterWaitStep(p_skip_ota_stack) {
      if (!this.canEnterWaitMode()) {
        return false;
      }
      await this.updateOtaState("wait", p_skip_ota_stack);
    },
    async enterUpdateDatabaseOnly() {
      if (!this.canEnterWaitMode()) {
        return false;
      }
      this.$emit("sync");
      await this.updateOtaState("dbonly");
    },
    async enterSyncStep() {
      if (!this.canEnterSyncMode()) {
        return false;
      }

      this.loading_synchronize = true;

      try {
        await this.updateOtaState("sync");
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      this.loading_synchronize = false;
    },
    async cancelEditStep() {
      this.loading_synchronize = true;
      try {
        await this.enterBeginStep(false, "cancel");
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      this.loading_synchronize = false;
    },
    async backWaitStep() {
      try {
        this.loading_cancel = true;
        await this.enterEditStep();
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      this.loading_cancel = false;
    },
    async cancelWaitStep() {
      console.log("flo-card-edit - cancelWaitStep - enter");
      try {
        this.loading_cancel = true;
        await this.enterBeginStep(true, "cancel");
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      this.loading_cancel = false;
    },
    async backSyncStep() {
      try {
        this.loading_cancel = true;
        await this.enterWaitStep(true);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      this.loading_cancel = false;
    },
    async cancelSyncStep() {
      try {
        this.loading_cancel = true;
        await this.enterBeginStep(true, "cancel");
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      this.loading_cancel = false;
    },
    canSynchronize() {
      if (this.lresource.record.scp_state != "idle") {
        return false;
      }

      return true;
    },
    canEdit() {
      if (!this.hasPermissionToEdit()) {
        return false;
      }
      let luser = this.$auth.user;
      if (this.getOtaState() == "edit" && this.lresource.record.ota_user == luser.email) {
        return true;
      } else if (this.getOtaState() == "wait" && this.lresource.record.ota_user == luser.email) {
        return true;
      } else if (this.getOtaState() == "sync" && this.lresource.record.ota_user == luser.email) {
        return true;
      } else if (this.getOtaState() == "dbonly" && this.lresource.record.ota_user == luser.email) {
        return true;
      }
    },
    canEditScp() {
      if (this.getOtaState() == "edit") {
        return false;
      } else if (this.getOtaState() == "idle") {
        return false;
      } else {
        return true;
      }
    },
    getStackType() {
      let lstack_type = this.lresource.default_ota_stack_type;
      if (!this.lresource.record.ota_stack) {
        console.log(`flo-card-edit - getStackType - No OTA Stack`);
        return lstack_type;
      }

      let lota_stack = this.lresource.record.ota_stack;
      console.log(`flo-card-edit - getStackType - OTA Stack - ${JSON.stringify(lota_stack)}`);
      if (!lota_stack.hasOwnProperty("type")) {
        console.log(`flo-card-edit - getStackType - No Type Tag`);
        lota_stack["type"] = lstack_type;
        return lstack_type;
      }

      console.log(`flo-card-edit - getStackType - lota_stack: ${JSON.stringify(lota_stack)}`);
      lstack_type = lota_stack.type;
      console.log(`flo-card-edit - getStackType - is: ${lstack_type}`);

      return lstack_type;
    },
    getScpStackChange() {
      if (!this.lresource.record.ota_stack) {
        console.log(`flo-card-edit - getScpStackChange - No OTA Stack`);
        return null;
      }

      let lota_stack = this.lresource.record.ota_stack;
      console.log(`flo-card-edit - getScpStackChange - OTA Stack - ${JSON.stringify(lota_stack)}`);

      if (!lota_stack.hasOwnProperty("type")) {
        console.log(`flo-card-edit - getScpStackChange - No Type Tag`);
        return null;
      }

      if (!lota_stack.hasOwnProperty("changes")) {
        console.log(`flo-card-edit - getScpStackChange - No Changes`);
        return null;
      }

      let lchanges = lota_stack.changes;
      if (lchanges.length <= 0) {
        console.log(`flo-card-edit - getScpStackChange - No Changes Length`);
        return null;
      }

      console.log(`flo-card-edit - getScpStackChange - ${JSON.stringify(lchanges[0])}`);
      return lchanges[0];
    },
    onScpChange(event) {
      console.log(`flo-card-edit - onScpChange - enter`);
      console.log(`flo-card-edit - onScpChange - ${JSON.stringify(event)}`);
      let lota_stack = this.lresource.record.ota_stack;

      if (event.hasOwnProperty("transport")) {
        if (event.transport != "") {
          let ltransport = event.transport;
          this.transport = ltransport;
        }
      }

      if (event.hasOwnProperty("type")) {
        let ltype = event.type;
        if (ltype == "rfm" || ltype == "ram") {
          lota_stack.type = "scp";
        } else if (ltype == "flolive") {
          lota_stack.type = "applet";
        }
      }

      if (lota_stack.hasOwnProperty("changes")) {
        lota_stack.changes[0] = event;
      }

      this.totalVersion++;
    },
    onScpLoading(event) {
      this.scp_loading = event;
      this.$emit("scp_loading", this.scp_loading);
    },
    onSyncChange() {
      this.$emit("sync");
    },
    onSendRam(event) {
      console.log(`flo-card-edit - onSendRam - enter`);
      console.log(`flo-card-edit - onSendRam - ${JSON.stringify(event)}`);
      let lota_stack = this.lresource.record.ota_stack;
      if (lota_stack.changes.length > 0) {
        lota_stack.changes[0].operations = event;
      }
    },
    async updateOtaState(state, p_skip_stack) {
      console.log("flo-card-edit - updateOtaState - enter");
      console.log(`flo-card-edit - updateOtaState iccid: ${this.lresource.record.iccid}, state:${state}`);
      let body = {
        id: this.lresource.record.id,
        iccid: this.lresource.record.iccid,
        action: state,
      };
      if (!p_skip_stack) {
        if (state === "wait" || state === "sync" || state === "dbonly") {
          if (this.getOtaState() == "edit") {
            if (this.lresource.record.ota_stack) {
              let lota_stack = Object.assign({}, this.lresource.record.ota_stack);
              body["update"] = lota_stack;
            }
          }
        }
      }
      console.log(`flo-card-edit - updateOtaState - ${JSON.stringify(body)}`);
      try {
        this.updateInProgress = true;
        let lupdate = await this.$axios.$put(`/api/v1/cards/update`, body);
        this.lresource.record = lupdate;
        this.updateInProgress = false;
        this.$emit("update_success", body);
        this.ota_stack_version++;
      } catch (err) {
        console.log(`flo-card-edit - updateOtaState - error: ${err}`);
        let lerr = this.parseNetError(err);
        console.log(`flo-card-edit - updateOtaState - application error: ${JSON.stringify(lerr)}`);
        this.tellUser("error", `${lerr.statusCode} - ${lerr.message}`);
        this.updateInProgress = false;
        this.$emit("update_failed", err);
        return "FAIL";
      }
      return "OK";
    },
    async sendQuery() {
      this.loading_query = true;

      try {
        let body = {
          iccid: this.lresource.record.iccid,
        };
        let answer = await this.$axios.$post("/api/v1/cards/scp/sf/query", body);
        console.log(`flo-card-edit - sendQuery - ${JSON.stringify(answer)}`);
        if (answer != null) {
          this.tellUser("success", `${answer.message_state_str} - ${answer.message_state_description}`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      this.loading_query = false;
    },
    async sendCardRegistrarSuspend(suspend, iccid) {
      let request = {
        command: {
          type: "card",
          action: suspend ? "suspend" : "resume",
          iccid: iccid,
        },
      };
      try {
        await this.$axios.$post("/api/v1/cards/registrar/suspend", request);
        this.tellUser("success", "Action performed successfully.");
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async suspendCardRegistrarCmd() {
      this.lresource.record.suspended = this.lresource.record.suspended == 0 ? 1 : 0;
      await this.sendCardRegistrarSuspend(this.lresource.record.suspended, this.lresource.record.iccid);
    },
    getSuspendCardRegistrarInfo() {
      let l_suspended = this.lresource.record.suspended;
      let l_registrar_permissions = this.permissions.find((p) => p.res == "registrars");
      let info = {
        text: l_suspended == 0 ? "Suspend" : "Unsuspend",
        icon: l_suspended == 0 ? "mdi-sim-off-outline" : "mdi-sim-outline",
        visible: false,
      };

      if (this.getOtaState() != "idle") {
        if (l_registrar_permissions) {
          if (l_registrar_permissions.u == true && this.resource_data.hlr_id != 0) {
            info.visible = true;
          }
        }
      }

      return info;
    },
    async sendCardBillingSuspend(suspend, iccid) {
      let request = {
        command: {
          type: "card",
          action: suspend ? "suspend" : "resume",
          iccid: iccid,
        },
      };

      try {
        await this.$axios.$post("/api/v1/cards/billing/suspend", request);
        this.tellUser("success", "Action performed successfully.");
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async suspendCardBillingCmd() {
      this.lresource.record.suspended_billing = this.lresource.record.suspended_billing == 0 ? 1 : 0;
      await this.sendCardBillingSuspend(this.lresource.record.suspended_billing, this.lresource.record.iccid);
    },
    getSuspendCardBillingInfo() {
      let l_suspended = this.lresource.record.suspended_billing;
      let l_billing_permissions = this.permissions.find((p) => p.res == "billings");
      let info = {
        text: l_suspended == 0 ? "Suspend" : "Unsuspend",
        icon: l_suspended == 0 ? "mdi-account-off-outline" : "mdi-account-outline",
        visible: false,
      };

      if (this.getOtaState() != "idle" && this.resource_data.billing_id != 0) {
        if (l_billing_permissions) {
          if (l_billing_permissions.u == true) {
            info.visible = true;
          }
        }
      }

      return info;
    },
  },
};
</script>
