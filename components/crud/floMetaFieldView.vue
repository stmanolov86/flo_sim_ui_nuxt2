<template>
  <div class="flo-meta-field-view">
    <template v-if="cheader.type == 'timestamp'">
      <flo-field-label :value="helpers.getTsString(cvalue)" :label="cheader.text" :hint="cheader.hasOwnProperty('hint') ? cheader.hint : undefined"></flo-field-label>
    </template>
    <template v-else-if="['bool', 'boolean'].includes(cheader.type)">
      <flo-field-label :value="cvalue" :type="cheader.type" :label="cheader.text" :hint="cheader.hasOwnProperty('hint') ? cheader.hint : undefined">
        <template v-slot:value="{ value }">
          <v-chip class="ml-1 mb-1 non-clickable" :color="value === true ? 'success' : ''" label>{{ value === true ? "ON" : "OFF" }}</v-chip>
        </template>
      </flo-field-label>
    </template>
    <template v-else-if="['number', 'long_number'].includes(cheader.type)">
      <flo-field-label v-if="needsTranslation(cheader.value)" :label="cheader.text" :hint="cheader.hasOwnProperty('hint') ? cheader.hint : undefined" :value="translator.toUIByKey(cheader.value, cvalue)"></flo-field-label>
      <flo-field-label v-else :value="cvalue" :label="cheader.text" :hint="cheader.hasOwnProperty('hint') ? cheader.hint : undefined"></flo-field-label>
    </template>
    <template v-else-if="cheader.type == 'tags'">
      <flo-field-label :value="cvalue" :type="cheader.type" :label="cheader.text" :hint="cheader.hasOwnProperty('hint') ? cheader.hint : undefined">
        <template v-slot:value="{ value }">
          <v-chip-group column v-if="value != ''">
            <v-chip v-for="(val, i) in value" :key="i" class="non-clickable mr-1" color="info" outlined label>{{ getHeaderValue(cheader, val, cheader.type) }}</v-chip>
          </v-chip-group>
        </template>
      </flo-field-label>
    </template>
    <template v-else-if="cheader.type == 'enum'">
      <flo-field-label :value="cvalue" :type="cheader.type" :label="cheader.text" :hint="cheader.hasOwnProperty('hint') ? cheader.hint : undefined">
        <template v-slot:value="{ value }">
          <v-chip v-if="value !== ''" class="ml-1 mb-1 non-clickable text-capitalize" color="info" label>{{ getHeaderValue(cheader, cvalue, cheader.type) }}</v-chip>
        </template>
      </flo-field-label>
    </template>
    <template v-else-if="cheader.type == 'password'">
      <flo-field-label :value="cvalue" :type="cheader.type" :label="cheader.text" :hint="cheader.hasOwnProperty('hint') ? cheader.hint : undefined">
        <template v-slot:value="{ value }">
          <v-form autocomplete="off">
            <v-text-field readonly class="font-weight-light primary--text ma-0 pa-0 mx-1" :append-icon="password ? 'mdi-eye' : 'mdi-eye-off'" autocomplete="off" @click:append="password = !password" :type="password ? 'text' : 'password'" :value="value" dense flat hide-details></v-text-field>
          </v-form>
        </template>
      </flo-field-label>
    </template>
    <template v-else-if="cheader.type == 'link'">
      <flo-field-label :value="cvalue" :type="cheader.type" :label="cheader.text" :hint="cheader.hasOwnProperty('hint') ? cheader.hint : undefined">
        <template v-slot:value="{ value }">
          <template v-if="value">
            <router-link
              style="text-decoration: none; color: inherit"
              :to="{
                path: cheader.path,
                query: cheader.query,
              }"
            >
              <span class="text-body-1 ma-0 pa-0 mx-1" v-text="value"></span> <v-icon center color="info">mdi-link</v-icon></router-link
            >
          </template>
          <template v-else><span class="text-body-1 ma-0 pa-0 mx-1">Unspecified</span></template>
        </template>
      </flo-field-label>
    </template>
    <template v-else>
      <flo-field-label v-if="needsTranslation(cheader.value)" :label="cheader.text" :hint="cheader.hasOwnProperty('hint') ? cheader.hint : undefined" :value="translator.toUIByKey(cheader.value, cvalue)"></flo-field-label>
      <flo-field-label v-else :value="cvalue" :label="cheader.text" :hint="cheader.hasOwnProperty('hint') ? cheader.hint : undefined"></flo-field-label>
    </template>
  </div>
</template>
<script>
import helpers from "~/src/helpers.js";
export default {
  name: "flo-meta-field-view",
  data: function () {
    return {
      helpers,
      password: false,
      dvalue: this.value,
      dheader: this.header,
    };
  },
  props: {
    // v-model prop is always value
    value: {
      type: [String, Number, Object, Array, Boolean],
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
    translator: {
      type: [Object],
      required: false,
    },
  },
  computed: {
    cvalue: {
      get() {
        if (this.header.type == "boolean" || this.header.type == "bool") {
          return this.value === "1" || this.value === 1 || !!this.value;
        } else if (this.header.type == "tags") {
          return this.value ? this.value.split(",").map((m) => m.trim()) : "";
        }
        return this.value;
      },
      set(val) {
        this.dvalue = val;
        if (this.header.type == "boolean" || this.header.type == "bool") {
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
    needsTranslation(key) {
      if (typeof this.translator === "undefined" || this.translator === null) {
        return false;
      }

      return this.translator.hasTranslator(key);
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
