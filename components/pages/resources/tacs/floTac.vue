<template>
  <div class="flo-tac">
    <v-card v-if="tac != null" flat outlined class="ma-0 pa-0">
      <v-card-text class="ma-0 pa-0">
        <v-container fluid class="pa-1">
          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <div class="headline">Equipment: {{ tac.tac }}</div>
              <v-row no-gutters>
                <v-col cols="8">
                  <blockquote class="blockquote font-weight-light">
                    Id: <code>{{ tac.id }}</code>
                    <span v-if="tac.name != ''">
                      , Name: <code>{{ tac.name }}</code></span
                    >
                    <span v-if="tac.firmware != ''">
                      , Firmware: <code>{{ tac.firmware }}</code></span
                    >
                    <span v-if="tac.model != ''">
                      , Model: <code>{{ tac.model }}</code></span
                    >
                    <span v-if="tac.model_firmware != ''">
                      , Model Firmware: <code>{{ tac.model_firmware }}</code></span
                    >
                    <span v-if="tac.model_name != ''">
                      , Model Name: <code>{{ tac.model_name }}</code></span
                    >
                    <span v-if="tac.customer != ''">
                      , Customer: <code>{{ tac.customer }}</code></span
                    >
                  </blockquote>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Details" elevation="5">
                <template v-slot:content="{}">
                  <flo-meta-resource-view :value="tac" resources="tacs" :ignore="['action']">
                    <template v-slot:view_uicc_id="{}">
                      <v-col cols="12" lg="3" xl="3" class="pa-1">
                        <flo-meta-field-view :translator="translator" />
                      </v-col>
                    </template>
                  </flo-meta-resource-view>
                </template>
              </flo-expand>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Certificates" elevation="5">
                <template v-slot:content="{}">
                  <v-row no-gutters>
                    <v-col cols="12" class="pa-1">
                      <v-dialog :overlay-opacity="0.4" v-model="deleteAllDialog" persistent width="auto ">
                        <v-card flat class="ma-0 pa-0">
                          <v-card-title>
                            <v-row no-gutters justify="center">
                              <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'">
                                <v-icon x-large color="warning">mdi-alert</v-icon>
                              </v-col>
                            </v-row>
                          </v-card-title>
                          <v-card-text>
                            <v-container fluid class="ma-0 pa-0">
                              <v-row no-gutters justify="center">
                                <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"><span class="title text--primary">Are you sure you want to delete ALL TAC Certificates?</span> </v-col>
                              </v-row>
                            </v-container>
                          </v-card-text>
                          <v-card-actions>
                            <div class="flex-grow-1"></div>
                            <v-btn color="primary" :disabled="deleteLoader" text @click="deleteAllDialog = false">Cancel</v-btn>
                            <v-btn color="primary" :loading="deleteLoader" :disabled="deleteLoader" text @click="deleteAll()">Delete</v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-dialog>
                      <flo-meta-table :key="redraw" v-if="translator !== null" @load-data="onLoadCertificatesData($event)" @pre-new="onPreNew($event)" @pre-edit="onPreEdit($event)" @pre-import-export-create="onPreImportExportCreate($event)" :can_import="hasPermissionToImportCerts()" :translator="translator" :hidden_filter="cert_hidden_filter" :show_title="false" accept=".csv" resources="tac_certificates">
                        <template v-slot:ex_new="{ fab, color, smAndDown, permissions }">
                          <v-btn v-if="permissions.d == true && tac_certificates.length > 0" :fab="fab" :small="smAndDown" class="mr-1" :color="color" @click="deleteAllDialog = true">
                            <v-icon :left="!smAndDown">mdi-delete</v-icon>
                            {{ !smAndDown ? "Delete All" : "" }}
                          </v-btn>
                        </template>
                        <template v-slot:view_state="{ fmtrow }">
                          <v-chip class="text-capitalize" label :color="getCertStateColor(fmtrow.state)">{{ fmtrow.state }}</v-chip>
                        </template>
                      </flo-meta-table>
                    </v-col>
                  </v-row>
                </template>
              </flo-expand>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import tellUser from "~/mixins/tellUser.js";
import { mapGetters } from "vuex";
export default {
  head() {
    return {
      title: this.title,
    };
  },
  name: "flo-tac",
  data: () => ({
    resources: "tacs",
    title: "Tacs",
    translator: null,
    tac: null,
    cert_hidden_filter: [],
    tac_certificates: [],
    redraw: 0,
    deleteDialog: false,
    deleteAllDialog: false,
    deleteLoader: false,
    crud: null,
  }),
  props: {
    value: {
      type: Object,
      required: true,
      default: null,
    },
  },
  computed: {
    ...mapGetters({
      getPermissions: "session/permissions",
    }),
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    onLoadCertificatesData(data) {
      this.tac_certificates = data.items;
      for (const header of data.headers) {
        switch (header.value) {
          case "id":
          case "ts":
          case "user_email":
          case "user_ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "tac_id":
            {
              header.view = false;
              header.edit = false;
              header.disable_new = true;
            }
            break;
        }
      }
    },
    onPreEdit(data) {
      data.record.tac_id = this.tac.id;
    },
    onPreNew(data) {
      data.record.tac_id = this.tac.id;
    },
    onPreImportExportCreate(event) {
      if (event && event.data) {
        event.data.tac_id = this.tac.id;
      }
    },
    initialize() {
      this.tac = this.value;
      this.crud = this.getPermissions.find((f) => "tacs" == f.res);

      if (this.tac.id) {
        this.cert_hidden_filter = [
          {
            k: "tac_id",
            op: "equal",
            v: this.tac.id,
          },
        ];
      }
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      this.translator = translator;
    },
    hasPermissionToImportCerts() {
      let crud = this.getPermissions.find((f) => "tac_certificates" == f.res);
      if (crud.c == true) {
        return true;
      }

      return false;
    },
    async deleteAll() {
      try {
        let request = {
          tac_id: this.tac.id,
        };
        let answer = await this.$axios.$post("/api/v1/tac_certificates/delete_all", request);
        console.log(answer);
        if (answer != null) {
          this.deleteAllDialog = false;
          this.redraw++;
          this.tellUser("success", "All TAC Certificates have been deleted successfully.");
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    getCertStateColor(state) {
      let colorMap = {
        pending: "info",
        pass: "success",
        failed: "error",
        suppress: "warning",
      };

      return colorMap[state] || "warning";
    },
  },
};
</script>
