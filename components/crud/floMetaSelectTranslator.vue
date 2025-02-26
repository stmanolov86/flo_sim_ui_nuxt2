<template>
  <div class="flo-meta-select-translator">
    <v-autocomplete v-model="item" :items="items" :loading="loading" :item-text="qconcat ? 'qconcat' : qtext" :item-value="qkey" :label="label" @input="onSelectionChanged($event)" @paste="onPaste($event)" :hint="`Type to search ${label} `" :placeholder="`${label} Search`" :no-data-text="`Please select ${label}.`" :error-messages="errorMessages" autofocus filled return-object persistent-hint></v-autocomplete>
  </div>
</template>

<script>
export default {
  name: "flo-meta-select-translator",
  data: () => ({
    loading: false,
    item: null,
    errorMessages: [],
  }),
  props: {
    // v-model prop is always value
    value: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    qkey: {
      type: String,
      required: false,
      default: "key",
    },
    qtext: {
      type: String,
      required: false,
      default: "value",
    },
    qconcat: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      this.item = this.findItem(this.value);
    },
    findItem(text) {
      let litems = this.items.filter((i) => i[this.qkey] == text);
      if (litems.length === 0) return null;

      return litems[0];
    },
    onSelectionChanged(event) {
      this.$emit("input", event);
      this.$emit("change", event);
    },
    onPaste(event) {
      this.item = event.clipboardData.getData("text/plain");
    },
  },
};
</script>
