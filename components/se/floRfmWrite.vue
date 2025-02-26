<template>
  <div class="flo-rfm-write">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col cols="12" class="pa-1">
          <flo-rfm-misc @change="onMiscChange($event)" :aids="getUiccAids()" :value="value" :transport="transport" :readonly="readonly" :disabled="disabled" aid_category="RFM" />
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col cols="12" class="pa-1">
          <flo-position-control :items="operation.writes" :value="val" :multiple="true" :readonly="readonly" :disabled="disabled">
            <template v-slot:content="{ item, idx }">
              <v-container fluid class="ma-0 pa-0">
                <v-row no-gutters>
                  <v-col cols="12" lg="2" xl="2" class="pa-1 d-flex justify-center align-center">
                    <v-radio-group class="ma-0 pa-1" dense hide-details mandatory row v-model="item.type" @change="onFileTypeChanged(item, $event, idx)" :disabled="disabled || readonly">
                      <v-radio label="Binary" value="binary" color="success"></v-radio>
                      <v-radio label="Record" value="record" color="success"></v-radio>
                    </v-radio-group>
                  </v-col>
                  <v-col cols="12" lg="4" xl="4" class="pa-1">
                    <v-combobox v-model="item.address" :items="getAddressItems(getFileSubType(item.type, idx))" @change="formatAddress(item.address, idx, item)" :key="address_version_key" :label="meta.address.label" :type="meta.address.type" :rules="meta.address.rule" :disabled="disabled || readonly" :hint="item.type == 'binary' ? `Binary ${getAddressMeta(item.address).hint}` : `Record ${getAddressMeta(item.address).hint}`" persistent-hint outlined dense></v-combobox>
                  </v-col>

                  <template v-if="item.type == 'binary'">
                    <v-col cols="12" lg="1" xl="1" class="pa-1">
                      <v-text-field v-model.number="item.binary.offset" @input="onSimpleChange($event)" :label="meta.offset.label" :type="meta.offset.type" :rules="meta.offset.rule" :disabled="disabled || readonly" :hint="item.type == 'binary' ? `Binary ${meta.offset.hint}` : `Record ${meta.offset.hint}`" persistent-hint outlined dense></v-text-field>
                    </v-col>

                    <template v-if="parameters.length > 0">
                      <v-col cols="12" lg="2" xl="2" class="pa-1">
                        <v-select :value="getValType(idx, item)" @change="setValType($event, idx, item)" :items="meta.val_type.items" :label="meta.val_type.label" :hint="meta.val_type.hint" :disabled="disabled || readonly" item-text="value" item-value="key" outlined dense persistent-hint></v-select>
                      </v-col>
                      <v-col v-if="getValType(idx, item)" cols="12" lg="3" xl="3" class="pa-1">
                        <v-select v-model="item.binary.param" @change="onParamChange($event, item)" :items="getParams()" :label="getParamInfo(item.binary.param).desc" :type="getParamInfo(item.binary.param).type" :hint="getParamInfo(item.binary.param).hint" :disabled="disabled || readonly" item-text="desc" item-value="name" persistent-hint outlined dense></v-select>
                      </v-col>
                    </template>

                    <v-col v-if="!getValType(idx, item)" cols="12" lg="3" xl="3" class="pa-1">
                      <v-text-field v-model="item.binary.value" @input="onValChange($event, item)" :counter="getValMeta(idx).counter" :label="getValMeta(idx).label" :type="getValMeta(idx).type" :rules="getValMeta(idx).rule" :disabled="disabled || readonly" :hint="item.type == 'binary' ? `Binary ${getValMeta(idx).hint}` : `Record ${getValMeta(idx).hint}`" persistent-hint outlined dense></v-text-field>
                    </v-col>
                  </template>

                  <template v-else>
                    <v-col cols="12" lg="1" xl="1" class="pa-1">
                      <v-text-field v-model.number="item.record.number" @input="onSimpleChange($event)" :label="getNumMeta(idx).label" :type="getNumMeta(idx).type" :rules="getNumMeta(idx).rule" :disabled="disabled || readonly" :hint="item.type == 'binary' ? `Binary ${getNumMeta(idx).hint}` : `Record ${getNumMeta(idx).hint}`" persistent-hint outlined dense></v-text-field>
                    </v-col>

                    <template v-if="parameters.length > 0">
                      <v-col cols="12" lg="2" xl="2" class="pa-1">
                        <v-select :value="getValType(idx, item)" @change="setValType($event, idx, item)" :items="meta.val_type.items" :label="meta.val_type.label" :hint="meta.val_type.hint" :disabled="disabled || readonly" item-text="value" item-value="key" outlined dense persistent-hint></v-select>
                      </v-col>
                      <v-col v-if="getValType(idx, item)" cols="12" lg="3" xl="3" class="pa-1">
                        <v-select v-model="item.record.param" @change="onParamChange($event, item)" :items="getParams()" :label="getParamInfo(item.record.param).desc" :type="getParamInfo(item.record.param).type" :hint="getParamInfo(item.record.param).hint" :disabled="disabled || readonly" item-text="desc" item-value="name" persistent-hint outlined dense></v-select>
                      </v-col>
                    </template>

                    <v-col v-if="!getValType(idx, item)" cols="12" lg="3" xl="3" class="pa-1">
                      <v-text-field v-model="item.record.value" @input="onValChange($event, item)" :counter="getValMeta(idx).counter" :label="getValMeta(idx).label" :type="getValMeta(idx).type" :rules="getValMeta(idx).rule" :disabled="disabled || readonly" :hint="item.type == 'binary' ? `Binary ${getValMeta(idx).hint}` : `Record ${getValMeta(idx).hint}`" persistent-hint outlined dense></v-text-field>
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
  name: "flo-rfm-write",
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
          value: "",
        },
      },
      operation: {
        type: "writes",
        writes: [
          {
            type: "binary",
            address: "",
            binary: {
              offset: 0,
            },
          },
        ],
      },
      meta: {
        ec: {
          label: "File Type",
          hint: "Select File Type",
          value: "",
          input: "text",
          type: "text",
          rule: [(v) => !!v || "Field is required."],
        },
        address: {
          label: "Address",
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
        val_type: {
          value: [],
          label: "Value Type",
          hint: "Select Value Type",
          items: [
            { key: 0, value: "Raw" },
            { key: 1, value: "Parameters" },
          ],
        },
      },
    };
  },
  props: {
    uicc: {
      type: Object,
      default: () => {},
    },
    value: {
      type: Object,
      default: () => {},
    },
    transport: {
      type: String,
      required: true,
      default: "",
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    parameters: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      if (null == this.value) {
        console.log(`flo-rfm-write - initialize - value is null`);
        this.syncParent();
      } else {
        this.operation = this.value;
        console.log(`flo-rfm-write - initialize - value (operation): ${JSON.stringify(this.operation)}`);
      }
    },
    syncParent() {
      console.log(`flo-rfm-write - syncParent - enter - ${JSON.stringify(this.operation)}`);
      this.$emit("change", this.operation);
    },
    onSimpleChange() {
      this.syncParent();
    },
    onMiscChange(event) {
      console.log(`flo-rfm-write - onMiscChange - event - ${JSON.stringify(event)}`);
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

      console.log(`flo-rfm-write - onMiscChange - operation l_op - ${JSON.stringify(l_op)}`);
      this.syncParent();
    },
    getUiccAids() {
      if (!this.uicc.hasOwnProperty("aids")) {
        return null;
      }
      return this.uicc.aids;
    },
    onFileTypeChanged(op, event, idx) {
      console.log(`flo-rfm-write - onFileTypeChanged - enter - event:${event} - op:${JSON.stringify(op)}`);
      let lvalue = "";
      switch (event) {
        case "binary":
          {
            if (op.hasOwnProperty("record")) {
              lvalue = op.record.value;
              delete op.record;
            }

            op["binary"] = { offset: 0, value: lvalue };
          }
          break;
        case "record":
          {
            if (op.hasOwnProperty("binary")) {
              lvalue = op.binary.value;
              delete op.binary;
            }

            op["record"] = { number: 1, value: lvalue };
          }
          break;
      }
      this.operation.writes[idx].address = [];
      this.syncParent();
    },
    getFileSubType(file_type, idx) {
      console.log(`flo-rfm-write - getFileSubType - enter - idx: ${idx}`);
      console.log(`flo-rfm-write - getFileSubType - enter - subTypeMap: ${JSON.stringify(this.subTypeMap[idx])}`);
      if (!this.subTypeMap[idx]) {
        this.subTypeMap[idx] = ["tr"];
      }

      if (file_type == "binary" && this.subTypeMap[idx].includes("lf")) {
        this.subTypeMap[idx] = ["tr"];
      } else if (file_type == "record" && this.subTypeMap[idx].includes("tr")) {
        this.subTypeMap[idx] = ["lf", "cyc"];
      }

      return this.subTypeMap[idx];
    },
    onFileSubTypeChange(event, idx) {
      this.subTypeMap[idx] = event;
      console.log(`flo-rfm-write - onFileSubTypeChange - enter - file_sub_type: ${this.subTypeMap[idx]}`);
      this.address_version_key++;
      this.syncParent();
    },
    getAddressItems(file_sub_type) {
      if (this.uicc == null) {
        console.log("flo-rfm-write - getAddressItems - No UICC");
        return [];
      }
      if (this.uicc.ec == null) {
        console.log("flo-rfm-write - getAddressItems - No UICC");
        return [];
      }
      if (!this.uicc.hasOwnProperty("ec")) {
        console.log("flo-rfm-write - getAddressItems - No EC");
        return [];
      }

      let found = this.uicc.ec.reduce((acc, ec) => {
        if (ec.hasOwnProperty("update")) {
          let access = ["yes", "pin1", "pin2", "adm", "adm1", "alw"];
          if (access.includes(ec.update.toLowerCase())) {
            if (file_sub_type.includes(ec.type.toLowerCase())) {
              acc.push(`${ec.url} - ${ec.name} - ${ec.type}`);
            }
          }
        }

        return acc;
      }, []);

      return found;
    },
    formatAddress(address, idx, item) {
      let litem = item[item.type];
      if (litem.hasOwnProperty("offset")) {
        litem.offset = 0;
      }
      if (litem.hasOwnProperty("value")) {
        litem.value = "";
      }
      let laddress = address.trim();
      if (laddress.includes("-")) {
        laddress = laddress.split("-")[0];
      }

      let ladd = laddress.trim();
      this.operation.writes[idx].address = ladd;
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
    getNumMeta(idx) {
      let filtered = [];
      let laddress = this.operation.writes[idx].address;
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
    getValMeta(idx) {
      let filtered = [];
      let laddress = this.operation.writes[idx].address;
      let lmeta = {
        label: "Value",
        hint: "Value",
        input: "text",
        type: "text",
        counter: 0,
        rule: [(v) => /^(..)*$/.test(v) || "Field is required and it must be even length."],
      };

      if (laddress != "") {
        filtered = this.uicc.ec.filter((f) => f.url == laddress);
      }

      if (filtered.length > 0 && filtered[0].recsize != undefined) {
        let recsize = filtered[0].recsize;
        lmeta.hint = `value length is ${recsize} (from UICC).`;
        lmeta.counter = parseInt(recsize) * 2;
        lmeta.rule = [(v) => (v ? v.length <= parseInt(recsize) * 2 && /^(..)*$/.test(v) : v) || `Field is required, it must be even and max length is ${recsize}.`];
      }
      return lmeta;
    },
    getParams() {
      let l_params = [];

      if (this.parameters.length > 0) {
        l_params = this.parameters;
      }

      return l_params;
    },
    getParamInfo(val) {
      let l_info = {
        name: "",
        default: "",
        desc: "Parameter",
        hint: "Please Select Parameter",
        type: "string",
      };

      if (val) {
        let found = this.getParams().find((f) => f.name == val);

        if (found) {
          l_info = found;
        }
      }

      return l_info;
    },
    getValType(i, item) {
      let l_val = 0;
      let found = this.meta.val_type.value.find((f) => f.i == i);

      if (found) {
        l_val = found.val;
      } else if (item.hasOwnProperty("type")) {
        let l_type = item.type;
        if (item[l_type].hasOwnProperty("param")) {
          l_val = 1;
        }
      }

      return l_val;
    },
    setValType(event, i, item) {
      let l_val_type = this.meta.val_type.value;
      let l_val = { i: i, val: event ? 1 : 0 };
      let idx = l_val_type.findIndex((f) => f.i == i);
      let found = l_val_type.some((f) => f.i == i);

      if (found) {
        l_val_type.splice(idx, 1);
        l_val_type.push(l_val);
      } else {
        l_val_type.push(l_val);
      }

      this.onParamChange(event, item);
    },
    onValChange(event, item) {
      if (this.parameters.length > 0) {
        if (event) {
          if (item.hasOwnProperty("binary")) {
            if (item.binary.hasOwnProperty("param")) {
              delete item.binary.param;
            }
          } else if (item.hasOwnProperty("record")) {
            if (item.record.hasOwnProperty("param")) {
              delete item.record.param;
            }
          }
        }
      }

      this.syncParent();
    },
    onParamChange(event, item) {
      if (this.parameters.length > 0) {
        if (event) {
          if (item.hasOwnProperty("binary")) {
            if (item.binary.hasOwnProperty("value")) {
              delete item.binary.value;
            }
          } else if (item.hasOwnProperty("record")) {
            if (item.record.hasOwnProperty("value")) {
              delete item.record.value;
            }
          }
        }
      }

      this.syncParent();
    },
  },
};
</script>
