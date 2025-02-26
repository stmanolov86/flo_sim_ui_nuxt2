<template>
  <div class="flo-sume-parser">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col cols="6" class="pa-1"> <v-text-field v-model="alpha_value" @change="setSume($event, '85')" label="Alpha" hint="Aplha Value" persistent-hint></v-text-field></v-col>
        <v-col cols="6" class="pa-1"> <v-text-field v-model="text_value" @change="setSume($event, 'D0')" label="Text" hint="Text Value" persistent-hint></v-text-field></v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="12" class="pa-1"> <v-text-field v-model="sume" label="SUME" hint="STK User Menu Name" disabled persistent-hint></v-text-field></v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
import helpers from "~/src/helpers.js";
export default {
  name: "flo-sume-parser",
  data: () => ({
    helpers,
    alpha_value: "",
    text_value: "",
  }),
  props: {
    // v-model prop is always value
    value: {
      type: String,
      required: true,
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
    sume: {
      get() {
        return this.value;
      },
      set(val) {
        let [, , length] = this.row.pattern.split(":");
        this.$emit("input", val.startsWith("8500") ? "8500".padEnd(length * 2, "F") : val);
      },
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      console.log(`flo-sume-parser - initialize - value: ${this.value}`);
      if (this.value) {
        let parsed = this.helpers.parseTLV(this.sliceSume(this.value).sliced);
        console.log(`flo-sume-parser - initialize - parsed: ${JSON.stringify(parsed)}`);
        if (parsed) {
          parsed.forEach((f) => {
            let tag = f.tag;
            let len = helpers.calculateHexLength(f.value);
            let val = helpers.asciiHexToUi(`${len}${f.value}`);
            if (tag == "85") {
              this.alpha_value = val;
            } else if (tag == "D0") {
              this.text_value = val;
            }
          });
        }
      }
    },
    setSume(event, tag) {
      let val = this.helpers.ascToHexAsc(event);
      let len = val.length / 2;
      this.sume = this.formatSume(tag, len, val);
    },
    sliceSume(sume) {
      let sliced = sume;
      let icon = null;

      let idx9E = sliced.indexOf("9E");
      let idxD0 = sliced.indexOf("D0");

      if (idx9E !== -1 && idxD0 !== -1 && idxD0 > idx9E) {
        icon = sliced.slice(idx9E, idxD0);
        sliced = sliced.slice(0, idx9E) + sliced.slice(idxD0);
      }
      return { sliced, icon };
    },
    formatSume(tag, len, val) {
      console.log(`flo-sume-parser - formatSume - tag: ${tag}, len: ${len}, val: ${val}`);
      let { sliced, icon } = this.sliceSume(this.value);
      let parsed = this.helpers.parseTLV(sliced);

      if (!parsed.some((f) => f.tag == tag)) {
        parsed.push({
          tag: tag,
          length: len,
          value: val,
        });
      } else {
        parsed.forEach((f) => {
          if (f.tag == tag) {
            f.length = len;
            f.value = val;
          }
        });
      }

      let stringify = this.helpers.stringifyTLV(parsed);
      if (icon) {
        let idxD0 = stringify.indexOf("D0");
        if (idxD0 !== -1) {
          // Concatenate 9E before D0
          stringify = stringify.slice(0, idxD0) + icon + stringify.slice(idxD0);
        }
      }

      let [, , length] = this.row.pattern.split(":");
      if (stringify.length < length * 2) {
        stringify = stringify.padEnd(length * 2, "F");
      } else if (stringify.length > length * 2) {
        stringify = stringify.slice(0, length * 2);
      }

      console.log(`flo-sume-parser - formatSume - stringify: ${stringify}`);
      return stringify;
    },
  },
};
</script>
