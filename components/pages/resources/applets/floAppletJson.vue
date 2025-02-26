<template>
  <div class="flo-applet-json">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col cols="12" class="pa-1">
          <v-tabs v-model="selected_tab" @change="tabChange($event)">
            <v-tab key="applet-1" v-if="japplet != null">UI</v-tab>
            <v-tab key="applet-2" v-if="japplet != null">JSON</v-tab>
          </v-tabs>
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col cols="12">
          <v-tabs-items v-model="selected_tab">
            <v-tab-item key="applet-1" v-if="japplet != null">
              <v-container fluid class="ma-0 pa-0">
                <v-row no-gutters>
                  <v-col cols="12">
                    <template v-if="record.multi_imsi_type == 'flolive'">
                      <v-row class="ma-1">
                        <v-col cols="12" class="ma-0 pa-0">
                          <flo-expand title="Keys" elevation="5">
                            <template v-slot:title="{ title }">
                              <span class="title font-weight-regular mx-2">{{ title }}</span>
                            </template>

                            <template v-slot:content="{}">
                              <div v-if="keys.loading == false">
                                <v-data-table :headers="keys.headers" :key="keys_version" :items="keys.records" sort-by="id" calculate-widths :footer-props="{ 'items-per-page-options': [10, 20, 30, 40, 50] }" :items-per-page="30" class="resourcetable elevation-0" :search="keys.lookup" dense show-expand :expanded.sync="keys.expanded" :mobile-breakpoint="960">
                                  <template v-slot:top>
                                    <v-row class="mx-2 my-1">
                                      <v-switch v-model="show_unused_keys" class="pa-1 ma-1 subheading font-weight-light" dense color="success" hide-details label="Show Unused"></v-switch>
                                      <div class="flex-grow-1"></div>
                                      <v-btn color="primary" class="ma-1 mr-3" @click="keys.constraints_dialog = true">Constraints</v-btn>
                                    </v-row>
                                  </template>
                                  <template v-slot:item="row">
                                    <template v-if="show_unused_keys || isKiOpcUsed(row.item.ki, row.item.opc)">
                                      <template v-if="$vuetify.breakpoint.mdAndUp">
                                        <tr>
                                          <td v-for="header in row.headers" :key="`rkey-${row.index}-${header.value}`" :class="`text-${typeof header.align === 'undefined' ? 'center' : header.align}`">
                                            <template v-if="header.value == 'action'">
                                              <div class="flex-grow-1"></div>
                                              <v-btn class="ma-1" color="primary" @click="updateKeysItem(row.item)">
                                                <v-icon left>{{ canEditCardKeys() ? "mdi-pencil" : "mdi-more" }}</v-icon
                                                >{{ canEditCardKeys() ? "Edit" : "View" }}
                                              </v-btn>

                                              <v-btn v-if="keys.permissions.u == true" :disabled="!canEditCardKeys()" color="primary" @click="updateKeysItem(row.item, true)">
                                                <v-icon center>mdi-broom</v-icon>
                                              </v-btn>
                                            </template>
                                            <template v-else-if="header.value == 'idx'">
                                              <v-badge v-if="row.item.idx <= getBootMark()" color="warning" overlap class="align-self-center">
                                                <template v-slot:badge>
                                                  <span>Boot</span>
                                                </template>
                                                <v-chip class="ma-2">{{ row.item.idx }}</v-chip>
                                              </v-badge>
                                              <template>
                                                <v-chip class="ma-2">{{ row.item.idx }}</v-chip>
                                              </template>
                                            </template>
                                            <template v-else-if="header.value == 'ki'">{{ getKiOpcMask(row.item.ki) }}</template>
                                            <template v-else-if="header.value == 'opc'">{{ getKiOpcMask(row.item.opc) }}</template>
                                            <template v-else>
                                              <span>{{ row.item[header.value] }}</span>
                                            </template>
                                          </td>
                                        </tr>
                                      </template>
                                      <template v-else>
                                        <v-container class="ma-0 pa-1">
                                          <flo-expand elevation="0" :color="$vuetify.theme.dark ? (row.index % 2 == 0 ? '#FFFFFF0D' : '#00000000') : row.index % 2 == 0 ? '#0000000D' : '#00000000'">
                                            <template v-slot:title>
                                              <v-badge v-if="row.item.idx <= getBootMark()" color="warning" overlap class="align-self-center">
                                                <template v-slot:badge>
                                                  <span>Boot</span>
                                                </template>
                                                <v-chip class="ma-2">{{ row.item.idx }}</v-chip>
                                              </v-badge>
                                              <template v-else>
                                                <v-chip class="ma-2">{{ row.item.idx }}</v-chip>
                                              </template>
                                              <template v-if="row.item.ki == '00000000000000000000000000000000' && row.item.opc == '00000000000000000000000000000000'">
                                                <v-chip label>NO</v-chip>
                                              </template>
                                              <template v-else>
                                                <v-chip color="success" label>YES</v-chip>
                                              </template>
                                            </template>

                                            <template v-slot:content>
                                              <v-list color="#00000000" class="ma-0 pa-0">
                                                <template v-for="header in row.headers">
                                                  <template v-if="header.value == 'data-table-expand'"></template>
                                                  <template v-else-if="header.value == 'action'">
                                                    <v-list-item :key="`rkey-${row.index}-${header.value}`">
                                                      <v-list-item-content class="ma-0 pa-0">
                                                        <v-list-item-title>{{ header.text }}</v-list-item-title>
                                                      </v-list-item-content>
                                                      <v-list-item-action>
                                                        <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                                                          <v-btn :disabled="!canEditCardKeys()" class="ma-1" color="primary" fab small @click="updateKeysItem(row.item)">
                                                            <v-icon>{{ canEditCardKeys() ? "mdi-pencil" : "mdi-more" }}</v-icon>
                                                          </v-btn>

                                                          <v-btn v-if="keys.permissions.u == true" :disabled="!canEditCardKeys()" color="primary" @click="updateKeysItem(row.item, true)" fab small class="ma-1">
                                                            <v-icon>mdi-broom</v-icon>
                                                          </v-btn>

                                                          <div class="flex-grow-1"></div>
                                                        </v-container>
                                                      </v-list-item-action>
                                                    </v-list-item>
                                                  </template>
                                                  <template v-else-if="header.value == 'idx'">
                                                    <v-list-item :key="`rkey-${row.index}-${header.value}`">
                                                      <v-list-item-content class="ma-0 pa-0">
                                                        <v-list-item-subtitle>{{ header.text }}</v-list-item-subtitle>
                                                      </v-list-item-content>
                                                      <v-list-item-action>
                                                        <v-badge v-if="row.item.idx <= getBootMark()" color="warning" overlap class="align-self-center">
                                                          <template v-slot:badge>
                                                            <span>Boot</span>
                                                          </template>

                                                          <v-chip class="ma-2">{{ row.item.idx }}</v-chip>
                                                        </v-badge>
                                                        <template v-else>
                                                          <v-chip class="ma-2">{{ row.item.idx }}</v-chip>
                                                        </template>
                                                      </v-list-item-action>
                                                    </v-list-item>
                                                  </template>
                                                  <template v-else>
                                                    <v-list-item :key="`rkey-${row.index}-${header.value}`">
                                                      <v-list-item-content class="ma-0 pa-0">
                                                        <v-list-item-subtitle>{{ header.text }}</v-list-item-subtitle>
                                                      </v-list-item-content>
                                                      <v-list-item-action>
                                                        <span>{{ getKiOpcMask(row.item[header.value]) }}</span>
                                                      </v-list-item-action>
                                                    </v-list-item>
                                                    <v-divider :key="`d${row.index}-${header.value}`" class="mx-4"></v-divider>
                                                  </template>
                                                </template>
                                              </v-list>
                                            </template>
                                          </flo-expand>
                                        </v-container>
                                      </template>
                                    </template>
                                  </template>

                                  <template v-slot:no-data>No Data</template>
                                </v-data-table>
                              </div>
                            </template>
                          </flo-expand>
                        </v-col>
                      </v-row>

                      <v-row class="ma-1">
                        <v-col cols="12" class="ma-0 pa-0">
                          <flo-expand open title="Subscribers" elevation="5">
                            <template v-slot:content="{}">
                              <div v-if="subs.loading == false">
                                <v-data-table :headers="subs.headers" :key="subs_version" :items="subs.records" disable-sort calculate-widths :footer-props="{ 'items-per-page-options': [10, 20, 30, 40, 50] }" :items-per-page="30" class="resourcetable elevation-0" dense show-expand :expanded.sync="subs.expanded" :mobile-breakpoint="960">
                                  <template v-slot:top>
                                    <v-row class="mx-2 my-1">
                                      <v-switch v-model="show_unused_subs" class="pa-1 ma-1 subheading font-weight-light" dense color="success" hide-details label="Show Unused"></v-switch>
                                      <div class="flex-grow-1"></div>
                                      <v-btn color="primary" class="ma-1 mr-3" @click="subs.constraints_dialog = true">Constraints</v-btn>
                                    </v-row>
                                  </template>

                                  <template v-slot:item="row">
                                    <template v-if="show_unused_subs || row.item.used">
                                      <template v-if="$vuetify.breakpoint.mdAndUp">
                                        <tr>
                                          <td v-for="header in row.headers" :key="`rsub-${row.index}-${header.value}`" :class="`text-${typeof header.align === 'undefined' ? 'center' : header.align}`">
                                            <template v-if="header.value == 'action'">
                                              <div class="flex-grow-1"></div>
                                              <v-btn class="ma-1" color="primary" @click="updateSubsItem(row.item)">
                                                <v-icon left>{{ canEditCardSubs() ? "mdi-pencil" : "mdi-more" }}</v-icon
                                                >{{ canEditCardSubs() ? "Edit" : "View" }}
                                              </v-btn>
                                              <v-btn v-if="subs.permissions.u == true" :disabled="!canEditCardSubs()" color="primary" @click="updateSubsItem(row.item, true)">
                                                <v-icon>mdi-broom</v-icon>
                                              </v-btn>
                                            </template>
                                            <template v-else-if="header.value == 'idx'">
                                              <v-badge v-if="row.item.idx <= getBootMark()" color="warning" overlap class="align-self-center">
                                                <template v-slot:badge>
                                                  <span>Boot</span>
                                                </template>
                                                <v-chip class="ma-2">{{ row.item.idx }}</v-chip>
                                              </v-badge>
                                              <template v-else>
                                                <v-chip class="ma-2">{{ row.item.idx }}</v-chip>
                                              </template>
                                            </template>
                                            <template v-else-if="header.value == 'used'">
                                              <v-chip color="success" label v-if="row.item.used">YES</v-chip>
                                              <v-chip label v-else>NO</v-chip>
                                            </template>
                                            <template v-else-if="header.value == 'mcc'">
                                              <v-chip v-for="(mcc, i) in formatMcc(row.item.mcc)" :key="i" label color="info" class="mr-1 text-capitalize">{{ mcc }}</v-chip>
                                            </template>
                                            <template v-else-if="header.value == 'plmn'">{{ beutifyPlmn(row.item.plmn) }}</template>
                                            <template v-else-if="header.value == 'ts'">{{ helpers.getTsString(row.item.ts) }}</template>
                                            <template v-else>
                                              <span>{{ row.item[header.value] }}</span>
                                            </template>
                                          </td>
                                        </tr>
                                      </template>
                                      <template v-else>
                                        <v-container class="ma-0 pa-1">
                                          <flo-expand elevation="0" :color="$vuetify.theme.dark ? (row.index % 2 == 0 ? '#FFFFFF0D' : '#00000000') : row.index % 2 == 0 ? '#0000000D' : '#00000000'">
                                            <template v-slot:title>
                                              <v-badge v-if="row.item.idx <= getBootMark()" color="warning" overlap class="align-self-center">
                                                <template v-slot:badge>
                                                  <span>Boot</span>
                                                </template>
                                                <v-chip class="ma-2" @click="onProfileClick(item)">{{ row.item.idx }}</v-chip>
                                              </v-badge>
                                              <template v-else>
                                                <v-chip class="ma-2">{{ row.item.idx }}</v-chip>
                                              </template>
                                              <template v-if="row.item.used">
                                                <v-chip color="success" label>YES</v-chip>
                                              </template>
                                              <template v-else>
                                                <v-chip label>NO</v-chip>
                                              </template>
                                              <template v-if="row.item.imsi != ''">
                                                <v-chip class="ma-2" label>{{ row.item.imsi }}</v-chip>
                                              </template>
                                            </template>
                                            <template v-slot:content>
                                              <v-list color="#00000000" class="ma-0 pa-0">
                                                <template v-for="header in row.headers">
                                                  <template v-if="header.value == 'data-table-expand'"></template>
                                                  <template v-else-if="header.value == 'action'">
                                                    <v-list-item :key="`rsub-${row.index}-${header.value}`">
                                                      <v-list-item-content class="ma-0 pa-0">
                                                        <v-list-item-title>{{ header.text }}</v-list-item-title>
                                                      </v-list-item-content>
                                                      <v-list-item-action>
                                                        <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                                                          <v-btn :disabled="!canEditCardSubs()" class="ma-1" color="primary" @click="updateSubsItem(row.item)" fab small>
                                                            <v-icon>{{ canEditCardSubs() ? "mdi-pencil" : "mdi-more" }}</v-icon>
                                                          </v-btn>

                                                          <v-btn v-if="subs.permissions.u == true" :disabled="!canEditCardSubs()" color="primary" @click="updateSubsItem(row.item, true)" fab small class="ma-1">
                                                            <v-icon>mdi-broom</v-icon>
                                                          </v-btn>

                                                          <div class="flex-grow-1"></div>
                                                        </v-container>
                                                      </v-list-item-action>
                                                    </v-list-item>
                                                  </template>
                                                  <template v-else>
                                                    <v-list-item :key="`rsub-${row.index}-${header.value}`">
                                                      <v-list-item-content class="ma-0 pa-0">
                                                        <v-list-item-subtitle>{{ header.text }}</v-list-item-subtitle>
                                                      </v-list-item-content>
                                                      <v-list-item-action>
                                                        <template v-if="header.value == 'idx'">
                                                          <v-badge v-if="row.item.idx <= getBootMark()" color="warning" overlap class="align-self-center">
                                                            <template v-slot:badge>
                                                              <span>Boot</span>
                                                            </template>

                                                            <v-chip class="ma-2">{{ row.item.idx }}</v-chip>
                                                          </v-badge>
                                                          <template v-else>
                                                            <v-chip class="ma-2">{{ row.item.idx }}</v-chip>
                                                          </template>
                                                        </template>
                                                        <template v-else-if="header.value == 'used'">
                                                          <v-chip color="success" label v-if="row.item.used">YES</v-chip>
                                                          <v-chip label v-else>NO</v-chip>
                                                        </template>
                                                        <template v-else-if="header.value == 'mcc'">{{ formatMcc(row.item.mcc) }}</template>
                                                        <template v-else-if="header.value == 'plmn'">{{ beutifyPlmn(row.item.plmn) }}</template>
                                                        <template v-else-if="header.value == 'ts'">{{ helpers.getTsString(row.item.ts) }}</template>
                                                        <template v-else>
                                                          <span>{{ row.item[header.value] }}</span>
                                                        </template>
                                                      </v-list-item-action>
                                                    </v-list-item>
                                                    <template v-if="header.value != 'idx'"> </template>
                                                    <v-divider :key="`d${row.index}-${header.value}`" class="mx-4"></v-divider>
                                                  </template>
                                                </template>
                                              </v-list>
                                            </template>
                                          </flo-expand>
                                        </v-container>
                                      </template>
                                    </template>
                                  </template>

                                  <template v-slot:no-data>No Data</template>
                                </v-data-table>
                              </div>
                            </template>
                          </flo-expand>
                        </v-col>
                      </v-row>

                      <v-row class="ma-1">
                        <v-col cols="12" class="ma-0 pa-0">
                          <flo-expand title="Settings" elevation="5">
                            <template v-slot:content="{}">
                              <div v-if="settings.loading == false">
                                <v-data-table :headers="settings.headers" :key="settings_version" :items="settings.records" sort-by="name" calculate-widths :footer-props="{ 'items-per-page-options': [10, 20, 30, 40, 50] }" :items-per-page="30" class="resourcetable elevation-0" :search="settings.lookup" dense show-expand :expanded.sync="settings.expanded" :mobile-breakpoint="960">
                                  <template v-slot:top>
                                    <v-toolbar flat dense color="rgba(0,0,0,0)">
                                      <v-row no-gutters>
                                        <v-col cols="12" lg="6" xl="6" class="pa-1">
                                          <v-text-field v-model="settings.lookup" append-icon="mdi-magnify" label="Lookup" single-line hide-details></v-text-field>
                                        </v-col>
                                      </v-row>
                                      <div class="flex-grow-1"></div>
                                      <v-btn color="primary" class="mb-2 mr-2" @click="settings.constraints_dialog = true">Constraints</v-btn>
                                      <v-dialog :overlay-opacity="0.4" v-model="settings.dialog" scrollable max-width="800px">
                                        <template v-if="settings.permissions.c == true && canEditCardSettings()" v-slot:activator="{ on }">
                                          <v-btn :__qa="`settings@action@new`" color="primary" dark class="mb-2" v-on="on">New Setting</v-btn>
                                        </template>
                                        <v-card>
                                          <v-card-title>
                                            <span class="headline">{{ formSettingsTitle }}</span>
                                          </v-card-title>

                                          <v-card-text>
                                            <v-container fluid class="ma-0 pa-1">
                                              <v-row no-gutters>
                                                <template v-for="(header, i) in settings.headers">
                                                  <v-col :__qa="helpers.getQATag('settings', header)" v-if="header.value != 'action'" :key="'ht' + i" cols="12" lg="6" xl="6" class="pa-2">
                                                    <v-form :disabled="!canEditCardSettings()">
                                                      <v-text-field v-if="header.value == 'id'" disabled v-model="settings.editedItem[header.value]" :label="header.text"></v-text-field>
                                                      <v-text-field v-else-if="header.value == 'name'" v-model="settings.editedItem[header.value]" :label="header.text"></v-text-field>
                                                      <v-select v-else-if="header.value == 'store'" v-model="settings.editedItem[header.value]" :items="['card', 'server', 'perso']" required :label="header.text" filled></v-select>
                                                      <v-select v-else-if="header.value == 'type'" v-model="settings.editedItem[header.value]" :items="['number', 'string']" required :label="header.text" filled></v-select>
                                                      <v-text-field v-else-if="header.value == 'description'" v-model="settings.editedItem[header.value]" :label="header.text"></v-text-field>
                                                      <v-text-field v-else-if="header.value == 'value'" :value="getSettingsValue(settings.editedItem)" @change="setSettingsValue(settings.editedItem, $event)" :label="header.text"></v-text-field>
                                                      <v-text-field v-else-if="header.value == 'ts'" disabled v-model="settings.editedItem[header.value]" :label="header.text"></v-text-field>
                                                      <v-text-field v-else v-model="settings.editedItem[header.value]" :label="header.text"></v-text-field>
                                                    </v-form>
                                                  </v-col>
                                                </template>
                                              </v-row>
                                            </v-container>
                                          </v-card-text>

                                          <v-card-actions>
                                            <div class="flex-grow-1"></div>
                                            <v-btn color="primary" text @click="closeSettings">Cancel</v-btn>
                                            <v-btn v-if="canEditCardSettings()" color="primary" text @click="saveSettings">Save</v-btn>
                                          </v-card-actions>
                                        </v-card>
                                      </v-dialog>
                                    </v-toolbar>
                                  </template>

                                  <template v-slot:item="row">
                                    <template v-if="$vuetify.breakpoint.mdAndUp">
                                      <tr>
                                        <td v-for="header in row.headers" :key="`rset-${row.index}-${header.value}`" :class="`text-${typeof header.align === 'undefined' ? 'center' : header.align}`">
                                          <template v-if="header.value == 'action'">
                                            <div class="flex-grow-1"></div>
                                            <v-btn class="ma-1" color="primary" @click="editSettingsItem(row.item)">
                                              <v-icon left>{{ canEditCardSettings() ? "mdi-pencil" : "mdi-more" }}</v-icon
                                              >{{ canEditCardSettings() ? "Edit" : "View" }}
                                            </v-btn>
                                          </template>
                                          <template v-else-if="header.value == 'name'">{{ row.item[header.value].replace(/_/g, " ") }}</template>
                                          <template v-else-if="header.value == 'value'">{{ formatSettingsValue(row.item) }}</template>
                                          <template v-else-if="header.value == 'store'"
                                            ><v-chip class="text-capitalize" :color="row.item[header.value] == 'server' ? 'primary' : 'info'" label>{{ row.item[header.value] }}</v-chip></template
                                          >
                                          <template v-else-if="header.value == 'type'">
                                            <v-chip class="text-capitalize" :color="row.item[header.value] == 'number' ? 'primary' : 'info'" label>{{ row.item[header.value] }} </v-chip></template
                                          >
                                          <template v-else>
                                            <span>{{ row.item[header.value] }}</span>
                                          </template>
                                        </td>
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
                                                <template v-if="header.value == 'data-table-expand'"></template>
                                                <template v-else-if="header.value == 'action'">
                                                  <v-list-item :key="`rset-${row.index}-${header.value}`">
                                                    <v-list-item-content class="ma-0 pa-0">
                                                      <v-list-item-title>{{ header.text }}</v-list-item-title>
                                                    </v-list-item-content>
                                                    <v-list-item-action>
                                                      <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                                                        <v-btn fab small color="primary" @click="editSettingsItem(row.item)">
                                                          <v-icon>{{ canEditCardSettings() ? "mdi-pencil" : "mdi-more" }}</v-icon>
                                                        </v-btn>
                                                        <div class="flex-grow-1"></div>
                                                      </v-container>
                                                    </v-list-item-action>
                                                  </v-list-item>
                                                </template>

                                                <template v-else>
                                                  <v-list-item :key="`rset-${row.index}-${header.value}`">
                                                    <v-list-item-content class="ma-0 pa-0">
                                                      <v-list-item-subtitle>{{ header.text }}</v-list-item-subtitle>
                                                    </v-list-item-content>
                                                    <v-list-item-action>
                                                      <template v-if="header.value == 'name'">{{ row.item[header.value].replace(/_/g, " ") }}</template>
                                                      <template v-else-if="header.value == 'value'">{{ formatSettingsValue(row.item) }}</template>
                                                      <span v-else>{{ row.item[header.value] }}</span>
                                                    </v-list-item-action>
                                                  </v-list-item>
                                                  <v-divider :key="`d${row.index}-${header.value}`" class="mx-4"></v-divider>
                                                </template>
                                              </template>
                                            </v-list>
                                          </template>
                                        </flo-expand>
                                      </v-container>
                                    </template>
                                  </template>

                                  <template v-slot:no-data>No Data</template>
                                </v-data-table>
                              </div>
                            </template>
                          </flo-expand>
                        </v-col>
                      </v-row>
                    </template>

                    <v-row class="ma-1">
                      <v-col cols="12" class="ma-0 pa-0">
                        <flo-expand title="Virtual Files" elevation="5">
                          <template v-slot:content="{}">
                            <v-container fluid class="ma-0 pa-0">
                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <flo-meta-table v-if="translator !== null" @load-data="onLoadVfData($event)" @pre-new="onPreNewVf($event)" @pre-edit="onPreEditVf($event)" :can_import="!readonly" :show_title="false" :title="title" :translator="translator" :hidden_filter="vf_hidden_filter" :key="vf_version" disableNew disabledEdit accept=".json" dialogWidth="1400px" resources="vfile_definitions">
                                    <template v-slot:view_type="{ fmtrow }">
                                      <v-chip v-if="fmtrow.type" label :color="getType(fmtrow.type).color">{{ getType(fmtrow.type).type }}</v-chip>
                                    </template>

                                    <template v-slot:edit_fields="{ fmtheader, fmtrow }">
                                      <v-col :__qa="helpers.getQATag('vfile_definitions', fmtheader)" cols="12" class="pa-1">
                                        <flo-virtual-field-table readonly :resource="fmtrow" :value="fmtrow.fields" />
                                      </v-col>
                                    </template>
                                  </flo-meta-table>
                                </v-col>
                              </v-row>
                            </v-container>
                          </template>
                        </flo-expand>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-container>
            </v-tab-item>

            <v-tab-item key="applet-2" v-if="japplet != null">
              <v-container fluid class="ma-0 pa-0">
                <v-row no-gutters>
                  <v-col>
                    <flo-json-editor name="Applet Setup" mode="view" :modes="['view', 'preview', 'text']" height="600px" :value="this.japplet" :key="json_version"></flo-json-editor>
                  </v-col>
                </v-row>
              </v-container>
            </v-tab-item>
          </v-tabs-items>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog :overlay-opacity="0.4" v-model="subs.dialog" scrollable max-width="800px">
      <template v-if="subs.permissions.c == true" v-slot:activator="{ on }">
        <v-btn color="primary" dark class="mb-2" v-on="on">New {{ subs.resource }}</v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="headline">{{ formSubsTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container fluid class="ma-0 pa-1">
            <v-row no-gutters>
              <template v-for="(header, i) in subs.headers">
                <v-col v-if="header.value != 'action'" :key="'hs' + i" cols="12" lg="6" xl="6" class="pa-1">
                  <v-form :disabled="!canEditCardSubs()">
                    <v-text-field v-if="header.value == 'id'" disabled v-model="subs.editedItem[header.value]" :label="header.text"></v-text-field>
                    <v-text-field v-else-if="header.value == 'imsi_range'" v-model="subs.editedItem[header.value]" :label="header.text"></v-text-field>
                    <v-switch v-else-if="header.value == 'used'" v-model="subs.editedItem[header.value]" color="success" :label="header.value" inset></v-switch>
                    <v-text-field v-else-if="header.value == 'imsi'" :rules="[rules.imsi]" v-model="subs.editedItem[header.value]" :label="header.text"></v-text-field>
                    <v-text-field v-else-if="header.value == 'smsc'" :rules="[rules.smsc]" v-model="subs.editedItem[header.value]" :label="header.text"></v-text-field>
                    <template v-else-if="header.value == 'mcc'">
                      <v-autocomplete v-if="translator !== null" :value="getSubMcc()" :items="translator.getKeyValues('countries')" item-text="value" item-value="key" multiple deletable-chips chips clearable label="MCC list" hint="Select MCC availability" color="primary" persistent-hint filled @input="setSubMcc($event)"></v-autocomplete>
                    </template>
                    <v-combobox v-else-if="header.value == 'key_id'" v-model="subs.editedItem[header.value]" :label="header.text" required :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" filled />
                    <v-text-field v-else-if="header.value == 'idx'" disabled v-model="subs.editedItem[header.value]" :label="header.text"></v-text-field>
                    <v-text-field v-else-if="header.value == 'ts'" disabled v-model="subs.editedItem[header.value]" :label="header.text"></v-text-field>

                    <template v-else-if="header.value == 'fplmn'">
                      <v-text-field v-model="subs.editedItem[header.value]" :label="header.text" :rules="[rules.fplmn]"></v-text-field>
                    </template>
                    <template v-else-if="header.value == 'ehplmn'">
                      <v-text-field v-model="subs.editedItem[header.value]" :label="header.text" :rules="[rules.ehplmn]"></v-text-field>
                    </template>
                    <template v-else-if="header.value == 'plmn'">
                      <v-text-field :rules="[rules.plmn]" v-model="subs.editedItem[header.value]" :label="header.text" append-outer-icon="mdi-calculator" @click:append-outer="act_dialog = true"></v-text-field>
                      <v-dialog :overlay-opacity="0.4" v-model="act_dialog" max-width="450px">
                        <v-card flat>
                          <v-card-title>
                            <span class="headline">Access Technology Calculator</span>
                          </v-card-title>

                          <v-card-text class="ma-0 pa-1">
                            <flo-plmn-act-calc v-if="act_dialog" value="0000" />
                          </v-card-text>

                          <v-card-actions>
                            <div class="flex-grow-1"></div>
                            <v-btn color="primary" text @click="act_dialog = false">Close</v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-dialog>
                    </template>

                    <v-text-field v-else v-model="subs.editedItem[header.value]" :label="header.text"></v-text-field>
                  </v-form>
                </v-col>
              </template>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="closeSubs">Cancel</v-btn>
          <v-btn v-if="canEditCardSubs()" color="primary" text @click="saveSubs">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :overlay-opacity="0.4" v-model="keys.dialog" scrollable max-width="800px">
      <template v-if="keys.permissions.c == true" v-slot:activator="{ on }">
        <v-btn color="primary" dark class="mb-2" v-on="on">New {{ keys.resource }}</v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="headline">{{ formKeysTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container fluid class="ma-0 pa-1">
            <v-row no-gutters>
              <template v-for="(header, i) in keys.headers">
                <v-col v-if="header.value != 'action'" :key="'hk' + i" cols="12" lg="6" xl="6" class="pa-2">
                  <v-form :readonly="!canEditCardKeys()">
                    <v-text-field v-if="header.value == 'id'" disabled v-model="keys.editedItem[header.value]" :label="header.text"></v-text-field>
                    <v-text-field v-else-if="header.value == 'idx'" disabled v-model="keys.editedItem[header.value]" :label="header.text"></v-text-field>
                    <v-text-field v-else-if="header.value == 'opc'" :rules="[rules.hex32]" v-model="keys.editedItem[header.value]" :label="header.text" :append-icon="opc ? 'mdi-eye' : 'mdi-eye-off'" autocomplete="off" @click:append="opc = !opc" :type="opc ? 'text' : 'password'"></v-text-field>
                    <v-text-field v-else-if="header.value == 'ki'" :rules="[rules.hex32]" v-model="keys.editedItem[header.value]" :label="header.text" :append-icon="ki ? 'mdi-eye' : 'mdi-eye-off'" autocomplete="off" @click:append="ki = !ki" :type="ki ? 'text' : 'password'"></v-text-field>

                    <v-text-field v-else-if="header.value == 'ts'" disabled v-model="keys.editedItem[header.value]" :label="header.text"></v-text-field>
                    <v-text-field v-else v-model="keys.editedItem[header.value]" :label="header.text"></v-text-field>
                  </v-form>
                </v-col>
              </template>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="closeKeys">Cancel</v-btn>
          <v-btn v-if="canEditCardKeys()" color="primary" text @click="saveKeys">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :overlay-opacity="0.4" v-model="keys.constraints_dialog" scrollable max-width="950px">
      <flo-ec-constraints :readonly="readonlystructure" :disabled="!canEditCardKeys()" :value="keys" @update="updateConstraints" @close-dialog="keys.constraints_dialog = $event" />
    </v-dialog>

    <v-dialog :overlay-opacity="0.4" v-model="subs.constraints_dialog" scrollable max-width="950px">
      <flo-ec-constraints :readonly="readonlystructure" :disabled="!canEditCardSubs()" :value="subs" @update="updateConstraints" @close-dialog="subs.constraints_dialog = $event" />
    </v-dialog>

    <v-dialog :overlay-opacity="0.4" v-model="settings.constraints_dialog" scrollable max-width="950px">
      <flo-ec-constraints :readonly="readonlystructure" :disabled="!canEditCardSettings()" :value="settings" @update="updateConstraints" @close-dialog="settings.constraints_dialog = $event" />
    </v-dialog>

    <v-dialog :overlay-opacity="0.4" v-model="keys.reset_dialog" persistent width="auto ">
      <v-card flat>
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
              <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"><span class="title text--primary">Are you sure you want to reset this record?</span> </v-col>
            </v-row>
            <v-row no-gutters justify="center">
              <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"><span class="body-1 text--primary">This will clear all key data.</span> </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="keys.reset_dialog = false">Cancel</v-btn>
          <v-btn color="primary" text @click="resetKeysItem()">Reset</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog :overlay-opacity="0.4" v-model="subs.reset_dialog" persistent width="auto ">
      <v-card flat>
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
              <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"><span class="title text--primary">Are you sure you want to reset this record?</span> </v-col>
            </v-row>
            <v-row no-gutters justify="center">
              <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"><span class="body-1 text--primary">This will clear all subscriber data.</span> </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="subs.reset_dialog = false">Cancel</v-btn>
          <v-btn color="primary" text @click="resetSubsItem()">Reset</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import floVirtualFieldTable from "~/components/virtual/floVirtualFieldTable.vue";
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  head() {
    return {
      title: this.title,
    };
  },
  name: "flo-applet-json",
  components: {
    floVirtualFieldTable,
  },
  data: () => ({
    helpers,
    rules: {
      required: (value) => !!value || "Required.",
      counter: (value) => value.length <= 20 || "Max 20 characters",
      email: (value) => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || "Invalid e-mail.";
      },
      imsi: (value) => {
        const pattern = /^[0-9]{15}$/;
        return pattern.test(value) || "Invalid IMSI format.";
      },
      smsc: (value) => {
        const pattern = /^[0-9]{0,32}$/;
        return pattern.test(value) || "Invalid SMSC format.";
      },
      used: (value) => {
        return (value >= 0 && value < 2) || "Invalid format.";
      },
      mnc_len: (value) => {
        return (value > 1 && value < 3) || "Invalid MNC len format.";
      },
      hex32: (value) => {
        const pattern = /^[0-9A-Fa-f]{32}$/;
        return pattern.test(value) || "Invalid key format.";
      },
      plmn: (v) => {
        const pattern = /^$|^([0-9]{5}[0-9Ff]{1}[0-9A-Fa-f]{4})(,([0-9]{5}[0-9Ff]{1}[0-9A-Fa-f]{4}))*$/;
        return pattern.test(v) || "Invalid PLMN format.";
      },
      ehplmn: (v) => {
        const pattern = /^$|^([0-9]{5}[0-9Ff]{1})(,([0-9]{5}[0-9Ff]{1}))*$/;
        return pattern.test(v) || "Invalid EHPLMN format.";
      },
      fplmn: (v) => {
        const pattern = /^$|^([0-9]{5}[0-9Ff]{1})(,([0-9]{5}[0-9Ff]{1}))*$/;
        return pattern.test(v) || "Invalid FPLMN format.";
      },
      mcc: (value) => {
        const pattern = /^[0-9A-Fa-f]{3}$/;
        return pattern.test(value) || "Invalid key format.";
      },
      dec1til10: (value) => {
        return (value > 0 && value <= 10) || "Invalid key format.";
      },
    },
    title: "Applet",
    json_version: 1,
    keys_version: 1,
    subs_version: 1,
    settings_version: 1,
    show_unused_keys: false,
    show_unused_subs: false,
    translator: null,
    selected_tab: 0,
    japplet: null,
    vf_hidden_filter: [],
    upload_vf_disabled: false,
    upload_vf_error: false,
    upload_vf_error_message: "",
    vf_version: 1,
    vf_data: [],
    ki: 0,
    opc: 0,
    act_dialog: false,
    subs: {
      resource: "applet_sub",
      resources: "applet_subs",
      permissions: { c: 0, r: 0, u: 0, d: 0 },
      lookup: "",
      dialog: false,
      meta: [],
      headers: [],
      records: [],
      constraints: [],
      constraint_search: "",
      constraint_headers: [],
      constraints_dialog: false,
      reset_dialog: false,
      editedIndex: -1,
      loading: true,
    },
    keys: {
      resource: "applet_key",
      resources: "applet_keys",
      permissions: { c: 0, r: 0, u: 0, d: 0 },
      lookup: "",
      dialog: false,
      meta: [],
      headers: [],
      records: [],
      constraints: [],
      constraint_search: "",
      constraint_headers: [],
      constraints_dialog: false,
      reset_dialog: false,
      editedIndex: -1,
      loading: true,
    },
    settings: {
      resource: "applet_setting",
      resources: "applet_settings",
      permissions: { c: 0, r: 0, u: 0, d: 0 },
      lookup: "",
      dialog: false,
      meta: [],
      headers: [],
      records: [],
      constraints: [],
      constraint_search: "",
      constraint_headers: [],
      constraints_dialog: false,
      editedIndex: -1,
      loading: true,
    },
  }),
  props: {
    value: {
      type: Object,
      required: true,
      default: null,
    },
    record: {
      type: Object,
      required: true,
      default: null,
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
    readonlystructure: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    formSubsTitle() {
      return this.subs.editedIndex === -1 ? "New " + this.subs.resource.replace("_", " ") : "Edit " + this.subs.resource.replace("_", " ");
    },
    formKeysTitle() {
      return this.keys.editedIndex === -1 ? "New " + this.keys.resource.replace("_", " ") : "Edit " + this.keys.resource.replace("_", " ");
    },
    formSettingsTitle() {
      return this.settings.editedIndex === -1 ? "New " + this.settings.resource.replace("_", " ") : "Edit " + this.settings.resource.replace("_", " ");
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    async initialize() {
      this.japplet = this.value;
      for (const [type, resource] of Object.entries(this.japplet.data.meta)) {
        this.loadResource(type, resource);
      }
      this.vf_hidden_filter = [
        {
          k: "rid",
          op: "equal",
          v: this.record.id,
        },
        {
          k: "resource",
          op: "equal",
          v: "applets",
        },
      ];
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      this.loadDbEnums(translator);
    },
    onLoadVfData(data) {
      this.vf_data = data.items;

      for (const header of data.headers) {
        switch (header.value) {
          case "id":
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "rid":
          case "resource":
            {
              header.view = false;
              header.edit = false;
              header.disable_new = true;
            }
            break;
          case "fields":
            {
              header.view = false;
              header.disable_new = true;
            }
            break;
          case "ui":
          case "gpath":
            {
              header.view = false;
            }
            break;
          case "offset": {
            header.text = "Number/Offset";
          }
        }
      }
    },
    onPreEditVf(data) {
      data.record.rid = this.record.id;
      data.record.resource = "applets";
    },
    onPreNewVf(data) {
      data.record.rid = this.record.id;
      data.record.resource = "applets";
    },
    getType(type) {
      let ltype = {
        color: "",
        type: "",
      };
      let l_type = "";
      if (type) {
        l_type = type.toLowerCase();
      }
      if (l_type == "binary") {
        ltype.color = "primary";
        ltype.type = "Binary";
      } else if (l_type == "record") {
        ltype.color = "info";
        ltype.type = "Record";
      }

      return ltype;
    },
    async upload() {
      if (this.importFile.length > 0) {
        for (const vfile of this.importFile) {
          if (vfile.hasOwnProperty("id")) {
            delete vfile.id;
          }

          vfile["rid"] = this.record.id;
          vfile["resource"] = "applets";

          try {
            let answer = await this.$axios.$post("/api/v1/vfile_definitions", vfile);
            if (answer != null) {
              this.tellUser("success", `File ID: ${answer.id}, File Name: ${answer.name} uploaded successfully.`);
            }
          } catch (err) {
            let lerr = this.parseNetError(err);
            this.tellUser("error", lerr);
          }
        }
        this.close();
        this.vf_version++;
      }
    },
    formatAppletType(type) {
      let f_type = "";
      if (type) {
        type = type.replace(/([A-Z])/g, "$1").trim();
        type = type.charAt(0).toUpperCase() + type.slice(1);
        type = type.replace("_", " ");
        f_type = type;
      }
      return f_type;
    },
    formatSettingsValue(item) {
      switch (item.name) {
        case "inactive_to":
        case "boot_wait_ota_to":
        case "boot_sleep_to":
        case "boot_disconnected_to":
        case "active_next_to":
        case "max_connect_to": {
          return helpers.formatTime(item.value);
        }
        case "report_data_dest": {
          return helpers.hexToIp(item.value);
        }
        default:
          return item.value;
      }
    },
    getSettingsValue(item) {
      switch (item.name) {
        case "inactive_to":
        case "boot_wait_ota_to":
        case "boot_sleep_to":
        case "boot_disconnected_to":
        case "active_next_to":
        case "max_connect_to": {
          return helpers.formatTime(item.value);
        }
        case "report_data_dest": {
          return helpers.hexToIp(item.value);
        }
        default:
          return item.value;
      }
    },
    setSettingsValue(item, event) {
      switch (item.name) {
        case "inactive_to":
        case "boot_wait_ota_to":
        case "boot_sleep_to":
        case "boot_disconnected_to":
        case "active_next_to":
        case "max_connect_to":
          {
            item.value = event.replaceAll(":", "");
          }
          break;
        case "report_data_dest":
          {
            item.value = helpers.ipToHex(event);
          }
          break;
        default:
          item.value = event;
      }
    },
    canEditCardSubs() {
      if (this.readonly) {
        return false;
      }

      if (this.subs.permissions.u == 1) {
        return true;
      }
      return false;
    },
    canEditCardKeys() {
      if (this.readonly) {
        return false;
      }
      if (this.keys.permissions.u == 1) {
        return true;
      }
      return false;
    },
    canEditCardSettings() {
      if (this.readonly) {
        return false;
      }
      if (this.settings.permissions.u == 1) {
        return true;
      }
      return false;
    },
    isKiOpcUsed(ki, opc) {
      if ("00000000000000000000000000000000" !== ki || "00000000000000000000000000000000" !== opc) {
        return true;
      }
      return false;
    },
    getKiOpcMask(kiopc) {
      if ("00000000000000000000000000000000" == kiopc) {
        return kiopc;
      } else {
        return "********************************";
      }
    },
    loadResource(type, resource) {
      let lheaders = [];
      let lcheaders = [];
      let leditedItem = {};
      let ldefaultItem = {};

      for (const key of Object.keys(resource.keys)) {
        let lheader = {
          text: "",
          align: "center",
          sortable: false,
          value: "",
          type: "",
        };
        if (key == "applet" || key == "id" || key == "ts") {
          continue;
        }
        if (key == "idx") {
          lheader.width = "5%";
        }
        lheader.value = key;
        lheader.text = resource.keys[key].desc;
        lheader.type = resource.keys[key].type;
        lheader.default = resource.keys[key].default;
        if (key == "used") {
          lheader.align = "left";
        }
        ldefaultItem[key] = lheader.default;

        if (lheader.type == "number") {
          leditedItem[key] = 0;
        } else {
          leditedItem[key] = "";
        }

        lheaders.push(lheader);
      }

      lheaders.push({
        text: "Actions",
        value: "action",
        sortable: false,
        align: "right",
      });

      for (const key of Object.keys(resource.constraints.ec[0])) {
        let lcheader = {
          text: "",
          align: "",
          sortable: false,
          value: "",
          type: "",
        };

        lcheader.text = key;
        lcheader.text = lcheader.text.replace(/([A-Z])/g, "$1").trim();
        lcheader.text = lcheader.text.charAt(0).toUpperCase() + lcheader.text.slice(1);
        lcheader.value = key;
        lcheaders.push(lcheader);
      }
      lcheaders.push({
        text: "Actions",
        value: "action",
        sortable: false,
        align: "right",
      });

      if (type == "keys") {
        this.keys.permissions = resource.crud;
        this.keys.headers = lheaders;
        this.keys.records = resource.records;
        this.keys.constraint_headers = lcheaders;
        this.keys.constraints = resource.constraints;
        this.keys.editedItem = leditedItem;
        this.keys.defaultItem = ldefaultItem;
        this.keys.loading = false;
      } else if (type == "subs") {
        this.subs.permissions = resource.crud;
        this.subs.headers = lheaders;
        this.subs.records = resource.records;
        this.subs.constraint_headers = lcheaders;
        this.subs.constraints = resource.constraints;
        this.subs.editedItem = leditedItem;
        this.subs.defaultItem = ldefaultItem;
        this.subs.loading = false;
      } else if (type == "settings") {
        this.settings.permissions = resource.crud;
        this.settings.headers = lheaders;
        this.settings.records = resource.records;
        this.settings.constraint_headers = lcheaders;
        this.settings.constraints = resource.constraints;
        this.settings.editedItem = leditedItem;
        this.settings.defaultItem = ldefaultItem;
        this.settings.loading = false;
      }
    },
    getBootMark() {
      let settings = this.settings.records.filter((s) => s.name == "boot_mark");
      if (settings.length == 0) {
        return 0;
      }
      return settings[0].value;
    },
    beutifyPlmn(plmn) {
      if (plmn.length < 11) {
        return plmn;
      }
      return `${plmn.substr(0, 11)}...`;
    },
    formatMcc(mcc) {
      let formatted = [];
      if (mcc.length > 0) {
        formatted = this.translator.getKeyValues("countries").reduce((acc, f) => {
          if (mcc.split(",").includes(f.key) && !acc.includes(f.value)) {
            acc.push(f.value);
          }
          return acc;
        }, []);

        if (formatted.length > 2) {
          formatted.splice(2, 0, "...");
          formatted = formatted.slice(0, 3);
        }
      }

      return formatted;
    },
    getSubMcc() {
      if (typeof this.subs.editedItem === "undefined") {
        return [];
      }

      let item = this.subs.editedItem;
      if (item === null) {
        return [];
      }

      if (!item.mcc) {
        return [];
      }
      return item.mcc.split(",");
    },
    setSubMcc(mcc) {
      console.log(`setSubMcc - set - mcc - ${JSON.stringify(mcc)}`);
      if (typeof this.subs.editedItem === "undefined") {
        console.log(`setSubMcc - set - this.subs.editedItem - undefined`);
        return;
      }

      let item = this.subs.editedItem;
      if (item === null) {
        console.log(`setSubMcc - set - item - null`);
        return;
      }

      // if (mcc.includes("FFF")) {
      //   this.subs.editedItem.mcc = "FFF";
      //   return;
      // }

      // for (let i = 0; i < 10; i++) {
      //   let key = `${i}FF`;
      //   let c = `${i}`;

      //   if (mcc.includes(key)) {
      //     mcc = mcc.filter((m) => !m.startsWith(c) || m == key);
      //   }
      // }

      let clean = mcc.filter((el) => el != "");
      let lmcc = clean.join(",");
      console.log(`setSubMcc - set - item - ${JSON.stringify(lmcc)}`);
      this.subs.editedItem.mcc = lmcc;
    },
    async loadDbEnums(translator) {
      if (!translator.exist("countries")) {
        let query = {
          select: {
            key: { k: "mcc" },
            value: { k: "country" },
          },
        };

        let array = [];
        try {
          array = await this.$axios.$post(`/api/v1/countries/list`, query);

          for (let i = 0; i < array.length; i++) {
            array[i].value = `${array[i].key}: ${array[i].value}`;
          }
        } catch (err) {
          console.log(`card - loadDbEnums - error - countries: ${err}`);
        }

        translator.setEnumEx("countries", array);
      }
      this.translator = translator;
    },
    updateSubsItem(item, reset) {
      this.subs.editedIndex = this.subs.records.indexOf(item);
      this.subs.editedItem = Object.assign({}, item);

      if (reset) {
        this.subs.reset_dialog = true;
      } else {
        this.subs.dialog = true;
      }
    },
    updateKeysItem(item, reset) {
      this.keys.editedIndex = this.keys.records.indexOf(item);
      this.keys.editedItem = Object.assign({}, item);

      if (reset) {
        this.keys.reset_dialog = true;
      } else {
        this.keys.dialog = true;
      }
    },
    resetSubsItem() {
      this.subs.editedItem.used = 0;
      this.subs.editedItem.name = "";
      this.subs.editedItem.imsi = "";
      this.subs.editedItem.imsi_range = 0;
      this.subs.editedItem.smsc = "";
      this.subs.editedItem.mcc = "";
      this.subs.editedItem.mnc = 2;
      this.subs.editedItem.plmn = "";
      this.subs.editedItem.apn = "";
      this.subs.editedItem.key_id = 1;
      this.subs.records[this.subs.editedIndex] = this.subs.editedItem;
      this.updateResource();
      this.subs_version++;
      this.json_version++;
      this.subs.reset_dialog = false;
      setTimeout(() => {
        this.subs.editedItem = Object.assign({}, this.subs.defaultItem);
        this.subs.editedIndex = -1;
      }, 300);
    },
    resetKeysItem() {
      this.keys.editedItem.ki = "00000000000000000000000000000000";
      this.keys.editedItem.opc = "00000000000000000000000000000000";
      this.keys.records[this.keys.editedIndex] = this.keys.editedItem;
      this.updateResource();
      this.keys_version++;
      this.json_version++;
      this.keys.reset_dialog = false;
      setTimeout(() => {
        this.keys.editedItem = Object.assign({}, this.keys.defaultItem);
        this.keys.editedIndex = -1;
      }, 300);
    },
    closeSubs() {
      this.subs.dialog = false;
      setTimeout(() => {
        this.subs.editedItem = Object.assign({}, this.subs.defaultItem);
        this.subs.editedIndex = -1;
      }, 300);
    },
    saveSubs() {
      if (this.subs.editedIndex > -1) {
        this.subs.records[this.subs.editedIndex] = this.subs.editedItem;
        this.updateResource();
        this.subs_version++;
        this.json_version++;
      }
      this.closeSubs();
    },
    closeKeys() {
      this.keys.dialog = false;
      setTimeout(() => {
        this.keys.editedItem = Object.assign({}, this.keys.defaultItem);
        this.keys.editedIndex = -1;
      }, 300);
    },
    saveKeys() {
      if (this.keys.editedIndex > -1) {
        this.keys.records[this.keys.editedIndex] = this.keys.editedItem;
        this.updateResource();
        this.keys_version++;
        this.json_version++;
      }
      this.closeKeys();
    },
    closeSettings() {
      this.settings.dialog = false;
      setTimeout(() => {
        this.settings.editedItem = Object.assign({}, this.settings.defaultItem);
        this.settings.editedIndex = -1;
      }, 300);
    },
    saveSettings() {
      if (this.settings.editedIndex == -1) {
        this.settings.records.push(this.settings.editedItem);
        this.updateResource();
      } else {
        this.settings.records[this.settings.editedIndex] = this.settings.editedItem;
        this.updateResource();
      }
      this.settings_version++;
      this.keys_version++;
      this.subs_version++;
      this.json_version++;
      this.closeSettings();
    },
    editSettingsItem(item) {
      this.settings.editedIndex = this.settings.records.indexOf(item);
      this.settings.editedItem = Object.assign({}, item);
      this.settings.dialog = true;
    },
    async updateConstraints() {
      this.updateResource();
    },
    updateResource() {
      this.$emit("update", this.japplet);
    },
    tabChange(event) {
      this.$emit("tab_changed", event);
    },
  },
};
</script>
