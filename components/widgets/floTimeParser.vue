<template>
  <div class="flo-time-parser">
    <v-text-field :value="time.value" :label="label" :hint="hint" :rules="[time.rule]" @change="onChange($event)" persistent-hint></v-text-field>
  </div>
</template>

<script>
import helpers from "~/src/helpers.js";
export default {
  name: "flo-time-parser",
  data() {
    return {
      helpers,
      time: {
        value: "",
        rule: (v) => {
          let val = helpers.formatTime(v);
          let pattern = /^(?:[01]\d|2[0-4]):[0-5]\d:[0-5]\d$/;
          return pattern.test(val) || "Supported format is HH: 00-24, MM & SS: 00-59.";
        },
      },
    };
  },
  props: {
    // v-model prop is always value
    value: {
      type: String,
      default: "",
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
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      this.time.value = helpers.formatTime(this.value);
    },
    onChange(event) {
      let formatted = helpers.formatTime(event);
      formatted = formatted.slice(0, 8);

      if (this.time.rule(formatted) == true) {
        this.time.value = formatted;
        this.$emit("change", formatted.replaceAll(":", ""));
      }
    },
  },
};
</script>
