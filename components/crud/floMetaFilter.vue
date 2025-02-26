<template>
  <v-container fluid class="ma-0 pa-0 flo-meta-filter">
    <v-row no-gutters align="center" justify="space-between">
      <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
        <v-container fluid class="d-flex flex-row justify-start align-center ma-0 pa-0">
          <v-row no-gutters>
            <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'">
              <template v-if="show_reload">
                <v-progress-circular v-if="prog_timer_id != 0" :rotate="270" :size="28" :width="3" :value="getProgressPercent()" color="success">
                  {{ progress }}
                </v-progress-circular>

                <v-btn v-else icon color="primary" @click="reload()">
                  <v-icon>mdi-reload</v-icon>
                </v-btn>

                <v-btn :color="`${pull_timer_id == 0 ? 'primary' : 'success'}`" icon @click="resetReloadTimer(30)">
                  <v-icon>mdi-fast-forward-30</v-icon>
                </v-btn>
              </template></v-col
            >
            <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
              <slot name="show_time_range"></slot>
            </v-col>
            <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1"><v-autocomplete v-if="show_filter" :__qa="`${getResQATag()}@action@search`" clearable hide-details single-line cache-items append-icon="mdi-filter" v-model="auto" :dense="true" :items="comb" item-text="t" item-value="v" placeholder="Start typing your filter" @change="onAutoChange($event)" @input="onAutoInput($event)"></v-autocomplete></v-col>
            <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1"><v-text-field v-if="show_search" :__qa="`${getResQATag()}@action@search`" :value="lookup" @input="$emit('onlookup', $event)" :append-icon="!lookup ? 'mdi-magnify' : ''" :dense="true" clearable placeholder="Search within results" single-line hide-details></v-text-field></v-col>
          </v-row>

          <v-dialog :overlay-opacity="0.4" v-model="dialog" max-width="500px">
            <v-card v-if="dialog">
              <v-card-title>
                <span class="headline">{{ editIdx == -1 ? "Add" : "Edit" }} Filter</span>
              </v-card-title>
              <v-form v-model="valid_save" @submit.prevent="save">
                <v-card-text>
                  <v-container fluid class="ma-0 pa-0">
                    <v-row no-gutters>
                      <v-col cols="12" class="pa-1">
                        <v-select label="Field" v-model="selected_field" :items="fields" item-text="text" />
                      </v-col>

                      <template v-if="selected_field !== ''">
                        <v-col v-if="getType(selected_field) !== 'boolean'" cols="12" class="pa-1">
                          <v-select label="Compare" v-model="selected_op" :items="op" />
                        </v-col>
                      </template>

                      <template v-if="selected_field !== ''">
                        <v-col v-if="getType(selected_field) == 'boolean'" cols="12" class="pa-1">
                          <v-switch inset color="success" v-model="selected_value" class="justify-center"></v-switch>
                        </v-col>

                        <template v-else-if="getType(selected_field) === 'timestamp'">
                          <v-col cols="12" class="pa-1">
                            <v-menu ref="menu_dp" v-model="menu_dp" :close-on-content-click="false" transition="scale-transition" offset-y max-width="290px" min-width="290px">
                              <template v-slot:activator="{ on }">
                                <v-text-field v-model="value_dp" label="Date" hint="YYYY-MM-DD format" persistent-hint prepend-icon="mdi-calendar" v-on="on"></v-text-field>
                              </template>
                              <v-date-picker v-model="value_dp" no-title @input="menu_dp = false"></v-date-picker>
                            </v-menu>
                          </v-col>
                          <v-col cols="12" class="pa-1">
                            <v-menu ref="menu_tp" v-model="menu_tp" :close-on-content-click="false" :nudge-right="40" :return-value.sync="value_tp" transition="scale-transition" offset-y max-width="290px" min-width="290px">
                              <template v-slot:activator="{ on }">
                                <v-text-field v-model="value_tp" label="Time" hint="HH-MM-SS format" persistent-hint prepend-icon="mdi-clock" readonly v-on="on"></v-text-field>
                              </template>
                              <v-time-picker v-if="menu_tp" v-model="value_tp" format="24hr" use-seconds @click:second="$refs.menu_tp.save(value_tp)"></v-time-picker>
                            </v-menu>
                          </v-col>
                        </template>

                        <v-col v-else cols="12" class="pa-1">
                          <template v-if="needsTranslation(selected_field)">
                            <flo-meta-select-translator :value="selected_value" :label="getDesc(selected_field)" :items="getTranslatorKeyValues(selected_field)" @change="onTranslatorChanged($event)" />
                          </template>

                          <template v-else-if="getEnum(selected_field)">
                            <flo-meta-select-translator :value="selected_value" :label="getDesc(selected_field)" :items="getEnum(selected_field)" @change="onTranslatorChanged($event)" />
                          </template>

                          <template v-else>
                            <v-text-field v-model="selected_value" label="Value" autofocus persistent-hint :rules="[rules]" :hint="getHumanCreteria(auto)"></v-text-field>
                          </template>
                        </v-col>
                      </template>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <div class="flex-grow-1"></div>
                  <v-btn color="primary" text @click="cancel">Cancel</v-btn>
                  <v-btn color="primary" :disabled="!valid_save" text type="submit">{{ editIdx == -1 ? "Add" : "Save" }}</v-btn>
                </v-card-actions>
              </v-form>
            </v-card>
          </v-dialog>

          <v-dialog :overlay-opacity="0.4" v-model="diag_add" max-width="500px">
            <v-card v-if="diag_add && auto">
              <v-card-title>
                <span class="headline">Add Filter</span>
              </v-card-title>
              <v-form v-model="valid_add" @submit.prevent="add">
                <v-card-text>
                  <v-container fluid class="ma-0 pa-0">
                    <v-row no-gutters>
                      <v-col v-if="getType(auto.k) == 'boolean'" cols="12" class="pa-1">
                        <v-switch inset color="success" v-model="selected_value" class="justify-center" :label="getHumanCreteria(auto)"></v-switch>
                      </v-col>
                      <template v-else-if="getType(auto.k) === 'timestamp'">
                        <v-col cols="12">
                          <v-menu ref="menu_dp" v-model="menu_dp" :close-on-content-click="false" transition="scale-transition" offset-y max-width="290px" min-width="290px">
                            <template v-slot:activator="{ on }">
                              <v-text-field v-model="value_dp" label="Date" hint="YYYY-MM-DD format" persistent-hint prepend-icon="mdi-calendar" v-on="on"></v-text-field>
                            </template>
                            <v-date-picker v-model="value_dp" no-title @input="menu_dp = false"></v-date-picker>
                          </v-menu>
                        </v-col>
                        <v-col cols="12">
                          <v-menu ref="menu_tp" v-model="menu_tp" :close-on-content-click="false" :nudge-right="40" :return-value.sync="value_tp" transition="scale-transition" offset-y max-width="290px" min-width="290px">
                            <template v-slot:activator="{ on }">
                              <v-text-field v-model="value_tp" label="Time" hint="HH-MM-SS format" persistent-hint prepend-icon="mdi-clock" readonly v-on="on"></v-text-field>
                            </template>
                            <v-time-picker v-if="menu_tp" v-model="value_tp" format="24hr" use-seconds @click:second="$refs.menu_tp.save(value_tp)"></v-time-picker>
                          </v-menu>
                        </v-col>
                      </template>

                      <v-col v-else cols="12" class="pa-1">
                        <template v-if="needsTranslation(auto.k)">
                          <flo-meta-select-translator value="" :label="getDesc(auto.k)" :items="getTranslatorKeyValues(auto.k)" @change="onTranslatorChanged($event)" />
                        </template>

                        <template v-else-if="getEnum(auto.k)">
                          <flo-meta-select-translator value="" :label="getDesc(auto.k)" :items="getEnum(auto.k)" @change="onTranslatorChanged($event)" />
                        </template>

                        <template v-else>
                          <v-text-field v-model="selected_value" label="Value" autofocus persistent-hint :rules="[rules]" :hint="getHumanCreteria(auto)"></v-text-field>
                        </template>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <div class="flex-grow-1"></div>
                  <v-btn color="primary" text @click="cancel_add">Cancel</v-btn>
                  <v-btn color="primary" :disabled="!valid_add" text type="submit">Add</v-btn>
                </v-card-actions>
              </v-form>
            </v-card>
          </v-dialog>
        </v-container>
      </v-col>
      <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
        <v-container fluid class="d-flex flex-row justify-space-between align-center ma-0 pa-0">
          <slot name="extra"></slot>
        </v-container>
      </v-col>
    </v-row>

    <v-row v-if="filters.length" no-gutters>
      <v-col cols="12" :class="`pa-1`">
        <v-container fluid class="d-flex flex-row justify-center align-center ma-0 pa-0">
          <v-chip-group show-arrows column>
            <template v-for="filter in filters">
              <v-chip v-if="!hiddenFilter(filter)" :key="filter.idx" class="mx-1" close small outlined color="info" close-icon="mdi-delete" @click="editExisting(filter.idx)" @click:close="closeChip(filter.idx)">{{ getHumanFilter(filter) }}</v-chip>
            </template>
          </v-chip-group>

          <div class="flex-grow-1"></div>
          <div class="flex-grow-1"></div>
          <div class="flex-grow-1"></div>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: "flo-meta-filter",
  props: {
    meta: {
      type: Object,
      required: true,
    },
    translator: {
      type: [Object],
      required: false,
    },
    headers: {
      type: [Array],
      required: false,
    },
    hidden_filter: {
      type: [Array],
      required: false,
    },
    init_filter: {
      type: [Array],
      required: false,
    },
    use_filter_cache: {
      type: Boolean,
      required: false,
      default: true,
    },
    count: {
      type: Number,
      required: true,
      default: 0,
    },
    limit: {
      type: Number,
      required: false,
      default: 100,
    },
    offset: {
      type: Number,
      required: false,
      default: 0,
    },
    dense: {
      type: Boolean,
      required: false,
      default: false,
    },
    unique: {
      type: String,
      required: false,
      default: "1",
    },
    refresh: {
      type: Number,
      required: false,
      default: 0,
    },
    suspend: {
      type: Boolean,
      required: false,
      default: false,
    },
    show_filter: {
      type: Boolean,
      required: false,
      default: true,
    },
    show_reload: {
      type: Boolean,
      required: false,
      default: true,
    },
    show_search: {
      type: Boolean,
      required: false,
      default: true,
    },
    lookup: {
      type: String,
      required: false,
    },
    resources: {
      type: String,
      required: false,
    },
  },
  data: function () {
    return {
      reloading: false,
      valid_save: false,
      valid_add: false,
      dlookup: this.lookup,
      auto: {},
      menu_dp: false,
      value_dp: new Date().toISOString().substr(0, 10),
      menu_tp: false,
      value_tp: null,
      dialog: false,
      diag_add: false,
      cseq: 1,
      selected_op: "",
      selected_field: "",
      selected_value: "",
      filters: [],
      editIdx: -1,
      pull_timer_id: 0,
      prog_timer_id: 0,
      progress: 0,
      d_refresh: 0,
    };
  },
  computed: {
    fields: {
      clookup: {
        get() {
          return this.dlookup;
        },
        set(param) {
          this.dlookup = param;
        },
      },
      get() {
        let arr = [];
        for (const key of Object.keys(this.meta.keys)) {
          if (this.getType(key) != "json") {
            arr.push({ text: this.meta.keys[key].desc, value: key });
          }
        }
        return arr;
      },
    },
    op: {
      get() {
        let type = this.getType(this.selected_field);
        return this.getOpsByType(this.selected_field, type);
      },
    },
    comb: {
      get() {
        let map = [];

        if (typeof this.meta === "undefined") {
          return map;
        }

        if (typeof this.meta.keys === "undefined") {
          return map;
        }

        for (const key of Object.keys(this.meta.keys)) {
          let okey = this.meta.keys[key];
          if (okey.type === "json") {
            continue;
          }

          let ops = this.getOpsByType(key, okey.type);
          for (let iop = 0; iop < ops.length; iop++) {
            let filter = {
              k: key,
              op: ops[iop],
            };

            let filter_name = this.getHumanCreteria(filter);
            let item = {
              t: filter_name,
              v: filter,
            };

            map.push(item);
          }
        }

        return map;
      },
    },
  },
  watch: {
    dialog(val) {
      val || this.cancel();
    },
    diag_add(val) {
      this.selected_value = "";
      val || this.cancel();
    },
    value_dp(val) {
      if (null == this.value_tp) {
        this.selected_value = `${val} 00:00:00`;
      } else {
        this.selected_value = `${val} ${this.value_tp}`;
      }
    },
    value_tp(val) {
      if (null == val) {
        this.selected_value = `${this.value_dp} 00:00:00`;
      } else {
        this.selected_value = `${this.value_dp} ${val}`;
      }
    },
    limit() {
      this.reload();
    },
    offset() {
      this.reload();
    },
    hidden_filter() {
      this.reFilter();
    },
  },
  created() {
    this.initialize();
  },
  beforeDestroy() {
    this.stopTimers();
  },
  methods: {
    getResQATag() {
      return this.resources.toLowerCase();
    },
    stopTimers() {
      this.stopPullTimer();
      this.stopProgTimer();
    },
    stopPullTimer() {
      // clear all timers
      if (0 != this.pull_timer_id) {
        clearInterval(this.pull_timer_id);
        this.pull_timer_id = 0;
      }
    },
    stopProgTimer() {
      // clear all timers
      if (0 != this.prog_timer_id) {
        clearInterval(this.prog_timer_id);
        this.prog_timer_id = 0;
        this.progress = 0;
      }
    },
    resetReloadTimer(timeout_sec) {
      console.log(`resetReloadTimer - enter - pull_timer_id:${this.pull_timer_id}`);

      if (this.pull_timer_id) {
        // end a timer
        this.stopTimers();
      } else {
        // start a timer
        let lrefresh = this.d_refresh == 0 ? timeout_sec : this.d_refresh;
        let ltick = 1000;
        let lrefresh_mili = lrefresh * ltick;
        console.log(`resetReloadTimer - lrefresh_mili: ${lrefresh_mili}`);
        this.startProgTimer(lrefresh_mili);
        this.pull_timer_id = setInterval(() => {
          this.stopProgTimer();
          this.startProgTimer(lrefresh_mili);
          this.reload();
        }, lrefresh_mili);
      }
    },
    startProgTimer() {
      this.progress = this.d_refresh;
      this.prog_timer_id = setInterval(() => {
        this.progress--;
      }, 1000);
    },
    getProgressPercent() {
      if (0 == this.d_refresh) {
        return 0;
      }

      if (0 == this.progress) {
        return 0;
      }

      if (this.d_refresh == this.progress) {
        return 100;
      }

      return 100 - ((this.d_refresh - this.progress) / this.d_refresh) * 100;
    },
    fromUiFormatToLocalDate(ts) {
      let parts = ts.split(" ");
      let dparts = parts[0].split("-");
      let tparts = parts[1].split(":");

      let tsDate = new Date(parseInt(dparts[0], 10), parseInt(dparts[1], 10) - 1, parseInt(dparts[2], 10), parseInt(tparts[0], 10), parseInt(tparts[1], 10), parseInt(tparts[2], 10), 0);
      return tsDate;
    },
    needsTranslation(key) {
      console.log(`needsTranslation - typeof:${typeof this.translator}`);
      if (typeof this.translator === "undefined" || this.translator === null) {
        console.log(`needsTranslation - translator == undefined`);
        return false;
      }

      return this.translator.hasTranslator(key);
    },
    rules(value) {
      let header = null;
      let op = null;

      if (this.auto) {
        header = this.getHeader(this.auto.k);
        op = this.auto.op;
      } else {
        header = this.getHeader(this.selected_field);
        op = this.selected_op;
      }
      if (!header.nullable && !header.default && (value === null || value === "")) {
        return "Validation failed, field must have a value.";
      }
      if (header.min !== undefined && value < header.min) {
        return `Validation failed, value ${value} is less than ${header.min}.`;
      }
      if (header.max !== undefined && value > header.max) {
        return `Validation failed, value ${value} is bigger than ${header.max}.`;
      }
      if (["equal", "not equal"].includes(op)) {
        return new RegExp(header.pattern).test(value) || "Validation failed, value doesn't match pattern.";
      }

      return true;
    },
    showLimit() {
      return this.count >= this.limit;
    },
    hiddenFilter(filter) {
      if (!filter.hasOwnProperty("hidden")) return false;

      if (filter.hidden) return true;

      return false;
    },
    getOpsByType(key, type) {
      let l_type = type;
      if (this.translator != null) {
        let l_translator = this.translator;
        if (l_translator.hasOwnProperty("translators")) {
          let l_translators = l_translator.translators;
          if (l_translators.hasOwnProperty(key)) {
            if ("timestamp" != key && "ts" != key) {
              l_type = "enum";
            }
          }
        }
      }

      let filter_type = [];
      switch (l_type) {
        case "string":
        case "text":
          filter_type = ["equal", "not equal", "icontains", "contains", "istarts", "starts", "iends", "ends"];
          break;
        case "number":
          filter_type = ["equal", "not equal", "greater", "less", "<=", ">="];
          break;
        case "timestamp":
          filter_type = ["equal", "not equal", "before", "after"];
          break;
        case "enum":
          filter_type = ["equal", "not equal"];
          break;
        case "tags":
          filter_type = ["icontains", "contains"];
          break;
        case "boolean":
          filter_type = ["equal"];
          break;
        default:
          filter_type = ["equal", "not equal", "greater", "less", "<=", ">=", "icontains", "contains", "istarts", "starts", "iends", "ends"];
          break;
      }

      return filter_type;
    },
    getTranslatorKeyValues(name) {
      let tmp = this.translator.getKeyValues(name).map(({ disabled, ...rest }) => rest);
      return JSON.parse(JSON.stringify(tmp));
    },
    getKey(name) {
      if (typeof name === "undefined") {
        return null;
      }
      if ("" === name) {
        return null;
      }
      if (!this.meta.hasOwnProperty("keys")) {
        return null;
      }

      return this.meta.keys[name];
    },
    getEnumSubType(name) {
      let oenum = this.getEnum(name);
      if (!oenum) {
        return "";
      }

      return oenum.subtype;
    },
    getEnumType(name) {
      let oenum = this.getEnum(name);
      if (!oenum) {
        return "";
      }

      return oenum.type;
    },
    getEnum(name) {
      let okey = this.getKey(name);

      if (!okey) {
        return null;
      }

      if (!this.headers) {
        return null;
      }

      let headers = this.headers.filter((h) => h.value == name);

      if (headers.size <= 0) {
        return null;
      }

      if (headers.length == 0) {
        return null;
      }

      let header = headers[0];

      if (!header.hasOwnProperty("enum")) {
        return null;
      }
      return header.enum;
    },
    getType(name) {
      let okey = this.getKey(name);

      if (!okey) {
        return null;
      }

      return okey.type;
    },
    getHumanCreteria(filter) {
      if (!filter) {
        return "There's no filter.";
      }
      return `${this.getDesc(filter.k)} ${filter.op}`;
    },
    getHumanFilter(filter) {
      let l_value = filter.v;
      let l_type = this.getType(filter.k);
      let l_enum = this.getEnum(filter.k);
      let l_desc = this.getDesc(filter.k);

      if (l_enum) {
        console.log(`flo-meta-filter - getHumanFilter - filter: ${JSON.stringify(filter)}`);
        if (l_enum) {
          let l_found = l_enum.find((f) => f.key == l_value);
          if (l_found) {
            l_value = l_found.value;
          }
        }
      }

      if ("boolean" === l_type) {
        if (filter.v) {
          return `${l_desc} is true`;
        } else {
          return `${l_desc} is false`;
        }
      } else if ("timestamp" === l_type) {
        if (l_value.endsWith("00:00:00")) {
          return `${l_desc} ${filter.op} ${l_value.substr(0, 10)}`;
        } else {
          return `${l_desc} ${filter.op} ${l_value}`;
        }
      } else {
        if (this.needsTranslation(filter.k)) {
          let l_val = this.translator.toUIByKey(filter.k, l_value);
          return `${l_desc} ${filter.op} ${l_val}`;
        } else {
          return `${l_desc} ${filter.op} ${l_value}`;
        }
      }
    },
    getDesc(name) {
      if (!name) {
        return "";
      }
      if (typeof name === "undefined") {
        return "";
      }
      if ("" === name) {
        return "";
      }
      if (!this.meta.hasOwnProperty("keys")) {
        return "";
      }
      if (this.meta.keys[name]) {
        return this.meta.keys[name].desc;
      }
    },
    getHeader(name) {
      if (typeof name === "undefined") {
        return "";
      }
      if ("" === name) {
        return "";
      }
      return this.meta.keys[name];
    },
    addFilter() {
      this.editIdx = -1;
      this.selected_op = "equal";
      this.selected_field = "";
      this.selected_value = "";
      this.dialog = true;
    },
    reFilter() {
      this.filters = [];
      if (this.hidden_filter && typeof this.hidden_filter !== "undefined") {
        for (let i = 0; i < this.hidden_filter.length; i++) {
          let item = this.hidden_filter[i];
          item["hidden"] = true;
          this.cseq++;
          item["idx"] = this.cseq;
          console.log(`flo-meta-filter.vue - reFilter - k: ${item.k}`);
          console.log(`flo-meta-filter.vue - reFilter - has t: ${item.hasOwnProperty("t")}`);
          console.log(`flo-meta-filter.vue - reFilter - getType: ${this.getType(item.k)}`);
          if (!item.hasOwnProperty("t") || !item.t) {
            let ftype = this.getType(item.k);
            item["t"] = ftype;
          }

          this.filters.push(item);
        }
      }
      if (typeof this.init_filter !== "undefined" && this.init_filter.length > 0) {
        for (let i = 0; i < this.init_filter.length; i++) {
          let item = this.init_filter[i];
          item["init"] = true;
          this.cseq++;
          item["idx"] = this.cseq;
          if (!item.hasOwnProperty("t") || !item.t) {
            let ftype = this.getType(item.k);
            item["t"] = ftype;
          }
          this.filters.push(item);
        }
      } else {
        this.restoreFilters();
      }

      this.reload();
    },
    initialize() {
      this.d_refresh = this.refresh;
      if (this.d_refresh) {
        this.resetReloadTimer(this.d_refresh);
      } else {
        this.d_refresh = 30;
      }

      this.reFilter();
    },
    onAutoChange() {
      // console.log(`onAutoChange: ${JSON.stringify(event)}`);
    },
    onAutoInput(event) {
      if (typeof event !== "undefined" && event !== null) {
        this.diag_add = true;
      }
    },
    onAutoCompleteChanged(event, details) {
      console.log(`onAutoCompleteChanged: ${JSON.stringify(event)} `);
      this.selected_value = `${event[details.qtext]}`;
    },
    onTranslatorChanged(event) {
      console.log(`onTranslatorChanged: ${JSON.stringify(event)} `);
      this.selected_value = `${event.key}`;
    },
    save() {
      this.dialog = false;

      if (this.editIdx > 0) {
        let found = this.filters.filter((filter) => {
          return filter.idx == this.editIdx;
        });

        if (found.length > 0) {
          (found[0].k = this.selected_field), (found[0].op = this.selected_op), (found[0].v = this.selected_value), (found[0].t = this.getType(this.selected_field));
        }

        this.reload();

        return;
      }

      this.cseq++;

      let ftype = this.getType(this.selected_field);
      // let fvalue = null;
      if ("boolean" === ftype || "bool" === ftype) {
        this.selected_op = "equal";
        //fvalue = this.selected_value;
      } else if ("timestamp" === ftype) {
        if (this.selected_value !== null && this.selected_value != "" && this.selected_value != "null") {
          //let lts = this.fromUiFormatToLocalDate(this.selected_value);
          //fvalue = lts.toISOString(); // .substr(0, 10)
        }
      } else {
        //fvalue = this.selected_value;
      }

      this.filters.push({
        idx: this.cseq,
        k: this.selected_field,
        op: this.selected_op,
        v: this.selected_value,
        t: this.getType(this.selected_field),
      });

      this.reload();

      return false;
    },
    add() {
      this.diag_add = false;
      this.cseq++;

      this.selected_field = this.auto.k;
      this.selected_op = this.auto.op;
      if ("boolean" === this.getType(this.auto.k)) {
        this.selected_op = "equal";
      }

      this.auto = null;

      this.filters.push({
        idx: this.cseq,
        k: this.selected_field,
        op: this.selected_op,
        v: this.selected_value,
        t: this.getType(this.selected_field),
      });

      this.reload();

      return false;
    },
    cancel_add() {
      this.selected_value = "";
      this.diag_add = false;
      return false;
    },
    cancel() {
      this.dialog = false;
      this.$emit("cancel", false);
      return false;
    },
    editExisting(idx) {
      let found = this.filters.filter((filter) => {
        return filter.idx == idx;
      });

      if (found.length > 0) {
        this.editIdx = found[0].idx;
        this.selected_op = found[0].op;
        this.selected_field = found[0].k;
        this.selected_value = found[0].v;
        if (found[0].t == "timestamp") {
          this.value_dp = this.selected_value.substr(0, 10);
          this.value_tp = this.selected_value.substr(11, 8);
        }
        this.dialog = true;
        this.menu_dp = false;
        this.menu_tp = false;
      }
    },
    reload() {
      if (this.suspend) {
        return;
      }

      this.reloading = true;

      let query = this.genQuery();
      this.$emit("onquerychange", query);
      this.reloading = false;
    },
    closeChip(idx) {
      this.filters = this.filters.filter((filter) => {
        return filter.idx != idx;
      });
      this.reload();
    },
    cacheFilters() {
      let url = this.$router.currentRoute.path;
      if (url === "") {
        return;
      }
      url = `${url}.${this.unique}`;

      // add router cache
      let lrcache = this.$store.state.session.router_cache;
      let lcache = lrcache[url];

      if (typeof lcache === "undefined") {
        lcache = {};
        lrcache[url] = lcache;
      }

      lcache["filters"] = [];

      if (this.filters.length <= 0) {
        return;
      }

      if (!this.use_filter_cache) {
        return;
      }

      for (let i = 0; i < this.filters.length; i++) {
        let f = this.filters[i];

        if (!f.hidden && !f.init) {
          lcache.filters.push(f);
        }
      }
    },
    restoreFilters() {
      if (!this.use_filter_cache) {
        return;
      }

      let url = this.$router.currentRoute.path;
      if (url === "") {
        return;
      }
      url = `${url}.${this.unique}`;

      let lcache = this.$store.state.session.router_cache;
      if (!lcache.hasOwnProperty(url)) {
        return;
      }

      let lurl_cache = lcache[url];

      if (!lurl_cache.hasOwnProperty("filters")) {
        return;
      }

      let lcfilters = lcache[url].filters;
      for (let i = 0; i < lcfilters.length; i++) {
        let item = lcfilters[i];
        this.cseq++;
        item["idx"] = this.cseq;
        this.filters.push(item);
      }
      return;
    },
    genQuery() {
      let query = {
        page: {
          limit: this.limit,
          offset: this.offset,
        },
      };

      if (this.filters.length > 0) {
        query["where"] = [];
      }

      this.cacheFilters();

      for (let i = 0; i < this.filters.length; i++) {
        let f = this.filters[i];
        let v = f.v;

        let ftype = f.t;
        console.log(`genQuery - filter - ${i}:${ftype}:${v}`);
        // let fvalue = null;
        if ("timestamp" === ftype || f.k == "ts") {
          let lts = null;
          if (v !== null && v != "" && v != "null") {
            lts = this.fromUiFormatToLocalDate(v);
            // this is a hack for java spring boot not supporting Zulu time
            v = lts.toISOString();
          } else {
            v = `${this.value_dp} 00:00:00`;
            lts = this.fromUiFormatToLocalDate(v);
            v = lts.toISOString();
          }
        } else {
          console.log(`genQuery - filter - else ${f.k}`);
          if (this.needsTranslation(f.k)) {
            console.log(`genQuery - filter - needsTranslation ${f.k}`);
            v = this.translator.toSrcByKey(f.k, v);
          }
        }

        let op = f.op;

        if ("icontains" == f.op) {
          op = "clike";
          v = `%${v}%`;
        } else if ("istarts" == f.op) {
          op = "clike";
          v = `${v}%`;
        } else if ("iends" == f.op) {
          op = "clike";
          v = `%${v}`;
        } else if ("contains" == f.op) {
          op = "like";
          v = `%${v}%`;
        } else if ("starts" == f.op) {
          op = "like";
          v = `${v}%`;
        } else if ("ends" == f.op) {
          op = "like";
          v = `%${v}`;
        } else if ("equal" == f.op) {
          op = "equal";
        } else if ("not equal" == f.op) {
          op = "not_equal";
        } else if ("greater" == f.op) {
          op = "greater";
        } else if ("less" == f.op) {
          op = "lower";
        } else if ("before" == f.op) {
          op = "lower";
        } else if ("after" == f.op) {
          op = "greater";
        } else if (">=" == f.op) {
          op = "greater_or_equal";
        } else if ("<=" == f.op) {
          op = "lower_or_equal";
        }

        query.where.push({
          k: f.k,
          op: op,
          v: v,
        });
      }

      return query;
    },
  },
};
</script>
