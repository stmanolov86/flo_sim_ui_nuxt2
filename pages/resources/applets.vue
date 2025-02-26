<template>
  <div>
    <v-dialog :overlay-opacity="0.4" v-model="clone_dialog" scrollable max-width="550px">
      <v-card>
        <v-card-title>
          <span class="headline">Clone Card Applet</span>
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

    <flo-meta-table v-if="translator !== null" @load-data="onLoadData($event)" @pre-edit="onPreEdit($event)" @pre-new="onPreNew($event)" :translator="translator" :resources="resources" :can_import="crud.e" main_resource>
      <template v-slot:ex_new="{ fab, color, smAndDown }">
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
      <template v-slot:view_multi_imsi_type="{ fmtrow }">
        <v-chip class="text-capitalize" :color="getTypeColor(fmtrow.multi_imsi_type)" label>{{ fmtrow.multi_imsi_type }}</v-chip>
      </template>

      <template v-slot:view_tar="{ fmtrow }">
        <v-chip v-if="fmtrow.tar" label :color="getTarColor(fmtrow.tar)">{{ fmtrow.tar }}</v-chip>
      </template>

      <template v-slot:edit_aaid="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <flo-aid v-model="fmtrow.aaid" :header="fmtheader" :pattern="fmtheader.pattern" :disabled="!fmtpermissions.u" persistent_hint />
        </v-col>
      </template>

      <template v-slot:edit_iaid="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <flo-iaid v-model="fmtrow.iaid" :header="fmtheader" :pattern="fmtheader.pattern" :disabled="!fmtpermissions.u" persistent_hint />
        </v-col>
      </template>

      <template v-slot:edit_paid="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <flo-paid v-model="fmtrow.paid" :header="fmtheader" :pattern="fmtheader.pattern" :disabled="!fmtpermissions.u" persistent_hint />
        </v-col>
      </template>

      <template v-slot:edit_placeholder="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" class="pa-1" v-if="fmtrow.applet_type == 'utk'">
          <flo-params :row="fmtrow" :translator="translator" :headers="filterHeaders()" :disabled="!fmtpermissions.u" title="Toolkit Parameters" />
        </v-col>
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
              path: '/resources/applet/',
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
import { mapGetters } from "vuex";
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  data: () => ({
    helpers,
    resource: "applet",
    resources: "applets",
    translator: null,
    clone_dialog: false,
    clone_name: "",
    editedItem: {},
    editedIndex: -1,
    records: [],
    headers: [],
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
    onLoadData(data) {
      this.headers = data.meta.keys;
      this.records = data.items;
      data.headers.push({
        value: "placeholder",
        type: "string",
        disable_edit: true,
        disable_new: false,
        view: false,
        edit: true,
      });

      for (const header of data.headers) {
        switch (header.value) {
          case "attr":
            {
              header.edit = false;
              header.view = false;
            }
            break;
          case "id":
          case "ts":
          case "state":
          case "applet":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "access_domain":
          case "priority_level":
          case "max_timers":
          case "max_menu_entry_text":
          case "max_menu_entries":
          case "max_nr_services":
          case "uicc_access_app":
          case "uicc_admin_access_app":
            {
              header.view = false;
              header.edit = false;
            }
            break;
          case "is_multi_imsi":
            {
              header.edit = false;
            }
            break;
          case "multi_imsi_type":
            {
              header.edit = false;
            }
            break;
          case "v_minor":
          case "v_major":
          case "jc_version":
          case "uicc_version":
          case "usim_version":
            {
              header.view = false;
              header.gpath = "/Versioning";
            }
            break;
          case "msl":
            {
              header.view = false;
            }
            break;
          case "aaid":
          case "iaid":
          case "paid":
            {
              header.view = false;
              header.gpath = "/Identifiers";
            }
            break;
          case "toolkit_parameters":
          case "app_parameters":
          case "volatile_data_size":
          case "non_volatile_data_size":
          case "ram_ifl":
          case "ram_ifi":
            {
              header.view = false;
              header.gpath = "/RAM Parameters";
            }
            break;
          case "actual_volatile_data_size":
          case "actual_non_volatile_data_size":
            {
              header.view = false;
              header.gpath = "/Sizing";
            }
            break;
        }
      }
    },
    initialize() {
      this.crud = this.getPermissions.find((f) => this.resources == f.res);
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      this.translator = translator;
    },
    getTypeColor(type) {
      let colorMap = {
        flolive: "primary",
        redtea: "secondary",
        telit: "info",
      };

      return colorMap[type] || "warning";
    },
    getTarColor(tar) {
      let colorMap = {
        DF5F0E: "primary",
      };

      return colorMap[tar] || "info";
    },
    getStateColor(state) {
      let colorMap = {
        deprecated: "error",
        active: "success",
      };

      return colorMap[state] || "warning";
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
          orig_applet: this.editedItem.name,
          new_applet: this.clone_name,
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
    async update_vfs() {
      try {
        this.loading = true;
        let answer = await this.$axios.$post("/api/v1/applets/update_vfs");
        if (answer.length > 0) {
          this.loading = false;
          this.tellUser("success", "Applet Virtual Files updated successfully.");
        }
      } catch (err) {
        this.loading = false;
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      return null;
    },
    filterHeaders() {
      let lheaders = [];
      for (const key of Object.keys(this.headers)) {
        let header = {
          text: "",
          value: "",
          type: "",
          hint: "",
          default: "",
          pattern: "",
          enum: "",
        };
        let toolkit_params = ["is_multi_imsi", "multi_imsi_type", "access_domain", "priority_level", "max_timers", "max_menu_entry_text", "max_menu_entries", "max_nr_services", "uicc_access_app", "uicc_admin_access_app"];
        if (!toolkit_params.includes(key)) {
          continue;
        }
        header.value = key;
        header.text = this.headers[key].desc;
        header.type = this.headers[key].type;
        header.hint = this.headers[key].hint;
        header.default = this.headers[key].default;
        header.pattern = this.headers[key].pattern;
        header.enum = this.headers[key].enum;
        lheaders.push(header);
      }

      return lheaders;
    },
    onPreNew(data) {
      this.editedItem = data.record;
    },
    onPreEdit(data) {
      this.editedItem = data.record;
    },
  },
};
</script>
