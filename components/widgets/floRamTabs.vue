<template>
  <div class="flo-ram-tabs">
    <v-container v-if="!loading" class="ma-0 pa-0" fluid>
      <v-tabs v-model="sel_ram_tab" class="pa-1">
        <v-tab href="#tab-applets">Applets</v-tab>
        <!-- <v-tab href="#tab-actions" v-if="!readonly">Actions</v-tab> -->
        <v-tab href="#tab-isd_keys" v-if="!readonly">Keys</v-tab>

        <v-tab-item value="tab-applets">
          <v-card flat outlined class="ma-0 pa-0">
            <v-container fluid class="ma-0 pa-0">
              <v-row no-gutters>
                <v-col cols="12">
                  <flo-ram-app v-if="sel_ram_tab == 'tab-applets'" :value="getRamAppletOperations()" :uicc="uicc" :transport="transport" :disabled="disabled" :readonly="readonly" :card_applets="card_applets" @change="onRamAppletChange($event)" />
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-tab-item>

        <!-- <v-tab-item value="tab-actions" v-if="!readonly">
          <v-card flat outlined class="ma-0 pa-0">
            <v-container fluid class="ma-0 pa-0">
              <v-row no-gutters>
                <v-col cols="12">
                  <flo-ram-action v-if="sel_ram_tab == 'tab-actions'" :iccid="iccid" :uicc="uicc" :transport="transport" :disabled="disabled" :readonly="readonly" />
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-tab-item> -->

        <v-tab-item value="tab-isd_keys" v-if="!readonly">
          <v-card v-if="sel_ram_tab == 'tab-isd_keys'" flat outlined class="ma-0 pa-0">
            <v-container fluid class="ma-0 pa-0">
              <v-row no-gutters>
                <v-col cols="12">
                  <flo-ram-keys :value="getRamKeysOperations()" @change="onRamKeysChange($event)" :iccid="iccid" :uicc="uicc" :transport="transport" :keyset80="keyset80" :keyset81="keyset81" :disabled="disabled" :readonly="readonly" />
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-tab-item>
      </v-tabs>
    </v-container>
  </div>
</template>

<script>
import floRamApp from "~/components/se/floRamApp.vue";
import floRamKeys from "~/components/se/floRamKeys.vue";
export default {
  name: "flo-ram-tabs",
  components: {
    floRamApp,
    floRamKeys,
  },
  data() {
    return {
      sel_ram_tab: "tab-applets",
      loading: false,
      operations: [],
    };
  },
  props: {
    campaign_lead_by: {
      type: String,
      default: "",
      required: false,
    },
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
    card_applets: {
      type: [Number, String, Object, Array],
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
    keyset80: {
      type: Number,
      required: false,
      default: 0,
    },
    keyset81: {
      type: Number,
      required: false,
      default: 0,
    },
    parameters: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      console.log(`flo-ram-tabs - initialize - enter`);
      this.loading = true;
      console.log(`flo-ram-tabs - initialize - value: ${JSON.stringify(this.value)}`);

      if (null == this.value) {
        this.syncParent();
      } else {
        this.operations = this.value;

        if (this.operations) {
          if (this.operations.length > 0) {
            if (this.operations[0].hasOwnProperty("type")) {
              this.sel_ram_tab = `tab-${this.operations[0].type}`;
              console.log(`flo-ram-tabs - initialize - set selected tab to: ${this.sel_ram_tab}`);
            }
          }
        }

        console.log(`flo-ram-tabs - initialize - value (operations): ${JSON.stringify(this.operations)}`);
      }

      this.loading = false;
    },
    syncParent() {
      console.log(`flo-ram-tabs - syncParent - enter - ${JSON.stringify(this.operations)}`);
      this.$emit("change", this.operations);
    },
    onRamKeysChange(event) {
      console.log(`flo-ram-tabs - onRamKeysChange - enter - ${JSON.stringify(event)} - sel_ram_tab:${this.sel_ram_tab}`);
      this.operations = event;
      this.syncParent();
    },
    getRamKeysOperations() {
      console.log(`flo-ram-tabs - getRamKeysOperation - enter`);
      if (!this.operations) {
        return [];
      }
      return this.operations;
    },
    onRamAppletChange(event) {
      console.log(`flo-ram-tabs - onRamAppletChange - enter - ${JSON.stringify(event)} - sel_ram_tab:${this.sel_ram_tab}`);
      if ("tab-applets" == this.sel_ram_tab) {
        let _t = [];
        _t.push(event);

        this.operations = event;
        this.syncParent();
      }
    },
    getRamAppletOperations() {
      console.log(`flo-ram-tabs - getRamAppletOperations - enter`);
      if (!this.operations) {
        return null;
      }

      if (this.operations.length < 1) {
        return null;
      }

      let lop = this.operations[0];
      if (null == lop) {
        return null;
      }

      return this.operations;
    },
  },
};
</script>
