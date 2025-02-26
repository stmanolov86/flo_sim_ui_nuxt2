<template>
  <div class="flo-account-select-ex">
    <v-autocomplete v-model="item" :items="items" :loading="loading" :search-input.sync="match" item-text="name" :label="label" hide-no-data auto-select-first cache-items :hint="`Type to search ${label} `" :placeholder="`${label} Search`" :error-messages="errorMessages" filled return-object @input="onAutoCompleteInput($event)"></v-autocomplete>
  </div>
</template>

<script>
import parseNetError from "~/mixins/parseNetError.js";
export default {
  name: "flo-account-select-ex",
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
  created() {
    this.initialize();
  },
  mixins: [parseNetError],
  methods: {
    initialize() {
      if (this.value.aname === "") {
        this.search = "%";
      } else {
        this.item = {
          name: this.value.aname,
          uuid: this.value.aid,
          path: this.value.apath,
        };
        this.items.push(this.item);
        this.search = this.item.name;
      }
    },
    onAutoCompleteInput(event) {
      console.log(`floAccountSelectEx - onAutoCompleteInput`);
      console.log(event);
      this.$emit("input", event);
    },
    async fetchAutocomplete() {
      let luser = this.$store.getters["session/user"];
      if (luser.externalAccount) {
        return await this.fetchAutocompleteExternal();
      } else {
        return await this.fetchAutocompleteLocal();
      }
    },
    async fetchAutocompleteLocal() {
      console.log(`floAccountSelectEx - fetchAutocompleteLocal - push search - ${this.search}`);

      const llist = {
        select: {
          id: {},
          path: {},
          name: {},
          uuid: {},
        },
        where: [
          {
            k: "name",
            op: "clike",
            v: `${this.search}%`,
          },
        ],
      };

      try {
        let ldata = await this.$axios.$post(`/api/v1/accounts/list`, llist);

        if (!this.searchHistory.includes(this.search)) {
          this.searchHistory.push(this.search);
          console.log(`floAccountSelectEx - fetchAutocompleteLocal - push search - ${this.search}`);
        }

        this.items = ldata;
        return ldata;
      } catch (err) {
        console.log(`floAccountSelect - _initialize - FAIL - ${err}:${JSON.stringify(err)}`);
        throw err;
      }
    },
    async fetchAutocompleteExternal() {
      this.loading = true;
      this.errorMessages = [];

      try {
        console.log(`floAccountSelectEx - fetchAutocomplete - ${this.search}`);
        let data = await this.$axios.$get(`/crm/api/v1/accounts-autocomplete/${this.search === "" ? "a" : this.search}/10`);
        this.items = data.map((o) => ({
          name: o.name,
          uuid: o.uuId,
          path: o.path,
        }));
        if (!this.searchHistory.includes(this.search)) {
          this.searchHistory.push(this.search);
          console.log(`floAccountSelectEx - fetchAutocomplete - push search - ${this.search}`);
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
