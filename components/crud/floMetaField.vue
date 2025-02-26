<template>
  <div class="flo-meta-field">
    <template v-if="header.type == 'timestamp'">{{ helpers.getTsString(cvalue) }}</template>
    <template v-else-if="header.type == 'boolean' || header.type == 'bool'">
      <v-chip class="non-clickable" color="success" label v-if="cvalue">ON</v-chip>
      <v-chip class="non-clickable" label v-else>OFF</v-chip>
    </template>
    <template v-else-if="header.type == 'tags'">
      <v-chip-group row v-if="cvalue != ''">
        <v-chip class="non-clickable mr-1" v-for="(val, i) in cvalue" :key="i" outlined label color="info">{{ getHeaderValue(header, val, header.type) }}</v-chip>
      </v-chip-group>
    </template>
    <template v-else-if="header.type == 'json'">
      {{ null == cvalue ? "" : JSON.stringify(cvalue, null, 2) }}
    </template>
    <template v-else-if="header.type == 'enum'">
      <v-chip v-if="cvalue !== ''" label class="non-clickable text-capitalize" color="info">{{ getHeaderValue(header, cvalue, header.type) }}</v-chip>
    </template>
    <template v-else>{{ formatName(cvalue) }}</template>
  </div>
</template>

<script>
import helpers from "~/src/helpers.js";
export default {
  name: "flo-meta-field",
  data: function () {
    return {
      helpers,
      dvalue: this.value,
      dheader: this.header,
    };
  },
  props: {
    // v-model prop is always value
    value: {
      type: [String, Number, Object, Boolean],
      required: false,
    },
    header: {
      type: Object,
      required: true,
    },
    dense: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    cvalue: {
      get() {
        if (this.header.type == "tags") {
          return this.value ? this.value.split(",").map((m) => m.trim()) : "";
        }
        return this.value;
      },
      set(val) {
        if (val == null) {
          return;
        }
        this.dvalue = val;
        if (this.header.type == "boolean") {
          this.$emit("input", this.dvalue ? 1 : 0);
        } else {
          this.$emit("input", this.dvalue);
        }
      },
    },
    cheader: {
      get() {
        return this.dheader;
      },
      set(val) {
        this.dheader = val;
      },
    },
  },
  methods: {
    formatName(name) {
      if (this.$vuetify.breakpoint.xs && name && name.length > 30) {
        return `${name.substring(0, 30)}...`;
      }
      return name;
    },
    getHeaderValue(header, key, type) {
      if (header.hasOwnProperty(type)) {
        let found = header[type].find((f) => f.key == key);
        if (found) {
          return found.value;
        }
      }
      return key;
    },
  },
};
</script>
