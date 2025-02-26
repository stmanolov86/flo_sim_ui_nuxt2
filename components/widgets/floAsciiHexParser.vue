<template>
  <div class="flo-ascii-hex-parser">
    <v-row no-gutters>
      <v-col cols="6" class="pa-1"> <v-text-field :value="value" disabled :label="`Raw ${label}`" :hint="`Raw ${hint}`" persistent-hint></v-text-field></v-col>
      <v-col cols="6" class="pa-1"> <v-text-field v-model="ascii" :rules="[validate]" :disabled="disabled" :label="`Parsed ${label}`" :hint="`Parsed ${hint}`" persistent-hint> </v-text-field></v-col>
    </v-row>
  </div>
</template>
<script>
import helpers from "~/src/helpers.js";
export default {
  name: "flo-ascii-hex-parser",
  data: () => ({
    helpers,
  }),
  props: {
    // v-model prop is always value
    value: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: false,
    },
    hint: {
      type: String,
      required: false,
    },
    row: {
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
    ascii: {
      get() {
        let [, , , type] = this.row.pattern.split(":");
        let val = this.value;

        if (type == "as_spn") {
          return helpers.hexAscToAsc(val.substring(2).replace(/FF/g, ""));
        } else if (type == "tag_apn") {
          return helpers.hexAscToUi(val);
        } else if (type == "len_apn") {
          let formatted = "";
          if (val.length > 2) {
            formatted = val.substring(2).replace(/(00)+$/, "");
            let hexLength = val.substr(0, 2);
            let totalLength = parseInt(hexLength, 16);

            if (val.length == totalLength * 2 + 2) {
              return helpers.hexAscToUi(formatted);
            }
          }

          return helpers.hexAscToUi(formatted);
        } else if (type == "as_sume") {
          if (val.startsWith("85")) {
            return helpers.hexAscToUi(val.substring(2));
          } else {
            return helpers.hexAscToUi(val);
          }
        } else {
          return val;
        }
      },
      set(val) {
        let [, , length, type] = this.row.pattern.split(":");
        let [min, max] = this.formatMinMax(length);
        let lengthHex = max.toString(16).toUpperCase();

        if (!val) {
          let emptyMap = {
            as_spn: lengthHex,
            as_sume: "00",
          };
          let empty = type == "tag_apn" ? "00" : (emptyMap[type] || "").padEnd(max * 2, "F");
          this.$emit("input", empty);
          return;
        }

        let typeMap = {
          as_spn: `${max.toString(16).toUpperCase()}${helpers.ascToHexAsc(val)}`,
          tag_apn: helpers.uiToHexAsc(val),
          as_sume: helpers.uiToHexAsc(val),
        };

        if (type == "tag_apn") {
          this.$emit("input", typeMap[type] || val);
        } else if (type == "len_apn") {
          let hexValue = helpers.uiToHexAsc(val);
          let hexLength = helpers.calculateHexLength(hexValue);
          let combined = `${hexLength}${hexValue}`.padEnd(max * 2, "0");
          this.$emit("input", combined);
        } else {
          this.$emit("input", typeMap[type].padEnd(max * 2, "F") || val);
        }
      },
    },
  },
  methods: {
    validate() {
      let [, encoding, length] = this.row.pattern.split(":");
      if (!encoding && !length) {
        return false;
      }

      let [min, max] = this.formatMinMax(length);
      let pattern = new RegExp(`^[0-9A-F]{${min * 2},${max * 2}}$`);
      let message = max === undefined ? `Accepted field length is unlimited ${encoding.toUpperCase()} value.` : min === max ? `Accepted field length is ${max * 2} ${encoding.toUpperCase()} value.` : `Accepted field length is between ${min * 2} and ${max * 2} ${encoding.toUpperCase()} characters.`;

      return pattern.test(this.value) || message;
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
  },
};
</script>
