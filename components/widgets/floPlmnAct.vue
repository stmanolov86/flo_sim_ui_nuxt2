<template>
  <div class="flo-plmn-act">
    <v-container>
      <v-row no-gutters>
        <v-col>
          <v-text-field :key="`t-${version}`" :value="getActString()" hint="Access Technolgy Mask" label="Mask" filled @change="setActString($event)"></v-text-field>
        </v-col>
      </v-row>
      <v-row :key="`f-${version}`" no-gutters>
        <v-col cols="12">
          <v-switch class="pa-1 ma-1 subheading font-weight-light" dense color="success" hide-details :input-value="getNgRan()" @change="setNgRan($event)" label="NG-RAN"></v-switch>
        </v-col>
        <v-col cols="12">
          <v-switch class="pa-1 ma-1 subheading font-weight-light" dense color="success" hide-details :input-value="getUtran()" @change="setUtran($event)" label="UTRAN"></v-switch>
        </v-col>
        <v-col cols="12">
          <v-select dense :value="getEUtran()" @change="setEUtran($event)" :items="db2EutranE" item-text="value" item-value="key" required label="E-UTRAN" hint="E-UTRAN Modes" filled hide-details class="pa-2"></v-select>
        </v-col>

        <v-col cols="12">
          <v-select dense :value="getGsm()" @change="setGsm($event)" :items="db2GsmE" item-text="value" item-value="key" required label="GSM" hint="GSM Modes" filled hide-details class="pa-2"></v-select>
        </v-col>

        <v-col cols="12">
          <v-switch class="pa-1 ma-1 subheading font-weight-light" dense color="success" hide-details :input-value="getGsmCompact()" @change="setGsmCompact($event)" label="GSM-COMPACT"></v-switch>
        </v-col>
        <v-col cols="12">
          <v-switch class="pa-1 ma-1 subheading font-weight-light" dense color="success" hide-details :input-value="getCdmaRtt()" @change="setCdmaRtt($event)" label="CDMA2000-1xRTT"></v-switch>
        </v-col>
        <v-col cols="12">
          <v-switch class="pa-1 ma-1 subheading font-weight-light" dense color="success" hide-details :input-value="getCdmaHrpd()" @change="setCdmaHrpd($event)" label="CDMA2000-HRPD"></v-switch>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
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

const b2EutranE = [
  { key: 1, value: "Not Selected" },
  { key: 2, value: "NB and WB S1" },
  { key: 3, value: "NB S1 Only" },
  { key: 4, value: "WB S1 Only" },
];

const b2GsmE = [
  { key: 1, value: "Not Selected" },
  { key: 2, value: "GSM and EC-GSM-IoT" },
  { key: 3, value: "GSM Only" },
  { key: 4, value: "EC-GSM-IoT Only" },
];

export default {
  name: "flo-plmn-act",
  data: () => ({
    b1v: b1_empty,
    b2v: b2_empty,
    db2EutranE: b2EutranE,
    db2GsmE: b2GsmE,
    version: 0,
  }),
  props: {
    // v-model prop is always value
    value: {
      type: String,
      required: true,
    },
  },
  methods: {
    getActString() {
      let sb1 = ("00" + this.b1v.toString(16)).substr(-2);
      // console.log(`flo-plmn-act: getActString ${sb1}`);
      let sb2 = ("00" + this.b2v.toString(16)).substr(-2);
      // console.log(`flo-plmn-act: getActString ${sb2}`);
      return `${sb1}${sb2}`;
    },
    setActString(event) {
      console.log(`flo-plmn-act: setActString ${event}`);
      if (event.length != 4) {
        return;
      }

      let b = event.substring(0, 2);
      this.b1v = parseInt(b, 16);
      this.b1Changed();

      b = event.substring(2, 4);
      this.b2v = parseInt(b, 16);
      this.b2Changed();
    },
    b1Changed() {
      // console.log(`flo-plmn-act: b1 - changed - ${this.b1v.toString(2)}`);
      this.version++;
    },
    b2Changed() {
      // console.log(`flo-plmn-act: b2 - changed - ${this.b2v.toString(2)}`);
      this.version++;
    },
    getNgRan() {
      return this.b1v & b1_ng_ran;
    },
    setNgRan(v) {
      this.b1v &= ~b1_ng_ran;
      if (v) {
        this.b1v |= b1_ng_ran;
      }

      this.b1Changed();
    },
    getUtran() {
      return this.b1v & b1_utran;
    },
    setUtran(v) {
      this.b1v &= ~b1_utran;
      if (v) {
        this.b1v |= b1_utran;
      }

      this.b1Changed();
    },
    getEUtran() {
      // {key:1, value: 'E-UTRAN Not Selected'},
      // {key:2, value: 'E-UTRAN in NB and WB S1'},
      // {key:3, value: 'E-UTRAN in NB S1 Only'},
      // {key:4, value: 'E-UTRAN in WB S1 Only'}
      let all = b1_eutran | b1_eutran_nb_s1 | b1_eutran_wb_s1;
      let eutran = this.b1v & all;
      // console.log(`flo-plmn-act: getEUtran - eutran - all -${eutran}`);
      // console.log(`flo-plmn-act: getEUtran - eutran - ${eutran & b1_eutran}`);

      if ((eutran & b1_eutran) == 0) {
        // console.log(`flo-plmn-act: getEUtran - 1 - E-UTRAN Not Selected`);
        return 1;
      } else {
        // eutran in use
        if ((eutran & b1_eutran_nb_s1) == 0) {
          // nb not in use
          if ((eutran & b1_eutran_wb_s1) == 0) {
            // wb not in use -- means that they both in use
            // console.log(`flo-plmn-act: getEUtran - 2 (all) - E-UTRAN in NB and WB S1`);
            return 2;
          } else {
            // only wb in use
            // console.log(`flo-plmn-act: getEUtran - 4 - E-UTRAN in WB S1 Only`);
            return 4;
          }
        } else {
          if ((eutran & b1_eutran_wb_s1) == 0) {
            // only nb in use
            // console.log(`flo-plmn-act: getEUtran - 3 - E-UTRAN in NB S1 Only`);
            return 3;
          } else {
            // wb in use -- means that they both in use
            // console.log(`flo-plmn-act: getEUtran - 2 (none) - E-UTRAN in NB and WB S1`);
            return 2;
          }
        }
      }
    },
    setEUtran(v) {
      let all = b1_eutran | b1_eutran_nb_s1 | b1_eutran_wb_s1;
      switch (v) {
        case 1:
          {
            this.b1v &= ~all;
          }
          break;
        case 2:
          {
            this.b1v |= all;
          }
          break;
        case 3:
          {
            this.b1v &= ~all;
            this.b1v |= b1_eutran | b1_eutran_nb_s1;
          }
          break;
        case 4:
          {
            this.b1v &= ~all;
            this.b1v |= b1_eutran | b1_eutran_wb_s1;
          }
          break;
      }

      this.b1Changed();
    },

    getGsmCompact() {
      return this.b2v & b2_gsm_compact;
    },
    setGsmCompact(v) {
      this.b2v &= ~b2_gsm_compact;
      if (v) {
        this.b2v |= b2_gsm_compact;
      }

      this.b2Changed();
    },
    getGsm() {
      let all = b2_gsm_l | b2_ec_gsm_iot | b2_gsm_h;
      let gsm = this.b2v & all;
      // console.log(`flo-plmn-act: getGsm - gsm - all -${gsm}`);
      // console.log(`flo-plmn-act: getGsm - gsm h - ${gsm & b2_gsm_h}`);

      if ((gsm & b2_gsm_h) == 0) {
        // console.log(`flo-plmn-act: getGsm - 1 - GSM and EC-GSM-IoT Not Selected`);
        return 1;
      } else {
        // gsm in use
        if ((gsm & b2_gsm_l) == 0) {
          if ((gsm & b2_ec_gsm_iot) == 0) {
            // console.log(`flo-plmn-act: getGsm - 2 - none - GSM and EC-GSM-IoT`);
            return 2;
          } else {
            // console.log(`flo-plmn-act: getGsm - 4 - EC-GSM-IoT Only`);
            return 4;
          }
        } else {
          if ((gsm & b2_ec_gsm_iot) == 0) {
            // console.log(`flo-plmn-act: getGsm - 3 - GSM without EC-GSM-IoT`);
            return 3;
          } else {
            // console.log(`flo-plmn-act: getGsm - 2 - both - EC-GSM-IoT Only`);
            return 2;
          }
        }
      }
    },
    setGsm(v) {
      let all = b2_gsm_l | b2_ec_gsm_iot | b2_gsm_h;
      switch (v) {
        case 1:
          {
            this.b2v &= ~all;
          }
          break;
        case 2:
          {
            this.b2v |= all;
          }
          break;
        case 3:
          {
            this.b2v &= ~all;
            this.b2v |= b2_gsm_h | b2_gsm_l;
          }
          break;
        case 4:
          {
            this.b2v &= ~all;
            this.b2v |= b2_gsm_h | b2_ec_gsm_iot;
          }
          break;
      }

      this.b2Changed();
    },

    getCdmaRtt() {
      return this.b2v & b2_cdma2000_rtt;
    },
    setCdmaRtt(v) {
      this.b2v &= ~b2_cdma2000_rtt;
      if (v) {
        this.b2v |= b2_cdma2000_rtt;
      }

      this.b2Changed();
    },

    getCdmaHrpd() {
      return this.b2v & b2_cdma2000_hrpd;
    },

    setCdmaHrpd(v) {
      this.b2v &= ~b2_cdma2000_hrpd;
      if (v) {
        this.b2v |= b2_cdma2000_hrpd;
      }

      this.b2Changed();
    },
  },
};
</script>
