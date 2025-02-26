<template>
  <div class="flo-order-enrich-subscriber">
    <v-container fluid class="ma-0 pa-1">
      <v-row v-if="!findSingle()" no-gutters>
        <v-col class="pa-1" cols="12" lg="1" xl="1">
          <v-switch v-model="sub.used" label="Used" :true-value="1" :false-value="0" hint="Subscriber Usage" color="success" inset persistent-hint outlined></v-switch>
        </v-col>
        <v-col v-if="sub.hasOwnProperty('name') && sub.used" class="pa-1 mt-1" cols="12" lg="2" xl="2">
          <v-text-field v-model="sub.name" :label="name.label" :rules="[name.rule]" :messages="formatSubscriberWarnings(sub.idx, 'name', sub.name)" class="mt-2" persistent-hint outlined dense>
            <template v-slot:message="{ message }">
              <span v-html="message"></span>
            </template>
          </v-text-field>
        </v-col>
      </v-row>

      <template v-if="sub.used">
        <v-row no-gutters>
          <v-col class="py-1" cols="12">
            <flo-expand title="Services" open elevation="0">
              <template v-slot:content="{}">
                <v-container fluid class="ma-0 pa-1">
                  <v-row no-gutters>
                    <v-col class="pa-1" cols="12" lg="2" xl="2">
                      <v-autocomplete v-model="sub.hlr_id" :disabled="!hasBinding('hlr')" :label="bindings.hlr.label" :messages="formatSubscriberWarnings(sub.idx, 'hlr_id', sub.hlr_id)" :items="bindings.hlr.items" :rules="bindings.hlr.rule" @change="onSubscriberChange($event, 'hlr')" @click:clear="clearHlrParams($event)" item-text="value" item-value="key" clearable dense persistent-hint outlined>
                        <template v-slot:message="{ message }"> <span v-html="message"></span> </template
                      ></v-autocomplete>
                    </v-col>

                    <template v-if="sub.hlr_id">
                      <v-col v-if="has_hsm" :key="`${redraw}-a`" class="pa-1" cols="12" lg="2" xl="2">
                        <v-autocomplete v-model="sub.op_net_id" :label="op.label" :hint="formatDynamicHlrHint('op', sub.op_net_id)" :no-data-text="op.no_data_text" :items="op.items" item-text="value" item-value="key" clearable dense persistent-hint outlined></v-autocomplete>
                      </v-col>
                      <v-col v-if="sub.hasOwnProperty('mnc')" :key="`${redraw}-b`" class="pa-1" cols="12" lg="2" xl="2">
                        <v-select v-model="sub.mnc" :label="mnc.label" :hint="formatDynamicHlrHint('mnc_len', sub.mnc)" :items="mnc.items" persistent-hint dense outlined> </v-select>
                      </v-col>
                      <v-col :key="`${redraw}-c`" class="pa-1" cols="12" lg="2" xl="2">
                        <v-text-field v-model.number="sub.profile_id" :label="profile_id.label" :hint="formatDynamicHlrHint('profile_id', sub.profile_id)" :rules="[profile_id.rule]" persistent-hint outlined dense></v-text-field>
                      </v-col>
                      <v-col :key="`${redraw}-d`" class="pa-1" cols="12" lg="2" xl="2">
                        <v-text-field v-model.number="sub.steering_id" :label="steering_id.label" :hint="formatDynamicHlrHint('steering_id', sub.steering_id)" :rules="[steering_id.rule]" persistent-hint outlined dense></v-text-field>
                      </v-col>
                      <v-col :key="`${redraw}-f`" class="pa-1" cols="12" lg="2" xl="2">
                        <v-autocomplete v-model="sub.alg_id" :label="alg_id.label" :hint="formatDynamicHlrHint('alg_id', sub.alg_id)" :items="alg_id.items" item-text="value" item-value="key" persistent-hint clearable dense outlined> </v-autocomplete>
                      </v-col>
                    </template>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="pa-1" cols="12" lg="2" xl="2">
                      <v-autocomplete v-model="sub.smsc_id" :disabled="!hasBinding('smsc')" :label="bindings.smsc.label" :messages="formatSubscriberWarnings(sub.idx, 'smsc_id', sub.smsc_id)" :items="bindings.smsc.items" :rules="bindings.smsc.rule" @change="onSubscriberChange($event, 'smsc')" @click:clear="clearSmscParams($event)" item-text="value" item-value="key" dense clearable persistent-hint outlined>
                        <template v-slot:message="{ message }">
                          <span v-html="message"></span>
                        </template>
                      </v-autocomplete>
                    </v-col>
                    <v-col v-if="sub.hasOwnProperty('smsc') && sub.smsc_id" :key="`${redraw}-g`" class="pa-1" cols="12" lg="2" xl="2">
                      <v-text-field v-model="sub.smsc" :label="smsc.label" :hint="formatDynamicSmscHint('smsc_no', sub.smsc)" :rules="[smsc.rule]" persistent-hint outlined dense></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="pa-1" cols="12" lg="2" xl="2">
                      <v-autocomplete v-model="sub.bip_id" :disabled="!hasBinding('bip')" :label="bindings.bip.label" :messages="formatSubscriberWarnings(sub.idx, 'bip_id', sub.bip_id)" :items="bindings.bip.items" item-text="value" item-value="key" dense clearable persistent-hint outlined>
                        <template v-slot:message="{ message }">
                          <span v-html="message"></span>
                        </template>
                      </v-autocomplete>
                    </v-col>
                    <v-col v-if="sub.hasOwnProperty('apn')" class="pa-1" cols="12" lg="2" xl="2">
                      <v-autocomplete v-model="sub.apn" :label="bindings.apn.label" :messages="formatSubscriberWarnings(sub.idx, 'apn', sub.apn)" :items="bindings.apn.items" item-text="value" item-value="key" persistent-hint dense clearable outlined>
                        <template v-slot:message="{ message }">
                          <span v-html="message"></span>
                        </template>
                      </v-autocomplete>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="pa-1" cols="12" lg="2" xl="2">
                      <v-autocomplete v-model="sub.billing_id" :disabled="!hasBinding('billing')" :label="bindings.billing.label" :messages="formatSubscriberWarnings(sub.idx, 'billing_id', sub.billing_id)" :items="bindings.billing.items" item-text="value" item-value="key" dense clearable persistent-hint outlined>
                        <template v-slot:message="{ message }">
                          <span v-html="message"></span>
                        </template>
                      </v-autocomplete>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="pa-1" cols="12" lg="2" xl="2">
                      <v-switch v-model="sub.create_sub" :true-value="1" :false-value="0" :label="bindings.create_sub.label" :hint="bindings.create_sub.hint" color="success" inset persistent-hint outlined></v-switch>
                    </v-col>
                  </v-row>
                </v-container>
              </template>
            </flo-expand>
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col class="py-1" cols="12">
            <flo-expand title="Identifiers" open elevation="0">
              <template v-slot:content="{}">
                <v-container fluid class="ma-0 pa-1">
                  <v-row no-gutters>
                    <v-col class="pa-1" cols="12" lg="2" xl="2">
                      <v-select v-model="imsi.value" :label="imsi.label" :hint="formatDynamicIdentifiersHint('IMSI', imsi.value)" :items="imsi.items" @change="getSubImsi(sub.idx, $event)" item-text="value" item-value="key" dense persistent-hint outlined></v-select>
                    </v-col>
                    <v-col v-if="imsi.value == 'fixed' || imsi.value == 'drive'" class="pa-1" cols="12" lg="2" xl="2">
                      <v-text-field v-model="sub.imsi" :label="imsi.label" :hint="imsi.hint" :rules="[imsi.rule]" counter persistent-hint outlined dense></v-text-field>
                    </v-col>
                    <v-col v-if="sub.hasOwnProperty('key_id') && network_keys.value != 'map' && !findSingle()" class="pa-1" cols="12" lg="2" xl="2">
                      <v-select v-model="sub.key_id" :label="sub_key_ids.label" :messages="formatSubscriberWarnings(sub.idx, 'key_id')" :items="sub_key_ids.items" dense persistent-hint outlined>
                        <template v-slot:message="{ message }">
                          <span v-html="message"></span>
                        </template>
                      </v-select>
                    </v-col>
                    <v-col class="pa-1" cols="12" lg="2" xl="2">
                      <v-select v-model="network_keys.value" @change="sub.network_keys = network_keys.value" :label="network_keys.label" :hint="formatDynamicIdentifiersHint('KI/OPC', network_keys.value)" :items="filterNetworkKeys(sub)" item-text="value" item-value="key" dense persistent-hint outlined></v-select>
                    </v-col>
                    <v-col v-if="['fixed_ki', 'fixed_ki_opc'].includes(network_keys.value)" class="pa-1" cols="12" lg="2" xl="2">
                      <v-text-field v-model="sub.ki" :label="fixed_ki.label" :hint="fixed_ki.hint" :rules="[fixed_ki.rule]" :append-icon="show_ki ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show_ki = !show_ki" :type="show_ki ? 'text' : 'password'" counter persistent-hint outlined dense></v-text-field>
                    </v-col>
                    <v-col v-if="network_keys.value == 'fixed_ki_opc'" class="pa-1" cols="12" lg="2" xl="2">
                      <v-text-field v-model="sub.opc" :label="fixed_opc.label" :hint="fixed_opc.hint" :rules="[fixed_opc.rule]" :append-icon="show_opc ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show_opc = !show_opc" :type="show_opc ? 'text' : 'password'" counter persistent-hint outlined dense></v-text-field>
                    </v-col>
                    <v-col v-if="network_keys.value == 'map'" class="pa-1" cols="12" lg="2" xl="2">
                      <v-autocomplete v-model="sub.map_ki_opc" :items="subs_idx.items" :label="subs_idx.label" :hint="subs_idx.hint" item-text="value" item-value="key" dense persistent-hint outlined></v-autocomplete>
                    </v-col>
                    <v-col v-if="sub.hasOwnProperty('imsi_range')" class="pa-1" cols="12" lg="2" xl="2">
                      <v-text-field v-model="sub.imsi_range" :label="imsi_range.label" :hint="imsi_range.hint" persistent-hint outlined dense></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="pa-1" cols="12" lg="2" xl="2">
                      <v-select v-model="msisdn.value" @change="getSubMsisdn(sub.idx, $event)" :label="msisdn.label" :hint="formatDynamicIdentifiersHint('MSISDN', msisdn.value)" :items="msisdn.items" item-text="value" item-value="key" dense persistent-hint outlined></v-select>
                    </v-col>
                    <v-col v-if="msisdn.value == 'fixed' || msisdn.value == 'drive'" class="pa-1" cols="12" lg="2" xl="2">
                      <v-text-field v-model="sub.msisdn" :label="msisdn.label" :hint="msisdn.hint" :rules="[msisdn.rule]" counter persistent-hint outlined dense></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </template>
            </flo-expand>
          </v-col>
        </v-row>

        <v-row v-if="!findSingle()" no-gutters>
          <v-col cols="12" class="py-1">
            <flo-expand title="Countries & PLMNs" open elevation="0">
              <template v-slot:content="{}">
                <v-container fluid class="ma-0 pa-1">
                  <flo-mcc-list v-if="sub.hasOwnProperty('mcc')" :messages="formatSubscriberWarnings(sub.idx, 'mcc')" v-model="sub.mcc" />
                  <v-row no-gutters>
                    <v-col v-if="sub.hasOwnProperty('plmn')" class="pa-1" cols="12" lg="2" xl="2">
                      <v-text-field v-model="sub.plmn" :label="plmn.label" :messages="formatSubscriberWarnings(sub.idx, 'plmn')" :rules="[plmn.rule]" persistent-hint outlined dense>
                        <template v-slot:message="{ message }">
                          <span v-html="message"></span>
                        </template>
                      </v-text-field>
                    </v-col>
                    <v-col class="pa-1" cols="12" lg="2" xl="2" v-for="(field, i) in unknown_fields" :key="`f-${i}`">
                      <template v-if="field == 'fplmn'">
                        <v-text-field v-model="value[field]" :label="fplmn.label" :messages="formatSubscriberWarnings(sub.idx, 'fplmn')" :rules="[fplmn.rule]" persistent-hint outlined dense>
                          <template v-slot:message="{ message }">
                            <span v-html="message"></span>
                          </template>
                        </v-text-field>
                      </template>
                      <template v-if="field == 'ehplmn'">
                        <v-text-field v-model="value[field]" :label="ehplmn.label" :messages="formatSubscriberWarnings(sub.idx, 'ehplmn')" :rules="[ehplmn.rule]" persistent-hint outlined dense>
                          <template v-slot:message="{ message }">
                            <span v-html="message"></span>
                          </template>
                        </v-text-field>
                      </template>

                      <v-text-field v-else-if="field == 'lrplmnsi'" v-model="value[field]" :label="lrplmnsi.label" :hint="lrplmnsi.hint" persistent-hint outlined dense></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </template>
            </flo-expand>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </div>
</template>

<script>
import floMccList from "~/components/widgets/floMccList.vue";
import OTranslator from "~/src/otranslator.js";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
export default {
  name: "flo-order-enrich-subscriber",
  components: {
    floMccList,
  },
  data() {
    return {
      sub: null,
      translator: null,
      redraw: 0,
      unknown_fields: [],
      show_ki: false,
      show_opc: false,
      name: {
        label: "Name",
        hint: "Subscriber Name",
        rule: (v) => {
          const pattern = /^$|^.{2,}$/;
          return pattern.test(v) || "Invalid name format.";
        },
      },
      plmn: {
        label: "PLMN",
        hint: "Subscriber PLMN",
        rule: (v) => {
          const pattern = /^$|^([0-9]{5}[0-9Ff]{1}[0-9A-Fa-f]{4})(,([0-9]{5}[0-9Ff]{1}[0-9A-Fa-f]{4}))*$/;
          return pattern.test(v) || "Invalid PLMN format.";
        },
      },
      ehplmn: {
        label: "EHPLMN",
        hint: "Equivalent Home PLMN",
        rule: (v) => {
          const pattern = /^$|^([0-9]{5}[0-9Ff]{1})(,([0-9]{5}[0-9Ff]{1}))*$/;
          return pattern.test(v) || "Invalid EHPLMN format.";
        },
      },
      fplmn: {
        label: "FPLMN",
        hint: "Forbidden PLMN",
        rule: (v) => {
          const pattern = /^$|^([0-9]{5}[0-9Ff]{1})(,([0-9]{5}[0-9Ff]{1}))*$/;
          return pattern.test(v) || "Invalid FPLMN format.";
        },
      },
      lrplmnsi: {
        label: "LRPLMNSI",
        hint: "Last RPLMN Selection Indication",
      },
      op: {
        label: "OP",
        hint: "Operator Key",
        no_data_text: "Please select valid Registrar",
        items: [],
      },
      mcc: {
        label: "MCC List",
        hint: "Mobile Country Code Availability",
      },
      mnc: {
        label: "MNC Length",
        items: [2, 3],
      },
      smsc: {
        label: "SMSC Number",
        rule: (v) => {
          const pattern = /^[0-9]{0,32}$/;
          return pattern.test(v) || "Invalid SMSC format.";
        },
      },
      profile_id: {
        label: "Profile Id",
        rule: (v) => {
          const pattern = /^[0-9]*$/;
          return pattern.test(v) || "Invalid Profile ID format.";
        },
      },
      steering_id: {
        label: "Steering Id",
        rule: (v) => {
          const pattern = /^[0-9]*$/;
          return pattern.test(v) || "Invalid Steering Id format.";
        },
      },
      subs_idx: {
        items: [],
        label: "Map Subscriber",
        hint: "Mapped subscriber",
      },
      sub_key_ids: {
        label: "KI/OPC Index",
        hint: "KI/OPC Index In Store",
        items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
      imsi: {
        value: "keep",
        label: "IMSI",
        hint: "International Mobile Subscriber Identity",
        items: [
          { key: "keep", value: "Keep" },
          // { key: "shared", value: "Shared" },
          { key: "fixed", value: "Fixed" },
          { key: "drive", value: "Drive" },
        ],
        rule: (v) => {
          const pattern = /^(?:[0-9]{15}|)$/;
          return pattern.test(v) || "Invalid IMSI format.";
        },
      },
      imsi_range: {
        label: "IMSI Range",
        hint: "IMSI Range (in quantity)",
      },
      msisdn: {
        value: "keep",
        label: "MSISDN",
        hint: "Mobile Subscriber Integrated Services Digital Network Number",
        items: [
          { key: "keep", value: "Keep" },
          // { key: "shared", value: "Shared" },
          { key: "fixed", value: "Fixed" },
          { key: "drive", value: "Drive" },
        ],
        rule: (v) => {
          const pattern = /^(?:[0-9]{4,15}|)$/;
          return pattern.test(v) || "Invalid MSISDN format.";
        },
      },
      alg_id: {
        label: "Algorithm Id",
        items: [
          { key: 1, value: "Algorithm 1" },
          { key: 2, value: "Algorithm 2" },
          { key: 3, value: "Algorithm 3" },
        ],
      },
      shared_ki: {
        label: "Shared KI",
        hint: "Shared Subscriber Key",
        no_data_text: "Selected HSM doesn't have KI",
        items: [],
      },
      fixed_ki: {
        label: "Fixed KI",
        hint: "Fixed Subscriber Key",
        rule: (v) => {
          const pattern = /^(?:[0-9a-fA-F]{32}|)$/;
          return pattern.test(v) || "Invalid KI format.";
        },
      },
      fixed_opc: {
        label: "Fixed OPC",
        hint: "Fixed Operator-Subscriber Computed Operation",
        rule: (v) => {
          const pattern = /^(?:[0-9a-fA-F]{32}|)$/;
          return pattern.test(v) || "Invalid OPC format.";
        },
      },
      network_keys: {
        value: "",
        label: "Network Keys (KI/OPC)",
      },
      shared_opc: {
        label: "Shared OPC",
        hint: "Shared Operator-Subscriber Computed Operation",
        no_data_text: "Selected HSM doesn't have OPC",
        items: [],
      },
    };
  },
  props: {
    value: {
      type: Object,
      required: false,
    },
    bindings: {
      type: Object,
      required: false,
    },
    ki: {
      type: Array,
      required: false,
    },
    opc: {
      type: Array,
      required: false,
    },
    subs: {
      type: Array,
      required: false,
    },
    subs_differences: {
      type: Array,
      required: false,
    },
    order_inputs: {
      type: Array,
      required: false,
    },
    has_hsm: {
      type: Boolean,
      required: false,
    },
    product: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: false,
    },
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    async initialize() {
      this.setSubDefaults();
      let translator = new OTranslator();
      translator.setEnumEx("countries", this.$store.getters["session/cache"]["/denum/mcc"].value);
      this.translator = translator;
    },
    async onSubscriberChange(event, type) {
      if (type == "hlr") {
        await this.findHlrParams(event);
      } else if (type == "smsc") {
        await this.findSmscParams(event);
      }
      this.redraw++;
    },
    getProductSubscribers() {
      let extra = this.product.extra;
      return extra && extra.data && extra.data.subscribers ? extra.data.subscribers : [];
    },
    getProductHeaders() {
      let extra = this.product.extra;
      return extra && extra.data && extra.data.headers ? extra.data.headers : [];
    },
    getSubImsi(idx, event) {
      this.sub.edit_imsi = event;
      if (event == "fixed" || event == "drive") {
        if (this.order_inputs.length > 0) {
          let l_val = this.order_inputs.find((f) => f.name.toLowerCase() == `imsi${idx}`);
          if (l_val) {
            this.sub.imsi = l_val.value;
          }
        }
      }
    },
    getSubMsisdn(idx, event) {
      this.sub.edit_msisdn = event;
      if (event == "fixed" || event == "drive") {
        if (this.order_inputs.length > 0) {
          let l_val = this.order_inputs.find((f) => f.name.toLowerCase() == `msisdn${idx}`);
          if (l_val) {
            this.sub.msisdn = l_val.value;
          }
        }
      }
    },
    setSubDefaults() {
      this.sub = this.value;
      this.sub["edit_msisdn"] = "keep";
      this.sub["edit_imsi"] = "keep";
      this.sub["create_sub"] = 1;
      let nkeys = "";

      let found = this.getProductSubscribers().find((f) => f.idx == this.sub.idx);
      if (found && found.hasOwnProperty("network_keys")) {
        nkeys = found.network_keys[0];
      }
      if (found && found.hasOwnProperty("map_ki_opc")) {
        this.sub.map_ki_opc = found.map_ki_opc;
      }
      // if (this.sub.hasOwnProperty("map_ki_opc")) {
      //   delete this.sub.map_ki_opc;
      // }
      this.sub["network_keys"] = nkeys ? nkeys : "keep";
      this.network_keys.value = nkeys ? nkeys : "keep";

      if (!this.sub.mcc) {
        this.sub.mcc = "FFF";
      }
      if (typeof this.sub.mcc !== "string") {
        this.sub.mcc = this.sub.mcc.toString();
      }
      if (this.ki) {
        this.shared_ki.items = this.ki;
      }
      if (this.opc) {
        this.shared_opc.items = this.opc;
      }

      this.unknown_fields = Object.keys(this.value);
      let filter = ["idx", "name", "ki", "opc", "key_id", "imsi_range", "imsi", "msisdn", "label", "used", "apn", "smsc", "mcc", "plmn", "mnc", "hlr_id", "op_net_id", "smsc_id", "bip_id", "billing_id", "create_sub", "edit_imsi", "edit_msisdn", "network_keys", "map_ki_opc"];
      this.unknown_fields = this.unknown_fields.filter((f) => !filter.includes(f));
      if (this.subs.length > 0) {
        this.subs_idx.items = this.subs.map((m) => {
          return {
            key: `map: ${m.idx}`,
            value: `Map to Subscriber ${m.idx}`,
          };
        });
      }
      let { hlr_id, smsc_id, op_net_id, profile_id, steering_id, alg_id, mnc, smsc } = this.sub;
      if (hlr_id && this.bindings.hlr.items.length > 0) {
        this.findHlrParams(hlr_id, op_net_id, profile_id, steering_id, alg_id, mnc);
      }
      if (smsc_id && this.bindings.smsc.items.length > 0) {
        this.findSmscParams(smsc_id, smsc);
      }
    },
    hasBinding(binding) {
      if (this.bindings[binding].items.length > 0) {
        return true;
      }
    },
    formatSubscriberWarnings(idx, key, val) {
      let prefix = "*Differs from product";
      let found = this.subs_differences.find((f) => f.idx == idx);
      let hints = {
        name: "Subscriber Name",
        apn: "Access Point Name",
        billing_id: "Billing",
        hlr_id: "Home Location Registrar",
        smsc_id: "Short Message Service Center",
        bip_id: "Bearer Independent Protocol",
        key_id: "KI/OPC Index In Store",
        plmn: "Subscriber PLMN",
        ehplmn: "Equivalent Home PLMN",
        fplmn: "Forbidden PLMN",
        mcc: "Mobile Country Code Availability",
      };

      if (this.type == "local_factory" && this.product.type == "blank" && val == "Blank") {
        return `
          ${hints[key]}
          <br />
          <span class="caption warning--text">Value can't be Blank.</span>`;
      }

      if (!found || !found[key]) {
        return hints[key];
      }

      let { original, updated } = found[key];
      let bindings = ["apn_id", "billing_id", "hlr_id", "smsc_id", "bip_id"].includes(key);

      if (original && updated && bindings) {
        let sliced = key.slice(0, -3);
        let item = this.bindings[sliced].items.find((f) => f.key == original);

        return `
          ${hints[key]}
          <br />
          <span class="caption warning--text">${prefix}: ${item?.value || original}</span>`;
      } else if (original && !updated) {
        return `
          ${hints[key]}
          <br />
          <span class="caption warning--text">${prefix} & can't be empty.</span>`;
      } else {
        return hints[key];
      }
    },
    formatDynamicIdentifiersHint(type, value) {
      let hints = {
        keep: `Keep the existing ${type}.`,
        map: `Map the ${type} to existing subscriber.`,
        keep_and_wrap: `Keep the existing ${type} & wrap it.`,
        shared: `Use shared ${type} for all subscribers.`,
        fixed: `Use fixed ${type} for all subscribers.`,
        fixed_ki_opc: `Use fixed KI/OPC for all subscribers.`,
        fixed_ki: `Use fixed KI for all subscribers.`,
        drive: `Drive (create) the ${type}.`,
        drive_ki: `Drive (create) the KI Only.`,
        drive_opc: `Drive (create) the OPC Only.`,
        default: `Select how you would like to manipulate the ${type}.`,
      };

      return hints[value] || hints.default;
    },
    formatDynamicHlrHint(type, value) {
      let hints = {
        op: "Operator Key",
        mnc_len: "Mobile Network Code Length",
        profile_id: "Profile Id",
        steering_id: "Steering Id",
        alg_id: "Algorithm Id",
      };

      let hintType = hints[type];
      let hlr_id = this.sub.hlr_id;

      if (hlr_id) {
        let found = this.bindings.hlr.items.find((f) => f.key == hlr_id);

        if (found) {
          return value == found[type] ? `Default ${hintType}` : `Enriched ${hintType}`;
        }
      }

      return hintType;
    },
    formatDynamicSmscHint(type, value) {
      let hints = {
        smsc_no: "SMSC Number",
      };

      let hintType = hints[type];
      let smsc_id = this.sub.smsc_id;

      if (smsc_id) {
        let found = this.bindings.smsc.items.find((f) => f.key == smsc_id);

        if (found) {
          return value == found[type] ? `Default ${hintType}` : `Enriched ${hintType}`;
        }
      }

      return hintType;
    },
    findSingle() {
      return this.getProductHeaders().find((f) => f.name == "single" && f.default == "1");
    },
    findSmscParams(smsc_id, smsc) {
      if (smsc == undefined || smsc == "") {
        let found = this.bindings.smsc.items.find((f) => f.key == smsc_id);

        if (found) {
          this.sub.smsc = found.smsc_no;
        }
      }
    },
    filterNetworkKeys(sub) {
      const defaultItems = [
        { key: "keep", value: "Keep" },
        { key: "map", value: "Map" },
        { key: "drive", value: "Drive KI/OPC" },
      ];

      let items = [
        { key: "keep", value: "Keep" },
        { key: "map", value: "Map" },
        { key: "drive", value: "Drive KI/OPC" },
        { key: "drive_ki", value: "Drive KI Only" },
        { key: "drive_opc", value: "Drive OPC Only" },
        { key: "fixed_ki_opc", value: "Fixed KI/OPC" },
        { key: "fixed_ki", value: "Fixed KI Only" },
        // { key: "keep_and_wrap", value: "Keep & Wrap" },
        // { key: "shared", value: "Shared" },
      ];

      const found = this.getProductSubscribers().find((f) => f.idx == sub.idx);
      if (found && found.hasOwnProperty("network_keys")) {
        items = items.filter((f) => found.network_keys.includes(f.key));
      } else {
        items = defaultItems;
      }

      return items;
    },
    clearHlrParams() {
      this.sub.op_net_id = null;
      this.sub.alg_id = null;
      this.sub.profile_id = 0;
      this.sub.steering_id = 0;
    },
    clearSmscParams() {
      this.sub.smsc = "";
    },
    async findHlrParams(hlr_id, op_net_id, profile, steering, algorithm, mnc) {
      let found = this.bindings.hlr.items.find((f) => f.key == hlr_id);
      if (found) {
        let { op, mnc_len, hsm_id, profile_id, steering_id, alg_id } = found;
        this.sub.op_net_id = op_net_id ?? op;
        this.sub.mnc = mnc || mnc_len;
        this.sub.profile_id = profile ?? profile_id;
        this.sub.steering_id = steering ?? steering_id;
        this.sub.alg_id = algorithm || alg_id;

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
                v: hsm_id ? hsm_id : 0,
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
      }
    },
  },
};
</script>
