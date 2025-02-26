<template>
  <v-container v-if="!loading" fluid class="ma-0 pa-0 flo-card-virtual-file">
    <v-row no-gutters>
      <v-col cols="12" class="ma-0 pa-1 zubin1">
        <flo-expand :title="`${vfile.name} - ${vfile.description}`" elevation="5" :open="false">
          <template v-slot:content="{}">
            <v-container fluid class="ma-0 pa-0">
              <v-row no-gutters>
                <v-col cols="12" class="pa-2">
                  <p class="text-subtitle-2 font-weight-light primary--text ma-0 pa-0 mx-1" v-if="vfile.cvf_id">Id: {{ vfile.cvf_id }}, {{ vfile.name }}</p>
                  <p class="text-subtitle-2 font-weight-light info--text ma-0 pa-0 mx-1">URL: {{ vfile.url }}</p>
                  <p class="text-subtitle-2 font-weight-light info--text ma-0 pa-0 mx-1">Type: {{ helpers.capitalizeFLetter(vfile.type) }}</p>
                  <p class="text-subtitle-2 font-weight-light info--text ma-0 pa-0 mx-1">{{ vfile.type == "binary" ? `Offset: ${vfile.offset}` : `Record Number: ${vfile.offset}` }}, Length: {{ vfile.len }}</p>
                  <p class="text-subtitle-2 font-weight-light info--text ma-0 pa-0 mx-1 mb-1">Last Updated: {{ helpers.toLocalTimeInIsoFormatUi(vfile.ts) }}</p>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" lg="2" xl="2" class="pa-1">
                  <v-select v-model="op_access_type" :items="getAccessTypes()" @change="onAccessTypeChanged($event, vfile)" label="Access Type" hint="Access Type" :disabled="disabled || readonly" item-text="value" item-value="key" dense persistent-hint outlined></v-select>
                </v-col>
                <v-col v-if="op_access_type == 'writes' && getParams().length > 0" cols="12" lg="2" xl="2" class="pa-1">
                  <v-select v-model="val_types.value" @change="onValChange($event)" :items="val_types.items" :label="val_types.label" :hint="val_types.hint" :disabled="disabled || readonly" :key="val_types.key" item-text="value" item-value="key" outlined dense persistent-hint></v-select>
                </v-col>
                <v-col v-if="op_access_type == 'writes' && val_types.value" cols="12" lg="3" xl="3" class="pa-1">
                  <v-select v-model="vfile.param" @change="setFileValue($event)" :items="getParams()" :label="getParamInfo(vfile.param).desc" :type="getParamInfo(vfile.param).type" :hint="getParamInfo(vfile.param).hint" :disabled="disabled || readonly" item-text="desc" item-value="name" persistent-hint outlined dense></v-select>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" class="px-2">
                  <p v-if="op_access_type == 'writes' && vfile.param" class="text-subtitle-2 font-weight-light ma-1 pa-1">Parameter: {{ vfile.param }}</p>
                  <p v-else-if="op_access_type != 'writes'" class="text-subtitle-2 font-weight-light ma-1 pa-1">Value: {{ vfile.value }}</p>
                  <v-textarea v-else v-model="vfile.value" @change="setFileValue($event)" :rules="getRule(vfile.len * 2)" :counter="vfile.len * 2" :disabled="op_access_type != 'writes' || readonly" label="File Value" dense no-resize auto-grow outlined></v-textarea>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" class="ma-0 pa-0">
                  <flo-virtual-tree :tree-data="getFieldsTree(vfile.fields)">
                    <template v-slot:item="{ item, idx }">
                      <slot name="item">
                        <v-col v-for="i in getElementsCount(item)" cols="12" lg="3" xl="3" class="ma-0 pa-1" :key="`field-${i}:${idx}`">
                          <v-card outlined :key="`field-${i}:${idx}`" class="ma-0 pa-0" height="100%">
                            <v-card-text class="ma-0 pa-0">
                              <v-container fluid class="ma-0 pa-0">
                                <v-row no-gutters>
                                  <v-col cols="12">
                                    <p class="text-subtitle-2 font-weight-light ma-0 pa-0 info--text mx-1" v-text="getFieldNameNice(item, i)"></p>
                                  </v-col>
                                </v-row>

                                <v-row no-gutters v-if="op_access_type == 'specific'" :key="vf_key">
                                  <v-col cols="6" lg="3" xl="3" class="ma-0 pa-0"><v-checkbox class="ma-0 pa-0 subheading font-weight-light" @change="setSelected($event, 'r', item, i)" :input-value="getSelectedRead(item, i)" v-if="item.perm.toLowerCase() == 'r' || item.perm.toLowerCase() == 'rw'" :disabled="disabled || readonly" color="success" label="Read" dense hide-details></v-checkbox></v-col>
                                  <v-col cols="6" lg="3" xl="3" class="ma-0 pa-0"><v-checkbox class="ma-0 pa-0 subheading font-weight-light" @change="setSelected($event, 'w', item, i)" :input-value="getSelectedWrite(item, i)" v-if="item.perm.toLowerCase() == 'w' || item.perm.toLowerCase() == 'rw'" :disabled="disabled || readonly" color="success" label="Write" dense hide-details></v-checkbox></v-col>
                                  <template v-if="getParams().length > 0 && getSelectedWrite(item, i)">
                                    <v-col cols="6" lg="3" xl="3" class="ma-0 pa-0"><v-checkbox class="ma-0 pa-0 subheading font-weight-light" @change="setElementParam($event, 'params', i, item)" :input-value="getElementParam(i, 'params')" v-if="item.perm.toLowerCase() == 'w' || item.perm.toLowerCase() == 'rw'" :disabled="disabled || readonly" color="success" label="Params" dense hide-details></v-checkbox></v-col>
                                  </template>
                                </v-row>

                                <v-row no-gutters>
                                  <v-col cols="12" class="pa-1">
                                    <v-container class="ma-0 pa-0" fluid>
                                      <v-row no-gutters>
                                        <v-col cols="12">
                                          <template v-if="getParams().length > 0 && vfile.param">
                                            <v-col cols="12" class="ma-0 pa-0">
                                              <flo-virtual-field-view :header="item" :index="i" :value="getVfElementValue(item, i)" />
                                            </v-col>
                                          </template>
                                          <template v-else-if="op_access_type == 'writes' || (op_access_type == 'specific' && getSelectedWrite(item, i))">
                                            <v-col :key="vf_key" v-if="getElementParam(i, 'params')" cols="12" class="ma-0 pa-0">
                                              <flo-virtual-field-edit :header="formatParams()" :index="i" :value="getVfElementValueEdit(item, i)" @change="setVfElementValue($event, item, i)" :disabled="disabled" />
                                            </v-col>
                                            <v-col v-else cols="12" class="ma-0 pa-0">
                                              <flo-virtual-field-edit :header="item" :pattern="item.pattern ? item.pattern : ''" :index="i" :value="getVfElementValueEdit(item, i)" @change="setVfElementValue($event, item, i)" :disabled="disabled" :uicc="uicc" />
                                            </v-col>
                                          </template>
                                          <template v-else>
                                            <v-col cols="12" class="ma-0 pa-0">
                                              <flo-virtual-field-view :header="item" :index="i" :value="getVfElementValue(item, i)" :disabled="disabled" :uicc="uicc" />
                                            </v-col>
                                          </template>
                                        </v-col>
                                      </v-row>
                                    </v-container>
                                  </v-col>
                                </v-row>
                              </v-container>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </slot>
                    </template>
                  </flo-virtual-tree>
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
import { mapGetters, mapActions } from "vuex";
import floVirtualFieldView from "~/components/virtual/floVirtualFieldView";
import floVirtualFieldEdit from "~/components/virtual/floVirtualFieldEdit";
import floVirtualTree from "~/components/virtual/floVirtualTree";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  name: "flo-card-virtual-file",
  components: {
    floVirtualTree,
    floVirtualFieldView,
    floVirtualFieldEdit,
  },
  data() {
    return {
      helpers,
      vf_key: 1,
      loading: true,
      doperation: null,
      op_access_type: "view",
      operators: [],
      val_type: [],
      backup_value: "",
      val_types: {
        key: 1,
        value: 0,
        label: "Value Type",
        hint: "Select Value Type",
        items: [
          { key: 0, value: "Raw" },
          { key: 1, value: "Parameters" },
        ],
      },
    };
  },
  props: {
    value: {
      type: [Object, Array],
      default: null,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    vfile: {
      type: [Object, Array],
      required: true,
      default: null,
    },
    operation: {
      type: [Object, Array],
      required: false,
      default: null,
    },
    uicc: {
      type: Object,
      required: false,
      default: null,
    },
    parameters: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  computed: {
    ...mapGetters({
      getResourceKey: "session/getResourceKey",
    }),
  },
  created() {
    this.initialize();
  },
  mixins: [parseNetError, tellUser],
  methods: {
    ...mapActions({
      addToResourceCache: "session/addToResourceCache",
    }),
    async initialize() {
      console.log(`flo-card-virtual-file - initialize - enter`);
      if (null == this.value) {
        console.log(`flo-card-virtual-file - initialize - value is null`);
      } else {
        console.log(`flo-card-virtual-file - initialize: ${JSON.stringify(this.value)}`);
      }

      if (this.vfile.hasOwnProperty("value")) {
        this.backup_value = `${this.vfile.value}`;
      }

      if (this.operation) {
        this.doperation = JSON.parse(JSON.stringify(this.operation));
        console.log(`flo-card-virtual-file - initialize - doperation: ${JSON.stringify(this.doperation)}`);
      }

      this.op_access_type = this.getAccessType();

      this.fixupFileValue();
      this.loading = false;
    },
    fixupFileValue() {
      console.log(`flo-card-virtual-file - fixupFileValue - enter`);
      let lvfile = this.vfile;
      if (!this.doperation) {
        console.log(`flo-card-virtual-file - fixupFileValue - url:${lvfile.url} no doperation`);
        return;
      }

      console.log(`flo-card-virtual-file - fixupFileValue - url:${lvfile.url} has doperation`);
      if (!this.doperation.fields) {
        console.log(`flo-card-virtual-file - fixupFileValue - url:${lvfile.url} no fields`);
        return;
      }

      console.log(`flo-card-virtual-file - fixupFileValue - url:${lvfile.url} has fields`);
      let l_fields = this.doperation.fields;

      for (let fi = 0; fi < l_fields.length; fi++) {
        const field = l_fields[fi];

        if (field.dir == "writes") {
          if (field.ref.endsWith("/all/1")) {
            lvfile.value = field.value;
            console.log(`flo-card-virtual-file - fixupFileValue - url:${lvfile.url} set all`);
            return;
          } else {
            let l_ref_parts = field.ref.split("/");
            if (l_ref_parts.length != 5) {
              // bad ref ..
              console.log(`flo-card-virtual-file - fixupFileValue - bad ref:${JSON.stringify(field)}`);
              continue;
            }

            let field_key = l_ref_parts[3];
            let element = l_ref_parts[4];

            console.log(`flo-card-virtual-file - fixupFileValue - field_key:${field_key} element:${element}`);

            // find the field
            if (!lvfile.hasOwnProperty("fields")) {
              console.log(`flo-card-virtual-file - fixupFileValue - field_key:${field_key} element:${element} vfile no fields.`);
              continue;
            }

            let lvfield = lvfile.fields.find((f) => f.key == field_key);

            if (lvfield) {
              let l_val = "";

              if (field.hasOwnProperty("value")) {
                l_val = field.value;
              }

              if (field.hasOwnProperty("param")) {
                this.setElementParam(true, "params", element);
                this.setVfElementWrite(field.param, lvfield, element);
              }

              if (l_val) {
                this.vfile.value = this.set_field_value(lvfile.value, lvfield, element, l_val);
              }
            }
          }
        }
      }
    },
    getAccessType() {
      console.log(`flo-card-virtual-file - getAccessType - enter`);
      let l_access_type = "view";
      let l_operation = this.doperation;
      if (!l_operation) {
        return l_access_type;
      }

      if (l_operation.hasOwnProperty("fields")) {
        console.log(`flo-card-virtual-file - getAccessType: has fields`);
        if (l_operation.fields.length > 0) {
          console.log(`flo-card-virtual-file - getAccessType: fields greater than 0`);
          let field = l_operation.fields[0];
          console.log(`flo-card-virtual-file - getAccessType: field ${JSON.stringify(field)}`);
          if (field.hasOwnProperty("ref")) {
            console.log(`flo-card-virtual-file - getAccessType: has ref: ${field.ref}`);
            if (field.hasOwnProperty("dir")) {
              l_access_type = field.dir;
              console.log(`flo-card-virtual-file - getAccessType: has type: ${l_access_type}`);
              if (!field.ref.endsWith("all/1")) {
                l_access_type = "specific";
                console.log(`flo-card-virtual-file - getAccessType: change type: specific`);
              }
            }
          }
        }
      }
      console.log(`flo-card-virtual-file - getAccessType -  l_access_type: ${l_access_type}`);
      return l_access_type;
    },
    getAccessTypes() {
      let v = [
        { key: "view", value: "View" },
        { key: "reads", value: "Read All" },
        { key: "writes", value: "Write All" },
      ];

      if (this.vfile.type != "record") {
        v.push({ key: "specific", value: "Specific Fields" });
      }

      return v;
    },
    getElementsCount(field) {
      if (!field.hasOwnProperty("elements") || field.elements == "") {
        return 1;
      } else {
        return field.elements;
      }
    },
    getFieldsTree(fields) {
      let lfields = [];
      if (fields != {} && fields.length > 0) {
        lfields = fields.filter((vfield) => vfield.perm.toLowerCase() != "deprecated");
      }

      // create root
      let root = {
        gkey: "",
      };

      if (lfields.length > 0) {
        for (let ih = 0; ih < lfields.length; ih++) {
          // get next header
          const h = lfields[ih];
          // point iterator to root
          let it = root;

          // if it has path (i.e. not root header)
          if (h.hasOwnProperty("gpath")) {
            // split the path to branches
            let gpath = h.gpath;
            // console.log(`flo-card-virtual-file: getFieldsTree - gpath - ${JSON.stringify(gpath)}`);
            let gpath_arr = gpath.split("/");
            // console.log(`flo-card-virtual-file: getFieldsTree - gpath_arr - ${JSON.stringify(gpath_arr)}`);

            // traverse over the branches
            // "" is the root
            // "", "sub1", "sub2"

            const lbranches = gpath_arr.length;
            for (let igbk = 0; igbk < lbranches; igbk++) {
              // get branch key
              const lgbk = gpath_arr[igbk];

              // console.log(`flo-card-virtual-file: getFieldsTree - lgbk - ${lgbk}`);

              if (it.gkey == lgbk) {
                // console.log(`flo-card-virtual-file: getFieldsTree - lgbk - ${lgbk} - continue`);
                continue;
              }

              // console.log(`flo-card-virtual-file: getFieldsTree - it - ${JSON.stringify(it)}`);

              // create children if needed
              if (!it.hasOwnProperty("children")) {
                // console.log(`flo-card-virtual-file: getFieldsTree - lgbk - ${lgbk} has no children .. create`);
                it["children"] = [];
              }

              // get children
              let children = it["children"];

              // find gkey
              let founds = children.filter((c) => c.gkey == lgbk);
              if (founds.length > 0) {
                it = founds[0];
              } else {
                it = { gkey: lgbk };
                children.push(it);
              }
            }
          }

          if (!it.hasOwnProperty("items")) {
            it["items"] = [];
          }

          it.items.push(h);
        }
      }

      return root;
    },
    syncParent() {
      console.log(`flo-card-virtual-file - syncParent - enter - ${JSON.stringify(this.doperation)}`);
      this.$emit("change", this.doperation);
    },
    formatElementWrite(event, item) {
      let v = "";
      if (item) {
        switch (item.pattern) {
          case "bitmask":
            v = this.toBitmask(item, event);
            break;
          case "parse:hex:1:unsigned":
            v = this.toU8hex(event);
            break;
          case "parse:hex:2:unsigned":
            v = this.toU16hex(event);
            break;
          case "bool":
            v = this.toBoolhex(event);
            break;
          default:
            v = event;
        }
      }
      return v;
    },
    onValChange(event) {
      console.log(`flo-card-virtual-file - onValChange - event: ${event} param - ${this.vfile.param} - vfile.value - ${this.vfile.value} - backup_value - ${this.backup_value}`);

      if (!event) {
        this.setFileValue(this.backup_value);

        if (this.vfile.hasOwnProperty("param")) {
          delete this.vfile.param;
        }
      }

      this.syncParent();
    },
    formatParams() {
      let formatted_param = null;
      if (this.getParams().length > 0) {
        let l_params = this.getParams();
        let l_param = { description: "Parameter", hint: "Please Select Parameter", format: "enum", enum: [] };

        for (let i = 0; i < l_params.length; i++) {
          const param = l_params[i];
          l_param.enum.push({ key: param.name, value: param.desc });
        }

        formatted_param = l_param;
      }

      return formatted_param;
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

      if (this.getParams().length > 0) {
        if (val) {
          let found = this.getParams().find((f) => f.name == val);
          if (found) {
            l_info = found;
          }
        }
      }

      return l_info;
    },
    getElementParam(i, type) {
      let found = this.val_type.find((f) => f.i == i && f.type == type);

      if (found) {
        return found.val;
      }

      return 0;
    },
    setElementParam(event, type, i, item) {
      console.log(`flo-card-virtual-file - setElementParam - type: ${JSON.stringify(type)}, event: ${JSON.stringify(event)}, i: ${JSON.stringify(i)}, item: ${JSON.stringify(item)}`);
      let l_val_type = { i: i, type: type, val: event ? 1 : 0 };
      let idx = this.val_type.findIndex((f) => f.i == i);
      let found = this.val_type.some((f) => f.i == i);

      if (found) {
        this.val_type.splice(idx, 1);
        this.val_type.push(l_val_type);
      } else {
        this.val_type.push(l_val_type);
      }

      if (!event) {
        this.setVfElementWrite(this.getVfElementValueEdit(item, i), item, i);
      }

      this.syncParent();
    },
    setVfElementWrite(event, item, i) {
      console.log(`flo-card-virtual-file - setVfElementWrite - event: ${JSON.stringify(event)} item: ${JSON.stringify(item)} i: ${i}`);

      if (null == this.doperation) {
        this.doperation = {};
      }

      if (!this.doperation.hasOwnProperty("fields")) {
        this.doperation["fields"] = [];
      }

      let v = this.formatElementWrite(event, item);

      let ref = this.calculateReference(item, i);
      let found = this.doperation.fields.find((f) => f.ref == ref);
      let param = null;
      if (this.getParams().length > 0) {
        param = this.getParams().find((f) => f.name == v);
      }
      if (!found) {
        let lobj = {
          type: "vfield",
          ref: ref,
          dir: "writes",
        };
        if (param) {
          lobj["param"] = v;
          delete lobj["value"];
        } else {
          lobj["value"] = v;
          delete lobj["param"];
        }
        let l_at_url = this.vfile.url.replace(/\//g, "@");
        this.doperation["ref"] = `/vfile/${l_at_url}`;
        this.doperation.fields.push(lobj);
      } else {
        found.dir = "writes";
        if (param) {
          found["param"] = v;
          delete found["value"];
        } else {
          found["value"] = v;
          delete found["param"];
        }
      }

      this.syncParent();
    },
    setVfElementRead(item, i) {
      console.log(`flo-card-virtual-file - setVfElementRead - item: ${JSON.stringify(item)} i: ${i}`);
      if (null == this.doperation) {
        this.doperation = {};
      }

      if (!this.doperation.hasOwnProperty("fields")) {
        this.doperation["fields"] = [];
      }

      let ref = this.calculateReference(item, i);
      let found = this.doperation.fields.find((f) => f.ref == ref);

      if (!found) {
        let lobj = {
          type: "vfield",
          ref: ref,
          dir: "reads",
        };
        let l_at_url = this.vfile.url.replace(/\//g, "@");
        this.doperation["ref"] = `/vfile/${l_at_url}`;
        this.doperation.fields.push(lobj);
      } else {
        found.dir = "reads";
        if (found.hasOwnProperty("value")) {
          delete found.value;
        }
      }

      this.syncParent();
    },
    getVfElementValueEdit(field, i) {
      console.log(`flo-card-virtual-file - getVfElementValueEdit - enter`);
      console.log(`flo-card-virtual-file - getVfElementValueEdit - field:${JSON.stringify(field)} i:${i}`);

      if (!this.doperation) {
        console.log(`flo-card-virtual-file - getVfElementValueEdit - no operation - get value from file.`);
        return this.getVfElementValue(field, i);
      }
      console.log(`flo-card-virtual-file - getVfElementValueEdit - has doperation.`);

      if (!this.doperation.hasOwnProperty("fields")) {
        console.log(`flo-card-virtual-file - getVfElementValueEdit - no fields - get value from file.`);
        return this.getVfElementValue(field, i);
      }
      console.log(`flo-card-virtual-file - getVfElementValueEdit - has fields.`);

      let l_fields = this.doperation.fields;
      let l_ref = "";

      if (this.op_access_type == "specific") {
        l_ref = this.calculateReference(field, i);
      } else {
        let l_at_url = this.vfile.url.replace(/\//g, "@");
        l_ref = `/vfile/${l_at_url}/all/1`;
      }

      console.log(`flo-card-virtual-file - getVfElementValueEdit - find:${l_ref}.`);
      let found = l_fields.find((f) => f.ref == l_ref);
      if (!found) {
        console.log(`flo-card-virtual-file - getVfElementValueEdit - not found: ${l_ref}.`);
        return this.getVfElementValue(field, i);
      }

      console.log(`flo-card-virtual-file - getVfElementValueEdit - found: ${l_ref}.`);
      if (found.hasOwnProperty("param")) {
        return found.param;
      }

      if (!found.hasOwnProperty("value")) {
        console.log(`flo-card-virtual-file - getVfElementValueEdit - found: ${l_ref} no value.`);
        return this.getVfElementValue(field, i);
      }

      console.log(`flo-card-virtual-file - getVfElementValueEdit - found: ${l_ref} value:${found.value}.`);

      if (this.op_access_type == "specific") {
        console.log(`flo-card-virtual-file - getVfElementValueEdit - specific - value:${found.value}.`);
        return found.value;
      }
      console.log(`flo-card-virtual-file - getVfElementValueEdit - all - field.offset:${field.offset} field.len:${field.len} i:${i}.`);
      let lfvalue = this.get_field_value(found.value, field, i);
      console.log(`flo-card-virtual-file - getVfElementValueEdit - all - value:${lfvalue}.`);

      return lfvalue;
    },
    getVfElementValue(field, i) {
      if (field) {
        let lfvalue = this.get_field_value(this.vfile.value, field, i);
        switch (field.pattern) {
          case "parse:hex:1:unsigned":
            return this.fromU8hex(lfvalue);
          case "parse:hex:2:unsigned":
            return this.fromU16hex(lfvalue);
          case "bool":
            return this.fromBoolhex(lfvalue);
          default:
            return lfvalue;
        }
      }
    },
    get_field_value(data, field, element) {
      return data.substr((field.offset + field.len * (element - 1)) * 2, field.len * 2);
    },
    set_field_value(data, field, element, value) {
      let lval = data;
      let lval_left = "";
      let lval_right = "";
      let l_relative_left = field.offset + field.len * (element - 1);
      let l_relative_right = l_relative_left + field.len;

      if (l_relative_left != 0) {
        lval_left = lval.substr(0, l_relative_left * 2);
      }

      lval_right = lval.substr(l_relative_right * 2);
      console.log(`flo-card-virtual-file - set_field_value - lval_left: ${lval_left} value: ${value} lval_right: ${lval_right}`);
      return `${lval_left}${value}${lval_right}`;
    },
    setVfElementValue(event, field, i) {
      console.log(`flo-card-virtual-file - setVfElementValue - enter`);
      if (this.op_access_type == "specific") {
        console.log(`flo-card-virtual-file - setVfElementValue - specific`);
        if (event) {
          this.setVfElementWrite(event, field, i);
        }
      }

      let v = this.formatElementWrite(event, field);

      if (v.length != field.len * 2) {
        console.log(`flo-card-virtual-file - setVfElementValue - field.len:${field.len} v.length:${v.length} field.len * 2:${field.len * 2}`);
        return;
      }
      console.log(`flo-card-virtual-file - setVfElementValue - this.vfile.value: ${JSON.stringify(this.vfile.value)} field: ${JSON.stringify(field)}`);
      console.log(`flo-card-virtual-file - setVfElementValue - i:${i}, v:${v}`);

      this.vfile.value = this.set_field_value(this.vfile.value, field, i, v);
      this.setFileValue(this.vfile.value);
    },
    getSelectedRead(item, i) {
      let l_operation = this.doperation;
      if (!l_operation) {
        return 0;
      }

      if (!l_operation.hasOwnProperty("fields")) {
        return 0;
      }

      if (l_operation.fields.length == 0) {
        return 0;
      }

      let lref = this.calculateReference(item, i);

      let found = l_operation.fields.find((f) => f.dir == "reads" && f.ref == lref);
      if (!found) {
        return 0;
      }

      return 1;
    },
    getSelectedWrite(item, i) {
      let l_operation = this.doperation;
      if (!l_operation) {
        return 0;
      }

      if (!l_operation.hasOwnProperty("fields")) {
        return 0;
      }

      if (l_operation.fields.length == 0) {
        return 0;
      }

      let lref = this.calculateReference(item, i);

      let found = l_operation.fields.find((f) => f.dir == "writes" && f.ref == lref);
      if (!found) {
        return 0;
      }

      return 1;
    },
    setSelected(event, dir, item, i) {
      console.log(`flo-card-virtual-file - setSelected - enter - event: ${event} dir: ${dir} i: ${i}`);

      if (event) {
        if (dir == "r") {
          let l_backup_field_value = this.get_field_value(this.backup_value, item, i);
          console.log(`flo-card-virtual-file - setSelected - l_backup_field_value: ${l_backup_field_value}`);
          this.vfile.value = this.set_field_value(this.vfile.value, item, i, l_backup_field_value);

          this.setVfElementRead(item, i);
        }

        if (dir == "w") {
          this.setVfElementWrite(this.getVfElementValue(item, i), item, i);
        }
      } else {
        console.log(`flo-card-virtual-file - setSelected - fields - before: ${JSON.stringify(this.doperation.fields)}`);
        let ref = this.calculateReference(item, i);
        console.log(`flo-card-virtual-file - setSelected - ref: ${ref}`);

        let remain = this.doperation.fields.filter((f) => f.ref != ref);
        console.log(`flo-card-virtual-file - setSelected - remain: ${JSON.stringify(remain)}`);

        this.doperation.fields = remain;
        console.log(`flo-card-virtual-file - setSelected - i: ${i} operation: ${JSON.stringify(this.doperation)}`);
        console.log(`flo-card-virtual-file - setSelected - fields - after: ${JSON.stringify(this.doperation.fields)}`);
        this.syncParent();
      }
    },
    calculateReference(item, i) {
      let lref = "";

      if (item) {
        if (item.hasOwnProperty("key")) {
          lref = item.key.toLowerCase();
        } else {
          lref = item.name.toLowerCase();
        }
      }

      let l_at_url = this.vfile.url.replace(/\//g, "@");

      lref = `/vfile/${l_at_url}/${lref}/${i}`;
      return lref;
    },
    fromBitmask(field, val) {
      let lbitmask = field.bitmask.filter((e) => e.key == val);
      if (lbitmask.length > 0) {
        return lbitmask[0].value;
      }

      return val;
    },
    toBitmask(field, val) {
      console.log(`flo-card-virtual-file - toBitmask - val: ${JSON.stringify(val)} field: ${JSON.stringify(field.bitmask)}`);
      let lbitmask = field.bitmask.filter((e) => e.value == val);
      console.log(`flo-card-virtual-file - toBitmask - lbitmask: ${JSON.stringify(lbitmask)}`);
      if (lbitmask.length > 0) {
        return lbitmask[0].key;
      }

      return val;
    },
    fromU8hex(val) {
      let num = parseInt(val, 16);
      return num >= 0 && num <= 255 ? num : NaN;
    },
    toU8hex(val) {
      let num = parseInt(val, 10);
      if (num < 0 || num > 255) return NaN;
      return helpers.padHex(num, 2).toUpperCase();
    },
    fromU16hex(val) {
      let num = parseInt(val, 16);
      return num >= 0 && num <= 65535 ? num : NaN;
    },
    toU16hex(val) {
      let num = parseInt(val, 10);
      if (num < 0 || num > 65535) return NaN;
      return helpers.padHex(num, 4).toUpperCase();
    },
    fromBoolhex(val) {
      return parseInt(val, 16) == 1 ? true : false;
    },
    toBoolhex(val) {
      if (val) {
        return helpers.padHex(1, 2);
      } else {
        return helpers.padHex(0, 2);
      }
    },
    getRule(val) {
      if (val) {
        let lrule = [(v) => (v ? v.length <= val && v.length >= val : v) || `Total file length must be ${val}.`];
        return lrule;
      }
    },
    getFieldName(item, i) {
      if (!item.hasOwnProperty("name")) {
        return "";
      }

      if (!item.hasOwnProperty("elements")) {
        return item.name;
      }

      if (item.elements == 1) {
        return item.name;
      }

      return `${item.name} ${i}`;
    },
    getFieldNameNice(item, i) {
      let lname = this.getFieldName(item, i);
      return helpers.formatString(lname);
    },
    formatName(name, i) {
      let lname = "";
      if (null != i) {
        lname = `${name} ${i}`;
      } else {
        lname = name;
      }
      return helpers.formatString(lname);
    },
    onAccessTypeChanged(event, file) {
      console.log(`flo-card-virtual-file - onAccessTypeChanged - enter - event: ${JSON.stringify(event)}, file: ${JSON.stringify(file)}`);
      let lopp = {};

      this.vfile["op_access_type"] = event;

      file.value = `${this.backup_value}`;
      let l_at_url = file.url.replace(/\//g, "@");

      lopp = {
        ref: `/vfile/${l_at_url}`,
        type: "fields",
        fields: [],
      };

      switch (event) {
        case "reads":
          {
            lopp.fields.push({
              dir: "reads",
              ref: `${lopp.ref}/all/1`,
            });
          }
          break;

        case "writes":
          {
            lopp.fields.push({
              dir: "writes",
              ref: `${lopp.ref}/all/1`,
              value: file.value,
            });
          }
          break;
      }

      console.log(`flo-card-virtual-file - onAccessTypeChanged - leave - event: ${JSON.stringify(event)}, file: ${JSON.stringify(file)}`);
      this.doperation = lopp;
      this.syncParent();
    },
    setFileValue(event) {
      console.log(`flo-card-virtual-file - setFileValue - event: ${JSON.stringify(event)} - backup val - ${this.backup_value}`);

      let param = null;
      if (this.getParams().length > 0) {
        param = this.getParams().find((f) => f.name == event);
      }

      this.vfile.value = event;
      if (this.doperation.hasOwnProperty("fields")) {
        let field = this.doperation.fields.find((f) => f.hasOwnProperty("ref") && f.ref.endsWith("/all/1"));
        if (field) {
          if (param) {
            field["param"] = event;
            delete field["value"];
          } else {
            field["value"] = event;
            delete field["param"];
          }
        }
      }
      this.syncParent();
    },
    async loadOperators() {
      let operators = this.getResourceKey("main", "operators", "table");
      if (!operators) {
        try {
          let query = {
            select: {},
          };

          operators = await this.$axios.$post("api/v1/operators/list", query);
          this.addToResourceCache({ module: "main", resource: "operators", key: "table", expire: 1500, value: operators });
          return operators;
        } catch (err) {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
          return [];
        }
      }

      return [];
    },
  },
};
</script>
