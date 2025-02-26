<template>
  <div class="flo-ram-app">
    <v-container class="ma-0 pa-0" fluid v-if="!loading">
      <v-row no-gutters>
        <v-col cols="12" class="pa-1">
          <flo-rfm-misc @change="onMiscChange($event)" :aids="getUiccAids()" :value="value" :disabled="disabled" :readonly="readonly" :transport="transport" aid_category="ISD" :use_cla="false" :use_base="false" />
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col cols="12" class="pa-1">
          <v-card flat outlined class="ma-0 pa-0" :disabled="disabled">
            <v-container fluid class="ma-0 pa-0">
              <v-row no-gutters>
                <v-col cols="12" class="pa-1">
                  <v-data-table :headers="applets.headers" :items="applets.installed" class="resourcetable elevation-0" calculate-widths dense :footer-props="{ 'items-per-page-options': [10, 20, 30, 40, 50] }" :items-per-page="30" :mobile-breakpoint="960">
                    <template v-slot:top>
                      <v-toolbar flat>
                        <v-toolbar-title>Installed Applets</v-toolbar-title>
                        <v-divider class="mx-4" inset vertical></v-divider>
                        <v-spacer></v-spacer>
                        <v-dialog :overlay-opacity="0.4" v-model="dialog" width="auto ">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on" :disabled="transport == 'sms' || disabled || readonly">
                              <v-icon center>mdi-plus</v-icon>
                            </v-btn>
                          </template>

                          <v-card>
                            <v-card-title>
                              <span class="headline">Select applet to install</span>
                            </v-card-title>

                            <v-card-text>
                              <v-container fluid class="ma-0 pa-0">
                                <v-row no-gutters>
                                  <v-col cols="12" class="pa-1">
                                    <blockquote>
                                      Note: You can have only one
                                      <code>Multi IMSI</code> applet installed.
                                    </blockquote>
                                    <span v-if="disable" class="error--text">Please uninstall the current <code>Multi IMSI</code> applet first.</span>
                                  </v-col>
                                </v-row>
                                <v-row no-gutters>
                                  <v-col cols="12" class="pa-1">
                                    <v-combobox v-model="selected" :items="getFilteredApplets()" persistent-hint outlined dense></v-combobox>
                                  </v-col>
                                </v-row>
                              </v-container>
                            </v-card-text>

                            <v-card-actions class="mt-0 pt-0">
                              <v-spacer></v-spacer>
                              <v-btn color="primary" text @click="close()">Cancel</v-btn>
                              <v-btn color="primary" text :disabled="disable" @click="setApplet()"> Set </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-dialog>

                        <v-dialog :overlay-opacity="0.4" v-model="deleteDialog" width="auto ">
                          <v-card>
                            <v-card-title>{{ deleteDialogTitle() }}</v-card-title>
                            <v-card-text>
                              <v-row no-gutters>
                                <v-col cols="12" class="mx-1 px-1">
                                  <v-switch v-model="applets.dependencies" color="success" inset label="Delete Dependencies"></v-switch>
                                </v-col>
                              </v-row>
                            </v-card-text>
                            <v-card-actions>
                              <div class="flex-grow-1"></div>
                              <v-btn color="primary" text @click="closeDelete()">Cancel</v-btn>
                              <v-btn color="primary" text @click="confirmDeleteItem()">Delete</v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-dialog>
                      </v-toolbar>
                    </template>
                    <template v-slot:item="row">
                      <template v-if="$vuetify.breakpoint.mdAndUp">
                        <tr :key="row.item.id">
                          <template v-for="header in row.headers">
                            <td v-if="getLastSetRow(row)" :style="`background-color: ${$vuetify.theme.currentTheme['success']}19;`" :key="`app-${row.index}-${header.value}`">
                              <template v-if="header.value == 'id'">
                                <v-icon color="success">mdi-lan-pending</v-icon>
                              </template>
                              <template v-else-if="header.value == 'name'">
                                <v-container class="d-flex flex-nowrap">
                                  <span class="font-italic font-weight-bold align-self-center text-center ml-n3">{{ applets.selected.name }}</span>
                                </v-container>
                              </template>
                              <template v-else-if="header.value == 'multi_imsi_type'">
                                <v-chip v-if="applets.selected.multi_imsi_type" label :color="getAppletInfo(applets.selected.multi_imsi_type).color">{{ getAppletInfo(applets.selected.multi_imsi_type).type }}</v-chip>
                              </template>
                              <template v-else-if="header.value == 'state'">
                                <v-chip v-if="applets.selected.state" label class="text-capitalize" :color="getAppletState(applets.selected.state)">{{ applets.selected.state }}</v-chip>
                              </template>
                              <template v-else-if="header.value == 'applet_type'">
                                <v-chip v-if="applets.selected.applet_type" label color="info">{{ applets.selected.applet_type.toUpperCase() }}</v-chip>
                              </template>
                              <template v-else-if="header.value == 'is_multi_imsi'">
                                <v-chip label :color="getMultiImsi(applets.selected.is_multi_imsi).color">{{ getMultiImsi(applets.selected.is_multi_imsi).type }}</v-chip>
                              </template>
                              <template v-else-if="header.value == 'ts'">
                                <span class="font-italic font-weight-bold">{{ helpers.toLocalTimeInIsoFormatUi(applets.selected.ts) }}</span>
                              </template>
                              <template v-else-if="header.value == 'action'">
                                <v-tooltip right>
                                  <template v-slot:activator="{ on }">
                                    <v-btn color="primary" @click="clear(row)" v-on="on">
                                      <v-icon center>mdi-cancel</v-icon>
                                    </v-btn>
                                  </template>
                                  <span>Clear</span>
                                </v-tooltip>
                              </template>
                              <template v-else>
                                <span class="font-italic font-weight-bold">{{ applets.selected[header.value] }}</span>
                              </template>
                            </td>
                            <td v-else-if="getDeletedRow(row)" :style="`background-color: ${$vuetify.theme.currentTheme['error']}19;`" :key="`applet-${row.index}-${header.value}`">
                              <template v-if="header.value == 'id'">
                                <v-icon color="error">mdi-lan-pending</v-icon>
                              </template>
                              <template v-else-if="header.value == 'name'">
                                <v-container class="d-flex flex-nowrap">
                                  <span class="font-italic font-weight-bold align-self-center text-center ml-n3">{{ applets.deletedItem.name }}</span>
                                </v-container>
                              </template>
                              <template v-else-if="header.value == 'multi_imsi_type'">
                                <v-chip v-if="applets.deletedItem.multi_imsi_type" label :color="getAppletInfo(applets.deletedItem.multi_imsi_type).color">{{ getAppletInfo(applets.deletedItem.multi_imsi_type).type }}</v-chip>
                              </template>
                              <template v-else-if="header.value == 'state'">
                                <v-chip v-if="applets.deletedItem.state" label class="text-capitalize" :color="getAppletState(applets.deletedItem.state)">{{ applets.deletedItem.state }}</v-chip>
                              </template>
                              <template v-else-if="header.value == 'applet_type'">
                                <v-chip v-if="applets.deletedItem.applet_type" label color="info">{{ applets.deletedItem.applet_type.toUpperCase() }}</v-chip>
                              </template>
                              <template v-else-if="header.value == 'is_multi_imsi'">
                                <v-chip label :color="getMultiImsi(applets.deletedItem.is_multi_imsi).color">{{ getMultiImsi(applets.deletedItem.is_multi_imsi).type }}</v-chip>
                              </template>
                              <template v-else-if="header.value == 'ts'">
                                <span class="font-italic font-weight-bold">{{ helpers.toLocalTimeInIsoFormatUi(applets.deletedItem.ts) }}</span>
                              </template>

                              <template v-else-if="header.value == 'action'">
                                <v-tooltip right>
                                  <template v-slot:activator="{ on }">
                                    <v-btn color="primary" @click="clear(row)" v-on="on">
                                      <v-icon center>mdi-cancel</v-icon>
                                    </v-btn>
                                  </template>
                                  <span>Clear</span>
                                </v-tooltip>
                              </template>
                              <template v-else>
                                <span class="font-italic font-weight-bold">{{ applets.deletedItem[header.value] }}</span>
                              </template>
                            </td>
                            <td v-else :key="`applets-${row.index}-${header.value}`">
                              <template v-if="header.value == 'name'">
                                <v-container class="d-flex flex-nowrap">
                                  <span class="align-self-center text-center ml-n3">{{ row.item.name }}</span>
                                  <v-btn
                                    class="ml-1"
                                    icon
                                    elevation="0"
                                    router
                                    :to="{
                                      path: '/resources/applet/',
                                      query: { id: row.item.id },
                                    }"
                                  >
                                    <v-icon center color="info">mdi-link</v-icon>
                                  </v-btn>
                                </v-container>
                              </template>
                              <template v-else-if="header.value == 'multi_imsi_type'">
                                <v-chip v-if="row.item.multi_imsi_type" label :color="getAppletInfo(row.item.multi_imsi_type).color">{{ getAppletInfo(row.item.multi_imsi_type).type }}</v-chip>
                              </template>
                              <template v-else-if="header.value == 'state'">
                                <v-chip v-if="row.item.state" label class="text-capitalize" :color="getAppletState(row.item.state)">{{ row.item.state }}</v-chip>
                              </template>
                              <template v-else-if="header.value == 'applet_type'">
                                <v-chip v-if="row.item.applet_type" label color="info">{{ row.item.applet_type.toUpperCase() }}</v-chip>
                              </template>
                              <template v-else-if="header.value == 'is_multi_imsi'">
                                <v-chip label :color="getMultiImsi(row.item.is_multi_imsi).color">{{ getMultiImsi(row.item.is_multi_imsi).type }}</v-chip>
                              </template>
                              <template v-else-if="header.value == 'ts'">
                                {{ helpers.toLocalTimeInIsoFormatUi(row.item.ts) }}
                              </template>
                              <template v-else-if="header.value == 'action'">
                                <v-btn color="primary" @click="setDeleteItem(row.item)" :disabled="disabled || readonly">
                                  <v-icon center>mdi-delete</v-icon>
                                </v-btn>
                              </template>
                              <template v-else>
                                <span>{{ row.item[header.value] }}</span>
                              </template>
                            </td>
                          </template>
                        </tr>
                      </template>
                      <template v-else>
                        <v-container class="ma-0 pa-1">
                          <flo-expand elevation="0" :color="$vuetify.theme.dark ? (row.index % 2 == 0 ? '#FFFFFF0D' : '#00000000') : row.index % 2 == 0 ? '#0000000D' : '#00000000'">
                            <template v-slot:title>
                              <v-chip label class="ma-2">{{ row.item.name.replace(/_/g, " ") }}</v-chip>
                            </template>

                            <template v-slot:content>
                              <v-list color="#00000000" class="ma-0 pa-0">
                                <template v-for="header in row.headers">
                                  <template v-if="getLastSetRow(row)">
                                    <v-list-item :key="`ram-app-${row.index}-${header.value}`">
                                      <v-list-item-content class="ma-0 pa-0">
                                        <v-list-item-subtitle>{{ header.text }}</v-list-item-subtitle>
                                      </v-list-item-content>
                                      <v-list-item-action>
                                        <template v-if="header.value == 'id'">
                                          <v-icon color="success">mdi-lan-pending</v-icon>
                                        </template>
                                        <template v-else-if="header.value == 'name'">
                                          <v-container class="d-flex flex-nowrap">
                                            <span class="font-italic font-weight-bold align-self-center text-center ml-n3">{{ applets.selected.name }}</span>
                                          </v-container>
                                        </template>
                                        <template v-else-if="header.value == 'multi_imsi_type'">
                                          <v-chip v-if="applets.selected.multi_imsi_type" label :color="getAppletInfo(applets.selected.multi_imsi_type).color">{{ getAppletInfo(applets.selected.multi_imsi_type).type }}</v-chip>
                                        </template>
                                        <template v-else-if="header.value == 'state'">
                                          <v-chip v-if="applets.selected.state" label class="text-capitalize" :color="getAppletState(applets.selected.state)">{{ applets.selected.state }}</v-chip>
                                        </template>
                                        <template v-else-if="header.value == 'applet_type'">
                                          <v-chip v-if="applets.selected.applet_type" label color="info">{{ applets.selected.applet_type.toUpperCase() }}</v-chip>
                                        </template>
                                        <template v-else-if="header.value == 'is_multi_imsi'">
                                          <v-chip label :color="getMultiImsi(applets.selected.is_multi_imsi).color">{{ getMultiImsi(applets.selected.is_multi_imsi).type }}</v-chip>
                                        </template>
                                        <template v-else-if="header.value == 'ts'">
                                          <span class="font-italic font-weight-bold">{{ helpers.toLocalTimeInIsoFormatUi(applets.selected.ts) }}</span>
                                        </template>
                                        <template v-else-if="header.value == 'action'">
                                          <v-tooltip right>
                                            <template v-slot:activator="{ on }">
                                              <v-btn color="primary" @click="clear(row)" v-on="on">
                                                <v-icon center>mdi-cancel</v-icon>
                                              </v-btn>
                                            </template>
                                            <span>Clear</span>
                                          </v-tooltip>
                                        </template>
                                        <template v-else>
                                          <span class="font-italic font-weight-bold">{{ applets.selected[header.value] }}</span>
                                        </template>
                                      </v-list-item-action>
                                    </v-list-item>
                                    <v-divider :key="`d${row.index}-${header.value}`" class="mx-4"></v-divider>
                                  </template>
                                  <template v-else-if="getDeletedRow(row)">
                                    <template v-if="header.value == 'action'">
                                      <v-list-item :key="`ram-app-${row.index}-${header.value}`">
                                        <v-list-item-content class="ma-0 pa-0">
                                          <v-list-item-title>{{ header.text }}</v-list-item-title>
                                        </v-list-item-content>
                                        <v-list-item-action>
                                          <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                                            <v-btn fab small color="primary" @click="setDeleteItem(row.item)" :disabled="disabled || readonly">
                                              <v-icon center>mdi-delete</v-icon>
                                            </v-btn>
                                            <div class="flex-grow-1"></div>
                                          </v-container>
                                        </v-list-item-action>
                                      </v-list-item>
                                    </template>

                                    <template v-else>
                                      <v-list-item :key="`ram-app-${row.index}-${header.value}`">
                                        <v-list-item-content class="ma-0 pa-0">
                                          <v-list-item-subtitle>{{ header.text }}</v-list-item-subtitle>
                                        </v-list-item-content>
                                        <v-list-item-action>
                                          <template v-if="header.value == 'name'">
                                            <v-container class="d-flex flex-nowrap">
                                              <span class="align-self-center text-center ml-n3">{{ row.item.name }}</span>
                                              <v-btn
                                                :disabled="disabled || readonly"
                                                class="ml-1"
                                                icon
                                                elevation="0"
                                                router
                                                :to="{
                                                  path: '/resources/applet/',
                                                  query: { fmtrow: row.item },
                                                }"
                                              >
                                                <v-icon center color="info">mdi-link</v-icon>
                                              </v-btn>
                                            </v-container>
                                          </template>
                                          <template v-else-if="header.value == 'multi_imsi_type'">
                                            <v-chip v-if="row.item.multi_imsi_type" label :color="getAppletInfo(row.item.multi_imsi_type).color">{{ getAppletInfo(row.item.multi_imsi_type).type }}</v-chip>
                                          </template>
                                          <template v-else-if="header.value == 'state'">
                                            <v-chip v-if="row.item.state" label class="text-capitalize" :color="getAppletState(row.item.state)">{{ row.item.state }}</v-chip>
                                          </template>
                                          <template v-else-if="header.value == 'applet_type'">
                                            <v-chip v-if="row.item.applet_type" label color="info">{{ row.item.applet_type.toUpperCase() }}</v-chip>
                                          </template>
                                          <template v-else-if="header.value == 'is_multi_imsi'">
                                            <v-chip label :color="getMultiImsi(row.item.is_multi_imsi).color">{{ getMultiImsi(row.item.is_multi_imsi).type }}</v-chip>
                                          </template>
                                          <template v-else-if="header.value == 'ts'">
                                            {{ helpers.toLocalTimeInIsoFormatUi(row.item.ts) }}
                                          </template>
                                          <template v-else-if="header.value == 'action'">
                                            <v-btn color="primary" @click="setDeleteItem(row.item)" :disabled="disabled || readonly">
                                              <v-icon center>mdi-delete</v-icon>
                                            </v-btn>
                                          </template>
                                          <template v-else>
                                            <span>{{ row.item[header.value] }}</span>
                                          </template>
                                        </v-list-item-action>
                                      </v-list-item>
                                      <v-divider :key="`d${row.index}-${header.value}`" class="mx-4"></v-divider>
                                    </template>
                                  </template>
                                  <template v-else>
                                    <template v-if="header.value == 'action'">
                                      <v-list-item :key="`ram-app-${row.index}-${header.value}`">
                                        <v-list-item-content class="ma-0 pa-0">
                                          <v-list-item-title>{{ header.text }}</v-list-item-title>
                                        </v-list-item-content>
                                        <v-list-item-action>
                                          <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                                            <v-btn fab small color="primary" @click="setDeleteItem(row.item)">
                                              <v-icon center>mdi-delete</v-icon>
                                            </v-btn>
                                            <div class="flex-grow-1"></div>
                                          </v-container>
                                        </v-list-item-action>
                                      </v-list-item>
                                    </template>

                                    <template v-else>
                                      <v-list-item :key="`ram-app-${row.index}-${header.value}`">
                                        <v-list-item-content class="ma-0 pa-0">
                                          <v-list-item-subtitle>{{ header.text }}</v-list-item-subtitle>
                                        </v-list-item-content>
                                        <v-list-item-action>
                                          <template v-if="header.value == 'name'">
                                            <v-container class="d-flex flex-nowrap">
                                              <span class="align-self-center text-center ml-n3">{{ row.item.name }}</span>
                                              <v-btn
                                                :disabled="disabled || readonly"
                                                class="ml-1"
                                                icon
                                                elevation="0"
                                                router
                                                :to="{
                                                  path: '/resources/applet/',
                                                  query: { fmtrow: row.item },
                                                }"
                                              >
                                                <v-icon center color="info">mdi-link</v-icon>
                                              </v-btn>
                                            </v-container>
                                          </template>
                                          <template v-else-if="header.value == 'multi_imsi_type'">
                                            <v-chip v-if="row.item.multi_imsi_type" label :color="getAppletInfo(row.item.multi_imsi_type).color">{{ getAppletInfo(row.item.multi_imsi_type).type }}</v-chip>
                                          </template>
                                          <template v-else-if="header.value == 'state'">
                                            <v-chip v-if="row.item.state" label class="text-capitalize" :color="getAppletState(row.item.state)">{{ row.item.state }}</v-chip>
                                          </template>
                                          <template v-else-if="header.value == 'applet_type'">
                                            <v-chip v-if="row.item.applet_type" label color="info">{{ row.item.applet_type.toUpperCase() }}</v-chip>
                                          </template>
                                          <template v-else-if="header.value == 'is_multi_imsi'">
                                            <v-chip label :color="getMultiImsi(row.item.is_multi_imsi).color">{{ getMultiImsi(row.item.is_multi_imsi).type }}</v-chip>
                                          </template>
                                          <template v-else-if="header.value == 'ts'">
                                            {{ helpers.toLocalTimeInIsoFormatUi(row.item.ts) }}
                                          </template>
                                          <template v-else-if="header.value == 'action'">
                                            <v-btn color="primary" @click="setDeleteItem(row.item)">
                                              <v-icon center>mdi-delete</v-icon>
                                            </v-btn>
                                          </template>
                                          <template v-else>
                                            <span>{{ row.item[header.value] }}</span>
                                          </template>
                                        </v-list-item-action>
                                      </v-list-item>
                                      <v-divider :key="`d${row.index}-${header.value}`" class="mx-4"></v-divider>
                                    </template>
                                  </template>
                                </template>
                              </v-list>
                            </template>
                          </flo-expand>
                        </v-container>
                      </template>
                    </template>
                  </v-data-table>
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
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  name: "flo-ram-app",
  components: {
    floRfmMisc,
  },
  data() {
    return {
      helpers,
      loading: true,
      operations: [],
      selected: null,
      dialog: false,
      deleteDialog: false,
      applets: {
        app: null,
        headers: null,
        records: null,
        installed: null,
        filtered: null,
        selected: null,
        editedIndex: -1,
        deletedItem: {},
        dependencies: true,
      },
    };
  },
  props: {
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
  },
  computed: {
    disable() {
      let disable = false;

      if (null != this.selected) {
        if (Object.keys(this.applets.deletedItem).length == 0) {
          let has_multi_imsi = this.applets.installed.some((applet) => 1 == applet.is_multi_imsi);
          let l_selected = this.getSelectedApplet();
          if (l_selected.length > 0) {
            if (l_selected[0].is_multi_imsi && has_multi_imsi) {
              disable = true;
            }
          } else {
            disable = true;
          }
        } else {
          if (!this.applets.deletedItem.is_multi_imsi) {
            disable = true;
          }
        }
      }

      return disable;
    },
  },
  async created() {
    await this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    async initialize() {
      console.log(`flo-ram-app - initialize - enter - ${JSON.stringify(this.value)}`);
      await this.loadApplets();
      await this.loadAppletsMeta();
      this.installedApplets();
      this.filteredApplets();

      if (null == this.value) {
        this.syncParent();
      } else {
        this.formattedOperations();
      }

      this.loading = false;
    },
    syncParent() {
      console.log(`flo-ram-app - syncParent - enter - ${JSON.stringify(this.operations)}`);
      this.$emit("change", this.operations);
    },
    onMiscChange(event) {
      console.log(`flo-ram-app - onMiscChange - enter - ${JSON.stringify(event)}`);
      if (event) {
        this.applets.app = event.app;
      }
      this.syncParent();
    },
    setApplet() {
      let l_filtered = this.getSelectedApplet();
      let installed = {
        app: this.applets.app,
        type: "install",
        params: {
          applet_id: l_filtered[0].id,
        },
      };

      let found = this.operations.find((f) => f.type == "install");
      this.applets.selected = l_filtered[0];

      if (!found) {
        this.operations.push(installed);

        if (!this.applets.installed.some((s) => s.id == this.applets.selected.id)) {
          this.applets.installed.push(this.applets.selected);
        }
      } else {
        this.applets.installed.splice(
          this.applets.installed.findIndex((f) => {
            return f.id == found.params.applet_id;
          }),
          1,
        );
        this.operations.splice(
          this.operations.findIndex((f) => {
            return f.id == found.params.applet_id;
          }),
          1,
        );
        this.operations.push(installed);
        this.applets.installed.push(this.applets.selected);
      }

      this.syncParent();
      this.close();
    },
    clear(row) {
      this.operations.splice(
        this.operations.findIndex((operation) => {
          return operation.applet_id == row.item.id;
        }),
        1,
      );
      if (null != this.applets.selected) {
        this.applets.selected = null;
        this.applets.installed.splice(
          this.applets.installed.findIndex((installed) => {
            return installed.id == row.item.id;
          }),
          1,
        );
      } else if (Object.keys(this.applets.deletedItem).length > 0) {
        this.applets.deletedItem = {};
      }

      this.syncParent();
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.applets.editedIndex = -1;
      });
    },
    closeDelete() {
      this.deleteDialog = false;
      this.$nextTick(() => {
        this.applets.editedIndex = -1;
      });
    },
    setDeleteItem(item) {
      this.applets.editedIndex = this.applets.records.indexOf(item);
      this.applets.deletedItem = Object.assign({}, item);
      this.deleteDialog = true;
    },
    confirmDeleteItem() {
      console.log(`flo-ram-app - confirmDeleteItem - enter`);
      let deleted = {
        app: this.applets.app,
        type: "delete",
        params: {
          applet_id: this.applets.deletedItem.id,
          dependencies: this.applets.dependencies,
        },
      };

      this.operations.push(deleted);
      this.syncParent();
      this.closeDelete();
    },
    deleteDialogTitle() {
      let title = "";
      if (this.applets.deletedItem.hasOwnProperty("name")) {
        title = this.applets.deletedItem.name;
      } else if (this.applets.deletedItem.hasOwnProperty("id")) {
        title = this.applets.deletedItem.id;
      }
      return `Are you sure you want to delete installed applet ${title.toLowerCase()}?`;
    },
    getUiccAids() {
      if (!this.uicc.hasOwnProperty("aids")) {
        return null;
      }
      return this.uicc.aids;
    },
    getAppletInfo(type) {
      let lapp = {
        color: "",
        type: "",
      };
      let ltype = "";
      if (type) {
        ltype = type.toLowerCase();
      }
      if (ltype == "flolive") {
        lapp.color = "primary";
        lapp.type = "FloLive";
      } else if (ltype == "telit") {
        lapp.color = "info";
        lapp.type = "Telit";
      } else if (ltype == "redtea") {
        lapp.color = "secondary";
        lapp.type = "RedTea";
      }

      return lapp;
    },
    getMultiImsi(type) {
      return {
        color: type == 1 ? "success" : "",
        type: type == 1 ? "YES" : type == 0 ? "NO" : "",
      };
    },
    getAppletState(state) {
      let colorMap = {
        deprecated: "error",
        active: "success",
      };

      return colorMap[state] || "warning";
    },
    getLastSetRow(row) {
      let last_set_row = false;
      if (null != this.applets.selected) {
        if (this.applets.installed.length > 0) {
          if (row.item.id == this.applets.installed[this.applets.installed.length - 1].id) {
            last_set_row = true;
          }
        }
      }
      return last_set_row;
    },
    getDeletedRow(row) {
      let deleted_row = false;
      if (Object.keys(this.applets.deletedItem).length > 0) {
        if (this.operations.length > 0) {
          if (this.applets.deletedItem.id == row.item.id) {
            deleted_row = true;
          }
        }
      }
      return deleted_row;
    },
    formattedOperations() {
      this.operations = this.value;

      for (let operation of this.operations) {
        if (operation.type && operation.params) {
          let found = this.applets.records.find((f) => f.id == operation.params.applet_id);
          if (operation.type == "delete") {
            this.applets.deletedItem = found;
          } else if (operation.type == "install") {
            this.applets.selected = found;
            this.applets.installed.push(found);
          }
        }
      }
    },
    installedApplets() {
      let installed = [];
      if (null != this.card_applets && "" != this.card_applets) {
        let lapplet = JSON.parse(this.card_applets);
        if ("number" == typeof lapplet) {
          installed = this.applets.records.filter((applet) => applet.id == lapplet);
        } else {
          installed = this.applets.records.filter((applet) => lapplet.includes(applet.id));
        }
        this.applets.installed = installed;
      } else {
        this.applets.installed = installed;
      }
    },
    filteredApplets() {
      let filtered = [];
      if (null != this.card_applets && "" != this.card_applets) {
        let l_applets = JSON.parse(this.card_applets);
        if ("number" == typeof l_applets) {
          filtered = this.applets.records.filter((f) => f.id != l_applets);
        } else {
          filtered = this.applets.records.filter((f) => !l_applets.includes(f.id));
        }
        this.applets.filtered = filtered;
      } else {
        this.applets.filtered = filtered;
      }
    },
    getSelectedApplet() {
      let filtered = null;

      if (this.selected) {
        let levent = this.selected.trim();
        if (levent.includes("- Multi IMSI")) {
          levent = levent.split("- Multi IMSI")[0];
        }
        let lapp = levent.trim();
        if (this.applets.filtered.length > 0) {
          filtered = this.applets.filtered.filter((applet) => applet.name == lapp);
        } else {
          filtered = this.applets.records.filter((applet) => applet.name == lapp);
        }
      }
      return filtered;
    },
    getFilteredApplets() {
      let filtered = [];
      if (this.applets.filtered.length == 0) {
        filtered = this.applets.records.filter((f) => f.state != "deprecated").map((app) => `${app.name} ${app.is_multi_imsi == 1 ? "- Multi IMSI" : ""} ${app.multi_imsi_type != "" ? ` - ${this.helpers.capitalizeFLetter(app.multi_imsi_type)}` : ""}`);
      } else {
        filtered = this.applets.filtered.filter((f) => f.state != "deprecated").map((app) => `${app.name} ${app.is_multi_imsi == 1 ? "- Multi IMSI" : ""} ${app.multi_imsi_type != "" ? ` - ${this.helpers.capitalizeFLetter(app.multi_imsi_type)}` : ""}`);
      }
      return filtered;
    },
    async loadApplets() {
      try {
        let query = {
          select: { id: { k: "id" }, name: { k: "name" }, state: { k: "state" }, applet_type: { k: "applet_type" }, description: { k: "description" }, is_multi_imsi: { k: "is_multi_imsi" }, multi_imsi_type: { k: "multi_imsi_type" }, ts: { k: "ts" } },
        };
        let applets = await this.$axios.$post("api/v1/applets/list", query);
        this.applets.records = applets;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadAppletsMeta() {
      try {
        let lmeta = await this.$axios.$get("api/v1/applets/meta");
        let lheaders = [];
        for (const key of Object.keys(lmeta.keys)) {
          let lheader = {
            text: "",
            sortable: false,
            value: "",
            type: "",
          };

          let lhidden = ["v_major", "v_minor", "aaid", "iaid", "paid", "non_volatile_data_size", "volatile_data_size", "app_parameters", "access_domain", "priority_level", "max_timers", "max_menu_entry_text", "max_menu_entries", "tar", "msl", "max_nr_services", "uicc_access_app", "uicc_admin_access_app", "attr", "ram_ifl", "ram_ifi", "uicc_version", "usim_version", "actual_volatile_data_size", "non_volatile_data_size", "actual_non_volatile_data_size", "volatile_data_size"];

          if (lhidden.includes(key)) {
            continue;
          }

          lheader.value = key;
          lheader.text = lmeta.keys[key].desc;
          lheader.type = lmeta.keys[key].type;

          lheaders.push(lheader);
        }

        lheaders.push({
          text: "Actions",
          value: "action",
          sortable: false,
        });

        this.applets.headers = lheaders;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
  },
};
</script>
