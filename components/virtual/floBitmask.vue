<template>
  <div class="flo-bitmask">
    <v-select v-model="dvalue" :hint="hint" :items="getItems()" :disabled="disabled" @change="onChange($event)" :placeholder="getPlaceHolderText()" item-text="value" item-value="key" multiple chips deletable-chips clearable filled persistent-hint> </v-select>
  </div>
</template>

<script>
import helpers from "~/src/helpers.js";
export default {
  name: "flo-bitmask",
  data() {
    return {
      helpers,
      dvalue: [],
    };
  },
  props: {
    // v-model prop is always value
    value: {
      type: String,
      required: false,
    },
    items: {
      type: [Array],
      required: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      required: false,
    },
    hint: {
      type: String,
      required: false,
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      console.log(`flo-bitmask - initialize: ${this.value}`);
      let bits = [];
      let lval = parseInt(this.value, 16);
      for (let i = 0; i < 8; i++) {
        let b = 1 << i;
        if (lval & b) {
          let lbs = this.helpers.padHex(b, 2);
          bits.push(lbs);
        }
      }
      this.dvalue = bits;
    },
    onChange(event) {
      console.log(`flo-bitmask - onChange: ${JSON.stringify(event)}`);
      let lvalue = 0;
      for (let i = 0; i < event.length; i++) {
        const lev = event[i];
        let lv = parseInt(lev, 16);
        lvalue |= lv;
      }
      let lmask = this.helpers.padHex(lvalue, 2).toUpperCase();
      this.$emit("input", lmask);
      this.$emit("change", lmask);
    },
    getItems() {
      let litems = this.items.filter((f) => f.key != "00");
      return litems;
    },
    getPlaceHolderText() {
      let lempty = this.items.find((f) => f.key == "00");

      if (!lempty) {
        return "Not Set";
      }

      return lempty.value;
    },
    deleteChip(item) {
      for (let i = 0; i < this.dvalue.length; i += 1) {
        if (this.dvalue[parseInt(i, 10)] == item.key) {
          this.dvalue.splice(i, 1);
        }
      }
    },
  },
};
</script>
