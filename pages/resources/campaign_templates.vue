<template>
  <div>
    <v-dialog :overlay-opacity="0.4" v-model="clone_dialog" scrollable max-width="550px">
      <v-card>
        <v-card-title>
          <span class="headline">Clone Campaign Template</span>
        </v-card-title>
        <v-form @submit.prevent="cloneCreate()">
          <v-card-text>
            <v-container fluid class="ma-0 pa-1">
              <v-row no-gutters>
                <v-col cols="12" lg="6" xl="6" class="pa-1">
                  <v-text-field disabled v-model="editedItem['name']" label="Name" hint="Current resource name" persistent-hint></v-text-field>
                </v-col>

                <v-col cols="12" lg="6" xl="6" class="pa-1">
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
    <flo-meta-table v-if="translator !== null" @load-data="onLoadData($event)" @pre-edit="onPreEdit($event)" @pre-new="onPreNew($event)" @query_change="onQueryChange($event)" :translator="translator" :resources="resources" :can_import="crud.e" :init_filter="init_filter" main_resource>
      <template v-slot:ex_new="{ fab, color, smAndDown }">
        <v-btn :fab="fab" :small="smAndDown" class="mr-1" :color="color" router :to="{ path: '/resources/campaigns' }">
          <v-icon :left="!smAndDown">mdi-bullhorn</v-icon>
          {{ !smAndDown ? "Campaigns" : "" }}
        </v-btn>
      </template>
      <template v-slot:ex_actions="{ fmtindex, fmtpermissions, fmtheader, fmtrow }">
        <v-btn v-if="fmtpermissions.c == true" class="me-2 my-1" color="primary" :fab="!$vuetify.breakpoint.mdAndUp" :small="!$vuetify.breakpoint.mdAndUp" @click="cloneItem(fmtindex, fmtrow)" :__qa="helpers.getQATag(resources, fmtheader)">
          <v-icon :left="$vuetify.breakpoint.mdAndUp">mdi-content-copy</v-icon>
          {{ $vuetify.breakpoint.mdAndUp ? "Clone" : "" }}
        </v-btn>
      </template>
      <template v-slot:view_state="{ fmtrow }">
        <v-chip class="text-capitalize" :color="getStateColor(fmtrow.state)" label>{{ fmtrow.state }}</v-chip>
      </template>
      <template v-slot:edit_path="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <flo-account-select v-model="fmtrow.path" :label="fmtheader.text" :disabled="!fmtpermissions.u" :hint="fmtheader.hint" persistent-hint />
        </v-col>
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
              path: '/resources/campaign_template/',
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
import { mapGetters, mapActions } from "vuex";
export default {
  data: () => ({
    helpers,
    resource: "campaign_template",
    resources: "campaign_templates",
    translator: null,
    clone_dialog: false,
    clone_name: "",
    editedItem: {},
    editedIndex: -1,
    records: [],
    init_filter: [],
    crud: null,
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
      this.records = data.items;
      for (const header of data.headers) {
        switch (header.value) {
          case "path":
            {
              header.view = false;
            }
            break;
          case "aid":
          case "ota_stack":
          case "param_def":
            {
              header.edit = false;
              header.view = false;
            }
            break;
          case "name":
            {
              header.disable_edit = true;
              header.disable_new = false;
            }
            break;
          case "lead_by":
            {
              header.disable_new = true;
              header.disable_edit = true;
            }
            break;
          case "state":
            {
              header.disable_new = true;
              header.disable_edit = true;
            }
            break;
          case "id":
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
        }
      }
    },
    initialize() {
      this.crud = this.getPermissions.find((f) => this.resources == f.res);
      if (this.$route.query.id) {
        this.init_filter = [
          {
            k: "id",
            op: "equal",
            v: this.$route.query.id,
          },
        ];
      }
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
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
    onPreNew(data) {
      this.editedItem = data.record;
    },
    onPreEdit(data) {
      this.editedItem = data.record;
    },
    onQueryChange() {
      this.clearResourceCache({ module: "main", resource: this.resources });
    },
    getStateColor(state) {
      let colorMap = {
        deprecated: "error",
        active: "success",
      };

      return colorMap[state] || "warning";
    },
    async cloneCreate() {
      if (this.editedIndex > -1) {
        let clone = {
          orig_campaign_template: this.editedItem.name,
          new_campaign_template: this.clone_name,
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
  },
};
</script>
