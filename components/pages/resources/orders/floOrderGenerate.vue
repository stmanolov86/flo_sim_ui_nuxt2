<template>
  <div class="flo-order-generate">
    <v-container v-if="!loading" fluid class="ma-0 pa-0">
      <v-form v-model="valid">
        <v-row no-gutters>
          <div class="flex-grow-1"></div>
          <v-col cols="3" class="pa-1 mt-n15">
            <v-autocomplete v-model="reservations.value" :items="filterReservations()" :messages="formatReservationMessage()" @change="loadReservationRanges($event)" @click:clear="clearReservationData()" label="Reservation" item-text="value" item-value="key" clearable outlined dense persistent-hint>
              <template v-slot:message="{ message }"> <span v-html="message"></span></template>
            </v-autocomplete>
          </v-col>
          <v-col cols="12" class="pa-1">
            <flo-expand title="Headers" open elevation="0">
              <template v-slot:content="{}">
                <v-row no-gutters>
                  <v-col cols="12" lg="2" xl="2" class="pa-1">
                    <v-text-field :key="headers.quantity.key" v-model.number="headers.quantity.value" :label="headers.quantity.label" :hint="headers.quantity.hint" :type="headers.quantity.type" :rules="headers.quantity.rule" :messages="formatInputWarnings('quantity')" :disabled="canChangeInputs" persistent-hint outlined dense
                      ><template v-slot:message="{ message }"> <span v-html="message"></span></template
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" lg="2" xl="2" class="pa-1">
                    <v-autocomplete v-model="headers.hsm_id.value" :label="headers.hsm_id.label" :hint="headers.hsm_id.hint" :items="headers.hsm_id.items" item-text="value" item-value="key" @change="loadHsmTkKeys($event)" dense persistent-hint outlined></v-autocomplete>
                  </v-col>

                  <v-col v-if="hasHsm()" cols="12" lg="2" xl="2" class="pa-1">
                    <v-select v-model="headers.ota_wrap_mode.value" :label="headers.ota_wrap_mode.label" :hint="headers.ota_wrap_mode.hint" :items="headers.ota_wrap_mode.items" item-text="value" item-value="key" no-data-text="Please select Encryption" dense persistent-hint outlined></v-select>
                  </v-col>

                  <v-col v-if="isEncrypted()" cols="12" lg="2" xl="2" class="pa-1">
                    <v-autocomplete v-model="headers.tk_ota_id.value" :label="headers.tk_ota_id.label" :hint="headers.tk_ota_id.hint" :items="headers.tk_ota_id.items" item-text="value" item-value="key" no-data-text="Please select valid HSM" dense clearable persistent-hint outlined></v-autocomplete>
                  </v-col>

                  <v-col v-if="isEncrypted()" cols="12" lg="2" xl="2" class="pa-1">
                    <v-autocomplete v-model="headers.tk_net_id.value" :label="headers.tk_net_id.label" :hint="headers.tk_net_id.hint" :items="headers.tk_net_id.items" item-text="value" item-value="key" no-data-text="Please select valid HSM" dense clearable persistent-hint outlined></v-autocomplete>
                  </v-col>
                </v-row>

                <v-row no-gutters>
                  <v-col v-for="(product_header, idx) in getProductHeadersGenerate()" :key="idx" cols="12" lg="3" xl="3" class="pa-2">
                    <flo-parser-view v-if="product_header.pattern.includes('parse') && uicc" :value="getHeaderValue(product_header)" :row="product_header" :header="product_header" :required_mask="uicc.required_mask" :available_mask="uicc.available_mask" :disabled="getFieldHeaderDisabled(product_header)" @input="onHeaderChanged(product_header, $event)" />
                    <flo-meta-field-edit v-else :disabled="getFieldHeaderDisabled(product_header)" :header="getFieldHeaderFromProductHeader(product_header)" :value="getHeaderValue(product_header)" :pattern="getFieldHeaderPatternFromProductHeader(product_header)" @change="onHeaderChanged(product_header, $event)"> </flo-meta-field-edit>
                  </v-col>
                </v-row>
              </template>
            </flo-expand>
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col cols="12" class="pa-1">
            <flo-expand title="Inputs" open elevation="0">
              <template v-slot:content="{}">
                <v-row no-gutters>
                  <v-col cols="12" lg="2" xl="2" class="pa-1">
                    <v-text-field v-model="iccid.prefix" @change="onIccidChanged('prefix', $event)" :rules="rules.iin" :disabled="canChangeInputs" :messages="formatInputWarnings('prefix')" label="ICCID prefix" type="text" persistent-hint outlined dense>
                      <template v-slot:message="{ message }">
                        <span v-html="message"></span>
                      </template>
                    </v-text-field>
                  </v-col>

                  <v-col cols="12" lg="2" xl="2" class="pa-1">
                    <v-text-field v-model="iccid.iai" @change="onIccidChanged('iai', $event)" :rules="rules.iai" :disabled="canChangeInputs" :messages="formatInputWarnings('iai')" label="IAI" type="text" persistent-hint outlined dense>
                      <template v-slot:message="{ message }"> <span v-html="message"></span> </template
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row no-gutters>
                  <v-col v-for="(product_input, idx) in getProductInputsGenerate()" :key="idx" cols="12" lg="3" xl="3" class="pa-2">
                    <v-autocomplete v-if="getReservationInputsGenerate(product_input) == 'imsi' && reservations.visible" :value="getInputValue(product_input)" :items="filterInputData('imsis')" @change="onReservationImsiInputChanged(product_input, $event)" :messages="formatInputWarnings('imsi')" :label="product_input.desc" :disabled="disableImsi(product_input)" item-text="value" item-value="value" clearable filled persistent-hint>
                      <template v-slot:message="{ message }"> <span v-html="message"></span> </template>
                    </v-autocomplete>
                    <v-autocomplete v-else-if="getReservationInputsGenerate(product_input) == 'msisdn' && reservations.visible" :value="getInputValue(product_input)" :items="filterInputData('msisdns')" @change="onInputChanged(product_input, $event)" :messages="formatInputWarnings('msisdn')" :label="product_input.desc" :disabled="disableMsisdn(product_input)" item-text="value" item-value="value" clearable filled persistent-hint>
                      <template v-slot:message="{ message }"> <span v-html="message"></span> </template
                    ></v-autocomplete>
                    <flo-meta-field-edit v-else :disabled="getFieldInputDisabled(product_input)" :pattern="getFieldHeaderPatternFromProductInput(product_input)" :header="getFieldHeaderFromProductHeader(product_input)" :value="getInputValue(product_input)" @input="onInputChanged(product_input, $event)"> </flo-meta-field-edit>
                  </v-col>
                </v-row>
              </template>
            </flo-expand>
          </v-col>
        </v-row>
      </v-form>
      <v-row v-if="generated_sample">
        <v-col>
          <flo-json-editor name="Generated" mode="view" :modes="['view', 'code', 'text', 'preview']" :value="generated_sample" :key="generated_version"></flo-json-editor>
        </v-col>
      </v-row>
      <v-row v-if="progress_gen" no-gutters>
        <v-col class="pa-1">
          <v-progress-linear color="success" height="7" indeterminate rounded></v-progress-linear>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="12" class="ma-1 pa-1">
          <v-btn :disabled="!canGenerate || progress_gen" color="primary" class="mr-1" @click="execGenerateSample(direction)">
            <v-icon left>mdi-engine</v-icon>
            Generate Sample
          </v-btn>
          <v-btn v-if="generated_sample" :disabled="!canGenerate || progress_gen" :loading="progress_gen" color="primary" class="mr-1" @click="execAcceptGenerate(direction)">
            <v-icon left>mdi-content-save</v-icon>
            Accept
          </v-btn>
          <v-btn v-if="generated_sample" :disabled="!canGenerate || progress_gen" color="primary" @click="execCancelGenerate()">
            <v-icon left>mdi-cancel</v-icon>
            Cancel
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import floParserView from "~/components/widgets/floParserView.vue";
import floExpand from "~/components/select/floExpand";
import { mapGetters, mapActions } from "vuex";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  name: "flo-order-generate",
  components: {
    floExpand,
    floParserView,
  },
  data() {
    return {
      helpers,
      loading: true,
      rules: {
        iin: [(v) => (/^[0-9]{7}$/.test(v) && !!v) || "Field is required and accepts 7 digits."],
        iai: [(v) => (/^[0-9]{11}$/.test(v) && !!v) || "Field is required and accepts 11 digits."],
      },
      iccid: {
        prefix: "8935711",
        iai: "00000000000",
        cd: "add",
      },
      headers: {
        hsm_id: {
          label: "HSM",
          hint: "Hardware Security Module",
          items: [],
          value: false,
        },
        ota_wrap_mode: {
          label: "Encryption Mode",
          hint: "Keys Encryption Mode",
          items: [
            { key: "wrapped", value: "Wrapped" },
            // { key: "encrypted", value: "Encrypted" },
            { key: "raw", value: "Raw" },
          ],
          value: "wrapped",
        },
        tk_ota_id: {
          label: "TK OTA",
          hint: "Transport Key OTA",
          items: [],
          value: false,
        },
        tk_net_id: {
          label: "TK NET",
          hint: "Transport Key NET",
          items: [],
          value: false,
        },
        quantity: {
          label: "Quantity",
          hint: "Quantity Of Cards",
          key: 0,
          value: "",
          type: "number",
          rule: [(v) => (/^[1-9]+[0-9]*$/.test(v) && v <= 50000 && !!v) || "Field is required and accepts only numbers up to 50 000."],
        },
      },
      generated_version: 1,
      generated_sample: null,
      subs: [],
      selected_subs: [],
      product_headers: [],
      product_inputs: [],
      valid: false,
      valid_inputs: true,
      valid_headers: true,
      progress_gen: false,
      progress_gen_value: 0,
      purchases: [],
      reservations: {
        visible: false,
        value: "",
        message: "",
        iccid: "",
        items: [],
        range: [],
        imsis: [],
        msisdns: [],
      },
      blank_order: null,
    };
  },
  props: {
    order: {
      type: Object,
      required: true,
      default: null,
    },
    max_subs: {
      type: Number,
      required: false,
      default: 1,
    },
    direction: {
      type: String,
      required: false,
      default: "in",
    },
    sample: {
      type: Number,
      required: false,
      default: 20,
    },
    has_applet: {
      type: Boolean,
      required: false,
      default: false,
    },
    product: {
      type: Object,
      required: true,
    },
    uicc: {
      type: Object,
      required: false,
    },
  },
  computed: {
    ...mapGetters({
      getResourceKey: "session/getResourceKey",
    }),
    canGenerate() {
      if (this.headers.hsm_id.value) {
        if (this.headers.ota_wrap_mode.value != "raw") {
          if (!this.headers.tk_ota_id.value) {
            return false;
          }
        }
      }

      if (this.reservations.value != "") {
        let imsis = this.filterInputData("imsis").some((s) => !s.disabled);
        let msisdns = this.filterInputData("msisdns").some((s) => !s.disabled);
        if (imsis || msisdns) {
          return false;
        }
      }

      if (!this.valid) {
        return false;
      }

      return true;
    },
    canChangeInputs() {
      let { value, iccid } = this.reservations;

      if (value != "" && iccid != "") {
        return true;
      }

      return false;
    },
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    ...mapActions({
      addToResourceCache: "session/addToResourceCache",
    }),
    getFieldHeaderDisabled(product_header) {
      if (product_header.origin == "user") {
        return false;
      }
      return true;
    },
    getFieldInputDisabled(product_input) {
      let { value, visible } = this.reservations;

      if (this.order.type == "blank") {
        return true;
      }
      if (typeof value == "number" && visible) {
        return true;
      }
      if (product_input.origin == "user") {
        return false;
      }
      return true;
    },
    getFieldHeaderFromProductHeader(product_header) {
      product_header["text"] = product_header.desc;
      return product_header;
    },
    getFieldHeaderPatternFromProductHeader(product_header) {
      if (product_header.hasOwnProperty("desc")) {
        if (product_header.desc.includes("Timeout")) {
          return ".*$";
        }
      }

      if (product_header.hasOwnProperty("pattern")) {
        return product_header.pattern;
      }
      return ".*$";
    },
    getFieldHeaderPatternFromProductInput(product_input) {
      if (product_input.hasOwnProperty("pattern")) {
        return product_input.pattern;
      }
      return ".*$";
    },
    getInputValue(input) {
      let found = this.product_inputs.find((f) => f.name == input.name);
      if (found) {
        console.log(`floOrderGenerate - getInputValue - FOUND - ${input.name}:${found.value}`);
        if (this.order.type == "blank") {
          if (typeof this.reservations.value == "number" && this.reservations.value != 0) {
            if (input.name == "imsi1" || input.name == "msisdn1") {
              return "100000000000000";
            }
          } else {
            return input.default;
          }
        }
        return found.value;
      } else {
        console.log(`floOrderGenerate - getInputValue - NOT FOUND - ${input.name}`);
      }

      return input.default;
    },
    onReservationImsiInputChanged(product_input, event) {
      let l_product_inputs = this.product_inputs;
      let l_found = null;
      l_found = l_product_inputs.find((f) => f.name == product_input.name);
      if (l_found) {
        console.log(`floOrderGenerate - onReservationImsiInputChanged - FOUND - ${product_input.name}:${l_found.value}`);
        l_found.value = event;
      } else {
        console.log(`floOrderGenerate - onReservationImsiInputChanged - NOT FOUND - ${product_input.name}:${event}`);
        l_product_inputs.push({ name: product_input.name, value: event });
      }
      this.setBoundMsisdn(product_input.name, event);
    },
    onInputChanged(product_input, event) {
      console.log(`floOrderGenerate - onInputChanged - enter`);
      let name = "";
      if (this.order.type != "standard") {
        name = product_input;
      } else {
        name = product_input.name;
      }

      let l_product_inputs = this.product_inputs;
      let l_found = null;
      l_found = l_product_inputs.find((f) => f.name == name);
      if (l_found) {
        console.log(`floOrderGenerate - onInputChanged - FOUND - ${name}:${l_found.value}`);
        l_found.value = event;
      } else {
        console.log(`floOrderGenerate - onInputChanged - NOT FOUND - ${name}:${event}`);
        l_product_inputs.push({ name: name, value: event });
      }
    },
    getProductInputs() {
      let l_extra = this.getProductExtra();
      if (!l_extra) {
        return [];
      }

      if (!l_extra.hasOwnProperty("data")) {
        return [];
      }

      let l_data = l_extra.data;

      if (!l_data.hasOwnProperty("inputs")) {
        return [];
      }

      let l_inputs = l_data.inputs;

      return l_inputs;
    },
    getProductInputsGenerate() {
      let linputs = this.getProductInputs();
      let lsubs = this.getProductSubscribers();
      if (linputs.length > 0 && lsubs.length > 0) {
        linputs.forEach((input) => {
          if (input.name && typeof input.name == "string") {
            if (input.hasOwnProperty("message")) {
              delete input.message;
            }
            let match = input.name.match(/\d+/);
            if (match) {
              let idx = parseInt(match[0]);
              let found = lsubs.find((f) => f.idx == idx);
              if (found) {
                input.message = "Subscriber data originates from the product.";
              }
            }
          }
        });
      }

      let l_filtered_inputs = linputs.filter((f) => f.origin != "system" && f.origin != "fixed" && f.origin != "dedicated");
      return l_filtered_inputs;
    },
    getProductInputsDedicated() {
      let linputs = this.getProductInputs();
      let l_filtered_inputs = linputs.filter((f) => "dedicated" == f.origin);
      return l_filtered_inputs;
    },
    getReservationInputsGenerate(input) {
      let type = "";
      if (input) {
        if (input.name.startsWith("imsi")) {
          let idx = parseInt(input.name.replace("imsi", "")) - 1;
          if (idx >= 0 && idx < this.reservations.imsis.length) {
            type = "imsi";
          }
        } else if (input.name.startsWith("msisdn")) {
          let idx = parseInt(input.name.replace("msisdn", "")) - 1;
          if (idx >= 0 && idx < this.reservations.msisdns.length) {
            type = "msisdn";
          }
        }
      }

      return type;
    },
    getHeaderValue(header) {
      let l_found = this.product_headers.find((f) => f.name == header.name);
      if (l_found) {
        return this.formatHeaderValues(header.name, l_found.value);
      } else {
        console.log(`floOrderGenerate - getHeaderValue - NOT FOUND - ${header.name}`);
        return this.formatHeaderValues(header.name, header.default);
      }
    },
    formatHeaderValues(name, value) {
      switch (name) {
        case "as_inactive_to":
        case "as_boot_wait_ota_to":
        case "as_boot_sleep_to":
        case "as_boot_disconnected_to":
        case "as_active_next_to": {
          return helpers.formatTime(value);
        }
        default:
          return value;
      }
    },
    onHeaderChanged(product_header, event) {
      console.log(`floOrderGenerate - onHeaderChanged - enter`);
      let l_product_headers = this.product_headers;
      let l_found = null;
      l_found = l_product_headers.find((f) => f.name == product_header.name);
      if (l_found) {
        l_found.value = this.formatHeaderChanges(l_found.name, event);
        console.log(`floOrderGenerate - onHeaderChanged - FOUND - ${product_header.name}:${l_found.value}`);
      } else {
        console.log(`floOrderGenerate - onHeaderChanged - NOT FOUND - ${product_header.name}:${event}`);
        l_product_headers.push({ name: product_header.name, value: this.formatHeaderChanges(product_header.name, event) });
      }
    },
    formatHeaderChanges(name, event) {
      switch (name) {
        case "as_inactive_to":
        case "as_boot_wait_ota_to":
        case "as_boot_sleep_to":
        case "as_boot_disconnected_to":
        case "as_active_next_to": {
          return event.replaceAll(":", "");
        }
        default:
          return event;
      }
    },
    formatReservationMessage() {
      return `
          Select Reservation
          <br />
          <span class="caption info--text">Only ${this.order.type == "blank" ? "unreconciled Blank" : this.order.type == "local_factory" ? "unreconciled Local Factory" : "final, Standard"} reservations are listed here.</span>`;
    },
    formatInputWarnings(field) {
      let message = this.reservations.message;
      let hints = {
        prefix: "Issuer Identification Number",
        iai: "Individual Account Identification",
        imsi: "International Mobile Subscriber Identity",
        msisdn: "Mobile Station International Subscriber Directory Number",
        quantity: "Quantity Of Cards",
      };
      let rules = {
        prefix: this.rules.iin,
        iai: this.rules.iai,
        quantity: this.headers[field] ? this.headers[field].rule : null,
      };
      let values = {
        prefix: this.iccid.prefix,
        iai: this.iccid.iai,
        quantity: this.headers[field] ? this.headers[field].value : null,
      };

      let error = "";
      let hint = hints[field] || "";
      let rule = rules[field];
      let value = values[field];

      if (value && rule) {
        error = rule[0](value);
        if (typeof error == "string") {
          hint = error;
        }
      }

      return message
        ? `${hint}
        <br />
        <span class="caption warning--text">${message}</span>`
        : hint;
    },
    filterReservations() {
      return this.reservations.items.filter((f) => f.type == this.order.type);
    },
    filterInputData(type) {
      let selected = this.product_inputs.map((m) => m.value).filter((f) => f);

      if (type == "imsis") {
        return this.reservations.imsis.map((m) => {
          return selected.includes(m.value) ? { ...m, disabled: true } : m;
        });
      } else if (type == "msisdns") {
        return this.reservations.msisdns.map((m) => {
          return selected.includes(m.value) ? { ...m, disabled: true } : m;
        });
      }
    },
    getProductHeaders() {
      let l_extra = this.getProductExtra();
      if (!l_extra) {
        return [];
      }

      if (!l_extra.hasOwnProperty("data")) {
        return [];
      }

      let l_data = l_extra.data;

      if (!l_data.hasOwnProperty("headers")) {
        return [];
      }

      let l_headers = l_data.headers;

      return l_headers;
    },
    getProductHeadersGenerate() {
      let lheaders = this.getProductHeaders();
      let l_filtered_headers = lheaders.filter((f) => f.origin != "system" && f.origin != "fixed" && f.origin != "dedicated");
      return l_filtered_headers;
    },
    getProductHeadersDedicated() {
      let lheaders = this.getProductHeaders();
      let l_filtered_headers = lheaders.filter((f) => "dedicated" == f.origin);
      return l_filtered_headers;
    },
    getProductSubscribers() {
      let l_extra = this.getProductExtra();
      if (!l_extra) {
        return [];
      }

      if (!l_extra.hasOwnProperty("data")) {
        return [];
      }

      let l_data = l_extra.data;

      if (!l_data.hasOwnProperty("subscribers")) {
        return [];
      }

      let l_subscribers = l_data.subscribers;

      return l_subscribers;
    },
    getProductExtra() {
      if (!this.product) {
        return null;
      }
      if (!this.product.hasOwnProperty("extra")) {
        return null;
      }
      return this.product.extra;
    },
    async loadBlankOrder(event) {
      let { blank_reservation_id } = this.reservations.items.find((f) => f.key == event);
      let answer = [];
      try {
        let query = {
          select: {},
          where: [
            {
              k: "reservation_id",
              op: "equal",
              v: blank_reservation_id,
            },
          ],
        };
        answer = await this.$axios.$post("api/v1/orders/list", query);
        if (answer.length > 0) {
          this.blank_order = answer[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async getFile() {
      try {
        let answer = await this.$axios.$post("/api/v1/orders/rfs/list", {
          id: this.blank_order.id,
          field: "out",
        });
        return answer;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      return null;
    },
    async getSample(id) {
      try {
        let answer = await this.$axios.$get(`/api/v1/orders/out/effective/sample/${id}`);
        return answer;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      return null;
    },
    async initialize() {
      let l_product_inputs = this.getProductInputsGenerate();
      this.product_inputs = l_product_inputs.map((m) => {
        return { name: m.name, value: m.default };
      });
      this.getProductInputsDedicated();

      let l_product_headers = this.getProductHeadersGenerate();
      this.product_headers = l_product_headers.map((m) => {
        return { name: m.name, value: m.default };
      });
      let l_product_headers_dedicated = this.getProductHeadersDedicated();

      // fix dedicated header defaults
      let l_dedicated_header_keys = Object.keys(this.headers);

      for (let dhki = 0; dhki < l_dedicated_header_keys.length; dhki++) {
        const l_dhko = l_dedicated_header_keys[dhki];
        let l_found = l_product_headers_dedicated.find((f) => l_dhko == f.name);
        if (l_found) {
          this.headers[l_dhko].value = l_found.default;
        }
      }
      await this.loadHsms();
      await this.loadReservations();
      await this.loadPurchases();
      if (this.order.type == "local_factory") {
        this.$emit("enrich_local_factory", true);
        await this.loadReservationRanges(this.order.reservation_id);
        this.reservations.value = this.order.reservation_id;
        let field = await this.getFile();
        if (field != null) {
          let sample = await this.getSample(field[0].id);
          if (sample) {
            this.headers = Object.entries(this.headers).reduce((acc, [key, header]) => {
              if (key !== "quantity") {
                let found = sample.data.headers.find((h) => h.name == key);
                if (found) header.value = found.value;
              }
              acc[key] = header;
              return acc;
            }, {});
          }
        }

        await this.execGenerateSample("out");
        await this.execAcceptGenerate("out");
      }
      this.loading = false;
      if (this.headers.hsm_id.value) {
        await this.loadHsmTkKeys(this.headers.hsm_id.value);
      }
    },
    hasHsm() {
      if (this.headers.hsm_id.value) {
        return true;
      }
      return false;
    },
    isEncrypted() {
      if (!this.hasHsm()) {
        return false;
      }

      if (this.headers.ota_wrap_mode.value == "wrapped" || this.headers.ota_wrap_mode.value == "encrypted") {
        return true;
      }

      return false;
    },
    buildIccid() {
      return `${this.iccid.prefix}${this.iccid.iai}`;
    },
    onIccidChanged() {
      let l_found = null;
      let linputs = this.product_inputs;

      l_found = linputs.find((f) => "iccid" == f.name);
      if (l_found) {
        l_found.value = this.buildIccid();
      } else {
        linputs.unshift({ name: "iccid", value: this.buildIccid() });
      }
    },
    async generateSampleRequest(direction) {
      this.onIccidChanged();

      let lheaders = this.product_headers;
      let linputs = this.product_inputs;

      let l_found = lheaders.find((f) => "quantity" == f.name);
      if (l_found) {
        l_found.value = this.headers.quantity.value;
      } else {
        lheaders.push({ name: "quantity", value: this.headers.quantity.value });
      }

      if (this.hasHsm()) {
        l_found = lheaders.find((f) => "hsm_id" == f.name);
        if (l_found) {
          l_found.value = this.headers.hsm_id.value;
        } else {
          lheaders.push({ name: "hsm_id", value: this.headers.hsm_id.value });
        }

        l_found = lheaders.find((f) => "ota_wrap_mode" == f.name);
        if (l_found) {
          l_found.value = this.headers.ota_wrap_mode.value;
        } else {
          lheaders.push({ name: "ota_wrap_mode", value: this.headers.ota_wrap_mode.value });
        }
      }

      if (this.isEncrypted()) {
        l_found = lheaders.find((f) => "tk_ota_id" == f.name);
        if (l_found) {
          l_found.value = this.headers.tk_ota_id.value;
        } else {
          lheaders.push({ name: "tk_ota_id", value: this.headers.tk_ota_id.value });
        }

        l_found = lheaders.find((f) => "tk_net_id" == f.name);
        if (l_found) {
          l_found.value = this.headers.tk_net_id.value;
        } else {
          lheaders.push({ name: "tk_net_id", value: this.headers.tk_net_id.value });
        }
      }
      // else {
      //   // remove tk if not encrypted
      //   l_found = lheaders.find((f) => "tk_ota_id" == f.name);
      //   if (l_found) {
      //     lheaders = lheaders.filter((f) => f.name != l_found.name);
      //   }

      //   l_found = lheaders.find((f) => "tk_net_id" == f.name);
      //   if (l_found) {
      //     lheaders = lheaders.filter((f) => f.name != l_found.name);
      //   }
      // }

      let request = {
        order_id: this.order.id,
        type: this.order.type,
        direction: direction,
        headers: lheaders,
        inputs: linputs,
        iccid: this.iccid,
      };

      if (this.order.type == "local_factory" && this.blank_order) {
        request["blank_order_id"] = this.blank_order.id;
      }

      if (this.headers.quantity.value <= this.sample) {
        request["sample"] = this.headers.quantity.value;
      } else {
        request["sample"] = this.sample;
      }

      return request;
    },
    async generateSample(direction) {
      let request = await this.generateSampleRequest(direction);
      let answer = null;
      try {
        let options = {
          onDownloadProgress: (progressEvent) => {
            this.progress_gen_value = progressEvent.loaded * (progressEvent.total / 100);
          },
        };
        this.progress_gen = true;
        answer = await this.$axios.$post("api/v1/orders/generate", request, options);
        this.progress_gen = false;
      } catch (err) {
        this.progress_gen = false;
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      return answer;
    },
    async execGenerateSample(dir) {
      this.generated_sample = await this.generateSample(dir);
      if (this.generated_sample) {
        this.$emit("generated_sample", this.generated_sample);
      }
    },
    async execAcceptGenerate(dir) {
      let l_generate_request = await this.generateSampleRequest(dir);
      let l_output = {
        id: this.order.id,
        decoder: "flolive",
        name: "generate.json",
        iccid_check_digit: true,
        type: "application/json",
      };

      let lrequest = {
        generate: l_generate_request,
        output: l_output,
      };

      let answer = null;
      try {
        let options = {
          onDownloadProgress: (progressEvent) => {
            this.progress_gen_value = progressEvent.loaded * (progressEvent.total / 100);
          },
        };
        this.progress_gen = true;
        answer = await this.$axios.$post("api/v1/orders/generate_accept", lrequest, options);
        if (this.reservations.value != "") {
          await this.updateOrderReservation();
        }
        if (this.order.type == "local_factory") {
          this.$emit("enrich_local_factory", false);
        }
        this.progress_gen = false;
      } catch (err) {
        this.progress_gen = false;
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      this.execUpload(dir);
      return answer;
    },
    execUpload(dir) {
      if (this.generated_sample) {
        let levent = {
          dir: dir,
          generated_sample: this.generated_sample,
        };
        this.$emit("upload", levent);
      }
    },
    execCancelGenerate() {
      this.generated_sample = null;
      this.product_headers = [];
      this.product_inputs = this.getProductInputs();
      this.iccid = {
        prefix: "8935711",
        iai: "000000000000",
        cd: "add",
      };

      for (const header in this.headers) {
        this.headers[header].value = null;
      }

      for (let i = 0; i < this.product_inputs.length; i++) {
        const oi = this.product_inputs[i];
        oi.value = "";
      }
    },
    clearReservationData() {
      this.reservations.visible = false;
      this.reservations.message = "";
      this.reservations.iccid = "";
      this.reservations.imsis = [];
      this.reservations.msisdns = [];
      this.iccid = {
        prefix: "8935711",
        iai: "00000000000",
        cd: "add",
      };
      this.headers.quantity.value = 0;
      this.headers.quantity.key++;
      this.product_inputs.forEach((input) => {
        if (input.value != "") {
          input.value = "";
        }
      });
    },
    disableImsi() {
      if (this.order.type == "blank") {
        return true;
      }

      return false;
    },
    disableMsisdn(product_input) {
      let range = this.reservations.range;
      let found_imsi = this.product_inputs.find((f) => f.name == `imsi${product_input.name.slice(-1)}`);
      let imsi = range.find((f) => f.type == "imsi" && f.start_no == found_imsi.value);
      if (imsi && found_imsi.value) {
        let found = this.findBoundMsisdn(imsi, range);
        if (found) {
          return true;
        }
      }

      if (this.order.type == "blank") {
        return true;
      }

      return false;
    },
    findBoundMsisdn(imsi, range) {
      console.log(`floOrderGenerate - findBoundMsisdn -  purchase_id: ${JSON.stringify(imsi.purchase_id)}`);
      let found = this.purchases.find((f) => f.key == imsi.purchase_id);
      console.log(`floOrderGenerate - findBoundMsisdn -  found: ${JSON.stringify(found)}`);

      if (found.bound_child) {
        let msisdn = range.find((f) => f.purchase_id == found.bound_child);
        console.log(`floOrderGenerate - findBoundMsisdn - msisdn: ${JSON.stringify(msisdn)}`);
        return msisdn ? msisdn.start_no : "";
      }
    },
    setBoundMsisdn(name, event) {
      let range = this.reservations.range;
      let input = this.product_inputs.find((f) => f.name == `msisdn${name.slice(-1)}`);
      if (!range || !input) {
        return;
      }

      let imsi = range.find((f) => f.type == "imsi" && f.start_no == event);
      console.log(`floOrderGenerate - setBoundMsisdn - imsi: ${JSON.stringify(imsi)}`);
      if (imsi) {
        if (imsi.purchase_id) {
          input.value = this.findBoundMsisdn(imsi, range);
        }
      } else {
        input.value = "";
      }
    },
    async loadHsms() {
      this.headers.hsm_id.items = [];
      try {
        let hsms = await this.$axios.$post("api/v1/hsms/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        this.headers.hsm_id.items = hsms;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadHsmTkKeys(id) {
      this.headers.tk_ota_id.items = [];
      this.headers.tk_net_id.items = [];
      try {
        let query = {
          select: {},
          where: [
            {
              k: "hsm_id",
              op: "equal",
              v: id,
            },
            {
              k: "key_type",
              op: "equal",
              v: "tk",
            },
            {
              k: "status",
              op: "equal",
              v: "active",
            },
          ],
        };

        let hsm_keys = await this.$axios.$post(`api/v1/hsm_keys/list`, query);
        let l_lkeys = hsm_keys.map((m) => {
          return { key: m.id, value: m.name };
        });
        this.headers.tk_ota_id.items = l_lkeys;
        this.headers.tk_net_id.items = l_lkeys;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadReservations() {
      try {
        let type = this.order.type;
        let query = {
          select: {
            key: { k: "id" },
            value: { k: "name" },
            final: { k: "final" },
            type: { k: "type" },
            quantity: { k: "quantity" },
            ticket_ref: { k: "ticket_ref" },
            blank_reservation_id: { k: "blank_reservation_id" },
          },
          where: [
            {
              k: "state",
              op: "equal",
              v: "active",
            },
            {
              k: "final",
              op: "equal",
              v: type == "blank" ? 0 : 1,
            },
          ],
        };

        if (["blank", "local_factory"].includes(type)) {
          query.where.push({ k: "reconcile", op: "equal", v: 0 });
        }

        let reservations = await this.$axios.$post("floinventory/v1/reservations/list", query);
        this.reservations.items = reservations;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadPurchases() {
      try {
        let query = {
          select: {
            key: { k: "id" },
            value: { k: "name" },
            bound_parent: { k: "bound_parent" },
            bound_child: { k: "bound_child" },
          },
          where: [
            {
              k: "state",
              op: "equal",
              v: "active",
            },
          ],
        };
        let purchases = await this.$axios.$post("floinventory/v1/purchases/list", query);
        this.purchases = purchases;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadReservationRanges(event) {
      this.clearReservationData();
      if (event) {
        try {
          let query = {
            select: {},
            where: [
              {
                k: "reservation_id",
                op: "equal",
                v: event,
              },
            ],
          };
          let ranges = await this.$axios.$post("floinventory/v1/ranges/list", query);
          await this.loadBlankOrder(event);
          if (ranges.length > 0) {
            this.reservations.range = ranges;
            this.reservations.range.forEach((range) => {
              let { type, start_no } = range;
              let orderType = this.order.type;
              if (type == "iccid") {
                this.reservations.iccid = start_no;
                this.iccid.prefix = start_no.slice(0, 7);
                this.iccid.iai = start_no.slice(7);
              }

              if (orderType == "blank") {
                this.reservations.imsis.push({ value: "100000000000000" });
                this.onInputChanged("imsi1", "100000000000000");
                this.reservations.msisdns.push({ value: "100000000000000" });
                this.onInputChanged("msisdn1", "100000000000000");
              } else if (orderType == "local_factory") {
                if (type == "imsi") {
                  this.reservations.imsis.push({ value: start_no });
                  for (let idx = 0; idx < this.reservations.imsis.length; idx++) {
                    const imsi = this.reservations.imsis[idx];
                    this.onReservationImsiInputChanged({ name: `imsi${idx + 1}` }, imsi.value);
                  }
                }
              } else if (orderType == "standard") {
                if (type == "imsi") {
                  this.reservations.imsis.push({ value: start_no });
                } else if (type == "msisdn") {
                  this.reservations.msisdns.push({ value: start_no });
                }
              }
            });
            this.reservations.visible = true;
            this.reservations.message = "Value originates from a reservation.";
          }
          let found = this.reservations.items.find((f) => f.key == event);
          if (found) {
            this.headers.quantity.value = found.quantity;
          }
        } catch (err) {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
          return lerr;
        }
      }
    },
    async updateOrderReservation() {
      let reservation_id = this.reservations.value;
      let order = {
        id: this.order.id,
        product_id: this.order.product_id,
        reservation_id: reservation_id,
      };
      if (this.order.ticket_ref == "") {
        let found = this.reservations.items.find((f) => f.key == reservation_id);
        if (found && found.ticket_ref != "") {
          order["ticket_ref"] = found.ticket_ref;
        }
      }
      try {
        await this.$axios.$put(`/api/v1/orders/${order.id}`, order);
      } catch (err) {
        let lerr = this.parseNetError(err);
        console.log(`error: ${lerr.statusCode} - ${lerr.message}`);
      }
    },
  },
};
</script>
