<template>
  <div class="flo-meta-dynamic-select">
    <v-select @input="onAutoCompleteInput($event)" v-model="item" :item-text="qconcat ? 'qconcat' : qtext" :item-value="qkey" :items="items" :label="label" :hint="label" persistent-hint :outlined="outlined" :filled="filled"></v-select>
  </div>
</template>

<script>
import parseNetError from "~/mixins/parseNetError.js";
export default {
  name: "flo-meta-dynamic-select",
  data: () => ({
    items: [],
    loading: false,
    item: null,
    search: "",
    searchHistory: [],
    errorMessages: [],
  }),
  props: {
    // v-model prop is always value
    value: {
      type: [String, Number],
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      required: false,
    },
    resources: {
      type: String,
      required: true,
    },
    concatKeys: {
      type: Array,
      required: false,
      default: () => [],
    },
    query: {
      type: Object,
      required: false,
      default: null,
    },

    limit: {
      type: Number,
      required: false,
      default: 1000,
    },
    qkey: {
      type: String,
      required: false,
      default: "text",
    },
    qtext: {
      type: String,
      required: false,
      default: "text",
    },
    qconcat: {
      type: Boolean,
      required: false,
      default: false,
    },
    outlined: {
      type: Boolean,
      required: false,
      default: false,
    },
    filled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    match: {
      get() {
        return this.search;
      },
      set(v) {
        if (this.search !== v) {
          this.search = v;
          if (!this.searchHistory.includes(v)) {
            this.fetchAutocomplete();
          }
        }
      },
    },
  },
  mixins: [parseNetError],
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      console.log(`floMetaDynamicSelect - initialize - value: ${JSON.stringify(this.value)}`);

      this.item = this.value;
      this.fetchAutocomplete();
    },

    getResourceUrl() {
      let lurl = "";
      if (typeof this.module !== "undefined") {
        lurl += `${this.module.toLowerCase()}/`;
      }
      lurl += `${this.resources.toLowerCase()}`;

      return lurl;
    },

    onAutoCompleteInput(event) {
      console.log(`floMetaDynamicSelect - onAutoCompleteInput`);
      this.$emit("input", event);
      this.$emit("change", event);
    },

    async fetchAutocomplete() {
      this.loading = true;
      this.errorMessages = [];

      try {
        let query = this.query;
        if (!query.hasOwnProperty("page")) {
          query["page"] = {
            limit: this.limit,
            offset: 0,
          };
        }

        if (null !== this.search && "" !== this.search) {
          if (!query.hasOwnProperty("where")) {
            query["where"] = [];
          }
        }

        let ldata = await this.$axios.$post(`/api/v1/${this.getResourceUrl()}/list`, query);

        if (!this.searchHistory.includes(this.search)) {
          this.searchHistory.push(this.search);
          console.log(`floMetaDynamicSelect - fetchAutocomplete - push search - ${this.search}`);
        }

        console.log(`floMetaDynamicSelect - fetchAutocomplete - data: ${JSON.stringify(ldata)}`);

        console.log(`floMetaDynamicSelect - concatKeys - length: ${this.concatKeys.length} `);
        if (this.concatKeys.length > 0) {
          console.log(`floMetaDynamicSelect - fetchAutocomplete - qconcatkeys`);
          let items = [];

          for (let i = 0; i < ldata.length; i++) {
            let el = ldata[i];

            let lkeys = [];
            for (let j = 0; j < this.concatKeys.length; j++) {
              let lkey = this.concatKeys[j];
              console.log(`floMetaDynamicSelect - fetchAutocomplete - concatKey - ${lkey}`);
              lkeys.push(el[lkey]);
            }

            console.log(`floMetaDynamicSelect - fetchAutocomplete - concatKeys - ${JSON.stringify(lkeys)}`);

            el[this.qkey] = lkeys.join("-");

            items.push(el);
          }

          ldata = items;

          console.log(`floMetaDynamicSelect - fetchAutocomplete - qconcatkeys - items: ${JSON.stringify(ldata)}`);
        }

        if (this.qconcat) {
          console.log(`floMetaDynamicSelect - fetchAutocomplete - qconcat`);
          this.items = [];

          for (let i = 0; i < ldata.length; i++) {
            let el = ldata[i];
            el["qconcat"] = `${el[this.qkey]}: ${el[this.qtext]}`;
            this.items.push(el);
          }

          console.log(`floMetaDynamicSelect - fetchAutocomplete - qconcat - items: ${JSON.stringify(ldata)}`);
        } else {
          this.items = ldata;
        }
      } catch (err) {
        let laerr = this.parseNetError(err);
        this.errorMessages.push(`${laerr.statusCode} - ${laerr.message}`);
      }

      this.loading = false;
    },
  },
};
</script>
