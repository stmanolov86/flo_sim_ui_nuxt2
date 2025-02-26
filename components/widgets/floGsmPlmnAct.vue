<template>
  <div class="flo-gsm-plmn-act">
    <template v-if="!daloc && dvalue.startsWith('FFFFF')">
      <v-container fluid class="ma-0 pa-0">
        <v-row no-gutters>
          <v-col cols="12" class="ma-0 pa-0">
            <v-btn elevation="1" x-small class="ma-0 pa-0" @click="daloc = !daloc" :disabled="disabled"><v-icon color="primary">mdi-plus</v-icon></v-btn>
          </v-col>
        </v-row>
      </v-container>
    </template>

    <template v-else>
      <v-container fluid class="ma-0 pa-0">
        <v-row no-gutters>
          <v-col cols="12">
            <flo-plmn :value="dplmn" :daloc="daloc" :swapped="true" @change="onChangePlmn($event)" :disabled="disabled" :hint="hint" item-text="value" item-value="key" clearable color="primary" persistent-hint filled />
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col cols="9">
            <p class="ma-0 pa-0 text-subtitle-1 font-weight-light primary--text">Access Technology: {{ dact }}</p>
            <p class="ma-0 pa-0 text-subtitle-2 font-weight-light">{{ getActString() }}</p>
          </v-col>

          <v-col cols="3" class="pa-1">
            <v-btn
              icon
              @click="
                dsact = dact;
                act_dialog = true;
              "
              class="font-weight-light primary--text"
            >
              <v-icon color="primary">mdi-calculator</v-icon>
            </v-btn>
            <!-- <div class="flex-grow-1"></div> -->
          </v-col>
          <!-- <v-col cols="1" class="pa-1">
             <div class="flex-grow-1"></div>
          </v-col> -->
        </v-row>
      </v-container>
      <v-dialog :overlay-opacity="0.4" v-model="act_dialog" max-width="700px">
        <v-card>
          <v-card-title>
            <span class="headline">Access Technology Calculator</span>
          </v-card-title>

          <v-card-text>
            <flo-plmn-act-calc v-if="act_dialog" :value="dact" @change="onCalcChange($event)" />
          </v-card-text>

          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn color="primary" text @click="act_dialog = false">Close</v-btn>
            <v-btn color="primary" :disabled="disabled" text @click="save()">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>

<script>
import floPlmn from "~/components/widgets/floPlmn.vue";
import floPlmnActCalc from "~/components/widgets/floPlmnActCalc.vue";
export default {
  name: "flo-gsm-plmn-act",
  components: { floPlmn, floPlmnActCalc },
  data() {
    return {
      dvalue: "FFFFFF0000",
      dplmn: "FFFFFF",
      dact: "0000",
      daloc: false,
      act_dialog: false,
    };
  },
  props: {
    // v-model prop is always value
    value: {
      type: String,
      default: "FFFFFF0000",
      required: false,
    },
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    label: {
      type: String,
      required: false,
    },
    hint: {
      type: String,
      required: false,
    },
    swapped: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    async initialize() {
      // console.log(`flo-gsm-plmn-act - initialize: ${this.value}`);
      if (this.value) {
        if (this.value.length == 10) {
          this.dvalue = `${this.value}`;
        }
      }
      this.dplmn = this.dvalue.substr(0, 6);
      this.dact = this.dvalue.substr(6, 4);
      // console.log(`flo-gsm-plmn-act - initialize - dvalue: ${this.dvalue}`);
    },
    getActString() {
      if (!this.dact) {
        return "";
      }
      if (this.dact.length != 4) {
        return "";
      }
      const b1_empty = 0b00000000;
      const b1_ng_ran = 0b00001000;
      const b1_eutran_nb_s1 = 0b00010000;
      const b1_eutran_wb_s1 = 0b00100000;
      const b1_eutran = 0b01000000;
      const b1_utran = 0b10000000;

      const b2_empty = 0b00000000;
      const b2_gsm_l = 0b00000100;
      const b2_ec_gsm_iot = 0b00001000;
      const b2_cdma2000_rtt = 0b00010000;
      const b2_cdma2000_hrpd = 0b00100000;
      const b2_gsm_compact = 0b01000000;
      const b2_gsm_h = 0b10000000;

      let b1 = parseInt(this.dact.substr(0, 2), 16);
      let b2 = parseInt(this.dact.substr(2, 2), 16);
      let s = [];
      if (b1 & b1_ng_ran) {
        s.push("NG-RAM");
      }

      if (b1 & b1_eutran) {
        let l_str = "E-UTRAN(";

        if (b1 & b1_eutran_nb_s1 && b1 & b1_eutran_wb_s1) {
          l_str += "NB, WB";
        } else if ((b1 & b1_eutran_nb_s1) == 0 && (b1 & b1_eutran_wb_s1) == 0) {
          l_str += "NB, WB";
        } else if (b1 & b1_eutran_nb_s1) {
          l_str += "NB";
        } else if (b1 & b1_eutran_wb_s1) {
          l_str += "WB";
        }
        l_str += ")";
        s.push(l_str);
      }

      if (b1 & b1_utran) {
        s.push("UTRAN");
      }

      if (b2 & b2_gsm_h) {
        if (b2 & b2_gsm_l && b1 & b2_ec_gsm_iot) {
          s.push("GSM");
          s.push("EC-GSM-IoT");
        } else if ((b2 & b2_gsm_l) == 0 && (b2 & b2_ec_gsm_iot) == 0) {
          s.push("GSM");
          s.push("EC-GSM-IoT");
        } else if (b2 & b2_gsm_l) {
          s.push("GSM");
        } else if (b2 & b2_ec_gsm_iot) {
          s.push("EC-GSM-IoT");
        }
      }

      if (b2 & b2_cdma2000_rtt) {
        s.push("CDMA2000 RTT");
      }
      if (b2 & b2_cdma2000_hrpd) {
        s.push("CDMA2000 HRPD");
      }
      if (b2 & b2_gsm_compact) {
        s.push("GSM COMPACT");
      }

      if (s.length == 0) {
        return "None";
      }

      return s.join(", ");
    },
    onChangeAct(event) {
      this.dact = event;
      this.$emit("change", `${this.dplmn}${this.dact}`);
    },
    onChangePlmn(event) {
      this.dplmn = event;
      this.$emit("change", `${this.dplmn}${this.dact}`);
    },
    onCalcChange(event) {
      this.dsact = event.toUpperCase();
    },
    save() {
      console.log(`flo-gsm-plmn-act - save - enter - ${this.dact} <- ${this.dsact}`);
      this.act_dialog = false;
      this.dact = this.dsact;
      console.log(`flo-gsm-plmn-act - save - exit - ${this.dplmn}${this.dact}`);
      this.$emit("change", `${this.dplmn}${this.dact}`);
    },
  },
};
</script>
