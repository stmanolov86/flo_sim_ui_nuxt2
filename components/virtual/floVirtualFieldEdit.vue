<template>
  <div class="flo-virtual-field-edit">
    <template v-if="findPattern()">
      <v-switch v-if="findPattern().endsWith('bool')" @change="onChange($event)" :disabled="disabled" inset color="success" v-model="cvalue" :label="formatInfo(cheader.name)" :hint="cheader.hasOwnProperty('description') ? formatInfo(cheader.description) : undefined" persistent-hint></v-switch>
      <template v-else-if="findPattern().endsWith('enum')">
        <flo-enum v-model="cvalue" @change="onChange($event)" :items="cheader.enum" :disabled="disabled" :label="formatInfo(cheader.name)" :hint="cheader.hasOwnProperty('description') ? formatInfo(cheader.description) : undefined" />
      </template>
      <template v-else-if="findPattern().endsWith('bitmask')">
        <flo-bitmask v-model="cvalue" @change="onChange($event)" :items="cheader.bitmask" :disabled="disabled" :label="formatInfo(cheader.name)" :hint="cheader.hasOwnProperty('description') ? formatInfo(cheader.description) : undefined" />
      </template>
      <template v-else-if="findPattern().endsWith('plmn')">
        <flo-plmn :value="cvalue" @change="onChange($event)" :daloc="true" :swapped="true" :disabled="disabled" :label="formatInfo(cheader.name)" :hint="cheader.hasOwnProperty('description') ? formatInfo(cheader.description) : undefined" />
      </template>
      <template v-else-if="findPattern().endsWith('gsma_plmn')">
        <flo-plmn :value="cvalue" @change="onChange($event)" :swapped="true" :disabled="disabled" :label="formatInfo(cheader.name)" :hint="cheader.hasOwnProperty('description') ? formatInfo(cheader.description) : undefined" />
      </template>
      <template v-else-if="findPattern().endsWith('gsma_plmn_wact')">
        <flo-gsm-plmn-act :value="cvalue" @change="onChange($event)" :swapped="false" :disabled="disabled" :label="formatInfo(cheader.name)" :hint="cheader.hasOwnProperty('description') ? formatInfo(cheader.description) : undefined" />
      </template>
      <template v-else-if="findPattern().endsWith('time')">
        <flo-time-parser :value="cvalue" @change="onChange($event)" :disabled="disabled" :label="formatInfo(cheader.name)" :hint="cheader.hasOwnProperty('description') ? formatInfo(cheader.description) : undefined" />
      </template>
      <template v-else-if="['ust', 'spn', 'pnn', 'sume', 'len_apn'].some((s) => findPattern().includes(s))">
        <flo-parser-view v-if="uicc" :value="cvalue" @input="onChange($event)" :row="cheader" :header="cheader" :disabled="disabled" :required_mask="uicc.required_mask" :available_mask="uicc.available_mask" />
      </template>
      <template v-else>
        <v-text-field :disabled="disabled" @change="onSimpleChange($event)" v-model="cvalue" :label="formatInfo(cheader.name)" :hint="cheader.hasOwnProperty('description') ? formatInfo(cheader.description) : undefined" :rules="[testPattern]" persistent-hint></v-text-field>
      </template>
    </template>
    <template v-else>
      <v-row no-gutters>
        <v-col cols="12" align="center">
          <v-icon color="warning" large>mdi-alert</v-icon>
        </v-col>
        <v-col cols="12" align="center">
          <span class="text-subtitle-1 font-weight-light primary--text">Field doesn't have a pattern.</span>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script>
import floParserView from "~/components/widgets/floParserView.vue";
import floBitmask from "~/components/virtual/floBitmask.vue";
import floPlmn from "~/components/widgets/floPlmn.vue";
import floTimeParser from "~/components/widgets/floTimeParser.vue";
import floGsmPlmnAct from "~/components/widgets/floGsmPlmnAct.vue";
import floEnum from "~/components/virtual/floEnum.vue";
import helpers from "~/src/helpers.js";
export default {
  name: "flo-virtual-field-edit",
  components: { floBitmask, floEnum, floPlmn, floGsmPlmnAct, floParserView, floTimeParser },
  data: function () {
    return {
      helpers,
      dvalue: this.value,
      dheader: this.header,
    };
  },
  props: {
    // v-model prop is always value
    value: {
      type: [String, Number, Object, Array, Boolean],
      required: false,
    },
    index: {
      type: [String, Number],
      required: false,
    },
    header: {
      type: Object,
      required: true,
    },
    uicc: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    translator: {
      type: [Object],
      required: false,
    },
  },
  computed: {
    cvalue: {
      get() {
        let value = this.value;
        let pattern = this.findPattern();
        let typeMap = {
          bool: (value) => !!value,
          unsigned: (value) => parseInt(value, 16),
          ipv4: (value) => helpers.hexToIp(value),
          len_str: (value) => helpers.asciiHexToUi(value),
          len_bcd: (value) => helpers.bcdAsciiHexToUi(value),
          report_sms_dest: (value) => helpers.bcdAsciiHexToUi(value),
          nop: (value) => (this.header.key == "name" ? helpers.asciiHexToUi(value) : value),
        };

        let match = Object.keys(typeMap).find((key) => pattern.includes(key));
        return match ? typeMap[match](value) : value;
      },
      set(param) {
        this.dvalue = param;
      },
    },
    cheader: {
      get() {
        return this.dheader;
      },
      set(param) {
        this.dheader = param;
      },
    },
  },
  methods: {
    needsTranslation(key) {
      if (typeof this.translator === "undefined" || this.translator === null) {
        return false;
      }

      return this.translator.hasTranslator(key);
    },
    testPattern(value) {
      let header = this.cheader;
      if (header.hasOwnProperty("nullable")) {
        if (header.nullable == false && !header.hasOwnProperty("default")) {
          if (value === null || value == "") {
            return `Validation failed, field must have a value.`;
          }
        }
      }
      if (header.hasOwnProperty("min")) {
        if (value < header.min) {
          return `Validation failed, value ${value} is less than ${header.min}.`;
        }
      }
      if (header.hasOwnProperty("max")) {
        if (value > header.max) {
          return `Validation failed, value ${value} is bigger than ${header.max}.`;
        }
      }
      if (header.hasOwnProperty("len")) {
        let l_val = value;
        let pattern = this.findPattern();
        if (pattern.endsWith("time")) {
          l_val = this.dvalue.replaceAll(":", "");
        }
        if (pattern.endsWith("ipv4")) {
          l_val = this.dvalue.replaceAll(".", "");
        }

        if (l_val.length > header.len * 2) {
          return `Validation failed, total length cannot exceed ${header.len == 1 ? `${header.len} byte` : `${header.len} bytes`}.`;
        }
      }
      return true;
    },
    formatInfo(info) {
      let linfo = "";
      if (undefined != this.index && `${this.index}`.length > 1) {
        linfo = `${info} ${this.index}`;
      } else {
        linfo = info;
      }
      linfo = helpers.capitalizeFLetter(linfo);

      return linfo;
    },
    findPattern() {
      return this.header && this.header.pattern ? this.header.pattern : false;
    },
    onChange(event) {
      this.$emit("change", event);
    },
    onSimpleChange(event) {
      this.dvalue = event;
      let pattern = this.findPattern();
      if (pattern.endsWith("ipv4")) {
        this.$emit("change", helpers.ipToHex(this.dvalue));
      } else if (pattern.endsWith("len_str")) {
        let l_bcd_hex = helpers.ascToBcdAsc(this.dvalue);
        let l_len = l_bcd_hex.length / 2;
        let l_bcd_len_hex = helpers.padHex(l_len, 2);
        let l_suffix_f = "F".repeat((this.header.len - 1 - l_len) * 2);
        let l_final = l_bcd_len_hex + l_bcd_hex + l_suffix_f;
        this.$emit("change", l_final);
      } else if (pattern.endsWith("report_sms_dest") || pattern.endsWith("len_bcd")) {
        let l_bcd_hex = helpers.ascToBcdAsc(this.dvalue);
        let l_len = l_bcd_hex.length / 2;
        let l_bcd_len_hex = helpers.padHex(l_len, 2);
        let l_suffix_f = "F".repeat((this.header.len - 1 - l_len) * 2);
        let l_final = l_bcd_len_hex + l_bcd_hex + l_suffix_f;
        this.$emit("change", l_final);
      } else if (pattern.endsWith("nop")) {
        if (this.header.key == "name") {
          let l_asc_hex = helpers.ascToHexAsc(this.dvalue);
          let l_len = l_asc_hex.length / 2;
          let l_asc_len_hex = helpers.padHex(l_len, 2);
          let l_suffix_f = "F".repeat((this.header.len - 1 - l_asc_hex * 2) * 2);
          let l_final = l_asc_len_hex + l_asc_hex + l_suffix_f;
          this.$emit("change", l_final);
        } else {
          this.$emit("change", this.dvalue);
        }
      } else {
        this.$emit("change", this.dvalue);
      }
    },
  },
};
</script>
