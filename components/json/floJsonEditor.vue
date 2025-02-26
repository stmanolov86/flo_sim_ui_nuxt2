<template>
  <div class="flo-json-editor">
    <v-jsoneditor :height="height" :plus="true" :key="key" :options="vjsone_options" :value="value" @input="jsonChanged"></v-jsoneditor>
  </div>
</template>

<script>
import VJsoneditor from "v-jsoneditor";
export default {
  name: "flo-json-editor",
  props: {
    value: {
      type: [Object, Array],
      required: false,
      default: () => null,
    },
    mode: {
      type: String,
      default: "view",
    },
    modes: {
      type: Array,
      default: () => [],
    },
    name: {
      type: String,
      default: "Root",
    },
    height: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      key: 1,
      vjsone_options: {
        indentation: 2,
        modes: [],
        mode: "",
        name: "",
        navigationBar: false,
      },
    };
  },
  watch: {
    mode(val) {
      this.vjsone_options.mode = val;
      this.key++;
    },
  },
  components: {
    VJsoneditor,
  },
  created() {
    this.vjsone_options.name = this.name;
    this.vjsone_options.mode = this.mode;
    this.vjsone_options.modes = this.modes;
  },
  methods: {
    jsonChanged(value) {
      this.$emit("model-update", value);
    },
  },
};
</script>
