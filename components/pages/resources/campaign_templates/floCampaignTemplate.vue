<template>
  <div class="flo-campaign-template">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col cols="12">
          <v-card flat outlined>
            <v-card-text class="ma-0 pa-0">
              <v-container fluid class="pa-1">
                <v-row no-gutters>
                  <v-col cols="12" class="pa-1">
                    <div class="headline">
                      Campaign Template: {{ campaign_template.name }} <v-chip v-if="campaign_template.hasOwnProperty('state')" label class="text-capitalize" :color="getStateColor(campaign_template.state)">{{ campaign_template.state }}</v-chip>
                    </div>
                    <v-row no-gutters>
                      <v-col cols="10">
                        <blockquote class="blockquote font-weight-light">
                          Id: <code>{{ campaign_template.id }}</code>
                          <span v-if="campaign_template.description != ''">
                            , Description: <code>{{ campaign_template.description }}</code></span
                          >
                          <span v-if="campaign_template.lead_by != ''">
                            , Lead By: <code>{{ campaign_template.lead_by }}</code></span
                          >
                          <span v-if="campaign_template.lead_iccid != ''">
                            , Leading ICCID:
                            <router-link
                              :to="{
                                path: '/resources/card/',
                                query: { iccid: campaign_template.lead_iccid },
                              }"
                              ><code>{{ campaign_template.lead_iccid }}</code></router-link
                            >
                          </span>
                        </blockquote>
                      </v-col>
                      <div class="flex-grow-1"></div>
                      <v-btn class="mt-5" v-if="campaign_template.state == 'active'" color="primary" @click="changeState('deprecate')" :disabled="!hasPermissionToExecute()">
                        <v-icon left>mdi-progress-alert</v-icon>
                        Deprecate</v-btn
                      >
                      <v-btn class="mt-5" v-if="campaign_template.state == 'deprecated'" color="primary" @click="changeState('activate')" :disabled="!hasPermissionToExecute()">
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
                        <flo-meta-resource-view :value="campaign_template" :resources="resources" :ignore="['action', 'ota_stack', 'param_def', 'path', 'aid']">
                          <template v-slot:view_lead_iccid="{ fmtheader }">
                            <v-col cols="12" lg="3" xl="3" class="pa-1">
                              <flo-meta-field-view :translator="translator" :header="formatHeader(fmtheader)" :value="formatHeader(fmtheader).data" />
                            </v-col>
                          </template>
                        </flo-meta-resource-view>
                      </template>
                    </flo-expand>
                  </v-col>
                </v-row>

                <v-row no-gutters>
                  <v-col cols="12" class="pa-1">
                    <flo-expand title="Parameter Definitions" elevation="5">
                      <template v-slot:content="{}">
                        <v-container fluid class="ma-0 pa-0">
                          <v-row no-gutters>
                            <v-col cols="12" class="pa-1">
                              <flo-meta-field-definition @unsaved-action="onUnsavedAction($event)" @save-local-changes="saveChanges($event)" module="campaign_templates" resources="parameter_definitions" :value="campaign_template" :readonly="!hasPermissionToEdit()" :local_permissions="getLocalPermissions()" />
                            </v-col>
                          </v-row>
                        </v-container>
                      </template>
                    </flo-expand>
                  </v-col>
                </v-row>

                <v-row no-gutters>
                  <v-col cols="12" class="pa-1">
                    <flo-expand :open="ota_edit" :key="ota_edit_key" title="OTA Edit" elevation="5">
                      <template v-slot:title="{ title }">
                        <span class="title font-weight-regular mx-2">{{ title }}</span>
                      </template>
                      <template v-slot:content="{}">
                        <template v-if="!getCardIccid()">
                          <v-row no-gutters>
                            <v-col cols="12" align="center">
                              <v-icon color="warning" large>mdi-alert</v-icon>
                            </v-col>
                          </v-row>
                          <v-row no-gutters>
                            <v-col class="pa-1" cols="12" align="center">
                              <span class="text-subtitle-1 font-weight-light primary--text">Leading ICCID {{ campaign_template.lead_iccid }} doesn't exist.</span>
                            </v-col>
                          </v-row>
                        </template>
                        <template v-else>
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

                          <v-row no-gutters v-if="inspect">
                            <v-col cols="12" lg="12" class="pa-1">
                              <flo-json-editor name="stack" mode="code" :modes="['view', 'code', 'text']" :key="`js-s-${totalVersion}`" height="300px" :value="record.ota_stack ? record.ota_stack : {}" @model-update="onJsonStackUpdate($event)"></flo-json-editor>
                            </v-col>
                          </v-row>

                          <v-row no-gutters :key="ota_stack_version">
                            <v-col cols="12" class="pa-1">
                              <flo-card-scp :disabled="!hasPermissionToEdit()" :open="ota_edit" :campaign_lead_by="campaign_template.lead_by" @change="onScpChange($event)" @send_ram="onSendRam($event)" :value="getScpStackChange()" :spi="getCardSpi()" :kic_algo="getCardKicAlgo()" :kid_algo="getCardKidAlgo()" :push_spi="getCardPushSpi()" :keysets80="getScpActiveKeysets('80')" :keysets81="getScpActiveKeysets('81')" :keyset80="getCardKeysetScp80()" :keyset81="getCardKeysetScp81()" :is_multi_imsi="isMultiImsi()" :uicc_id="getCardUiccId()" :iccid="getCardIccid()" :card_applets="getApplets()" :parameters="getParameters()" :changes_amount="getChangeCount()" />
                            </v-col>
                          </v-row>
                          <v-row :key="`stact-${totalVersion}`" no-gutters v-if="campaign_template.state == 'active'">
                            <v-col cols="12" class="pa-1">
                              <v-btn @click="saveOtaStack()" :loading="loader" :disabled="loader || disableSave()" color="primary">
                                <v-icon left>mdi-content-save</v-icon>
                                Save
                              </v-btn>
                              <v-btn @click="clearOtaStack()" :disabled="disableClear()" color="primary" text> Clear </v-btn>
                            </v-col>
                          </v-row>
                        </template>
                      </template>
                    </flo-expand>
                  </v-col>
                </v-row>
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
import floMetaFieldDefinition from "~/components/crud/floMetaFieldDefinition.vue";
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import { mapGetters, mapActions } from "vuex";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
import enums from "~/src/enums.js";
export default {
  name: "flo-campaign-template",
  components: {
    floCardScp,
    floMetaFieldDefinition,
  },
  data: () => ({
    helpers,
    enums,
    resources: "campaign_templates",
    translator: null,
    transport: "",
    hidden_filter: [],
    campaign_template: {},
    ota_edit: false,
    ota_edit_key: 1,
    ota_stack_version: 1,
    totalVersion: 1,
    inspect: false,
    valid: false,
    loader: false,
    record: {
      param_def: {},
      ota_stack: {
        changes: [],
      },
    },
    lead_by: "",
    lead_iccid: "",
    card: null,
    card_key_store: [],
    card_applets: [],
    applets: [],
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
      getResourceKey: "session/getResourceKey",
      permissions: "session/permissions",
    }),
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    ...mapActions({
      addToResourceCache: "session/addToResourceCache",
    }),
    async initialize() {
      this.campaign_template = this.value;
      this.hidden_filter = [
        {
          k: "id",
          op: "equal",
          v: this.campaign_template.id,
        },
      ];
      if (this.getLeadBy() == "card") {
        await this.loadCard();
        if (this.card) {
          await this.loadUicc();
          await this.loadCardApplets();
          await this.loadApplets();
          await this.loadCardKeyStore();
        }
      }
      if (this.campaign_template.hasOwnProperty("ota_stack")) {
        if (Object.keys(this.campaign_template.ota_stack).length > 0) {
          console.log(`flo-campaign-template - initialize - campaign template ota stack: ${JSON.stringify(this.campaign_template.ota_stack)}`);
          this.record.ota_stack = this.campaign_template.ota_stack;
          this.ota_edit = true;
          this.ota_edit_key++;
        }
      }

      if (this.campaign_template.hasOwnProperty("param_def")) {
        if (Object.keys(this.campaign_template.param_def).length > 0) {
          this.record.param_def = this.campaign_template.param_def;
        }
      }
      console.log(`flo-campaign-template - initialize - record ota stack: ${JSON.stringify(this.record.ota_stack)}`);
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      this.translator = translator;
    },
    hasPermissionToEdit() {
      let l_permissions = this.permissions.find((p) => p.res == "campaign_templates");
      if (this.campaign_template.state == "active") {
        if (l_permissions.u == true) {
          return true;
        }
      }

      return false;
    },
    hasPermissionToExecute() {
      let l_permissions = this.permissions.find((p) => p.res == "campaign_templates");
      if (l_permissions.u == true && l_permissions.e == true) {
        return true;
      }

      return false;
    },
    getLocalPermissions() {
      let l_permissions = {
        c: true,
        r: true,
        u: true,
        d: true,
        e: true,
        res: "campaign_templates",
      };

      return l_permissions;
    },
    getCardSpi() {
      if (this.getLeadBy() == "gsma") {
        return "1602";
      } else {
        return this.card.spi;
      }
    },
    getCardKicAlgo() {
      if (this.getLeadBy() == "gsma") {
        return "12";
      } else {
        return this.card.kic_algo;
      }
    },
    getCardKidAlgo() {
      if (this.getLeadBy() == "gsma") {
        return "12";
      } else {
        return this.card.kid_algo;
      }
    },
    getCardPushSpi() {
      if (this.getLeadBy() == "gsma") {
        return "0601";
      } else {
        return this.card.push_spi;
      }
    },
    getCardKeysetScp80() {
      if (this.getLeadBy() == "gsma") {
        return 1;
      } else {
        return this.card.keyset_scp80;
      }
    },
    getCardKeysetScp81() {
      if (this.getLeadBy() == "gsma") {
        return 64;
      } else {
        return this.card.keyset_scp81;
      }
    },
    getParameters() {
      let l_params = [];
      if (this.record.param_def.hasOwnProperty("data")) {
        l_params = this.record.param_def.data;
      }

      return l_params;
    },
    isMultiImsi() {
      if (this.getLeadBy() == "gsma") {
        return false;
      }

      let multi_imsi = false;
      if (null != this.applets) {
        let lapplet = this.applets;
        if (lapplet.is_multi_imsi == 1) {
          multi_imsi = true;
        }
      }

      return multi_imsi;
    },
    getScpActiveKeys(p_scp) {
      let all_keysets = [];
      let l_card_key_store = this.card_key_store;
      let l_filter = l_card_key_store.filter((f) => f.scp == p_scp && f.state == "active");
      all_keysets = l_filter;

      return all_keysets;
    },
    getScpActiveKeysets(p_scp) {
      console.log(`flo-campaign-template - getScpActiveKeysets - enter - ${p_scp}`);

      if (this.getLeadBy() == "gsma") {
        console.log(`flo-campaign-template - getScpActiveKeysets - getLeadBy - ${this.getLeadBy()}`);
        if (p_scp == "80") {
          return enums()["keyset_scp80"];
        } else {
          return enums()["keyset_scp81"];
        }
      }

      let l_filter = this.getScpActiveKeys(p_scp);
      let l_reduce = l_filter.reduce((pv, cv, ci, array) => {
        let l_pv = [];
        if (pv) {
          l_pv = pv;
        }
        let found = l_pv.find((f) => {
          return f.keyset == cv.keyset;
        });
        if (!found) {
          l_pv.push({ keyset: cv.keyset, name: cv.name });
        }
        return l_pv;
      }, []);
      let l_map = l_reduce.map((m) => {
        return {
          key: m.keyset,
          name: m.name,
          value: `Keyset ${m.keyset}`,
        };
      });

      let lsort = l_map.sort((a, b) => a.keyset - b.keyset);
      return lsort;
    },
    getLeadBy() {
      return this.campaign_template ? this.campaign_template.lead_by : "";
    },
    getCardUiccId() {
      if (this.getLeadBy() == "gsma") {
        return 0;
      } else {
        return this.card ? this.card.uicc_id : "";
      }
    },
    getCardIccid() {
      if (this.getLeadBy() == "gsma") {
        return "";
      } else {
        return this.card ? this.card.iccid : "";
      }
    },
    getApplets() {
      if (this.getLeadBy() == "gsma") {
        return "";
      } else {
        return this.applets ? this.applets.id : "";
      }
    },
    getLeadIccid() {
      return this.campaign_template ? this.campaign_template.lead_iccid : "";
    },
    getScpStackChange() {
      if (!this.record.ota_stack) {
        console.log(`flo-campaign-template - getScpStackChange - No OTA Stack`);
        return null;
      }

      let lota_stack = this.record.ota_stack;

      if (!lota_stack.hasOwnProperty("type")) {
        console.log(`flo-campaign-template - getScpStackChange - No Type Tag`);
        return null;
      }

      if (!lota_stack.hasOwnProperty("changes")) {
        console.log(`flo-campaign-template - getScpStackChange - No Changes`);
        return null;
      }

      let lchanges = lota_stack.changes;
      if (lchanges.length <= 0) {
        console.log(`flo-campaign-template - getScpStackChange - No Changes Length`);
        return null;
      }

      return lchanges[0];
    },
    getChangeCount() {
      let changes = this.getScpStackChange();
      if (!changes) return 0;

      let total = 0;
      let type = changes.type ? changes.type.toUpperCase() : "";

      if (changes.operations && changes.operations.length > 0) {
        let operation = changes.operations[0];

        if (type === "RFM") {
          if (operation.writes) {
            total = operation.writes.length;
          } else if (operation.reads) {
            total = operation.reads.length;
          } else {
            total = changes.operations.length;
          }
        } else if (type === "FLOLIVE" || type === "RAM") {
          total = changes.operations.length;
        }
      }

      return total;
    },
    getStateColor(state) {
      let colorMap = {
        deprecated: "error",
        active: "success",
      };

      return colorMap[state] || "warning";
    },
    onScpChange(event) {
      console.log(`flo-campaign-template - onScpChange - enter`);
      let lota_stack = this.record.ota_stack;

      if (event.hasOwnProperty("transport")) {
        if (event.transport != "") {
          let ltransport = event.transport;
          this.transport = ltransport;
        }
      }

      if (event.hasOwnProperty("type")) {
        let ltype = event.type;
        if (ltype == "rfm" || ltype == "ram") {
          lota_stack["type"] = "scp";
        } else if (ltype == "flolive") {
          lota_stack["type"] = "applet";
        }
      }

      if (lota_stack.hasOwnProperty("changes")) {
        lota_stack.changes[0] = event;
      }

      this.totalVersion++;
    },
    onSendRam(event) {
      console.log(`flo-campaign-template - onSendRam - enter`);
      let lota_stack = this.record.ota_stack;

      if (lota_stack.changes.length > 0) {
        lota_stack.changes[0].operations = event;
      }
    },
    onJsonStackUpdate(event) {
      this.record.ota_stack = event;
      this.ota_stack_version++;
    },
    disableSave() {
      let ldisable = true;
      if (this.hasPermissionToEdit()) {
        if (this.record.ota_stack.hasOwnProperty("changes")) {
          let lchanges = this.record.ota_stack.changes;
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
                        } else if (op[op.type].hasOwnProperty("param")) {
                          let l_param = op[op.type].param;
                          if (l_param != "" && op.address != "") {
                            ldisable = false;
                          } else {
                            ldisable = true;
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
      }

      return ldisable;
    },
    disableClear() {
      let ldisable = true;
      if (this.hasPermissionToEdit()) {
        ldisable = false;
      }

      return ldisable;
    },
    async loadCard() {
      try {
        let query = {
          select: {},
          where: [
            {
              k: "iccid",
              op: "equal",
              v: this.getLeadIccid(),
            },
          ],
        };
        let cards = await this.$axios.$post("api/v1/cards/list", query);

        if (cards.length > 0) {
          this.card = cards[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadUicc() {
      try {
        let query = {
          select: {},
          where: [
            {
              k: "id",
              op: "equal",
              v: this.card.uicc_id,
            },
          ],
        };
        let uicc = await this.$axios.$post("api/v1/uiccs/list", query);
        if (uicc.length > 0) {
          this.uicc = uicc[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadCardKeyStore() {
      try {
        let query = {
          where: [
            {
              k: "iccid",
              op: "equal",
              v: this.card.iccid,
            },
          ],
        };

        let card_key_store = await this.$axios.$post(`/api/v1/card_key_store/list`, query);
        this.card_key_store = card_key_store;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadCardApplets() {
      try {
        let query = {
          select: {},
          where: [
            {
              k: "iccid",
              op: "equal",
              v: this.card.iccid,
            },
          ],
        };
        let card_applets = await this.$axios.$post("api/v1/card_applets/list", query);
        this.card_applets = card_applets;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadApplets() {
      try {
        let l_val = 0;
        let l_card_applet = this.card_applets;
        if (l_card_applet.length > 0) {
          l_val = l_card_applet[0].applet_id;
        }
        let query = {
          select: { id: { k: "id" }, name: { k: "name" }, applet_type: { k: "applet_type" }, description: { k: "description" }, is_multi_imsi: { k: "is_multi_imsi" }, multi_imsi_type: { k: "multi_imsi_type" }, ts: { k: "ts" } },
          where: [
            {
              k: "id",
              op: "equal",
              v: l_val,
            },
          ],
        };
        let applets = await this.$axios.$post("api/v1/applets/list", query);
        if (applets.length > 0) {
          this.applets = applets[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async saveOtaStack() {
      let body = {
        id: this.campaign_template.id,
        ota_stack: JSON.parse(JSON.stringify(this.record.ota_stack)),
      };

      this.loader = true;
      await this.updateCampaign(body);
      this.loader = false;
    },
    async clearOtaStack() {
      let body = {
        id: this.campaign_template.id,
        ota_stack: {},
      };

      await this.updateCampaign(body);
    },
    async saveChanges(event) {
      console.log(`flo-campaign-template - saveChanges - event - ${JSON.stringify(event)}`);
      let body = {
        id: this.campaign_template.id,
        param_def: event,
      };

      try {
        let answer = await this.$axios.$put(`/api/v1/campaign_templates/${body.id}`, body);

        if (answer) {
          console.log(`flo-campaign-template - saveChanges - answer - ${JSON.stringify(answer)}`);
          this.record.param_def = answer.param_def;
        }
        this.onUnsavedAction(false);
        this.tellUser("success", `Template with Id: ${answer.id} - Name: ${answer.name} updated successfully.`);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async updateCampaign(body) {
      try {
        let answer = await this.$axios.$put(`/api/v1/campaign_templates/${this.campaign_template.id}`, body);
        if (answer != null) {
          if (Object.keys(answer.param_def).length == 0) {
            this.record.param_def = {};
          } else {
            this.record.param_def = answer.param_def;
          }

          if (Object.keys(answer.ota_stack).length == 0) {
            if (!helpers.isEqual(this.record.ota_stack, answer.ota_stack)) {
              this.record.ota_stack = {
                changes: [],
              };
              this.ota_stack_version++;
            }
          } else {
            this.record.ota_stack = answer.ota_stack;
          }
          this.tellUser("success", `Id: ${answer.id} - ${answer.name} updated successfully.`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async changeState(action) {
      try {
        let request = { id: this.campaign_template.id, action };
        let answer = await this.$axios.$post("/api/v1/campaign_templates/action", request);
        if (answer != null) {
          this.campaign_template = answer;
          this.tellUser("success", `ID: ${this.campaign_template.id} state successfully changed to ${this.campaign_template.state}.`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    onUnsavedAction(action) {
      this.$emit("unsaved-action", action);
    },
    formatHeader(header) {
      let l_header = header;

      l_header.type = "link";
      l_header["path"] = "/resources/card/";
      l_header["query"] = { iccid: this.campaign_template.lead_iccid };
      l_header.data = this.campaign_template ? this.campaign_template.lead_iccid : "";

      return l_header;
    },
  },
};
</script>
