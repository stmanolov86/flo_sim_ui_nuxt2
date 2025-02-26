<template>
  <div class="flo-seven-bit-parser">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col cols="6" class="pa-1"> <v-text-field v-model="full_name" @input="setSevenBit($event, '43')" label="Full Name" hint="Full Name" :disabled="disabled" persistent-hint></v-text-field></v-col>
        <v-col cols="6" class="pa-1"><v-text-field v-model="short_name" @input="setSevenBit($event, '45')" label="Short Name" hint="Short Name" :disabled="full_name == '' || disabled" persistent-hint></v-text-field></v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="12" class="pa-1"> <v-text-field v-model="sevenBit" label="Seven Bit" hint="Seven Bit Raw Value" disabled persistent-hint></v-text-field></v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
import helpers from "~/src/helpers.js";
export default {
  name: "flo-seven-bit-parser",
  data: () => ({
    helpers,
    full_name: "",
    short_name: "",
  }),
  props: {
    // v-model prop is always value
    value: {
      type: String,
      required: true,
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
    sevenBit: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      if (this.value) {
        let parsed = helpers.parseTLV(this.sevenBit);
        if (parsed) {
          parsed.forEach((f) => {
            console.log(`flo-seven-bit-parser - initialize - f: ${JSON.stringify(f)}`);
            let tag = f.tag;
            let unpacked = this.unpackSevenBitWithSeptets(f.value);
            if (tag == "43") {
              console.log(`flo-seven-bit-parser - initialize - tag: ${f.tag}, value: ${f.value}, unpacked: ${unpacked}`);
              this.full_name = unpacked;
            } else if (tag == "45") {
              console.log(`flo-seven-bit-parser - initialize - tag: ${f.tag}, value: ${f.value}, unpacked: ${unpacked}`);
              this.short_name = unpacked;
            }
          });
        }
      }
    },
    packSevenBitWithSeptets(inputString) {
      let bytes = helpers.packSevenBit(inputString);
      let parts = {
        septets: bytes.length + 0x80,
        bytes: bytes,
      };
      return parts;
    },
    unpackSevenBitWithSeptets(asciiHex) {
      // Remove the first byte, which is the number of septets
      let asciiHexWithoutSeptets = asciiHex.slice(2);
      console.log(`flo-seven-bit-parser - unpackSevenBitWithSeptets - asciiHex: ${JSON.stringify(asciiHex)}`);
      console.log(`flo-seven-bit-parser - unpackSevenBitWithSeptets - asciiHexWithoutSeptets: ${JSON.stringify(asciiHexWithoutSeptets)}`);
      let bytesWithoutSeptets = helpers.hexStringToByteArray(asciiHexWithoutSeptets);
      console.log(`flo-seven-bit-parser - unpackSevenBitWithSeptets - bytesWithoutSeptets: ${JSON.stringify(bytesWithoutSeptets)}`);
      return helpers.unpackSevenBit(bytesWithoutSeptets);
    },
    setSevenBit(event, tag) {
      if (event == "") {
        let value = this.value;

        let fullIdx = value.indexOf("43");
        if (tag == "43" && fullIdx !== -1) {
          let endIdx = value.indexOf("45", fullIdx + 2) !== -1 ? value.indexOf("45", fullIdx + 2) : value.length;
          value = value.substring(0, fullIdx) + "F".repeat(endIdx - fullIdx) + value.substring(endIdx);
        }

        let shortIdx = value.indexOf("45");
        if (shortIdx !== -1) {
          value = value.substring(0, shortIdx) + "F".repeat(value.length - shortIdx);
          this.short_name = "";
        }

        this.sevenBit = value;
        return;
      }
      let packed = this.packSevenBitWithSeptets(event);
      console.log(`flo-seven-bit-parser - setSevenBit - packed: ${JSON.stringify(packed)}`);
      let combined = [packed.septets].concat(packed.bytes);
      console.log(`flo-seven-bit-parser - setSevenBit - combined: ${JSON.stringify(combined)}`);
      let val = helpers.byteArrayToHexString(combined);
      console.log(`flo-seven-bit-parser - setSevenBit - val: ${val}`);
      let len = val.length / 2;
      this.sevenBit = this.formatSevenBit(tag, len, val);
    },
    formatSevenBit(tag, len, val) {
      console.log(`flo-seven-bit-parser - formatSevenBit - sevenBit: ${this.sevenBit}`);
      console.log(`flo-seven-bit-parser - formatSevenBit - tag: ${tag}, len: ${len}, val: ${val}`);

      let parsed = helpers.parseTLV(this.sevenBit);
      console.log(`flo-seven-bit-parser - formatSevenBit - parsed: ${JSON.stringify(parsed)} `);

      if (!parsed.some((f) => f.tag == tag)) {
        parsed.push({
          tag: tag,
          length: len,
          value: val,
        });
      } else {
        parsed.forEach((f) => {
          if (f.tag == tag) {
            f.length = len;
            f.value = val;
          }
        });
      }

      let stringify = helpers.stringifyTLV(parsed);
      let [, , length] = this.row.pattern.split(":");
      if (stringify.length < length * 2) {
        stringify = stringify.padEnd(length * 2, "F");
      } else if (stringify.length > length * 2) {
        stringify = stringify.slice(0, length * 2);
      }

      console.log(`flo-seven-bit-parser - formatSevenBit - stringify: ${stringify}`);
      return stringify;
    },
  },
};
</script>
