<template>
  <div class="flo-parser-view">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col cols="12">
          <v-text-field v-model="raw" :disabled="disabled" :rules="[validate]" :label="formatLabel(header)" :hint="`Raw ${formatInfo()}`" :error="error" :error-messages="errorMessage" persistent-hint counter>
            <template v-slot:append-outer>
              <v-btn icon @click="openDialog()">
                <v-icon color="primary">mdi-calculator</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </v-col>
      </v-row>

      <v-dialog :overlay-opacity="0.4" v-model="dialog" max-width="800px" scrollable>
        <v-card flat>
          <v-card-title>
            <span class="headline">{{ formatInfo() }} Calculator</span>
          </v-card-title>

          <v-card-text>
            <v-row :key="redraw" no-gutters>
              <v-col v-if="formatPattern().type == 'ef_ust'" cols="12" class="ma-1 pa-1">
                <flo-ust-parser v-model="parsed" :row="row" :disabled="disabled" :available_mask="available_mask || 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'" :required_mask="required_mask || '00000000000000000000000000000000000000'" />
              </v-col>
              <v-col v-else-if="formatPattern().type == 'ef_pnn'" cols="12" class="pa-1">
                <flo-pnn-parser v-model="parsed" :row="row" :disabled="disabled" />
              </v-col>
              <v-col v-else-if="formatPattern().type == 'ef_sume'" cols="12" class="pa-1">
                <flo-sume-parser v-model="parsed" :row="row" :disabled="disabled" />
              </v-col>
              <v-col v-else-if="['as_spn', 'as_sume', 'tag_apn', 'len_apn'].includes(formatPattern().type)" cols="12" class="pa-1">
                <flo-ascii-hex-parser v-model="parsed" :row="row" :disabled="disabled" :label="formatLabel(header)" :hint="formatInfo()" />
              </v-col>
              <v-col v-else-if="['ef_spn'].includes(formatPattern().type)" cols="12" class="pa-1">
                <flo-spn-parser v-model="parsed" :row="row" :disabled="disabled" :label="formatLabel(header)" :hint="formatInfo()" />
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn color="primary" text @click="cancel()">Cancel</v-btn>
            <v-btn color="primary" text @click="save()" :disabled="disabled">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script>
import helpers from "~/src/helpers.js";
import floUstParser from "~/components/widgets/floUstParser.vue";
import floAsciiHexParser from "~/components/widgets/floAsciiHexParser.vue";
import floSpnParser from "~/components/widgets/floSpnParser.vue";
import floPnnParser from "~/components/widgets/floPnnParser.vue";
import floSumeParser from "~/components/widgets/floSumeParser.vue";
export default {
  name: "flo-parser-view",
  components: {
    floUstParser,
    floSpnParser,
    floSumeParser,
    floAsciiHexParser,
    floPnnParser,
  },
  data: () => ({
    helpers,
    dialog: false,
    parsed: "",
    redraw: 0,
    error: false,
    errorMessage: "",
  }),
  props: {
    value: {
      type: [String, Array],
      required: true,
    },
    required_mask: {
      type: String,
      required: false,
    },
    available_mask: {
      type: String,
      required: false,
    },
    row: {
      type: Object,
      required: true,
    },
    header: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    raw: {
      get() {
        return this.value;
      },
      set(val) {
        let { length, type } = this.formatPattern();
        let [min, max] = this.formatMinMax(length);
        let lengthHex = max.toString(16).toUpperCase();
        if (val == "") {
          let empty = {
            as_spn: lengthHex,
            as_sume: "8500",
            ef_sume: "8500",
            ef_pnn: "FF",
            ef_spn: "FF",
          };

          if (type == "tag_apn") {
            this.$emit("input", "00");
          } else if (type == "ef_ust") {
            this.$emit("input", val);
          } else {
            this.$emit("input", empty[type].padEnd(max * 2, "F") || val);
          }
        } else {
          this.$emit("input", val);
        }
      },
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      if (this.value) {
        this.parsed = this.value;
      }
    },
    formatLabel(header) {
      return header.text || header.desc || header.description;
    },
    formatInfo() {
      let { suffix } = this.formatPattern();
      let info = {
        ust: "Universal Subscriber Identity Module",
        sume: "STK User Menu Name",
        spn: "Service Provider Name",
        pnn: "PLMN Network Name",
        apn: "Access Point Name",
      };

      return info[suffix] || "Default Value";
    },
    formatPattern() {
      let [parse, encoding, length, type] = this.row.pattern.split(":");
      let suffix = type.split("_").pop();

      let typeMap = {
        ust: "ust",
        pnn: "pnn",
        spn: "spn",
        sume: "sume",
        apn: "apn",
      };

      return { parse, encoding, length, type: type, suffix: typeMap[suffix] };
    },
    formatMinMax(length) {
      let min = 0;
      let max = undefined;
      if (length.includes(",")) {
        [min, max] = length.split(",").map(Number);
      } else if (length === "0") {
        max = undefined;
      } else {
        min = max = Number(length);
      }
      return [min, max];
    },
    openDialog() {
      this.parsed = this.value;
      this.redraw++;
      this.dialog = true;
    },
    cancel() {
      this.parsed = this.value;
      this.dialog = false;
      this.redraw++;
    },
    save() {
      this.$emit("input", this.parsed);
      this.dialog = false;
      this.redraw++;
    },
    validate() {
      let { encoding, length, type } = this.formatPattern();
      if (!encoding && !length) {
        return false;
      }

      if (/^F+$/.test(this.raw)) {
        return true;
      }

      let [min, max] = this.formatMinMax(length);

      let patterns = {
        hex: {
          pattern: length == "even" ? new RegExp(`^(..)*$`) : max == undefined ? new RegExp(`^[0-9A-F]*$`) : new RegExp(`^[0-9A-F]{${min * 2},${max * 2}}$`),
          message: length == "even" ? `Accepted field length is even ${encoding.toUpperCase()} value.` : max == undefined ? `Accepted field type is ${encoding.toUpperCase()}.` : min === max ? `Accepted field length is ${max * 2} ${encoding.toUpperCase()} value.` : `Accepted field length is between ${min * 2} and ${max * 2} ${encoding.toUpperCase()} characters.`,
        },
        ef_spn: {
          pattern: new RegExp(`^(00|01|02|03)[0-9A-F]{${max * 2 - 2}}$`),
          message: `Accepted display conditions are 00, 01, 02 & 03, and the field length is ${max * 2} ${encoding.toUpperCase()} value.`,
        },
      };

      let { pattern, message } = patterns[type] || patterns[encoding];
      let valid = pattern ? pattern.test(this.raw) : false;

      this.error = !valid;
      this.errorMessage = valid ? "" : message;

      return valid;
    },
  },
};
</script>
