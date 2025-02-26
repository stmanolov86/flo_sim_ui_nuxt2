<template>
  <div class="flo-params">
    <v-card flat outlined>
      <v-card-title class="ma-1 pa-1 align-center font-weight-regular title">{{ title }}</v-card-title>
      <v-card-text>
        <v-row>
          <v-col :__qa="helpers.getQATag('applets', header)" cols="12" lg="6" xl="6" v-for="(header, i) in headers" :key="i">
            <flo-meta-field-edit @input="multiImsi('input')" v-model="row[header.value]" :header="header" :pattern="header.pattern" :translator="translator" :disabled="disabled"></flo-meta-field-edit>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import helpers from "~/src/helpers.js";
export default {
  name: "flo-params",
  data() {
    return {
      helpers,
    };
  },
  props: {
    headers: {
      type: Array,
      required: true,
      default: null,
    },
    row: {
      type: Object,
      required: true,
      default: null,
    },
    translator: {
      type: Object,
      required: false,
      default: null,
    },
    title: {
      type: String,
      required: true,
      default: "",
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  created() {
    this.multiImsi("created");
  },
  beforeDestroy() {
    this.multiImsi("destroyed");
  },
  methods: {
    multiImsi(e) {
      if (e == "created") {
        if (this.row.applet_type == "utk") {
          if (this.row.multi_imsi_type == "") {
            this.row.is_multi_imsi = 1;
            this.row.multi_imsi_type = "flolive";
          }
        }
      } else if (e == "input") {
        if (this.row.applet_type == "utk") {
          if (this.row.is_multi_imsi == 1 && this.row.multi_imsi_type == "") {
            this.row.multi_imsi_type = "flolive";
          } else if (this.row.is_multi_imsi == 0) {
            this.row.multi_imsi_type = "";
            this.row.applet_type = "none";
          }
        }
      } else if (e == "destroyed") {
        if (this.row.applet_type == "none") {
          this.row.is_multi_imsi = 0;
          this.row.multi_imsi_type = "";
        }
      }
    },
  },
};
</script>
