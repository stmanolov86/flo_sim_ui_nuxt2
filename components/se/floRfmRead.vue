<template>
  <div class="flo-rfm-read">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col cols="12" class="pa-1">
          <flo-rfm-misc @change="onMiscChange($event)" :aids="getUiccAids()" :value="value" :readonly="readonly" :disabled="disabled" :transport="transport" aid_category="RFM" />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="12" class="pa-1">
          <flo-position-control :items="operation.reads" :value="val" :multiple="setMultiple" :disableNew="!setMultiple" :readonly="readonly" :disabled="disabled">
            <template v-slot:content="{ item, idx }">
              <v-container fluid class="ma-0 pa-0">
                <v-row no-gutters>
                  <v-col cols="12" lg="2" xl="2" class="pa-1 d-flex justify-center align-center">
                    <v-radio-group class="ma-0 pa-1" dense hide-details mandatory row v-model="item.type" @change="onFileTypeChanged(item, $event, idx)" :disabled="disabled || readonly">
                      <v-radio label="Binary" value="binary" color="success"></v-radio>
                      <v-radio label="Record" value="record" color="success"></v-radio>
                    </v-radio-group>
                  </v-col>

                  <v-col cols="12" lg="6" xl="6" class="pa-1">
                    <v-combobox v-model="item.address" :items="getAddressItems(getFileSubType(item.type, idx))" @change="formatAddress(item.address, idx, item)" :key="address_version_key" :disabled="disabled || readonly" :label="meta.address.label" :type="meta.address.type" :rules="meta.address.rule" :hint="item.type == 'binary' ? `Binary ${getAddressMeta(item.address).hint}` : `Record ${getAddressMeta(item.address).hint}`" persistent-hint outlined dense></v-combobox>
                  </v-col>

                  <template v-if="item.type == 'binary'">
                    <v-col cols="12" lg="1" xl="1" class="pa-1">
                      <v-text-field v-model.number="item.binary.offset" @change="onSimpleChange($event)" :label="meta.offset.label" :type="meta.offset.type" :disabled="disabled || readonly" :rules="getRule(getLenMeta(idx), item.binary.offset, item.binary.len)" :hint="`Binary ${meta.offset.hint}`" persistent-hint outlined dense></v-text-field>
                    </v-col>

                    <v-col cols="12" lg="3" xl="3" class="pa-1">
                      <v-text-field v-model.number="item.binary.len" @change="onSimpleChange($event)" :label="getLenMeta(idx).label" :type="getLenMeta(idx).type" :disabled="disabled || readonly" :rules="getRule(getLenMeta(idx), item.binary.offset, item.binary.len)" :hint="`Binary ${getLenMeta(idx).hint}`" persistent-hint outlined dense></v-text-field>
                    </v-col>
                  </template>

                  <template v-else>
                    <v-col cols="12" lg="1" xl="1" class="pa-1">
                      <v-text-field v-model="item.record.number" @change="onSimpleChange($event)" :label="getNumMeta(idx).label" :type="getNumMeta(idx).type" :disabled="disabled || readonly" :rules="getNumMeta(idx).rule" :hint="`Record ${getNumMeta(idx).hint}`" persistent-hint outlined dense></v-text-field>
                    </v-col>

                    <v-col cols="12" lg="3" xl="3" class="pa-1">
                      <v-text-field v-model.number="item.record.len" @change="onSimpleChange($event)" :label="getLenMeta(idx).label" :type="getLenMeta(idx).type" :disabled="disabled || readonly" :hint="`Record ${getLenMeta(idx).hint}`" persistent-hint outlined dense></v-text-field>
                    </v-col>
                  </template>
                </v-row>
              </v-container>
            </template>
          </flo-position-control>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import floRfmMisc from "~/components/se/floRfmMisc.vue";
import floPositionControl from "~/components/widgets/floPositionControl.vue";
export default {
  name: "flo-rfm-read",
  components: {
    floRfmMisc,
    floPositionControl,
  },
  data() {
    return {
      address_version_key: 1,
      subTypeMap: [],
      val: {
        type: "binary",
        address: "",
        binary: {
          offset: 0,
          len: 0,
        },
      },
      operation: {
        type: "reads",
        reads: [
          {
            type: "binary",
            address: "",
            binary: {
              offset: 0,
              len: 0,
            },
          },
        ],
      },
      meta: {
        ec: {
          label: "EC Type",
          hint: "Select EC Type",
          items: [],
          value: "",
          input: "text",
          type: "text",
          rule: [(v) => !!v || "Field is required."],
        },
        address: {
          label: "Address",
          items: [],
          input: "text",
          type: "text",
          rule: [(v) => /^(?:[a-fA-F0-9]{4}\/?)*$/gm.test(v) || "Field accepts HEX only."],
        },
        offset: {
          label: "Offset",
          hint: "Offset",
          input: "number",
          type: "number",
          rule: [(v) => (v >= 0 && v <= 32767) || "Field is required and accepts numbers from 0 to 32 767"],
        },
      },
    };
  },
  props: {
    uicc: {
      type: Object,
      default: null,
    },
    value: {
      type: Object,
      default: () => {},
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    transport: {
      type: String,
      required: true,
      default: "",
    },
  },
  computed: {
    setMultiple() {
      if (this.transport == "sms") {
        this.operation.reads = [this.operation.reads[0]];
        return false;
      }
      return true;
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      console.log(`flo-rfm-read - initialize - value - ${JSON.stringify(this.value)}`);
      if (null == this.value) {
        console.log(`flo-rfm-read - initialize - value is null`);
        this.syncParent();
      } else {
        this.operation = this.value;
        console.log(`flo-rfm-read - initialize - value (operation) : ${JSON.stringify(this.operation)}`);
      }
    },
    getUiccAids() {
      if (!this.uicc.hasOwnProperty("aids")) {
        return null;
      }
      return this.uicc.aids;
    },
    syncParent() {
      console.log(`flo-rfm-read - syncParent - enter - ${JSON.stringify(this.operation)}`);
      this.$emit("change", this.operation);
    },
    onSimpleChange() {
      this.syncParent();
    },
    onMiscChange(event) {
      console.log(`flo-rfm-read - onMiscChange - event - ${JSON.stringify(event)}`);
      let l_op = this.operation;

      if (!event.hasOwnProperty("app")) {
        if (l_op.hasOwnProperty("app")) {
          delete l_op.app;
        }
      } else {
        l_op["app"] = event.app;
      }

      if (!event.hasOwnProperty("cla")) {
        if (l_op.hasOwnProperty("cla")) {
          delete l_op.cla;
        }
      } else {
        l_op["cla"] = event.cla;
      }

      if (!event.hasOwnProperty("base")) {
        if (l_op.hasOwnProperty("base")) {
          delete l_op.base;
        }
      } else {
        l_op["base"] = event.base;
      }

      console.log(`flo-rfm-read - onMiscChange - operation l_op - ${JSON.stringify(l_op)}`);
      this.syncParent();
    },
    onFileTypeChanged(op, event, idx) {
      console.log(`flo-rfm-read - onFileTypeChanged - enter - event:${event} - op:${JSON.stringify(op)}`);
      switch (event) {
        case "binary":
          {
            if (op.hasOwnProperty("record")) {
              delete op.record;
            }

            op["binary"] = { offset: 0, len: 0 };
          }
          break;
        case "record":
          {
            if (op.hasOwnProperty("binary")) {
              delete op.binary;
            }

            op["record"] = { number: 1, len: 0 };
          }
          break;
      }

      this.operation.reads[idx].address = [];
      this.syncParent();
    },
    getFileSubType(file_type, idx) {
      console.log(`flo-rfm-read - getFileSubType - enter - idx: ${idx}`);
      console.log(`flo-rfm-read - getFileSubType - enter - subTypeMap: ${JSON.stringify(this.subTypeMap[idx])}`);
      if (!this.subTypeMap[idx]) {
        this.subTypeMap[idx] = ["tr", "lnk"];
      }

      if (file_type == "binary" && this.subTypeMap[idx].includes("lf")) {
        this.subTypeMap[idx] = ["tr", "lnk"];
      } else if (file_type == "record" && this.subTypeMap[idx].includes("tr")) {
        this.subTypeMap[idx] = ["lf", "cyc", "lnk"];
      }
      console.log(`flo-rfm-read - getFileSubType - exit - subTypeMap: ${JSON.stringify(this.subTypeMap[idx])}`);
      return this.subTypeMap[idx];
    },
    onFileSubTypeChange(event, idx) {
      this.subTypeMap[idx] = event;
      console.log(`flo-rfm-read - onFileSubTypeChange - enter - file_sub_type: ${this.subTypeMap[idx]}`);
      this.address_version_key++;
      this.syncParent();
    },
    getAddressItems(file_sub_type) {
      if (this.uicc == null) {
        console.log("flo-rfm-read - getAddressItems - No UICC");
        return [];
      }
      if (this.uicc.ec == null) {
        console.log("flo-rfm-read - getAddressItems - No UICC");
        return [];
      }
      if (!this.uicc.hasOwnProperty("ec")) {
        console.log("flo-rfm-read - getAddressItems - No EC");
        return [];
      }

      let found = this.uicc.ec.reduce((acc, ec) => {
        if (file_sub_type.includes(ec.type.toLowerCase())) {
          acc.push(`${ec.url} - ${ec.name} - ${ec.type}`);
        }

        return acc;
      }, []);

      return found;
    },
    formatAddress(address, idx, item) {
      let laddress = address.trim();
      if (laddress.includes("-")) {
        laddress = laddress.split("-")[0];
      }
      let ladd = laddress.trim();
      this.operation.reads[idx].address = ladd;

      let filtered = [];
      if (ladd != "") {
        filtered = this.uicc.ec.filter((f) => f.url == ladd);
      }
      let litem = item[item.type];

      if (litem.hasOwnProperty("offset")) {
        litem.offset = 0;
      }
      if (litem.hasOwnProperty("number")) {
        litem.number = 1;
      }
      if (filtered.length > 0 && filtered[0].recsize != undefined) {
        let recsize = filtered[0].recsize;
        recsize = parseInt(recsize);
        if (litem.hasOwnProperty("len")) {
          litem.len = recsize;
        }
      }

      console.log(`flo-rfm-read - formatAddress - ${JSON.stringify(this.operation.reads[idx])}`);
      this.address_version_key++;
      this.syncParent();
    },
    getAddressMeta(address) {
      let lmeta = {
        hint: "Address",
      };
      let filtered = [];

      if (address != "") {
        let laddress = address.trim();
        if (laddress != "") {
          filtered = this.uicc.ec.filter((f) => f.url == laddress);
        }

        if (filtered.length > 0) {
          lmeta.hint = `address name is ${filtered[0].name}, type is ${filtered[0].type}.`;
        }
      }

      return lmeta;
    },
    getLenMeta(idx) {
      let filtered = [];
      let laddress = this.operation.reads[idx].address;

      let lmeta = {
        hint: "Length",
        label: "Length",
        input: "number",
        type: "number",
      };

      if (laddress != "") {
        filtered = this.uicc.ec.filter((f) => f.url == laddress);
      }

      if (filtered.length > 0 && filtered[0].recsize != undefined) {
        let recsize = filtered[0].recsize;
        recsize = parseInt(recsize);

        lmeta["recsize"] = recsize;
        lmeta.hint = `Length is ${recsize} (from UICC).`;
      }
      return lmeta;
    },
    getNumMeta(idx) {
      let filtered = [];
      let laddress = this.operation.reads[idx].address;
      let lmeta = {
        label: "Number",
        hint: "Number",
        input: "text",
        type: "text",
      };

      if (laddress != "") {
        filtered = this.uicc.ec.filter((f) => f.url == laddress);
      }

      if (filtered.length > 0 && filtered[0].recno != undefined) {
        let recno = filtered[0].recno;
        lmeta.hint = `Number from 1 to ${recno}.`;
        lmeta.rule = [(v) => (v >= 1 && v <= parseInt(recno)) || `Field is required and accepts numbers from 1 to ${recno}.`];
      }
      return lmeta;
    },
    getRule(ec, offset, len) {
      console.log(`flo-rfm-read - getRule - EC: ${JSON.stringify(ec)}, offset: ${offset}, length: ${len}`);
      let lrule = [(v) => !v || "Please select an Address."];
      if (undefined != ec.recsize) {
        let loffset = parseInt(offset);
        let llen = parseInt(len);
        let total = loffset + llen;
        let lrecsize = ec.recsize;

        if (total > lrecsize) {
          lrule = [(v) => `Total Offset + Length cannot exceed ${lrecsize}.`];
        } else {
          lrule = [(v) => (v >= 0 && v <= lrecsize) || `Field is required and accepts numbers from 0 to ${lrecsize}.`];
        }
      }
      return lrule;
    },
    getDescription(item, idx) {
      let laddress_hint = item.type == "binary" ? `Binary ${this.getAddressMeta(item.address).hint}` : `Record ${this.getAddressMeta(item.address).hint}`;
      let loffset_hint = `Binary ${this.meta.offset.hint}`;
      let llen_hint = `Binary ${this.getLenMeta(idx).hint}`;

      return `${laddress_hint}${loffset_hint}${llen_hint}`;
    },
  },
};
</script>
