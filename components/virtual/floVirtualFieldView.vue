<template>
  <div class="flo-virtual-field-view">
    <template v-if="findPattern()">
      <flo-field-label v-if="findPattern().endsWith('bool')" :value="cvalue" :hint="cheader.hasOwnProperty('description') ? formatInfo(cheader.description) : undefined">
        <template v-slot:value="{ value }">
          <v-chip class="ma-1" :color="value === true ? 'success' : ''" label>{{ value === true ? "ON" : "OFF" }}</v-chip>
        </template>
      </flo-field-label>
      <template v-else-if="findPattern().endsWith('enum')">
        <flo-enum v-model="cvalue" :hint="cheader.hasOwnProperty('description') ? formatInfo(cheader.description) : undefined" :items="cheader.enum" :disabled="true" />
      </template>
      <template v-else-if="findPattern().endsWith('bitmask')">
        <flo-bitmask v-model="cvalue" :hint="cheader.hasOwnProperty('description') ? formatInfo(cheader.description) : undefined" :items="cheader.bitmask" :disabled="true" />
      </template>
      <template v-else-if="findPattern().endsWith('plmn')">
        <flo-plmn :value="cvalue" :daloc="true" :swapped="true" :disabled="true" :label="formatInfo(cheader.name)" :hint="cheader.hasOwnProperty('description') ? formatInfo(cheader.description) : undefined" />
      </template>
      <template v-else-if="findPattern().endsWith('gsma_plmn')">
        <flo-plmn :value="cvalue" :swapped="true" :disabled="true" :label="formatInfo(cheader.name)" :hint="cheader.hasOwnProperty('description') ? formatInfo(cheader.description) : undefined" />
      </template>
      <template v-else-if="findPattern().endsWith('gsma_plmn_wact')">
        <flo-gsm-plmn-act :value="cvalue" :swapped="false" :disabled="true" :label="formatInfo(cheader.name)" :hint="cheader.hasOwnProperty('description') ? formatInfo(cheader.description) : undefined" />
      </template>
      <template v-else-if="['ust', 'spn', 'pnn', 'sume', 'len_apn'].some((s) => findPattern().includes(s))">
        <flo-parser-view v-if="uicc" v-model="cvalue" :row="cheader" :header="cheader" :disabled="true" :required_mask="uicc.required_mask" :available_mask="uicc.available_mask" />
      </template>
      <template v-else>
        <flo-field-label :value="cvalue" :hint="cheader.hasOwnProperty('description') ? formatInfo(cheader.description) : undefined"></flo-field-label>
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
import floGsmPlmnAct from "~/components/widgets/floGsmPlmnAct.vue";
import floPlmn from "~/components/widgets/floPlmn.vue";
import floBitmask from "~/components/virtual/floBitmask.vue";
import floEnum from "~/components/virtual/floEnum.vue";
import helpers from "~/src/helpers.js";
export default {
  name: "flo-virtual-field-view",
  components: { floParserView, floBitmask, floEnum, floPlmn, floGsmPlmnAct },
  data: function () {
    return {
      helpers,
      password: false,
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
  },
  computed: {
    cvalue: {
      get() {
        let value = this.value;
        let pattern = this.findPattern();
        let typeMap = {
          bool: (value) => !!value,
          time: (value) => helpers.formatTime(value),
          unsigned: (value) => parseInt(value, 16),
          ipv4: (value) => helpers.hexToIp(value),
          lenstr: (value) => helpers.asciiHexToUi(value),
          report_sms_dest: (value) => helpers.bcdAsciiHexToUi(value),
          nop: (value) => (this.header.key == "name" ? helpers.asciiHexToUi(value) : value),
        };

        let match = Object.keys(typeMap).find((key) => pattern.includes(key));
        return match ? typeMap[match](value) : value;
      },
      set(param) {
        this.dvalue = param;
        this.$emit("input", this.dvalue);
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
  },
};
</script>
