<template>
  <div class="flo-scp-push">
    <flo-expand title="Push Details" elevation="5" :key="popen_key" :open="popen" @collapse="popen = $event" @expand="popen = $event" :class="transport == 'cat_tp' ? 'mb-1' : ''">
      <template v-slot:content="{}">
        <v-container fluid class="ma-0 pa-0">
          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-scp-ex-info :value="getExInfoValue()" :disabled="disabled" :readonly="readonly" :transport="transport" @change="onExInfoChange($event)" />
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-scp-se :value="getSeValue()" @change="onSeChange($event)" :spi="spi" :kic_algo="kic_algo" :kid_algo="kid_algo" :push_spi="push_spi" :keysets80="keysets80" :keyset80="dkeyset80" :disabled="disabled" :readonly="readonly" :transport="transport" />
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Parameters" :open="lopen" @collapse="lopen = $event" @expand="onParamsExpand($event)" elevation="5">
                <template v-slot:append="{}" v-if="!lopen">
                  <v-spacer v-for="n in 30" :key="n"></v-spacer>
                  <v-chip class="mr-1" label>SCP81: {{ `Keyset ${getKSet()}` }}</v-chip>
                  <v-chip v-if="hasPushApp()" class="mr-1" label>APP: {{ getPushApp() }}</v-chip>
                  <v-chip v-if="hasPushIp()" class="mr-1" label>IP: {{ getPushIp() }}</v-chip>
                  <v-chip v-if="hasPushPort()" class="mr-1" label>Port: {{ getPushPort() }}</v-chip>
                  <v-chip v-if="hasPushBuffer()" class="mr-1" label>Buffer: {{ getPushBuffer() }}</v-chip>
                  <v-chip v-if="meta.bearer.items.length > 0" label class="mr-1">Bearer: {{ getBearer(getPushBearer()) }}</v-chip>
                  <v-chip v-if="filterApn != null" label>APN: {{ filterApn }}</v-chip>
                </template>

                <template v-slot:content="{}">
                  <v-container fluid>
                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-card flat class="ma-0 pa-0" :disabled="disabled">
                          <v-row no-gutters>
                            <v-col cols="12" lg="2" xl="2" class="pa-1">
                              <flo-kset :value="getKSet()" @change="onKSetChanged($event)" :keysets="getKsets()" :disabled="readonly" prefix="SCP81" />
                            </v-col>
                            <v-col cols="12" lg="3" xl="3" class="pa-1">
                              <v-select :value="getBinding()" @change="onBindingChange($event)" :items="getBipBindings()" :label="meta.bip_binding.label" :type="meta.bip_binding.type" :hint="meta.bip_binding.hint" :disabled="readonly" item-text="value" item-value="key" no-data-text="Please specify valid BIP Binding" outlined dense persistent-hint></v-select>
                            </v-col>
                            <v-col cols="12" lg="2" xl="2" class="pa-1">
                              <v-select :value="getSelectedAidName()" @change="onAppChange($event)" :label="meta.app.label" :type="meta.app.type" :rules="meta.app.rule" :hint="meta.app.hint" :items="getAids()" :disabled="readonly" item-text="value" item-value="key" outlined dense persistent-hint></v-select>
                            </v-col>
                            <v-col cols="12" lg="2" xl="2" class="pa-1">
                              <v-select :value="getPushBearer()" :label="meta.bearer.label" :type="meta.bearer.type" :rules="meta.bearer.rule" :hint="meta.bearer.hint" :items="meta.bearer.items" @change="onBearerChange($event)" :disabled="readonly" item-text="value" item-value="key" no-data-text="Please configure bearer in the UICC" outlined dense persistent-hint></v-select>
                            </v-col>
                            <v-col v-if="getPushBearer() != 'default'" cols="12" lg="2" xl="2" class="pa-1">
                              <v-select :value="getPushApn()" :label="meta.apn.label" :type="meta.apn.type" :rules="meta.apn.rule" :hint="meta.apn.hint" :items="meta.apn.items" :disabled="readonly" @change="onApnChange($event)" item-text="value" item-value="key" no-data-text="Please create valid APN" outlined dense persistent-hint></v-select>
                            </v-col>
                            <v-col cols="12" lg="1" xl="1" class="pa-1">
                              <v-text-field :value="getPushBuffer()" :label="meta.buffer.label" :type="meta.buffer.type" :rules="getBufferRule(getPushBuffer())" :hint="meta.buffer.hint" :disabled="readonly" outlined dense persistent-hint @change="onBufferChange($event)"></v-text-field>
                            </v-col>
                          </v-row>
                        </v-card>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-card flat class="ma-0 pa-0" :disabled="disabled">
                          <v-row no-gutters>
                            <v-col cols="12" lg="2" xl="2" class="pa-1">
                              <v-text-field :value="getPushRetry()" :label="meta.retry.label" :type="meta.retry.type" :hint="meta.retry.hint" :rules="meta.retry.rule" :disabled="readonly" outlined dense persistent-hint @input="onRetryChange($event)"></v-text-field>
                            </v-col>
                            <v-col cols="12" lg="2" xl="2" class="pa-1">
                              <v-text-field :value="getPushDelay()" :label="meta.delay.label" :type="meta.delay.type" :hint="formatDelayHint()" :rules="meta.delay.rule" :disabled="readonly" outlined dense persistent-hint @input="onDelayChange($event)"></v-text-field>
                            </v-col>
                            <v-col cols="12" lg="2" xl="2" class="pa-1">
                              <v-text-field :value="getPushUri()" :label="meta.uri.label" :type="meta.uri.type" :hint="meta.uri.hint" :disabled="readonly" outlined dense persistent-hint @input="onUriChange($event)"></v-text-field>
                            </v-col>
                          </v-row>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-container>
                </template>
              </flo-expand>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </flo-expand>
  </div>
</template>

<script>
import floKset from "~/components/se/floKset.vue";
import floScpSe from "~/components/se/floScpSe.vue";
import floScpExInfo from "~/components/se/floScpExInfo.vue";
import parseNetError from "~/mixins/parseNetError.js";
import { mapGetters, mapActions } from "vuex";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  name: "flo-scp-push",
  components: {
    floKset,
    floScpSe,
    floScpExInfo,
  },
  data() {
    return {
      helpers,
      lopen: false,
      popen: false,
      popen_key: 1,
      dkeyset80: 0,
      dkeyset81: 0,
      app_ids: [],
      scp_push: {
        mode: "execute",
        transport: "sms",
        cards: [{}],
        operations: [
          {
            type: "push",
            app: "",
            push: {
              apn: "",
              buffer: 0,
              bearer: "default",
              transport: "https",
            },
          },
        ],
      },
      meta: {
        apn: {
          label: "APN",
          hint: "Access Point Name",
          items: [],
          input: "text",
          type: "text",
          rule: [(v) => !!v || "Field is required."],
        },
        app: {
          label: "Application",
          hint: "Select Application",
          input: "text",
          type: "text",
          items: [],
          rule: [(v) => !!v || "Field is required."],
        },
        bearer: {
          label: "Bearer",
          hint: "Select Bearer Type",
          input: "text",
          type: "text",
          items: [],
          rule: [(v) => !!v || "Field is required."],
        },
        bip_binding: {
          label: "BIP Binding",
          hint: "Select BIP Binding",
          input: "text",
          type: "text",
          rule: [(v) => !!v || "Field is required."],
        },
        buffer: {
          label: "Buffer",
          hint: "Buffer",
          input: "text",
          type: "text",
          total: 0,
        },
        retry: {
          label: "Retry",
          hint: "Number of Retries",
          input: "text",
          type: "text",
          rule: [(v) => (v >= 0 && v <= 10) || "Maximum Number of Retries is 10."],
        },
        delay: {
          label: "Delay",
          hint: "Delay Interval",
          input: "text",
          type: "text",
          value: 0,
          rule: [(v) => (v >= 0 && v <= 86400) || "Maximum Delay Interval is 1 day."],
        },
        uri: {
          label: "URI",
          hint: "Uniform Resource Identifier",
          input: "text",
          type: "text",
        },
      },
    };
  },
  props: {
    campaign_lead_by: {
      type: String,
      default: "",
      required: false,
    },
    value: {
      type: Object,
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
    uicc: {
      type: Object,
      required: true,
      default: () => {},
    },
    bip_bindings: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    transport: {
      type: String,
      required: true,
      default: "",
    },
  },
  computed: {
    ...mapGetters({
      getResourceKey: "session/getResourceKey",
    }),
    filterApn() {
      let filtered = this.meta.apn.items.filter((item) => item.key == this.scp_push.operations[0].push.apn);
      if (filtered.length > 0 && filtered[0].hasOwnProperty("value")) {
        return filtered[0].value;
      }
      return null;
    },
  },
  async created() {
    await this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    ...mapActions({
      addToResourceCache: "session/addToResourceCache",
    }),
    async initialize() {
      console.log(`flo-scp-push - initialize - value - ${JSON.stringify(this.value)}`);
      if (0 == this.keyset80) {
        if (this.keysets80.length) {
          this.dkeyset80 = this.keysets80[0].key;
        }
      } else {
        this.dkeyset80 = this.keyset80;
      }

      if (0 == this.keyset81) {
        if (this.keysets81.length) {
          this.dkeyset81 = this.keysets81[0].key;
        }
      } else {
        this.dkeyset81 = this.keyset81;
      }

      this.setBearer();
      this.setBufferSize();
      await this.loadApns();
      if (null == this.value) {
        this.popen = true;
        this.popen_key++;
        this.scp_push.operations[0].push.transport = this.transport;
        this.syncParent();
      }
      if (null != this.value && this.value.hasOwnProperty("operations")) {
        this.scp_push.operations[0] = this.value.operations[0];
        this.syncParent();
      }
      if (null != this.value && this.value.hasOwnProperty("cards")) {
        this.scp_push.cards[0] = this.value.cards[0];
        console.log(`flo-scp-push - initialize - value - cards: ${JSON.stringify(this.scp_push.cards[0])}`);
        this.syncParent();
      }

      if (this.bip_bindings.length > 0) {
        this.getBipBindings();
      }

      if (this.transport == "https") {
        this.populateParams();
      }
    },
    syncParent() {
      console.log(`flo-scp-push - syncParent - enter - ${JSON.stringify(this.scp_push)}`);

      if (this.scp_push.hasOwnProperty("operations")) {
        if (this.scp_push.operations[0].push.bearer == "default") {
          delete this.scp_push.operations[0].push.apn;
          this.$emit("change", this.scp_push);
        }

        this.$emit("change", this.scp_push);
      }
    },
    populateParams() {
      this.onKSetChanged(this.getKSet());
      this.onBindingChange(this.getBinding());
      this.onAppChange(this.getSelectedAidName());
      this.onBearerChange(this.getPushBearer());
      if (this.getPushBearer() != "default") {
        this.onApnChange(this.getPushApn());
      }
      this.onBufferChange(this.getPushBuffer());
      this.onRetryChange(this.getPushRetry());
      this.onDelayChange(this.getPushDelay());
      this.onUriChange(this.getPushUri());
    },
    onParamsExpand(event) {
      this.lopen = event;
      this.populateParams();
    },
    onKSetChanged(event) {
      console.log(`flo-scp-push - onKSetChanged - ${JSON.stringify(event)}`);
      let l_push = this.getPush();
      if (event == this.keyset81) {
        delete l_push.keyset;
      } else {
        l_push.keyset = event;
      }

      console.log(`flo-scp-push - onKSetChanged - ${JSON.stringify(l_push)}`);
      this.syncParent();
    },
    onSimpleChange() {
      this.syncParent();
    },
    onBindingChange(event) {
      console.log(`flo-scp-push - onBindingChange - ${event}`);
      let l_push = this.getPush();

      if (!l_push) {
        console.log(`flo-scp-push - onBindingChange - no push`);
        return b;
      }

      if (event == 0) {
        console.log(`flo-scp-push - onBindingChange - event is 0`);
        if (l_push.hasOwnProperty("ip")) {
          delete l_push.ip;
        }
        if (l_push.hasOwnProperty("port")) {
          delete l_push.port;
        }
        this.syncParent();
        return;
      }

      let found = this.bip_bindings.find((f) => f.id == event);

      if (!found) {
        console.log(`flo-scp-push - onBindingChange - not found`);
        if (l_push.hasOwnProperty("ip")) {
          delete l_push.ip;
        }
        if (l_push.hasOwnProperty("port")) {
          delete l_push.port;
        }
        this.syncParent();
        return;
      }
      console.log(`flo-scp-push - onBindingChange - found: ${JSON.stringify(found)}`);
      l_push.ip = found.ip;
      l_push.port = found.port;
      this.syncParent();
    },
    onApnChange(event) {
      let l_push = this.getPush();
      if (l_push) {
        l_push.apn = event;
      }

      this.syncParent();
    },
    onBufferChange(event) {
      let l_push = this.getPush();
      if (l_push) {
        l_push.buffer = +event;
      }

      this.syncParent();
    },
    onRetryChange(event) {
      let l_push = this.getPush();
      if (l_push) {
        l_push.retry = +event;
      }

      this.syncParent();
    },
    onDelayChange(event) {
      let l_push = this.getPush();
      if (l_push) {
        this.meta.delay.value = +event;
        l_push.delay = +event;
      }

      this.syncParent();
    },
    onUriChange(event) {
      let l_push = this.getPush();
      if (l_push) {
        l_push.uri = event;
      }

      this.syncParent();
    },
    onBearerChange(event) {
      let l_push = this.getPush();
      if (l_push) {
        l_push.bearer = event;
        if (l_push.bearer == "gprs") {
          l_push.apn = this.meta.apn.items[0].key;
        }
      }

      this.syncParent();
    },
    onAppChange(event) {
      let l_aids = this.getAids();
      let l_op = this.scp_push.operations[0];
      let l_preferred = this.getPreferredAid();
      if (l_preferred.name == event) {
        l_op.app = "";
      } else {
        l_op.app = event;
      }
      let found = l_aids.find((f) => f.name == event);

      if (found) {
        if (found.format != "") {
          this.meta.app.hint = `Application format is ${found.format}.`;
        }
      }

      this.syncParent();
    },
    onSeChange(event) {
      this.setSeValue(event);
      this.syncParent();
    },
    onExInfoChange(event) {
      this.setExInfoValue(event);
      this.syncParent();
    },
    getSeValue() {
      let lcard = this.scp_push.cards[0];
      if (!lcard.hasOwnProperty("se")) {
        return null;
      }
      console.log(`flo-scp-push - getSeValue - ${JSON.stringify(lcard.se)}`);
      return lcard.se;
    },
    setSeValue(se) {
      let lcard = this.scp_push.cards[0];
      lcard["se"] = se;
    },
    getExInfoValue() {
      let lcard = this.scp_push.cards[0];
      if (!lcard.hasOwnProperty("execute_info")) {
        return null;
      }
      return lcard.execute_info;
    },
    setExInfoValue(execute_info) {
      let lcard = this.scp_push.cards[0];
      lcard["execute_info"] = execute_info;
    },
    setBearer() {
      console.log(`flo-scp-push - setBearer - ${JSON.stringify(this.campaign_lead_by)}`);
      if (this.campaign_lead_by == "gsma") {
        this.meta.bearer.items.push({ key: "default", value: "Default" });
        this.meta.bearer.items.push({ key: "gprs", value: "GPRS" });
        return;
      }

      if (this.uicc.default_bearer) {
        this.meta.bearer.items.push({ key: "default", value: "Default" });
      }
      if (this.uicc.gprs) {
        this.meta.bearer.items.push({ key: "gprs", value: "GPRS" });
      }
    },
    setBufferSize() {
      if (this.uicc.buffer_sizing) {
        this.scp_push.operations[0].push.buffer = this.uicc.buffer_sizing;
        this.meta.buffer.total = this.uicc.buffer_sizing;
      }
    },
    getBufferRule(val) {
      if (val) {
        let total = this.meta.buffer.total;
        console.log(`flo-scp-push - getBufferRule  - total - ${total} - ${typeof total}`);
        let lrule = [(v) => v <= total || `Buffer length can't exceed ${total}.`];
        return lrule;
      }
    },
    getBearer(bearer) {
      let filtered = "";
      filtered = this.meta.bearer.items.filter((b) => b.key == bearer);
      if (filtered.length > 0) {
        return filtered[0].value;
      }

      return filtered;
    },
    getSelectedAidName() {
      let l_push = this.getPush();
      if (!(l_push.hasOwnProperty("app") && l_push.app != "")) {
        let l_aids = this.getAids();

        let l_preferred = l_aids.find((f) => f.preferred == 1);
        if (l_preferred) {
          return l_preferred.key;
        }
        return "";
      }

      return l_push.app;
    },
    getAids() {
      if (null == this.uicc.aids) {
        let l_use_first_aid = { key: "", value: `Use Preferred` };
        let l_use_first_arr = [];
        l_use_first_arr.push(l_use_first_aid);
        return l_use_first_arr;
      }

      let l_aids = this.uicc.aids;
      l_aids = l_aids.filter((f) => f.category == "ISD");
      let l_preferred = l_aids.find((f) => f.preferred == 1);

      l_aids = l_aids.map((m) => {
        if (l_preferred) {
          if (l_preferred.name == m.name) {
            return { key: m.name, value: `${m.name} - TAR: ${m.tar} - Preferred`, tar: m.tar, uaid: m.uaid, preferred: 1 };
          }
        }
        return { key: m.name, value: `${m.name} - TAR: ${m.tar}`, tar: m.tar, uaid: m.uaid };
      });

      return l_aids;
    },
    getBipBindings() {
      console.log(`flo-scp-push - getBipBindings - ${JSON.stringify(this.bip_bindings)}`);
      let l_bindings = [];
      let l_preferred = this.bip_bindings.find((f) => f.preferred == 1);
      console.log(`flo-scp-push - getBipBindings - l_preferred:  ${JSON.stringify(l_preferred)}`);

      if (l_preferred) {
        l_preferred.id = 0;
      } else {
        l_bindings.push({ id: 0, name: `Use Preferred`, bip_id: 0, ip: "", port: 0 });
      }

      l_bindings = l_bindings.concat(this.bip_bindings);
      let l_mapped = l_bindings.map((m) => {
        let l_preferred_text = m.id == 0 ? "Preferred" : "";
        let v = `${m.name} - ${m.ip}:${m.port} - ${l_preferred_text}`;
        if (m.port == 0) {
          v = m.name;
        }
        let b = { key: m.id, value: v };
        return b;
      });
      return l_mapped;
    },
    getKsets() {
      let l_keysets = [];
      l_keysets = l_keysets.concat(this.keysets81);
      let found = l_keysets.find((f) => f.key == this.dkeyset81);
      if (found) {
        found.value = `Keyset ${found.key} - Preferred`;
      }

      return l_keysets;
    },
    hasPushApp() {
      let l_push = this.getPush();
      if (!l_push) {
        return false;
      }
      return l_push.hasOwnProperty("app");
    },
    getPushApp() {
      let l_push = this.getPush();
      if (!l_push) {
        return "";
      }
      return l_push.app;
    },
    hasPushIp() {
      let l_push = this.getPush();
      if (!l_push) {
        return false;
      }
      return l_push.hasOwnProperty("ip");
    },
    getPushIp() {
      let l_push = this.getPush();
      if (!l_push) {
        return "";
      }
      return l_push.ip;
    },
    hasPushPort() {
      let l_push = this.getPush();
      if (!l_push) {
        return false;
      }
      return l_push.hasOwnProperty("port");
    },
    getPushPort() {
      let l_push = this.getPush();
      if (!l_push) {
        return 0;
      }
      return l_push.port;
    },
    hasPushBuffer() {
      let l_push = this.getPush();
      if (!l_push) {
        return false;
      }
      if (!l_push.hasOwnProperty("buffer")) {
        return false;
      }

      return l_push.buffer != "";
    },
    getPushBuffer() {
      let l_push = this.getPush();
      if (!l_push) {
        return 0;
      }
      return +l_push.buffer;
    },
    getPushRetry() {
      let l_push = this.getPush();
      if (!l_push) {
        return 0;
      }
      if (!l_push.hasOwnProperty("retry")) {
        return 1;
      }
      return +l_push.retry;
    },
    getPushDelay() {
      let l_push = this.getPush();
      if (!l_push) {
        return 0;
      }
      if (!l_push.hasOwnProperty("delay")) {
        return 30;
      }
      return +l_push.delay;
    },
    getPushUri() {
      let l_push = this.getPush();
      if (!l_push) {
        return "";
      }
      if (!l_push.hasOwnProperty("uri")) {
        return "gsma/adminagent";
      }
      return l_push.uri;
    },
    getPushApn() {
      let l_push = this.getPush();
      if (!l_push) {
        return "";
      }
      return l_push.apn;
    },
    getPushBearer() {
      let l_push = this.getPush();
      if (!l_push) {
        return "default";
      }
      return l_push.bearer;
    },
    getBinding() {
      let b = 0;
      let l_push = this.getPush();

      if (!l_push) {
        return b;
      }

      if (!l_push.hasOwnProperty("port")) {
        return b;
      }

      if (!l_push.hasOwnProperty("ip")) {
        return b;
      }

      let found = this.getBipBindings().filter((f) => f.ip == l_push.ip && f.port == l_push.port);

      if (!found) {
        return b;
      }
      return found.id;
    },
    getPush() {
      let b = null;
      if (!this.scp_push.hasOwnProperty("operations")) {
        return b;
      }

      let l_ops = this.scp_push.operations;
      if (l_ops.length == 0) {
        return b;
      }

      let l_op = l_ops[0];
      if (!l_op.hasOwnProperty("push")) {
        return b;
      }

      let l_push = l_op.push;

      return l_push;
    },
    getOp() {
      return this.scp_push.operations[0];
    },
    getKSet() {
      if (!this.getPush().hasOwnProperty("keyset")) {
        return this.dkeyset81;
      }

      return this.getPush().keyset;
    },
    getPreferredAid() {
      let l_aids = this.getAids();
      let l_preferred = l_aids.find((f) => f.preferred == 1);

      return l_preferred;
    },
    formatDelayHint() {
      let hint = "Delay Interval in seconds, specify 0 for immediate execution.";
      let formatted = helpers.secondsToTime(this.meta.delay.value);
      if (formatted) {
        hint = `${formatted} - or set to 0 for immediate execution.`;
      }

      return hint;
    },
    async loadApns() {
      try {
        let apns = await this.$axios.$post("api/v1/apns/list", {
          select: {
            key: { k: "apn" },
            value: { k: "apn" },
          },
        });
        this.meta.apn.items = apns;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
  },
};
</script>
