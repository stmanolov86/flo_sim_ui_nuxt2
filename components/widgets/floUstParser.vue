<template>
  <div class="flo-ust-parser">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
          <blockquote v-if="$route.name != 'resources-uiccs'" class="subtitle-1">
            <span>Note: UST Parser Masks are stored and configured in the UICC. </span>
          </blockquote>
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col cols="7" class="pa-1"><v-text-field v-model="search" append-icon="mdi-magnify" label="Search" hint="Filter UST Service Table Contents" persistent-hint></v-text-field></v-col>
      </v-row>

      <v-row no-gutters>
        <v-col cols="12" class="pa-1">
          <v-list-item-group v-model="ust" class="scrollable-list" multiple>
            <template v-for="(service, i) in formatUstServices(ust)">
              <v-list-item :key="`a-${i}`" @change="setUstService(service)" :class="{ 'custom-disabled': service.required }">
                <template v-slot:default="{}">
                  <v-list-item-action>
                    <v-checkbox v-model="service.active" @change="setUstService(service)" :disabled="service.required" color="primary"></v-checkbox>
                  </v-list-item-action>

                  <v-list-item-content>
                    <v-list-item-title>{{ service.key }}: {{ service.value }}</v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-list-item>
              <v-divider :key="`b-${i}`"></v-divider>
            </template>
          </v-list-item-group>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import helpers from "~/src/helpers.js";
export default {
  name: "flo-ust-parser",
  data: () => ({
    helpers,
    search: "",
    required: "",
    available: "",
    ust: [],
    ustByteArray: [],
    ustFullList: [
      { active: false, required: false, available: false, key: 1, value: "Local Phone Book" },
      { active: false, required: false, available: false, key: 2, value: "Fixed Dialling Numbers (FDN)" },
      { active: false, required: false, available: false, key: 3, value: "Extension 2" },
      { active: false, required: false, available: false, key: 4, value: "Service Dialling Numbers (SDN)" },
      { active: false, required: false, available: false, key: 5, value: "Extension 3" },
      { active: false, required: false, available: false, key: 6, value: "Barred Dialling Numbers (BDN)" },
      { active: false, required: false, available: false, key: 7, value: "Extension 4" },
      { active: false, required: false, available: false, key: 8, value: "Outgoing Call Information (OCI and OCT)" },
      { active: false, required: false, available: false, key: 9, value: "Incoming Call Information (ICI and ICT)" },
      { active: false, required: false, available: false, key: 10, value: "Short Message Storage (SMS)" },
      { active: false, required: false, available: false, key: 11, value: "Short Message Status Reports (SMSR)" },
      { active: false, required: false, available: false, key: 12, value: "Short Message Service Parameters (SMSP)" },
      { active: false, required: false, available: false, key: 13, value: "Advice of Charge (AoC)" },
      { active: false, required: false, available: false, key: 14, value: "Capability Configuration Parameters 2 (CCP2)" },
      { active: false, required: false, available: false, key: 15, value: "Cell Broadcast Message Identifier" },
      { active: false, required: false, available: false, key: 16, value: "Cell Broadcast Message Identifier Ranges" },
      { active: false, required: false, available: false, key: 17, value: "Group Identifier Level 1" },
      { active: false, required: false, available: false, key: 18, value: "Group Identifier Level 2" },
      { active: false, required: false, available: false, key: 19, value: "Service Provider Name" },
      { active: false, required: false, available: false, key: 20, value: "User controlled PLMN selector with Access Technology" },
      { active: false, required: false, available: false, key: 21, value: "MSISDN" },
      { active: false, required: false, available: false, key: 22, value: "Image (IMG)" },
      { active: false, required: false, available: false, key: 23, value: "Support of Localised Service Areas (SoLSA)" },
      { active: false, required: false, available: false, key: 24, value: "Enhanced Multi-Level Precedence and Pre-emption Service" },
      { active: false, required: false, available: false, key: 25, value: "Automatic Answer for eMLPP" },
      { active: false, required: false, available: false, key: 26, value: "RFU" },
      { active: false, required: false, available: false, key: 27, value: "GSM Access" },
      { active: false, required: false, available: false, key: 28, value: "Data download via SMS-PP" },
      { active: false, required: false, available: false, key: 29, value: "Data download via SMS-CB" },
      { active: false, required: false, available: false, key: 30, value: "Call Control by USIM" },
      { active: false, required: false, available: false, key: 31, value: "MO-SMS Control by USIM" },
      { active: false, required: false, available: false, key: 32, value: "RUN AT COMMAND command" },
      { active: false, required: false, available: false, key: 33, value: "Shall be set to 1" },
      { active: false, required: false, available: false, key: 34, value: "Enabled Services Table" },
      { active: false, required: false, available: false, key: 35, value: "APN Control List (ACL)" },
      { active: false, required: false, available: false, key: 36, value: "Depersonalisation Control Keys" },
      { active: false, required: false, available: false, key: 37, value: "Co-operative Network List" },
      { active: false, required: false, available: false, key: 38, value: "GSM security context" },
      { active: false, required: false, available: false, key: 39, value: "CPBCCH Information" },
      { active: false, required: false, available: false, key: 40, value: "Investigation Scan" },
      { active: false, required: false, available: false, key: 41, value: "MexE" },
      { active: false, required: false, available: false, key: 42, value: "Operator controlled PLMN selector with Access Technology" },
      { active: false, required: false, available: false, key: 43, value: "HPLMN selector with Access Technology" },
      { active: false, required: false, available: false, key: 44, value: "Extension 5" },
      { active: false, required: false, available: false, key: 45, value: "PLMN Network Name" },
      { active: false, required: false, available: false, key: 46, value: "Operator PLMN List" },
      { active: false, required: false, available: false, key: 47, value: "Mailbox Dialling Numbers" },
      { active: false, required: false, available: false, key: 48, value: "Message Waiting Indication Status" },
      { active: false, required: false, available: false, key: 49, value: "Call Forwarding Indication Status" },
      { active: false, required: false, available: false, key: 50, value: "Reserved and shall be ignored" },
      { active: false, required: false, available: false, key: 51, value: "Service Provider Display Information" },
      { active: false, required: false, available: false, key: 52, value: "Multimedia Messaging Service (MMS)" },
      { active: false, required: false, available: false, key: 53, value: "Extension 8" },
      { active: false, required: false, available: false, key: 54, value: "Call control on GPRS by USIM" },
      { active: false, required: false, available: false, key: 55, value: "MMS User Connectivity Parameters" },
      { active: false, required: false, available: false, key: 56, value: "Network's indication of alerting in the MS (NIA)" },
      { active: false, required: false, available: false, key: 57, value: "VGCS Group Identifier List (EFVGCS and EFVGCSS)" },
      { active: false, required: false, available: false, key: 58, value: "VBS Group Identifier List (EFVBS and EFVBSS)" },
      { active: false, required: false, available: false, key: 59, value: "Pseudonym" },
      { active: false, required: false, available: false, key: 60, value: "User Controlled PLMN selector for I-WLAN access" },
      { active: false, required: false, available: false, key: 61, value: "Operator Controlled PLMN selector for I-WLAN access" },
      { active: false, required: false, available: false, key: 62, value: "User controlled WSID list" },
      { active: false, required: false, available: false, key: 63, value: "Operator controlled WSID list" },
      { active: false, required: false, available: false, key: 64, value: "VGCS security" },
      { active: false, required: false, available: false, key: 65, value: "VBS security" },
      { active: false, required: false, available: false, key: 66, value: "WLAN Reauthentication Identity" },
      { active: false, required: false, available: false, key: 67, value: "Multimedia Messages Storage" },
      { active: false, required: false, available: false, key: 68, value: "Generic Bootstrapping Architecture (GBA)" },
      { active: false, required: false, available: false, key: 69, value: "MBMS security" },
      { active: false, required: false, available: false, key: 70, value: "Data download via USSD and USSD application mode" },
      { active: false, required: false, available: false, key: 71, value: "Equivalent HPLMN" },
      { active: false, required: false, available: false, key: 72, value: "Additional TERMINAL PROFILE after UICC activation" },
      { active: false, required: false, available: false, key: 73, value: "Equivalent HPLMN Presentation Indication" },
      { active: false, required: false, available: false, key: 74, value: "Last RPLMN Selection Indication" },
      { active: false, required: false, available: false, key: 75, value: "OMA BCAST Smart Card Profile" },
      { active: false, required: false, available: false, key: 76, value: "GBA-based Local Key Establishment Mechanism" },
      { active: false, required: false, available: false, key: 77, value: "Terminal Applications" },
      { active: false, required: false, available: false, key: 78, value: "Service Provider Name Icon" },
      { active: false, required: false, available: false, key: 79, value: "PLMN Network Name Icon" },
      { active: false, required: false, available: false, key: 80, value: "Connectivity Parameters for USIM IP connections" },
      { active: false, required: false, available: false, key: 81, value: "Home I-WLAN Specific Identifier List" },
      { active: false, required: false, available: false, key: 82, value: "I-WLAN Equivalent HPLMN Presentation Indication" },
      { active: false, required: false, available: false, key: 83, value: "I-WLAN HPLMN Priority Indication" },
      { active: false, required: false, available: false, key: 84, value: "I-WLAN Last Registered PLMN" },
      { active: false, required: false, available: false, key: 85, value: "EPS Mobility Management Information" },
      { active: false, required: false, available: false, key: 86, value: "Allowed CSG Lists and corresponding indications" },
      { active: false, required: false, available: false, key: 87, value: "Call control on EPS PDN connection by USIM" },
      { active: false, required: false, available: false, key: 88, value: "HPLMN Direct Access" },
      { active: false, required: false, available: false, key: 89, value: "eCall Data" },
      { active: false, required: false, available: false, key: 90, value: "Operator CSG Lists and corresponding indications" },
      { active: false, required: false, available: false, key: 91, value: "Support for SM-over-IP" },
      { active: false, required: false, available: false, key: 92, value: "Support of CSG Display Control" },
      { active: false, required: false, available: false, key: 93, value: "Communication Control for IMS by USIM" },
      { active: false, required: false, available: false, key: 94, value: "Extended Terminal Applications" },
      { active: false, required: false, available: false, key: 95, value: "Support of UICC access to IMS" },
      { active: false, required: false, available: false, key: 96, value: "Non-Access Stratum configuration by USIM" },
      { active: false, required: false, available: false, key: 97, value: "PWS configuration by USIM" },
      { active: false, required: false, available: false, key: 98, value: "RFU" },
      { active: false, required: false, available: false, key: 99, value: "URI support by UICC" },
      { active: false, required: false, available: false, key: 100, value: "Extended EARFCN support" },
      { active: false, required: false, available: false, key: 101, value: "ProSe" },
      { active: false, required: false, available: false, key: 102, value: "USAT Application Pairing" },
      { active: false, required: false, available: false, key: 103, value: "Media Type support" },
      { active: false, required: false, available: false, key: 104, value: "IMS call disconnection cause" },
      { active: false, required: false, available: false, key: 105, value: "URI support for MO SHORT MESSAGE CONTROL" },
      { active: false, required: false, available: false, key: 106, value: "ePDG configuration Information support" },
      { active: false, required: false, available: false, key: 107, value: "ePDG configuration Information configured" },
      { active: false, required: false, available: false, key: 108, value: "ACDC support" },
      { active: false, required: false, available: false, key: 109, value: "Mission Critical Services" },
      { active: false, required: false, available: false, key: 110, value: "ePDG configuration Information for Emergency Service support" },
      { active: false, required: false, available: false, key: 111, value: "ePDG configuration Information for Emergency Service configured" },
      { active: false, required: false, available: false, key: 112, value: "eCall Data over IMS" },
      { active: false, required: false, available: false, key: 113, value: "URI support for SMS-PP DOWNLOAD as defined in 3GPP TS 31.111 [12]" },
      { active: false, required: false, available: false, key: 114, value: "From Preferred" },
      { active: false, required: false, available: false, key: 115, value: "IMS configuration data" },
      { active: false, required: false, available: false, key: 116, value: "TV configuration" },
      { active: false, required: false, available: false, key: 117, value: "3GPP PS Data Off" },
      { active: false, required: false, available: false, key: 118, value: "3GPP PS Data Off Service List" },
      { active: false, required: false, available: false, key: 119, value: "V2X" },
      { active: false, required: false, available: false, key: 120, value: "XCAP Configuration Data" },
      { active: false, required: false, available: false, key: 121, value: "EARFCN list for MTC/NB-IOT UEs" },
      { active: false, required: false, available: false, key: 122, value: "5GS Mobility Management Information" },
      { active: false, required: false, available: false, key: 123, value: "5G Security Parameters" },
      { active: false, required: false, available: false, key: 124, value: "Subscription identifier privacy support" },
      { active: false, required: false, available: false, key: 125, value: "SUCI calculation by the USIM" },
      { active: false, required: false, available: false, key: 126, value: "UAC Access Identities support" },
      { active: false, required: false, available: false, key: 127, value: "Expect control plane-based Steering of Roaming information during initial registration in VPLMN" },
      { active: false, required: false, available: false, key: 128, value: "Call control on PDU Session by USIM" },
      { active: false, required: false, available: false, key: 129, value: "5GS Operator PLMN List" },
      { active: false, required: false, available: false, key: 130, value: "Support for SUPI of type NSI or GLI or GCI" },
      { active: false, required: false, available: false, key: 131, value: "3GPP PS Data Off separate Home and Roaming lists" },
      { active: false, required: false, available: false, key: 132, value: "Support for URSP by USIM" },
      { active: false, required: false, available: false, key: 133, value: "5G Security Parameters extended" },
      { active: false, required: false, available: false, key: 134, value: "MuD and MiD configuration data" },
      { active: false, required: false, available: false, key: 135, value: "Support for Trusted non-3GPP access networks by USIM" },
      { active: false, required: false, available: false, key: 136, value: "Support for multiple records of NAS security context storage for multiple registration" },
      { active: false, required: false, available: false, key: 137, value: "Pre-configured CAG information list" },
      { active: false, required: false, available: false, key: 138, value: "SOR-CMCI storage in USIM" },
      { active: false, required: false, available: false, key: 139, value: "5G ProSe" },
      { active: false, required: false, available: false, key: 140, value: "Storage of disaster roaming information in USIM" },
      { active: false, required: false, available: false, key: 141, value: "Pre-configured eDRX parameters" },
      { active: false, required: false, available: false, key: 142, value: "5G NSWO support" },
      { active: false, required: false, available: false, key: 143, value: "PWS configuration for SNPN in USIM" },
      { active: false, required: false, available: false, key: 144, value: "Multiplier Coefficient for Higher Priority PLMN search via NG-RAN satellite access" },
      { active: false, required: false, available: false, key: 145, value: "KAUSF derivation configuration" },
      { active: false, required: false, available: false, key: 146, value: "Network Identifier for SNPN (NID)" },
      { active: false, required: false, available: false, key: 147, value: "5MBS UE pre-configuration" },
      { active: false, required: false, available: false, key: 148, value: "UE configured for using Operator controlled signal threshold peraccess technology" },
      { active: false, required: false, available: false, key: 149, value: "A2X" },
      { active: false, required: false, available: false, key: 150, value: "IMS Data Channel Indication" },
    ],
  }),
  props: {
    value: {
      type: String,
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
        this.$emit("input", val);
      },
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      this.available = this.helpers.hexStringToByteArray(this.available_mask);
      console.log(`flo-ust-parser - initialize - available_mask: ${this.available_mask}`);
      console.log(`flo-ust-parser - initialize - available: ${JSON.stringify(this.available)}`);
      this.required = this.helpers.hexStringToByteArray(this.required_mask);
      console.log(`flo-ust-parser - initialize - required_mask: ${this.required_mask}`);
      console.log(`flo-ust-parser - initialize - required: ${JSON.stringify(this.required)}`);
      if (this.value) {
        console.log(`flo-ust-parser - initialize - value: ${this.value}`);
        this.ustByteArray = this.formatUstServiceMask(this.value);
        let l_ust_value = helpers.byteArrayToHexString(this.ustByteArray);
        console.log(`flo-ust-parser - initialize - l_ust_value: ${l_ust_value}`);
        this.ust = this.parseUstService(this.ustByteArray);
      } else {
        this.ustByteArray = this.required;
        this.ust = this.parseUstService(this.ustByteArray);
        this.raw = this.required_mask;
      }
      console.log(`flo-ust-parser - initialize - ustByteArray: ${JSON.stringify(this.ustByteArray)}`);
      console.log(`flo-ust-parser - initialize - ust: ${JSON.stringify(this.ust)}`);
    },
    parseUstService(bytes) {
      console.log(`flo-ust-parser - parseUstService - bytes: ${JSON.stringify(bytes)}`);
      let services = [];
      let l_ust_service = JSON.parse(JSON.stringify(this.ustFullList));

      for (let byte_pos = 0; byte_pos < bytes.length; byte_pos++) {
        let l_byte_value = bytes[byte_pos];

        for (let bit_pos = 0; bit_pos < 8; bit_pos++) {
          let l_bit_value = l_byte_value & (1 << bit_pos);
          console.log(`flo-ust-parser - parseUstService - l_bit_value: ${l_bit_value}`);
          let l_key = byte_pos * 8 + bit_pos + 1;
          console.log(`flo-ust-parser - parseUstService - l_key: ${l_key}`);
          let found = l_ust_service.find((f) => f.key == l_key);
          if (found) {
            console.log(`flo-ust-parser - parseUstService - found - before: ${JSON.stringify(found)}`);
            let l_available_byte_value = this.available[byte_pos];
            let l_bit_available = l_available_byte_value & (1 << bit_pos) ? true : false;
            console.log(`flo-ust-parser - parseUstService - l_available_byte_value: ${JSON.stringify(l_available_byte_value)}`);
            console.log(`flo-ust-parser - parseUstService - l_bit_available: ${JSON.stringify(l_bit_available)}`);
            let l_required_byte_value = this.required[byte_pos];
            let l_bit_required = l_required_byte_value & (1 << bit_pos) ? true : false;
            console.log(`flo-ust-parser - parseUstService - l_required_byte_value: ${JSON.stringify(l_required_byte_value)}`);
            console.log(`flo-ust-parser - parseUstService - l_bit_required: ${JSON.stringify(l_bit_required)}`);
            let l_bit_active = false;

            if (l_bit_required) {
              l_bit_active = true;
            } else if (l_bit_available) {
              l_bit_active = l_bit_value ? true : false;
            }
            found.active = l_bit_active;
            found.required = l_bit_required;
            found.available = l_bit_available;
            console.log(`flo-ust-parser - parseUstService - found - after: ${JSON.stringify(found)}`);
            if (l_bit_available) {
              services.push(found);
            }
          }
        }
      }

      console.log(`flo-ust-parser - parseUstService - services: ${JSON.stringify(services)}`);
      return services;
    },
    setUstService(service) {
      let l_key = service.key - 1;
      console.log(`flo-ust-parser - setUstService - l_key: ${l_key}`);
      let l_ust_byte_array = this.ustByteArray;
      service.active = !service.active;

      // Calculate the quotient (integer division)
      let l_byte_pos = Math.floor(l_key / 8);
      console.log(`flo-ust-parser - setUstService - l_byte_pos: ${l_byte_pos}`);

      // Calculate the modulo (remainder)
      let l_bit_pos = l_key % 8;
      console.log(`flo-ust-parser - setUstService - l_bit_pos: ${l_bit_pos}`);

      let l_byte_value = l_ust_byte_array[l_byte_pos];
      console.log(`flo-ust-parser - setUstService - before - l_byte_value: ${l_byte_value}`);

      if (service.active) {
        l_byte_value = l_byte_value | (1 << l_bit_pos);
      } else {
        l_byte_value = l_byte_value & ~(1 << l_bit_pos);
      }

      l_ust_byte_array[l_byte_pos] = l_byte_value;

      let raw = this.helpers.byteArrayToHexString(l_ust_byte_array);
      console.log(`flo-ust-parser - setUstService - raw: ${raw}`);

      this.$emit("input", raw);
    },
    formatUstServices(services) {
      let [, , length] = this.row.pattern.split(":");
      let search = this.search.toLowerCase();
      let available = services.filter((f) => f.available);
      let formatted = available.slice(0, length * 8 || services.length);

      return formatted.filter((f) => {
        return f.key.toString().includes(search) || f.value.toLowerCase().includes(search);
      });
    },
    formatUstServiceMask(value) {
      let ustBytes = this.helpers.hexStringToByteArray(value);
      for (let idx = 0; idx < ustBytes.length; idx++) {
        let actual = ustBytes[idx];
        let available = this.available[idx];
        let required = this.required[idx];
        ustBytes[idx] = (actual & available) | required;
      }
      return ustBytes;
    },
  },
};
</script>
