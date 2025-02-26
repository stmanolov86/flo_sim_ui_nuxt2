<template>
  <div class="flo-meta-select-single">
    <v-select v-model="item" :items="items" :loading="loading" :item-text="qconcat ? 'qconcat' : qtext" :item-value="qkey" :label="label" hide-no-data auto-select-first :hint="`Type to search ${label} `" :placeholder="`${label} Search`" :error-messages="errorMessages" filled return-object @input="onSelectionChanged($event)"></v-select>
  </div>
</template>

<script>
import parseNetError from "~/mixins/parseNetError.js";
export default {
  name: "flo-meta-select-single",
  data: () => ({
    items: [],
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
      default: "key",
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
  mixins: [parseNetError],
  created() {
    this.initialize();
  },
  methods: {
    async initialize() {
      await this.fetchData();
      this.item = this.findItem(this.value);
    },
    findItem(text) {
      let litems = this.items.filter((i) => i[this.qtext] == text);
      if (litems.length === 0) return null;

      return litems[0];
    },
    getResourceUrl() {
      let lurl = "";
      if (typeof this.module !== "undefined") {
        lurl += `${this.module.toLowerCase()}/`;
      }
      lurl += `${this.resources.toLowerCase()}`;

      return lurl;
    },
    onSelectionChanged(event) {
      this.$emit("input", event);
      this.$emit("change", event);
    },
    async fetchData() {
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

        let ldata = await this.$axios.$post(`/api/v1/${this.getResourceUrl()}/list`, query);

        if (this.qconcat) {
          console.log(`floMetaSelectSingle - fetchData - qconcat`);
          this.items = [];

          for (let i = 0; i < ldata.length; i++) {
            let el = ldata[i];
            el["qconcat"] = `${el[this.qkey]} - ${el[this.qtext]}`;
            this.items.push(el);
          }
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
