<template>
  <div class="flo-plmn">
    <template v-if="!paloc && !daloc && dvalue.startsWith('FFFFF')">
      <v-container fluid class="ma-0 pa-0">
        <v-row no-gutters>
          <v-col cols="12" class="ma-0 pa-0">
            <v-btn elevation="1" x-small class="ma-0 pa-0" @click="paloc = !paloc" :disabled="disabled"><v-icon color="primary">mdi-plus</v-icon></v-btn>
          </v-col>
        </v-row>
      </v-container>
    </template>

    <template v-else>
      <template v-if="disabled">
        <p class="ma-0 pa-0 text-subtitle-1 font-weight-light primary--text">{{ getPlmnDescription(dvalue) }}</p>
      </template>
      <template v-else>
        <v-autocomplete class="text-subtitle-1 font-weight-light primary--text" dense @change="onChange($event)" :value="dvalue" :items="items" :disabled="disabled" :hint="hint" item-text="value" item-value="key" clearable color="primary" persistent-hint filled></v-autocomplete>
      </template>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
export default {
  name: "flo-plmn",
  data() {
    return {
      items: [],
      paloc: false,
      dvalue: "",
    };
  },
  props: {
    // v-model prop is always value
    value: {
      type: String,
      default: "FFFFFF",
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
    daloc: {
      type: Boolean,
      default: false,
      required: false,
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
  mixins: [tellUser, parseNetError],
  methods: {
    ...mapActions({
      addToResourceCache: "session/addToResourceCache",
    }),
    async initialize() {
      // console.log(`flo-plmn - initialize: ${this.value}`);
      let lval = `${this.value}`;

      if (this.swapped) {
        if (lval.length != 6) {
          lval = "FFFFFF";
        } else {
          let lsval = `${lval[1]}${lval[0]}${lval[3]}${lval[5]}${lval[4]}${lval[2]}`;
          lval = lsval;
        }
      } else {
        if (lval.length == 5) {
          lval = `${lval}F`;
        } else if (lval.length == 6) {
          // console.log(`flo-plmn - initialize - lval: ${lval}`);
        } else {
          lval = "FFFFFF";
        }
      }

      // We normalized the value (lval)
      lval = lval.toUpperCase();
      // IF lval == all-F, it points to no country
      if (lval != "FFFFFF" && lval.endsWith("F")) {
        lval = lval.substr(0, 5);
      }
      // console.log(`flo-plmn - initialize - lval: ${lval}`);
      this.dvalue = lval;
      this.items = await this.loadPlmns();
      this.dvalue = lval;
    },
    getPlmnDescription(plmn) {
      let found = this.items.find((i) => i.key === plmn);
      if (!found) {
        return plmn;
      }
      return found.value;
    },
    onChange(event) {
      console.log(`flo-plmn - onChange: ${JSON.stringify(event)}`);
      let lval = event;

      if (!event) {
        lval = "FFFFF";
      }

      if (lval.length == 5) {
        lval = `${lval}F`;
      }

      if (lval.length < 5) {
        lval = "FFFFFF";
      }
      if (this.swapped) {
        let normalized = `${lval[1]}${lval[0]}${lval[5]}${lval[2]}${lval[4]}${lval[3]}`;
        lval = normalized;
      }
      this.$emit("change", lval);
    },
    async loadPlmns() {
      let plmns = this.getResourceKey("main", "operators", "plmns");

      if (!plmns) {
        let operators = await this.loadOperators();

        let items = operators.map((o) => {
          return { key: o.mccmnc, value: `${o.mccmnc} - ${o.country}, ${o.name}` };
        });

        plmns = items;
        this.addToResourceCache({ module: "main", resource: "operators", key: "plmns", expire: 1500, value: plmns });
      }

      // console.log(`flo-plmn - loadPlmns - operators - 2: ${JSON.stringify(operators)}`);
      // console.log(`flo-plmn - loadPlmns - dvalue: ${this.dvalue}`);
      let lmccmnc = `${this.dvalue.toUpperCase()}`;
      if (lmccmnc != "FFFFFF") {
        if (lmccmnc.endsWith("F")) {
          lmccmnc = lmccmnc.substr(0, 5);
        }
      }

      // console.log(`flo-plmn - loadPlmns - dlmccmnc: ${lmccmnc}`);
      let lop = plmns.find((f) => f.key == lmccmnc);
      // console.log(`flo-plmn - loadPlmns - dlop: ${lop}`);
      if (!lop) {
        let loperator = "FFFFFF - None";
        if (lmccmnc != "FFFFFF") {
          loperator = `${lmccmnc} - Unknown`;
        }

        // console.log(`flo-plmn - loadOperators - push: ${this.dvalue}, ${loperator}`);
        plmns.push({ key: this.dvalue, value: loperator });
      }
      // console.log(`flo-plmn - loadOperators - operators - 3 - items: ${JSON.stringify(items)}`);

      return plmns;
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
