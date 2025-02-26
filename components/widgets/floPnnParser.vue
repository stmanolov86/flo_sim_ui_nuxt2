<template>
  <div class="flo-pnn-parser">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col cols="6" class="pa-1">
          <v-select :value="full_type" :items="encoding_type.items" :label="encoding_type.label" :disabled="disabled" @change="setPnnEncoding($event, 'full_type')" item-text="value" item-value="key" dense outlined></v-select>
          <v-text-field :value="full_name" @input="setPnnText($event, 'full_name')" label="Full Name" hint="Full Name" :disabled="disabled"></v-text-field>
        </v-col>
        <v-col cols="6" class="pa-1">
          <v-select :value="short_type" :items="encoding_type.items" :label="encoding_type.label" :disabled="disabled" @change="setPnnEncoding($event, 'short_type')" item-text="value" item-value="key" persistent-hint dense outlined></v-select>
          <v-text-field :value="short_name" @input="setPnnText($event, 'short_name')" label="Short Name" hint="Short Name" :disabled="full_name == '' || disabled" persistent-hint></v-text-field>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="12" class="pa-1"> <v-text-field :value="pnn_value" label="PNN Value" hint="PNN Raw Value" disabled persistent-hint></v-text-field></v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
import helpers from "~/src/helpers.js";
export default {
  name: "flo-pnn-parser",
  data: () => ({
    helpers,
    full_type: "",
    full_name: "",
    short_type: "",
    short_name: "",
    pnn_value: "",
    encoding_type: {
      value: "",
      label: "Encoding Type",
      items: [
        { key: "gsm_7bit", value: "GSM 7Bit" },
        { key: "ucs2_16bit", value: "UCS-2 UTF16 Big Endian" },
      ],
    },
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
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      if (this.value) {
        this.pnn_value = this.value;
        let l_tlvs = helpers.parseTLV(this.value);

        if (l_tlvs) {
          for (let idx = 0; idx < l_tlvs.length; idx++) {
            const l_tlv = l_tlvs[idx];
            console.log(`flo-pnn-parser - initialize - l_tlv: ${JSON.stringify(l_tlv)}`);
            let l_tag = l_tlv.tag;
            let l_display = this.getPnnDisplay(l_tlv.value);
            if (l_tag == "43") {
              console.log(`flo-pnn-parser - initialize - tag: ${l_tag}, value: ${l_tlv.value}, type: ${l_display.type}, str: ${l_display.str}`);
              this.full_type = l_display.type;
              this.full_name = l_display.str;
            } else if (l_tag == "45") {
              console.log(`flo-pnn-parser - initialize - tag: ${l_tag}, value: ${l_tlv.value}, type: ${l_display.type}, str: ${l_display.str}`);
              this.short_type = l_display.type;
              this.short_name = l_display.str;
            }
          }
        }
      }
    },
    packSevenBitWithSeptets(inputString) {
      let bytes = helpers.packSevenBit(inputString);
      let parts = {
        septets: bytes.length,
        bytes: bytes,
      };
      return parts;
    },
    getPnnDisplay(p_ascii_hex) {
      // Remove the first byte, which is the number of septets
      let l_display = {
        type: "",
        str: "",
      };

      let l_display_byte_hex = p_ascii_hex.substring(0, 2);
      let l_display_hex = p_ascii_hex.substring(2);
      console.log(`flo-pnn-parser - getPnnDisplay - l_display_byte_hex: ${JSON.stringify(l_display_byte_hex)}`);
      console.log(`flo-pnn-parser - getPnnDisplay - l_display_hex: ${JSON.stringify(l_display_hex)}`);

      let l_display_byte = parseInt(l_display_byte_hex, 16);
      if ((l_display_byte & 0x10) != 0) {
        l_display.type = "ucs2_16bit";
        l_display.str = helpers.utf16BEBytesToUtf8(helpers.hexStringToByteArray(l_display_hex));
        console.log(`flo-pnn-parser - ucs2_16bit ${l_display.str}`);
      } else {
        l_display.type = "gsm_7bit";
        l_display.str = helpers.unpackSevenBit(helpers.hexStringToByteArray(l_display_hex));
        console.log(`flo-pnn-parser - gsm_7bit ${l_display.str}`);
      }

      return l_display;
    },
    setPnnEncoding(event, type) {
      if (type == "short_type") {
        this.short_type = event;
      } else if (type == "full_type") {
        this.full_type = event;
      }
      this.setPnn();
    },
    setPnnText(event, name) {
      if (name == "short_name") {
        this.short_name = event;
      } else if (name == "full_name") {
        this.full_name = event;
      }
      this.setPnn();
    },
    setPnn() {
      let l_pnn_bytes = [];
      if (this.full_name != "") {
        l_pnn_bytes = l_pnn_bytes.concat([0x43]);
        console.log(`flo-pnn-parser - setPnn - l_pnn_bytes: ${JSON.stringify(l_pnn_bytes)}`);
        console.log(`flo-pnn-parser - setPnn - this.full_type: ${JSON.stringify(this.full_type)}`);
        if ("ucs2_16bit" == this.full_type) {
          let l_display_byte = 0x10;
          console.log(`flo-pnn-parser - setPnn - ucs2_16bit l_display_byte: ${JSON.stringify(l_display_byte)}`);
          let l_value_bytes = helpers.utf8ToUtf16BEBytes(this.full_name);
          console.log(`flo-pnn-parser - setPnn - ucs2_16bit l_value_bytes: ${JSON.stringify(l_value_bytes)}`);
          let l_value_hex = helpers.byteArrayToHexString(l_value_bytes);
          console.log(`flo-pnn-parser - setPnn - ucs2_16bit l_value_hex: ${JSON.stringify(l_value_hex)}`);
          l_pnn_bytes = l_pnn_bytes.concat([l_value_bytes.length + 1]);
          l_pnn_bytes = l_pnn_bytes.concat([l_display_byte]);
          l_pnn_bytes = l_pnn_bytes.concat(l_value_bytes);
          console.log(`flo-pnn-parser - setPnn - ucs2_16bit l_pnn_bytes: ${JSON.stringify(l_pnn_bytes)}`);
        } else {
          let l_parts = this.packSevenBitWithSeptets(this.full_name);
          console.log(`flo-pnn-parser - setPnn - l_parts: ${JSON.stringify(l_parts)}`);
          let l_display_byte = 0x00;
          l_display_byte |= l_parts.septets;
          let l_value_bytes = l_parts.bytes;
          l_pnn_bytes = l_pnn_bytes.concat([l_value_bytes.length + 1]);
          l_pnn_bytes = l_pnn_bytes.concat([l_display_byte]);
          console.log(`flo-pnn-parser - setPnn - l_pnn_bytes += [l_display_byte]: ${JSON.stringify(l_pnn_bytes)}`);
          l_pnn_bytes = l_pnn_bytes.concat(l_value_bytes);
          console.log(`flo-pnn-parser - setPnn - l_pnn_bytes += l_value_bytes: ${JSON.stringify(l_pnn_bytes)}`);
        }
      }
      if (this.short_name != "") {
        l_pnn_bytes = l_pnn_bytes.concat([0x45]);
        if ("ucs2_16bit" == this.short_type) {
          let l_display_byte = 0x10;
          console.log(`flo-pnn-parser - setPnn - ucs2_16bit l_display_byte: ${JSON.stringify(l_display_byte)}`);
          let l_value_bytes = helpers.utf8ToUtf16BEBytes(this.short_name);
          console.log(`flo-pnn-parser - setPnn - ucs2_16bit l_value_bytes: ${JSON.stringify(l_value_bytes)}`);
          let l_value_hex = helpers.byteArrayToHexString(l_value_bytes);
          console.log(`flo-pnn-parser - setPnn - ucs2_16bit l_value_hex: ${JSON.stringify(l_value_hex)}`);
          l_pnn_bytes = l_pnn_bytes.concat([l_value_bytes.length + 1]);
          l_pnn_bytes = l_pnn_bytes.concat([l_display_byte]);
          l_pnn_bytes = l_pnn_bytes.concat(l_value_bytes);
          console.log(`flo-pnn-parser - setPnn - ucs2_16bit l_pnn_bytes: ${JSON.stringify(l_pnn_bytes)}`);
        } else {
          let l_parts = this.packSevenBitWithSeptets(this.short_name);
          let l_display_byte = 0x00;
          l_display_byte |= l_parts.septets;
          let l_value_bytes = l_parts.bytes;
          l_pnn_bytes = l_pnn_bytes.concat([l_value_bytes.length + 1]);
          l_pnn_bytes = l_pnn_bytes.concat([l_display_byte]);
          l_pnn_bytes = l_pnn_bytes.concat(l_value_bytes);
        }
      }
      console.log(`flo-pnn-parser - setPnn - l_pnn_bytes: ${JSON.stringify(l_pnn_bytes)}`);
      let l_pnn_hex = helpers.byteArrayToHexString(l_pnn_bytes);
      console.log(`flo-pnn-parser - setPnn - l_pnn_hex: ${JSON.stringify(l_pnn_hex)}`);
      let l_pnn_hex_padded = l_pnn_hex;

      console.log(`flo-pnn-parser - setPnn - after - l_pnn_hex_padded: ${JSON.stringify(l_pnn_hex_padded)}`);
      this.pnn_value = l_pnn_hex_padded;
      console.log(`flo-pnn-parser - setPnn - after - pnn_value: ${JSON.stringify(this.pnn_value)}`);
      let [, , length] = this.row.pattern.split(":");
      if (this.pnn_value.length < length * 2) {
        this.pnn_value = this.pnn_value.padEnd(length * 2, "F");
      } else if (this.pnn_value.length > length * 2) {
        this.pnn_value = this.pnn_value.slice(0, length * 2);
      }

      this.$emit("input", this.pnn_value);
    },
  },
};
</script>
