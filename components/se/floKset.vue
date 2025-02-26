<template>
  <div class="flo-kset">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col cols="12">
          <v-select :value="getKeyset()" @change="setKeyset($event)" :item-disabled="getKeysets().disabled" :items="getKeysets()" :readonly="preferred" :disabled="disabled || readonly" :label="`${prefix} Keyset`" :hint="`${prefix} Keyset`" item-text="value" item-value="key" persistent-hint outlined dense></v-select>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "flo-kset",
  data() {
    return {
      dvalue: 1,
      keyset_id: 0,
    };
  },
  props: {
    // v-model prop is always value
    value: {
      type: Number,
      required: false,
    },
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    readonly: {
      type: Boolean,
      default: false,
      required: false,
    },
    keysets: {
      type: Array,
      required: false,
      default: () => [
        { key: 0, value: "Keyset 0 - Reserved" },
        { key: 1, value: "Keyset 1" },
        { key: 2, value: "Keyset 2" },
        { key: 3, value: "Keyset 3" },
        { key: 4, value: "Keyset 4" },
        { key: 5, value: "Keyset 5" },
        { key: 6, value: "Keyset 6" },
        { key: 7, value: "Keyset 7" },
        { key: 8, value: "Keyset 8" },
        { key: 9, value: "Keyset 9" },
        { key: 10, value: "Keyset 10" },
        { key: 12, value: "Keyset 12" },
        { key: 13, value: "Keyset 13" },
        { key: 14, value: "Keyset 14" },
        { key: 15, value: "Keyset 15 - Reserved" },
      ],
    },
    preferred: {
      type: Boolean,
      required: false,
      default: false,
    },
    prefix: {
      type: String,
      required: false,
      default: "",
    },
  },
  computed: {
    cvalue: {
      get() {
        return this.dvalue;
      },
      set(param) {
        this.dvalue = param;
        this.$emit("input", this.dvalue);
        this.$emit("change", this.dvalue);
      },
    },
  },
  created() {
    if (null != this.value) {
      this.dvalue = this.value;
    }
    this.keyset_id = this.dvalue;
  },
  methods: {
    getKeyset() {
      return this.keyset_id;
    },
    setKeyset(event) {
      console.log(`flo-kset - keyset_id_changed - enter`);
      this.cvalue = event;
    },
    getKeysets() {
      return this.keysets;
    },
  },
};
</script>
