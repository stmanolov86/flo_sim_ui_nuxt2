<template>
  <div class="flo-rfm-misc">
    <v-container fluid class="ma-0 pa-0" v-if="!loading">
      <v-row no-gutters>
        <v-col cols="12">
          <v-container fluid class="ma-0 pa-0">
            <v-row no-gutters>
              <v-col cols="12" lg="4" xl="4" class="pa-1">
                <v-select :items="getAidsItems()" :value="getSelectedAidName()" @change="onAppChange($event)" :label="meta.app.label" :type="meta.app.type" :rules="meta.app.rule" :disabled="disabled || readonly" item-text="value" item-value="key" outlined dense hide-details></v-select>
              </v-col>
              <v-col v-if="use_cla" cols="12" lg="2" xl="2" class="pa-1">
                <v-combobox :key="redraw_cla" :items="getClaItems()" :value="getSelectedCla()" @change="onClaChange($event)" :label="meta.cla.label" :type="meta.cla.type" :disabled="disabled || readonly" outlined dense hide-details></v-combobox>
              </v-col>
              <v-col v-if="use_base" cols="12" lg="2" xl="2" class="pa-1">
                <v-text-field v-model="operation.base" @change="onSimpleChange($event)" :label="meta.base.label" :type="meta.base.type" :rules="meta.base.rule" :disabled="disabled || readonly" outlined dense hide-details></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "flo-rfm-misc",
  data() {
    return {
      loading: true,
      operation: { base: "", app: "", cla: "" },
      redraw_cla: 1,
      meta: {
        app: {
          label: "Application",
          hint: "Select Application",
          input: "text",
          type: "text",
        },
        base: {
          label: "Base",
          hint: "Base Address",
          input: "text",
          type: "text",
          rule: [(v) => /^(?:[a-fA-F0-9]{4}\/?)*$/gm.test(v) || "Field accepts HEX only."],
        },
        cla: {
          label: "CLA",
          hint: "Class Byte",
          input: "text",
          type: "text",
        },
      },
    };
  },
  props: {
    aids: {
      type: Array,
      required: false,
      default: () => [],
    },
    aid_category: {
      type: String,
      required: false,
      default: "",
    },
    value: {
      type: [Object, Array],
      default: () => {},
    },
    transport: {
      type: String,
      required: true,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    use_cla: {
      type: Boolean,
      default: true,
    },
    use_base: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    transport: function (to, from) {
      console.log(`flo-rfm-misc - watch - transport - ${from} -> ${to}`);
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      if (null != this.value) {
        console.log(`flo-rfm-misc - initialize - value - ${JSON.stringify(this.value)}`);
        let l_val = this.value;
        if (l_val.hasOwnProperty("app")) {
          this.operation.app = this.value.app;
        }
        if (l_val.hasOwnProperty("cla")) {
          this.operation.cla = this.value.cla;
        }
        if (l_val.hasOwnProperty("base")) {
          this.operation.base = this.value.base;
        }
      }
      this.loading = false;
    },
    syncParent() {
      console.log(`flo-rfm-misc - syncParent - enter - ${JSON.stringify(this.operation)}`);
      this.$emit("change", this.operation);
    },
    onSimpleChange() {
      this.syncParent();
    },
    onAppChange(event) {
      let l_aids = this.aids;
      let l_op = this.operation;
      let found = l_aids.find((aid) => aid.name == event);

      if (found) {
        if (found.preferred == 1) {
          delete l_op.app;
          delete l_op.cla;
        } else {
          l_op.app = found.name;
          l_op.cla = found.cla;
        }
      }
      this.redraw_cla++;
      this.syncParent();
    },
    onClaChange(event) {
      let l_aids = this.getAidsItems();
      let l_op = this.operation;
      let found = l_aids.find((f) => f.cla == event);
      if (found) {
        if (found.preferred == 1) {
          delete l_op.cla;
        } else {
          l_op.cla = found.cla;
        }
      } else {
        l_op.cla = event;
      }

      this.syncParent();
    },
    getPreferredAid() {
      let l_aids = this.aids;
      l_aids = l_aids.filter((f) => f.category == this.aid_category);
      let l_preferred = l_aids.find((f) => f.preferred == 1);

      return l_preferred;
    },
    getSelectedAid() {
      console.log(`flo-rfm-misc - getSelectedAid - enter`);
      let l_op = this.operation;
      if (!l_op.hasOwnProperty("app") || l_op.app == "") {
        console.log(`flo-rfm-misc - getSelectedAid - no app tag or app is empty`);
        if (!this.aids) {
          return null;
        }

        let l_aids = this.aids;
        if (this.aid_category != "") {
          l_aids = l_aids.filter((f) => f.category == this.aid_category);
        }

        let l_preferred = l_aids.find((f) => f.preferred == 1);
        return l_preferred;
      } else {
        let l_aids = this.aids;
        if (!this.aids) {
          return null;
        }
        let l_selected = l_aids.find((f) => f.name == l_op.app);
        return l_selected;
      }
    },
    getSelectedAidName() {
      console.log(`flo-rfm-misc - getSelectedAid - enter`);
      let l_selected_aid = this.getSelectedAid();
      if (!l_selected_aid) {
        console.log(`flo-rfm-misc - getSelectedAid - non selected`);
        return "";
      }

      return l_selected_aid.name;
    },
    getSelectedCla() {
      console.log(`flo-rfm-misc - getSelectedCla - enter`);
      let l_op = this.operation;
      if (!l_op.hasOwnProperty("cla") || l_op.cla == "") {
        console.log(`flo-rfm-misc - getSelectedCla - no cla tag or cla is empty`);
        let l_selected_aid = this.getSelectedAid();
        if (l_selected_aid) {
          return l_selected_aid.cla;
        }
      }
      return l_op.cla;
    },
    getAidsItems() {
      console.log(`flo-rfm-misc - getAidsItems - enter`);
      console.log(`flo-rfm-misc - getAidsItems - aid_category: ${this.aid_category}`);
      let l_aids = [];
      if (null == this.aids) {
        let l_use_first_aid = { key: "", value: `Use Preferred`, cla: `` };
        l_aids.push(l_use_first_aid);
        return l_aids;
      }

      l_aids = this.aids;
      if (this.aid_category != "") {
        l_aids = l_aids.filter((f) => f.category == this.aid_category);
      }
      let l_preferred = l_aids.find((f) => f.preferred == 1);

      l_aids = l_aids.map((m) => {
        if (l_preferred) {
          if (l_preferred.name == m.name) {
            return { key: m.name, value: `${m.name} - TAR: ${m.tar} - Preferred`, tar: m.tar, cla: m.cla, uaid: m.uaid };
          }
        }
        return { key: m.name, value: `${m.name} - TAR: ${m.tar}`, tar: m.tar, cla: m.cla, uaid: m.uaid };
      });

      return l_aids;
    },
    getClaItems() {
      console.log(`flo-rfm-misc - getClaItems - enter`);
      let l_clas = [];
      let selected_aid = this.getSelectedAid();

      if (selected_aid) {
        l_clas.push(selected_aid.cla);
      }

      return l_clas;
    },
  },
};
</script>
