<template>
  <div class="flo-spn-parser">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col cols="6" class="pa-1">
          <v-switch v-model="b1" @change="setDisplayBytes()" :true-value="'1'" :false-value="'0'" :disabled="disabled" label="Display of Registered PLMN at Home" color="success" inset persistent-hint outlined></v-switch>
        </v-col>
        <v-col cols="6" class="pa-1">
          <v-switch v-model="b2" @change="setDisplayBytes()" :true-value="'0'" :false-value="'1'" :disabled="disabled" label="Display of the SPN when Roaming" color="success" inset persistent-hint outlined></v-switch>
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col cols="6" class="pa-1"> <v-text-field v-model="value" label="SPN" hint="Raw Service Provider Name" disabled persistent-hint></v-text-field></v-col>
        <v-col cols="6" class="pa-1"><v-text-field :value="getSpn()" @change="setSpn($event)" :rules="[validate]" :disabled="disabled" :label="`Parsed ${label}`" :hint="`Parsed ${hint}`" persistent-hint> </v-text-field></v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
import helpers from "~/src/helpers.js";
export default {
  name: "flo-spn-parser",
  data: () => ({
    helpers,
    b1: "1",
    b2: "0",
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
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      this.getDisplayBytes();
    },
    getSpn() {
      if (!this.value || this.value.startsWith("FF")) return this.value;
      let value = this.value.replace(/F+$/, "");
      return helpers.hexAscToAsc(value.slice(2));
    },
    setSpn(event) {
      let [, , length] = this.row.pattern.split(":");
      let [min, max] = this.formatMinMax(length);

      if (event) {
        this.$emit("input", `${this.getBinaryBytes()}${helpers.ascToHexAsc(event)}`.padEnd(max * 2, "F"));
      } else {
        this.$emit("input", `${this.getBinaryBytes()}`.padEnd(max * 2, "F"));
      }
    },
    getBinaryBytes() {
      let binaryValue = `${this.b2}${this.b1}`;
      let hexValue = parseInt(binaryValue, 2).toString(16).toUpperCase();
      return hexValue.padStart(2, "0");
    },
    getDisplayBytes() {
      if (this.value && !this.value.startsWith("FF")) {
        let binaryBytes = parseInt(this.value.substring(0, 2), 16).toString(2).padStart(2, "0");
        this.b2 = binaryBytes[0];
        this.b1 = binaryBytes[1];
      }
    },
    setDisplayBytes() {
      this.$emit("input", `${this.getBinaryBytes()}${this.value.substring(2)}`);
    },
    validate() {
      let [, encoding, length] = this.row.pattern.split(":");

      if (!encoding && !length) {
        return false;
      }
      let [min, max] = this.formatMinMax(length);
      let patterns = {
        hex: {
          pattern: length == "even" ? new RegExp(`^(..)*$`) : new RegExp(`^[0-9A-F]{${max * 2}}$`),
          message: length == "even" ? `Accepted field length is even ${encoding.toUpperCase()} value.` : `Accepted field length is ${max * 2} ${encoding.toUpperCase()} value.`,
        },
      };
      let { pattern, message } = patterns[encoding];

      return pattern ? pattern.test(this.value) || message : "Invalid encoding type.";
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
