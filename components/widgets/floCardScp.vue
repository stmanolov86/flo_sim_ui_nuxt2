<template>
  <div class="flo-card-scp">
    <v-container class="ma-0 pa-0" fluid v-if="!scp_loading">
      <v-row no-gutters v-if="scp.transport != ''">
        <v-col cols="12">
          <v-container fluid class="ma-0 pa-0">
            <v-row no-gutters>
              <v-col cols="12" lg="2" xl="2" class="pa-1">
                <v-select :value="getTransport()" :items="transport.items" @change="onTransportChange($event)" :label="transport.label" :type="transport.type" :rules="transport.rule" :hint="transport.hint" :disabled="disabled || readonly" item-text="value" item-value="key" no-data-text="Please configure transport in the UICC" outlined dense persistent-hint></v-select>
              </v-col>
            </v-row>

            <v-row no-gutters v-if="scp.transport != 'sms'">
              <v-col cols="12" class="pa-1">
                <flo-scp-push :value="getPushValue()" :uicc="uicc" :spi="spi" :kic_algo="kic_algo" :kid_algo="kid_algo" :push_spi="push_spi" :keysets80="getFilteredKeysets80()" :keysets81="getFilteredKeysets81()" :keyset80="keyset80" :keyset81="getSessionScp81keyset()" :transport="scp.transport" :bip_bindings="bip_bindings" :disabled="disabled" :campaign_lead_by="campaign_lead_by" :readonly="readonly" @change="onScpPushChange($event)" />
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12">
                <v-container fluid class="ma-0 pa-0">
                  <v-row no-gutters v-if="scp.transport == 'sms'">
                    <v-col cols="12" class="pa-1">
                      <flo-scp-ex-info :value="getExInfoValue()" :disabled="disabled" :readonly="readonly" :transport="scp.transport" @change="onExInfoChange($event)" />
                    </v-col>
                  </v-row>

                  <v-row no-gutters v-if="scp.transport != 'https'">
                    <v-col cols="12" class="pa-1">
                      <flo-scp-se :value="getSeValue()" :uicc="uicc" :spi="spi" :kic_algo="kic_algo" :kid_algo="kid_algo" :push_spi="push_spi" :keysets80="getFilteredKeysets80()" :keyset80="keyset80" :disabled="disabled" :readonly="readonly" :transport="scp.transport" @change="onSeChange($event)" />
                    </v-col>
                  </v-row>
                </v-container>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" class="pa-1">
                <flo-expand title="Operations" :open="oopen" @collapse="oopen = $event" @expand="oopen = $event" elevation="5">
                  <template v-slot:title="{ title }">
                    <span class="title font-weight-regular mx-2">{{ title }}</span>
                    <v-chip v-if="changes_amount > 0" class="ma-1" outlined :color="`${getChangedColor()}`">
                      <v-avatar left>
                        <v-icon>mdi-sim</v-icon>
                      </v-avatar>
                      {{ changes_amount == 1 ? `${changes_amount} change` : `${changes_amount} changes` }}
                    </v-chip>
                  </template>

                  <template v-slot:content="{}">
                    <v-tabs v-model="tab_msg" class="pa-1" @change="onScpTabChange($event)">
                      <v-tab :disabled="disabled" href="#tab-applet" v-if="is_multi_imsi">FloLive</v-tab>
                      <v-tab :disabled="disabled" href="#tab-rfm">RFM</v-tab>
                      <v-tab :disabled="disabled" href="#tab-ram">RAM</v-tab>
                      <!-- <v-tab href="#tab-decode-por">Decode POR Mode</v-tab> -->

                      <v-tab-item value="tab-applet" v-if="is_multi_imsi">
                        <flo-card-ota v-if="tab_msg == 'tab-applet'" :campaign_lead_by="campaign_lead_by" :iccid="iccid" :parameters="parameters" :disabled="disabled" :transport="scp.transport" :readonly="readonly" @change="onOtaChange($event)" @sync="onSyncChange($event)" :value="getOtaOperations()" />
                      </v-tab-item>

                      <v-tab-item value="tab-rfm">
                        <flo-rfm-tabs v-if="tab_msg == 'tab-rfm'" :campaign_lead_by="campaign_lead_by" :uicc="uicc" :iccid="iccid" :parameters="parameters" :disabled="disabled" :transport="scp.transport" :readonly="readonly" :value="getRfmOperations()" @script_change="onApduChange($event)" @vf_change="onVfChange($event)" @change="onDataChange($event)" />
                      </v-tab-item>

                      <v-tab-item value="tab-ram">
                        <flo-ram-tabs v-if="tab_msg == 'tab-ram'" :campaign_lead_by="campaign_lead_by" :key="redrawRam" :iccid="iccid" :parameters="parameters" :uicc="uicc" :transport="scp.transport" :disabled="disabled" :card_applets="card_applets" :readonly="readonly" :keyset80="getSessionScp80keyset()" :keyset81="getSessionScp81keyset()" :value="getRamOperations()" @change="onRamChange($event)" />
                      </v-tab-item>

                      <!-- <v-tab-item value="tab-decode-por">
                          <flo-por-mode v-if="tab_msg == 'tab-decode-por'" :value="getSeValue()" :uicc="uicc" />
                        </v-tab-item> -->
                    </v-tabs>
                  </template>
                </flo-expand>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import floScpPush from "~/components/se/floScpPush.vue";
import floCardOta from "~/components/widgets/floCardOta.vue";
import floRamTabs from "~/components/widgets/floRamTabs.vue";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
export default {
  name: "flo-card-scp",
  components: {
    floScpPush,
    floCardOta,
    floRamTabs,
  },
  data() {
    return {
      oopen: false,
      lopen: false,
      redrawRam: 1,
      tab_msg: "tab-applet",
      scp: {
        type: "",
        transport: "",
        cards: [{}],
      },
      scp_loading: true,
      uicc_loading: true,
      uicc_ec_loading: true,
      uicc_aids_loading: true,
      uicc: {
        ec: null,
        aids: null,
        sms: null,
        cat_tp: null,
        https: null,
        gprs: null,
        default_bearer: null,
        buffer_sizing: null,
      },
      transport: {
        label: "Transport Mode",
        hint: "Select Transport Mode",
        input: "text",
        type: "text",
        items: [],
        rule: [(v) => !!v || "Field is required."],
      },
    };
  },
  props: {
    campaign_lead_by: {
      type: String,
      default: "",
      required: false,
    },
    iccid: {
      type: String,
      default: "",
      required: false,
    },
    uicc_id: {
      type: Number,
      default: 0,
      required: false,
    },
    value: {
      type: [Object, Array],
      default: null,
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
    changes_amount: {
      type: Number,
      default: null,
    },
    bip_bindings: {
      type: Array,
      default: () => [],
    },
    card_applets: {
      type: [Number, String, Object, Array],
      default: null,
    },
    is_multi_imsi: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    parameters: {
      type: Array,
      required: false,
      default: () => [],
    },
    open: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  watch: {
    readonly: {
      handler(val) {
        if (false == val) {
          this.tab_msg = "tab-rfm";
          this.scp.type = "rfm";
        }
      },
      deep: true,
    },
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    syncParent() {
      console.log(`flo-card-scp - syncParent - enter`);
      this.$emit("change", this.scp);
    },
    l_hidden_filter() {
      let l_filter = [
        {
          k: "iccid",
          op: "equal",
          v: this.iccid,
        },
        {
          k: "mtype",
          op: "clike",
          v: "scp%",
        },
      ];

      return l_filter;
    },
    getSessionScp80keyset() {
      let keyset = this.keyset80;
      if (!this.scp.hasOwnProperty("transport")) {
        console.log(`flo-card-scp - getSessionScp80keyset - no transport`);
        return keyset;
      }

      if (!this.scp.hasOwnProperty("cards")) {
        console.log(`flo-card-scp - getSessionScp80keyset - no cards`);
        return keyset;
      }

      let l_card = this.scp.cards[0];
      let lse = null;

      if ("https" == this.scp.transport) {
        console.log(`flo-card-scp - getSessionScp80keyset - https`);
        if (!l_card.hasOwnProperty("push")) {
          console.log(`flo-card-scp - getSessionScp80keyset - push`);
          return keyset;
        }

        let lpush = l_card.push;

        if (!lpush.hasOwnProperty("cards")) {
          console.log(`flo-card-scp - getSessionScp80keyset - no push cards`);
          return keyset;
        }

        l_card = lpush.cards[0];
        console.log(`flo-card-scp - getSessionScp80keyset - push card:${JSON.stringify(l_card)}`);

        if (!l_card.hasOwnProperty("se")) {
          console.log(`flo-card-scp - getSessionScp80keyset - no se`);
          return keyset;
        }

        lse = l_card.se;
      } else {
        console.log(`flo-card-scp - getSessionScp80keyset - sms`);
        if (!l_card.hasOwnProperty("se")) {
          console.log(`flo-card-scp - getSessionScp80keyset - no se`);
          return keyset;
        }

        lse = l_card.se;
      }

      if (!lse) {
        console.log(`flo-card-scp - getSessionScp80keyset - final no se`);
        return keyset;
      }

      if (!lse.hasOwnProperty("keyset")) {
        console.log(`flo-card-scp - getSessionScp80keyset - no keyset`);
        return keyset;
      }

      return lse.keyset;
    },
    getSessionScp81keyset() {
      let keyset = this.keyset81;
      if (!this.scp.hasOwnProperty("transport")) {
        console.log(`flo-card-scp - getSessionScp81keyset - no transport`);
        return keyset;
      }

      if ("https" != this.scp.transport) {
        return keyset;
      }

      if (!this.scp.hasOwnProperty("cards")) {
        console.log(`flo-card-scp - getSessionScp81keyset - no cards`);
        return keyset;
      }

      let l_card = this.scp.cards[0];

      console.log(`flo-card-scp - getSessionScp81keyset - https`);
      if (!l_card.hasOwnProperty("push")) {
        console.log(`flo-card-scp - getSessionScp81keyset - push`);
        return keyset;
      }

      let lpush = l_card.push;
      if (!lpush.hasOwnProperty("operations")) {
        console.log(`flo-card-scp - getSessionScp81keyset - push - no op`);
        return keyset;
      }

      let lop = lpush.operations[0];

      if (!lop) {
        console.log(`flo-card-scp - getSessionScp81keyset - final no op`);
        return keyset;
      }

      if (!lop.hasOwnProperty("push")) {
        console.log(`flo-card-scp - getSessionScp81keyset - op has no push`);
        return keyset;
      }

      if (!lop.push.hasOwnProperty("keyset")) {
        console.log(`flo-card-scp - getSessionScp81keyset - push no keyset`);
        return keyset;
      }

      return lop.push.keyset;
    },
    async initialize() {
      console.log(`flo-card-scp - initialize - enter`);
      this.scp_loading = true;

      if (this.campaign_lead_by == "gsma") {
        this.scp.transport = "https";
        this.transport.items = [
          { key: "sms", value: "SMS" },
          { key: "cat_tp", value: "CAT-TP" },
          { key: "https", value: "HTTPS" },
        ];
      } else {
        await this.reload_electrical_profile();
        await this.loadUicc();
        await this.loadUiccAids();
        this.setTransportModes();
      }

      if (null == this.value) {
        if (this.scp.transport == "https") {
          this.tab_msg = "tab-rfm";
          this.scp.type = "rfm";
        } else if (this.scp.transport == "sms") {
          this.tab_msg = "tab-applet";
          this.scp.type = "flolive";
        }
        this.syncParent();
      } else {
        if (this.value.hasOwnProperty("type")) {
          switch (this.value.type) {
            case "rfm":
              {
                this.tab_msg = "tab-rfm";
                this.scp.type = "rfm";
              }
              break;
            case "ram":
              {
                this.tab_msg = "tab-ram";
                this.scp.type = "ram";
              }
              break;
            case "applet":
              {
                this.tab_msg = "tab-applet";
                this.scp.type = "flolive";
              }
              break;
          }
        }

        this.scp = this.value;
      }
      this.oopen = this.open;
      this.scp_loading = false;
      this.$emit("scp_loading", this.scp_loading);
    },
    onScpTabChange(event) {
      switch (event) {
        case "tab-applet":
          {
            this.scp.type = "flolive";
            if (this.scp.hasOwnProperty("script_format")) {
              delete this.scp.script_format;
            }
          }
          break;
        case "tab-rfm":
          {
            this.scp.type = "rfm";
            if (this.scp.hasOwnProperty("script_format")) {
              delete this.scp.script_format;
            }
          }
          break;
        case "tab-ram":
          {
            this.scp.type = "ram";
            this.scp.script_format = "extended-indefinite";
          }
          break;
      }
      console.log(`flo-card-scp - onScpTabChange - reset operations`);
      this.scp["operations"] = [];
      this.syncParent();
    },
    onDataChange(event) {
      console.log(`flo-card-scp - onDataChange - enter`);
      this.scp["operations"] = event;
      this.syncParent();
    },
    onSyncChange() {
      this.$emit("sync");
    },
    onOtaChange(event) {
      console.log(`flo-card-scp - onOtaChange - enter - ${JSON.stringify(event)}`);
      this.scp["operations"] = event;
      this.syncParent();
    },
    onApduChange(event) {
      console.log(`flo-card-scp - onApduChange - enter`);
      this.scp["operations"] = [];
      event.forEach((e) => {
        this.scp["operations"].push(e);
      });
      this.syncParent();
    },
    onVfChange(event) {
      console.log(`flo-card-scp - onVfChange - enter - ${JSON.stringify(event)}`);
      this.scp["operations"] = event;
      this.syncParent();
    },
    onRamChange(event) {
      this.scp["operations"] = [];
      event.forEach((e) => {
        this.scp["operations"].push(e);
      });
      this.syncParent();
    },
    onScpPushChange(event) {
      console.log(`flo-card-scp - onScpPushChange - enter - ${JSON.stringify(event)}`);
      let lscp = this.scp;
      let lcard = lscp.cards[0];
      lcard["push"] = event;
      this.syncParent();
    },
    onTransportChange(event) {
      if (event == "sms") {
        let lscp = this.scp;
        let lcard = lscp.cards[0];
        if (lcard.hasOwnProperty("push")) {
          delete lcard.push;
        }
      } else {
        let lscp = this.scp;
        let lcard = lscp.cards[0];
        if (lcard.hasOwnProperty("se")) {
          delete lcard.se;
        }
        if (lcard.hasOwnProperty("execute_info")) {
          delete lcard.execute_info;
        }
      }
      this.scp.transport = event;
      this.syncParent();
    },
    getFilteredKeysets80() {
      let filtered = [];
      if (this.keysets80.length > 0) {
        filtered = this.keysets80.filter((k) => k.name != "unknown");
      }
      console.log(`flo-card-scp - getFilteredKeysets80 - filtered: ${JSON.stringify(filtered)}`);
      return filtered;
    },
    getFilteredKeysets81() {
      let filtered = [];
      if (this.keysets81.length > 0) {
        filtered = this.keysets81.filter((k) => k.name != "unknown");
      }
      console.log(`flo-scp-push - getFilteredKeysets81 - filtered: ${JSON.stringify(filtered)}`);
      return filtered;
    },
    getSeValue() {
      let lcard = this.scp.cards[0];
      if (!lcard.hasOwnProperty("se")) {
        return null;
      }

      return lcard.se;
    },
    getExInfoValue() {
      let lcard = this.scp.cards[0];
      if (!lcard.hasOwnProperty("execute_info")) {
        return null;
      }
      return lcard.execute_info;
    },
    setExInfoValue(execute_info) {
      let lcard = this.scp.cards[0];
      lcard["execute_info"] = execute_info;
    },
    setSeValue(se) {
      let lcard = this.scp.cards[0];
      lcard["se"] = se;
    },
    onSeChange(event) {
      console.log(`flo-scp-push - onSeChange - ${JSON.stringify(event)}`);
      this.setSeValue(event);
      this.redrawRam++;
      this.syncParent();
    },
    onExInfoChange(event) {
      console.log(`flo-scp-push - onExInfoChange - ${JSON.stringify(event)}`);
      this.setExInfoValue(event);
      this.syncParent();
    },
    getTransport() {
      if (this.scp.hasOwnProperty("transport")) {
        return this.scp.transport;
      }
      return "https";
    },
    getPushValue() {
      console.log(`flo-card-scp - getPushValue - enter`);
      let lscp = this.scp;
      let lcard = lscp.cards[0];

      if (!lcard.hasOwnProperty("push")) {
        return null;
      }

      return lcard.push;
    },
    getOtaOperations() {
      console.log(`flo-card-scp - getOtaOperations - enter`);
      let lscp = this.scp;

      if (!lscp.hasOwnProperty("type")) {
        console.log(`flo-card-scp - getOtaOperations - has no type`);
        return null;
      }
      if ("flolive" != lscp.type) {
        console.log(`flo-card-scp - getOtaOperations - type is not flolive`);
        return null;
      }

      if (!lscp.hasOwnProperty("operations")) {
        console.log(`flo-card-scp - getOtaOperations - has no operations tag`);
        return null;
      }
      if (null == lscp.operations) {
        console.log(`flo-card-scp - getOtaOperations - operations are null`);
        return null;
      }

      if (lscp.operations.length == 0) {
        console.log(`flo-card-scp - getOtaOperations - operations empty`);
        return null;
      }

      console.log(`flo-card-scp - getOtaOperations - lscp: ${JSON.stringify(lscp)}`);

      return lscp.operations;
    },
    getRfmOperations() {
      console.log(`flo-card-scp - getRfmOperations - enter`);
      let lscp = this.scp;

      if (!lscp.hasOwnProperty("type")) {
        console.log(`flo-card-scp - getRfmOperations - has no type`);
        return null;
      }
      if ("rfm" != lscp.type) {
        console.log(`flo-card-scp - getRfmOperations - type is not rfm`);
        return null;
      }

      if (!lscp.hasOwnProperty("operations")) {
        console.log(`flo-card-scp - getRfmOperations - has no operations tag`);
        return null;
      }
      if (null == lscp.operations) {
        console.log(`flo-card-scp - getRfmOperations - operations are null`);
        return null;
      }

      if (lscp.operations.length == 0) {
        console.log(`flo-card-scp - getRfmOperations - operations empty`);
        return null;
      }

      if (lscp.operations.length > 1) {
        if ("script" == lscp.operations[0].type) {
          console.log(`flo-card-scp - getRfmOperations - operation is: SCRIPT`);
        }
        if ("fields" == lscp.operations[0].type) {
          console.log(`flo-card-scp - getRfmOperations - operation is: FIELDS`);
        }
      }

      console.log(`flo-card-scp - getRfmOperations - lscp: ${JSON.stringify(lscp)}`);

      return lscp.operations;
    },
    getRamOperations() {
      console.log(`flo-card-scp - getRamOperations - enter`);
      let lscp = this.scp;

      if (!lscp.hasOwnProperty("type")) {
        console.log(`flo-card-scp - getRamOperations - has no type`);
        return null;
      }
      if ("ram" != lscp.type) {
        console.log(`flo-card-scp - getRamOperations - type is not rfm`);
        return null;
      }

      if (!lscp.hasOwnProperty("operations")) {
        console.log(`flo-card-scp - getRamOperations - has no operations tag`);
        return null;
      }
      if (null == lscp.operations) {
        console.log(`flo-card-scp - getRamOperations - operations are null`);
        return null;
      }

      if (lscp.operations.length == 0) {
        console.log(`flo-card-scp - getRamOperations - operations empty`);
        return null;
      }

      console.log(`flo-card-scp - getRamOperations - lscp: ${JSON.stringify(lscp)}`);

      return lscp.operations;
    },
    setTransportModes() {
      if (this.uicc.sms) {
        this.transport.items.push({ key: "sms", value: "SMS" });
      }
      if (this.uicc.cat_tp) {
        this.transport.items.push({ key: "cat_tp", value: "CAT-TP" });
      }
      if (this.uicc.https && this.keysets81.length > 0) {
        this.transport.items.push({ key: "https", value: "HTTPS" });
      }

      // if (this.uicc.https && this.keysets81.length > 0) {
      //   this.scp.transport = "https";
      // }

      if (this.uicc.sms) {
        this.scp.transport = "sms";
      }
    },
    async loadUicc() {
      console.log(`flo-card-scp - loadUicc - enter`);
      this.uicc_loading = true;
      try {
        let query = {
          select: {
            id: {},
            sms: {},
            cat_tp: {},
            https: {},
            gprs: {},
            default_bearer: {},
            buffer_sizing: {},
          },
          where: [
            {
              k: "id",
              op: "equal",
              v: this.uicc_id,
            },
          ],
        };

        let uicc = await this.$axios.$post("api/v1/uiccs/list", query);
        if (uicc.length > 0) {
          let luicc = uicc[0];
          this.uicc["id"] = luicc.id;
          this.uicc.sms = luicc.sms;
          this.uicc.cat_tp = luicc.cat_tp;
          this.uicc.https = luicc.https;
          this.uicc.gprs = luicc.gprs;
          this.uicc.default_bearer = luicc.default_bearer;
          this.uicc.buffer_sizing = luicc.buffer_sizing;
        }
        this.uicc_loading = false;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      this.uicc_loading = false;
    },
    async loadUiccAids() {
      console.log(`flo-card-scp - loadUiccAids - enter`);
      this.uicc_aids_loading = true;
      try {
        let query = {
          select: {},
          where: [
            {
              k: "uicc_id",
              op: "equal",
              v: this.uicc_id,
            },
          ],
        };

        let uicc_aids = await this.$axios.$post("api/v1/uicc_aids/list", query);
        this.uicc.aids = uicc_aids;
        this.uicc_aids_loading = false;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      this.uicc_aids_loading = false;
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
    async loadEc() {
      let request = {
        field: "ec",
        id: this.uicc_id,
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
    async reload_electrical_profile() {
      this.uicc_ec_loading = true;

      let ec_rfs = null;
      let jec = null;
      this.uicc.ec = null;
      try {
        let lec = await this.loadEc();
        if (lec) {
          ec_rfs = await this.cat(lec.id);
          let bas64_pos = ec_rfs.content.data_url.indexOf(",") + 1;
          jec = JSON.parse(atob(ec_rfs.content.data_url.substring(bas64_pos)));
          // Filter EC data
          this.uicc.ec = jec.data.reduce((acc, ecData) => {
            let access = ["yes", "pin1", "pin2", "adm", "adm1", "alw"];
            if (ecData.type == "TR" && access.includes(ecData.access.read.toLowerCase())) {
              acc.push({ url: ecData.url, name: ecData.name, type: ecData.type, recno: ecData.recno, recsize: ecData.recsize, update: ecData.access.update });
            } else if (ecData.type == "LF" && access.includes(ecData.access.update.toLowerCase())) {
              acc.push({ url: ecData.url, name: ecData.name, type: ecData.type, recno: ecData.recno, recsize: ecData.recsize, update: ecData.access.update });
            } else if (ecData.type == "CYC" && access.includes(ecData.access.update.toLowerCase())) {
              acc.push({ url: ecData.url, name: ecData.name, type: ecData.type, recno: ecData.recno, recsize: ecData.recsize, update: ecData.access.update });
            } else if (ecData.type == "LNK") {
              if (ecData.hasOwnProperty("content")) {
                let l_content = ecData.content;
                if (l_content.length > 0) {
                  if (l_content[0].hasOwnProperty("data")) {
                    let l_data = l_content[0].data.toLowerCase();
                    if (l_data.includes("linked to:")) {
                      let l_link_to = l_data.replace("linked to:", "").trim();
                      let found = jec.data.find((ef) => ef.url.toLowerCase().trim() == l_link_to);
                      if (found) {
                        acc.push({ url: ecData.url, name: found.name, type: found.type, recno: found.recno, recsize: found.recsize, update: found.access.update });
                      }
                    }
                  }
                }
              }
            }
            return acc;
          }, []);
        }
        this.uicc_ec_loading = false;
      } catch (err) {
        console.log(`flo-card-scp - reload_electrical_profile -failed - ${err}`);
      }

      this.uicc_ec_loading = false;
    },
    getChangedColorWithAlpha() {
      return `${this.$vuetify.theme.currentTheme[this.getChangedColor()]}19`;
    },
    getChangedColor() {
      return "warning";
    },
  },
};
</script>
