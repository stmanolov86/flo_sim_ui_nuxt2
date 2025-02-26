<template>
  <div>
    <v-dialog :overlay-opacity="0.4" v-model="clone_dialog" scrollable max-width="550px">
      <v-card>
        <v-card-title>
          <span class="headline">Clone Order</span>
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
    <flo-meta-table v-if="translator !== null" @load-data="onLoadData($event)" @query_change="onQueryChange($event)" @pre-new="onPreNew($event)" @post-delete="onPostDelete($event)" @cancel-action="onCancel()" :translator="translator" :resources="resources" main_resource :can_import="crud.e" :deleteResources="res" :init_filter="init_filter">
      <template v-slot:ex_new="{ fab, color, smAndDown }">
        <v-btn :fab="fab" :small="smAndDown" class="mr-1" :color="color" router :to="{ path: '/resources/imsi_domains/' }">
          <v-icon :left="!smAndDown">mdi-account-multiple</v-icon>
          {{ !smAndDown ? "IMSI Domains" : "" }}
        </v-btn>
      </template>

      <!-- <template v-slot:ex_actions="{ fmtindex, fmtpermissions, fmtheader, fmtrow }">
        <v-btn v-if="fmtpermissions.c == true" class="me-2 my-1" color="primary" :fab="!$vuetify.breakpoint.mdAndUp" :small="!$vuetify.breakpoint.mdAndUp" @click="cloneItem(fmtindex, fmtrow)" :__qa="helpers.getQATag(resources, fmtheader)">
          <v-icon :left="$vuetify.breakpoint.mdAndUp">mdi-content-copy</v-icon>
          {{ $vuetify.breakpoint.mdAndUp ? "Clone" : "" }}
        </v-btn>
      </template> -->

      <template v-slot:edit_path="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <flo-account-select v-model="fmtrow.path" :label="fmtheader.text" :disabled="disableFields(fmtpermissions, fmtrow)" :hint="fmtheader.hint" persistent-hint />
        </v-col>
      </template>
      <template v-slot:edit_product_id="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <v-autocomplete v-model="fmtrow.product_id" :label="fmtheader.text" :hint="fmtheader.hint" :items="filterProducts(fmtrow)" :messages="formatProductMessage(fmtheader.hint, fmtrow.type)" :disabled="disableProducts(fmtpermissions, fmtrow)" item-text="value" item-value="value" filled clearable persistent-hint>
            <template v-slot:message="{ message }"> <span v-html="message"></span> </template>
          </v-autocomplete>
        </v-col>
      </template>
      <template v-slot:edit_type="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <v-autocomplete v-model="fmtrow.type" :label="fmtheader.text" :hint="fmtheader.hint" :items="fmtheader.enum" :disabled="disableFields(fmtpermissions, fmtrow)" @change="onTypeChange(fmtrow)" item-text="value" item-value="key" filled clearable persistent-hint> </v-autocomplete>
        </v-col>
      </template>
      <template v-slot:edit_reservation_id="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col v-if="fmtrow.type == 'local_factory'" :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <v-autocomplete v-model="fmtrow.reservation_id" :label="fmtheader.text" :hint="fmtheader.hint" :items="filterReservations()" :messages="formatReservationMessage(fmtheader.hint)" :disabled="disableFields(fmtpermissions, fmtrow)" @change="onReservationChange(fmtrow)" @click:clear="onReservationClear($event, fmtrow)" item-text="value" item-value="value" filled clearable persistent-hint>
            <template v-slot:message="{ message }"> <span v-html="message"></span> </template>
          </v-autocomplete>
        </v-col>
        <span v-else></span>
      </template>
      <template v-slot:view_state="{ fmtrow }">
        <v-chip label class="text-capitalize" :color="getStateColor(fmtrow.state)">{{ fmtrow.state }}</v-chip>
      </template>
      <template v-slot:view_type="{ fmtrow }">
        <v-chip v-if="fmtrow.type" label :color="getTypeColor(fmtrow.type)">{{ helpers.capitalizeAllFLetter(fmtrow.type, "_") }}</v-chip>
      </template>
      <template v-slot:view_product_id="{ fmtrow }">
        <v-chip v-if="fmtrow.product_id" label :color="getProductColor(fmtrow.product_id)">{{ fmtrow.product_id }}</v-chip>
        <span v-else></span>
      </template>
      <template v-slot:view_reservation_id="{ fmtrow }">
        <v-chip v-if="fmtrow.reservation_id" label color="info">{{ fmtrow.reservation_id }}</v-chip>
        <span v-else></span>
      </template>
      <template v-slot:deleteResources="{}">
        <v-card flat outlined>
          <v-card-subtitle>This will also remove the following resources:</v-card-subtitle>
          <v-card-text>
            <v-row no-gutters>
              <v-col v-for="(r, i) in Object.values(res)" cols="12" lg="4" xl="4" :key="i">
                <v-switch v-model="r.value" :hint="r.hint" :label="r.label" :disabled="disable_res" color="success" inset persistent-hint></v-switch>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
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
              path: '/resources/order/',
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
import { mapActions, mapGetters } from "vuex";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  data: () => ({
    helpers,
    resource: "order",
    resources: "orders",
    init_filter: [],
    translator: null,
    orderDialog: false,
    disable_res: false,
    res: {
      delete_subs: {
        label: "Subs",
        hint: "Delete Subscribers",
        value: true,
      },
      delete_cards: {
        label: "Cards",
        hint: "Delete Cards",
        value: true,
      },
      delete_keys: {
        label: "Keys",
        hint: "Delete HSM Keys",
        value: true,
      },
    },
    clone_dialog: false,
    clone_name: "",
    editedItem: {},
    editedIndex: -1,
    crud: null,
    reservations: [],
    products: [],
    records: [],
  }),
  watch: {
    clone_dialog(val) {
      this.clone_name = "";
      val || this.cloneClose();
    },
  },
  computed: {
    ...mapGetters({
      userInfo: "session/user",
      getPermissions: "session/permissions",
      getResourceKey: "session/getResourceKey",
    }),
    disabled() {
      let disabled = false;
      if (this.clone_name == "") {
        disabled = true;
      }
      return disabled;
    },
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    ...mapActions({
      addToResourceCache: "session/addToResourceCache",
      clearResourceCache: "session/clearResourceCache",
    }),
    onLoadData(data) {
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
          case "aid":
            {
              header.edit = false;
              header.view = false;
            }
            break;
          case "path":
          case "comment":
            {
              header.view = false;
            }
            break;
          case "code":
          case "message":
          case "cards":
          case "input":
          case "output":
          case "low":
          case "high":
          case "bulk":
            {
              header.view = false;
              header.disable_new = true;
              header.edit = false;
            }
            break;
          case "contact_email":
          case "shipping_address":
            {
              header.view = false;
              header.gpath = "/Contact Information";
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
      await this.loadProducts(translator);
      await this.loadReservations(translator);
      this.translator = translator;
    },
    onQueryChange() {
      this.clearResourceCache({ module: "main", resource: this.resources });
    },
    onTypeChange(row) {
      if (row.product_id) {
        row.product_id = 0;
      }
    },
    async onReservationChange(row) {
      let reservation_id = this.translator.toSrcByKey("reservation_id", row.reservation_id);
      let found = this.reservations.find((f) => f.key == reservation_id);
      let order = await this.loadBlankOrder(found.blank_reservation_id);
      if (order) {
        let product_id = this.translator.toUIByKey("product_id", order.product_id);
        row.product_id = product_id;
      }
    },
    onReservationClear(event, row) {
      if (event && row.product_id) {
        row.product_id = 0;
      }
    },
    onCancel() {
      Object.values(this.res).forEach((res) => {
        res.value = true;
      });
    },
    onPostDelete(event) {
      this.disable_res = event.loader;
    },
    onPreNew(data) {
      data.record.contact_email = this.userInfo.email;
    },
    async onPostNew(event) {
      if (event && event.type == "local_factory") {
        await this.generateSample(event);
        await this.acceptGenerate(event);
        await this.executeEnrich(event);
        await this.executeEnrichAccept(event);
        this.$router.push({
          path: "/resources/order/",
          query: { id: event.id },
        });
      }
    },
    getStateColor(state) {
      let colorMap = {
        created: "info",
        manufacturing: "primary",
        manufactured: "secondary",
        scheduled: "secondary",
        process: "accent",
        suspend: "warning",
        canceled: "error",
        exception: "error",
        completed: "success",
      };

      return colorMap[state] || "error";
    },
    getTypeColor(type) {
      let colorMap = {
        standard: "info",
        blank: "secondary",
        local_factory: "accent",
      };

      return colorMap[type] || "warning";
    },
    getProductColor(id) {
      return id && typeof id === "string" ? (id.includes("Deprecated") ? "error" : id.includes("End of Life") ? "warning" : "success") : "warning";
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
          orig_order: this.editedItem.name,
          new_order: this.clone_name,
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
    formatProductMessage(hint, type) {
      return type
        ? `${hint}
        <br />
        <span class="caption info--text">Only ${type != "local_factory" ? `${this.helpers.capitalizeFLetter(type)} products` : "Blank products & their variants"} are listed here.</span>`
        : hint;
    },
    formatReservationMessage(hint) {
      return `
          ${hint}
          <br />
          <span class="caption info--text">Only unreconciled Local Factory reservations are listed here.</span>`;
    },
    filterProducts(row) {
      if (!row.type) return [];
      let products = this.products;
      if (row.type == "standard") {
        return products.filter((f) => f.type == "standard");
      } else if (row.type == "blank") {
        return products.filter((f) => f.type == "blank");
      } else if (row.type == "local_factory") {
        if (row.product_id) {
          let translated = this.translator.toSrcByKey("product_id", row.product_id);
          let found = products.find((f) => f.key == translated);
          if (found) {
            let filtered = products.filter((f) => f.base_product_id == found.base_product_id);
            return filtered;
          }
        } else {
          return products.filter((f) => f.type == "blank");
        }
      } else {
        return products;
      }
    },
    filterReservations() {
      return this.reservations.filter((f) => f.type == "local_factory" && f.reconcile == 0);
    },
    disableProducts(permissions, row) {
      const { type, state, reservation_id } = row;
      if (!permissions.u || state != "created" || (type == "local_factory" && !reservation_id)) {
        return true;
      }
      return false;
    },
    disableFields(permissions, row) {
      return row.state !== "created" || !permissions.u;
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
              type: { k: "type" },
              bap_state: { k: "bap_state" },
              end_of_life: { k: "end_of_life" },
              base_product_id: { k: "base_product_id" },
            },
          })
        ).map(({ key, value, state, bap_state, end_of_life, base, type, base_product_id }) => ({
          key,
          base,
          type,
          base_product_id,
          value: state == "deprecated" ? `${value} - Deprecated` : bap_state == "rejected" ? `${value} - Rejected` : end_of_life ? `${value} - End of Life` : value,
          disabled: state == "deprecated" || bap_state == "rejected" ? true : false,
        }));
        this.products = products;
        translator.setEnumEx("product_id", products, true);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadReservations(translator) {
      try {
        let query = {
          select: {
            key: { k: "id" },
            value: { k: "name" },
            type: { k: "type" },
            reconcile: { k: "reconcile" },
            blank_reservation_id: { k: "blank_reservation_id" },
          },
          where: [
            {
              k: "state",
              op: "equal",
              v: "active",
            },
          ],
        };
        let reservations = await this.$axios.$post("floinventory/v1/reservations/list", query);
        this.reservations = reservations;
        translator.setEnumEx("reservation_id", reservations, true);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadBlankOrder(id) {
      let answer = [];
      try {
        let query = {
          select: {},
          where: [
            {
              k: "reservation_id",
              op: "equal",
              v: id,
            },
          ],
        };
        answer = await this.$axios.$post("api/v1/orders/list", query);
        if (answer.length > 0) {
          return answer[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
  },
};
</script>
