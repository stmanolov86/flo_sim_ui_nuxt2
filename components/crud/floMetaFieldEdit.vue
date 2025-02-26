<template>
  <div class="flo-meta-field-edit">
    <template v-if="cheader.type == 'timestamp'">
      <v-text-field :disabled="disabled" :readonly="disabled" :value="getTimeStamp(cvalue, cheader.value)" @change="onTimeStampChanged($event, cheader.value)" :label="cheader.text" :hint="hasHint(cheader, cvalue)" :rules="[testPattern]" :filled="filled" persistent-hint></v-text-field>
    </template>
    <template v-else-if="cheader.hasOwnProperty('enum') && cheader.hasOwnProperty('pattern') && cheader.pattern == 'enum'">
      <v-autocomplete v-model="cvalue" @change="onChange($event)" :items="cheader.enum" :disabled="disabled" :readonly="disabled" :label="cheader.text" :hint="hasHint(cheader, cvalue)" :messages="hasMessage(cheader, cvalue)" :filled="sfilled" item-text="value" item-value="key" persistent-hint>
        <template v-slot:message="{ message }"> <span v-html="message"></span> </template
      ></v-autocomplete>
    </template>
    <template v-else-if="cheader.type == 'tags'">
      <v-autocomplete v-model="cvalue" :items="formatTags(cheader, cvalue)" :label="cheader.text" :hint="hasHint(cheader, cvalue)" :messages="hasMessage(cheader, cvalue)" :disabled="disabled" :readonly="disabled" item-text="value" item-value="key" filled multiple deletable-chips chips dense clearable persistent-hint>
        <template v-slot:selection="data">
          <v-chip class="info chip-close my-1" close v-bind="data.attrs" :input-value="data.selected" @click="data.select" @click:close="onClearTag(data.item)" :disabled="disabled">
            {{ data.item.value }}
          </v-chip>
        </template>
        <template v-slot:message="{ message }"> <span v-html="message"></span> </template>
      </v-autocomplete>
    </template>
    <v-switch v-else-if="['bool', 'boolean'].includes(cheader.type)" :disabled="disabled" :readonly="disabled" inset color="success" v-model="cvalue" :label="cheader.text" :hint="hasHint(cheader, cvalue)" @change="onChange($event)" persistent-hint></v-switch>
    <template v-else-if="['number', 'long_number'].includes(cheader.type)">
      <v-autocomplete v-if="needsTranslation(cheader.value)" :disabled="disabled" :readonly="disabled" :label="cheader.text" :hint="hasHint(cheader, cvalue)" :messages="hasMessage(cheader, cvalue)" v-model="cvalue" :items="translator.getValues(cheader.value)" :filled="sfilled" @change="onChange($event)" @paste="onPaste($event)" :no-data-text="formatNoDataText(cheader.hint, cheader.text)" persistent-hint>
        <template v-slot:message="{ message }"> <span v-html="message"></span> </template
      ></v-autocomplete>
      <v-text-field v-else :disabled="disabled" :readonly="disabled" type="number" v-model.number="cvalue" :label="cheader.text" :hint="hasHint(cheader, cvalue)" :messages="hasMessage(cheader, cvalue)" :rules="[testPattern]" :filled="filled" @change="onChange($event)" @paste="onPaste($event)" persistent-hint>
        <template v-slot:message="{ message }"> <span v-html="message"></span> </template
      ></v-text-field>
    </template>
    <template v-else>
      <v-autocomplete v-if="needsTranslation(cheader.value)" :disabled="disabled" :readonly="disabled" :label="cheader.text" :hint="hasHint(cheader, cvalue)" :messages="hasMessage(cheader, cvalue)" v-model="cvalue" :items="translator.getValues(cheader.value)" :filled="sfilled" @change="onChange($event)" @paste="onPaste($event)" :no-data-text="formatNoDataText(cheader.hint, cheader.text)" persistent-hint>
        <template v-slot:message="{ message }"> <span v-html="message"></span> </template
      ></v-autocomplete>
      <v-text-field v-else :disabled="disabled" :readonly="disabled" v-model="cvalue" :label="cheader.text" :hint="hasHint(cheader, cvalue)" :messages="hasMessage(cheader, cvalue)" :rules="[testPattern]" :filled="filled" @change="onChange($event)" @paste="onPaste($event)" persistent-hint>
        <template v-slot:message="{ message }"> <span v-html="message"></span> </template
      ></v-text-field>
    </template>
  </div>
</template>

<script>
export default {
  name: "flo-meta-field-edit",
  data: function () {
    return {
      filled: false,
      sfilled: true,
      dvalue: this.value,
      dheader: this.header,
      dpattern: this.pattern,
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
    disabled: {
      type: Boolean,
      default: true,
    },
    dense: {
      type: Boolean,
      required: false,
      default: false,
    },
    pattern: {
      type: String,
      default: "",
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
          return this.value.split(",").map((m) => m.trim());
        }

        return this.value;
      },
      set(val) {
        this.dvalue = val;
        if (this.header.type == "boolean" || this.header.type == "bool") {
          this.$emit("input", this.dvalue ? 1 : 0);
        } else if (this.header.type == "tags") {
          this.dvalue = this.dvalue.filter(Boolean).join(",").trim();
          this.$emit("input", this.dvalue);
        }

        this.$emit("input", this.dvalue);
      },
    },
    cpattern: {
      get() {
        return this.pattern;
      },
      set(val) {
        this.dpattern = val;
      },
    },
    cheader: {
      get() {
        return this.dheader;
      },
      set(param) {
        this.dheader = param;
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
    testPattern(value) {
      let header = this.cheader;
      if (header.hasOwnProperty("nullable")) {
        if (header.nullable == false && !header.hasOwnProperty("default")) {
          if (value === null || value == "") {
            return `Validation failed, field must have a value.`;
          }
        }
      }
      if (header.hasOwnProperty("min")) {
        if (value < header.min) {
          return `Validation failed, value ${value} is less than ${header.min}.`;
        }
      }
      if (header.hasOwnProperty("max")) {
        if (value > header.max) {
          return `Validation failed, value ${value} is bigger than ${header.max}.`;
        }
      }
      const spattern = this.pattern;
      const lpattern = new RegExp(spattern);
      return lpattern.test(value) || `Validation failed, value doesn't match pattern.`;
    },
    getTimeStamp(event, key) {
      let lvalue = "";
      if (this.needsTranslation(key)) {
        lvalue = this.translator.toUIByKey(key, event);
      } else {
        lvalue = event;
      }

      return lvalue;
    },
    onTimeStampChanged(event, key) {
      let lvalue = event;
      this.$emit("input", lvalue);
    },
    onChange(event) {
      this.$emit("change", event);
    },
    onPaste(event) {
      this.dvalue = event.clipboardData.getData("text/plain");
    },
    onClearTag(event) {
      this.dvalue = this.dvalue
        .split(",")
        .filter((f) => f != event.key)
        .join(",");
      this.$emit("input", this.dvalue);
    },
    hasMessage(header, value) {
      return header.hasOwnProperty("message") && header.message != undefined ? this.formatMessage(this.hasHint(header, value), header.message) : "";
    },
    hasHint(header, value) {
      let hint = header.hasOwnProperty("hint") && header.hint != undefined ? header.hint : "";
      if (value && header.pattern != "enum" && header.type != "boolean" && !this.needsTranslation(header.value)) {
        let error = this.testPattern(value);
        if (typeof error == "string") {
          hint = error;
        }
      }

      return hint;
    },
    formatNoDataText(hint, label) {
      return hint ? `Please select ${hint}.` : `Please select ${label}.`;
    },
    formatMessage(hint, message) {
      return `${hint}
        <br />
        <span class="caption info--text">${message}</span>`;
    },
    formatTags(header, value) {
      return header.hasOwnProperty("tags") ? header.tags : value.filter((m) => m.trim() !== "").map((m) => ({ key: m, value: m }));
    },
  },
};
</script>
