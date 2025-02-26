<template>
  <div class="flo-ram-action">
    <v-container class="ma-0 pa-0" fluid v-if="!loading">
      <v-row no-gutters>
        <v-col cols="12" class="pa-1">
          <flo-rfm-misc @change="onMiscChange($event)" :aids="getUiccAids()" :value="value" :transport="transport" :disabled="disabled" :readonly="readonly" :use_cla="false" :use_base="false" aid_category="ISD" />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="12" class="pa-1">
          <v-card flat outlined class="pa-1">
            <v-container fluid class="ma-0 pa-0">
              <v-row no-gutters>
                <v-col cols="12" lg="3" xl="3" class="pa-1">
                  <v-select :value="getActionType()" @change="onActionChange($event)" :label="meta.actions.label" :type="meta.actions.type" :hint="meta.actions.hint" :items="meta.actions.items" :disabled="disabled" :readonly="readonly" item-text="value" item-value="key" outlined dense persistent-hint> </v-select>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import floRfmMisc from "~/components/se/floRfmMisc.vue";
export default {
  name: "flo-ram-action",
  components: {
    floRfmMisc,
  },
  data() {
    return {
      loading: true,
      operation: { type: "", app: "" },
      meta: {
        actions: {
          label: "Actions",
          hint: "Select Action",
          input: "text",
          type: "text",
          items: [
            {
              key: "extended_data",
              value: "Extended Data",
            },
            {
              key: "get_status",
              value: "Get Status",
            },
            {
              key: "set_status",
              value: "Set Status",
            },
            {
              key: "get_data",
              value: "Get Data",
            },
            {
              key: "store_data",
              value: "Store Data",
            },
          ],
        },
      },
    };
  },
  props: {
    iccid: {
      type: String,
      required: true,
      default: "",
    },
    uicc: {
      type: Object,
      default: () => {},
    },
    value: {
      type: [Object, Array],
      default: null,
    },
    transport: {
      type: String,
      required: true,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      if (this.value) {
        this.operation = this.value;
      }
      this.loading = false;
    },
    syncParent() {
      console.log(`flo-ram-action - syncParent - enter - ${JSON.stringify(this.operation)}`);
      this.$emit("change", this.operation);
    },
    onActionChange(event) {
      this.operation.type = event;
      this.syncParent();
    },
    onMiscChange(event) {
      if (event) {
        this.operation.app = event.app;
        this.syncParent();
      }
    },
    getActionType() {
      if (this.operation.hasOwnProperty("type")) {
        return this.operation.type;
      }
      return "";
    },
    getUiccAids() {
      if (!this.uicc.hasOwnProperty("aids")) {
        return null;
      }
      return this.uicc.aids;
    },
  },
};
</script>
