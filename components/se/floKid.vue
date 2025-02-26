<template>
  <v-container fluid class="ma-0 pa-0">
    <v-row no-gutters>
      <v-col cols="12">
        <template v-if="preferred">
          <v-card flat outlined class="ma-0 pa-0">
            <v-card-text class="ma-0 pa-0">
              <v-row no-gutters>
                <v-col cols="12" class="pa-1">
                  <p class="align-center font-weight-regular title mx-2">
                    <v-chip label>KID: {{ cvalue }}</v-chip>
                  </p>

                  <p class="text-subtitle-1 font-weight-light ma-0 pa-0">
                    <span class="info--text">General:</span>
                    <span>{{ find_name_by_key(kid_algorithm_enum, kid_algorithm) }},</span>
                    <span v-if="kid_algorithm == '01'">{{ find_name_by_key(kid_spec_des_enum, kid_spec) }},</span>
                    <span v-if="kid_algorithm == '10'">{{ find_name_by_key(kid_spec_aes_enum, kid_spec) }}</span>
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </template>
        <flo-expand v-else title="KID" :open="false" elevation="5">
          <template v-slot:title="{ title }">
            <span class="align-center font-weight-regular title mx-2">
              <v-chip label>{{ title }}: {{ cvalue }}</v-chip>
              <v-chip label>{{ find_name_by_key(kid_algorithm_enum, kid_algorithm) }}</v-chip>
              <v-chip label v-if="kid_algorithm == '01'">{{ find_name_by_key(kid_spec_des_enum, kid_spec) }}</v-chip>
              <v-chip label v-if="kid_algorithm == '10'">{{ find_name_by_key(kid_spec_aes_enum, kid_spec) }}</v-chip>
            </span>
          </template>

          <template v-slot:content="{}">
            <v-container fluid class="ma-0 pa-0">
              <v-row no-gutters>
                <v-col cols="12" class="pa-1">
                  <v-text-field v-model="cvalue" label="KID" :rules="[testPattern]" @change="kid_text_changed($event)" :disabled="readonly || disabled" hint="Key & Algorithm Identifier For RC/CC/DS" outlined dense persistent-hint></v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" class="pa-1">
                  <v-container fluid class="ma-0 pa-0">
                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-card flat outlined>
                          <v-card-text class="ma-0 pa-0">
                            <v-container fluid class="ma-0 pa-0">
                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <p class="text-subtitle-1 ma-0 pa-0">General</p>
                                </v-col>
                              </v-row>
                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <v-select v-model="kid_algorithm" label="Algorithm" :items="kid_algorithm_enum" item-text="value" item-value="key" @change="kid_changed('kid_algorithm', $event)" :disabled="readonly || disabled" dense hide-details persistent-hint outlined></v-select>
                                </v-col>
                              </v-row>

                              <v-row v-if="kid_algorithm == '01'" no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <v-select v-model="kid_spec" label="DES Spec" :items="kid_spec_des_enum" item-text="value" item-value="key" @change="kid_changed('kid_spec', $event)" :disabled="readonly || disabled" dense hide-details persistent-hint outlined></v-select>
                                </v-col>
                              </v-row>

                              <v-row v-if="kid_algorithm == '10'" no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <v-select v-model="kid_spec" label="AES Spec" :items="kid_spec_aes_enum" item-text="value" item-value="key" @change="kid_changed('kid_spec', $event)" :disabled="readonly || disabled" dense hide-details persistent-hint outlined></v-select>
                                </v-col>
                              </v-row>

                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <v-select v-model="kid_key_index" label="Keyset" :items="kid_key_index_enum" item-text="value" item-value="key" @change="kid_changed('kid_key_index', $event)" :disabled="keyset != 0 || readonly || disabled" dense hide-details persistent-hint outlined></v-select>
                                </v-col>
                              </v-row>
                            </v-container>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-col>
              </v-row>
            </v-container>
          </template>
        </flo-expand>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "flo-kid",
  data() {
    return {
      dvalue: "12",
      // dheader: this.header,
      // dpattern: this.pattern,

      kid_algorithm_enum: [
        { key: "00", value: "Algorithm known implicitly by both entities" },
        { key: "01", value: "DES" },
        { key: "10", value: "AES" },
        { key: "11", value: "Proprietary Implementations" },
      ],
      kid_algorithm: "00",

      kid_spec_des_enum: [
        { key: "00", value: "Reserved for DES as defined in previous releases" },
        { key: "01", value: "Triple DES in outer-CBC mode using two different keys" },
        { key: "10", value: "Triple DES in outer-CBC mode using three different keys" },
        { key: "11", value: "Reserved for DES as defined in previous releases" },
      ],

      // kid_spec_des: "00",

      kid_spec_aes_enum: [
        { key: "00", value: "AES in CMAC mode" },
        { key: "01", value: "Reserved" },
        { key: "10", value: "Reserved" },
        { key: "11", value: "Reserved" },
      ],

      kid_spec: "00",

      kid_key_index_enum: [
        { key: "0000", value: "Keyset 0 - Reserved" },
        { key: "0001", value: "Keyset 1" },
        { key: "0010", value: "Keyset 2" },
        { key: "0011", value: "Keyset 3" },
        { key: "0100", value: "Keyset 4" },
        { key: "0101", value: "Keyset 5" },
        { key: "0110", value: "Keyset 6" },
        { key: "0111", value: "Keyset 7" },
        { key: "1000", value: "Keyset 8" },
        { key: "1001", value: "Keyset 9" },
        { key: "1010", value: "Keyset 10" },
        { key: "1011", value: "Keyset 11 - Reserved" },
        { key: "1100", value: "Keyset 12" },
        { key: "1101", value: "Keyset 13" },
        { key: "1110", value: "Keyset 14" },
        { key: "1111", value: "Keyset 15 - Reserved" },
      ],

      kid_key_index: "0000",
    };
  },
  props: {
    // v-model prop is always value
    value: {
      type: String,
      required: false,
    },
    keyset: {
      type: Number,
      required: false,
      default: 0,
    },
    pattern: {
      type: String,
      default: "",
    },
    preferred: {
      type: Boolean,
      default: false,
      required: false,
    },
    readonly: {
      type: Boolean,
      default: false,
      required: false,
    },
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  computed: {
    cvalue: {
      get() {
        return this.dvalue;
      },
      set(param) {
        this.dvalue = param;
        this.$emit("input", this.dvalue);
        this.$emit("change", this.dvalue);
      },
    },
  },
  created() {
    if (null != this.value) {
      this.dvalue = this.value;
    }
    this.parseKid(this.dvalue);
  },
  methods: {
    find_name_by_key(list, key) {
      let found = list.find((f) => f.key == key);
      if (!found) {
        return "";
      }

      return found.value;
    },
    pad(numStr, digits) {
      numStr = numStr.toString();
      while (numStr.length < digits) numStr = "0" + numStr;
      return numStr;
    },
    getBitsBit(b, bit) {
      return b.charAt(8 - bit);
    },
    getByteBits(b) {
      let bits = b.toString(2);
      bits = ("00000000" + bits).slice(-8);
      return bits;
    },
    getByteHex(s, o) {
      let bs = s.substr(o, 2);
      return parseInt(bs, 16);
    },
    parseKid(hexValue) {
      console.log(`flo-kid - parseKid - enter`);
      // 1. verify 4 bytes that are all hex
      if (hexValue.length != 2) {
        console.log(`flo-kid - parseKid - wrong length`);
        return;
      }
      // TODO: MATCH hex pattern

      // 2. get the first and second byte bits
      let first_byte = this.getByteHex(hexValue, 0);
      let first_byte_bits = this.getByteBits(first_byte);
      console.log(`flo-kid - parseKid - first - dec: ${first_byte} bits:${first_byte_bits}`);

      // let kid_algorithm_enum = [
      //   { key: "00", value: 'Algorithm known implicitly by both entities' },
      //   { key: "01", value: 'DES' },
      //   { key: "10", value: 'AES' },
      //   { key: "11", value: 'Proprietary Implementations' },
      // ];

      // First Byte
      // b2 b1 - Algorithm
      // 00: Algorithm known implicitly by both entities
      // 01: DES
      // 10: AES
      // 11: proprietary Implementations

      this.kid_algorithm = `${this.getBitsBit(first_byte_bits, 2)}${this.getBitsBit(first_byte_bits, 1)}`;

      // let kid_spec_des_enum = [
      //   { key: "00", value: 'Reserved for DES as defined in previous releases' },
      //   { key: "01", value: 'Triple DES in outer-CBC mode using two different keys' },
      //   { key: "10", value: 'Triple DES in outer-CBC mode using three different keys' },
      //   { key: "11", value: 'Reserved for DES as defined in previous releases' },
      // ];

      // b4 b5 - spec
      // If b2 b1 = 01 (DES), b4 b3 shall be coded as follows:
      //   00: Reserved for DES as defined in previous releases
      //   01: Triple DES in outer-CBC mode using two different keys
      //   10: Triple DES in outer-CBC mode using three different keys
      //   11: Reserved for DES as defined in previous releases

      // let kid_spec_aes_enum = [
      //   { key: "00", value: 'AES in CBC mode' },
      //   { key: "01", value: 'Reserved' },
      //   { key: "10", value: 'Reserved' },
      //   { key: "11", value: 'Reserved' },
      // ];

      // If b2 b1 = 10 (AES), b4 b3 shall be coded as follows:
      //   00: AES in CBC mode
      //   01, 10, 11: Reserved

      this.kid_spec = `${this.getBitsBit(first_byte_bits, 4)}${this.getBitsBit(first_byte_bits, 3)}`;

      // kid_key_index_enum = [
      //   {key: "000", value: "Key 0"},
      //   {key: "001", value: "Key 1"},
      //   {key: "010", value: "Key 2"},
      //   {key: "011", value: "Key 3"},
      //   {key: "100", value: "Key 4"},
      //   {key: "101", value: "Key 5"},
      //   {key: "110", value: "Key 6"},
      //   {key: "111", value: "Key 7"}
      // ]

      // b6,b7,b8 - index
      if (this.keyset == 0) {
        this.kid_key_index = `${this.getBitsBit(first_byte_bits, 8)}${this.getBitsBit(first_byte_bits, 7)}${this.getBitsBit(first_byte_bits, 6)}${this.getBitsBit(first_byte_bits, 5)}`;
      } else {
        let l_current = `${this.getBitsBit(first_byte_bits, 8)}${this.getBitsBit(first_byte_bits, 7)}${this.getBitsBit(first_byte_bits, 6)}${this.getBitsBit(first_byte_bits, 5)}`;
        let l_set = this.getByteBits(this.keyset);
        l_set = l_set.substr(4, 4);
        this.kid_key_index = l_set;
        if (l_current != l_set) {
          this.kid_changed("kid_key_index", l_set);
        }
      }
    },
    kid_text_changed(event) {
      console.log(`flo-kid - kid_text_changed - enter`);
      this.parseKid(event);
    },
    kid_changed() {
      console.log(`flo-kid - kid_changed - enter`);

      let first = `000${this.kid_key_index}${this.kid_spec}${this.kid_algorithm}`;
      console.log(`flo-kid - kid_changed - first: ${first}`);
      console.log(`flo-kid - kid_changed - hex: ${this.pad(parseInt(first, 2).toString(16), 2)}`);
      this.cvalue = this.pad(parseInt(first, 2).toString(16), 2);
    },

    testPattern(value) {
      // let header = this.header;
      // if (header.hasOwnProperty("nullable")) {
      //   if (header.nullable == false && !header.hasOwnProperty("default")) {
      //     if (value === null || value == "") {
      //       return "Validation failed, field must have a value.";
      //     }
      //   }
      // }
      // if (header.hasOwnProperty("min")) {
      //   if (value < header.min) {
      //     return `Validation failed, value ${value} is less than ${header.min}.`;
      //   }
      // }
      // if (header.hasOwnProperty("max")) {
      //   if (value > header.max) {
      //     return `Validation failed, value ${value} is bigger than ${header.max}.`;
      //   }
      // }
      // const spattern = this.pattern;
      // const lpattern = new RegExp(spattern);
      // return lpattern.test(value) || "Validation failed, value doesn't match pattern.";
      const spattern = this.pattern;
      const lpattern = new RegExp(spattern);
      return lpattern.test(value) || "Validation failed, value doesn't match pattern.";
    },
  },
};
</script>
