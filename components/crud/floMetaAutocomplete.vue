<template>
  <div class="flo-meta-autocomplete">
    <v-autocomplete v-model="item" :items="items" :loading="loading" :search-input.sync="match" :item-text="qconcat ? 'qconcat' : qtext" :label="label" hide-no-data auto-select-first cache-items :hint="`Type to search ${label} `" :placeholder="`${label} Search`" :error-messages="errorMessages" filled return-object @input="onAutoCompleteInput($event)"></v-autocomplete>
  </div>
</template>

<script>
import parseNetError from "~/mixins/parseNetError.js";
export default {
  name: "flo-meta-autocomplete",
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
      type: Object,
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
    query: {
      type: Object,
      required: false,
      default: null,
    },
    limit: {
      type: Number,
      required: false,
      default: 10,
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
  },
  computed: {
    match: {
      get() {
        // console.log(`flo-meta-autocomplete: - search - get - enter`);
        return this.search;
      },
      set(v) {
        // console.log(`flo-meta-autocomplete: - search - set - enter`);
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
    // console.log(`flo-meta-autocomplete: created`);
    this.initialize();
  },
  methods: {
    initialize() {
      console.log(`floMetaAutocomplete - initialize - value: ${JSON.stringify(this.value)}`);
      if (this.value[this.qtext] === null) {
        this.search = "";
      } else if (this.value[this.qtext] === "") {
        this.search = this.value[this.qtext];
        // this.fetchAutocomplete();
      } else {
        this.search = this.value[this.qtext];
        this.items.push(this.value);
        this.item = this.value;
      }
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
      console.log(`floMetaAutocomplete - onAutoCompleteInput`);
      console.log(event);
      this.$emit("input", event);
      this.$emit("change", event);
    },

    async fetchAutocomplete() {
      this.loading = true;
      this.errorMessages = [];

      try {
        // console.log(`floMetaAutocomplete - fetchAutocomplete - ${this.search}`);

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

          // real cretieria field
          let realc = query.select[this.qtext].k;

          let criteria = query.where.filter((w) => w.k == realc);
          let qsearch = this.search;

          if (criteria.length === 0) {
            query.where.push({ k: realc, op: "like", v: `${qsearch}%` });
          } else {
            criteria.v = `${qsearch}%`;
          }
        }

        let ldata = await this.$axios.$post(`/api/v1/${this.getResourceUrl()}/list`, query);

        if (!this.searchHistory.includes(this.search)) {
          this.searchHistory.push(this.search);
          console.log(`floMetaAutocomplete - fetchAutocomplete - push search - ${this.search}`);
        }

        console.log(`floMetaAutocomplete - fetchAutocomplete - data: ${JSON.stringify(ldata)}`);

        /// map items
        // this.items = data.map(o => ({ name: o.name, uuid: o.uuId, path: o.path }) );
        if (this.qconcat) {
          console.log(`floMetaAutocomplete - fetchAutocomplete - qconcat`);
          this.items = [];

          for (let i = 0; i < ldata.length; i++) {
            let el = ldata[i];
            el["qconcat"] = `${el[this.qkey]} - ${el[this.qtext]}`;
            this.items.push(el);
          }

          console.log(`floMetaAutocomplete - fetchAutocomplete - qconcat - items: ${JSON.stringify(ldata)}`);
        } else {
          this.items = ldata;
        }
      } catch (err) {
        //this.error = true;
        let laerr = this.parseNetError(err);
        this.errorMessages.push(`${laerr.statusCode} - ${laerr.message}`);
      }

      this.loading = false;
    },
  },
};
</script>
