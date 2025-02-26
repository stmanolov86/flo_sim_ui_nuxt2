<template>
  <div class="flo-account-select">
    <v-select v-model="selected_item" :items="accounts_paths" :label="label" :hint="hint" :disabled="disabled" :filled="filled" :outlined="outlined" :dense="dense" :persistent-hint="persistent_hint" item-text="text" />
  </div>
</template>

<script>
export default {
  name: "flo-account-select",
  data: () => ({
    accounts_paths: [],
  }),
  props: {
    value: {
      type: String,
      required: false,
    },
    label: {
      type: String,
      default: "Account",
      required: false,
    },
    hint: {
      type: String,
      default: "Access Account",
      required: false,
    },
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    persistent_hint: {
      type: Boolean,
      default: true,
      required: false,
    },
    filled: {
      type: Boolean,
      default: true,
      required: false,
    },
    outlined: {
      type: Boolean,
      default: false,
      required: false,
    },
    dense: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  computed: {
    selected_item: {
      get() {
        return this.getDefaultAccount();
      },
      set(param) {
        console.log(`floAccountSelect - selected_item - set value - ${JSON.stringify(param)}`);
        if (typeof param === "undefined") {
          return;
        }
        if (param == null) {
          return;
        }
        this.$emit("input", param);
      },
    },
  },
  async created() {
    await this.initialize();
  },
  methods: {
    getDefaultAccount() {
      let l_default_account = null;
      if (this.accounts_paths.length) {
        for (let i = 0; i < this.accounts_paths.length; i++) {
          if (this.accounts_paths[i].value == this.value) {
            l_default_account = this.accounts_paths[i];
            console.log(`floAccountSelect - getDefaultAccount - found by value - ${JSON.stringify(l_default_account)}`);
            return l_default_account;
          }
        }

        l_default_account = this.accounts_paths[0];
        console.log(`floAccountSelect - getDefaultAccount - take first - ${JSON.stringify(l_default_account)}`);
        return l_default_account;
      }

      console.log(`floAccountSelect - getDefaultAccount - take null`);
      return l_default_account;
    },
    async _initialize() {
      console.log(`floAccountSelect - _initialize`);
      const llist = {
        select: {
          id: {},
          path: {},
          name: {},
        },
      };
      let laccounts_paths = [];
      try {
        let ldata = await this.$axios.$post(`/api/v1/accounts/list`, llist);
        console.log(`floAccountSelect - _initialize - ${JSON.stringify(ldata)}`);

        for (let i = 0; i < ldata.length; i++) {
          let item = {
            value: ldata[i].path,
            text: ldata[i].name,
          };

          laccounts_paths.push(item);
        }
        console.log(`floAccountSelect - _initialize - laccounts_paths:${JSON.stringify(laccounts_paths)}`);
        return laccounts_paths;
      } catch (err) {
        console.log(`floAccountSelect - _initialize - FAIL - ${err}:${JSON.stringify(err)}`);
        throw err;
      }
    },
    async initialize() {
      try {
        console.log(`floAccountSelect - initialize`);
        console.log(`floAccountSelect - initialize - value: ${JSON.stringify(this.value)}`);
        let result = await this._initialize();
        this.accounts_paths = result;
        let l_account = this.getDefaultAccount();
        if (l_account) {
          this.selected_item = l_account.value;
        }
      } catch (err) {
        console.log(err);
      }
    },
  },
};
</script>
