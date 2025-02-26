<template>
  <div class="flo-product">
    <v-card v-if="product != null" flat outlined class="ma-0 pa-0">
      <v-card-text class="ma-0 pa-0">
        <v-container fluid class="pa-1">
          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <v-dialog :overlay-opacity="0.4" v-model="bap.dialog" persistent width="600px">
                <v-card flat class="ma-0 pa-0">
                  <v-card-title>
                    <v-row no-gutters>
                      <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"> <span class="headline"> BAP State Flow</span> </v-col>
                    </v-row>
                  </v-card-title>
                  <v-card-text>
                    <v-container fluid class="ma-0 pa-0">
                      <v-row no-gutters>
                        <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'">
                          <blockquote class="subtitle-1">
                            <span>*From French - Bon À Produire - 'good for production'</span>
                          </blockquote>
                        </v-col>
                      </v-row>
                      <v-row no-gutters>
                        <v-col :cols="$vuetify.breakpoint.xs ? 12 : '6'" class="my-1 pa-1"> <v-text-field :value="helpers.toLocalTimeInIsoFormatUi(product.bap_ts)" :label="bap.ts.label" :hint="bap.ts.hint" disabled persistent-hint> </v-text-field> </v-col>
                        <v-col :cols="$vuetify.breakpoint.xs ? 12 : '6'" class="my-1 pa-1"> <v-text-field :value="product.bap_user" :label="bap.email.label" :hint="bap.email.hint" disabled persistent-hint> </v-text-field> </v-col>
                      </v-row>
                      <v-row no-gutters>
                        <v-col cols="my-1 12" class="pa-1">
                          <v-autocomplete v-model="bap.state.value" :label="bap.state.label" :hint="bap.state.hint" :items="filterBapStates()" item-text="value" item-value="key" dense outlined persistent-hint></v-autocomplete>
                        </v-col>
                      </v-row>
                      <v-row no-gutters>
                        <v-col cols="12" class="px-1">
                          <v-textarea v-model="bap.comment.value" :label="bap.comment.label" outlined no-resize> </v-textarea>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn color="primary" text @click="clearBap()">Cancel</v-btn>
                    <v-btn color="primary" text @click="changeBapState()">Save</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <div class="headline">
                Product: {{ product.name.length > 50 ? `${product.name.slice(0, 50)}...` : product.name }}
                <v-chip v-if="product.hasOwnProperty('state')" label class="text-capitalize" :color="getStateColor(product.state)">{{ product.state }}</v-chip>
                <v-chip v-if="product.hasOwnProperty('type')" label class="text-capitalize" :color="getTypeColor(product.type)">{{ product.type }}</v-chip>
                <v-chip v-if="product.hasOwnProperty('bap_state')" label class="text-capitalize" :color="getBapStateColor(product.bap_state)">{{ product.bap_state }}</v-chip>
                <v-chip v-if="product.hasOwnProperty('end_of_life') && product.end_of_life == 1" label class="text-capitalize" color="warning">End of Life</v-chip>
              </div>
              <v-row no-gutters>
                <v-col cols="8">
                  <blockquote class="blockquote font-weight-light">
                    Id: <code>{{ product.id }}</code>
                    <span v-if="product.description != ''">
                      , Description: <code>{{ product.description }}</code
                      >,</span
                    >
                    <span v-if="uicc_res != null">
                      UICC:
                      <code>
                        <router-link
                          :to="{
                            path: '/resources/uicc',
                            query: { id: product.uicc_id },
                          }"
                        >
                          <span>{{ uicc_res.name }}</span>
                        </router-link></code
                      >
                    </span>
                  </blockquote>
                </v-col>
                <div class="flex-grow-1"></div>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" class="mt-5 mr-1" color="primary" @click="changeEol()" :disabled="!crud.e">
                      <v-icon left>{{ product.end_of_life ? "mdi-check-circle-outline " : "mdi-cancel" }}</v-icon>
                      {{ product.end_of_life ? "Disable EOL" : "Enable EOL" }}
                    </v-btn>
                  </template>
                  <span>{{ product.end_of_life ? "Disable Product End Of Life" : "Enable Product End Of Life" }}</span>
                </v-tooltip>

                <v-btn class="mt-5 mr-1" color="primary" @click="bap.dialog = true" :disabled="!crud.e">
                  <v-icon left>mdi-format-list-checks</v-icon>
                  BAP Setup</v-btn
                >
                <v-btn class="mt-5" v-if="product.state != 'active'" color="primary" @click="changeState('activate')" :disabled="!crud.e">
                  <v-icon left>mdi-progress-check</v-icon>
                  Activate</v-btn
                >
                <v-btn class="mt-5" v-else color="primary" @click="changeState('deprecate')" :disabled="!crud.e">
                  <v-icon left>mdi-progress-alert</v-icon>
                  Deprecate</v-btn
                >
              </v-row>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Details" elevation="5">
                <template v-slot:content="{}">
                  <flo-meta-resource-view :value="product" resources="products" :ignore="['attr', 'action', 'path', 'aid', 'extra']">
                    <template v-slot:view_uicc_id="{ fmtheader }">
                      <v-col cols="12" lg="3" xl="3" class="pa-1">
                        <flo-meta-field-view :translator="translator" :header="formatHeader(fmtheader)" :value="formatHeader(fmtheader).data" />
                      </v-col>
                    </template>
                    <template v-slot:view_replacement_product_id="{ fmtheader }">
                      <v-col cols="12" lg="3" xl="3" class="pa-1">
                        <flo-meta-field-view :translator="translator" :header="formatHeader(fmtheader)" :value="formatHeader(fmtheader).data" />
                      </v-col>
                    </template>
                    <template v-slot:view_base_product_id="{ fmtheader }">
                      <v-col cols="12" lg="3" xl="3" class="pa-1">
                        <flo-meta-field-view :translator="translator" :header="formatHeader(fmtheader)" :value="formatHeader(fmtheader).data" />
                      </v-col>
                    </template>
                  </flo-meta-resource-view>
                </template>
              </flo-expand>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Headers" elevation="5">
                <template v-slot:content="{}">
                  <v-row no-gutters :key="extra_key">
                    <v-col cols="12" class="pa-1">
                      <flo-meta-table @export-data="onExportData($event)" @element-move="onUnsavedAction(true)" @post-import="onUnsavedAction(true)" @post-new="onUnsavedAction(true)" @post-update="onUnsavedAction(true)" @post-delete="onUnsavedAction(true)" @post-delete-all="onUnsavedAction(true)" :single_page="false" :disable_sort="true" @load-data="onLoadDataHeaders($event)" @cancel-local-changes="onCancelLocalHeadersChanges($event)" @save-local-changes="onSaveLocalHeadersChanges($event)" :disableNew="!hasPermissionToEdit()" :disabledEdit="!hasPermissionToEdit()" :show_title="false" :title="title" :show_reload="false" :local="true" :local_import="true" :local_export="true" :local_delete="true" :local_updown="true" :show_filter="false" :local_meta="getLocalMeta('header')" :local_data="getLocalHeadersData()" :local_permissions="getLocalPermissions()" module="product" resources="headers">
                        <template v-slot:edit_default="{ fmtheader, fmtrow }">
                          <v-col v-if="fmtrow.pattern.includes('parse')" :__qa="helpers.getQATag('headers', fmtheader)">
                            <flo-parser-view v-model="fmtrow.default" :row="fmtrow" :header="fmtheader" :required_mask="uicc_res.required_mask" :available_mask="uicc_res.available_mask" :disabled="!hasPermissionToEdit()" />
                          </v-col>
                          <v-col v-else-if="fmtrow.pattern == 'enum'" :__qa="helpers.getQATag('headers', fmtheader)" class="my-0 py-0" cols="12" lg="6">
                            <v-select v-model="fmtrow.default" :items="fmtrow.enum" :disabled="!hasPermissionToEdit()" label="Default" hint="Default Enum" item-text="value" item-value="key" persistent-hint filled></v-select>
                          </v-col>
                          <v-col v-else-if="fmtrow.pattern" :__qa="helpers.getQATag('headers', fmtheader)" cols="12" lg="6">
                            <v-text-field v-model="fmtrow.default" :rules="[validateDefault(fmtrow.pattern, fmtrow.default)]" :disabled="!hasPermissionToEdit()" label="Default" hint="Default Value" persistent-hint></v-text-field>
                          </v-col>
                        </template>

                        <template v-slot:edit_pattern="{ fmtrow }">
                          <v-col class="my-0 py-0" cols="12" lg="6">
                            <v-text-field v-model="fmtrow.pattern" :disabled="!hasPermissionToEdit()" :label="pattern.label" :hint="pattern.hint" :rules="[pattern.rule]" persistent-hint></v-text-field>
                          </v-col>
                        </template>
                        <template v-slot:edit_enum="{ fmtheader, fmtrow }">
                          <v-col v-if="fmtrow.pattern == 'enum'" class="my-0 py-0" cols="12" lg="6">
                            <v-card outlined class="ma-0 pa-0">
                              <v-card-title class="ma-1 pa-1">Enum</v-card-title>
                              <v-card-text class="ma-0 pa-0">
                                <v-container fluid class="ma-0 pa-0">
                                  <v-row no-gutters align="center" justify="space-between">
                                    <v-col :__qa="helpers.getQATag('headers', fmtheader)" class="ma-1 pa-1">
                                      <v-text-field outlined dense v-model="enum_add_key" label="Key" hide-details></v-text-field>
                                    </v-col>
                                    <v-col :__qa="helpers.getQATag('headers', fmtheader)" class="ma-1 pa-1">
                                      <v-text-field outlined dense v-model="enum_add_value" label="Value" hide-details></v-text-field>
                                    </v-col>
                                    <v-col :__qa="helpers.getQATag('headers', fmtheader)" class="ma-1 pa-1">
                                      <v-btn @click="onEnumAdd(fmtrow)" color="primary">
                                        <v-icon>mdi-plus</v-icon>
                                      </v-btn>
                                    </v-col>
                                  </v-row>

                                  <v-row v-if="getEnumList(fmtrow.enum).length > 0" no-gutters>
                                    <v-col :__qa="helpers.getQATag('headers', fmtheader)" class="ma-1 pa-1" cols="12">
                                      <v-select :value="getEnumList(fmtrow.enum)" item-text="value" item-value="key" :items="fmtrow.enum" @change="onEnumChange(fmtrow, $event)" label="List" hint="Enum List" persistent-hint multiple chips deletable-chips clearable filled></v-select>
                                    </v-col>
                                  </v-row>
                                </v-container>
                              </v-card-text>
                            </v-card>
                          </v-col>
                          <v-col v-else class="my-0 py-0" cols="12" lg="6">
                            <v-container></v-container>
                          </v-col>
                        </template>

                        <template v-slot:view_default="{ fmtrow }">
                          <template>
                            {{ shrinkBigLine(fmtrow.default) }}
                          </template>
                        </template>
                      </flo-meta-table>
                    </v-col>
                  </v-row>
                </template>
              </flo-expand>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Inputs" elevation="5">
                <template v-slot:content="{}">
                  <v-row no-gutters :key="extra_key">
                    <v-col cols="12" class="pa-1">
                      <flo-meta-table @export-data="onExportData($event)" @element-move="onUnsavedAction(true)" @post-new="onUnsavedAction(true)" @post-update="onUnsavedAction(true)" @post-delete="onUnsavedAction(true)" :single_page="false" :disable_sort="true" @load-data="onLoadDataInputs($event)" @cancel-local-changes="onCancelLocalInputsChanges($event)" @save-local-changes="onSaveLocalInputsChanges($event)" :disableNew="!hasPermissionToEdit()" :disabledEdit="!hasPermissionToEdit()" :show_title="false" :title="title" :show_reload="false" :local="true" :local_import="true" :local_export="true" :local_delete="true" :local_updown="true" :show_filter="false" :local_meta="getLocalMeta('input')" :local_data="getLocalInputsData()" :local_permissions="getLocalPermissions()" module="product" resources="inputs">
                        <template v-slot:edit_default="{ fmtheader, fmtrow }">
                          <v-col :__qa="helpers.getQATag('inputs', fmtheader)" v-if="fmtrow.pattern == 'enum'" class="my-0 py-0" cols="12" lg="6">
                            <v-select v-model="fmtrow.value" item-text="value" item-value="key" :items="fmtrow.enum" label="Default" hint="Default Enum" persistent-hint filled></v-select>
                          </v-col>
                        </template>

                        <template v-slot:edit_enum="{ fmtheader, fmtrow }">
                          <v-col v-if="fmtrow.pattern == 'enum'" class="my-0 py-0" cols="12" lg="6">
                            <v-card outlined class="ma-0 pa-0">
                              <v-card-title class="ma-1 pa-1">Enum</v-card-title>
                              <v-card-text class="ma-0 pa-0">
                                <v-container fluid class="ma-0 pa-0">
                                  <v-row no-gutters align="center" justify="space-between">
                                    <v-col :__qa="helpers.getQATag('inputs', fmtheader)" class="ma-1 pa-1">
                                      <v-text-field outlined dense v-model="enum_add_key" label="Key" hide-details></v-text-field>
                                    </v-col>
                                    <v-col :__qa="helpers.getQATag('inputs', fmtheader)" class="ma-1 pa-1">
                                      <v-text-field outlined dense v-model="enum_add_value" label="Value" hide-details></v-text-field>
                                    </v-col>
                                    <v-col :__qa="helpers.getQATag('inputs', fmtheader)" class="ma-1 pa-1">
                                      <v-btn @click="onEnumAdd(fmtrow)" color="primary">
                                        <v-icon>mdi-plus</v-icon>
                                      </v-btn>
                                    </v-col>
                                  </v-row>

                                  <v-row v-if="getEnumList(fmtrow.enum).length > 0" no-gutters>
                                    <v-col :__qa="helpers.getQATag('inputs', fmtheader)" class="ma-1 pa-1" cols="12">
                                      <v-select :value="getEnumList(fmtrow.enum)" item-text="value" item-value="key" :items="fmtrow.enum" @change="onEnumChange(fmtrow, $event)" label="List" hint="Enum List" persistent-hint multiple chips deletable-chips clearable filled></v-select>
                                    </v-col>
                                  </v-row>
                                </v-container>
                              </v-card-text>
                            </v-card>
                          </v-col>
                          <v-col v-else class="my-0 py-0" cols="12" lg="6">
                            <v-container></v-container>
                          </v-col>
                        </template>

                        <template v-slot:view_default="{ fmtrow }">
                          {{ shrinkBigLine(fmtrow.default) }}
                        </template>
                      </flo-meta-table>
                    </v-col>
                  </v-row>
                </template>
              </flo-expand>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Subscribers" elevation="5" @expand="onSubscriberExpand()" :loading="loading">
                <template v-if="!loading" v-slot:content="{}">
                  <v-dialog :overlay-opacity="0.4" v-model="clear_subscribers_dialog" persistent width="auto ">
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
                            <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"><span class="title text--primary">Are you sure you want to clear ALL Subscriber Data?</span> </v-col>
                          </v-row>
                        </v-container>
                      </v-card-text>
                      <v-card-actions>
                        <div class="flex-grow-1"></div>
                        <v-btn color="primary" text @click="clear_subscribers_dialog = false">Cancel</v-btn>
                        <v-btn color="primary" text @click="onClearSubscribersChanges()">Clear</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                  <v-row v-if="!findSingle() && !blankProduct()" no-gutters>
                    <v-col cols="12" :lg="`${selected_subs.length > 4 ? 6 : 3}`" :xl="`${selected_subs.length > 4 ? 6 : 3}`" class="ma-1 pa-1">
                      <v-select v-model="selected_subs" :items="Object.values(subs)" :disabled="!hasPermissionToEdit()" @change="onUnsavedAction(true)" label="Edit Subscribers" item-value="idx" item-text="label" :menu-props="{ offsetY: true }" hint="Select Subscribers" no-data-text="Please populate Inputs" height="45" chips dense outlined persistent-hint multiple></v-select>
                    </v-col>
                  </v-row>
                  <template v-for="(sub, i) in subs">
                    <v-row no-gutters :key="i" v-if="showSubscribers(sub)">
                      <v-col cols="12" class="pa-1">
                        <flo-expand :title="`Subscriber ${sub.idx}`" :open="sub.used ? true : false" elevation="0">
                          <template v-slot:content="{}">
                            <v-form v-model="valid">
                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <v-row v-if="!findSingle() && !blankProduct()" no-gutters>
                                    <v-col class="pa-1" cols="12" lg="1" xl="1">
                                      <v-switch v-model="sub.used" label="Used" :true-value="1" :false-value="0" :disabled="!hasPermissionToEdit()" @change="onUnsavedAction(true)" hint="Subscriber Usage" color="success" inset persistent-hint outlined></v-switch>
                                    </v-col>
                                    <v-col class="pa-1 mt-1" cols="12" lg="2" xl="2">
                                      <v-text-field v-model="sub.name" :label="name.label" :hint="name.hint" :rules="[name.rule]" :disabled="!hasPermissionToEdit()" @change="onUnsavedAction(true)" class="mt-2" persistent-hint outlined dense></v-text-field>
                                    </v-col>
                                  </v-row>

                                  <v-row no-gutters>
                                    <v-col class="py-1" cols="12">
                                      <flo-expand title="Services" open elevation="0">
                                        <template v-slot:content="{}">
                                          <v-container fluid class="ma-0 pa-1">
                                            <v-row no-gutters>
                                              <v-col class="pa-1" cols="12" lg="2" xl="2">
                                                <v-autocomplete v-model="sub.hlr_id" :label="bindings.hlr.label" :hint="bindings.hlr.hint" :items="bindings.hlr.items" :rules="bindings.hlr.rule" :disabled="!hasPermissionToEdit() || blankProduct()" @change="setSubscriberDefaults($event, sub.idx)" @click:clear="clearSubscriberDefaults(sub.idx)" item-text="value" item-value="key" clearable dense persistent-hint outlined></v-autocomplete>
                                              </v-col>
                                              <template v-if="sub.hlr_id">
                                                <v-col class="pa-1" cols="12" lg="2" xl="2">
                                                  <v-autocomplete v-model="sub.op_net_id" :label="op.label" :hint="op.hint" :no-data-text="op.no_data_text" :items="op.items" item-text="value" item-value="key" clearable dense persistent-hint outlined></v-autocomplete>
                                                </v-col>
                                                <v-col class="pa-1" cols="12" lg="2" xl="2">
                                                  <v-text-field v-model.number="sub.profile_id" :label="profile_id.label" :hint="profile_id.hint" :rules="[profile_id.rule]" persistent-hint outlined dense></v-text-field>
                                                </v-col>
                                                <v-col class="pa-1" cols="12" lg="2" xl="2">
                                                  <v-text-field v-model.number="sub.steering_id" :label="steering_id.label" :hint="steering_id.hint" :rules="[steering_id.rule]" persistent-hint outlined dense></v-text-field>
                                                </v-col>
                                              </template>
                                            </v-row>
                                            <v-row no-gutters>
                                              <v-col class="pa-1" cols="12" lg="2" xl="2">
                                                <v-autocomplete v-model="sub.smsc_id" :label="bindings.smsc.label" :hint="bindings.smsc.hint" :items="bindings.smsc.items" :rules="bindings.smsc.rule" :disabled="!hasPermissionToEdit() || blankProduct()" @change="onUnsavedAction(true)" item-text="value" item-value="key" clearable dense persistent-hint outlined></v-autocomplete>
                                              </v-col>
                                            </v-row>
                                            <v-row no-gutters>
                                              <v-col class="pa-1" cols="12" lg="2" xl="2">
                                                <v-autocomplete v-model="sub.bip_id" :label="bindings.bip.label" :hint="bindings.bip.hint" :items="bindings.bip.items" :disabled="!hasPermissionToEdit() || blankProduct()" @change="onUnsavedAction(true)" item-text="value" item-value="key" clearable dense persistent-hint outlined></v-autocomplete>
                                              </v-col>
                                              <v-col class="pa-1" cols="12" lg="2" xl="2">
                                                <v-autocomplete v-model="sub.apn" :label="bindings.apn.label" :hint="bindings.apn.hint" :items="bindings.apn.items" :disabled="!hasPermissionToEdit() || blankProduct()" @change="onUnsavedAction(true)" item-text="value" item-value="key" clearable persistent-hint dense outlined></v-autocomplete>
                                              </v-col>
                                            </v-row>
                                            <v-row no-gutters>
                                              <v-col class="pa-1" cols="12" lg="2" xl="2">
                                                <v-autocomplete v-model="sub.billing_id" :label="bindings.billing.label" :hint="bindings.billing.hint" :items="bindings.billing.items" :disabled="!hasPermissionToEdit() || blankProduct()" @change="onUnsavedAction(true)" item-text="value" item-value="key" clearable dense persistent-hint outlined></v-autocomplete>
                                              </v-col>
                                            </v-row>
                                          </v-container>
                                        </template>
                                      </flo-expand>
                                    </v-col>
                                  </v-row>

                                  <v-row no-gutters>
                                    <v-col class="py-1" cols="12">
                                      <flo-expand title="Identifiers" open elevation="0">
                                        <template v-slot:content="{}">
                                          <v-container fluid class="ma-0 pa-1">
                                            <v-row no-gutters>
                                              <v-col class="pa-1" cols="12" :lg="getLengthMap(sub.network_keys)" :xl="getLengthMap(sub.network_keys)">
                                                <v-select v-model="sub.network_keys" :label="network_keys.label" :hint="network_keys.hint" :items="network_keys.items" :disabled="!hasPermissionToEdit()" @change="onUnsavedAction(true)" item-text="value" item-value="key" multiple deletable-chips chips dense clearable color="primary" persistent-hint outlined></v-select>
                                              </v-col>
                                              <v-col v-if="!findSingle()" class="pa-1" cols="12" lg="2" xl="2">
                                                <v-select v-model="sub.key_id" :label="sub_key_ids.label" :hint="sub_key_ids.hint" :items="sub_key_ids.items" :disabled="!hasPermissionToEdit()" @change="onUnsavedAction(true)" dense persistent-hint outlined></v-select>
                                              </v-col>
                                              <v-col v-if="sub.network_keys.includes('map')" class="pa-1" cols="12" lg="2" xl="2">
                                                <v-autocomplete v-model="sub.map_ki_opc" :items="subs_idx.items" :label="subs_idx.label" :hint="subs_idx.hint" item-text="value" item-value="key" dense persistent-hint outlined></v-autocomplete>
                                              </v-col>
                                            </v-row>
                                          </v-container>
                                        </template>
                                      </flo-expand>
                                    </v-col>
                                  </v-row>

                                  <v-row v-if="!findSingle() && !blankProduct()" no-gutters>
                                    <v-col cols="12" class="py-1">
                                      <flo-expand title="Countries & PLMNs" open elevation="0">
                                        <template v-slot:content="{}">
                                          <v-container fluid class="ma-0 pa-1">
                                            <flo-mcc-list v-model="sub.mcc" :disabled="!hasPermissionToEdit()" @input="onUnsavedAction(true)" />
                                            <v-row no-gutters>
                                              <v-col class="pa-1" cols="12" lg="2" xl="2">
                                                <v-text-field v-model="sub.plmn" :label="plmn.label" :hint="plmn.hint" :rules="[plmn.rule]" :disabled="!hasPermissionToEdit()" @change="onUnsavedAction(true)" persistent-hint outlined dense></v-text-field>
                                              </v-col>
                                              <v-col class="pa-1" cols="12" lg="2" xl="2">
                                                <v-text-field v-model="sub.fplmn" :label="fplmn.label" :hint="fplmn.hint" :rules="[fplmn.rule]" :disabled="!hasPermissionToEdit()" @change="onUnsavedAction(true)" persistent-hint outlined dense></v-text-field>
                                              </v-col>
                                              <v-col class="pa-1" cols="12" lg="2" xl="2">
                                                <v-text-field v-model="sub.ehplmn" :label="ehplmn.label" :hint="ehplmn.hint" :rules="[ehplmn.rule]" :disabled="!hasPermissionToEdit()" @change="onUnsavedAction(true)" persistent-hint outlined dense></v-text-field>
                                              </v-col>
                                            </v-row>
                                          </v-container>
                                        </template>
                                      </flo-expand>
                                    </v-col>
                                  </v-row>
                                </v-col>
                              </v-row>
                            </v-form>
                          </template>
                        </flo-expand>
                      </v-col>
                    </v-row>
                  </template>

                  <v-row v-if="hasPermissionToEdit()" no-gutters>
                    <v-col align="end" cols="12" class="pa-1">
                      <div class="flex-grow-1"></div>
                      <v-btn color="primary" @click="onSaveSubscribersChanges()" :disabled="!valid"><v-icon left>mdi-content-save</v-icon>Save</v-btn>
                      <v-btn color="primary" @click="clear_subscribers_dialog = true" :disabled="blankProduct()"><v-icon left>mdi-cancel</v-icon>Clear</v-btn>
                    </v-col>
                  </v-row>
                </template>
              </flo-expand>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Personalization Keys" elevation="5" @expand="getPersonalizationData()">
                <template v-slot:content="{}">
                  <v-dialog :overlay-opacity="0.4" v-model="clear_personals_dialog" persistent width="auto ">
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
                            <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"><span class="title text--primary">Are you sure you want to clear ALL Personalization Keys?</span> </v-col>
                          </v-row>
                        </v-container>
                      </v-card-text>
                      <v-card-actions>
                        <div class="flex-grow-1"></div>
                        <v-btn color="primary" text @click="clear_personals_dialog = false">Cancel</v-btn>
                        <v-btn color="primary" text @click="onClearPersonalizationChanges()">Clear</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>

                  <v-row no-gutters :key="extra_key">
                    <v-col cols="12" class="ml-1 pa-1">
                      <v-row no-gutters>
                        <v-col cols="12" lg="2" xl="2" class="ma-1 pa-1">
                          <v-switch v-model="disable_personal" label="Disable All" hint="Disable All Personalization Keys" color="success" inset persistent-hint outlined></v-switch>
                        </v-col>
                      </v-row>
                      <v-row no-gutters>
                        <v-col v-for="(p, i) in Object.values(personal)" class="pa-1" cols="12" lg="2" xl="2" :key="i">
                          <v-switch v-model="p.value" :label="`Random ${p.label}`" :hint="`Randomize ${p.hint}`" :disabled="!hasPermissionToEdit() || disable_personal" @change="onUnsavedAction(true)" class="my-5" color="success" inset persistent-hint outlined></v-switch>
                          <v-switch v-if="p.value == true && p.label == 'ADM'" v-model="p.digits_only" label="Digits Only" hint="Randomize Digits Only Administrator Key" :disabled="!hasPermissionToEdit() || disable_personal" @change="onUnsavedAction(true)" class="my-5" color="success" inset persistent-hint outlined></v-switch>
                          <v-form v-model="valid_personal">
                            <v-text-field v-if="!p.value" v-model="p.fixed" :label="`Fixed ${p.label}`" :hint="`Fixed ${p.hint}`" :rules="[p.rule]" :disabled="!hasPermissionToEdit() || disable_personal" @change="onUnsavedAction(true)" class="my-5" dense persistent-hint outlined></v-text-field>
                          </v-form>
                        </v-col>
                      </v-row>
                      <v-col v-if="hasPermissionToEdit()" align="end" cols="12" class="pa-1">
                        <div class="flex-grow-1"></div>
                        <v-btn color="primary" @click="onSavePersonalizationChanges()" :disabled="!valid_personal"><v-icon left>mdi-content-save</v-icon>Save</v-btn>
                        <v-btn color="primary" @click="clear_personals_dialog = true"><v-icon left>mdi-cancel</v-icon>Clear</v-btn>
                      </v-col>
                    </v-col>
                  </v-row>
                </template>
              </flo-expand>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Decoders" elevation="5" @expand="getDecodersData()">
                <template v-slot:content="{}">
                  <v-dialog :overlay-opacity="0.4" v-model="clear_decoder_dialog" persistent width="auto ">
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
                            <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"><span class="title text--primary">Are you sure you want to reset to default Decoders?</span> </v-col>
                          </v-row>
                        </v-container>
                      </v-card-text>
                      <v-card-actions>
                        <div class="flex-grow-1"></div>
                        <v-btn color="primary" text @click="clear_decoder_dialog = false">Cancel</v-btn>
                        <v-btn color="primary" text @click="onClearDecoderChanges()">Clear</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                  <v-row no-gutters>
                    <v-col cols="12" class="pa-1">
                      <v-row no-gutters>
                        <v-col cols="12" :lg="getLengthMap(decoder.value)" :xl="getLengthMap(decoder.value)" class="ma-1 pa-1">
                          <v-autocomplete v-model="decoder.value" :label="decoder.label" :hint="decoder.hint" :items="decoder.items" :disabled="!hasPermissionToEdit()" @change="onUnsavedAction(true)" item-text="value" item-value="key" no-data-text="Unsupported file type." multiple deletable-chips chips dense color="primary" persistent-hint outlined>
                            <template v-slot:selection="data">
                              <v-chip class="info chip-close mt-1" :close="!data.item.disabled" v-bind="data.attrs" :input-value="data.selected" @click="data.select" @click:close="clearDecoder(data.item)">
                                {{ data.item.value }}
                              </v-chip>
                            </template></v-autocomplete
                          >
                        </v-col>
                      </v-row>

                      <v-col v-if="hasPermissionToEdit()" align="end" cols="12" class="pa-1">
                        <div class="flex-grow-1"></div>
                        <v-btn color="primary" @click="onSaveDecoderChanges()"><v-icon left>mdi-content-save</v-icon>Save</v-btn>
                        <v-btn color="primary" @click="clear_decoder_dialog = true"><v-icon left>mdi-cancel</v-icon>Clear</v-btn>
                      </v-col>
                    </v-col>
                  </v-row>
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
                                <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"><span class="title text--primary">Are you sure you want to delete ALL Product Certificates?</span> </v-col>
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
                      <flo-meta-table :key="redraw" v-if="translator !== null" @load-data="onLoadCertificatesData($event)" @pre-new="onPreNewCertificate($event)" @pre-edit="onPreEditCertificate($event)" @pre-import-export-create="onPreImportExportCreate($event)" :disableNew="product.state != 'active'" :disabledEdit="product.state != 'active'" :can_import="hasPermissionToImportCerts()" :translator="translator" :hidden_filter="cert_hidden_filter" :show_title="false" accept=".csv" unique="product_certificates" resources="product_certificates">
                        <template v-slot:ex_new="{ fab, color, smAndDown, permissions }">
                          <v-btn v-if="permissions.d == true && product.state != 'deprecated' && product_certificates.length > 0" :fab="fab" :small="smAndDown" class="mr-1" :color="color" @click="deleteAllDialog = true">
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

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Applets & UICC" elevation="5">
                <template v-slot:content="{}">
                  <v-tabs v-model="selected_tab" class="pa-1">
                    <v-tab :key="`1`">Applets</v-tab>
                    <v-tab :key="`2`" v-if="ec">Electrical Profile</v-tab>
                  </v-tabs>
                  <v-tabs-items v-model="selected_tab">
                    <v-tab-item :key="`1`">
                      <v-row no-gutters>
                        <v-col cols="12" class="pa-1">
                          <flo-expand title="Product Applets" open elevation="5">
                            <template v-slot:content="{}">
                              <v-container fluid>
                                <v-row no-gutters>
                                  <v-col cols="12" class="pa-1">
                                    <flo-meta-table v-if="translator !== null" @load-data="onLoadProductAppletsData($event)" @pre-new="onPreNew($event)" @pre-edit="onPreEdit($event)" @post-new="updateProduct($event)" @post-update="updateProduct($event)" @post-delete="updateProduct($event)" :disableNew="!hasPermissionToEdit() || blankProduct()" :disabledEdit="!hasPermissionToEdit() || blankProduct()" :translator="translator" :hidden_filter="oa_hidden_filter" :show_title="false" :title="title" unique="product_applets" resources="product_applets">
                                      <template v-slot:edit_applet_id="{ fmtheader, fmtrow }">
                                        <v-col :__qa="helpers.getQATag('product_applets', fmtheader)" cols="12" lg="6">
                                          <v-autocomplete v-model="fmtrow.applet_id" :label="fmtheader.text" :hint="fmtheader.hint" :items="initial_product_applets" :disabled="!hasPermissionToEdit() || blankProduct()" @change="updateName(fmtrow)" item-text="value" item-value="key" filled persistent-hint></v-autocomplete>
                                        </v-col>
                                      </template>
                                      <template v-slot:view_applet_id="{ fmtrow, fmtpermissions }">
                                        <v-container class="d-flex flex-nowrap">
                                          <span class="align-self-center text-center ml-n3">{{ fmtrow.applet_id }}</span>
                                          <v-btn
                                            class="ml-1"
                                            icon
                                            elevation="0"
                                            router
                                            :disabled="!fmtpermissions.u"
                                            :to="{
                                              path: '/resources/applet/',
                                              query: { id: translator.toSrcByKey('applet_id', fmtrow.applet_id) },
                                            }"
                                          >
                                            <v-icon center color="info">mdi-link</v-icon>
                                          </v-btn>
                                        </v-container>
                                      </template>
                                    </flo-meta-table>
                                  </v-col>
                                </v-row>
                              </v-container>
                            </template>
                          </flo-expand>
                        </v-col>
                      </v-row>

                      <v-row no-gutters v-if="product_applets.length > 0 && applet_tab == 0">
                        <v-col cols="12" class="pa-1">
                          <flo-expand title="Virtual Files" elevation="5" @expand="onExpand()">
                            <template v-slot:content="{}">
                              <v-container fluid>
                                <v-row no-gutters>
                                  <v-col cols="12" class="pa-1">
                                    <flo-meta-table v-if="translator !== null" @load-data="onLoadVfAppletData($event)" :disabledEdit="!hasPermissionToEdit()" :can_import="hasPermissionToEdit()" :translator="translator" :hidden_filter="applet_hidden_filter" :show_title="false" :title="title" disableNew dialogWidth="1400px" resources="vfile_definitions">
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
                    </v-tab-item>

                    <v-tab-item :key="`2`" v-if="ec">
                      <v-row no-gutters>
                        <v-col cols="12" class="pa-1">
                          <flo-expand title="EC Details" open elevation="5">
                            <template v-slot:content="{}">
                              <flo-ec-json readonly allow_redirect :uicc="uicc_res" :value="ec" @update="onEcUpdate($event)" />
                            </template>
                          </flo-expand>
                        </v-col>
                      </v-row>
                      <v-row no-gutters v-if="uicc_res != null">
                        <v-col cols="12" class="px-1 pb-3">
                          <flo-expand title="Virtual Files" elevation="5">
                            <template v-slot:content="{}">
                              <v-container fluid>
                                <v-row no-gutters>
                                  <v-col cols="12" class="pa-1">
                                    <flo-meta-table v-if="translator !== null" @load-data="onLoadVfUiccData($event)" :translator="translator" :hidden_filter="uicc_hidden_filter" :show_title="false" :title="title" disableNew disabledEdit dialogWidth="1400px" resources="vfile_definitions">
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
                    </v-tab-item>
                  </v-tabs-items>
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
import floVirtualFieldTable from "~/components/virtual/floVirtualFieldTable.vue";
import floParserView from "~/components/widgets/floParserView.vue";
import floMccList from "~/components/widgets/floMccList.vue";
import floEcJson from "~/components/se/floEcJson.vue";
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import tellUser from "~/mixins/tellUser.js";
import DateUtils from "~/src/dateUtils.js";
import helpers from "~/src/helpers.js";
import { mapGetters } from "vuex";
export default {
  head() {
    return {
      title: this.title,
    };
  },
  name: "flo-product",
  components: {
    floEcJson,
    floMccList,
    floParserView,
    floVirtualFieldTable,
  },
  data: () => ({
    helpers,
    resources: "products",
    title: "Product",
    loading: false,
    translator: null,
    selected_tab: 0,
    product: null,
    product_applets: [],
    initial_product_applets: [],
    all_products: [],
    products: [],
    product_certificates: [],
    cert_hidden_filter: [],
    oa_hidden_filter: [],
    applet_hidden_filter: [],
    uicc_hidden_filter: [],
    ec: null,
    applet_tab: 0,
    applet_res: null,
    uicc_res: null,
    applet: null,
    rfs_ec: null,
    rfs_applet: null,
    enum_add_key: "",
    enum_add_value: "",
    extra_key: 1,
    redraw: 0,
    deleteDialog: false,
    deleteAllDialog: false,
    deleteLoader: false,
    crud: null,
    personal: {
      adm: {
        label: "ADM",
        hint: "Administrator Key",
        value: true,
        digits_only: false,
        rule: (v) => !!v || "ADM is required.",
      },
      pin1: {
        label: "PIN1",
        hint: "Personal Identification Number 1",
        value: true,
        fixed: "",
        rule: (v) => {
          const pattern = /^[0-9]{4,8}$/;
          return pattern.test(v) || "Invalid PIN format.";
        },
      },
      puk1: {
        label: "PUK1",
        hint: "Personal Unblocking Key 1",
        value: true,
        fixed: "",
        rule: (v) => {
          const pattern = /^[0-9]{4,8}$/;
          return pattern.test(v) || "Invalid PUK format.";
        },
      },
      pin2: {
        label: "PIN2",
        hint: "Personal Identification Number 2",
        value: true,
        fixed: "",
        rule: (v) => {
          const pattern = /^[0-9]{4,8}$/;
          return pattern.test(v) || "Invalid PIN format.";
        },
      },
      puk2: {
        label: "PUK2",
        hint: "Personal Unblocking Key 2",
        value: true,
        fixed: "",
        rule: (v) => {
          const pattern = /^[0-9]{4,8}$/;
          return pattern.test(v) || "Invalid PUK format.";
        },
      },
    },
    bindings: {
      hlr: {
        label: "HLR",
        hint: "Home Location Registrar",
        items: [],
      },
      smsc: {
        label: "SMSC",
        hint: "Short Message Service Center",
        items: [],
      },
      bip: {
        label: "BIP",
        hint: "Bearer Independent Protocol",
        items: [],
      },
      billing: {
        label: "Billing",
        hint: "Billing",
        items: [],
      },
      apn: {
        label: "APN",
        hint: "Access Point Name",
        items: [],
      },
      create_sub: {
        label: "Create Subscriber",
        hint: "Create New Subscriber",
        value: false,
      },
    },
    name: {
      label: "Name",
      hint: "Subscriber Name",
      rule: (v) => {
        const pattern = /^.{2,}$/;
        return pattern.test(v) || "Invalid name format.";
      },
    },
    plmn: {
      label: "PLMN",
      hint: "Subscriber PLMN",
      rule: (v) => {
        const pattern = /^$|^([0-9]{5}[0-9Ff]{1}[0-9A-Fa-f]{4})(,([0-9]{5}[0-9Ff]{1}[0-9A-Fa-f]{4}))*$/;
        return pattern.test(v) || "Invalid PLMN format.";
      },
    },
    ehplmn: {
      label: "EHPLMN",
      hint: "Equivalent Home PLMN",
      rule: (v) => {
        const pattern = /^$|^([0-9]{5}[0-9Ff]{1})(,([0-9]{5}[0-9Ff]{1}))*$/;
        return pattern.test(v) || "Invalid EHPLMN format.";
      },
    },
    fplmn: {
      label: "FPLMN",
      hint: "Forbidden PLMN",
      rule: (v) => {
        const pattern = /^$|^([0-9]{5}[0-9Ff]{1})(,([0-9]{5}[0-9Ff]{1}))*$/;
        return pattern.test(v) || "Invalid FPLMN format.";
      },
    },
    pattern: {
      label: "Pattern",
      hint: "Validation Pattern",
      rule: (v) => {
        const pattern = /^[^\s].+[^\s]$/;
        return pattern.test(v) || "Invalid Pattern format.";
      },
    },
    mcc: {
      label: "MCC List",
      hint: "Mobile Country Code Availability",
    },
    sub_key_ids: {
      label: "KI/OPC Index",
      hint: "KI/OPC Index In Store",
      items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    sub_ki: {
      value: "keep",
      label: "KI",
      hint: "Subscriber Key",
      items: [
        { key: "keep", value: "Keep" },
        { key: "map", value: "Map" },
        { key: "keep_and_wrap", value: "Keep & Wrap" },
        // { key: "shared", value: "Shared" },
        { key: "fixed", value: "Fixed" },
        { key: "drive", value: "Drive" },
      ],
    },
    sub_opc: {
      value: "keep",
      label: "OPC",
      hint: "Computed Operation between OP (Operator Key) and KI (Subscriber Key)",
      items: [
        { key: "keep", value: "Keep" },
        { key: "keep_and_wrap", value: "Keep & Wrap" },
        // { key: "shared", value: "Shared" },
        { key: "fixed", value: "Fixed" },
        { key: "drive", value: "Drive" },
      ],
    },
    network_keys: {
      value: "keep",
      label: "Network Keys",
      hint: "Computed Operations between KI (Subscriber Key) and OP (Operator Key)",
      items: [
        { key: "keep", value: "Keep" },
        { key: "map", value: "Map" },
        { key: "drive", value: "Drive KI/OPC" },
        { key: "drive_ki", value: "Drive KI Only" },
        { key: "drive_opc", value: "Drive OPC Only" },
        { key: "fixed_ki_opc", value: "Fixed KI/OPC" },
        { key: "fixed_ki", value: "Fixed KI Only" },
        // { key: "keep_and_wrap", value: "Keep & Wrap" },
        // { key: "shared", value: "Shared" },
      ],
    },
    subs_idx: {
      items: [],
      label: "Map Subscriber",
      hint: "Mapped subscriber",
    },
    profile_id: {
      label: "Profile Id",
      hint: "Profile Id",
      rule: (v) => {
        const pattern = /^[0-9]*$/;
        return pattern.test(v) || "Invalid Profile ID format.";
      },
    },
    steering_id: {
      label: "Steering Id",
      hint: "Steering Id",
      rule: (v) => {
        const pattern = /^[0-9]*$/;
        return pattern.test(v) || "Invalid Steering Id format.";
      },
    },
    op: {
      label: "OP",
      hint: "Operator Key",
      no_data_text: "Please select valid Registrar",
      items: [],
    },
    sub: { label: "Sub: 1", idx: 1, used: 1, name: "", mcc: ["FFF"], plmn: "", fplmn: "", ehplmn: "", key_id: 0, network_keys: ["keep"], map_ki_opc: "", hlr_id: 0, smsc_id: 0, apn: 0, bip_id: 0, billing_id: 0 },
    subs: [],
    selected_subs: [],
    disable_personal: false,
    valid_personal: false,
    valid: false,
    clear_decoder_dialog: false,
    clear_personals_dialog: false,
    clear_subscribers_dialog: false,
    bap: {
      dialog: false,
      state: {
        value: "",
        label: "BAP State",
        hint: "Product BAP State",
        items: [
          { key: "setup", value: "Setup" },
          { key: "sent", value: "Sent" },
          { key: "received", value: "Received" },
          { key: "testing", value: "Testing" },
          { key: "approved", value: "Approved" },
          { key: "rejected", value: "Rejected" },
        ],
      },
      email: {
        label: "User Email",
        hint: "BAP User Email",
      },
      ts: {
        label: "BAP Time Stamp",
        hint: "BAP Time Stamp",
      },
      comment: {
        value: "",
        label: "BAP Comments",
      },
    },
    decoder: {
      label: "Order Decoders",
      hint: "Specify Order Decoders",
      value: ["flolive - .json", "flolive - .outp", "reconcile - .json", "flolive_bss - .inp", "flolive_bss - .outp", "flolive_hss - .inp", "flolive_hss - .outp", "flo_identifiers - .csv"],
      items: [
        { key: "redtea - .inp", value: "RedTea - .inp" },
        { key: "redtea - .outp", value: "RedTea - .outp" },
        { key: "kigen - .inp", value: "Kigen - .inp" },
        { key: "kigen - .outp", value: "Kigen - .outp" },
        { key: "gsma - .inp", value: "GSMA - .inp" },
        { key: "gsma - .outp", value: "GSMA - .outp" },
        { key: "qualcomm - .inp", value: "Qualcomm - .inp" },
        { key: "qualcomm - .outp", value: "Qualcomm - .outp" },
        { key: "thales - .inp", value: "Thales - .inp" },
        { key: "thales - .outp", value: "Thales - .outp" },
        { key: "valid_v1 - .inp", value: "Valid version 1 - .inp" },
        { key: "valid_v2 - .inp", value: "Valid version 2 - .inp" },
        { key: "valid_v1 - .outp", value: "Valid version 1 - .outp" },
        { key: "valid_v2 - .outp", value: "Valid version 2 - .outp" },
        { key: "flolive - .json", value: "floLive - .json", disabled: true },
        { key: "flolive - .outp", value: "floLive - .outp", disabled: true },
        { key: "reconcile - .json", value: "Reconcile - .json", disabled: true },
        { key: "flolive_bss - .inp", value: "floLive BSS - .inp", disabled: true },
        { key: "flolive_bss - .outp", value: "floLive BSS - .outp", disabled: true },
        { key: "flolive_hss - .inp", value: "floLive HSS - .inp", disabled: true },
        { key: "flolive_hss - .outp", value: "floLive HSS - .outp", disabled: true },
        { key: "flo_identifiers - .csv", value: "floLive Identifiers - .csv", disabled: true },
      ],
    },
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
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  async created() {
    await this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    blankProduct() {
      return this.product.type == "blank" ? true : false;
    },
    shrinkBigLine(p_line) {
      let l_msg = p_line;
      if (l_msg.length > 64) {
        l_msg = l_msg.substr(0, 64) + " ...";
      }
      return l_msg;
    },
    getExtra() {
      if (!this.product.hasOwnProperty("extra")) {
        return null;
      }
      return this.product.extra;
    },
    async saveExtra(p_extra) {
      let l_product = this.product;

      let l_put = {};
      l_put["id"] = l_product.id;
      l_put["extra"] = p_extra;

      try {
        let lupdate = await this.$axios.$put(`/api/v1/products/${l_put.id}`, l_put);
        this.tellUser("success", `products Id:${lupdate["id"]} updated successfully.`);
        l_product.extra = lupdate.extra;
        this.extra_key++;
        this.onUnsavedAction(false);
      } catch (err) {
        let lerr = this.parseNetError(err);
        console.log(`crud table: save - fail: ${lerr.statusCode} - ${lerr.message}`);
        this.tellUser("error", `Save: ${lerr.statusCode} - ${lerr.message}`);
      }
    },
    getLocalPermissions() {
      let user_permissions = this.$store.state.session.permissions;
      let l_permissions = user_permissions.find((p) => this.resources == p.res);

      return l_permissions;
    },
    getLocalMeta(val) {
      let l_meta = {
        crud: {
          c: true,
          d: true,
          r: true,
          u: true,
        },

        indexes: {
          primary: {
            0: "pos",
          },
        },

        isolated: true,
        item_name: this.helpers.capitalizeFLetter(val),
        limit: 100,
        screen_name: `${this.helpers.capitalizeFLetter(val)}s`,
        group: "none",
        table: "none",
        keys: {
          pos: {
            default: 1,
            desc: "Pos",
            hint: "Position",
            nullable: false,
            pattern: "^[0-9]*$",
            scale: 0,
            size: 10,
            type: "number",
          },
          name: {
            default: "",
            desc: "Name",
            hint: "Item Name",
            nullable: false,
            pattern: "^[^\\s].*[^\\s]$",
            scale: null,
            size: 50,
            type: "string",
          },
          desc: {
            default: "",
            desc: "Description",
            hint: "Item Description",
            nullable: false,
            pattern: ".*",
            scale: null,
            size: 250,
            type: "string",
          },
          hint: {
            default: "",
            desc: "Hint",
            hint: "Item Hint",
            nullable: false,
            pattern: ".*",
            scale: null,
            size: 250,
            type: "string",
          },
          default: {
            default: "",
            desc: "Default",
            hint: "Default Value",
            nullable: false,
            pattern: ".*",
            scale: null,
            size: 250,
            type: "string",
          },
          type: {
            default: "string",
            desc: "Type",
            hint: "Data Type",
            nullable: false,
            pattern: "enum",
            scale: null,
            size: 250,
            type: "string",
            enum: [
              { key: "string", value: "String" },
              { key: "boolean", value: "Boolean" },
              { key: "number", value: "Number" },
              // { key: "enum", value: "List" }
            ],
          },
          origin: {
            default: "user",
            desc: "Origin",
            hint: "Origin",
            nullable: false,
            pattern: "enum",
            scale: null,
            size: 250,
            type: "string",
            enum: [
              { key: "user", value: "User" },
              { key: "dedicated", value: "Dedicated" },
              { key: "creation", value: "Creation Only" },
              { key: "system", value: "System" },
              { key: "fixed", value: "Fixed" },
            ],
          },
          pattern: {
            default: ".*$",
            desc: "Pattern",
            hint: "Validation Pattern",
            nullable: false,
            pattern: ".*",
            scale: null,
            size: 250,
            type: "string",
          },
          required: {
            default: 0,
            desc: "Required",
            nullable: false,
            pattern: "^[01]$",
            scale: 0,
            size: 1,
            type: "boolean",
          },
          enum: {
            default: [],
            desc: "List",
            hint: "Value List",
            nullable: false,
            pattern: ".*",
            scale: null,
            size: 250,
            type: "string",
          },
        },
      };

      return l_meta;
    },
    getLocalHeadersData() {
      let records = JSON.parse(JSON.stringify([]));

      let extra = this.getExtra();
      if (!extra) {
        return records;
      }

      if (!extra.hasOwnProperty("data")) {
        return records;
      }

      let data = extra.data;

      if (!data.hasOwnProperty("headers")) {
        return records;
      }

      records = JSON.parse(JSON.stringify(data.headers));
      return records;
    },
    onLoadCertificatesData(data) {
      this.product_certificates = data.items;
      for (const header of data.headers) {
        switch (header.value) {
          case "id":
          case "ts":
          case "user_email":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "product_id":
            {
              header.view = false;
              header.edit = false;
              header.disable_new = true;
            }
            break;
        }
      }
    },
    onLoadDataHeaders(data) {
      for (const header of data.headers) {
        switch (header.value) {
          case "size":
          case "pattern":
          case "enum":
            {
              header.view = false;
              header.edit = true;
              header.disable_edit = false;
              header.disable_new = false;
            }
            break;
          case "pos":
            {
              header.view = false;
              header.edit = false;
              header.disable_edit = false;
              header.disable_new = false;
            }
            break;
        }
      }
    },
    onCancelLocalHeadersChanges(event) {
      event.records = this.getLocalHeadersData();
      this.onUnsavedAction(false);
    },
    onSaveLocalHeadersChanges(event) {
      let extra = this.getExtra();
      if (!extra) {
        extra = {
          type: "extra",
          data: {
            headers: [],
            inputs: [],
          },
        };
      }

      if (!extra.hasOwnProperty("type")) {
        extra["type"] = "extra";
      }

      if (!extra.hasOwnProperty("data")) {
        extra["data"] = {
          headers: [],
          inputs: [],
        };
      }

      let records = event.records;
      for (let i = 0; i < records.length; i++) {
        let record = records[i];
        record.pos = i + 1;

        if (record.type == "number") {
          record.default = +record.default;
        } else if (record.type == "boolean") {
          record.default = +record.default;
        }
      }

      extra.data.headers = records;
      this.saveExtra(extra);
    },
    getLocalInputsData() {
      let records = JSON.parse(JSON.stringify([]));

      let extra = this.getExtra();
      if (!extra) {
        return records;
      }

      if (!extra.hasOwnProperty("data")) {
        return records;
      }

      let data = extra.data;

      if (!data.hasOwnProperty("inputs")) {
        return records;
      }

      records = JSON.parse(JSON.stringify(data.inputs));

      return records;
    },
    onLoadDataInputs(data) {
      for (const header of data.headers) {
        switch (header.value) {
          case "size":
          case "pattern":
          case "enum":
            {
              header.view = false;
              header.edit = true;
              header.disable_edit = false;
              header.disable_new = false;
            }
            break;
          case "pos":
            {
              header.view = false;
              header.edit = false;
              header.disable_edit = false;
              header.disable_new = false;
            }
            break;
        }
      }
    },
    onCancelLocalInputsChanges(event) {
      event.records = this.getLocalInputsData();
      this.onUnsavedAction(false);
    },
    onSaveLocalInputsChanges(event) {
      let extra = this.getExtra();
      if (!extra) {
        extra = {
          type: "extra",
          data: {
            headers: [],
            inputs: [],
          },
        };
      }

      if (!extra.hasOwnProperty("type")) {
        extra["type"] = "extra";
      }

      if (!extra.hasOwnProperty("data")) {
        extra["data"] = {
          headers: [],
          inputs: [],
        };
      }

      let records = event.records;
      for (let i = 0; i < records.length; i++) {
        let record = records[i];
        record.pos = i + 1;

        if (record.type == "number") {
          record.default = +record.default;
        } else if (record.type == "boolean") {
          record.default = +record.default;
        }
      }

      extra.data.inputs = event.records;
      this.saveExtra(extra);
    },
    getPersonalizationData() {
      let records = JSON.parse(JSON.stringify([]));

      let extra = this.getExtra();
      if (!extra) {
        return records;
      }

      if (!extra.hasOwnProperty("data")) {
        return records;
      }

      let data = extra.data;

      if (!data.hasOwnProperty("personalization_keys")) {
        return records;
      }
      records = JSON.parse(JSON.stringify(data.personalization_keys));
      this.disable_personal = records.disable_personal;
      this.personal = this.mapPersonalizationData(records, this.personal);
    },
    onSavePersonalizationChanges() {
      let extra = this.getExtra();
      if (!extra) {
        extra = {
          type: "extra",
          data: {
            headers: [],
            inputs: [],
            personalization_keys: [],
          },
        };
      }

      if (!extra.hasOwnProperty("type")) {
        extra["type"] = "extra";
      }

      if (!extra.hasOwnProperty("data")) {
        extra["data"] = {
          headers: [],
          inputs: [],
          personalization_keys: [],
        };
      }
      extra.data.personalization_keys = this.formatPersonalizationData(this.personal);
      this.saveExtra(extra);
    },
    formatPersonalizationData(record) {
      let formatted = {
        disable_personal: this.disable_personal,
      };

      for (let key in record) {
        let item = record[key];
        let formattedItem = {
          type: item.value ? "random" : "fixed",
        };

        if (!item.value) {
          formattedItem.fixed = item.fixed || "";
        }

        if (formattedItem.type == "fixed") {
          delete formattedItem.digits_only;
        } else {
          formattedItem.digits_only = item.digits_only;
        }

        formatted[key] = formattedItem;
      }

      return formatted;
    },
    mapPersonalizationData(record, personal) {
      for (let key in record) {
        if (personal[key]) {
          if (personal[key].hasOwnProperty("digits_only")) {
            personal[key].digits_only = record[key].digits_only;
          }

          if (record[key].type == "random") {
            personal[key].value = true;
            personal[key].fixed = "";
          } else {
            personal[key].value = false;
            personal[key].fixed = record[key].fixed;
          }
        }
      }

      return personal;
    },
    onClearPersonalizationChanges() {
      let personal = this.personal;
      personal.adm.value = true;
      personal.adm.digits_only = false;
      personal.adm.fixed = "";
      personal.pin1.value = true;
      personal.pin1.fixed = "";
      personal.pin2.value = true;
      personal.pin2.fixed = "";
      personal.puk1.value = true;
      personal.puk1.fixed = "";
      personal.puk2.value = true;
      personal.puk2.fixed = "";
      this.clear_personals_dialog = false;
      this.onSavePersonalizationChanges();
    },
    clearBap() {
      this.bap.dialog = false;
      this.bap.state.value = this.product.bap_state;
      this.bap.comment.value = this.product.bap_comment;
    },
    async onSubscriberExpand() {
      this.loading = true;
      await Promise.all([this.loadSmscs(), this.loadBips(), this.loadHlrs(), this.loadBillings(), this.loadApns()]);
      this.getSubscribersData();
      this.loading = false;
    },
    getSubscribersData() {
      let records = JSON.parse(JSON.stringify([]));

      let extra = this.getExtra();
      if (!extra) {
        return records;
      }

      if (!extra.hasOwnProperty("data")) {
        return records;
      }
      let data = extra.data;
      let pairs = [];

      if (data.hasOwnProperty("inputs") && data.inputs.length > 0) {
        data.inputs.forEach((f) => {
          if (f.name.startsWith("imsi")) {
            let idx = f.name.match(/\d+/);
            if (idx) {
              let found = data.inputs.find((f) => f.name == `msisdn${idx[0]}`);
              if (found) {
                pairs.push({
                  imsi: f.name,
                  msisdn: found.name,
                });
              }
            }
          }
        });
      }

      if (!data.hasOwnProperty("subscribers")) {
        return this.formatSubscribersData(records, pairs);
      }

      for (let i = 0; i < data.subscribers.length; i++) {
        const l_sub = data.subscribers[i];
        if (!l_sub.hasOwnProperty("network_keys")) {
          l_sub.network_keys = ["keep", "map", "drive"];
        }
      }

      this.formatSubscribersData(JSON.parse(JSON.stringify(data.subscribers)), pairs);
    },
    formatSubscribersData(record, pairs) {
      this.subs = record;
      this.selected_subs = [];

      if (this.blankProduct()) {
        this.selected_subs = [1];
      } else {
        record.length == 0 ? (this.selected_subs = [1]) : "";
      }

      for (let i = 0; i < pairs.length; i++) {
        if (i < this.subs.length) {
          let sub = this.subs[i];
          if (sub) {
            if (sub.hlr_id && sub.idx) {
              this.setSubscriberDefaults(sub.hlr_id, sub.idx, sub.op_net_id, sub.profile_id, sub.steering_id);
            }
          }
          this.selected_subs.push({
            label: `Sub: ${sub.idx}`,
            idx: sub.idx,
          });
        } else {
          this.subs.push({
            ...this.sub,
            label: `Sub: ${i + 1}`,
            idx: i + 1,
          });
        }
      }
    },
    getDecodersData() {
      let records = JSON.parse(JSON.stringify([]));

      let extra = this.getExtra();
      if (!extra) {
        return records;
      }

      if (!extra.hasOwnProperty("data")) {
        return records;
      }

      let data = extra.data;

      if (!data.hasOwnProperty("decoders")) {
        return records;
      }
      records = JSON.parse(JSON.stringify(data.decoders));
      this.decoder.value = records;
    },
    clearDecoder(item) {
      let idx = this.decoder.value.indexOf(item.key);
      if (idx >= 0) {
        this.decoder.value.splice(idx, 1);
      }
    },
    async onSaveDecoderChanges(clear) {
      let extra = this.getExtra();
      if (!extra) {
        extra = {
          type: "extra",
          data: {
            headers: [],
            inputs: [],
            personalization_keys: [],
          },
        };
      }

      if (!extra.hasOwnProperty("type")) {
        extra["type"] = "extra";
      }

      if (!extra.hasOwnProperty("data")) {
        extra["data"] = {
          headers: [],
          inputs: [],
          personalization_keys: [],
          decoders: [],
        };
      }
      extra.data.decoders = clear ? ["flolive - .json", "flolive - .outp", "reconcile - .json", "flolive_bss - .inp", "flolive_bss - .outp", "flolive_hss - .inp", "flolive_hss - .outp", "flo_identifiers - .csv"] : this.decoder.value;
      await this.saveExtra(extra);
    },
    async onClearDecoderChanges() {
      await this.onSaveDecoderChanges(true);
      this.getDecodersData();
      this.clear_decoder_dialog = false;
    },
    async onSaveSubscribersChanges(clear) {
      let extra = this.getExtra();
      if (!extra) {
        extra = {
          type: "extra",
          data: {
            headers: [],
            inputs: [],
            personalization_keys: [],
          },
        };
      }

      if (!extra.hasOwnProperty("type")) {
        extra["type"] = "extra";
      }

      if (!extra.hasOwnProperty("data")) {
        extra["data"] = {
          headers: [],
          inputs: [],
          personalization_keys: [],
          subscribers: [],
        };
      }
      extra.data.subscribers = clear ? [] : this.subs.filter((f) => this.showSubscribers(f));
      await this.saveExtra(extra);
    },
    async onClearSubscribersChanges() {
      await this.onSaveSubscribersChanges(true);
      this.getSubscribersData();
      this.clear_subscribers_dialog = false;
    },
    showSubscribers(sub) {
      return this.selected_subs.includes(sub.idx) || this.selected_subs.some((s) => parseInt(s.idx) === sub.idx);
    },
    onLoadVfAppletData(data) {
      for (const header of data.headers) {
        switch (header.value) {
          case "rid":
          case "resource":
            {
              header.view = false;
            }
            break;
          case "fields":
            {
              header.view = false;
            }
            break;
          case "ui":
            {
              header.view = false;
            }
            break;
        }
      }
    },
    onUnsavedAction(action) {
      this.$emit("unsaved-action", action);
    },
    onExportData(event) {
      let data = event;

      if (data) {
        let download = `${this.product.name.toLowerCase().replace(/ /g, "_")}_${data.type}.json`;
        let blob = new Blob([JSON.stringify(data, null, 2)], { type: "text/json" });
        let url = URL.createObjectURL(blob);
        let link = document.createElement("a");
        link.href = url;
        link.download = download;
        link.click();
        link.remove();
      }
    },
    onLoadVfUiccData(data) {
      for (const header of data.headers) {
        switch (header.value) {
          case "rid":
          case "resource":
            {
              header.view = false;
              header.edit = false;
            }
            break;
          case "fields":
            {
              header.view = false;
            }
            break;
          case "ui":
            {
              header.view = false;
            }
            break;
        }
      }
    },
    onLoadProductAppletsData(data) {
      this.product_applets = data.items;

      for (const header of data.headers) {
        switch (header.value) {
          case "id":
          case "ts":
          case "name":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "product_id":
            {
              header.view = false;
              header.edit = false;
              header.disable_new = true;
            }
            break;
        }
      }
    },
    hasPermissionToEdit() {
      if (this.product.state == "active" && this.crud.c == true) {
        return true;
      }

      return false;
    },
    hasPermissionToImportCerts() {
      let crud = this.getPermissions.find((f) => "product_certificates" == f.res);
      if (this.product.state == "active" && crud.c == true) {
        return true;
      }

      return false;
    },
    async initialize() {
      this.product = this.value;
      this.bap.state.value = this.product.bap_state;
      this.bap.comment.value = this.product.bap_comment;
      this.crud = this.getPermissions.find((f) => "products" == f.res);
      this.rfs_applet = await this.load_applet_rfs();
      if (this.rfs_applet) {
        this.applet = JSON.parse(this.string_from_base64(this.data_url_get_base64(this.rfs_applet.content.data_url)));
      }
      this.uicc_hidden_filter = [
        {
          k: "rid",
          op: "equal",
          v: this.value.uicc_id,
        },
        {
          k: "resource",
          op: "equal",
          v: "uiccs",
        },
      ];

      this.rfs_ec = await this.load_ec_rfs();
      await this.loadUicc();

      if (this.product.id) {
        this.products.push({ key: this.product.id, value: this.product.name });
        this.oa_hidden_filter = [
          {
            k: "product_id",
            op: "equal",
            v: this.product.id,
          },
        ];
        this.cert_hidden_filter = [
          {
            k: "product_id",
            op: "equal",
            v: this.product.id,
          },
        ];
      }

      if (this.rfs_ec) {
        this.ec = JSON.parse(this.string_from_base64(this.data_url_get_base64(this.rfs_ec.content.data_url)));
      }

      this.subs_idx.items.push(
        ...Array.from({ length: 10 }, (_, i) => ({
          key: `map: ${i + 1}`,
          value: `Map to Subscriber ${i + 1}`,
        })),
      );
      await this.loadProducts();
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      translator.setEnumEx("product_id", this.products, true);
      translator.setEnumEx("countries", this.$store.getters["session/cache"]["/denum/mcc"].value);
      await this.loadApplets(translator);
      this.translator = translator;
    },
    async rfs_fields_ls(resource, id, field) {
      try {
        let request = {
          field: field,
          id: id,
        };
        let answer = await this.$axios.$post(`api/v1/${resource}/rfs/list`, request);
        if (answer.length == 0) {
          return null;
        }
        return answer;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      return null;
    },
    async rfs_field_ls(resource, id, field) {
      let answer = await this.rfs_fields_ls(resource, id, field);
      if (answer && answer.length > 0) {
        return answer[0];
      }
      return null;
    },
    async rfs_add(rfs) {
      let answer = null;
      rfs.flm = DateUtils.localToLocalLikeIso(new Date());
      try {
        let answer = await this.$axios.$post(`/api/v1/rfs`, rfs);
        if (answer != null) {
          this.tellUser("success", `${answer.resource} Id: ${answer.id} created successfully.`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      return answer;
    },
    async rfs_update(rfs) {
      let answer = null;
      rfs.flm = DateUtils.localToLocalLikeIso(new Date());

      try {
        answer = await this.$axios.$put(`/api/v1/rfs/${rfs.id}`, rfs);
        if (answer != null) {
          this.tellUser("success", `${answer.resource} Id: ${answer.id} updated successfully.`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      return answer;
    },
    async rfs_cat(id, resource) {
      let answer = null;
      try {
        answer = await this.$axios.$get(`/api/v1/${resource}/rfs/${id}`);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      return answer;
    },
    async load_applet_rfs() {
      let answer = null;
      try {
        if (null != this.applet_res) {
          answer = await this.rfs_field_ls("applets", this.applet_res.id, "applet_setup");
        }
        if (answer) {
          answer = await this.rfs_cat(answer.id, "applets");
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      return answer;
    },
    async load_ec_rfs() {
      let answer = null;
      try {
        answer = await this.rfs_field_ls("uiccs", this.product.uicc_id, "ec");
        if (answer) {
          answer = await this.rfs_cat(answer.id, "uiccs");
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      return answer;
    },
    base64_from_string(string) {
      let base64 = btoa(string);
      return base64;
    },
    string_from_base64(base64) {
      let string = atob(base64);
      return string;
    },
    data_url_get_base64(data_url) {
      let bas64_pos = data_url.indexOf(",") + 1;
      return data_url.substring(bas64_pos);
    },
    gen_data_url(type, base64) {
      let durl = `data:${type};base64,${base64}`;
      return durl;
    },
    onPreEdit(data) {
      let found = this.findApplet(data.record.applet_id);
      data.record.product_id = this.product.id;
      data.record.applet_id = found.key;
    },
    onPreNew(data) {
      data.record.product_id = this.product.id;
    },
    async updateProduct() {
      await this.loadProduct();
    },
    onPreEditCertificate(data) {
      data.record.product_id = this.product.id;
    },
    onPreNewCertificate(data) {
      data.record.product_id = this.product.id;
    },
    onPreImportExportCreate(event) {
      if (event && event.data) {
        event.data.product_id = this.product.id;
      }
    },
    updateName(row) {
      let filtered = this.initial_product_applets.filter((f) => f.key == row.applet_id);
      row.name = filtered[0].value;
    },
    onExpand() {
      if (this.product_applets.length > 0) {
        this.product_applets.forEach((applet) => {
          let filtered = this.initial_product_applets.filter((app) => app.value == applet.applet_id);
          if (filtered.length > 0) {
            this.applet_hidden_filter = [
              {
                k: "rid",
                op: "equal",
                v: filtered[0].key,
              },
              {
                k: "resource",
                op: "equal",
                v: "applets",
              },
            ];
          }
        });
      }
    },
    getEnumList(p_enum) {
      console.log(`floProduct - getEnumList - p_row:${JSON.stringify(p_enum)}`);

      if (!p_enum) {
        return [];
      }

      let l_list = p_enum.map((m) => m.key);
      console.log(`floProduct - getEnumList - list:${JSON.stringify(l_list)}`);
      return l_list;
    },
    onEnumChange(p_row, p_event) {
      console.log(`floProduct - onEnumChange - p_row:${JSON.stringify(p_row)} p_event:${JSON.stringify(p_event)}`);
      if (!p_event) {
        p_row.enum = [];
        return;
      }
      p_row.enum = p_row.enum.filter((f) => p_event.includes(f.key));
    },
    onEnumAdd(p_row) {
      console.log(`floProduct - onEnumAdd - fmtrow.enum:${JSON.stringify(p_row)}`);
      if (!p_row.hasOwnProperty("enum")) {
        p_row["enum"] = [];
      }

      let l_enum = JSON.parse(JSON.stringify(p_row.enum));
      l_enum.push({ key: `${this.enum_add_key}`, value: `${this.enum_add_key} - ${this.enum_add_value}` });
      console.log(`floProduct - clone`);
      p_row.enum = l_enum;
      this.enum_add_key = "";
      this.enum_add_value = "";
    },
    getEnumCopy(p_enum) {
      return JSON.parse(JSON.stringify(p_enum));
    },
    formatHeader(header) {
      let l_header = header;
      let { uicc_id, replacement_product_id, base_product_id } = this.product;
      let products = this.all_products;

      l_header.type = "link";
      switch (l_header.value) {
        case "uicc_id":
          l_header["path"] = "/resources/uiccs/";
          l_header["query"] = { id: uicc_id };
          l_header.data = this.uicc_res ? this.uicc_res.name : 0;
          break;
        case "replacement_product_id":
          l_header["path"] = `/resources/products/`;
          l_header["query"] = { id: replacement_product_id };
          l_header.data = products.length > 0 && replacement_product_id ? products.find((f) => f.id == replacement_product_id).name : 0;
          break;
        case "base_product_id":
          l_header["path"] = `/resources/products/`;
          l_header["query"] = { id: base_product_id };
          l_header.data = products.length > 0 && base_product_id ? products.find((f) => f.id == base_product_id).name : 0;
          break;
      }

      return l_header;
    },
    formatDynamicIdentifiersHint(type, value) {
      let hints = {
        keep: `Keep the existing ${type}.`,
        map: `Map the ${type} to existing subscriber.`,
        keep_and_wrap: `Keep the existing ${type} & wrap it.`,
        shared: `Use shared ${type} for all subscribers.`,
        fixed: `Use fixed ${type} for all subscribers.`,
        fixed_ki_opc: `Use fixed KI/OPC for all subscribers.`,
        fixed_ki: `Use fixed KI for all subscribers.`,
        drive: `Drive (create) the ${type}.`,
        drive_ki: `Drive (create) the KI Only.`,
        drive_opc: `Drive (create) the OPC Only.`,
        default: `Select how you would like to manipulate the ${type}.`,
      };

      return hints[value] || hints.default;
    },
    getStateColor(state) {
      let colorMap = {
        deprecated: "error",
        active: "success",
      };

      return colorMap[state] || "warning";
    },
    filterBapStates() {
      let final = ["approved", "rejected"];
      let { value, items } = this.bap.state;
      return items.map((m) => {
        let disabled = { ...m, disabled: true };
        if (final.includes(value) || (final.includes(m.key) && value != "testing")) {
          return disabled;
        }
        return m;
      });
    },
    findApplet(id) {
      return this.initial_product_applets.find((f) => f.value == id);
    },
    findSingle() {
      return this.getLocalHeadersData().find((f) => f.name == "single" && f.default == "1");
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
    getCertStateColor(state) {
      let colorMap = {
        pending: "info",
        pass: "success",
        failed: "error",
        suppress: "warning",
      };

      return colorMap[state] || "warning";
    },
    getLengthMap(value) {
      let len = value.length;
      let lengthMap = {
        0: 2,
        1: 2,
        2: 2,
        3: 3,
        4: 5,
      };

      return lengthMap[len] || 6;
    },
    getTypeColor(type) {
      let colorMap = {
        standard: "info",
        blank: "secondary",
      };

      return colorMap[type] || "warning";
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
    validateDefault(pattern, value) {
      const lpattern = new RegExp(pattern);
      return lpattern.test(value) || `Validation failed, value doesn't match pattern.`;
    },
    clearSubscriberDefaults(idx) {
      let found = this.subs.find((f) => f.idx == idx);
      if (found) {
        found["op_net_id"] = "";
        found["profile_id"] = "";
        found["steering_id"] = "";
      }
    },
    async setSubscriberDefaults(event, idx, op_net_id, profile, steering) {
      if (event) {
        if (this.bindings.hlr.items.length > 0) {
          let { hsm_id, op, profile_id, steering_id } = this.bindings.hlr.items.find((f) => f.key == event);
          let found = this.subs.find((f) => f.idx == idx);
          found["op_net_id"] = op_net_id ?? op;
          found["profile_id"] = profile ?? profile_id;
          found["steering_id"] = steering ?? steering_id;
          await this.loadOpKeys(hsm_id);
        }
      }
    },
    async onAppletUpdate(event) {
      let lstring = JSON.stringify(event);
      let base64 = this.base64_from_string(lstring);
      let data_url = this.gen_data_url(this.rfs_applet.ftype, base64);

      this.rfs_applet.fsize = lstring.length;
      this.rfs_applet.content.data_url = data_url;

      await this.rfs_update(this.rfs_applet);
    },
    async onEcUpdate(event) {
      let lstring = JSON.stringify(event);
      let base64 = this.base64_from_string(lstring);
      let data_url = this.gen_data_url(this.rfs_ec.ftype, base64);

      this.rfs_ec.fsize = lstring.length;
      this.rfs_ec.content.data_url = data_url;

      await this.rfs_update(this.rfs_ec);
    },
    async changeState(action) {
      try {
        let request = { id: this.product.id, action };
        let answer = await this.$axios.$post("/api/v1/products/action", request);
        if (answer != null) {
          this.product = answer;
          this.tellUser("success", `ID: ${this.product.id} state successfully changed to ${this.product.state}.`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async changeEol() {
      try {
        let request = { id: this.product.id, end_of_life: this.product.end_of_life ? 0 : 1 };
        let answer = await this.$axios.$post("/api/v1/products/eol_action", request);
        if (answer != null) {
          this.product = answer;
          this.tellUser("success", `Product EOL ${this.product.end_of_life ? "activated" : "deactivated"} successfully.`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async changeBapState() {
      try {
        let request = { id: this.product.id, bap_state: this.bap.state.value, bap_comment: this.bap.comment.value };
        let answer = await this.$axios.$post("/api/v1/products/bap_action", request);
        if (answer != null) {
          this.product = answer;
          this.clearBap();
          this.tellUser("success", "Product BAP updated successfully.");
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async deleteAll() {
      try {
        let request = {
          product_id: this.product.id,
        };
        let answer = await this.$axios.$post("/api/v1/product_certificates/delete_all", request);
        if (answer != null) {
          this.deleteAllDialog = false;
          this.redraw++;
          this.tellUser("success", "All Product Certificates have been deleted successfully.");
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadApplet() {
      let applet_ids = null != this.value.applet_ids ? this.value.applet_ids : null;
      if (null != applet_ids) {
        try {
          if ("number" != typeof applet_ids && "" != applet_ids) {
            applet_ids = JSON.parse(applet_ids);
            for (const id of applet_ids) {
              let answer = await this.$axios.$get(`/api/v1/applets/${id}`);
              if (1 == answer.is_multi_imsi) {
                this.applet_res = answer;
              }
            }
          } else {
            let answer = await this.$axios.$get(`/api/v1/applets/${applet_ids}`);
            if (Object.keys(answer).length > 0) {
              this.applet_res = answer;
            }
          }
        } catch (err) {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
        }
      }
    },
    async loadUicc() {
      let uicc_id = this.value.hasOwnProperty("uicc_id") ? this.value.uicc_id : null;
      if (uicc_id) {
        try {
          let answer = await this.$axios.$get(`/api/v1/uiccs/${uicc_id}`);
          if (Object.keys(answer).length > 0) {
            this.uicc_res = answer;
          }
        } catch (err) {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
        }
      }
    },
    async loadApplets(translator) {
      try {
        let applets = (
          await this.$axios.$post("api/v1/applets/list", {
            select: {
              key: { k: "id" },
              value: { k: "name" },
              state: { k: "state" },
              is_multi_imsi: { k: "is_multi_imsi" },
            },
          })
        ).map(({ key, value, state, is_multi_imsi }) => ({
          key,
          value: state == "deprecated" ? `${value} - Deprecated` : value,
          disabled: state == "deprecated" ? true : false,
          is_multi_imsi,
        }));
        this.initial_product_applets = applets;
        translator.setEnumEx("applet_id", applets, true);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadHlrs() {
      this.bindings.hlr.items = [];
      try {
        let registrars = await this.$axios.$post("api/v1/registrars/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
            op: { k: "op" },
            hsm_id: { k: "hsm_id" },
            profile_id: { k: "profile_id" },
            steering_id: { k: "steering_id" },
          },
        });
        this.bindings.hlr.items = registrars;

        if (this.blankProduct()) {
          this.bindings.hlr.items.unshift({
            key: 0,
            value: "Blank",
          });
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        if (lerr.statusCode == 403) {
          registrars = [];
        } else {
          this.tellUser("error", lerr);
        }
      }
    },
    async loadSmscs() {
      this.bindings.smsc.items = [];
      try {
        let smscs = await this.$axios.$post("api/v1/smscs/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        this.bindings.smsc.items = smscs;
        if (this.blankProduct()) {
          this.bindings.smsc.items.unshift({
            key: 0,
            value: "Blank",
          });
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadBips() {
      this.bindings.bip.items = [];
      try {
        let bips = await this.$axios.$post("api/v1/bips/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        this.bindings.bip.items = bips;
        if (this.blankProduct()) {
          this.bindings.bip.items.unshift({
            key: 0,
            value: "Blank",
          });
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadBillings() {
      this.bindings.billing.items = [];
      let billings = [];
      try {
        billings = await this.$axios.$post("api/v1/billings/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        this.bindings.billing.items = billings;
        if (this.blankProduct()) {
          this.bindings.billing.items.unshift({
            key: 0,
            value: "Blank",
          });
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        if (lerr.statusCode == 403) {
          this.bindings.billing.items = billings;
        } else {
          this.tellUser("error", lerr);
        }
      }
    },
    async loadApns() {
      this.bindings.apn.items = [];
      try {
        let apns = await this.$axios.$post("api/v1/apns/list", {
          select: {
            key: { k: "apn" },
            value: { k: "apn" },
          },
        });
        this.bindings.apn.items = apns;
        if (this.blankProduct()) {
          this.bindings.apn.items.unshift({
            key: 0,
            value: "Blank",
          });
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadOpKeys(hsm_id) {
      try {
        let query = {
          select: {
            id: {},
            name: {},
          },
          where: [
            {
              k: "hsm_id",
              op: "equal",
              v: hsm_id,
            },
            {
              k: "key_type",
              op: "equal",
              v: "op",
            },
            {
              k: "status",
              op: "equal",
              v: "active",
            },
          ],
        };

        this.op.items = (await this.$axios.$post("api/v1/hsm_keys/list", query)).map(({ id, name }) => ({
          key: id,
          value: name,
        }));
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadProduct() {
      let answer = null;
      try {
        answer = await this.$axios.$get(`/api/v1/products/${this.product.id}`);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      this.product = answer;
      return answer;
    },
    async loadProducts() {
      let answer = null;
      try {
        let query = {
          select: {
            id: {},
            name: {},
          },
        };
        answer = await this.$axios.$post("/api/v1/products/list", query);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      this.all_products = answer;
    },
  },
};
</script>
