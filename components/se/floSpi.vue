<template>
  <v-container fluid class="ma-0 pa-0">
    <v-row no-gutters>
      <v-col cols="12">
        <template v-if="preferred">
          <v-container fluid class="ma-0 pa-0">
            <v-card flat outlined class="ma-0 pa-0">
              <v-card-text class="ma-0 pa-0">
                <v-row no-gutters>
                  <v-col cols="12" class="pa-1">
                    <p class="align-center font-weight-regular title mx-2">
                      <v-chip label>{{ title }}: {{ cvalue }}</v-chip>
                    </p>

                    <p class="text-subtitle-1 font-weight-light ma-0 pa-1">
                      <span class="info--text">General:</span>
                      <span>{{ find_name_by_key(spi_checks_enum, spi_checks) }},</span>
                      <span> {{ find_name_by_key(spi_ciphering_enum, spi_ciphering) }},</span>
                      <span> {{ find_name_by_key(spi_counter_enum, spi_counter) }}</span>
                    </p>
                    <p class="text-subtitle-1 font-weight-light ma-0 pa-1">
                      <span class="info--text">POR:</span>
                      <span>{{ find_name_by_key(spi_por_mode_enum, spi_por_mode) }},</span>
                    </p>
                    <p class="text-subtitle-1 font-weight-light ma-0 pa-1">{{ find_name_by_key(spi_por_checks_enum, spi_por_checks) }},</p>
                    <p class="text-subtitle-1 font-weight-light ma-0 pa-1">{{ find_name_by_key(spi_por_ciphering_enum, spi_por_ciphering) }},</p>
                    <p class="text-subtitle-1 font-weight-light ma-0 pa-1">{{ find_name_by_key(spi_por_sms_enum, spi_por_sms) }}</p>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-container>
        </template>

        <flo-expand v-else :title="title" :open="false" elevation="5">
          <template v-slot:title="{ title }">
            <span class="align-center font-weight-regular title mx-2">
              <v-chip label>{{ title }}: {{ cvalue }}</v-chip>
            </span>
          </template>

          <template v-slot:content="{}">
            <v-container fluid class="ma-0 pa-0">
              <v-row no-gutters>
                <v-col cols="12" class="pa-1">
                  <v-text-field v-model="cvalue" label="SPI" :rules="[testPattern]" @change="spi_text_changed($event)" :disabled="readonly || disabled" hint="Security Parameter Indicator" outlined dense persistent-hint></v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12">
                  <v-container fluid class="ma-0 pa-0">
                    <v-row no-gutters>
                      <v-col cols="12" class="pa-1">
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
                                  <v-select v-model="spi_checks" label="Checks" :items="spi_checks_enum" item-text="value" item-value="key" @change="spi_changed('spi_checks', $event)" :disabled="readonly || disabled" dense hide-details persistent-hint outlined></v-select>
                                </v-col>
                              </v-row>

                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <v-select v-model="spi_ciphering" label="Ciphering" :items="spi_ciphering_enum" item-text="value" item-value="key" @change="spi_changed('spi_ciphering', $event)" :disabled="readonly || disabled" dense hide-details persistent-hint outlined></v-select>
                                </v-col>
                              </v-row>

                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <v-select v-model="spi_counter" label="Counter" :items="spi_counter_enum" item-text="value" item-value="key" @change="spi_changed('spi_counter', $event)" :disabled="readonly || disabled" dense hide-details persistent-hint outlined></v-select>
                                </v-col>
                              </v-row>
                            </v-container>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12" class="pa-1">
                        <v-card flat outlined>
                          <v-card-text class="ma-0 pa-0">
                            <v-container fluid class="ma-0 pa-0">
                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <p class="text-subtitle-1 ma-0 pa-0">PoR Setup</p>
                                </v-col>
                              </v-row>
                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <v-select v-model="spi_por_mode" label="Mode" :items="spi_por_mode_enum" item-text="value" item-value="key" @change="spi_changed('spi_por_mode', $event)" :disabled="readonly || disabled" dense hide-details persistent-hint outlined></v-select>
                                </v-col>
                              </v-row>

                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <v-select v-model="spi_por_checks" label="Checks" :items="spi_por_checks_enum" item-text="value" item-value="key" @change="spi_changed('spi_por_checks', $event)" :disabled="readonly || disabled" dense hide-details persistent-hint outlined></v-select>
                                </v-col>
                              </v-row>

                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <v-select v-model="spi_por_ciphering" label="Ciphering" :items="spi_por_ciphering_enum" item-text="value" item-value="key" @change="spi_changed('spi_por_ciphering', $event)" :disabled="readonly || disabled" dense hide-details persistent-hint outlined></v-select>
                                </v-col>
                              </v-row>

                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <v-select v-model="spi_por_sms" label="SMS" :items="spi_por_sms_enum" item-text="value" item-value="key" @change="spi_changed('spi_por_sms', $event)" :disabled="readonly || disabled" dense hide-details persistent-hint outlined></v-select>
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
import helpers from "~/src/helpers.js";
export default {
  name: "flo-spi",
  data() {
    return {
      helpers,
      dvalue: "0621",
      spi_checks_enum: [
        { key: "00", value: "No RC, CC or DS" },
        { key: "01", value: "Redundancy Check" },
        { key: "10", value: "Cryptographic Checksum" },
        { key: "11", value: "Digital Signature" },
      ],
      spi_checks: "00",

      spi_ciphering_enum: [
        { key: "0", value: "No Ciphering" },
        { key: "1", value: "Ciphering" },
      ],
      spi_ciphering: "0",

      spi_counter_enum: [
        { key: "00", value: "No counter" },
        { key: "01", value: "Counter available; no replay or sequence checking" },
        { key: "10", value: "Process if and only if counter value is higher than the value in the RE" },
        { key: "11", value: "Process if and only if counter value is one higher than the value in the RE" },
      ],
      spi_counter: "00",

      // POR SETUP
      spi_por_mode_enum: [
        { key: "00", value: "No PoR reply to the Sending Entity" },
        { key: "01", value: "PoR required to be sent to the Sending Entity" },
        { key: "10", value: "PoR required only when an error has occurred" },
        { key: "11", value: "Reserved" },
      ],
      spi_por_mode: "00",

      spi_por_checks_enum: [
        { key: "00", value: "No RC, CC or DS applied to PoR response to SE" },
        { key: "01", value: "PoR response with simple RC applied to it" },
        { key: "10", value: "PoR response with CC applied to it" },
        { key: "11", value: "Reserved for PoR response with DS applied to it" },
      ],
      spi_por_checks: "00",

      spi_por_ciphering_enum: [
        { key: "0", value: "PoR response shall not be ciphered" },
        { key: "1", value: "PoR response shall be ciphered" },
      ],
      spi_por_ciphering: "0",

      spi_por_sms_enum: [
        { key: "0", value: "PoR response shall be sent using SMS-DELIVER-REPORT" },
        { key: "1", value: "PoR response shall be sent using SMS-SUBMIT" },
      ],
      spi_por_sms: "0",
    };
  },
  props: {
    // v-model prop is always value
    value: {
      type: String,
      required: false,
    },
    header: {
      type: Object,
      required: false,
    },
    pattern: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "SPI",
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
    this.parseSpi(this.dvalue);
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
    parseSpi(hexValue) {
      console.log(`flo-spi - parseSpi - enter`);
      // 1. verify 4 bytes that are all hex
      if (hexValue.length != 4) {
        console.log(`flo-spi - parseSpi - wrong length`);
        return;
      }
      // TODO: MATCH hex pattern

      // 2. get the first and second byte bits
      let first_byte = this.getByteHex(hexValue, 0);
      let first_byte_bits = this.getByteBits(first_byte);
      console.log(`flo-spi - parseSpi - first - dec: ${first_byte} bits:${first_byte_bits}`);

      let second_byte = this.getByteHex(hexValue, 2);
      let second_byte_bits = this.getByteBits(second_byte);
      console.log(`flo-spi - parseSpi - second - dec: ${second_byte} bits:${second_byte_bits}`);

      // let spi_checks_enum = [
      //   { key: "00", value: 'No RC, CC or DS' },
      //   { key: "01", value: 'Redundancy Check' },
      //   { key: "10", value: 'Cryptographic Checksum' },
      //   { key: "11", value: 'Digital Signature' },
      // ];

      // First Byte
      // b2 b1 - Checks RC/CC/DS
      // 00: No RC, CC or DS
      // 01: Redundancy Check
      // 10: Cryptographic Checksum
      // 11: Digital Signature

      this.spi_checks = `${this.getBitsBit(first_byte_bits, 2)}${this.getBitsBit(first_byte_bits, 1)}`;
      console.log(`flo-spi - parseSpi - spi_checks:${this.spi_checks}`);
      // let spi_ciphering_enum = [
      //   { key: "0", value: 'No Ciphering' },
      //   { key: "1", value: 'Ciphering' },
      // ];

      // b3 - Ciphering
      // 0 : No Ciphering
      // 1 : Ciphering
      this.spi_ciphering = `${this.getBitsBit(first_byte_bits, 3)}`;
      console.log(`flo-spi - parseSpi - spi_ciphering:${this.spi_ciphering}`);

      // let spi_counter_enum = [
      //   { key: "00", value: 'No counter' },
      //   { key: "01", value: 'Counter available; no replay or sequence checking' },
      //   { key: "10", value: 'Process if and only if counter value is higher than the value in the RE' },
      //   { key: "11", value: 'Process if and only if counter value is one higher than the value in the RE' },
      // ];

      // b4 b5 - Counter
      // 00: No counter available (note 1)
      // 01: Counter available; no replay or sequence checking (note 2)
      // 10: Process if and only if counter value is higher than the value in the RE (note 3)
      // 11: Process if and only if counter value is one higher than the value in the RE (note 4)
      this.spi_counter = `${this.getBitsBit(first_byte_bits, 5)}${this.getBitsBit(first_byte_bits, 4)}`;
      console.log(`flo-spi - parseSpi - spi_counter:${this.spi_counter}`);

      // b6,b7,b8 - None
      // 0 Reserved

      // Second Byte
      // let spi_por_mode_enum = [
      //   { key: "00", value: 'No PoR reply to the Sending Entity' },
      //   { key: "01", value: 'PoR required to be sent to the Sending Entity' },
      //   { key: "10", value: 'PoR required only when an error has occurred' },
      //   { key: "11", value: 'Reserved' },
      // ];

      // b1 b2 - PoR Mode
      // 00: No PoR reply to the Sending Entity (SE)
      // 01: PoR required to be sent to the SE
      // 10: PoR required only when an error has occurred
      // 11: Reserved

      this.spi_por_mode = `${this.getBitsBit(second_byte_bits, 2)}${this.getBitsBit(second_byte_bits, 1)}`;
      console.log(`flo-spi - parseSpi - spi_por_mode:${this.spi_por_mode}`);
      // let spi_por_checks_enum = [
      //   { key: "00", value: 'No RC, CC or DS applied to PoR response to SE' },
      //   { key: "01", value: 'PoR response with simple RC applied to it' },
      //   { key: "10", value: 'PoR response with CC applied to it' },
      //   { key: "11", value: 'Reserved for PoR response with DS applied to it' },
      // ];

      // b3 b4 - PoR Checks
      // 00: No RC, CC or DS applied to PoR response to SE
      // 01: PoR response with simple RC applied to it
      // 10: PoR response with CC applied to it
      // 11: Reserved for PoR response with DS applied to it
      this.spi_por_checks = `${this.getBitsBit(second_byte_bits, 4)}${this.getBitsBit(second_byte_bits, 3)}`;
      console.log(`flo-spi - parseSpi - spi_por_checks:${this.spi_por_checks}`);
      // let spi_por_ciphering_enum = [
      //   { key: "0", value: 'PoR response shall not be ciphered' },
      //   { key: "1", value: 'PoR response shall be ciphered' },
      // ];

      // b5 - PoR Ciphering
      // 0 : PoR response shall not be ciphered
      // 1 : PoR response shall be ciphered
      this.spi_por_ciphering = `${this.getBitsBit(second_byte_bits, 5)}`;
      console.log(`flo-spi - parseSpi - spi_por_ciphering:${this.spi_por_ciphering}`);

      // b6 - PoR Method
      // Reserved for TS 31.115 [5]

      // let spi_por_sms_enum = [
      //   { key: "0", value: 'PoR response shall be sent using SMS-DELIVER-REPORT' },
      //   { key: "1", value: 'PoR response shall be sent using SMS-SUBMIT' },
      // ];

      // For SMS only
      // 0: PoR response shall be sent using SMS-DELIVER-REPORT
      // 1: PoR response shall be sent using SMS-SUBMIT

      // b7 b8 - None
      // Reserved (set to zero and ignored by RE)

      this.spi_por_sms = `${this.getBitsBit(second_byte_bits, 6)}`;
      console.log(`flo-spi - parseSpi - spi_por_sms:${this.spi_por_sms}`);
    },
    spi_text_changed(event) {
      console.log(`flo-spi - spi_text_changed - enter`);
      this.parseSpi(event);
    },
    spi_changed() {
      console.log(`flo-spi - spi_changed - enter`);

      let first = `000${this.spi_counter}${this.spi_ciphering}${this.spi_checks}`;
      console.log(`flo-spi - spi_changed - first: ${first}`);
      let second = `00${this.spi_por_sms}${this.spi_por_ciphering}${this.spi_por_checks}${this.spi_por_mode}`; // 00
      console.log(`flo-spi - spi_changed - second: ${second}`);
      let concat = `${first}${second}`;
      console.log(`flo-spi - spi_changed - concat: ${concat}`);

      console.log(`flo-spi - spi_changed - hex: ${this.pad(parseInt(concat, 2).toString(16), 4)}`);
      this.cvalue = this.pad(parseInt(concat, 2).toString(16), 4);
    },
    testPattern(value) {
      const spattern = this.pattern;
      const lpattern = new RegExp(spattern);
      return lpattern.test(value) || "Validation failed, value doesn't match pattern.";
    },
  },
};
</script>
