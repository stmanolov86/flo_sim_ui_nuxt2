<template>
  <div class="flo-lv-hex-string">
    <v-select :value="value" :hint="hint" :items="getItems()" :disabled="disabled" @change="onChange($event)" item-text="value" item-value="key" filled persistent-hint />
  </div>
</template>

<script>
import helpers from "~/src/helpers.js";
export default {
  name: "flo-lv-hex-string",
  data() {
    return {
      helpers,
      dvalue: "",
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
      console.log(`flo-enum - initialize: ${this.value}`);
      this.dvalue = this.value;
    },
    onChange(event) {
      console.log(`flo-enum - onChange: ${JSON.stringify(event)}`);
      this.$emit("input", event);
      this.$emit("change", event);
    },
    getItems() {
      return this.items;
    },
  },
};
</script>
