<template>
  <div class="flo-meta-table">
    <template v-if="meta_ready === true">
      <v-card :loader-height="3" :loading="loading" outlined class="ma-0 pa-0">
        <template v-if="$vuetify.breakpoint.smAndDown">
          <v-speed-dial v-model="fab" fixed bottom right direction="top" open-on-hover transition="slide-y-reverse-transition">
            <template v-slot:activator>
              <v-btn v-model="fab" color="accent" fab>
                <v-icon v-if="fab">mdi-close</v-icon>
                <v-icon v-else>mdi-orbit</v-icon>
              </v-btn>
            </template>
            <slot name="ex_new" :fab="true" :permissions="permissions" color="accent" :smAndDown="true"></slot>

            <v-btn v-if="permissions.c == true" :disabled="disableNew" fab small color="accent" @click="newItem()" :__qa="`${getResQATag()}@action@new`">
              <v-icon>mdi-plus</v-icon>
            </v-btn>

            <v-btn v-if="history_url != undefined" fab small color="accent" @click="historyItem(null)" :__qa="`${getResQATag()}@action@thistory`">
              <v-icon>mdi-history</v-icon>
            </v-btn>

            <v-btn v-if="local && permissions.u == true && local_import && !disabledEdit" fab small color="accent" @click="importDialog()" :__qa="`${getResQATag()}@action@import`">
              <v-icon left>mdi-file-import</v-icon>
            </v-btn>

            <v-btn v-if="local && local_export && !disableExport" :disabled="!records.length > 0" fab small color="accent" @click="exportData()" :__qa="`${getResQATag()}@action@export`">
              <v-icon left>mdi-file-export</v-icon>
            </v-btn>

            <v-btn v-if="exportable && !disabledEdit" @click="import_export_dialog = true" fab small color="accent" :__qa="`${getResQATag()}@action@import_export`">
              <v-icon left>mdi-file-sync</v-icon>
            </v-btn>

            <v-btn v-if="local && local_delete && permissions.d == true && records.length > 0 && !disabledEdit" fab small color="accent" @click="setDeleteAll()" :__qa="`${getResQATag()}@action@del`">
              <v-icon left>mdi-delete</v-icon>
            </v-btn>
          </v-speed-dial>
        </template>

        <v-container fluid class="ma-0 pa-0">
          <v-row v-if="show_title" no-gutters>
            <v-col cols="12" class="pa-1">
              <span :class="`${dense ? 'font-weight-regular subtitle-1' : 'font-weight-regular title'} ma-0 pa-0 mx-2`" v-text="cCapTitle"></span>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-meta-filter :show_filter="show_filter" :show_reload="show_reload" :show_search="show_search" :lookup="clookup" :refresh="refresh" :suspend="isAnyDialogOpen()" :unique="unique" :dense="dense" :meta="meta" :headers="headers" :translator="translator" :offset="doffset" :limit="dlimit" :count="count" :hidden_filter="hiddenFilter" :init_filter="init_filter" :resources="resources" @cancel="onCancel($event)" @onlookup="onLookup($event)" @onquerychange="onQueryChange($event)">
                <template v-slot:show_time_range>
                  <flo-time-range v-if="show_time_range" :__qa="`${getResQATag()}@action@search`" @onTimeChange="onTimeChange($event)" @onStartTimeChange="onStartTimeChange($event)" @onEndTimeChange="onEndTimeChange($event)" />
                </template>
                <template v-slot:extra>
                  <template v-if="$vuetify.breakpoint.mdAndUp">
                    <v-btn v-if="local && permissions.u == true && local_import && !disabledEdit" :small="dense" color="primary" @click="importDialog()" :__qa="`${getResQATag()}@action@import`">
                      <v-icon left>mdi-file-import</v-icon>
                      {{ `Import` }}
                    </v-btn>

                    <v-btn v-if="local && local_export && records.length > 0 && !disableExport" :small="dense" class="ml-1" color="primary" @click="exportData()" :__qa="`${getResQATag()}@action@export`">
                      <v-icon left>mdi-file-export</v-icon>
                      {{ `Export` }}
                    </v-btn>

                    <v-btn v-if="permissions.c == true && !disableNew" :small="dense" class="mx-1" color="primary" @click="newItem()" :__qa="`${getResQATag()}@action@new`">
                      <v-icon left>mdi-plus</v-icon>
                      {{ `New ${citem_title}` }}
                    </v-btn>
                    <v-btn v-if="local && local_delete && permissions.d == true && records.length > 0 && !disabledEdit" :small="dense" class="mr-1" color="primary" @click="setDeleteAll()" :__qa="`${getResQATag()}@action@del`">
                      <v-icon left>mdi-delete</v-icon>
                      {{ `Delete All` }}
                    </v-btn>

                    <v-btn v-if="history_url != undefined" :small="dense" class="mx-1" color="primary" @click="historyItem(null)" :__qa="`${getResQATag()}@action@thistory`"> <v-icon left>mdi-history</v-icon>History</v-btn>

                    <slot name="ex_new" :fab="false" :dense="dense" :permissions="permissions" color="primary" :smAndDown="false"></slot>
                    <v-btn v-if="exportable && !disableExport" @click="import_export_dialog = true" color="primary" :__qa="`${getResQATag()}@action@import_export`">
                      <v-icon left>mdi-file-sync</v-icon>
                      {{ importExportTitle() }}
                    </v-btn>
                  </template>
                </template>
              </flo-meta-filter>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12">
              <v-data-table :key="redraw" :value="value" @input="onSelectionChanged($event)" :headers="headers" :show-select="show_select" :single-select="single_select" :item-key="item_key" :page="dpage" hide-default-footer @page-count="onPageCount($event)" @pagination="onPagination($event)" @update:page="onUpdatePage($event)" @update:items-per-page="onUpdateItemsPerPage($event)" @item-selected="onItemSelected($event)" @toggle-select-all="onToggleSelectAll($event)" :footer-props="{ showFirstLastPage: true, firstIcon: 'mdi-chevron-double-left', lastIcon: 'mdi-chevron-double-right', prevIcon: 'mdi-chevron-left', nextIcon: 'mdi-chevron-right', 'items-per-page-options': ditems_per_page_options }" :items-per-page="ditems_per_page" :items="records" :sort-by="sortBy" :group-by="groupBy" :dense="dense" :disable-sort="disable_sort" calculate-widths multi-sort class="resourcetable elevation-0" :search="clookup" :mobile-breakpoint="960">
                <template v-slot:top> <slot name="top"></slot></template>
                <template v-slot:footer="data">
                  <v-container fluid class="ma-0 pa-0">
                    <v-row no-gutters justify="center" align="center" v-if="doffset == 0 && count < getMinItemsPerPage()">
                      <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
                        <v-card flat class="ma-0 pa-0">
                          <v-container fluid class="d-flex flex-nowrap align-center justify-center ma-0 pa-0">
                            <v-chip outlined small class="body-2">No more results available</v-chip>
                          </v-container>
                        </v-card>
                      </v-col>
                    </v-row>

                    <v-row no-gutters justify="center" align="center" v-else>
                      <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
                        <v-card outlined class="ma-0 pa-0">
                          <v-container fluid class="ma-0 pa-0">
                            <v-row no-gutters align="center" justify="center">
                              <v-col v-if="!(doffset == 0 && count < dlimit) && !local" :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
                                <v-container fluid class="d-flex flex-nowrap align-center justify-center ma-0 pa-0">
                                  <v-chip text-color="cappbar" small color="warning" class="body-2">Showing limited results</v-chip>
                                </v-container>
                              </v-col>

                              <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
                                <v-container fluid class="d-flex flex-nowrap align-center justify-center ma-0 pa-0">
                                  <v-select v-if="!local" style="width: 15em" class="body-2" required dense single-line hide-selected hide-details solo flat outlined v-model="dlimit" :items="getItemPageEnum(data.props.itemsPerPageOptions)" item-value="key" item-text="value" @change="onLimitChanged($event)" />

                                  <v-divider v-if="!single_page" inset vertical class="mx-2"></v-divider>
                                  <v-select v-if="!single_page" style="width: 14em" class="body-2" prefix="Show" suffix="items per page" required dense hide-details hide-selected single-line v-model="ditems_per_page" :items="getItemsPerPageOptions()" />
                                </v-container>
                              </v-col>

                              <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
                                <v-container fluid class="d-flex flex-nowrap align-center justify-center ma-0 pa-0">
                                  <v-btn
                                    v-if="!(doffset == 0 && count < dlimit) && !local"
                                    icon
                                    small
                                    color="primary"
                                    :disabled="loading || doffset == 0"
                                    @click="
                                      dpage = data.props.pagination.pageCount;
                                      doffset = doffset > dlimit ? doffset - dlimit : 0;
                                    "
                                  >
                                    <v-icon>mdi-skip-previous</v-icon>
                                  </v-btn>

                                  <v-chip small color="primary" class="body-2" :disabled="data.props.pagination.page == 1" @click="dpage = 1">
                                    {{ doffset + 1 }}
                                  </v-chip>

                                  <v-btn v-if="!single_page" icon small color="primary" :disabled="data.props.pagination.page == 1" @click="dpage = data.props.pagination.page <= 1 ? 1 : data.props.pagination.page - 1">
                                    <v-icon>{{ data.props.prevIcon }}</v-icon>
                                  </v-btn>

                                  <v-chip v-if="!single_page" outlined small class="body-2" color="primary">{{ data.props.pagination.pageStart + 1 + doffset }} ... {{ data.props.pagination.pageStop + doffset }}</v-chip>

                                  <span v-if="single_page" outlined small class="body-2 mx-2" color="primary"> ... </span>

                                  <v-btn v-if="!single_page" icon small color="primary" :disabled="data.props.pagination.page >= data.props.pagination.pageCount" @click="dpage = data.props.pagination.page >= data.props.pagination.pageCount ? data.props.pagination.pageCount : data.props.pagination.page + 1">
                                    <v-icon>{{ data.props.nextIcon }}</v-icon>
                                  </v-btn>
                                  <v-chip small color="primary" class="body-2" :disabled="data.props.pagination.page >= data.props.pagination.pageCount" @click="dpage = data.props.pagination.pageCount">
                                    {{ doffset + count }}
                                  </v-chip>

                                  <v-btn
                                    v-if="!(doffset == 0 && count < dlimit) && !local"
                                    icon
                                    small
                                    color="primary"
                                    :disabled="loading || count < dlimit"
                                    @click="
                                      doffset = doffset + dlimit;
                                      dpage = 1;
                                    "
                                  >
                                    <v-icon>mdi-skip-next</v-icon>
                                  </v-btn>
                                </v-container>
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-card>
                      </v-col>
                    </v-row>

                    <v-row no-gutters v-if="local_save_dirty && local" justify="end" align="center">
                      <v-col :cols="$vuetify.breakpoint.xs ? 6 : 'auto'" class="py-1">
                        <v-btn :small="dense" color="primary" @click="saveLocalChanges()">
                          <v-icon left>mdi-content-save</v-icon>
                          {{ "Save" }}
                        </v-btn>
                      </v-col>

                      <v-col :cols="$vuetify.breakpoint.xs ? 6 : 'auto'" class="py-1 px-1">
                        <v-btn :small="dense" color="primary" @click="cancelLocalChanges()">
                          <v-icon left>mdi-cancel</v-icon>
                          {{ "Cancel" }}
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-container>
                </template>

                <template v-slot:[`group.summary`]="group">
                  <slot name="group_summary" :small="dense" :group="group"> </slot>
                </template>

                <template v-slot:[`group.header`]="group">
                  <td :colspan="group.headers.length" class="text-start">
                    <v-container fluid class="ma-0 pa-0">
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-chip v-for="(grp, i) in group.groupBy" :key="i" label small class="body-2 mx-1">{{ grp }}: {{ group.items[0][grp] }}</v-chip>

                          <v-btn v-if="group.isOpen" icon small @click="group.toggle()">
                            <v-icon>mdi-chevron-down</v-icon>
                          </v-btn>

                          <v-btn v-else icon small @click="group.toggle()">
                            <v-icon>mdi-chevron-up</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-container>
                  </td>
                </template>

                <template v-slot:item="row">
                  <template v-if="$vuetify.breakpoint.mdAndUp">
                    <tr :__qa="getRowQATag(row)">
                      <td v-for="header in row.headers" :class="`text-${header.align}`" :key="`r${row.index}-${header.value}`" :__qa="getHeadQATag(header)">
                        <template v-if="header.value == 'action'">
                          <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                            <v-btn v-if="permissions.u == true && !disabledEdit" :small="dense" :class="`me-2 my-1`" color="primary" @click="editItem(row.item)" :__qa="`${getResQATag()}@action@edit`"> <v-icon left>mdi-pencil</v-icon>Edit </v-btn>
                            <v-btn v-else :small="dense" :class="`me-2 my-1`" color="primary" @click="viewItem(row.item)" :__qa="`${getResQATag()}@action@view`"> <v-icon left>mdi-more</v-icon>More </v-btn>
                            <v-btn v-if="permissions.d == true && !disabledEdit" :small="dense" :class="`me-2 my-1`" color="primary" @click="setDeleteItem(row.item)" :__qa="`${getResQATag()}@action@delete`">
                              <v-icon center>mdi-delete</v-icon>
                            </v-btn>
                            <v-btn v-if="history_url != undefined" :small="dense" :class="`me-2 my-1`" color="primary" @click="historyItem(row.item)" :__qa="`${getResQATag()}@action@rhistory`">
                              <v-icon center>mdi-history</v-icon>
                            </v-btn>
                            <v-btn v-if="permissions.u == true && !disabledEdit && local && local_updown" :disabled="row.index == 0" :small="dense" :class="`me-2 my-1`" color="primary" @click="elementUp(row.index)" :__qa="`${getResQATag()}@action@up`"> <v-icon>mdi-arrow-up-bold</v-icon></v-btn>
                            <v-btn v-if="permissions.u == true && !disabledEdit && local && local_updown" :disabled="row.index + 1 == records.length" :small="dense" :class="`me-2 my-1`" color="primary" @click="elementDown(row.index)" :__qa="`${getResQATag()}@action@down`"> <v-icon>mdi-arrow-down-bold</v-icon></v-btn>

                            <slot :name="`ex_actions`" :small="dense" :fmtindex="records.indexOf(row.item)" :fmtpermissions="permissions" :fmtheader="header" :fmtrow="row.item"></slot>
                          </v-container>
                        </template>

                        <template v-else-if="header.value == 'data-table-select'">
                          <v-simple-checkbox color="primary" :dense="dense" :ripple="false" :value="row.isSelected" @input="row.select($event)"></v-simple-checkbox>
                        </template>

                        <template v-else>
                          <slot :name="`view_${header.value}`" :fmtpermissions="permissions" :fmtheader="header" :fmtrow="row.item" :dense="dense">
                            <flo-meta-field v-model="row.item[header.value]" :header="header" :dense="dense"></flo-meta-field>
                          </slot>
                        </template>
                      </td>
                    </tr>
                  </template>

                  <template v-else>
                    <v-card outlined class="my-2 mx-2" :__qa="getRowQATag(row)">
                      <v-list :color="$vuetify.theme.dark ? (row.index % 2 == 0 ? '#FFFFFF0D' : '#00000000') : row.index % 2 == 0 ? '#0000000D' : '#00000000'" class="ma-0 pa-0">
                        <template v-for="header in row.headers">
                          <template v-if="header.value == 'action'">
                            <v-list-item :key="`r${row.index}-${header.value}`">
                              <v-list-item-content class="ma-0 pa-0">
                                <v-list-item-title>{{ header.text }}</v-list-item-title>
                              </v-list-item-content>
                              <v-list-item-action>
                                <v-container class="d-flex flex-row ma-0 pa-0">
                                  <v-btn v-if="permissions.u == true && !disabledEdit" fab small :class="`me-2 my-1`" color="primary" @click="editItem(row.item)" :__qa="`${getResQATag()}@action@edit`">
                                    <v-icon>mdi-pencil</v-icon>
                                  </v-btn>
                                  <v-btn v-else fab small :class="`me-2 my-1`" color="primary" @click="viewItem(row.item)" :__qa="`${getResQATag()}@action@view`">
                                    <v-icon>mdi-more</v-icon>
                                  </v-btn>
                                  <v-btn v-if="permissions.d == true && !disabledEdit" fab small :class="`me-2 my-1`" color="primary" @click="setDeleteItem(row.item)" :__qa="`${getResQATag()}@action@delete`">
                                    <v-icon center>mdi-delete</v-icon>
                                  </v-btn>
                                  <v-btn v-if="history_url != undefined" icon :class="`me-2 my-1`" color="primary" @click="historyItem(row.item)" :__qa="`${getResQATag()}@action@rhistory`">
                                    <v-icon center>mdi-history</v-icon>
                                  </v-btn>

                                  <v-btn v-if="permissions.u == true && !disabledEdit && local && local_updown" :disabled="row.index == 0" fab small :class="`me-2 my-1`" color="primary" @click="elementUp(row.index)" :__qa="`${getResQATag()}@action@up`"> <v-icon>mdi-arrow-up-bold</v-icon></v-btn>
                                  <v-btn v-if="permissions.u == true && !disabledEdit && local && local_updown" :disabled="row.index + 1 == records.length" fab small :class="`me-2 my-1`" color="primary" @click="elementDown(row.index)" :__qa="`${getResQATag()}@action@down`"> <v-icon>mdi-arrow-down-bold</v-icon></v-btn>

                                  <slot :name="`ex_actions`" :fmtindex="records.indexOf(row.item)" :fmtpermissions="permissions" :fmtheader="header" :fmtrow="row.item"></slot>
                                </v-container>
                              </v-list-item-action>
                            </v-list-item>
                          </template>
                          <template v-else-if="header.value == 'data-table-select'">
                            <v-list-item :key="`r${row.index}-${header.value}`" :__qa="getHeadQATag(header)">
                              <v-list-item-content class="ma-0 pa-0">
                                <v-list-item-subtitle>{{ header.text }}</v-list-item-subtitle>
                              </v-list-item-content>
                              <v-list-item-action>
                                <v-simple-checkbox color="primary" :dense="dense" :ripple="false" :value="row.isSelected" @input="row.select($event)"></v-simple-checkbox>
                              </v-list-item-action>
                            </v-list-item>
                            <v-divider :key="`d${row.index}-${header.value}`" class="mx-4"></v-divider>
                          </template>
                          <template v-else>
                            <v-list-item :key="`r${row.index}-${header.value}`" :__qa="getHeadQATag(header)">
                              <v-list-item-content class="ma-0 pa-0">
                                <v-list-item-subtitle>{{ header.text }}</v-list-item-subtitle>
                              </v-list-item-content>
                              <v-list-item-action>
                                <slot :name="`view_${header.value}`" :fmtpermissions="permissions" :fmtheader="header" :fmtrow="row.item">
                                  <flo-meta-field v-model="row.item[header.value]" :dense="dense" :header="header"></flo-meta-field>
                                </slot>
                              </v-list-item-action>
                            </v-list-item>
                            <v-divider :key="`d${row.index}-${header.value}`" class="mx-4"></v-divider>
                          </template>
                        </template>
                      </v-list>
                    </v-card>
                  </template>
                </template>

                <template v-slot:no-data>
                  <v-btn color="primary" :small="dense" @click="initialize">Reset</v-btn>
                </template>
              </v-data-table>
            </v-col>
          </v-row>
        </v-container>

        <v-dialog :overlay-opacity="0.4" v-model="dialog" scrollable :max-width="dialogWidth">
          <v-form class="ma-0 pa-0" @submit.prevent="save">
            <v-card v-if="dialog">
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <flo-meta-tree :tree-data="getHeaderTree(edit_headers)">
                        <template v-slot:item="{ item, idx }">
                          <template v-if="!hideDisabled(editedIndex, item)">
                            <slot :name="`edit_${item.value}`" :fmtheader="item" :fmtheaders="edit_headers" :fmtpermissions="permissions" :fmtrow="editedItem" :fmtidx="editedIndex">
                              <v-col v-if="item.value != 'action'" cols="12" lg="6" :key="idx">
                                <flo-meta-field-edit :__qa="`dialog@${getHeadQATag(item)}`" :translator="translator" :pattern="item.pattern" :disabled="disableEdit(editedIndex, item)" v-model="editedItem[item.value]" :header="item"></flo-meta-field-edit>
                              </v-col>
                            </slot>
                          </template>
                          <template v-else>
                            <div></div>
                          </template>
                        </template>
                      </flo-meta-tree>
                    </v-col>
                  </v-row>
                  <template v-if="attachments && !hideAttachments(editedIndex)">
                    <v-row>
                      <slot name="edit_attachments_ex" :fmtheaders="edit_headers" :fmtrow="editedItem" :fmtidx="editedIndex"></slot>
                    </v-row>
                  </template>
                </v-container>
              </v-card-text>

              <v-snackbar :timeout="4000" v-model="errorSnackbar" absolute color="error">
                <span>{{ errorMessage }}</span>
                <template v-slot:action="{ attrs }">
                  <v-btn icon v-bind="attrs" @click="errorSnackbar = false">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </template>
              </v-snackbar>

              <v-card-actions>
                <div class="flex-grow-1"></div>
                <v-btn color="primary" text @click="close" :__qa="`dialog@${getResQATag()}@action@cancel`">Cancel</v-btn>
                <v-btn v-if="allowSave()" color="primary" text type="submit" :__qa="`dialog@${getResQATag()}@action@save`">{{ local ? "OK" : "Save" }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>

        <v-dialog :overlay-opacity="0.4" v-model="deleteDialog" persistent width="auto ">
          <v-card>
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
                  <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"
                    ><span class="title text--primary">{{ deleteDialogTitle() }}</span>
                  </v-col>
                </v-row>
                <v-row no-gutters justify="center">
                  <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"><span class="body-1 text--primary">This action is final and cannot be undone!</span> </v-col>
                </v-row>
                <slot name="deleteResources" :itemForDeletion="itemForDeletion"></slot>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <div class="flex-grow-1"></div>
              <v-btn color="primary" :disabled="deleteLoader" text @click="cancelDelete()" :__qa="`dialog@${getResQATag()}@action@cancel`">Cancel</v-btn>
              <v-btn color="primary" :loading="deleteLoader" :disabled="deleteLoader" text @click="deleteItem()" :__qa="`dialog@${getResQATag()}@action@delete`">Delete</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog :overlay-opacity="0.4" v-model="deleteAllDialog" persistent width="auto ">
          <v-card>
            <v-card-title>{{ deleteAllDialogTitle() }}</v-card-title>
            <v-card-actions>
              <div class="flex-grow-1"></div>
              <v-btn color="primary" :disabled="deleteLoader" text @click="deleteAllDialog = false" :__qa="`dialog@${getResQATag()}@action@cancel`">Cancel</v-btn>
              <v-btn color="primary" :loading="deleteLoader" :disabled="deleteLoader" text @click="deleteAllItems()" :__qa="`dialog@${getResQATag()}@action@deleteAll`">Delete</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog :overlay-opacity="0.4" v-model="uploadDialog" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">Upload {{ citem_title }} Files</span>
            </v-card-title>

            <v-card-text>
              <v-container fluid class="ma-0 pa-0">
                <v-row no-gutters>
                  <v-col cols="12">
                    <blockquote class="blockquote">
                      Note: File type is JSON. Accepts <code>{{ citem_title.toLowerCase() }}</code> data with the following parameters: <code>"name", "description", "hint", "default", "origin", "type", "required"</code>.
                    </blockquote>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-file-input :error="upload_error" :error-messages="upload_error_message" accept=".json" label="Select File" :clearable="false" @change="importChanged($event)" :key="componentKey" :truncate-length="$vuetify.breakpoint.xs ? 25 : 50" outlined dense></v-file-input>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <div class="flex-grow-1"></div>
              <v-btn color="primary" text @click="closeImport()">Cancel</v-btn>
              <v-btn color="primary" :disabled="upload_disabled" text @click="importData()">Import</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog :overlay-opacity="0.4" v-model="import_export_dialog" scrollable persistent width="unset">
          <flo-imp-exp :export_limit="ditems_per_page" :headers="headers" :hidden_filter="hidden_filter" :accept="accept" :resources="resources" :module="module" :permissions="permissions" :local_permissions="local_permissions" :isolated="isolated" :header_map="header_map" :pkeys="pkeys" :local="local" :can_import="can_import" :can_export="can_export" :external_data="external_data" :external="external" @fetch="onImportExportFetch($event)" @create="onImportExportCreate($event)" @update="onImportExportUpdate($event)" @delete="onImportExportDelete($event)" @cancel="onImportExportCancel()" @on_tab_imp_change="onImportTabChange($event)" @on_tab_imp_exp_change="onImportExportTabChange($event)" @export-data="onExportData($event)">
            <template v-slot:external="{}">
              <slot name="external" :import_export_tabs="import_export_tabs" :import_export_dialog="import_export_dialog"></slot>
            </template>
            <template v-slot:external_action="{}">
              <slot name="external_action"></slot>
            </template>
          </flo-imp-exp>
        </v-dialog>
      </v-card>
    </template>
  </div>
</template>
<script>
import floMetaFieldEdit from "~/components/crud/floMetaFieldEdit.vue";
import floMetaFilter from "~/components/crud/floMetaFilter.vue";
import floMetaField from "~/components/crud/floMetaField.vue";
import floMetaTree from "~/components/crud/floMetaTree.vue";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
import { mapActions, mapGetters } from "vuex";
export default {
  name: "flo-meta-table",
  head() {
    return {
      title: this.cCapTitle,
    };
  },
  props: {
    accept: {
      type: String,
      default: ".csv, .json",
      required: false,
    },
    redraw: {
      type: Number,
      required: false,
      default: 1,
    },
    module: {
      type: String,
      required: false,
    },
    resources: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    item_title: {
      type: String,
      required: false,
    },
    limit: {
      type: Number,
      required: false,
      default: 15,
    },
    offset: {
      type: Number,
      required: false,
      default: 0,
    },
    items_per_page: {
      type: Number,
      required: false,
      default: 15,
    },
    single_page: {
      type: Boolean,
      required: false,
      default: true,
    },
    hidden_filter: {
      type: [Array],
      required: false,
    },
    init_filter: {
      type: [Array],
      required: false,
    },
    show_title: {
      type: Boolean,
      required: false,
      default: true,
    },
    show_filter: {
      type: Boolean,
      required: false,
      default: true,
    },
    show_reload: {
      type: Boolean,
      required: false,
      default: true,
    },
    show_search: {
      type: Boolean,
      required: false,
      default: true,
    },
    show_select: {
      type: Boolean,
      required: false,
      default: false,
    },
    show_time_range: {
      type: Boolean,
      required: false,
      default: false,
    },
    single_select: {
      type: Boolean,
      required: false,
      default: false,
    },
    disable_sort: {
      type: Boolean,
      required: false,
      default: false,
    },
    item_key: {
      type: String,
      required: false,
    },
    sortBy: {
      type: [Array, String],
      required: false,
    },
    groupBy: {
      type: [Array, String],
      required: false,
    },
    translator: {
      type: [Object],
      required: false,
      default: null,
    },
    lookup: {
      type: String,
      required: false,
    },
    history_url: {
      type: String,
      required: false,
    },
    history_param: {
      type: String,
      required: false,
    },
    dense: {
      type: Boolean,
      required: false,
      default: false,
    },
    disableNew: {
      type: Boolean,
      required: false,
      default: false,
    },
    disableExport: {
      type: Boolean,
      required: false,
      default: false,
    },
    disabledEdit: {
      type: Boolean,
      required: false,
      default: false,
    },
    attachments: {
      type: Boolean,
      required: false,
      default: false,
    },
    deleteResources: {
      type: [Object],
      required: false,
      default: null,
    },
    dialogWidth: {
      type: String,
      required: false,
      default: "800px",
    },
    value: {
      type: Array,
      required: false,
      default: () => [],
    },
    unique: {
      type: String,
      required: false,
      default: "1",
    },
    refresh: {
      type: Number,
      required: false,
      default: 0,
    },
    local: {
      type: Boolean,
      required: false,
      default: false,
    },
    local_meta: {
      type: [Object],
      required: false,
    },
    local_data: {
      type: [Array],
      required: false,
    },
    local_permissions: {
      type: [Object],
      required: false,
    },
    local_updown: {
      type: Boolean,
      required: false,
      default: false,
    },
    local_export: {
      type: Boolean,
      required: false,
      default: false,
    },
    local_import: {
      type: Boolean,
      required: false,
      default: false,
    },
    local_delete: {
      type: Boolean,
      required: false,
      default: false,
    },
    import_export: {
      type: Boolean,
      required: false,
      default: false,
    },
    header_map: {
      type: Array,
      required: false,
      default: () => [],
    },
    pkeys: {
      type: Array,
      required: false,
      default: () => [],
    },
    external: {
      type: Boolean,
      required: false,
      default: false,
    },
    external_data: {
      type: Array,
      required: false,
      default: () => [],
    },
    can_export: {
      type: Boolean,
      required: false,
      default: true,
    },
    can_import: {
      type: Boolean,
      required: false,
      default: true,
    },
    main_resource: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data: function () {
    return {
      permissions: { c: 0, r: 0, u: 0, d: 0 },
      fab: false,
      count: 0,
      dlookup: this.lookup,
      dpage: 1,
      dlimit: 40,
      doffset: 0,
      ditems_per_page: 10,
      ditems_per_page_options: [10, 15, 30, 40, 50, 100],
      dialog: false,
      meta_ready: false,
      meta: {
        primary: "id",
      },
      headers: [],
      edit_headers: [],
      records: [],
      selected_records: [],
      editedIndex: -1,
      editedItem: {},
      defaultItem: {},
      loading: true,
      errorMessage: "",
      errorSnackbar: false,
      deleteDialog: false,
      deleteAllDialog: false,
      deleteLoader: false,
      hiddenFilter: [],
      itemForDeletion: [],
      query: {
        page: {
          limit: this.limit,
          offset: 0,
        },
      },
      local_save_dirty: false,
      local_records: [],
      componentKey: 0,
      importFile: {},
      upload_error: false,
      upload_error_message: "",
      upload_disabled: false,
      uploadDialog: false,
      import_export_dialog: false,
      exportable: false,
      isolated: false,
      import_export_tabs: 0,
    };
  },
  components: {
    floMetaField,
    floMetaFieldEdit,
    floMetaFilter,
    floMetaTree,
    floImpExp: () => import("./floImpExp.vue"),
  },
  mixins: [parseNetError, tellUser],
  computed: {
    clookup: {
      get() {
        return this.dlookup;
      },
      set(param) {
        this.dlookup = param;
      },
    },
    cCapTitle() {
      let t = this.ctitle;
      if (typeof t === "undefined") return "";
      if (t === "") return "";
      return t;
    },
    ctitle: {
      get() {
        let title = "";
        if (typeof this.resources !== "undefined" && this.resources !== "") {
          title = this.resources;
        }
        if (this.meta.hasOwnProperty("screen_name")) {
          title = this.meta.screen_name;
        }
        if (typeof this.title === "undefined") {
          return title;
        }
        if (this.title !== "") {
          title = helpers.capitalizeAllFLetter(this.title, "_");
        }
        return title;
      },
    },
    citem_title() {
      let title = "";
      if (typeof this.resources !== "undefined" && this.resources !== "") {
        title = this.resources;
      }
      if (this.meta.hasOwnProperty("item_name")) {
        title = this.meta.item_name;
      }
      if (typeof this.item_title === "undefined") {
        return title;
      }
      if (this.item_title !== "") {
        title = helpers.capitalizeAllFLetter(this.item_title, "_");
      }
      return title;
    },
    formTitle() {
      if (this.permissions.u) {
        return this.editedIndex === -1 ? "New " + this.citem_title : "Edit " + this.citem_title;
      }
      return this.editedIndex === -1 ? "New " + this.citem_title : "View " + this.citem_title;
    },
    isEdit() {
      return this.editedIndex === -1 ? false : true;
    },
    ...mapGetters({
      getPermissions: "session/permissions",
      routerCache: "session/routerCache",
    }),
  },
  watch: {
    translator(val) {
      if (val != null) {
        for (let i = 0; i < this.records.length; i++) {
          this.records[i] = val.toUI(this.records[i]);
        }
      }
    },
    dialog(val) {
      val || this.close();
    },
    hidden_filter: {
      immediate: true,
      handler(val) {
        this.hiddenFilter = val;
      },
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    onImportExportFetch(event) {
      if (this.local) {
        let l_records = this.records;
        event.pms = new Promise((res) => {
          res(l_records);
        });
      } else {
        let l_query = JSON.parse(JSON.stringify(this.query));
        l_query["page"] = { limit: event.limit, offset: event.offset };
        event.pms = this.$axios.$post(`/api/v1/${this.resources}/list`, l_query);
      }

      return event;
    },
    onImportExportCreate(event) {
      this.$emit("pre-import-export-create", event);
      if (this.local) {
        if (event.hasOwnProperty("data")) {
          if (event.hasOwnProperty("type")) {
            let l_type = event.type;
            if (l_type.startsWith("campaign_participants")) {
              this.local_records.push(event.data);
              this.records = this.local_records;
              event.pms = event.data;
            } else {
              this.local_save_dirty = true;
              this.local_records.push(event.data);
              this.records = this.local_records;
              event.pms = async () => await event.data;
            }
            this.updateCount(this.records.length);
          }
        }
      } else {
        event.pms = this.$axios.$post(`/api/v1/${this.resources.toLowerCase()}`, event.data);
      }
      this.$emit("import-export-create", event);
      return event;
    },
    onImportExportUpdate(event) {
      this.$emit("pre-import-export-update", event);
      event.pms = this.onImportExportAction(event, "update");

      return event;
    },
    onImportExportDelete(event) {
      this.$emit("pre-import-export-delete", event);
      event.pms = this.onImportExportAction(event, "delete");

      return event;
    },
    async onImportExportAction(event, action) {
      let l_pkeys = event.pkeys;
      let l_event_data = event.data;
      let l_result = null;
      let l_id = 0;
      if (l_event_data.hasOwnProperty("id")) {
        l_id = l_event_data.id;
      } else {
        let l_where = l_pkeys.map((m) => {
          return {
            k: m,
            op: "equal",
            v: l_event_data[m],
          };
        });
        let l_query = {
          select: { id: {} },
          where: l_where,
        };

        let l_data = await this.$axios.$post(`/api/v1/${this.resources}/list`, l_query);

        if (l_data.length > 0) {
          l_event_data["id"] = l_data[0].id;
          l_id = l_data[0].id;
        }
      }

      if (action == "update") {
        l_result = await this.$axios.$put(`/api/v1/${this.resources}/${l_id}`, l_event_data);
      } else if (action == "delete") {
        if (l_event_data.hasOwnProperty("delete_keys")) {
          let body = {
            params: {
              delete_keys: l_event_data.delete_keys,
            },
          };
          l_result = await this.$axios.$delete(`/api/v1/${this.resources}/${l_id}`, body);
        } else {
          l_result = await this.$axios.$delete(`/api/v1/${this.resources}/${l_id}`);
        }
      }

      return l_result;
    },
    onImportExportCancel() {
      if (!this.local) {
        this.loadData();
      }
      this.$emit("import-export-cancel");
      this.import_export_dialog = false;
      this.import_export_tabs = 0;
    },
    onImportTabChange(event) {
      this.import_export_tabs = event;
      this.$emit("import-tab-change");
    },
    onImportExportTabChange(event) {
      this.$emit("import-export-tab-change", event);
    },
    onCancel(event) {
      if (!event) {
        this.doffset = 0;
      }
    },
    onExportData(event) {
      this.$emit("export-data", event);
    },
    updateCount(len) {
      this.count = len;
    },
    exportData() {
      let l_export = {
        type: `${this.module}_${this.resources}`,
        data: this.records,
      };

      if (l_export.data.length > 0) {
        this.$emit("export-data", l_export);
      }
    },
    importDialog() {
      this.uploadDialog = true;
    },
    importChanged(event) {
      if (!event) {
        console.log(`flo-meta-table - importChanged - undefined event`);
        return;
      }

      helpers
        .readFileAsText(event)
        .then((content) => {
          this.importFile = JSON.parse(content);
          this.upload_error = false;
          this.upload_disabled = false;
          this.upload_error_message = "";
        })
        .catch((err) => {
          let lerr = this.parseNetError(err);
          this.upload_error = true;
          this.upload_disabled = true;
          this.upload_error_message = "Field accepts only JSON files.";
          this.tellUser("error", lerr);
        });
    },
    importData() {
      console.log(`flo-meta-table - importData - enter`);
      let l_type = this.resources;
      console.log(`flo-meta-table - importData - l_type:${l_type}`);

      if (this.importFile.hasOwnProperty("data") && this.importFile.hasOwnProperty("type")) {
        if (this.importFile.data.length > 0 && this.importFile.type.includes(l_type)) {
          this.records = this.importFile.data;
          this.updateCount(this.records.length);
          this.closeImport();
          this.local_save_dirty = true;
          this.$emit("post-import");
        } else {
          this.upload_error = true;
          this.upload_disabled = true;
          this.upload_error_message = `Field only accepts files with ${l_type} data.`;
        }
      }
    },
    closeImport() {
      this.uploadDialog = false;
      this.componentKey++;
      this.upload_error = false;
      this.upload_disabled = false;
      this.upload_error_message = "";
    },
    importExportTitle() {
      return (this.can_import ? "Import" : "") + (this.can_import && this.can_export ? "/" : "") + (this.can_export ? "Export" : "");
    },
    elementUp(idx) {
      this.elementMove(idx, idx - 1);
    },
    elementDown(idx) {
      this.elementMove(idx, idx + 1);
    },
    elementMove(from, to) {
      let item = this.records.splice(from, 1)[0];

      this.records.splice(to, 0, item);
      this.records.forEach((r, i) => {
        r.pos = i + 1;
      });
      this.local_save_dirty = true;
      this.$emit("element-move");
    },
    getItemPageEnum(items) {
      return items.map((m) => {
        return { key: m, value: `Limit To ${m} Results` };
      });
    },
    onLookup(event) {
      this.clookup = event;
    },
    isAnyDialogOpen() {
      return this.dialog || this.deleteDialog;
    },
    getRowQATag(row) {
      let lres_qa = this.getResQATag();
      if (!lres_qa) {
        return undefined;
      }
      if (!this.meta.hasOwnProperty("indexes")) {
        return undefined;
      }
      if (!this.meta.indexes.hasOwnProperty("primary")) {
        return undefined;
      }
      // TODO: we need to go over all the primary key fields and concatenate tham to one unique value
      if (!this.meta.indexes.primary.hasOwnProperty("0")) {
        return undefined;
      }
      let pk = this.meta.indexes.primary["0"];
      if (!row.item.hasOwnProperty(pk)) {
        return undefined;
      }

      let lrow_qa_tag = `${lres_qa}@row@${row.item[pk]}`;
      return lrow_qa_tag;
    },
    getHeadQATag(header) {
      return `${this.getResQATag()}@${header.value}`;
    },
    getResQATag() {
      return this.resources.toLowerCase();
    },
    ...mapActions({
      clearResourceCache: "session/clearResourceCache",
    }),
    select(row) {
      this.$emit("item-selected", row);
    },
    getTdClass(header, mobile) {
      if (mobile) {
        return "v-data-table__mobile-row";
      } else {
        return `text-${header.align}`;
      }
    },
    getHeaderTree(headers) {
      // create root
      let root = {
        gkey: "",
      };

      for (let ih = 0; ih < headers.length; ih++) {
        // get next header
        const h = headers[ih];
        // point iterator to root
        let it = root;
        // if it has path (i.e. not root header)
        if (h.hasOwnProperty("gpath")) {
          // split the path to branches
          let gpath = h.gpath;
          let gpath_arr = gpath.split("/");

          // traverse over the branches
          // "" is the root
          // "", "sub1", "sub2"

          const lbranches = gpath_arr.length;
          for (let igbk = 0; igbk < lbranches; igbk++) {
            // get branch key
            const lgbk = gpath_arr[igbk];

            if (it.gkey == lgbk) {
              continue;
            }

            // create children if needed
            if (!it.hasOwnProperty("children")) {
              it["children"] = [];
            }

            // get children
            let children = it["children"];

            // find gkey
            let founds = children.filter((c) => c.gkey == lgbk);
            if (founds.length > 0) {
              it = founds[0];
            } else {
              it = { gkey: lgbk };
              children.push(it);
            }
          }
        }

        if (!it.hasOwnProperty("items")) {
          it["items"] = [];
        }
        if (h.hasOwnProperty("spath")) {
          root["spath"] = h.spath;
        }
        it.items.push(h);
      }

      return root;
    },
    getMinItemsPerPage() {
      return this.ditems_per_page_options[0];
    },
    getItemsPerPageOptions() {
      return this.ditems_per_page_options;
    },
    cancelLocalChanges() {
      let l_change = {
        records: this.records,
      };
      this.$emit("cancel-local-changes", l_change);
      this.records = l_change.records;
      this.updateCount(this.records.length);
      this.local_save_dirty = false;
    },
    saveLocalChanges() {
      let l_change = {
        records: this.records,
      };
      this.$emit("save-local-changes", l_change);
      this.local_save_dirty = false;
    },
    async initialize() {
      let l_query = JSON.parse(localStorage.getItem("query"));
      if (l_query && l_query.resource == this.resources.toLowerCase()) {
        this.dlimit = l_query.page.limit;
        this.doffset = l_query.page.offset;
      } else {
        this.dlimit = +this.limit;
        this.doffset = +this.offset;
      }
      if (this.single_page) {
        this.ditems_per_page = this.dlimit;
      } else {
        this.ditems_per_page = parseInt(`${this.items_per_page}`);
      }

      let user_permissions = this.getPermissions;
      if (this.local) {
        console.log(`flo-meta-table - initialize - permissions - local`);

        if (!this.local_permissions) {
          this.permissions = { res: this.resources.toLowerCase(), c: false, r: false, u: false, d: false, e: false };
        } else {
          this.permissions = this.local_permissions;
        }
      } else {
        console.log(`flo-meta-table - initialize - permissions - NOT local`);
        this.permissions = user_permissions.find((p) => this.resources == p.res);
      }

      if (this.import_export) {
        this.exportable = this.import_export;
      }

      console.log(`flo-meta-table - initialize - permissions - search:${this.resources.toLowerCase()} found:${JSON.stringify(this.permissions)}`);

      if (!this.show_filter) {
        await this.loadData();
      } else {
        await this.loadMeta();
      }
    },
    async onQueryChange(query) {
      let l_query = null;

      if (query.page.offset != 0 || query.page.limit != this.limit) {
        query["resource"] = this.resources.toLowerCase();
        localStorage.setItem("query", JSON.stringify(query));
        l_query = JSON.parse(localStorage.getItem("query"));
      } else {
        if (this.main_resource) {
          localStorage.removeItem("query");
        }
        l_query = query;
      }

      this.query = l_query;
      await this.loadData();
      this.$emit("query_change", this.query);
    },
    getResourceUrl() {
      let lurl = "";
      if (typeof this.module !== "undefined") {
        lurl += `${this.module.toLowerCase()}/`;
      }
      lurl += `${this.resources.toLowerCase()}`;

      return lurl;
    },
    getMetaCache(meta_url) {
      // console.log(`getMetaCache: ${meta_url} search ..`);
      let url = this.$router.currentRoute.path;
      if (url === "") {
        return null;
      }

      let lrcache = this.routerCache;
      let lcache = lrcache[url];

      if (typeof lcache === "undefined") {
        // console.log(`getMetaCache: ${meta_url} no cache ..`);
        return null;
      }

      if (!lcache.hasOwnProperty("metas")) {
        // console.log(`getMetaCache: ${meta_url} no meta ..`);
        return null;
      }

      if (!lcache.metas.hasOwnProperty(meta_url)) {
        // console.log(`getMetaCache: ${meta_url} no meta url ..`);
        return null;
      }
      // console.log(`getMetaCache: ${meta_url} found ..`);
      return lcache.metas[meta_url];
    },
    setMetaCache(meta_url, meta) {
      // console.log(`setMetaCache: ${meta_url} search ..`);
      let url = this.$router.currentRoute.path;
      if (url === "") {
        return null;
      }

      let lrcache = this.routerCache;
      let lcache = lrcache[url];

      if (typeof lcache === "undefined") {
        lcache = {};
        lrcache[url] = lcache;
      }

      if (!lcache.hasOwnProperty("metas")) {
        lcache["metas"] = {};
      }

      if (!lcache.metas.hasOwnProperty(meta_url)) {
        lcache.metas[meta_url] = meta;
      }
      return meta;
    },
    async loadMeta() {
      let lmeta = null;
      if (this.local) {
        lmeta = this.local_meta;
        // console.log(`flo-meta-table - local - ${JSON.stringify(lmeta)}`);

        if (!lmeta) {
          lmeta = {
            crud: {
              c: false,
              d: false,
              r: false,
              u: false,
            },

            indexes: {},

            isolated: true,
            item_name: this.resources.toLowerCase(),
            limit: 100,
            screen_name: this.resources.toLowerCase(),
            group: "none",
            table: "none",
            keys: {},
          };
        }
      } else {
        let lmeta_url = `/api/v1/${this.getResourceUrl()}/meta`;
        lmeta = this.getMetaCache(lmeta_url);
        if (lmeta === null) {
          try {
            this.loading = true;
            lmeta = await this.$axios.$get(lmeta_url);

            // add support for non auto id primary keys
            lmeta["primary"] = "id";
            if (lmeta.hasOwnProperty("indexes")) {
              if (lmeta.indexes.hasOwnProperty("primary")) {
                if (lmeta.indexes.primary.length > 0) {
                  lmeta["primary"] = lmeta.indexes.primary[0];
                }
              }
            }
            this.setMetaCache(lmeta_url, lmeta);
          } catch (err) {
            let lerr = this.parseNetError(err);
            console.log(`crud table: meta - fail: ${lerr.statusCode} - ${lerr.message}`);
            this.tellUser("error", `${lerr.statusCode} - ${lerr.message}`);

            this.loading = false;
            return;
          }
        }
      }

      this.meta_ready = true;
      this.loading = false;

      return lmeta;
    },
    async loadData() {
      let lmeta = await this.loadMeta();
      let lheaders = [];
      let leditedItem = {};
      let ldefaultItem = {};
      let llist = {
        query: this.query,
      };

      let l__qa = undefined;

      if (lmeta.hasOwnProperty("__qa")) {
        l__qa = lmeta.__qa;
      }

      console.log(`flo-meta-table - query - ${JSON.stringify(this.query)}`);
      console.log(`flo-meta-table - permissions - ${JSON.stringify(this.permissions)}`);

      this.$emit("query", llist.query);

      // build table headers
      for (const key of Object.keys(lmeta.keys)) {
        let lheader = {
          text: "",
          align: "",
          sortable: true,
          value: "",
          type: "",
          pattern: "",
          mask: "",
          auto: false,
          grp: "",
          disable_edit: this.permissions.u ? false : true,
          disable_new: this.permissions.c ? false : true,
          view: true,
          edit: true,
          __qa: "",
        };

        if (llist.query.hasOwnProperty("select")) {
          if (false == llist.query.select.hasOwnProperty(key)) {
            lheader.view = false;
            lheader.edit = false;
          }
        }

        lheader.value = key;
        lheader.text = lmeta.keys[key].desc;
        lheader.type = lmeta.keys[key].type;
        lheader.default = lmeta.keys[key].default;
        lheader.pattern = lmeta.keys[key].pattern;

        if (lmeta.keys[key].hasOwnProperty("__qa")) {
          lheader.__qa = `${l__qa}@${lmeta.keys[key].__qa}`;
        }

        if (lmeta.keys[key].hasOwnProperty("auto")) {
          lheader["auto"] = lmeta.keys[key].auto;
        }
        if (lmeta.keys[key].hasOwnProperty("nullable")) {
          lheader["nullable"] = lmeta.keys[key].nullable;
        }
        if (lmeta.keys[key].hasOwnProperty("min")) {
          lheader["min"] = lmeta.keys[key].min;
        }
        if (lmeta.keys[key].hasOwnProperty("max")) {
          lheader["max"] = lmeta.keys[key].max;
        }
        if (lmeta.keys[key].hasOwnProperty("hint")) {
          lheader["hint"] = lmeta.keys[key].hint;
        }

        if (lmeta.keys[key].hasOwnProperty("enum")) {
          lheader["enum"] = lmeta.keys[key].enum;
        }

        if (lmeta.keys[key].hasOwnProperty("tags")) {
          lheader["tags"] = lmeta.keys[key].tags;
        }

        // add default value
        if (typeof lheader.default === "undefined") {
          ldefaultItem[key] = null;
        } else {
          ldefaultItem[key] = lheader.default;
        }
        if (lheader.type == "number" || lheader.type == "boolean") {
          leditedItem[key] = 0;
        } else {
          leditedItem[key] = "";
        }
        lheaders.push(lheader);
      }

      // push action headers
      lheaders.push({
        text: "Actions",
        value: "action",
        sortable: false,
        align: "center",
        type: "action",
        disable_edit: this.permissions.u ? false : true,
        disable_new: this.permissions.c ? false : true,
        view: true,
        edit: false,
      });

      // if has attachments
      if (this.attachments) {
        lheaders.push({
          text: "Attachments",
          value: "attach",
          sortable: false,
          align: "center",
          type: "attach",
          disable_edit: this.permissions.u ? false : true,
          disable_new: false,
          view: false,
          edit: true,
        });
      }

      let ldata;
      try {
        if (this.local) {
          ldata = this.local_data;
          if (!ldata) {
            ldata = [];
          }
        } else {
          this.loading = true;
          ldata = await this.$axios.$post(`/api/v1/${this.getResourceUrl()}/list`, llist.query);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", `List: ${lerr.statusCode} - ${lerr.message}`);
        console.log(`crud table: list - fail: ${lerr.statusCode} - ${lerr.message}`);
        this.loading = false;
        return;
      }
      this.updateCount(ldata.length);
      if (ldata.length > 0) {
        try {
          if (this.translator !== null) {
            for (let i = 0; i < ldata.length; i++) {
              ldata[i] = this.translator.toUI(ldata[i]);
            }
          }
        } catch (e) {
          console.log(e);
        }
      }
      this.$emit("load-data", {
        meta: lmeta,
        headers: lheaders,
        items: ldata,
      });
      // console.log(`flo-meta-table - onLoadData - after - ${JSON.stringify(lheaders)}`);
      if (lmeta.hasOwnProperty("exportable")) {
        this.isolated = lmeta.isolated;
        this.exportable = lmeta.exportable;
      }
      this.meta = lmeta;
      this.headers = lheaders.filter((h) => {
        return h.view == true;
      });
      this.edit_headers = lheaders.filter((h) => {
        // console.log(`flo-meta-table - onLoadData - edit_headers - ${JSON.stringify(h)}`)
        return h.edit == true;
      });
      this.records = ldata;

      this.editedItem = leditedItem;
      this.defaultItem = ldefaultItem;
      // console.log(`default item: ${JSON.stringify(this.defaultItem)}`);
      this.loading = false;
    },
    disableEdit(idx, iheader) {
      if (!this.allowSave()) {
        console.log(`flo-meta-table - disableEdit - allowSave - limit`);
        return true;
      }

      if (idx === -1) {
        return iheader.disable_new;
      } else {
        return iheader.disable_edit;
      }
    },
    dynamicTreeNode(event) {
      this.edit_headers.map((header) => {
        switch (header.gpath) {
          case "/RAM Parameters/Toolkit Parameters":
            event == "UTK" ? (header["gpath_view"] = true) : (header["gpath_view"] = false);
            break;
          case "/Version/FloLive":
            event == "FloLive MultiIMSI" ? (header["gpath_view"] = true) : (header["gpath_view"] = false);
            break;
          default:
            header["gpath_view"] = true;
            break;
        }
      });
    },
    hideAttachments(idx) {
      if (!this.allowSave()) {
        return true;
      }

      if (idx === -1) {
        return true;
      }
    },
    hideDisabled(idx, iheader) {
      if (!this.allowSave()) {
        return false;
      }
      if (idx === -1) {
        return iheader.disable_new;
      }
    },
    getHeader(value, headers) {
      return headers.find((h) => value == h.value);
    },
    allowSave() {
      if (this.disabledEdit) {
        return false;
      }

      if (this.editedIndex == -1) {
        return this.permissions.c == true;
      }
      return this.permissions.u == true;
    },
    newItem() {
      this.editedIndex = -1;
      console.log(`flo-meta-table - newItem - default - ${JSON.stringify(this.defaultItem)}`);
      this.editedItem = Object.assign({}, this.defaultItem);

      if (this.translator !== null) {
        this.editedItem = this.translator.toUI(this.editedItem);
      }
      console.log(`flo-meta-table - newItem - edit - ${JSON.stringify(this.editedItem)}`);
      let details = {
        idx: this.editedIndex,
        record: this.editedItem,
        continue: true,
      };
      this.$emit("pre-new", details);
      this.dialog = details.continue;
    },
    editItem(item) {
      this.editedIndex = this.records.indexOf(item);
      this.editedItem = Object.assign({}, item);
      let details = {
        idx: this.editedIndex,
        record: this.editedItem,
        continue: true,
      };
      this.$emit("pre-edit", details);
      this.dialog = details.continue;
    },
    viewItem(item) {
      this.editedIndex = this.records.indexOf(item);
      this.editedItem = Object.assign({}, item);
      let details = {
        idx: this.editedIndex,
        record: this.editedItem,
        continue: true,
      };
      this.$emit("pre-view", details);
      this.dialog = true;
    },
    historyItem(item) {
      if (item == null) {
        if (this.history_param) {
          this.$router.push({
            path: this.history_url,
            query: { param: this.history_param },
          });
        } else {
          this.$router.push({
            path: this.history_url,
          });
        }
      } else {
        this.$router.push({
          path: this.history_url,
          query: { id: item.id },
        });
      }
    },
    async deleteItemEx(item) {
      const index = this.records.indexOf(item);
      try {
        let ldelete = null;
        let body = {
          params: {},
        };
        this.deleteLoader = true;
        this.$emit("post-delete", { loader: this.deleteLoader, ...item });
        if (this.deleteResources) {
          for (const [k, v] of Object.entries(this.deleteResources)) {
            body.params[k] = v.value;
          }
        }

        if (this.local) {
          this.local_save_dirty = true;
        } else {
          if (Object.keys(body.params).length > 0) {
            ldelete = await this.$axios.$delete(`/api/v1/${this.getResourceUrl()}/${item[this.meta.primary]}`, body);
          } else {
            ldelete = await this.$axios.$delete(`/api/v1/${this.getResourceUrl()}/${item[this.meta.primary]}`);
          }
        }

        this.records.splice(index, 1);
        this.updateCount(this.records.length);

        this.deleteDialog = false;
        if (!this.local) {
          this.tellUser("success", `${this.resources} Id:${item[this.meta.primary]} deleted successfully.`);
        }

        // clear the resource cache on delete
        this.clearResourceCache({ module: this.module, resource: this.resources });
        this.deleteLoader = false;
        this.$emit("post-delete", { loader: this.deleteLoader, ...item });
        this.loadData();
        return ldelete;
      } catch (err) {
        let lerr = this.parseNetError(err);
        console.log(`crud table: delete - fail: ${lerr.statusCode} - ${lerr.message}`);
        this.tellUser("error", `Delete: ${lerr.statusCode} - ${lerr.message}`);
        this.deleteLoader = false;
        this.$emit("post-delete", { loader: this.deleteLoader, ...item });
        throw err;
      }
    },
    setDeleteItem(item) {
      this.itemForDeletion = item;
      const index = this.records.indexOf(this.itemForDeletion);
      let details = {
        cancel: false,
        reason: "",
        item: this.itemForDeletion,
        index: index,
        crud: this,
      };
      this.$emit("pre-delete", details);
      if (details.cancel) {
        if (details.reason !== "") {
          this.tellUser("error", `${this.resources}, Delete canceled with reason: ${details.reason}`);
        }
        return;
      }
      this.deleteDialog = true;
    },
    deleteDialogTitle() {
      let ltitle = "";
      if (this.itemForDeletion.hasOwnProperty("name")) {
        let name = this.itemForDeletion.name;
        ltitle = name.length > 50 ? `${name.slice(0, 50)}...` : name;
      } else if (this.itemForDeletion.hasOwnProperty("key")) {
        ltitle = this.itemForDeletion.key;
      } else {
        ltitle = this.itemForDeletion.id;
      }
      return `Are you sure you want to delete ${this.citem_title.toLowerCase()} ${ltitle}?`;
    },
    deleteItem() {
      console.log(`crud table: delete item - before: ${JSON.stringify(this.itemForDeletion)}`);
      try {
        this.deleteItemEx(this.itemForDeletion);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", `Delete: ${lerr.statusCode} - ${lerr.message}`);
      }
    },
    setDeleteAll() {
      this.deleteAllDialog = true;
    },
    deleteAllDialogTitle() {
      return `Are you sure you want to delete ALL ${this.citem_title.toLowerCase()}s?`;
    },
    deleteAllItems() {
      this.records = [];
      this.deleteAllDialog = false;
      this.updateCount(this.records.length);

      this.$emit("post-delete-all");
      this.local_save_dirty = true;
    },
    close() {
      this.errorSnackbar = false;
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    needsTranslation(key) {
      if (typeof this.translator === "undefined" || this.translator === null) {
        return false;
      }

      return this.translator.hasTranslator(key);
    },
    validate() {
      let item = this.editedItem;

      for (let i = 0; i < this.headers.length; i++) {
        let header = this.headers[i];

        console.log(`validate: key: ${header.value} value: ${item[header.value]} `);
        if (header.edit && header.auto != true) {
          let value = item[header.value];
          let need_translation = this.needsTranslation(header.value);
          if (need_translation) {
            // console.log(`validate: need transaltion ${header.value} value: ${value}`);
            value = this.translator.toSrcByKey(header.value, value);
            // console.log(`validate: after transaltion ${header.value} value: ${value}`);
          }

          if (header.hasOwnProperty("nullable")) {
            if (header.nullable == false && (!header.hasOwnProperty("default") || typeof header.default === "undefined")) {
              // console.log(`header: ${header.value} has nullable: ${header.nullable} default: ${header.default}
              // value: ${value}
              // `);
              if (value === null || value === "") {
                let lmessage = `Validation failed, field '${header.text}' must have a value.`;
                console.log(lmessage);
                return { header: header, message: lmessage };
              }
            }
          }

          if (header.hasOwnProperty("min")) {
            if (value < header.min) {
              let lmessage = `Validation failed, field '${header.value}' value ${value} is less than ${header.min}`;
              console.log(lmessage);
              return { header: header, message: lmessage };
            }
          }

          if (header.hasOwnProperty("max")) {
            if (value > header.max) {
              let lmessage = `Validation failed, field '${header.value}' value ${value} is bigger than ${header.max}`;
              console.log(lmessage);
              return { header: header, message: lmessage };
            }
          }

          if (header.type === "bool" || header.type === "boolean") {
            if (value === "0" || value === 0 || value === false) {
              item[header.value] = false;
              value = item[header.value];
            } else {
              item[header.value] = true;
              value = item[header.value];
            }
          } else {
            const spattern = header.pattern;
            if ("enum" == spattern) {
              if (!header.hasOwnProperty("enum")) {
                let lmessage = `Validation failed, field '${header.text}' value ${value} missing enum`;
                console.log(lmessage);
                return { header: header, message: lmessage };
              }

              const lenum = header.enum;
              let found = lenum.find((f) => f.key == value);
              if (!found) {
                let lmessage = `Validation failed, field '${header.text}' value ${value} not in enum`;
                console.log(lmessage);
                return { header: header, message: lmessage };
              }
            } else {
              const lpattern = new RegExp(spattern);
              if (!lpattern.test(value)) {
                let lmessage = `Validation failed, field '${header.text}' value ${value} doesn't match ${spattern}`;
                console.log(lmessage);
                return { header: header, message: lmessage };
              }
            }
          }
        }
      }

      return null;
    },
    async save() {
      let lresult = this.validate();
      if (lresult != null) {
        this.errorSnackbar = true;
        this.errorMessage = lresult.message;
        return;
      }

      // clear the resource cache on create or update
      this.clearResourceCache({ module: this.module, resource: this.resources });

      let item = JSON.parse(JSON.stringify(this.editedItem));
      try {
        if (this.editedIndex > -1) {
          // update
          let orig_idx = this.editedIndex;
          let details = {
            cancel: false,
            reason: "",
            update: item,
            record: this.records[orig_idx],
          };

          this.$emit("pre-update", details);
          if (details.cancel) {
            this.tellUser("error", `${this.resources}, Save canceled with reason: ${details.reason}`);

            return;
          }
          let lprimary = item[this.meta.primary];
          console.log(`crud table: update item before translation: ${lprimary}:${JSON.stringify(item)}`);

          if (typeof this.translator !== "undefined" && this.translator !== null) {
            item = this.translator.toSrc(item);
          }

          console.log(`crud table: update item after translation: ${lprimary}:${JSON.stringify(item)}`);
          let lupdate = null;
          if (this.local) {
            lupdate = JSON.parse(JSON.stringify(item));
            this.local_save_dirty = true;
          } else {
            lupdate = await this.$axios.$put(`/api/v1/${this.getResourceUrl()}/${lprimary}`, item);
          }

          this.$emit("post-update", details);
          if (typeof this.translator !== "undefined" && this.translator !== null) {
            lupdate = this.translator.toUI(lupdate);
          }

          Object.assign(this.records[orig_idx], lupdate);
          if (!this.local) {
            this.tellUser("success", `${this.resources} Id:${lupdate[this.meta.primary]} updated successfully.`);
          }
        } else {
          if (item.hasOwnProperty(this.meta.primary)) {
            let okey = this.meta.keys[this.meta.primary];
            if (okey.hasOwnProperty("auto") && okey.auto == true) {
              delete this.editedItem[this.meta.primary];
            }
          }

          if (typeof this.translator !== "undefined" && this.translator !== null) {
            item = this.translator.toSrc(item);
          }

          let details = {
            cancel: false,
            reason: "",
            update: item,
          };

          this.$emit("pre-new-save", details);

          if (details.cancel) {
            this.tellUser("error", `${this.resources}, Create canceled with reason: ${details.reason}`);

            return;
          }

          let lcreate = null;
          if (this.local) {
            lcreate = JSON.parse(JSON.stringify(item));
            this.local_save_dirty = true;
          } else {
            lcreate = await this.$axios.$post(`/api/v1/${this.getResourceUrl()}`, item);
          }

          console.log(`crud table: create - read: ${JSON.stringify(lcreate)}`);

          if (typeof this.translator !== "undefined" && this.translator !== null) {
            lcreate = this.translator.toUI(lcreate);
          }

          Object.assign(item, lcreate);
          this.records.push(item);
          this.updateCount(this.records.length);

          details = {
            item: item,
          };

          this.$emit("post-new", item);
          if (!this.local) {
            this.tellUser("success", `${this.citem_title} Id:${lcreate[this.meta.primary]} created successfully.`);
          }
        }
        this.close();
      } catch (err) {
        if (typeof this.translator !== "undefined" && this.translator !== null) {
          this.editedItem = this.translator.toUI(item);
        }

        let lerr = this.parseNetError(err);
        console.log(`crud table: save - fail: ${lerr.statusCode} - ${lerr.message}`);
        this.tellUser("error", `Save: ${lerr.statusCode} - ${lerr.message}`);
      }
    },
    onTimeChange(event) {
      if (!event.hasOwnProperty("startTime")) {
        return;
      }
      if (null == event.startTime) {
        return;
      }

      let l_hidden_filter = this.hiddenFilter.filter((f) => !f.hasOwnProperty("time_range"));

      l_hidden_filter.push({
        time_range: true,
        k: "ts",
        op: "greater",
        v: event.startTime,
      });

      if (event.hasOwnProperty("endTime")) {
        if (null != event.endTime) {
          l_hidden_filter.push({
            time_range: true,
            k: "ts",
            op: "lower",
            v: event.endTime,
          });
        }
      }
      this.hiddenFilter = l_hidden_filter;
    },
    onStartTimeChange(event) {
      let l_start_time = {
        time_range: true,
        k: "ts",
        op: "greater",
        v: event,
      };

      this.formatFilter(l_start_time);
    },
    onEndTimeChange(event) {
      let l_end_time = {
        time_range: true,
        k: "ts",
        op: "lower",
        v: event,
      };

      this.formatFilter(l_end_time);
    },
    formatFilter(time_filter) {
      if (this.hiddenFilter.length > 0) {
        let found = this.hiddenFilter.find((f) => f.hasOwnProperty("time_range") && f.k == time_filter.k && f.op == time_filter.op);
        if (!found) {
          this.hiddenFilter.push(time_filter);
        } else {
          let idx = this.hiddenFilter.indexOf(found);
          this.hiddenFilter.splice(idx, 1, time_filter);
        }
      }
    },
    cancelDelete() {
      this.deleteDialog = false;
      this.$emit("cancel-action");
    },
    onSelectionChanged(event) {
      // console.log(`flo-meta-table - onSelectionChanged - event: ${JSON.stringify(event)}`);
      this.$emit("selection-changed", event);
    },
    onToggleSelectAll(event) {
      // console.log(`flo-meta-table - onToggleSelectAll - event: ${JSON.stringify(event)}`);
      this.$emit("toggle-selecte-all", event);
    },
    onItemSelected(event) {
      // console.log(`flo-meta-table - onItemSelected - event: ${JSON.stringify(event)}`);
      this.$emit("item-selected", event);
    },
    onLimitChanged(event) {
      // console.log(`flo-meta-table - onLimitChanged - event: ${JSON.stringify(event)}`);
      if (this.single_page) {
        this.ditems_per_page = event;
      }
    },
    onPageCount() {
      // console.log(`flo-meta-table - onPageCount - event: ${JSON.stringify(event)}`);
    },
    onPagination() {
      // console.log(`flo-meta-table - onPagination - event: ${JSON.stringify(event)}`);
    },
    onUpdatePage() {
      // console.log(`flo-meta-table - onUpdatePage - event: ${JSON.stringify(event)}`);
    },
    onUpdateItemsPerPage() {
      // console.log(`flo-meta-table - onUpdateItemsPerPage - event: ${JSON.stringify(event)}`);
    },
  },
};
</script>
