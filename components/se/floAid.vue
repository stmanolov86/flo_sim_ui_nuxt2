<template>
  <v-text-field v-model="cvalue" @paste="onPaste($event)" :rules="[testPattern]" :label="header.text" :hint="getHint()" :outlined="outlined" :dense="dense" :disabled="disabled" :persistent-hint="persistent_hint"></v-text-field>
</template>

<script>
export default {
  name: "flo-aid",
  data() {
    return {
      dvalue: this.value,
      dheader: this.header,
      dpattern: this.pattern,
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
      required: true,
    },
    pattern: {
      type: String,
      default: "",
    },
    outlined: {
      type: Boolean,
      required: false,
      default: false,
    },
    dense: {
      type: Boolean,
      required: false,
      default: false,
    },
    persistent_hint: {
      type: Boolean,
      required: false,
      default: false,
    },
    disabled: {
      type: Boolean,
      required: false,
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
        return this.value;
      },
      set(param) {
        this.dvalue = param;
        this.$emit("input", this.dvalue);
      },
    },
    cpattern: {
      get() {
        return this.pattern;
      },
      set(param) {
        this.dpattern = param;
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
    testPattern(value) {
      let header = this.cheader;
      if (header.hasOwnProperty("nullable")) {
        if (header.nullable == false && !header.hasOwnProperty("default")) {
          if (value === null || value == "") {
            return "Validation failed, field must have a value.";
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
      const spattern = this.pattern;
      const lpattern = new RegExp(spattern);
      return lpattern.test(value) || "Validation failed, value doesn't match pattern.";
    },
    getHint() {
      if (!this.dvalue) {
        return "Invalid";
      }

      let hint = "";

      let lvalue = this.dvalue;
      if (lvalue.length < 10) {
        return "Invalid";
      }

      // get RID
      let lrid = lvalue.substr(0, 10);
      let lrid_name = "";

      switch (lrid) {
        case "A000000009":
          {
            lrid_name = "ETSI";
          }
          break;
        case "A000000087":
          {
            lrid_name = "3GPP";
          }
          break;
        case "A000000343":
          {
            lrid_name = "3GPP2";
          }
          break;
        case "A000000645":
          {
            lrid_name = "oneM2M";
          }
          break;
        default: {
          lrid_name = "Unknown";
        }
      }

      hint = `${lrid_name}`;
      if (lvalue.length < 24) {
        return hint;
      }

      // get PIX
      let lpix = lvalue.substr(10);
      // get Digits 1 to 4 Application code
      let l_application_code = lpix.substr(0, 4);
      let l_application_name = l_application_code;

      if (lrid_name == "ETSI") {
        switch (l_application_code) {
          case "0001":
            {
              l_application_name = "GSM";
            }
            break;
          case "0002":
            {
              l_application_name = "GSM SIM TK";
            }
            break;
          case "0003":
            {
              l_application_name = "GSM SIM API";
            }
            break;
          case "0004":
            {
              l_application_name = "TETRA";
            }
            break;
          case "0005":
            {
              l_application_name = "UICC API";
            }
            break;
          case "0101":
            {
              l_application_name = "DVB CBMS KMS";
            }
            break;
          case "0201":
            {
              l_application_name = "M2MSM";
            }
            break;
        }
      } else if (lrid_name == "3GPP") {
        switch (l_application_code) {
          case "1001":
            {
              l_application_name = "UICC";
            }
            break;
          case "1002":
            {
              l_application_name = "USIM";
            }
            break;
          case "1003":
            {
              l_application_name = "USIM TK";
            }
            break;
          case "1004":
            {
              l_application_name = "ISIM";
            }
            break;
          case "1005":
            {
              l_application_name = "USIM API";
            }
            break;
          case "1006":
            {
              l_application_name = "ISIM API";
            }
            break;
          case "1007":
            {
              l_application_name = "CONTACT API";
            }
            break;
          case "1008":
            {
              l_application_name = "USIM-INI";
            }
            break;
          case "1009":
            {
              l_application_name = "USIM-RN";
            }
            break;
          case "100A":
            {
              l_application_name = "HPSIM";
            }
            break;
        }
      } else if (lrid_name == "3GPP2") {
        switch (l_application_code) {
          case "1002":
            {
              l_application_name = "CSIM";
            }
            break;
        }
      } else if (lrid_name == "oneM2M") {
        switch (l_application_code) {
          case "1001":
            {
              l_application_name = "UICC";
            }
            break;
          case "1002":
            {
              l_application_name = "1M2MSM";
            }
            break;
        }
      }

      // TODO: we can translate the code to actual name (USIM etc)
      hint += ` application: ${l_application_name}`;

      // get Digits 5 to 8 Country code
      let l_country_code = lpix.substr(4, 4);
      hint += ` country: ${l_country_code}`;

      if (lvalue.length > 24) {
        // get Digits 9 to 14 Application provider code
        let l_application_provider_code = lpix.substr(8, 6);
        hint += ` code: ${l_application_provider_code}`;

        // get Digits 15 up to 22 Application provider field
        let l_application_provider_field = lpix.substr(14, 8);
        hint += ` field: ${l_application_provider_field}`;
      }

      return hint;
    },
    onPaste(event) {
      this.dvalue = event.clipboardData.getData("text/plain");
    },
  },
};
</script>
