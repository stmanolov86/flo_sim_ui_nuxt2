<template>
  <div>
    <v-dialog :overlay-opacity="0.4" v-model="clone_dialog" scrollable max-width="550px">
      <v-card>
        <v-card-title>
          <span class="headline">Clone UICC</span>
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
    <flo-meta-table @load-data="onLoadData($event)" @query_change="onQueryChange($event)" @post-new="onPostNew($event)" @pre-update="onPreUpdate($event)" :translator="translator" :resources="resources" :can_import="crud.e" :init_filter="init_filter" main_resource>
      <template v-slot:ex_new="{ fab, color, smAndDown }">
        <v-btn :fab="fab" :small="smAndDown" class="mr-1" :color="color" router :to="{ path: '/resources/manufacturers' }">
          <v-icon :left="!smAndDown">mdi-factory</v-icon>
          {{ !smAndDown ? "Manufacturers" : "" }}
        </v-btn>
        <v-btn :fab="fab" :small="smAndDown" class="mr-1" :color="color" :disabled="!crud.e || loading" :loading="loading" @click="update_vfs()">
          <v-icon :left="!smAndDown">mdi-file-replace</v-icon>
          {{ !smAndDown ? "Update VFs" : "" }}
        </v-btn>
      </template>

      <template v-slot:ex_actions="{ fmtindex, fmtpermissions, fmtheader, fmtrow }">
        <v-btn v-if="fmtpermissions.c == true" class="me-2 my-1" color="primary" :fab="!$vuetify.breakpoint.mdAndUp" :small="!$vuetify.breakpoint.mdAndUp" @click="cloneItem(fmtindex, fmtrow)" :__qa="helpers.getQATag(resources, fmtheader)">
          <v-icon :left="$vuetify.breakpoint.mdAndUp">mdi-content-copy</v-icon>
          {{ $vuetify.breakpoint.mdAndUp ? "Clone" : "" }}
        </v-btn>
      </template>

      <template v-slot:edit_required_mask="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="6">
          <flo-parser-view v-model="fmtrow.required_mask" @input="onUstInput(fmtrow)" :row="fmtheader" :header="fmtheader" :disabled="!fmtpermissions.u" available_mask="FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF" required_mask="0000000000000000000000000000000000000000" />
        </v-col>
      </template>

      <template v-slot:edit_available_mask="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :key="redraw_available_mask" :__qa="helpers.getQATag(resources, fmtheader)" cols="6">
          <flo-parser-view v-model="fmtrow.available_mask" :row="fmtheader" :header="fmtheader" :disabled="!fmtpermissions.u" available_mask="FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF" :required_mask="fmtrow.required_mask ?? '0000000000000000000000000000000000000000'" />
        </v-col>
      </template>

      <template v-slot:edit_spi="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="`${helpers.getQATag(resources, fmtheader)}_expand`" cols="12">
          <flo-spi v-model="fmtrow.spi" :header="fmtheader" :__qa="helpers.getQATag(resources, fmtheader)" title="SPI" :pattern="fmtheader.pattern" :disabled="!fmtpermissions.u" />
        </v-col>
      </template>

      <template v-slot:edit_keyset_scp80="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="`${helpers.getQATag(resources, fmtheader)}_expand`" cols="12">
          <flo-kset v-model="fmtrow.keyset_scp80" :__qa="helpers.getQATag(resources, fmtheader)" :header="fmtheader" :keysets="enums()['keyset_scp80']" prefix="SCP80" :pattern="fmtheader.pattern" :disabled="!fmtpermissions.u" @change="redraw_kic_kid++" />
        </v-col>
      </template>

      <template v-slot:edit_keyset_scp81="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="`${helpers.getQATag(resources, fmtheader)}_expand`" cols="12">
          <flo-kset v-model="fmtrow.keyset_scp81" :__qa="helpers.getQATag(resources, fmtheader)" :header="fmtheader" :keysets="enums()['keyset_scp81']" prefix="SCP81" :pattern="fmtheader.pattern" :disabled="!fmtpermissions.u" />
        </v-col>
      </template>

      <template v-slot:edit_kid="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="`${helpers.getQATag(resources, fmtheader)}_expand`" cols="12">
          <flo-kid :key="redraw_kic_kid" v-model="fmtrow.kid" :__qa="helpers.getQATag(resources, fmtheader)" :header="fmtheader" :pattern="fmtheader.pattern" :keyset="fmtrow.keyset_scp80" :disabled="!fmtpermissions.u" />
        </v-col>
      </template>

      <template v-slot:edit_kic="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="`${helpers.getQATag(resources, fmtheader)}_expand`" cols="12">
          <flo-kic :key="redraw_kic_kid" v-model="fmtrow.kic" :__qa="helpers.getQATag(resources, fmtheader)" :header="fmtheader" :pattern="fmtheader.pattern" :keyset="fmtrow.keyset_scp80" :disabled="!fmtpermissions.u" />
        </v-col>
      </template>

      <template v-slot:edit_push_spi="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="`${helpers.getQATag(resources, fmtheader)}_expand`" cols="12">
          <flo-spi v-model="fmtrow.push_spi" :header="fmtheader" :__qa="helpers.getQATag(resources, fmtheader)" title="Push SPI" :pattern="fmtheader.pattern" :disabled="!fmtpermissions.u" />
        </v-col>
      </template>

      <template v-slot:edit_gprs="{ fmtheader, fmtrow, fmtpermissions }">
        <template v-if="fmtrow.https || fmtrow.cat_tp">
          <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" xl="6">
            <v-switch v-model="fmtrow.gprs" :label="fmtheader.text" :hint="fmtheader.hint" :disabled="!fmtpermissions.u" color="success" inset persistent-hint></v-switch>
          </v-col>
        </template>
        <template v-else>
          <div></div>
        </template>
      </template>

      <template v-slot:edit_default_bearer="{ fmtheader, fmtrow, fmtpermissions }">
        <template v-if="fmtrow.https || fmtrow.cat_tp">
          <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" xl="6">
            <v-switch v-model="fmtrow.default_bearer" :label="fmtheader.text" :hint="fmtheader.hint" :disabled="!fmtpermissions.u" color="success" inset persistent-hint></v-switch>
          </v-col>
        </template>
        <template v-else>
          <div></div>
        </template>
      </template>

      <template v-slot:edit_manufacturer_id="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <v-autocomplete v-model="fmtrow.manufacturer_id" :label="fmtheader.text" :disabled="!fmtpermissions.u" :hint="fmtheader.hint" :items="manufacturers" item-text="value" item-value="value" filled persistent-hint></v-autocomplete>
        </v-col>
      </template>

      <template v-slot:view_manufacturer_id="{ fmtrow }">
        <v-chip v-if="fmtrow.manufacturer_id" label :color="getManufacturerColor(fmtrow.manufacturer_id)">{{ fmtrow.manufacturer_id }}</v-chip>
        <span v-else></span>
      </template>

      <template v-slot:view_state="{ fmtrow }">
        <v-chip class="text-capitalize" :color="getStateColor(fmtrow.state)" label>{{ fmtrow.state }}</v-chip>
      </template>

      <template v-slot:view_name="{ fmtrow, fmtpermissions }">
        <v-container class="d-flex flex-nowrap">
          <span class="align-self-center text-center ml-n3">{{ fmtrow.name }}</span>
          <v-btn
            class="ml-1"
            icon
            elevation="0"
            router
            :disabled="!fmtpermissions.r"
            :to="{
              path: '/resources/uicc/',
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
import { mapActions, mapGetters } from "vuex";
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import tellUser from "~/mixins/tellUser.js";
import floSpi from "~/components/se/floSpi.vue";
import floKic from "~/components/se/floKic.vue";
import floKid from "~/components/se/floKid.vue";
import floKset from "~/components/se/floKset.vue";
import floParserView from "~/components/widgets/floParserView.vue";
import helpers from "~/src/helpers.js";
import enums from "~/src/enums.js";
export default {
  components: {
    floSpi,
    floKic,
    floKid,
    floKset,
    floParserView,
  },
  data: () => ({
    helpers,
    enums,
    redraw_available_mask: 0,
    redraw_kic_kid: 0,
    resource: "uicc",
    resources: "uiccs",
    translator: null,
    clone_dialog: false,
    clone_name: "",
    editedItem: {},
    editedIndex: -1,
    records: [],
    headers: [],
    manufacturers: [],
    init_filter: [],
    crud: null,
    loading: false,
  }),
  watch: {
    clone_dialog(val) {
      this.clone_name = "";
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
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    ...mapActions({
      clearResourceCache: "session/clearResourceCache",
    }),
    onLoadData(data) {
      this.headers = data.meta.keys;
      this.records = data.items;

      for (const header of data.headers) {
        switch (header.value) {
          case "id":
          case "ts":
          case "state":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "keyset_scp80":
          case "spi":
          case "kic":
          case "kid":
            {
              header.view = false;
              header.gpath = "/Security/SCP80";
            }
            break;
          case "keyset_scp81":
          case "push_spi":
            {
              header.view = false;
              header.gpath = "/Security/SCP81";
            }
            break;
          case "required_mask":
          case "available_mask":
            {
              header.view = false;
              header.pattern = "parse:hex:even:ef_ust";
              header.gpath = "/UST Mask";
            }
            break;
          case "hardware":
            {
              header.gpath = "/Hardware";
            }
            break;
          case "os":
          case "buffer_sizing":
          case "non_volatile_data_size":
          case "volatile_data_size":
            {
              header.view = false;
              header.gpath = "/Hardware";
            }
            break;
          case "jc_version":
          case "uicc_version":
          case "usim_version":
            {
              header.view = false;
              header.gpath = "/Versioning";
            }
            break;
          case "sms":
          case "https":
          case "cat_tp":
            {
              header.view = false;
              header.gpath = "/Type Support";
            }
            break;
          case "gprs":
          case "default_bearer":
            {
              header.view = false;
              header.gpath = "/Type Support";
            }
            break;
          case "comment":
            {
              header.view = false;
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
      await this.loadManufacturers(translator);
      this.translator = translator;
    },
    cloneItem(index, item) {
      this.editedIndex = index;
      this.editedItem = Object.assign({}, item);
      this.clone_dialog = true;
    },
    cloneClose() {
      this.clone_dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    async cloneCreate() {
      if (this.editedIndex > -1) {
        let clone = {
          orig_uicc: this.editedItem.name,
          new_uicc: this.clone_name,
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
        this.tellUser("success", `${this.resource} Id:${lcreate.id} cloned successfully.`);
      }
      this.cloneClose();
    },
    onQueryChange() {
      this.clearResourceCache({ module: "main", resource: this.resources });
    },
    onPostNew(event) {
      if (event) {
        event.available_mask = this.formatUst(event.required_mask, event.available_mask);
      }
    },
    onPreUpdate(event) {
      if (event && event.update) {
        event.update.available_mask = this.formatUst(event.update.required_mask, event.update.available_mask);
      }
    },
    onUstInput(event) {
      if (event) {
        event.available_mask = this.formatUst(event.required_mask, event.available_mask);
        this.redraw_available_mask++;
      }
    },
    formatUst(required, available) {
      if (!available || available.length == 0) {
        available = required;
      }

      // Define the length to pad to (based on the max length of required and available)
      let length = Math.max(required.length, available.length) / 2; // length is in bytes

      // Pad required and available to ensure they are the same length
      required = this.helpers.padAsciiHex(required, length * 2, "00");
      available = this.helpers.padAsciiHex(available, length * 2, "FF");
      // Convert required and available to byte arrays
      let ustBytes = this.helpers.hexStringToByteArray(required);
      let availableBytes = this.helpers.hexStringToByteArray(available);

      let requiredBytes = ustBytes;
      // Ensure both byte arrays have the same length
      let maxLength = Math.max(ustBytes.length, availableBytes.length);
      let resultBytes = new Array(maxLength).fill(0);

      // Perform the bitwise operation: combine available & required logically
      for (let idx = 0; idx < maxLength; idx++) {
        let actual = ustBytes[idx] || 0;
        let available = availableBytes[idx] || 0;
        let required = requiredBytes[idx] || 0;

        // Perform bitwise operations to merge required & available
        resultBytes[idx] = (available & ~required) | (actual & required);
      }

      return this.helpers.byteArrayToHexString(resultBytes);
    },
    getStateColor(state) {
      let colorMap = {
        deprecated: "error",
        active: "success",
      };

      return colorMap[state] || "warning";
    },
    getManufacturerColor(id) {
      return id && typeof id == "string" ? (id.includes("Deprecated") ? "error" : "success") : "warning";
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
    async update_vfs() {
      try {
        this.loading = true;
        let answer = await this.$axios.$post("/api/v1/uiccs/update_vfs");
        if (answer.length > 0) {
          this.loading = false;
          this.tellUser("success", "UICC Virtual Files updated successfully.");
        }
      } catch (err) {
        this.loading = false;
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      return null;
    },
  },
};
</script>
