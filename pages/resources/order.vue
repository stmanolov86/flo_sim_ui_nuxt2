<template>
  <div>
    <v-card flat outlined class="ma-0 pa-0" v-if="order">
      <v-card-text class="ma-0 pa-0">
        <v-container fluid class="ma-0 pa-0">
          <v-row no-gutters>
            <v-col cols="12" class="ma-1 pa-1">
              <div class="headline">
                Order: {{ order.name.length > 50 ? `${order.name.slice(0, 50)}...` : order.name }} <v-chip label class="text-capitalize" :color="getOrderStateColor(order.state)">{{ order.state }}</v-chip>
                <template v-if="order.state == 'exception' && order.code > 0">
                  <v-chip label outlined :color="getItemCodeColor(order.code)">{{ order.code }} {{ order.message ? `- ${order.message}` : "" }}</v-chip>
                </template>
                <v-chip label :color="getTypeColor(order.type)">{{ helpers.capitalizeAllFLetter(order.type, "_") }}</v-chip>
              </div>
              <v-row no-gutters>
                <v-col cols="10">
                  <blockquote class="blockquote font-weight-light">
                    Id: <code>{{ order.id }}</code
                    >,
                    <span v-if="order.description != ''">
                      Description: <code>{{ order.description }}</code
                      >,</span
                    >
                    <span v-if="product != null">
                      Product:
                      <code>
                        <router-link
                          :to="{
                            path: '/resources/product/',
                            query: { id: product.id },
                          }"
                        >
                          <span>{{ product.name }}</span>
                        </router-link></code
                      >
                    </span>
                    <span v-if="order.reservation_id && reservations.items.length > 0">
                      , Reservation:
                      <code>
                        <span>
                          {{ formatReservationName() }}
                        </span>
                      </code>
                    </span>
                  </blockquote>
                </v-col>
                <div class="flex-grow-1"></div>
                <template v-if="hasPermissionToEdit()">
                  <v-btn class="mt-5 mr-2" v-if="order.state == 'process'" color="primary" @click="changeOrderState('suspend')">
                    <v-icon left> mdi-pause </v-icon>
                    Suspend</v-btn
                  >
                  <v-btn class="mt-5 mr-2" v-if="order.state == 'suspend' || order.state == 'exception'" color="primary" @click="changeOrderState('resume')">
                    <v-icon left> mdi-refresh-circle </v-icon>
                    Resume</v-btn
                  >
                </template>
              </v-row>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <v-row no-gutters>
                <v-col cols="12" class="pa-1">
                  <v-card flat outlined>
                    <v-stepper class="elevation-0">
                      <v-stepper-header>
                        <v-stepper-step :complete="in_json != null" color="primary" step="1">
                          <span :class="in_json != null ? 'body-1' : 'body-2'">Input</span>
                        </v-stepper-step>
                        <v-divider></v-divider>
                        <v-stepper-step :complete="getEffectiveOutSample() != null" color="secondary" step="2">
                          <span :class="getEffectiveOutSample() != null ? 'body-1' : 'body-2'">Output</span>
                        </v-stepper-step>
                        <v-divider></v-divider>
                        <v-stepper-step :complete="enriched_order || order_items != null" color="info" step="3">
                          <span :class="order_items != null ? 'body-1' : 'body-2'">Enrich</span>
                          <small>Optional</small>
                        </v-stepper-step>
                        <v-divider></v-divider>
                        <v-stepper-step :complete="order_items != null" color="accent" step="4">
                          <span :class="order_items != null ? 'body-1' : 'body-2'">Process</span>
                        </v-stepper-step>
                        <v-divider></v-divider>
                        <v-stepper-step :complete="order.state == 'completed'" color="success" step="5">
                          <span :class="order.state == 'completed' ? 'body-1' : 'body-2'">Complete</span>
                        </v-stepper-step>
                      </v-stepper-header>
                    </v-stepper>
                  </v-card>
                </v-col>
              </v-row>

              <v-row v-if="order.state != 'manufacturing' && order.state != 'process' && order.state != 'completed' && order.state != 'suspend'" no-gutters>
                <v-col cols="12" class="pa-1">
                  <flo-expand title="Input" :open="in_expand_open" :key="in_expand_key" elevation="5" disabled @expand="onInputExpand()">
                    <template v-slot:content="{}">
                      <v-container fluid class="ma-0 pa-0">
                        <v-row v-if="order.state == 'created'" no-gutters>
                          <v-col cols="12" class="ma-1 pa-1">
                            <v-radio-group hide-details mandatory row v-model="in_mode" :disabled="!hasPermissionToEdit()">
                              <v-radio v-if="order.state == 'created'" label="Generate" value="generate" color="success"></v-radio>
                              <v-radio label="Upload Input File" value="input" color="success"></v-radio>
                            </v-radio-group>
                          </v-col>
                        </v-row>

                        <v-row no-gutters>
                          <v-col cols="12" class="ma-0 pa-0">
                            <v-container v-if="in_mode == 'input'" fluid class="ma-0 pa-0">
                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <v-tabs v-model="selected_in_tab" class="ma-1 pa-1">
                                    <v-tab key="in-1">Original</v-tab>
                                    <v-tab key="in-2" v-if="in_json != null">Effective</v-tab>
                                  </v-tabs>

                                  <v-tabs-items v-model="selected_in_tab">
                                    <v-tab-item key="in-1">
                                      <v-container fluid class="ma-0 pa-0">
                                        <v-row v-if="oin_text != ''" no-gutters>
                                          <v-col cols="12" class="pa-1">
                                            <flo-expand title="View File" elevation="0" :open="view_in_text" :key="view_in_expand_key">
                                              <template v-slot:content="{}">
                                                <v-row no-gutters>
                                                  <v-col cols="12" class="pa-1">
                                                    <v-textarea v-if="oin_text.length < 1024 * 20" :readonly="order.state != 'created'" dense outlined no-resize height="350px" hide-details v-model="oin_text"></v-textarea>
                                                    <v-textarea v-else disabled readonly dense outlined no-resize height="350px" hide-details :value="getLongString(oin_text)"></v-textarea>
                                                  </v-col>
                                                </v-row>
                                              </template>
                                            </flo-expand>
                                          </v-col>
                                        </v-row>

                                        <v-row no-gutters>
                                          <v-col cols="6" lg="3" xl="3" class="pa-1" v-if="oin_name == null">
                                            <v-file-input accept=".inp, .json, .ota" label="Select File" :clearable="false" @change="onOinFileChanged($event)" :error="in_upload_error" :disabled="!hasPermissionToEdit()" :error-messages="in_upload_error_message" :truncate-length="$vuetify.breakpoint.xs ? 25 : 50" outlined dense></v-file-input>
                                          </v-col>

                                          <v-col v-else cols="12" class="pa-1">
                                            <v-list outlined rounded class="pa-1" v-if="oin_name">
                                              <v-list-item>
                                                <v-list-item-avatar>
                                                  <v-icon :color="displayIcon(oin_name).color">
                                                    {{ displayIcon(oin_name).icon }}
                                                  </v-icon>
                                                </v-list-item-avatar>
                                                <v-list-item-content>
                                                  <v-list-item-title>{{ oin_name }}</v-list-item-title>
                                                  <v-list-item-subtitle v-if="in_flm != ''">{{ helpers.toLocalTimeInIsoFormatUi(in_flm) }}</v-list-item-subtitle>
                                                </v-list-item-content>

                                                <v-list-item-action>
                                                  <v-row>
                                                    <v-btn v-if="order.state != 'created' && hasField('oin')" icon @click="onInDownload()">
                                                      <v-icon color="success">mdi-download</v-icon>
                                                    </v-btn>
                                                    <v-btn v-if="(order.state == 'created' || order.state == 'manufacturing') && oin_text != ''" color="primary" @click="setDecoder('in')"><v-icon left>mdi-upload</v-icon>Upload</v-btn>
                                                    <v-btn icon v-if="order.state == 'created' || in_json == null" @click="order.state == 'created' ? _onOinClear() : openDeleteDialog('in')">
                                                      <v-icon color="error">mdi-delete</v-icon>
                                                    </v-btn>
                                                  </v-row>
                                                </v-list-item-action>
                                              </v-list-item>
                                            </v-list>
                                          </v-col>
                                        </v-row>

                                        <v-dialog :overlay-opacity="0.4" v-model="in_upload_dialog" persistent width="auto ">
                                          <v-card v-if="in_upload_dialog">
                                            <v-card-title>Please select decoder from the list:</v-card-title>
                                            <v-card-text>
                                              <v-row no-gutters>
                                                <v-col cols="12" class="pa-1">
                                                  <blockquote>
                                                    Note: Each decoder works with a specific file type:
                                                    <code>.json, .inp, .ota</code>
                                                  </blockquote>
                                                </v-col>
                                              </v-row>
                                              <v-row no-gutters>
                                                <v-col cols="12" class="pa-1">
                                                  <v-select v-model="decoder.value" :label="decoder.label" :hint="decoder.hint" :items="decoderItems('in')" @change="onChangeDecoders()" item-text="value" item-value="key" no-data-text="Unsupported file type." :disabled="upload_loading" persistent-hint outlined dense></v-select>
                                                </v-col>
                                              </v-row>
                                            </v-card-text>
                                            <v-card-actions>
                                              <div class="flex-grow-1"></div>
                                              <v-btn color="primary" text @click="in_upload_dialog = false" :disabled="upload_loading">Cancel</v-btn>
                                              <v-btn color="primary" text @click="executeInput($event)" :loading="upload_loading" :disabled="upload_loading">Upload</v-btn>
                                            </v-card-actions>
                                          </v-card>
                                        </v-dialog>
                                      </v-container>
                                    </v-tab-item>

                                    <v-tab-item key="in-2" v-if="in_json != null">
                                      <v-container fluid class="ma-0 pa-0">
                                        <v-row no-gutters>
                                          <v-col cols="12" class="pa-1">
                                            <flo-json-editor name="Input Example" mode="view" :modes="['view', 'preview', 'text']" :value="in_json" :key="in_version"></flo-json-editor>
                                          </v-col>
                                        </v-row>

                                        <v-row no-gutters>
                                          <v-col cols="12">
                                            <v-list outlined rounded class="ma-1 pa-1" v-if="in_name">
                                              <v-list-item>
                                                <v-list-item-avatar>
                                                  <v-icon :color="displayIcon(in_name).color">
                                                    {{ displayIcon(in_name).icon }}
                                                  </v-icon>
                                                </v-list-item-avatar>
                                                <v-list-item-content>
                                                  <v-list-item-title>{{ in_name }}</v-list-item-title>
                                                  <v-list-item-subtitle v-if="in_flm != ''">{{ helpers.toLocalTimeInIsoFormatUi(in_flm) }}</v-list-item-subtitle>
                                                </v-list-item-content>

                                                <v-list-item-action>
                                                  <v-row>
                                                    <v-btn v-if="order.state != 'created'" icon @click="openDownloadDialog('in')">
                                                      <v-icon color="success">mdi-download</v-icon>
                                                    </v-btn>
                                                    <v-btn v-if="canDeleteFile()" icon @click="openDeleteDialog('in')">
                                                      <v-icon color="error">mdi-delete</v-icon>
                                                    </v-btn>
                                                  </v-row>
                                                </v-list-item-action>
                                              </v-list-item>
                                            </v-list>
                                          </v-col>
                                        </v-row>
                                      </v-container>
                                    </v-tab-item>
                                  </v-tabs-items>
                                </v-col>
                              </v-row>

                              <v-row v-if="progress" no-gutters>
                                <v-col class="pa-1">
                                  <v-progress-linear color="success" height="7" indeterminate rounded></v-progress-linear>
                                </v-col>
                              </v-row>
                            </v-container>
                          </v-col>
                        </v-row>

                        <v-row v-if="order.state == 'created' && in_mode == 'generate'" no-gutters>
                          <v-col cols="12" class="pa-1">
                            <flo-order-generate :product="product" :uicc="uicc" :order="order" :has_applet="has_applet" :max_subs="max_subs" direction="in" @upload="onGeneratedInUpload($event)" />
                          </v-col>
                        </v-row>
                      </v-container>
                    </template>
                  </flo-expand>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" class="pa-1">
                  <flo-expand :title="formatOutputTitle()" :open="out_expand_open" :key="out_expand_key" :loading="effective_sample_loading || enrich_local_factory" elevation="5" @expand="onOutputExpand()">
                    <template v-slot:content="{}">
                      <v-container v-if="!effective_sample_loading || !enrich_local_factory" fluid class="ma-0 pa-0">
                        <v-row v-if="order.state == 'created' && order.type != 'local_factory'" no-gutters>
                          <v-col cols="12" class="ma-1 pa-1">
                            <v-radio-group hide-details mandatory row v-model="out_mode" :disabled="!hasPermissionToEdit()">
                              <v-radio v-if="order.state == 'created'" label="Generate" value="generate" color="success"></v-radio>
                              <v-radio label="Upload Output File" value="output" color="success"></v-radio>
                            </v-radio-group>
                          </v-col>
                        </v-row>

                        <v-row v-if="out_mode == 'generate'" no-gutters>
                          <v-col cols="12" class="pa-1">
                            <flo-order-generate :product="product" :uicc="uicc" :order="order" :has_applet="has_applet" :max_subs="max_subs" direction="out" @upload="onGeneratedOutUpload($event)" @enrich_local_factory="onEnrichLocalFactory($event)" />
                          </v-col>
                        </v-row>

                        <v-row v-if="out_mode == 'output'" no-gutters>
                          <v-col cols="12" class="pa-1">
                            <v-container fluid class="ma-0 pa-0">
                              <v-row no-gutters>
                                <v-col cols="12" lg="6" xl="6" class="pa-0">
                                  <v-tabs v-model="selected_out_tab" class="ma-1 pa-1">
                                    <v-tab key="out-original">Original</v-tab>
                                    <v-tab key="out-effective" v-if="getEffectiveOutSample() != null">Effective</v-tab>
                                  </v-tabs>
                                </v-col>
                              </v-row>

                              <v-row no-gutters>
                                <v-col cols="12" class="ma-0 pa-0">
                                  <v-tabs-items v-model="selected_out_tab">
                                    <v-tab-item key="out-original">
                                      <v-container fluid class="ma-0 pa-0">
                                        <v-row v-if="getOriginalOut().length > 0" no-gutters>
                                          <v-col cols="12" class="pa-1">
                                            <flo-expand title="View File" :open="view_out_text" :key="view_out_expand_key" elevation="0">
                                              <template v-slot:content="{}">
                                                <v-row no-gutters>
                                                  <v-col cols="12" class="pa-1">
                                                    <v-textarea v-if="getOriginalOut().length < 1024 * 20" :readonly="order.state == 'process'" outlined no-resize height="350px" hide-details v-model="m_original_out_full"></v-textarea>
                                                    <v-textarea v-else disabled readonly outlined no-resize height="350px" hide-details :value="getOriginalOutSample()"></v-textarea>
                                                  </v-col>
                                                </v-row>
                                              </template>
                                            </flo-expand>
                                          </v-col>
                                        </v-row>

                                        <v-row no-gutters>
                                          <v-col cols="6" lg="3" xl="3" class="pa-1" v-if="oout_name == null">
                                            <v-file-input accept=".out, .outp, .json, .ota" label="Select File" :clearable="false" @change="onOoutFileChanged($event)" :disabled="!hasPermissionToEdit()" :error="out_upload_error" :error-messages="out_upload_error_message" :truncate-length="$vuetify.breakpoint.xs ? 25 : 50" dense outlined></v-file-input>
                                          </v-col>

                                          <v-col cols="12" class="pa-1" v-else>
                                            <v-list outlined rounded class="pa-1" v-if="oout_name">
                                              <v-list-item>
                                                <v-list-item-avatar>
                                                  <v-icon :color="displayIcon(oout_name).color">
                                                    {{ displayIcon(oout_name).icon }}
                                                  </v-icon>
                                                </v-list-item-avatar>
                                                <v-list-item-content>
                                                  <v-list-item-title>{{ oout_name }}</v-list-item-title>
                                                  <v-list-item-subtitle v-if="out_flm != ''">{{ helpers.toLocalTimeInIsoFormatUi(out_flm) }}</v-list-item-subtitle>
                                                </v-list-item-content>

                                                <v-list-item-action>
                                                  <v-row>
                                                    <v-btn v-if="order.state != 'created' && hasField('oout')" icon @click="onOutDownload()">
                                                      <v-icon color="success">mdi-download</v-icon>
                                                    </v-btn>
                                                    <v-btn v-if="order.state == 'created' && getOriginalOut() != ''" color="primary" @click="setDecoder('out')"><v-icon left>mdi-upload</v-icon>Upload</v-btn>
                                                    <v-btn v-if="(order.state == 'created' || order.state == 'manufacturing' || order.state == 'manufacturing') && oin_text != '' && getOriginalOut() != ''" color="primary" class="mx-1" @click="compare_dialog = true"><v-icon left>mdi-text-box-search-outline</v-icon>Review</v-btn>
                                                    <v-btn v-if="canDeleteFile() || getEffectiveOutSample() == null" icon @click="order.state == 'created' ? _onOoutClear() : openDeleteDialog('out')">
                                                      <v-icon color="error">mdi-delete</v-icon>
                                                    </v-btn>
                                                  </v-row>
                                                </v-list-item-action>
                                              </v-list-item>
                                            </v-list>
                                          </v-col>
                                        </v-row>

                                        <v-dialog :overlay-opacity="0.4" v-model="out_upload_dialog" persistent width="auto ">
                                          <v-card v-if="out_upload_dialog">
                                            <v-card-title>Please select decoder from the list:</v-card-title>
                                            <v-card-text>
                                              <v-row no-gutters>
                                                <v-col cols="12" class="pa-1">
                                                  <blockquote>
                                                    Note: Each decoder works with a specific file type:
                                                    <code>.json, .out, .outp, .ota</code>
                                                  </blockquote>
                                                </v-col>
                                              </v-row>

                                              <v-row no-gutters>
                                                <v-col cols="12" class="pa-1">
                                                  <v-select v-model="decoder.value" :label="decoder.label" :hint="decoder.hint" :items="decoderItems('out')" @change="onChangeDecoders()" item-text="value" item-value="key" no-data-text="Unsupported file type." :disabled="upload_loading" persistent-hint outlined dense></v-select>
                                                </v-col>
                                              </v-row>

                                              <v-row no-gutters>
                                                <v-col cols="6" class="mx-1 px-1">
                                                  <v-switch v-model="iccid_check_digit" :disabled="upload_loading" color="success" inset label="ICCID Contain Check Digit"></v-switch>
                                                </v-col>
                                                <v-col cols="6" class="mx-1 px-1">
                                                  <v-switch v-model="blanks" :disabled="upload_loading" color="success" inset label="Import as Blanks"></v-switch>
                                                </v-col>
                                              </v-row>
                                            </v-card-text>
                                            <v-card-actions>
                                              <div class="flex-grow-1"></div>
                                              <v-btn color="primary" text @click="out_upload_dialog = false" :disabled="upload_loading">Cancel</v-btn>
                                              <v-btn color="primary" text @click="executeOutput($event)" :loading="upload_loading" :disabled="upload_loading">Upload</v-btn>
                                            </v-card-actions>
                                          </v-card>
                                        </v-dialog>
                                      </v-container>
                                    </v-tab-item>

                                    <v-tab-item key="out-effective" v-if="getEffectiveOutSample() != null">
                                      <v-container fluid class="ma-0 pa-0">
                                        <v-row no-gutters v-if="view_out_json != null">
                                          <v-col cols="12" class="pa-1">
                                            <flo-json-editor name="Output Example" mode="view" :modes="['view', 'preview', 'text']" :value="getEffectiveOutSample()" :key="out_version"></flo-json-editor>
                                          </v-col>
                                        </v-row>

                                        <v-row no-gutters v-if="order.state != 'process'">
                                          <v-col cols="12" class="pa-1">
                                            <flo-expand title="Enrich" :open="enrich_expand_open" :key="enrich_expand_key" elevation="5" @expand="onEnrichExpand()" @collapse="onEnrichCollapse()">
                                              <template v-slot:content="{}">
                                                <v-row no-gutters>
                                                  <v-col cols="12">
                                                    <flo-order-enrich :product="product" :uicc="uicc" :order="order" :max_subs="max_subs" :has_applet="has_applet" :enrich_sample="enrich_sample" @invalid="canProcess($event)" @change="onEnrich($event)" @accept="onEnrichAccept($event)" @enrich_blank="onEnrichBlank($event)" @reject="onEnrichCancel($event)" :output="getEffectiveOutSample()" :loading="progress || process_loading"></flo-order-enrich>
                                                  </v-col>
                                                </v-row>
                                              </template>
                                            </flo-expand>
                                          </v-col>
                                        </v-row>

                                        <v-row no-gutters>
                                          <v-col cols="12">
                                            <v-list outlined rounded class="ma-1 pa-1" v-if="out_name">
                                              <v-list-item>
                                                <v-list-item-avatar>
                                                  <v-icon :color="displayIcon(out_name).color">
                                                    {{ displayIcon(out_name).icon }}
                                                  </v-icon>
                                                </v-list-item-avatar>
                                                <v-list-item-content>
                                                  <v-list-item-title>{{ out_name }}</v-list-item-title>
                                                  <v-list-item-subtitle v-if="out_flm != ''">{{ helpers.toLocalTimeInIsoFormatUi(out_flm) }}</v-list-item-subtitle>
                                                </v-list-item-content>

                                                <v-list-item-action>
                                                  <v-row>
                                                    <v-btn v-if="order.state != 'created'" icon @click="openDownloadDialog('out')">
                                                      <v-icon color="success">mdi-download</v-icon>
                                                    </v-btn>
                                                    <v-btn v-if="canDeleteFile()" icon @click="openDeleteDialog('out')">
                                                      <v-icon color="error">mdi-delete</v-icon>
                                                    </v-btn>
                                                  </v-row>
                                                </v-list-item-action>
                                              </v-list-item>
                                            </v-list>
                                          </v-col>
                                        </v-row>

                                        <v-row v-if="progress" no-gutters>
                                          <v-col class="pa-1">
                                            <v-progress-linear :color="progress_color" height="7" indeterminate rounded></v-progress-linear>
                                          </v-col>
                                        </v-row>
                                      </v-container>
                                    </v-tab-item>
                                    <v-row v-if="canProcessOrder()" no-gutters>
                                      <v-col cols="auto" class="pa-1">
                                        <v-btn v-if="getEffectiveOutSample() != null" color="primary" :loading="process_loading" :disabled="progress || process_loading" @click="outFileProcess()">
                                          <v-icon left>mdi-orbit</v-icon>
                                          Provision
                                        </v-btn>
                                      </v-col>
                                      <!-- <v-col cols="auto" class="pa-1">
                                        <v-switch v-model="override" class="ma-0 pa-1" color="success" inset label="Override" hint="This action will override already existing cards, subscribers & HSM Keys." persistent-hint></v-switch>
                                      </v-col> -->
                                    </v-row>
                                  </v-tabs-items>
                                </v-col>
                              </v-row>
                            </v-container>
                          </v-col>
                        </v-row>
                      </v-container>
                    </template>
                  </flo-expand>
                </v-col>
              </v-row>

              <v-row no-gutters v-if="order.state == 'process' || order.state == 'completed' || order.state == 'suspend' || order.state == 'canceled' || order.state == 'exception'">
                <v-col cols="12" class="pa-1">
                  <flo-expand title="Process" :open="process_expand_open" :key="process_expand_key" elevation="5" @expand="onProcessExpand()">
                    <template v-slot:content="{}">
                      <v-container fluid class="ma-0 pa-0">
                        <v-row :key="order_items_timeline_key" v-if="order.state == 'process' || order.state == 'completed'" no-gutters>
                          <v-col cols="12" class="px-1">
                            <flo-timeline-order-progress :live="true" :order_id="order.id" :dashboard="order_items_in_progress" unique="timeline-order-progress" :showTitle="true" title="Order Items Activity" min-height="300px" max-height="300px"></flo-timeline-order-progress>
                          </v-col>
                        </v-row>
                        <v-row no-gutters>
                          <v-col cols="12" class="pa-1">
                            <flo-meta-table :hidden_filter="hidden_filter_order_item" @load-data="onLoadData($event)" :show_title="false" :title="title" :translator="translator" :key="order_items_key" dense resources="order_items">
                              <template v-slot:ex_new="{ fab, color, permissions, smAndDown }">
                                <template v-if="permissions.e == true">
                                  <v-btn v-if="order.state.toLowerCase() == 'process'" :fab="fab" :small="smAndDown" class="mx-1" :color="color" @click="changeOrderState('retry')">
                                    <v-icon :left="!smAndDown">mdi-refresh-circle</v-icon>
                                    {{ !smAndDown ? "Retry all" : "" }}
                                  </v-btn>
                                </template>
                              </template>

                              <template v-slot:view_state="{ fmtrow }">
                                <v-chip label class="text-capitalize" :color="getItemColor(fmtrow.state)">{{ fmtrow.state }}</v-chip>
                              </template>
                              <template v-slot:view_code="{ fmtrow }">
                                <v-chip label :color="getItemCodeColor(fmtrow.code)">{{ fmtrow.code }}</v-chip>
                              </template>

                              <template v-slot:view_iccid="{ fmtrow }">
                                <v-container class="d-flex flex-nowrap">
                                  <span class="align-self-center text-center ml-n3">{{ fmtrow.iccid }}</span>
                                  <v-btn
                                    v-if="fmtrow.state.toLowerCase() == 'completed'"
                                    class="ml-1"
                                    icon
                                    elevation="0"
                                    router
                                    :to="{
                                      path: '/resources/card/',
                                      query: { iccid: fmtrow.iccid },
                                    }"
                                  >
                                    <v-icon center color="info">mdi-link</v-icon>
                                  </v-btn>
                                </v-container>
                              </template>

                              <template v-slot:view_order_actions="{ fmtrow, fmtpermissions }">
                                <template v-if="fmtpermissions.e == true">
                                  <v-btn color="primary" v-if="fmtrow.state.toLowerCase() == 'pending'" @click="updateItemState(fmtrow, 'suspend')">
                                    <v-icon left> mdi-pause </v-icon>
                                    Suspend</v-btn
                                  >
                                  <v-btn color="primary" v-if="fmtrow.state.toLowerCase() == 'canceled' || fmtrow.state.toLowerCase() == 'exception'" @click="updateItemState(fmtrow, 'retry')">
                                    <v-icon left> mdi-refresh </v-icon>
                                    Retry</v-btn
                                  >
                                  <v-btn color="primary" v-if="fmtrow.state.toLowerCase() == 'suspended'" @click="updateItemState(fmtrow, 'resume')">
                                    <v-icon left> mdi-refresh-circle </v-icon>
                                    Resume</v-btn
                                  >
                                  <v-btn color="primary" v-if="fmtrow.state.toLowerCase() == 'pending' || fmtrow.state.toLowerCase() == 'exception' || fmtrow.state.toLowerCase() == 'suspended'" @click="updateItemState(fmtrow, 'cancel')">
                                    <v-icon left> mdi-cancel </v-icon>
                                    Cancel</v-btn
                                  >
                                </template>
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

          <v-row v-if="oin_name" no-gutters>
            <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
              <v-dialog :overlay-opacity="0.4" v-model="in_delete_dialog" persistent width="auto ">
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
                          ><span class="title text--primary">Are you sure you want to delete {{ oin_name }}?</span>
                        </v-col>
                      </v-row>
                      <v-row no-gutters justify="center">
                        <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'">
                          <span class="body-1 text--primary">This will revert the order back to Created state and will result in loss of all data.</span>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                    <div class="flex-grow-1"></div>

                    <v-btn color="primary" text @click="closeDeleteDialog('in')">Cancel</v-btn>
                    <v-btn color="primary" text @click="deleteOrderRfs('in')">Delete</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>

          <v-row v-if="out_name" no-gutters>
            <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
              <v-dialog :overlay-opacity="0.4" v-model="out_delete_dialog" persistent width="auto ">
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
                          ><span class="title text--primary">Are you sure you want to delete {{ out_name }}?</span>
                        </v-col>
                      </v-row>
                      <v-row no-gutters justify="center">
                        <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'">
                          <span class="body-1 text--primary"> Deleting this file will revert the order back to Created state and will result in loss of all data.</span>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn color="primary" text @click="closeDeleteDialog('out')">Cancel</v-btn>
                    <v-btn color="primary" text @click="deleteOrderRfs('out')">Delete</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
              <v-dialog :overlay-opacity="0.4" v-model="in_export_dialog" persistent width="auto ">
                <v-card v-if="in_export_dialog">
                  <v-card-title>Please select decoder from the list:</v-card-title>
                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12" class="pa-1">
                        <blockquote>
                          Note: Each decoder works with a specific file type:
                          <code>.json, .inp, .outp</code>
                        </blockquote>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="12" class="pa-1">
                        <v-select v-model="decoder.value" :label="decoder.label" :hint="decoder.hint" :messages="formatDecodersInfo()" :items="decoderItems('in')" @change="onChangeDecoders()" item-text="value" item-value="key" no-data-text="Unsupported file type." persistent-hint outlined dense>
                          <template v-slot:message="{ message }"> <span v-html="message"></span> </template>
                        </v-select>
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn color="primary" text @click="in_export_dialog = false">Cancel</v-btn>
                    <v-btn color="primary" text @click="onInExport()">Export</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
              <v-dialog :overlay-opacity="0.4" v-model="out_export_dialog" persistent scrollable width="600">
                <v-card v-if="out_export_dialog">
                  <v-card-title>Please select decoder from the list:</v-card-title>
                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12" class="pa-1">
                        <blockquote>
                          Note: Each decoder works with a specific file type:
                          <code>.json, .inp, .outp</code>
                        </blockquote>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="12" class="pa-1">
                        <v-select v-model="decoder.value" :label="decoder.label" :hint="decoder.hint" :messages="formatDecodersInfo()" :items="decoderItems('out')" @change="onChangeDecoders()" item-text="value" item-value="key" no-data-text="Unsupported file type." persistent-hint outlined dense>
                          <template v-slot:message="{ message }"> <span v-html="message"></span> </template>
                        </v-select>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="12" class="mt-1 pa-1">
                        <v-text-field v-model="export_file.value" :label="export_file.label" :hint="export_file.hint" :rules="[export_file.rule]" persistent-hint outlined dense></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row v-if="canRecrypt()" no-gutters>
                      <v-col cols="12" class="mx-1 px-1">
                        <v-switch v-model="encryption.recrypt" color="success" @change="changeEncryption($event)" inset label="Recrypt"></v-switch>
                      </v-col>
                    </v-row>

                    <template v-if="encryption.recrypt">
                      <v-row no-gutters>
                        <v-col cols="12" lg="6" xl="6" class="pa-1">
                          <v-select v-model="encryption.ota_wrap_mode.value" :label="encryption.ota_wrap_mode.label" :hint="encryption.ota_wrap_mode.hint" :items="encryption.ota_wrap_mode.items" @change="loadHsms($event)" item-text="value" item-value="key" no-data-text="Please select Encryption" dense persistent-hint outlined></v-select>
                        </v-col>
                        <v-col v-if="encryption.ota_wrap_mode.value == 'wrapped'" cols="12" lg="6" xl="6" class="pa-1">
                          <v-autocomplete v-model="encryption.hsm_id.value" :label="encryption.hsm_id.label" :hint="encryption.hsm_id.hint" :items="encryption.hsm_id.items" :loading="load_hsms" :disabled="load_hsms" item-text="value" item-value="key" @change="loadHsmTkKeys($event)" dense persistent-hint outlined></v-autocomplete>
                        </v-col>
                      </v-row>
                      <v-row no-gutters v-if="encryption.ota_wrap_mode.value == 'wrapped'">
                        <v-col cols="12" lg="6" xl="6" class="pa-1">
                          <v-autocomplete v-model="encryption.tk_ota_id.value" :label="encryption.tk_ota_id.label" :hint="encryption.tk_ota_id.hint" :items="encryption.tk_ota_id.items" :loading="load_keys" :disabled="load_keys" item-text="value" item-value="key" no-data-text="Please select valid HSM" dense clearable persistent-hint outlined></v-autocomplete>
                        </v-col>
                        <v-col cols="12" lg="6" xl="6" class="pa-1">
                          <v-autocomplete v-model="encryption.tk_net_id.value" :label="encryption.tk_net_id.label" :hint="encryption.tk_net_id.hint" :items="encryption.tk_net_id.items" :loading="load_keys" :disabled="load_keys" item-text="value" item-value="key" no-data-text="Please select valid HSM" dense clearable persistent-hint outlined></v-autocomplete>
                        </v-col>
                      </v-row>
                    </template>

                    <v-row v-if="order.type != 'blank'" no-gutters>
                      <v-col cols="12" class="mx-1 px-1">
                        <v-switch v-model="slice.value" color="success" @change="changeSlice($event)" inset label="Slice"></v-switch>
                      </v-col>
                    </v-row>

                    <template v-if="slice.value">
                      <v-form v-model="slice.valid">
                        <v-row no-gutters>
                          <v-col cols="12" lg="6" xl="6" class="pa-1">
                            <v-text-field v-model="slice.start_iccid.value" :label="slice.start_iccid.label" :hint="slice.start_iccid.hint" :rules="[slice.start_iccid.rule]" counter="18" persistent-hint outlined dense></v-text-field>
                          </v-col>
                          <v-col cols="12" lg="6" xl="6" class="pa-1">
                            <v-text-field v-model="slice.quantity.value" :label="slice.quantity.label" :hint="slice.quantity.hint" :rules="[slice.quantity.rule]" persistent-hint outlined dense></v-text-field>
                          </v-col> </v-row
                      ></v-form>
                    </template>
                    <v-row no-gutters>
                      <v-col v-if="canExportEid()" cols="12" lg="5" xl="5" class="mx-1 px-1">
                        <v-switch v-model="export_eid" color="success" inset label="Export EIDs"></v-switch>
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn color="primary" text @click="closeOutExport()">Cancel</v-btn>
                    <v-btn color="primary" text :disabled="disableOutExport()" @click="onOutExport()">Export</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
              <v-dialog :overlay-opacity="0.4" v-model="compare_dialog" persistent width="1450px">
                <v-card>
                  <v-card-title>
                    <v-row no-gutters>
                      <v-col cols="6"> Input file </v-col>
                      <v-col cols="6"> Output file </v-col>
                    </v-row>
                  </v-card-title>
                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="6" class="pa-1">
                        <v-list outlined rounded class="pa-1 mb-1" v-if="oin_name">
                          <v-list-item>
                            <v-list-item-avatar>
                              <v-icon :color="displayIcon(oin_name).color">
                                {{ displayIcon(oin_name).icon }}
                              </v-icon>
                            </v-list-item-avatar>
                            <v-list-item-content>
                              <v-list-item-title>{{ oin_name }}</v-list-item-title>
                              <v-list-item-subtitle v-if="in_flm != ''">{{ helpers.toLocalTimeInIsoFormatUi(in_flm) }}</v-list-item-subtitle>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                        <v-textarea v-if="oin_text.length < 1024 * 20" readonly dense outlined no-resize height="450px" hide-details v-model="oin_text"></v-textarea>
                        <v-textarea v-else disabled readonly dense outlined no-resize height="450px" hide-details :value="getLongString(oin_text)"></v-textarea>
                      </v-col>
                      <v-col cols="6" class="pa-1">
                        <v-list outlined rounded class="pa-1 mb-1" v-if="oout_name">
                          <v-list-item>
                            <v-list-item-avatar>
                              <v-icon :color="displayIcon(oout_name).color">
                                {{ displayIcon(oout_name).icon }}
                              </v-icon>
                            </v-list-item-avatar>
                            <v-list-item-content>
                              <v-list-item-title>{{ oout_name }}</v-list-item-title>
                              <v-list-item-subtitle>{{ helpers.toLocalTimeInIsoFormatUi(Date.now()) }}</v-list-item-subtitle>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                        <v-textarea v-if="getOriginalOut().length < 1024 * 20" readonly dense outlined no-resize height="450px" hide-details v-model="m_original_out_full"></v-textarea>
                        <v-textarea v-else disabled readonly dense outlined no-resize height="450px" hide-details :value="getOriginalOutSample()"></v-textarea>
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn color="primary" text @click="compare_dialog = false">Close</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
    <error-resource v-else-if="!loading && !order" resource="order" path="/resources/orders/"></error-resource>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import floTimelineOrderProgress from "~/components/charts/floTimelineOrderProgress";
import errorResource from "~/components/error/error-resource.vue";
import floOrderEnrich from "~/components/pages/resources/orders/floOrderEnrich";
import floOrderGenerate from "~/components/pages/resources/orders/floOrderGenerate";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
import OTranslator from "~/src/otranslator.js";
export default {
  head() {
    return {
      title: this.title,
    };
  },
  components: { floOrderGenerate, floOrderEnrich, floTimelineOrderProgress, errorResource },
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
        console.log(`subscribers - fetch - error - countries: ${err}`);
        return "ok";
      }
    }
  },
  data() {
    return {
      helpers,
      headers: [
        {
          text: "Id",
          align: "start",
          value: "id",
        },
        { text: "File Name", value: "fname" },
        { text: "Field", value: "field" },
        { text: "File Type", value: "ftype" },
        { text: "File Size", value: "fsize" },
        { text: "File Last Modified", value: "flm" },
        { text: "Actions", value: "actions" },
      ],
      decoder: {
        label: "Decoder",
        hint: "Select File Decoder",
        messages: "Decoders originate from the product.",
        value: "flolive - .json",
        filtered: [],
        items: [
          { key: "redtea - .inp", value: "RedTea - .inp", manufacturer: "redtea" },
          { key: "redtea - .outp", value: "RedTea - .outp", manufacturer: "redtea" },
          { key: "kigen - .inp", value: "Kigen - .inp", manufacturer: "kigen" },
          { key: "kigen - .outp", value: "Kigen - .outp", manufacturer: "kigen" },
          { key: "gsma - .inp", value: "GSMA - .inp", manufacturer: "gsma" },
          { key: "gsma - .outp", value: "GSMA - .outp", manufacturer: "gsma" },
          { key: "qualcomm - .inp", value: "Qualcomm - .inp", manufacturer: "qualcomm" },
          { key: "qualcomm - .outp", value: "Qualcomm - .outp", manufacturer: "qualcomm" },
          { key: "thales - .inp", value: "Thales - .inp", manufacturer: "thales" },
          { key: "thales - .outp", value: "Thales - .outp", manufacturer: "thales" },
          { key: "valid_v1 - .inp", value: "Valid version 1 - .inp", manufacturer: "valid" },
          { key: "valid_v2 - .inp", value: "Valid version 2 - .inp", manufacturer: "valid" },
          { key: "valid_v1 - .outp", value: "Valid version 1 - .outp", manufacturer: "valid" },
          { key: "valid_v2 - .outp", value: "Valid version 2 - .outp", manufacturer: "valid" },
          { key: "flolive - .json", value: "floLive - .json", manufacturer: "flo" },
          { key: "flolive - .outp", value: "floLive - .outp", manufacturer: "flo" },
          { key: "reconcile - .json", value: "Reconcile - .json", manufacturer: "flo" },
          { key: "flolive_bss - .inp", value: "floLive BSS - .inp", manufacturer: "flo" },
          { key: "flolive_bss - .outp", value: "floLive BSS - .outp", manufacturer: "flo" },
          { key: "flolive_hss - .inp", value: "floLive HSS - .inp", manufacturer: "flo" },
          { key: "flolive_hss - .outp", value: "floLive HSS - .outp", manufacturer: "flo" },
          { key: "flo_identifiers - .csv", value: "floLive Identifiers - .csv", manufacturer: "flo" },
        ],
      },
      title: "Order",
      rfs: [],
      order_items_in_progress: {},
      order: null,
      uicc: null,
      file_type: null,
      has_applet: false,
      order_items: null,
      order_items_key: 1,
      order_items_timeline_key: 1,
      product: null,
      process_expand_open: false,
      can_process: false,
      process_expand_key: 1,
      compare_dialog: false,
      translator: null,
      max_subs: 1,
      iccid_check_digit: true,
      enrich_expand_open: true,
      enrich_local_factory: false,
      enrich_expand_key: 1,
      enriched_order: false,
      enrich_sample: false,
      loading: true,
      upload_loading: false,
      process_loading: false,
      effective_sample_loading: false,
      pulling_in_progress: false,
      pull_timer_id: 0,
      sample: 20,
      // in section
      in_mode: "input",
      in_version: 1,
      selected_in_tab: 0,
      in_flm: "",
      oin_name: null,
      oin_text: "",
      in_name: null,
      in_json: null,
      m_effective_in_sample_text: "",
      m_oin_text_full: "",
      m_effective_in_sample: null,
      in_expand_key: 1,
      in_expand_open: false,
      in_export_dialog: false,
      in_upload_dialog: false,
      in_delete_dialog: false,
      view_in_text: false,
      view_in_expand_key: 1,
      in_upload_error: false,
      in_upload_error_message: "",

      // out section
      out_mode: "output",
      out_version: 1,
      selected_out_tab: 0,
      out_flm: "",
      oout_name: null,
      m_original_out_full: "",
      out_name: null,
      m_effective_out_sample: null,
      out_expand_key: 1,
      out_expand_open: false,
      out_export_dialog: false,
      out_upload_dialog: false,
      out_delete_dialog: false,
      view_out_text: false,
      view_out_expand_key: 1,
      view_out_json: true,
      hidden_filter_order_item: [],
      progress: false,
      progress_value: 0,
      progress_color: "success",
      watchSource: null,
      out_upload_error: false,
      out_upload_error_message: "",
      load_keys: false,
      load_hsms: false,
      override: false,
      blanks: false,
      export_file: {
        label: "File Name",
        hint: "Specify Export File Name",
        rule: (v) => {
          const pattern = /^[^\\s].+[^\\s]$/;
          return pattern.test(v) || "Invalid Name format.";
        },
        value: "",
      },
      slice: {
        valid: true,
        value: false,
        start_iccid: {
          label: "Start ICCID",
          hint: "Slice Start ICCID (without check digit)",
          rule: (v) => {
            const pattern = /^[0-9]{18}$/;
            return pattern.test(v) || "Invalid ICCID format.";
          },
          value: "",
        },
        quantity: {
          label: "Quantity",
          hint: "Slice Quantity",
          rule: () => true,
          value: 0,
        },
      },
      encryption: {
        recrypt: false,
        hsm_id: {
          label: "HSM",
          hint: "Hardware Security Module",
          items: [],
          value: false,
        },
        ota_wrap_mode: {
          label: "Encryption Mode",
          hint: "Keys Encryption Mode",
          items: [
            { key: "raw", value: "Raw" },
            { key: "wrapped", value: "Wrapped" },
          ],
          value: "raw",
        },
        tk_ota_id: {
          label: "TK OTA",
          hint: "Transport Key OTA",
          items: [],
          value: false,
        },
        tk_net_id: {
          label: "TK NET",
          hint: "Transport Key NET",
          items: [],
          value: false,
        },
      },
      export_eid: false,
      manufacturers: [],
      ranges: [],
      reservations: {
        label: "Reservations",
        hint: "Select Reservation",
        messages: "Only active, Local Factory reservations are listed here.",
        items: [],
        value: 0,
        loading: false,
      },
      imsis: {
        label: "IMSI",
        hint: "International Mobile Subscriber Identity",
        items: [],
      },
      msisdns: {
        label: "MSISDN",
        hint: "Mobile Station International Subscriber Directory Number",
        items: [],
      },
    };
  },
  computed: {
    ...mapGetters({
      permissions: "session/permissions",
    }),
  },
  async created() {
    await this.initialize();
    this.pull_timer_id = setInterval(() => {
      this.pull_api_data();
    }, 5000);
  },
  mounted() {
    this.$bus.$on("dashboard", this.onChange);
  },
  beforeDestroy() {
    if (0 != this.pull_timer_id) {
      clearInterval(this.pull_timer_id);
      this.pull_timer_id = 0;
    }
    this.$bus.$off("dashboard");
  },
  mixins: [tellUser, parseNetError],
  methods: {
    async getOrderItems(p_mark) {
      try {
        let l_order_items_in_progress = await this.$axios.$get(`/statistics/v1/dashboard/stats/${p_mark}`);
        return l_order_items_in_progress;
      } catch (err) {
        console.error(err);
      }
    },
    async onChange() {
      let l_order_items = await this.getOrderItems(0);
      if (!l_order_items) {
        return;
      }

      this.order_items_in_progress = l_order_items;
    },
    formatReservationName() {
      let found = this.reservations.items.find((f) => f.key == this.order.reservation_id);
      return found.value;
    },
    formatExportFileName() {
      let found = this.decoder.items.find((f) => f.key == this.decoder.value);
      let decoder = found.key.split("-")[0].trim();
      let formattedDate = helpers
        .getTsString(new Date())
        .match(/^\d{4}-\d{2}-\d{2}/)[0]
        .replace(/-/g, "_");

      return this.encryption.recrypt ? `${this.export_file.value}_${decoder}_${helpers.capitalizeFLetter(this.encryption.ota_wrap_mode.value)}_${formattedDate}` : `${this.export_file.value}_${decoder}_${formattedDate}`;
    },
    formatDecodersInfo() {
      let { hint, messages } = this.decoder;
      return messages
        ? `${hint}
        <br />
        <span class="caption info--text">${messages}</span>`
        : hint;
    },
    formatReservationInfo() {
      let { hint, messages } = this.reservations;
      return messages
        ? `${hint}
        <br />
        <span class="caption info--text">${messages}</span>`
        : hint;
    },
    formatOutputTitle() {
      if (this.effective_sample_loading) {
        return "Output - Loading Effective Sample, please wait.";
      }
      if (this.enrich_local_factory) {
        return "Output - Enriching Order, please wait.";
      }
      return "Output";
    },
    getLongString(s) {
      let lmax = 1024 * 20;
      return `... Too Big To Edit, Use External Editor ....\n ${s.slice(0, lmax)} \n... Too Big To Edit, Use External Editor ....`;
    },
    getTypeColor(type) {
      let colorMap = {
        standard: "info",
        blank: "secondary",
        local_factory: "accent",
      };

      return colorMap[type] || "warning";
    },
    onLoadData(data) {
      this.order_items = data.items;
      data.headers.push({
        text: "Actions",
        value: "order_actions",
        type: "string",
        view: true,
      });
      for (const header of data.headers) {
        switch (header.value) {
          case "version":
          case "order_id":
          case "aid":
          case "path":
          case "action":
            {
              header.view = false;
            }
            break;
        }
      }
    },
    async initialize() {
      console.log(`order - initialize`);
      this.hidden_filter_order_item = [
        {
          k: "order_id",
          op: "equal",
          v: this.$route.query.id,
        },
      ];
      let translator = new OTranslator();
      await this.loadOrder();
      if (this.order) {
        await this.reload_rfs();
        await this.loadProduct();
        await this.loadProductApplet();
        await this.loadReservations();
        await this.expandOnState();
        await this.loadManufacturers();
        await this.loadUicc();
      }
      this.translator = translator;
    },
    async pull_api_data() {
      if (this.pulling_in_progress) {
        return;
      }

      if (this.order.state != "process") {
        return;
      }

      this.pulling_in_progress = true;

      try {
        let lorder = await this.$axios.$get(`/api/v1/orders/${this.order.id}`);

        if (lorder.state != this.order.state) {
          let lbody = {
            changed: lorder,
          };

          this.orderChanged(lbody);
          this.loadOrderItems();
        }
        this.order_items_timeline_key++;
      } catch (err) {
        console.log(`order - pull_api_data - error: ${err}`);
      }

      this.pulling_in_progress = false;
    },
    hasPermissionToEdit() {
      let l_permissions = this.permissions.find((p) => p.res == "orders");

      if (l_permissions.u == true && l_permissions.e == true) {
        return true;
      }

      return false;
    },
    canProcess(event) {
      if (!event && this.order.state == "manufacturing") {
        this.can_process = true;
      }
    },
    canProcessOrder() {
      const { state, type } = this.order;
      return state == "manufacturing" && this.can_process && this.selected_out_tab && type != "blank";
    },
    orderChanged(body) {
      if (body.changed.id != this.order.id) return;
      for (const key of Object.keys(body.changed)) {
        this.order[key] = body.changed[key];
      }
    },
    async expandOnState() {
      if (this.order.state == "created" || this.order.state == "manufacturing") {
        await this.onOutputExpand();
        this.out_expand_open = true;
        this.out_expand_key++;
      } else if (this.order.state == "process" || this.order.state == "completed") {
        this.order_items_in_progress = await this.getOrderItems(0);
        this.onProcessExpand();
        this.process_expand_open = true;
        this.process_expand_key++;
      }
    },
    getEffectiveOutSample() {
      return this.m_effective_out_sample;
    },
    getEffectiveInSample() {
      return this.m_effective_in_sample;
    },
    getProductExtra() {
      if (!this.product.hasOwnProperty("extra")) {
        return null;
      }

      return this.product.extra;
    },
    getProductDecoders() {
      let extra = this.getProductExtra();
      if (!extra) {
        return [];
      }

      if (!extra.hasOwnProperty("data")) {
        return [];
      }

      let data = extra.data;

      if (data.hasOwnProperty("decoders") && data.decoders.length > 0) {
        let decoders = data.decoders;
        this.decoder.filtered = this.decoder.items.filter((f) => decoders.includes(f.key));
      } else {
        let defaultDecoders = ["flolive - .json", "flolive - .outp", "reconcile - .json", "flolive_bss - .inp", "flolive_bss - .outp", "flolive_hss - .inp", "flolive_hss - .outp", "flo_identifiers - .csv"];
        this.decoder.filtered = this.decoder.items.filter((f) => defaultDecoders.includes(f.key));
      }
    },
    async reload_rfs() {
      this.rfs = [];
      this.rfs = await this.rfs_fields_ls(null);
      if (!this.rfs) {
        this.rfs = [];
      }
    },
    async loadProduct() {
      let answer = null;
      try {
        answer = await this.$axios.$get(`/api/v1/products/${this.order.product_id}`);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      this.product = answer;
      return answer;
    },
    async loadProductApplet() {
      let answer = [];
      try {
        let query = {
          select: {},
          where: [
            {
              k: "id",
              op: "equal",
              v: this.order.product_id,
            },
          ],
        };
        answer = await this.$axios.$post("/api/v1/product_applets/list", query);
        if (answer.length > 0) {
          this.has_applet = true;
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      return answer;
    },
    async loadOrder() {
      let order = [];
      try {
        let query = {
          select: {},
          where: [
            {
              k: "id",
              op: "equal",
              v: this.$route.query.id,
            },
          ],
        };
        order = await this.$axios.$post("api/v1/orders/list", query);
        if (order.length > 0) {
          this.order = order[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      this.loading = false;
    },
    async loadUicc() {
      let uicc = [];
      try {
        let query = {
          select: {},
          where: [
            {
              k: "id",
              op: "equal",
              v: this.product.uicc_id,
            },
          ],
        };
        uicc = await this.$axios.$post("api/v1/uiccs/list", query);
        if (uicc.length > 0) {
          this.uicc = uicc[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadManufacturers() {
      try {
        let manufacturers = await this.$axios.$post("api/v1/manufacturers/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        this.manufacturers = manufacturers;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadApplet(id) {
      try {
        let answer = await this.$axios.$post(`/api/v1/applets/rfs/list`, {
          field: "applet_setup",
          id,
        });
        this.loadAppletSetup(answer[0].id);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadAppletSetup(id) {
      try {
        let answer = await this.$axios.$get(`/api/v1/applets/rfs/${id}`);
        let json = JSON.parse(atob(answer.content.data_url.substring(29)));
        this.max_subs = json.data.meta.subs.records.length;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    openDownloadDialog(direction) {
      if (direction == "in") {
        this.in_export_dialog = true;
      } else if (direction == "out") {
        this.out_export_dialog = true;
        this.export_file.value = this.order.name;
      }
    },
    openDeleteDialog(direction) {
      if (direction == "in") {
        this.in_delete_dialog = true;
      } else if (direction == "out") {
        this.out_delete_dialog = true;
      }
    },
    closeDeleteDialog(direction) {
      if (direction == "in") {
        this.in_delete_dialog = false;
      } else if (direction == "out") {
        this.out_delete_dialog = false;
      }
    },
    async deleteOrderRfs(direction) {
      let l_rfs = this.rfs;

      if (l_rfs.length > 0) {
        if (direction == "in") {
          let l_in = l_rfs.find((f) => f.field == "in");
          if (l_in) {
            await this.onInClear(l_in.id);
          }

          let l_oin = l_rfs.find((f) => f.field == "oin");
          if (l_oin) {
            await this.onOinClear(l_oin.id);
          }
        } else if (direction == "out") {
          let l_out = l_rfs.find((f) => f.field == "out");
          if (l_out) {
            await this.onOutClear(l_out.id);
          }

          let l_oout = l_rfs.find((f) => f.field == "oout");
          if (l_oout) {
            await this.onOoutClear(l_oout.id);
          }

          if (this.order.type == "local_factory") {
            this.out_mode = "output";
          }
        }
      }
    },
    _onOinClear() {
      this.oin_text = "";
      this.m_effective_in_sample_text = "";
      this.oin_name = null;
    },
    _onOoutClear() {
      this.m_original_out_full = "";
      this.oout_name = null;
    },
    async onOutClear(id) {
      this.out_name = null;
      this.m_effective_out_sample = null;
      await this.deleteFile(id, "out");
      if (this.order.type == "standard") {
        await this.updateOrderReservation();
      }
    },
    async onOoutClear(id) {
      this.m_original_out_full = "";
      this.oout_name = null;

      if (this.order.state == "manufacturing") {
        await this.deleteFile(id, "out");
        await this.changeOrderState("manufacturing");
      }
    },
    async onInClear(id) {
      this.m_effective_in_sample = null;
      this.in_json = null;
      this.in_name = null;
      await this.deleteFile(id, "in");
    },
    async onOinClear(id) {
      this.oin_text = "";
      this.m_effective_in_sample_text = "";
      this.oin_name = null;

      if (this.order.state == "manufacturing") {
        await this.deleteFile(id, "in");
        await this.changeOrderState("manufacturing");
      }
    },
    async deleteFile(id, direction) {
      try {
        await this.$axios.$delete(`/api/v1/orders/rfs/${id}`);
        this.closeDeleteDialog(direction);
        this.tellUser("success", "File deleted successfully.");
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async updateItemState(item, action) {
      try {
        let request = {
          id: item.id,
          version: item.version,
          action,
        };
        let answer = await this.$axios.$post("/api/v1/order_items/action", request);
        if (answer != null) {
          this.loadOrderItems();
          this.tellUser("success", `${answer.iccid} state successfully changed to ${answer.state}.`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async changeOrderState(action) {
      try {
        let request = { id: this.order.id, action };
        let answer = await this.$axios.$post("/api/v1/orders/action", request);
        if (answer != null) {
          if (action == "retry") {
            this.loadOrderItems();
          }
          this.order = answer;
          this.tellUser("success", `ID: ${this.order.id} state successfully changed to ${this.order.state}.`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async updateOrderReservation() {
      let order = {
        id: this.order.id,
        product_id: this.order.product_id,
        reservation_id: 0,
        ticket_ref: "",
      };
      try {
        let answer = await this.$axios.$put(`/api/v1/orders/${order.id}`, order);
        if (answer != null) {
          this.order = {
            ...answer,
            reservation_id: 0,
            ticket_ref: "",
          };
          this.out_mode = "generate";
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        console.log(`error: ${lerr.statusCode} - ${lerr.message}`);
      }
    },
    hasInFiles() {
      let infiles = this.rfs.filter((r) => r.field == "in" || r.field == "oin");
      if (infiles.length > 0) {
        return true;
      }

      return false;
    },
    hasField(field) {
      let infiles = this.rfs.filter((r) => r.field == field);
      if (infiles.length > 0) {
        return true;
      }

      return false;
    },
    async syncInFiles() {
      let infiles = this.rfs.filter((r) => r.field == "in");
      if (infiles.length == 0) {
        this.in_flm = "";

        this.in_name = null;
        this.in_json = null;

        this.oin_name = null;
        this.oin_text = "";

        this.m_effective_in_sample = null;
        this.m_effective_in_sample_text = "";

        return;
      }

      let infile = infiles[0];
      if (this.in_flm != infile.flm) {
        this.in_flm = infile.flm;
        this.in_name = infile.fname;
        this.in_json = await this.rfs_get_json(infile.id);

        infiles = this.rfs.filter((r) => r.field == "oin");
        if (infiles.length == 0) {
          return;
        }

        infile = infiles[0];
        this.oin_name = infile.fname;
        this.oin_text = await this.rfs_get_text(infile.id);
      }
    },
    async getEffectiveInRfsSample(p_file_id) {
      try {
        let answer = await this.$axios.$get(`/api/v1/orders/in/effective/sample/${p_file_id}`);
        console.log(`getEffectiveInRfsSample - ${JSON.stringify(answer)}`);
        return answer;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      return null;
    },
    async getEffectiveOutRfsSample(p_file_id) {
      try {
        this.effective_sample_loading = true;
        // TODO: we need to add stream loading ...
        let answer = await this.$axios.$get(`/api/v1/orders/out/effective/sample/${p_file_id}`);
        this.effective_sample_loading = false;
        return answer;
      } catch (err) {
        this.effective_sample_loading = false;
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      return null;
    },
    getOriginalOut() {
      return this.m_original_out_full;
    },
    getOriginalOutSample() {
      return this.getLongString(this.m_original_out_full);
    },
    async syncOutFiles() {
      let files = this.rfs.filter((r) => r.field == "out");

      if (files.length == 0) {
        this.out_flm = "";

        this.out_name = null;
        this.m_effective_out_sample = null;

        this.oout_name = null;
        this.m_original_out_full = "";

        return;
      }

      let file = files[0];
      if (this.out_flm != file.flm) {
        this.out_flm = file.flm;
        this.out_name = file.fname;
        this.m_effective_out_sample = await this.getEffectiveOutRfsSample(file.id);

        files = this.rfs.filter((r) => r.field == "oout");
        if (files.length == 0) {
          return;
        }

        file = files[0];
        this.oout_name = file.fname;
        this.m_original_out_full = await this.rfs_get_text(file.id);
      }
    },
    async onInputExpand() {
      this.getProductDecoders();
      await this.syncInFiles();
      if (this.order.state == "created") {
        this.in_mode = "generate";
      }
      if (this.getEffectiveInSample() != null) {
        this.selected_out_tab = 1;
      }
    },
    async onOutputExpand() {
      this.getProductDecoders();
      await this.syncOutFiles();
      if (this.order.state == "created") {
        this.out_mode = "generate";
      }
      if (this.getEffectiveOutSample() != null) {
        this.selected_out_tab = 1;
      }
    },
    onEnrichExpand() {
      this.view_out_json = false;
    },
    onEnrichCollapse() {
      this.view_out_json = true;
    },
    onProcessExpand() {
      this.loadOrderItems();
    },
    loadOrderItems() {
      this.order_items_key++;
    },
    // RFS FIELD
    async rfs_fields_ls(field) {
      const request = {
        id: this.order.id,
        field: field,
      };

      try {
        let answer = await this.$axios.$post(`/api/v1/orders/rfs/list`, request);
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
    async rfs_get(id) {
      try {
        let answer = await this.$axios.$get(`/api/v1/orders/rfs/${id}`);
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
    async rfs_get_text(id) {
      try {
        let lanswer = await this.rfs_get(id);
        if (!lanswer) {
          return null;
        }
        let ldata_url = lanswer.content.data_url;
        let bas64_pos = ldata_url.indexOf(",") + 1;
        let lcontent = atob(ldata_url.substring(bas64_pos));

        return lcontent;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      return null;
    },
    async rfs_get_json(id) {
      try {
        let lanswer = await this.rfs_get_text(id);
        if (!lanswer) {
          return null;
        }
        let lcontent = JSON.parse(lanswer);
        return lcontent;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      return null;
    },
    gen_data_url(type, base64) {
      let durl = `data:${type};base64,${base64}`;
      return durl;
    },
    any_download_direct(p_href) {
      let link = document.createElement("a");

      link.download = "pupu.txt";
      link.href = p_href;

      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    any_download(data_url, name, file_type) {
      let link = document.createElement("a");
      if (file_type != undefined) {
        name = `${name}${file_type.trim()}`;
      }

      link.download = name;
      link.href = data_url;

      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    setDecoder(direction) {
      if (direction == "in") {
        this.in_upload_dialog = true;
      }
      if (direction == "out") {
        this.out_upload_dialog = true;
      }

      let l_decoder = this.decoderItems(direction);
      if (l_decoder.length > 0) {
        this.decoder.value = l_decoder[0].key;
      }
    },
    decoderItems(direction) {
      let l_type = "";
      let l_decoder = [];

      if (this.file_type) {
        l_type = this.file_type == "out" ? ".outp" : `.${this.file_type}`;
        l_decoder = this.decoder.filtered.filter((f) => f.key.includes(l_type));
      } else {
        if (direction == "in") {
          l_decoder = this.decoder.filtered.filter((f) => !f.key.includes(".outp"));
        }
        if (direction == "out") {
          l_decoder = this.decoder.filtered.filter((f) => !f.key.includes(".inp"));
        }
      }

      return l_decoder;
    },
    async any_export(direction) {
      const ldecoder = this.decoder.value.split("-")[0].trim();
      const lfiletype = this.decoder.value.split("-")[1].trim();

      let answer = null;
      try {
        let options = {
          onDownloadProgress: (progressEvent) => {
            if (this.progress_color != "secondary") {
              this.progress_color = "secondary";
            }
            this.progress_value = progressEvent.loaded * (progressEvent.total / 100);
          },
          params: {
            decoder: ldecoder.trim(),
            direction: direction,
            filetype: lfiletype,
          },
        };

        let recrypt = this.encryption.recrypt;
        let ota_wrap_mode = this.encryption.ota_wrap_mode.value;
        let hsm_id = this.encryption.hsm_id.value;
        let tk_ota_id = this.encryption.tk_ota_id.value;
        let tk_net_id = this.encryption.tk_net_id.value;

        if (recrypt) {
          options.params.recrypt = recrypt;
          if (ota_wrap_mode) {
            options.params.ota_wrap_mode = ota_wrap_mode;
          }

          if (hsm_id) {
            options.params.hsm_id = hsm_id;
          }

          if (tk_ota_id) {
            options.params.tk_ota_id = tk_ota_id;
          }

          if (tk_net_id) {
            options.params.tk_net_id = tk_net_id;
          }
        }

        let slice = this.slice.value;
        let start_iccid = this.slice.start_iccid.value;
        let quantity = this.slice.quantity.value;

        if (slice) {
          options.params.slice = slice;
          if (start_iccid) {
            options.params.start_iccid = start_iccid;
          }

          if (quantity) {
            options.params.quantity = quantity;
          }
        }

        if (this.export_eid) {
          options.params.export_eid = true;
        }

        this.progress = true;
        let answer = await this.$axios.$get(`api/v1/orders/export/${this.order.id}`, options);
        this.progress = false;

        let l_gen_url = `data:text/plain;charset=UTF-8;base64,`;
        l_gen_url += answer;
        const order_name = this.formatExportFileName() || this.order.name;

        this.any_download(l_gen_url, `${order_name}${lfiletype}.gz`);
      } catch (err) {
        const lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
        this.progress = false;
        this.progress_value = 0;
      }

      return answer;
    },
    async rfs_download(id) {
      let answer = await this.rfs_get(id);
      if (answer != null) {
        this.any_download(answer.content.data_url, answer.fname);
      }
    },
    async onGeneratedInUpload(event) {
      console.log(`onGeneratedInUpload - enter`);
      let lcontent = JSON.stringify(event.generated);
      console.log(event.generated);

      this.oin_name = "generate.json";
      this.oin_text = lcontent;
      this.in_mode = "input";
      await this.executeInput();
    },
    async onGeneratedOutUpload(event) {
      let lcontent = JSON.stringify(event.generated_sample);
      this.out_expand_open = true;
      this.out_expand_key++;
      this.oout_name = "generate.json";
      this.m_original_out_full = lcontent;
      this.m_effective_out_sample = event.generated_sample;
      this.selected_out_tab = 1;
      this.enrich_expand_open = true;
      this.view_out_json = false;
      this.out_mode = "output";
      await this.loadOrder();
      await this.reload_rfs();
      await this.syncOutFiles();
    },
    // STEP INPUT
    onInDownload() {
      let files = this.rfs.filter((r) => r.field == "oin");
      if (files.length == 0) {
        return;
      }
      let file = files[0];
      let ldata_url = this.gen_data_url(file.ftype, btoa(this.oin_text));
      this.any_download(ldata_url, file.fname);
    },
    async onInExport() {
      this.in_export_dialog = false;
      await this.any_export("in");
    },
    async executeInput() {
      this.in_json = null;
      let ldecoder = this.decoder.value.split("-")[0];
      let ltype = this.decoder.value.split("-")[1];
      let type = "";
      this.upload_loading = true;
      if (ltype.trim() == ".json") {
        type = "application/json";
      }
      if (ltype.trim() == ".inp") {
        type = "text/plain;charset=UTF-8";
      }
      if (ltype.trim() == ".ota") {
        type = "text/plain;charset=UTF-8";
      }

      let request = {
        id: this.order.id,
        decoder: ldecoder.trim(),
        oin: this.oin_text,
        name: this.oin_name,
        type,
      };

      let answer = null;
      try {
        let options = {
          onDownloadProgress: (progressEvent) => {
            if (this.progress_color != "secondary") {
              this.progress_color = "secondary";
            }
            this.progress_value = progressEvent.loaded * (progressEvent.total / 100);
          },
          onUploadProgress: (progressEvent) => {
            if (this.progress_color != "success") {
              this.progress_color = "success";
            }
            this.progress_value = (progressEvent.loaded * 100) / progressEvent.total;
          },

          headers: {
            "Content-Type": "multipart/form-data",
          },
        };

        const formData = new FormData();
        formData.append("request", JSON.stringify(request));

        this.progress = true;
        answer = await this.$axios.$post("api/v1/orders/input", formData, options);
        this.progress = false;

        this.in_upload_dialog = false;
        this.order = answer.order;
        this.in_json = answer.in;
        await this.reload_rfs();
        await this.syncInFiles();
        this.selected_in_tab = 1;
        this.decoder.value = "flolive - .json";
        this.upload_loading = false;
        this.file_type = null;
        this.tellUser("success", `Id:${this.order.id} updated successfully.`);
      } catch (err) {
        this.progress = false;
        this.upload_loading = false;
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      return answer;
    },
    async onOinFileChanged(event) {
      console.log(`order: onOinFileChanged - enter`);

      if (!event) {
        console.log(`order - onOinFileChanged - undefined event`);
        return;
      }

      let ldata_url = await helpers.readFileAsDataURL(event);
      let bas64_pos = ldata_url.indexOf(",") + 1;
      this.file_type = event.name.slice(((event.name.lastIndexOf(".") - 1) >>> 0) + 2);
      if (bas64_pos != 0 && ["inp", "json", "ota"].includes(this.file_type)) {
        let lcontent = atob(ldata_url.substring(bas64_pos));
        this.oin_text = lcontent;
        this.oin_name = event.name;
        this.view_in_text = true;
        this.view_in_expand_key++;
        this.in_upload_error = false;
        this.in_upload_error_message = "";
      } else {
        this.in_upload_error = true;
        this.in_upload_error_message = "Please provide valid input file (inp/json/ota).";
      }
    },
    getBatchNumber() {
      let l_out_sample = this.getEffectiveOutSample();
      let batch_number = null;

      if (l_out_sample.hasOwnProperty("data")) {
        const l_data = l_out_sample.data;
        if (l_data.hasOwnProperty("headers")) {
          const l_headers = l_data.headers;
          for (let lh of l_headers) {
            if (lh.name == "batch") {
              batch_number = lh.value;
            }
          }
        }
      }

      return batch_number;
    },

    // STEP OUTPUT
    onOutDownload() {
      let files = this.rfs.filter((r) => r.field == "oout");
      if (files.length == 0) {
        return;
      }

      let file = files[0];
      let ldata_url = this.gen_data_url(file.ftype, btoa(this.getOriginalOut()));
      this.any_download(ldata_url, file.fname);
    },
    changeSlice(event) {
      if (!event) {
        this.slice.start_iccid.value = "";
        this.slice.quantity.value = 0;
      } else {
        let l_effective = this.getEffectiveOutSample();

        if (l_effective.hasOwnProperty("data")) {
          let l_data = l_effective.data;

          if (l_data.hasOwnProperty("inputs")) {
            let l_inputs = l_data.inputs;

            for (let i = 0; i < l_inputs.length; i++) {
              let { name, value } = l_inputs[i];
              if (name == "iccid") {
                this.slice.start_iccid.value = value;
              }
            }
          }
          if (l_data.hasOwnProperty("headers")) {
            let l_headers = l_data.headers;

            for (let i = 0; i < l_headers.length; i++) {
              let { name, value } = l_headers[i];
              if (name == "quantity") {
                this.$set(this.slice.quantity, "rule", (v) => {
                  const num = Number(v);
                  return (!isNaN(num) && num >= 1 && num <= value) || `Specify a number between 1 and ${value}.`;
                });
              }
            }
          }
        }
      }
    },
    changeEncryption(event) {
      if (!event) {
        this.encryption.ota_wrap_mode.value = "raw";
        this.encryption.hsm_id.value = event;
        this.encryption.tk_ota_id.value = event;
        this.encryption.tk_net_id.value = event;
      } else {
        let l_effective = this.getEffectiveOutSample();

        if (l_effective.hasOwnProperty("data")) {
          let l_data = l_effective.data;

          if (l_data.hasOwnProperty("headers")) {
            let l_headers = l_data.headers;

            for (let i = 0; i < l_headers.length; i++) {
              let { name, value } = l_headers[i];

              switch (name) {
                case "hsm_id":
                  this.encryption.hsm_id.value = value;
                  this.loadHsmTkKeys(value);
                  break;
                case "ota_wrap_mode":
                  this.encryption.ota_wrap_mode.value = value;
                  this.loadHsms(value);
                  break;
                case "tk_ota_id":
                  this.encryption.tk_ota_id.value = value;
                  break;
                case "tk_net_id":
                  this.encryption.tk_net_id.value = value;
                  break;
              }
            }
          }
        }
      }
    },
    disableOutExport() {
      return (this.slice.value && !this.slice.valid) || !this.export_file.value || (this.encryption.recrypt && this.encryption.ota_wrap_mode.value != "raw" && (!this.encryption.hsm_id.value || !this.encryption.ota_wrap_mode.value || !this.encryption.tk_net_id.value));
    },
    closeOutExport() {
      this.slice.value = false;
      this.export_file.value = "";
      this.slice.start_iccid.value = "";
      this.slice.quantity.value = 0;
      this.encryption.recrypt = false;
      this.encryption.ota_wrap_mode.value = false;
      this.encryption.hsm_id.value = false;
      this.encryption.tk_ota_id.value = false;
      this.encryption.tk_net_id.value = false;
      this.out_export_dialog = false;
    },
    async onOutExport() {
      await this.any_export("out");
      this.closeOutExport();
    },
    async executeOutput() {
      this.upload_loading = true;
      this.m_effective_out_sample = null;
      this.in_json = null;

      let ldecoder = this.decoder.value.split("-")[0];
      let ltype = this.decoder.value.split("-")[1];
      let type = "";

      if (ltype.trim() == ".json") {
        type = "application/json";
      }
      if (ltype.trim() == ".outp") {
        type = "text/plain;charset=UTF-8";
      }
      if (ltype.trim() == ".ota") {
        type = "text/plain;charset=UTF-8";
      }
      // if (ltype.trim() == ".csv") {
      //   type = "text/plain;charset=UTF-8";
      // }

      let request = {
        id: this.order.id,
        decoder: ldecoder.trim(),
        oout: this.getOriginalOut(),
        name: this.oout_name,
        iccid_check_digit: this.iccid_check_digit,
        blanks: this.blanks,
        type,
      };
      let answer = null;
      try {
        let options = {
          onDownloadProgress: (progressEvent) => {
            // console.log(progressEvent); // seems never to be called
            if (this.progress_color != "secondary") {
              this.progress_color = "secondary";
            }
            this.progress_value = progressEvent.loaded * (progressEvent.total / 100);
          },
          onUploadProgress: (progressEvent) => {
            if (this.progress_color != "success") {
              this.progress_color = "success";
            }
            this.progress_value = (progressEvent.loaded * 100) / progressEvent.total;
          },

          headers: {
            "Content-Type": "multipart/form-data",
          },
        };

        const formData = new FormData();
        formData.append("request", JSON.stringify(request));
        this.progress = true;
        answer = await this.$axios.$post("api/v1/orders/output", formData, options);
        this.progress = false;
        this.out_upload_dialog = false;
        this.order = answer.order;
        await this.reload_rfs();
        await this.syncOutFiles();

        this.selected_out_tab = 1;
        this.enrich_expand_open = true;
        this.view_out_json = false;
        this.upload_loading = false;
        this.file_type = null;
        this.tellUser("success", `Id:${this.order.id} updated successfully.`);
      } catch (err) {
        this.watchSource = null;
        this.progress = false;
        this.upload_loading = false;
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      return answer;
    },
    async onOoutFileChanged(event) {
      console.log(`order: onOoutFileChanged - enter`);
      await this.syncInFiles();

      if (!event) {
        console.log(`order - onOoutFileChanged - undefined event`);
        return;
      }

      let ldata_url = await helpers.readFileAsDataURL(event);
      let bas64_pos = ldata_url.indexOf(",") + 1;
      this.file_type = event.name.slice(((event.name.lastIndexOf(".") - 1) >>> 0) + 2);
      if (bas64_pos != 0 && ["out", "outp", "json", "ota"].includes(this.file_type)) {
        let lcontent = atob(ldata_url.substring(bas64_pos));
        console.log(`order: onOoutFileChanged - ${JSON.stringify(this.getOriginalOutSample())}`);
        this.m_original_out_full = lcontent;
        this.oout_name = event.name;
        this.view_out_text = true;
        this.view_out_expand_key++;
        this.out_upload_error = false;
        this.out_upload_error_message = "";
      } else {
        this.out_upload_error = true;
        this.out_upload_error_message = "Please provide valid output file (out/outp/json/ota).";
      }
    },
    async executeProcess() {
      let request = {
        id: this.order.id,
        override: this.override,
      };

      let answer = null;
      try {
        answer = await this.$axios.$post("api/v1/orders/process", request);
        this.order = answer.order;
        this.out_expand_key++;
        this.loadOrderItems();
        this.out_expand_open = false;
        this.process_expand_open = true;
        this.process_expand_key++;
        this.tellUser("success", `Id:${this.order.id} process started successfully.`);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      this.process_loading = false;
      return answer;
    },
    async outFileProcess() {
      this.process_loading = true;
      this.enrich_expand_open = false;
      this.enrich_expand_key++;
      await this.executeProcess();
    },
    // STEP ENRICH
    async executeEnrich(event) {
      console.log(`flo-order-enrich - executeEnrich - event: ${JSON.stringify(event)}`);
      let request = {
        id: this.order.id,
        sample: this.sample,
        ...event,
      };

      let answer = null;
      try {
        let options = {
          onDownloadProgress: (progressEvent) => {
            this.progress_value = progressEvent.loaded * (progressEvent.total / 100);
          },
          responseType: "stream",
        };

        this.progress = true;
        answer = await this.$axios.$post("api/v1/orders/enrich", request, options);
        this.progress = false;
        this.m_effective_out_sample = answer.out;
        this.enrich_sample = true;
        this.tellUser("success", `Id:${this.order.id} enriched successfully.`);
      } catch (err) {
        this.progress = false;
        this.progress_value = 0;
        let lerr = this.parseNetError(err);
        this.enrich_sample = false;
        this.tellUser("error", lerr);
      }

      return answer;
    },
    async executeEnrichAccept(event) {
      let enrich = {
        id: this.order.id,
        sample: this.sample,
        ...event,
      };

      let request = {
        id: this.order.id,
        enrich: enrich,
      };
      let answer = null;
      try {
        let options = {
          onDownloadProgress: (progressEvent) => {
            if (this.progress_color != "secondary") {
              this.progress_color = "secondary";
            }
            this.progress_value = progressEvent.loaded * (progressEvent.total / 100);
          },
          onUploadProgress: (progressEvent) => {
            if (this.progress_color != "success") {
              this.progress_color = "success";
            }
            this.progress_value = (progressEvent.loaded * 100) / progressEvent.total;
          },

          headers: {
            "Content-Type": "multipart/form-data",
          },
        };

        let formData = new FormData();
        formData.append("request", JSON.stringify(request));

        this.progress = true;
        answer = await this.$axios.$post("api/v1/orders/enrich/accept", formData, options);
        this.progress = false;
        await this.reload_rfs();
        this.out_version++;
        this.enrich_expand_open = false;
        this.enrich_expand_key++;
        this.enriched_order = true;
        this.m_effective_out_sample = answer.out;
        this.enrich_sample = false;
        this.tellUser("success", `Id:${this.order.id} enriched successfully.`);
      } catch (err) {
        this.progress = false;
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      return answer;
    },
    async onEnrich(event) {
      await this.executeEnrich(event);
    },
    async onEnrichAccept(event) {
      await this.executeEnrichAccept(event);
    },
    onEnrichLocalFactory(event) {
      this.enrich_local_factory = event;
    },
    async onEnrichBlank(event) {
      let enrichRequest = {
        id: this.order.id,
        sample: this.sample,
        ...event,
      };

      try {
        let enrichOptions = {
          onDownloadProgress: (progressEvent) => {
            this.progress_value = (progressEvent.loaded / progressEvent.total) * 100;
          },
          responseType: "stream",
        };

        this.progress = true;
        await this.$axios.$post("api/v1/orders/enrich", enrichRequest, enrichOptions);
        this.enrich_sample = true;

        let enrichAcceptRequest = {
          id: this.order.id,
          enrich: {
            id: this.order.id,
            sample: this.sample,
            ...event,
          },
        };

        let enrichAcceptOptions = {
          onDownloadProgress: (progressEvent) => {
            this.progress_color = "secondary";
            this.progress_value = (progressEvent.loaded / progressEvent.total) * 100;
          },
          onUploadProgress: (progressEvent) => {
            this.progress_color = "success";
            this.progress_value = (progressEvent.loaded / progressEvent.total) * 100;
          },
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };

        let formData = new FormData();
        formData.append("request", JSON.stringify(enrichAcceptRequest));
        let enrichAcceptAnswer = await this.$axios.$post("api/v1/orders/enrich/accept", formData, enrichAcceptOptions);
        await this.reload_rfs();
        this.progress = false;
        this.out_version++;
        this.enrich_expand_key++;
        this.enrich_expand_open = true;
        this.enriched_order = true;
        this.enrich_sample = false;
        this.m_effective_out_sample = enrichAcceptAnswer.out;
        this.tellUser("success", `Id:${this.order.id} enriched successfully.`);
      } catch (err) {
        this.progress = false;
        this.progress_value = 0;
        let lerr = this.parseNetError(err);
        this.enrich_sample = false;
        this.tellUser("error", lerr);
      }
    },
    async onEnrichCancel() {
      await this.reload_rfs();
      this.out_version++;
      this.enrich_expand_open = false;
      this.enrich_sample = false;
      this.enrich_expand_key++;

      let files = this.rfs.filter((r) => r.field == "out");
      if (files.length == 0) {
        return;
      }

      let file = files[0];
      this.m_effective_out_sample = await this.getEffectiveOutRfsSample(file.id);
    },
    async loadHsms(event) {
      if (event == "wrapped") {
        this.load_hsms = true;
        this.encryption.hsm_id.items = [];
        try {
          let hsms = await this.$axios.$post("api/v1/hsms/list", {
            select: {
              key: { k: "id" },
              value: { k: "name" },
            },
          });
          this.encryption.hsm_id.items = hsms;
          this.load_hsms = false;
        } catch (err) {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
          this.load_hsms = false;
        }
      } else if (event == "raw") {
        this.encryption.hsm_id.value = false;
        this.encryption.tk_ota_id.value = false;
        this.encryption.tk_net_id.value = false;
      }
    },
    async loadHsmTkKeys(id) {
      this.encryption.tk_ota_id.items = [];
      this.encryption.tk_net_id.items = [];
      this.load_keys = true;
      try {
        let query = {
          select: {},
          where: [
            {
              k: "hsm_id",
              op: "equal",
              v: id,
            },
            {
              k: "key_type",
              op: "equal",
              v: "tk",
            },
            {
              k: "status",
              op: "equal",
              v: "active",
            },
          ],
        };

        let hsm_keys = await this.$axios.$post(`api/v1/hsm_keys/list`, query);
        hsm_keys.forEach((hsm_key) => {
          let key = {
            key: hsm_key.id,
            value: hsm_key.name,
          };
          this.encryption.tk_ota_id.items.push(key);
          this.encryption.tk_net_id.items.push(key);
        });
        this.load_keys = false;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
        this.load_keys = false;
      }
    },
    async loadReservations() {
      let reservations = [];
      try {
        let query = {
          select: {
            key: { k: "id" },
            value: { k: "name" },
            type: { k: "type" },
            final: { k: "final" },
            reconcile: { k: "reconcile" },
            quantity: { k: "quantity" },
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
        reservations = await this.$axios.$post("floinventory/v1/reservations/list", query);
        if (reservations.length > 0) {
          this.reservations.items = reservations;
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadReservationRanges(event) {
      let ranges = [];
      try {
        let query = {
          select: {},
          where: [
            {
              k: "reservation_id",
              op: "equal",
              v: event,
            },
          ],
        };
        ranges = await this.$axios.$post("floinventory/v1/ranges/list", query);
        if (ranges.length > 0) {
          this.ranges = ranges;
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
        return lerr;
      }
    },
    displayIcon(name) {
      let type = name.split(".")[1];
      switch (type) {
        case "inp":
          return {
            icon: "mdi-file-import",
            color: "info",
          };
        case "out":
          return {
            icon: "mdi-file-upload",
            color: "primary",
          };
        case "outp":
          return {
            icon: "mdi-file-upload",
            color: "primary",
          };
        case "ota":
          return {
            icon: "mdi-file-phone",
            color: "primary",
          };
        case "csv":
          return {
            icon: "mdi-file-delimited",
            color: "accent",
          };
        case "json":
          return {
            icon: "mdi-code-json",
            color: "warning",
          };
        case "pdf":
          return {
            icon: "mdi-adobe-acrobat",
            color: "error",
          };
        case "xls":
          return {
            icon: "mdi-microsoft-excel",
            color: "success",
          };
        case "xlsx":
          return {
            icon: "mdi-microsoft-excel",
            color: "success",
          };
        case "cap":
          return {
            icon: "mdi-file-code",
            color: "success",
          };
        default:
          return {
            icon: "mdi-file-alert",
            color: "warning",
          };
      }
    },
    getOrderStateColor(state) {
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
    getItemCodeColor(code) {
      let colorMap = {
        0: "info",
        100: "info",
        101: "accent",
        200: "success",
        400: "error",
        404: "error",
        500: "error",
      };

      return colorMap[code] || "warning";
    },
    getItemColor(state) {
      let colorMap = {
        pending: "info",
        manufacturing: "primary",
        manufactured: "secondary",
        scheduled: "secondary",
        progress: "accent",
        suspended: "warning",
        canceling: "error",
        exception: "error",
        completed: "success",
      };

      return colorMap[state] || "error";
    },
    canDeleteFile() {
      if (["process", "completed", "exception", "suspend", "canceled"].includes(this.order.state)) {
        return false;
      }

      return true;
    },
    canRecrypt() {
      if (this.order.type == "blank" && this.decoder.value == "reconcile - .json") {
        return false;
      }
      return true;
    },
    canExportEid() {
      let d_value = this.decoder.value;
      if (d_value.includes("kigen") || d_value.includes("flolive - .outp") || d_value.includes("flo_identifiers")) {
        return true;
      }

      return false;
    },
    onChangeDecoders() {
      let d_value = this.decoder.value;

      if (this.canExportEid()) {
        this.export_eid = this.product.eid_of ? true : false;
      } else {
        this.export_eid = false;
      }

      if (d_value.includes("flolive_bss")) {
        this.export_eid = true;
      }
    },
  },
};
</script>
