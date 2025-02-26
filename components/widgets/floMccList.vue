<template>
  <div v-if="translator !== null" class="flo-mcc-list">
    <v-row no-gutters>
      <v-col class="pa-1" cols="12" :lg="getLengthMap(mcc)" :xl="getLengthMap(mcc)">
        <v-autocomplete @change="onChange($event)" @paste="onPaste($event)" :value="mcc" :items="filterCountries()" :rules="[mccRule]" :messages="formatMessages().countries" :disabled="disabled" label="MCC List" hint="Mobile Country Code Availability" item-text="value" item-value="key" multiple deletable-chips chips clearable dense color="primary" chip-color="success" persistent-hint outlined>
          <template v-slot:selection="data">
            <v-chip class="success chip-close mt-1" close v-bind="data.attrs" :input-value="data.selected" @click="data.select" @click:close="clearCountry(data.item)" :disabled="disabled">
              {{ data.item.value }}
            </v-chip>
          </template>
          <template v-slot:message="{ message }">
            <span v-html="message"></span>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col class="pa-1" cols="12" :lg="getLengthMap(excluded_countries)" :xl="getLengthMap(excluded_countries)">
        <v-autocomplete v-if="wildCards(mcc).length > 0" :value="excluded_countries" @change="onExcludedChange($event)" :items="filterExcludedCountries()" :rules="[mccRule]" :messages="formatMessages().excluded_countries" :disabled="disabled" label="Excluded Countries MCC List" hint="Excluded Countries Mobile Country Code Availability" item-text="value" item-value="key" multiple deletable-chips chips clearable dense color="primary" persistent-hint outlined>
          <template v-slot:selection="data">
            <v-chip class="error chip-close mt-1" close v-bind="data.attrs" :input-value="data.selected" @click="data.select" @click:close="clearExcludedCountry(data.item)" :disabled="disabled">
              {{ data.item.value }}
            </v-chip>
          </template>
          <template v-slot:message="{ message }">
            <span v-html="message"></span>
          </template>
        </v-autocomplete>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import OTranslator from "~/src/otranslator.js";
import helpers from "~/src/helpers.js";
export default {
  name: "flo-mcc-list",
  data: () => ({
    helpers,
    translator: null,
    countries: [],
    excluded_countries: [],
  }),
  props: {
    value: {
      type: [String, Array],
      required: true,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    messages: {
      type: String,
      required: false,
      default: "",
    },
    length: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  computed: {
    mcc: {
      get() {
        let val = this.getMccValue();
        let idx = val.indexOf("DDD");
        return idx !== -1 ? val.slice(0, idx) : val;
      },
      set(val) {
        if (typeof this.value == "string" && typeof val != "string") {
          val = val.filter(Boolean).join(",").trim();
        }
        this.$emit("input", val);
      },
    },
    mccRule() {
      return (v) => this.getMccValue().length <= 16 || "You can have maximum of 16 MCCs per Subscriber *This includes the DDD separator.";
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        let value = typeof val == "string" ? val.split(",") : val;
        let idx = value.indexOf("DDD");
        if (idx !== -1) {
          this.excluded_countries = value.slice(idx + 1);
        }
        if (idx !== -1 && this.excluded_countries.length == 0) {
          value.splice(idx, 1);
        }
      },
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      let translator = new OTranslator();
      translator.setEnumEx("countries", this.$store.getters["session/cache"]["/denum/mcc"].value);
      let l_countries = translator.getKeyValues("countries");
      this.countries = this.createCountriesList(l_countries);
      this.translator = translator;
    },
    createCountriesList(countries) {
      // store unique keys and concatenated values
      let unique_countries = {};

      countries.forEach((country) => {
        const { key, value } = country;

        if (unique_countries[key]) {
          // concatenate the new value to the existing one
          let country_name = value.split(": ")[1];
          unique_countries[key] += `, ${country_name}`;
        } else {
          unique_countries[key] = value;
        }
      });

      // convert the unique_countries object back to array
      return Object.entries(unique_countries).map(([key, value]) => {
        let [code, name] = value.split(": ");
        return { key, value: `${code}: ${helpers.capitalizeAllFLetter(name, " ")}` };
      });
    },
    clearCountry(item) {
      let idx = this.mcc.indexOf(item.key);
      if (idx >= 0) {
        let wc = this.wildCards(this.mcc);
        if (item.key == "FFF") {
          this.excluded_countries = [];
        }
        if (wc.includes(item.key)) {
          this.excluded_countries = this.excluded_countries.filter((f) => !f.startsWith(item.key.charAt(0)));
        }
        this.mcc.splice(idx, 1);
        this.onChange(this.mcc);
      }
    },
    clearExcludedCountry(item) {
      let idx = this.excluded_countries.indexOf(item.key);
      if (idx >= 0) {
        this.excluded_countries.splice(idx, 1);
        this.onExcludedChange(this.excluded_countries);
      }
    },
    onPaste(event) {
      this.mcc = event.clipboardData.getData("text/plain");
    },
    onChange(event) {
      if (event) {
        let excluded = this.formatCountries(this.excluded_countries);
        this.mcc = [...new Set([...event, ...(excluded.length > 0 ? ["DDD", ...excluded] : [])])];
      }
    },
    onExcludedChange(event) {
      if (event) {
        this.mcc = [...new Set([...this.mcc, ...(event.length > 0 ? ["DDD", ...this.formatCountries(event)] : [])])];
      }
    },
    wildCards(countries) {
      return ["2FF", "3FF", "4FF", "5FF", "6FF", "7FF", "FFF"].filter((f) => countries.includes(f));
    },
    filterCountries() {
      let excluded = this.excluded_countries;
      if (excluded.length > 0) {
        let wc = this.wildCards(excluded);
        if (wc.length > 0) {
          return this.countries.filter((f) => !wc.map((m) => m.charAt(0)).some((s) => f.key.startsWith(s)) && !excluded.includes(f.key));
        } else {
          return this.countries.filter((f) => !excluded.includes(f.key));
        }
      } else {
        return this.countries;
      }
    },
    filterExcludedCountries() {
      let wc = this.wildCards(this.mcc);
      let mapped = wc.map((m) => (m == "FFF" ? "FFF" : m[0]));

      return this.countries.filter((f) => {
        if (mapped.includes("FFF")) {
          return !wc.includes(f.key) && !this.mcc.includes(f.key);
        } else {
          return mapped.includes(f.key[0]) && !wc.includes(f.key) && !this.mcc.includes(f.key);
        }
      });
    },
    formatCountries(countries) {
      return Array.isArray(countries) ? countries : countries.split(",");
    },
    formatMessages() {
      if (this.messages) {
        let regex = /Differs from product: (.*)<\/span>/;
        let match = this.messages.match(regex);

        if (match && match[1]) {
          let [countries, excluded] = match[1].split(",DDD,");

          return {
            countries: `
            Mobile Country Code Availability
            <br />
            <span class="caption warning--text">* Differs from product: ${countries}</span>`,
            excluded_countries: excluded
              ? `
            Mobile Country Code Availability
            <br />
            <span class="caption warning--text">* Differs from product: ${excluded}</span>`
              : "",
          };
        }
      }
      return {
        countries: "",
        excluded_countries: "",
      };
    },
    getMccValue() {
      return typeof this.value == "string" ? this.value.split(",") : this.value;
    },
    getLengthMap(value) {
      let len = value.length;
      let lengthMap = {
        0: 2,
        1: 2,
        2: 3,
        3: 4,
        4: 5,
      };

      return this.length ? this.length : lengthMap[len] || 6;
    },
  },
};
</script>
