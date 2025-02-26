<template>
  <div>
    <v-dialog :overlay-opacity="0.4" v-model="clone_dialog" scrollable max-width="650px">
      <v-card>
        <v-card-title>
          <span class="headline">Clone Product</span>
        </v-card-title>
        <v-form @submit.prevent="cloneCreate()">
          <v-card-text>
            <v-container fluid class="ma-0 pa-1">
              <v-row no-gutters>
                <v-col cols="12" lg="6" xl="6" class="pa-1">
                  <v-text-field disabled v-model="editedItem['name']" label="Name" hint="Current resource name" persistent-hint></v-text-field>
                </v-col>

                <v-col cols="12" lg="6" xl="6" class="pa-1 pl-2">
                  <v-text-field v-model="clone_name" label="Clone" hint="Cloned resource name" persistent-hint></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="12" lg="6" xl="6" class="pa-1 mt-2">
                  <v-autocomplete v-model="type.value" :label="type.label" :hint="type.hint" :items="type.items" @change="onTypeChange(null)" item-text="value" item-value="key" dense outlined persistent-hint> </v-autocomplete>
                </v-col>
                <v-col cols="12" lg="6" xl="6" class="pa-1 pl-2 mt-n1">
                  <v-switch v-model="export_base" :disabled="type.value == 'blank'" color="success" inset label="Export as Base"></v-switch>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn color="primary" text @click="cloneClose()">Cancel</v-btn>
            <v-btn color="primary" text :disabled="disabled" type="submit">Create</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
    <flo-meta-table v-if="translator !== null" @load-data="onLoadData($event)" @pre-edit="onPreEdit($event)" @pre-new="onPreNew($event)" @query_change="onQueryChange($event)" :translator="translator" :resources="resources" :can_import="crud.e" :init_filter="init_filter" main_resource>
      <template v-slot:ex_actions="{ fmtindex, fmtpermissions, fmtheader, fmtrow }">
        <v-btn v-if="fmtpermissions.c == true" class="me-2 my-1" color="primary" :fab="!$vuetify.breakpoint.mdAndUp" :small="!$vuetify.breakpoint.mdAndUp" @click="cloneItem(fmtindex, fmtrow)" :__qa="helpers.getQATag(resources, fmtheader)">
          <v-icon :left="$vuetify.breakpoint.mdAndUp">mdi-content-copy</v-icon>
          {{ $vuetify.breakpoint.mdAndUp ? "Clone" : "" }}
        </v-btn>
      </template>
      <template v-slot:edit_manufacturer_id="{ fmtheader, fmtrow }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <v-autocomplete :value="translator.toUIByKey('manufacturer_id', fmtrow.manufacturer_id)" :label="fmtheader.text" disabled :hint="fmtheader.hint" :items="manufacturers" item-text="value" item-value="value" filled persistent-hint></v-autocomplete>
        </v-col>
      </template>
      <template v-slot:edit_type="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <v-autocomplete v-model="fmtrow.type" :label="fmtheader.text" :hint="fmtheader.hint" :items="fmtheader.enum" :disabled="!fmtpermissions.u" @change="onTypeChange(fmtrow)" item-text="value" item-value="key" filled clearable persistent-hint> </v-autocomplete>
        </v-col>
      </template>
      <template v-slot:edit_base="{ fmtheader, fmtrow }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" class="pt-1">
          <v-switch v-model="fmtrow.base" :label="fmtheader.text" :disabled="fmtrow.type == 'blank'" :hint="fmtheader.hint" inset color="success" persistent-hint></v-switch>
        </v-col>
      </template>
      <template v-slot:edit_uicc_id="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <v-autocomplete v-model="fmtrow.uicc_id" :label="fmtheader.text" :hint="fmtheader.hint" :items="uiccs" :disabled="!fmtpermissions.c" @change="setManufacturer($event, fmtrow)" item-text="value" item-value="value" filled persistent-hint></v-autocomplete>
        </v-col>
      </template>
      <template v-slot:edit_replacement_product_id="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <v-autocomplete v-model="fmtrow.replacement_product_id" :label="fmtheader.text" :hint="fmtheader.hint" :items="filterProducts(fmtrow.name)" :disabled="!fmtpermissions.c" item-text="value" item-value="value" filled persistent-hint></v-autocomplete>
        </v-col>
      </template>
      <template v-slot:edit_base_product_id="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <v-autocomplete v-model="fmtrow.base_product_id" :label="fmtheader.text" :hint="fmtheader.hint" :items="filterBaseProducts()" :disabled="!fmtpermissions.c" item-text="value" item-value="value" filled persistent-hint></v-autocomplete>
        </v-col>
      </template>
      <template v-slot:view_replacement_product_id="{ fmtrow }">
        <span v-if="fmtrow.replacement_product_id == 0"></span>
        <v-chip v-else label color="info">{{ fmtrow.replacement_product_id }}</v-chip>
      </template>
      <template v-slot:view_base_product_id="{ fmtrow }">
        <span v-if="fmtrow.base_product_id == 0"></span>
        <v-chip v-else label color="info">{{ fmtrow.base_product_id }}</v-chip>
      </template>
      <template v-slot:view_manufacturer_id="{ fmtrow }">
        <span v-if="fmtrow.manufacturer_id == 0"></span>
        <v-chip v-else label color="info">{{ fmtrow.manufacturer_id }}</v-chip>
      </template>
      <template v-slot:view_uicc_id="{ fmtrow }">
        <v-chip label :color="getUiccColor(fmtrow.uicc_id)">{{ fmtrow.uicc_id }}</v-chip>
      </template>
      <template v-slot:view_state="{ fmtrow }">
        <v-chip class="text-capitalize" :color="getStateColor(fmtrow.state)" label>{{ fmtrow.state }}</v-chip>
      </template>
      <template v-slot:view_bap_state="{ fmtrow }">
        <v-chip class="text-capitalize" :color="getBapStateColor(fmtrow.bap_state)" label>{{ fmtrow.bap_state }}</v-chip>
      </template>
      <template v-slot:view_device_profile="{ fmtrow, fmtheader }">
        <v-chip class="text-capitalize" :color="getDeviceProfileColor(fmtrow.device_profile)" label>{{ getEnumValue(fmtheader, fmtrow.device_profile) }}</v-chip>
      </template>
      <template v-slot:view_os_type="{ fmtrow, fmtheader }">
        <v-chip class="text-capitalize" :color="getOsTypeColor(fmtrow.os_type)" label>{{ getEnumValue(fmtheader, fmtrow.os_type) }}</v-chip>
      </template>
      <template v-slot:view_type="{ fmtrow }">
        <v-chip v-if="fmtrow.type" label :color="getTypeColor(fmtrow.type)">{{ helpers.capitalizeAllFLetter(fmtrow.type, "_") }}</v-chip>
      </template>
      <template v-slot:edit_path="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <flo-account-select v-model="fmtrow.path" :label="fmtheader.text" :disabled="!fmtpermissions.u" :hint="fmtheader.hint" persistent-hint />
        </v-col>
      </template>
      <template v-slot:view_name="{ fmtrow, fmtpermissions }">
        <v-container class="d-flex flex-nowrap">
          <span class="align-self-center text-center ml-n3">{{ fmtrow.name.length > 50 ? `${fmtrow.name.slice(0, 50)}...` : fmtrow.name }}</span>
          <v-btn
            class="ml-1"
            icon
            elevation="0"
            router
            :disabled="!fmtpermissions.r"
            :to="{
              path: '/resources/product/',
              query: { id: fmtrow.id },
            }"
          >
            <v-icon center color="info">mdi-link</v-icon>
          </v-btn>
        </v-container>
      </template>
    </flo-meta-table>
  </div>
</template>
<script>
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
import { mapActions, mapGetters } from "vuex";
export default {
  async fetch({ store }) {
    let lmcc = await store.dispatch("session/getFromCache", "/denum/mcc");
    if (lmcc == null) {
      let query = {
        select: {
          key: { k: "mcc" },
          value: { k: "country" },
        },
      };

      let array = [];
      try {
        array = await store.$axios.$post(`/api/v1/countries/list`, query);
        for (let i = 0; i < array.length; i++) {
          array[i].value = `${array[i].key}: ${array[i].value}`;
        }

        await store.dispatch("session/addToCache", {
          key: "/denum/mcc",
          value: array,
          expire: 60 * 10,
        });
      } catch (err) {
        console.log(`products - fetch - error - countries: ${err}`);
        return "ok";
      }
    }
  },
  data: () => ({
    helpers,
    resource: "product",
    resources: "products",
    translator: null,
    clone_dialog: false,
    clone_name: "",
    editedItem: {},
    editedIndex: -1,
    init_filter: [],
    manufacturers: [],
    records: [],
    products: [],
    uiccs: [],
    crud: null,
    export_base: false,
    type: {
      value: "standard",
      label: "Type",
      hint: "Product Type",
      items: [
        { key: "standard", value: "Standard" },
        { key: "blank", value: "Blank" },
      ],
    },
  }),
  watch: {
    clone_dialog(val) {
      this.clone_name = "";
      this.export_base = false;
      val || this.cloneClose();
    },
  },
  computed: {
    disabled() {
      let disabled = false;
      if (this.clone_name == "") {
        disabled = true;
      }
      return disabled;
    },
    ...mapGetters({
      getPermissions: "session/permissions",
    }),
  },
  async created() {
    await this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    ...mapActions({
      clearResourceCache: "session/clearResourceCache",
    }),
    onLoadData(data) {
      this.records = data.items;
      for (const header of data.headers) {
        switch (header.value) {
          case "path":
          case "eid_of":
            {
              header.view = false;
            }
            break;
          case "extra":
          case "attr":
          case "aid":
            {
              header.edit = false;
              header.view = false;
            }
            break;
          case "multi_imsi":
          case "applets":
          case "bap_state":
          case "end_of_life":
          case "state":
          case "id":
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "user_email":
          case "bap_comment":
          case "bap_user":
          case "bap_ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
              header.view = false;
              header.gpath = "/BAP & Contact Information";
            }
            break;
          case "shipping_address":
            {
              header.view = false;
              header.gpath = "/BAP & Contact Information";
            }
            break;
          case "name":
            {
              header.disable_edit = true;
              header.disable_new = false;
            }
            break;
          case "coverage":
            {
              header.tags = this.$store.getters["session/cache"]["/denum/mcc"].value.map(({ key, value }) => {
                let [code, name] = value.split(": ");
                return { key, value: `${code}: ${helpers.capitalizeAllFLetter(name, " ")}` };
              });
            }
            break;
        }
      }
    },
    async initialize() {
      if (this.$route.query.id) {
        this.init_filter = [
          {
            k: "id",
            op: "equal",
            v: this.$route.query.id,
          },
        ];
      }
      this.crud = this.getPermissions.find((f) => this.resources == f.res);
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      translator.setTimeStamp("bap_ts");
      await this.loadProducts(translator);
      await this.loadUiccs(translator);
      await this.loadManufacturers(translator);
      this.translator = translator;
    },
    async loadUiccs(translator) {
      try {
        let uiccs = (
          await this.$axios.$post("api/v1/uiccs/list", {
            select: {
              key: { k: "id" },
              value: { k: "name" },
              state: { k: "state" },
              manufacturer_id: { k: "manufacturer_id" },
            },
          })
        ).map(({ key, value, state, manufacturer_id }) => ({
          key,
          value: state == "deprecated" ? `${value} - Deprecated` : value,
          disabled: state == "deprecated" ? true : false,
          manufacturer_id: manufacturer_id,
        }));
        this.uiccs = uiccs;
        translator.setEnumEx("uicc_id", uiccs, true);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadProducts(translator) {
      try {
        let products = (
          await this.$axios.$post("api/v1/products/list", {
            select: {
              key: { k: "id" },
              value: { k: "name" },
              state: { k: "state" },
              base: { k: "base" },
            },
          })
        ).map(({ key, value, state, base }) => ({
          key,
          base,
          state,
          value: state == "deprecated" ? `${value} - Deprecated` : value,
          disabled: state == "deprecated" ? true : false,
        }));
        this.products = products;
        this.products.unshift({
          key: 0,
          value: "",
          base: 1,
          state: "active",
        });
        translator.setEnumEx("replacement_product_id", products, true);
        translator.setEnumEx("base_product_id", products, true);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadManufacturers(translator) {
      try {
        let manufacturers = (
          await this.$axios.$post("api/v1/manufacturers/list", {
            select: {
              key: { k: "id" },
              value: { k: "name" },
              state: { k: "state" },
            },
          })
        ).map(({ key, value, state }) => ({
          key,
          value: state == "deprecated" ? `${value} - Deprecated` : value,
          disabled: state == "deprecated" ? true : false,
        }));
        this.manufacturers = manufacturers;
        translator.setEnumEx("manufacturer_id", manufacturers, true);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    setManufacturer(event, row) {
      let found = this.uiccs.find((f) => f.key == this.translator.toSrcByKey("uicc_id", event));
      if (found) {
        row.manufacturer_id = found.manufacturer_id;
      }
    },
    cloneItem(index, item) {
      this.editedIndex = index;
      this.editedItem = Object.assign({}, item);
      this.clone_dialog = true;
    },
    cloneClose() {
      this.export_base = 0;
      this.type.value = "standard";
      this.clone_dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    async cloneCreate() {
      if (this.editedIndex > -1) {
        let clone = {
          orig_product: this.editedItem.name,
          new_product: this.clone_name,
          as_base: this.export_base,
          type: this.type.value,
        };
        let lcreate = null;
        try {
          lcreate = await this.$axios.$post(`/api/v1/${this.resources.toLowerCase().replace(" ", "_")}/clone`, clone);
        } catch (err) {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
          return;
        }
        if (null !== this.translator) {
          lcreate = this.translator.toUI(lcreate);
        }
        Object.assign(this.editedItem, lcreate);
        this.records.push(this.editedItem);
        this.tellUser("success", `${this.resource} Id:${lcreate.id} cloned successfully`);
      }
      this.cloneClose();
    },
    onPreNew(data) {
      this.editedItem = data.record;
      data.record.bap_ts = helpers.setDateTime(0);
    },
    onPreEdit(data) {
      this.editedItem = data.record;
    },
    onQueryChange() {
      this.clearResourceCache({ module: "main", resource: this.resources });
    },
    onTypeChange(row) {
      row ? (row.base = 0) : (this.export_base = 0);
    },
    getStateColor(state) {
      let colorMap = {
        deprecated: "error",
        active: "success",
      };

      return colorMap[state] || "warning";
    },
    getBapStateColor(state) {
      let colorMap = {
        setup: "info",
        sent: "primary",
        received: "secondary",
        testing: "warning",
        rejected: "error",
        approved: "success",
      };

      return colorMap[state];
    },
    getDeviceProfileColor(profile) {
      let colorMap = {
        consumer_data: "info",
        consumer_voice: "primary",
        iot: "secondary",
        iot_low_power: "accent",
        iot_peekaboo: "cnps",
      };

      return colorMap[profile];
    },
    getTypeColor(type) {
      let colorMap = {
        standard: "info",
        blank: "secondary",
      };

      return colorMap[type] || "warning";
    },
    getOsTypeColor(os) {
      let colorMap = {
        uicc: "info",
        euicc_consumer: "primary",
        euicc_m2m: "secondary",
      };

      return colorMap[os];
    },
    getUiccColor(id) {
      return id && typeof id == "string" ? (id.includes("Deprecated") ? "error" : "success") : "warning";
    },
    getEnumValue(header, key) {
      let found = header.enum.find((f) => f.key == key);
      return found.value ?? key;
    },
    filterProducts(name) {
      return name ? this.products.filter((f) => f.value != name) : this.products;
    },
    filterBaseProducts() {
      return this.products.filter((f) => f.state == "active" && f.base);
    },
  },
};
</script>
