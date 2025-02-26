<template>
  <div>
    <v-dialog :overlay-opacity="0.4" v-model="upload.dialog" persistent scrollable max-width="600px">
      <v-card v-if="upload.dialog">
        <v-card-title>
          <span class="headline">Import Cards</span>
        </v-card-title>

        <v-card-text>
          <v-container fluid class="ma-0 pa-0">
            <v-row no-gutters>
              <v-col cols="12" class="pa-1">
                <blockquote class="subtitle-1">
                  Note: Format is CSV with the following headers:
                  <br />
                  <code>"ICCID", "TEMPLATE", "DESC", "ADM", "KIC", "KID", "PACKAGE"</code>
                </blockquote>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" class="pa-1">
                <flo-account-select v-model="upload.path" :disabled="disabled()" label="Path" hint="Access Path" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12">
                <v-file-input accept=".csv" label="Upload CSV file" @change="uploadChanged($event)" :disabled="disabled()" :truncate-length="$vuetify.breakpoint.xs ? 25 : 50"></v-file-input>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" class="pa-1">
                <v-alert v-if="upload.failure_count > 0" outlined dense type="error">Save failures: {{ upload.failure_count }} out of {{ upload.parsing_count }}</v-alert>
                <v-alert v-else-if="upload.progress != ''" outlined dense :type="`${upload.parse_error ? 'error' : 'success'}`">{{ upload.progress }}</v-alert>
              </v-col>
            </v-row>

            <v-row v-if="upload.saved_count" no-gutters>
              <v-col cols="12" class="pa-1">
                <v-progress-linear active rounded striped :background-opacity="0.3" :height="15" :value="upload.saved_percent" color="light-blue">
                  <strong>{{ Math.floor(upload.saved_percent) }}%</strong>
                </v-progress-linear>
              </v-col>
            </v-row>

            <v-row no-gutters v-if="failures.length > 0">
              <v-col cols="12">
                <flo-expand elevation="0" open title="Failures">
                  <template v-slot:content="{}">
                    <v-container fluid class="ma-0 pa-0">
                      <v-row no-gutters>
                        <v-col cols="12" class="pa-1">
                          <v-data-table :headers="headers" :items="failures" dense>
                            <template v-slot:[`item.status`]="{ item }">
                              <v-chip label small color="error">
                                {{ item.status }}
                              </v-chip>
                            </template>
                          </v-data-table>
                        </v-col>
                      </v-row>
                    </v-container>
                  </template>
                </flo-expand>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="closeImport()" :disabled="disabled()">Cancel</v-btn>
          <v-btn color="primary" text :disabled="disabled()" @click="saveImport()">Import</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog :overlay-opacity="0.4" v-model="attach.dialog" persistent scrollable max-width="600px">
      <v-card v-if="attach.dialog">
        <v-card-title>
          <span class="headline">Attach Subscribers To Cards</span>
        </v-card-title>

        <v-card-text>
          <v-container fluid class="ma-0 pa-0">
            <v-row no-gutters>
              <v-col cols="12" class="my-1 pa-1">
                <blockquote class="subtitle-1">
                  Note: Supported format is <code>{{ accept }}</code> with the following headers:
                  <br />
                  <code>"ICCID", "PIDX", "USED", "NAME", "IMSI", "RANGE", "MCC", "PLMN", "APN", "KIDX"</code>
                </blockquote>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" class="pa-1">
                <v-file-input @change="attachChanged($event)" :disabled="disabled()" :truncate-length="$vuetify.breakpoint.xs ? 25 : 50" :accept="accept" label="Upload file" outlined dense></v-file-input>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" class="pa-1">
                <v-alert v-if="attach.failure_count > 0" outlined dense type="error">Save failures: {{ attach.failure_count }} out of {{ attach.parsing_count }}</v-alert>
                <v-alert v-else-if="attach.progress != ''" outlined dense :type="`${attach.parse_error ? 'error' : 'success'}`">{{ attach.progress }}</v-alert>
              </v-col>
            </v-row>
            <v-row v-if="attach.saved_count" no-gutters>
              <v-col cols="12" class="pa-1">
                <v-progress-linear active rounded striped :background-opacity="0.3" :height="15" :value="attach.saved_percent" color="light-blue">
                  <strong>{{ Math.floor(attach.saved_percent) }}%</strong>
                </v-progress-linear>
              </v-col>
            </v-row>
            <v-row no-gutters v-if="failures.length > 0">
              <v-col cols="12">
                <flo-expand elevation="0" open title="Failures">
                  <template v-slot:content="{}">
                    <v-container fluid class="ma-0 pa-0">
                      <v-row no-gutters>
                        <v-col cols="12" class="pa-1">
                          <v-data-table :headers="headers" :items="failures" dense>
                            <template v-slot:[`item.status`]="{ item }">
                              <v-chip label small color="error">
                                {{ item.status }}
                              </v-chip>
                            </template>
                          </v-data-table>
                        </v-col>
                      </v-row>
                    </v-container>
                  </template>
                </flo-expand>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="closeAttach()" :disabled="disabled()">Cancel</v-btn>
          <v-btn color="primary" text @click="saveAttach()" :disabled="disabled() || disableAttach()">Attach</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog :overlay-opacity="0.4" v-model="ota_counter.dialog" persistent max-width="700px">
      <v-card :key="ota_counter.key" class="ota-counter-dialog" flat>
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
              <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'">
                <blockquote class="subtitle-1">
                  <span class="title text--primary">OTA Counter</span>
                </blockquote>
              </v-col>
            </v-row>
            <v-row no-gutters justify="center">
              <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'">
                <blockquote class="subtitle-1">
                  <span>Note: Update the OTA Counter only if you know what you are doing!</span>
                </blockquote>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" class="pa-1">
                <v-tabs v-model="ota_counter.tabs" @change="onCounterTabChange($event)">
                  <v-tab key="file" :disabled="ota_counter.update_in_progress">File</v-tab>
                  <v-tab key="range" :disabled="ota_counter.update_in_progress">Range</v-tab>
                  <v-tab key="order" :disabled="ota_counter.update_in_progress">Order</v-tab>
                </v-tabs>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" class="pa-1">
                <v-tabs-items v-model="ota_counter.tabs">
                  <v-tab-item key="file">
                    <v-container fluid class="ma-0 pa-0">
                      <v-row no-gutters>
                        <v-col cols="10" class="pa-1">
                          <v-file-input v-model="ota_counter.file" :accept="accept" :error="ota_counter.error" :error-messages="ota_counter.error_message" :disabled="ota_counter.update_in_progress" label="Upload File" hint="Accepted ICCID length is 19 (with check digit)." @change="onCounterFileChanged($event)" :truncate-length="$vuetify.breakpoint.xs ? 25 : 50" outlined dense persistent-hint></v-file-input>
                        </v-col>
                        <v-col cols="12" lg="2" xl="2" class="pa-1">
                          <v-form v-model="ota_counter.valid">
                            <v-text-field v-model="ota_counter.value" :rules="ota_counter.rule" :disabled="disableOtaCounter() || ota_counter.update_in_progress" label="OTA Counter" hint="Set OTA Counter" persistent-hint outlined dense></v-text-field>
                          </v-form>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-tab-item>

                  <v-tab-item key="range">
                    <v-container fluid class="ma-0 pa-0">
                      <v-row no-gutters>
                        <v-col cols="12" lg="5" xl="5" class="pa-1">
                          <v-text-field :key="ota_counter.key" :label="range.iccid_start.label" :hint="range.iccid_start.hint" :rules="[iccidRule('start')]" @input="onIccidStartInput($event)" @paste="onIccidStartPaste($event)" :disabled="ota_counter.update_in_progress" persistent-hint outlined dense counter></v-text-field>
                        </v-col>
                        <v-col cols="12" lg="5" xl="5" class="pa-1">
                          <v-text-field :key="ota_counter.key" :label="range.iccid_end.label" :hint="range.iccid_end.hint" :rules="[iccidRule('end')]" @input="onIccidEndInput($event)" @paste="onIccidEndPaste($event)" :disabled="ota_counter.update_in_progress" persistent-hint outlined dense counter></v-text-field>
                        </v-col>
                        <v-col cols="12" lg="2" xl="2" class="pa-1">
                          <v-form v-model="ota_counter.valid">
                            <v-text-field v-model="ota_counter.value" :rules="ota_counter.rule" :disabled="disableOtaCounter() || ota_counter.update_in_progress" label="OTA Counter" hint="Set OTA Counter" persistent-hint outlined dense></v-text-field>
                          </v-form>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-tab-item>

                  <v-tab-item key="order">
                    <v-container fluid class="ma-0 pa-0">
                      <v-row no-gutters>
                        <v-col cols="10" class="pa-1"> <v-autocomplete v-model="ota_counter.order_id" :items="ota_counter.items" :disabled="ota_counter.update_in_progress" label="Orders" hint="Select Order" item-text="value" item-value="key" dense persistent-hint outlined></v-autocomplete> </v-col>
                        <v-col cols="12" lg="2" xl="2" class="pa-1">
                          <v-form v-model="ota_counter.valid">
                            <v-text-field v-model="ota_counter.value" :rules="ota_counter.rule" :disabled="disableOtaCounter() || ota_counter.update_in_progress" label="OTA Counter" hint="Set OTA Counter" persistent-hint outlined dense></v-text-field>
                          </v-form>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-tab-item>
                </v-tabs-items>
              </v-col>
            </v-row>

            <v-row v-if="ota_counter.saved_count && ota_counter.tabs != 2" no-gutters>
              <v-col cols="12" class="pa-1">
                <v-progress-linear active rounded striped :background-opacity="0.3" :height="15" :value="ota_counter.saved_percent" color="light-blue">
                  <strong>{{ Math.floor(ota_counter.saved_percent) }}%</strong>
                </v-progress-linear>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" class="pa-1 mb-n3">
                <v-alert v-if="showCounterAlerts() == 'success'" outlined dense :type="`${ota_counter.parse_error ? 'error' : 'success'}`">{{ ota_counter.progress }} </v-alert>
                <v-alert v-else-if="showCounterAlerts() == 'failure'" outlined dense type="error"
                  >Update Failures: {{ ota_counter.failure_count }} out of
                  {{ ota_counter.parsing_count }}
                </v-alert>
              </v-col>
            </v-row>

            <v-row v-if="ota_counter.failure_count && ota_counter.upload_errors" no-gutters>
              <v-col cols="12" class="pa-1">
                <flo-meta-table @load-data="onLoadCounterData($event)" :disable_sort="true" :show_title="false" :show_reload="false" :single_page="false" :show_filter="false" disableExport disableNew disabledEdit local :local_meta="meta" :local_data="ota_counter.upload_errors" :local_permissions="local_permissions" resources="cards">
                  <template v-slot:view__result_status="{ fmtrow }">
                    <v-chip v-if="fmtrow._result_status" label :color="getStatusColor(fmtrow._result_status)">
                      {{ fmtrow._result_status }}
                    </v-chip>
                  </template>
                </flo-meta-table>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="onCounterDialogAction(false)">Close</v-btn>
          <v-btn color="primary" v-if="!ota_counter.update_in_progress" text @click="executeCounterData()" :disabled="disableOtaCounter(true)">Update</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <flo-meta-table :key="cards_key" v-if="translator != null" @load-data="onLoadData($event)" @post-update="onPostUpdate($event)" @pre-edit="onPreEdit($event)" @pre-new="onPreNew($event)" @query="onQuery($event)" @import-export-cancel="onDialogClose()" @import-export-tab-change="onImportExportTabChange($event)" @export-data="onExportData($event)" disableNew :translator="translator" :lookup="lookup" :resources="resources" main_resource :hidden_filter="hidden_filter" :accept="accept" :external_data="external_data" external :local_permissions="local_permissions">
      <template v-slot:ex_new="{ fab, color, smAndDown }">
        <!-- <template v-if="permissions.c == true">
          <v-btn :fab="fab" :small="smAndDown" class="mx-1" :color="color" @click="showAttach">
            <v-icon :left="!smAndDown">mdi-call-merge</v-icon>
            {{ !smAndDown ? "Attach" : "" }}
          </v-btn>
        </template> -->
        <v-btn :fab="fab" :small="smAndDown" class="mr-1" :color="color" @click="onCounterDialogAction(true)">
          <v-icon :left="!smAndDown">mdi-counter</v-icon>
          {{ !smAndDown ? "OTA Counter" : "" }}
        </v-btn>
        <v-btn :fab="fab" :small="smAndDown" class="mr-1" :color="color" router :to="{ path: '/resources/card_subs/' }">
          <v-icon :left="!smAndDown">mdi-account-multiple</v-icon>
          {{ !smAndDown ? "Card Subscribers" : "" }}
        </v-btn>
      </template>
      <template v-slot:edit_path="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <flo-account-select v-model="fmtrow.path" :label="fmtheader.text" :disabled="!fmtpermissions.u" :hint="fmtheader.hint" persistent-hint fiiled />
        </v-col>
      </template>
      <template v-slot:edit_adm="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <v-text-field :append-icon="adm ? 'mdi-eye' : 'mdi-eye-off'" autocomplete="off" readonly @click:append="adm = !adm" :type="adm ? 'text' : 'password'" v-model="fmtrow.adm" :label="fmtheader.text" :disabled="!fmtpermissions.u" :hint="fmtheader.hint" persistent-hint></v-text-field>
        </v-col>
      </template>
      <template v-slot:edit_pin1="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <v-text-field :append-icon="pin1 ? 'mdi-eye' : 'mdi-eye-off'" autocomplete="off" readonly @click:append="pin1 = !pin1" :type="pin1 ? 'text' : 'password'" v-model="fmtrow.pin1" :label="fmtheader.text" :disabled="!fmtpermissions.u" :hint="fmtheader.hint" persistent-hint></v-text-field>
        </v-col>
      </template>
      <template v-slot:edit_pin2="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <v-text-field :append-icon="pin2 ? 'mdi-eye' : 'mdi-eye-off'" autocomplete="off" readonly @click:append="pin2 = !pin2" :type="pin2 ? 'text' : 'password'" v-model="fmtrow.pin2" :label="fmtheader.text" :disabled="!fmtpermissions.u" :hint="fmtheader.hint" persistent-hint></v-text-field>
        </v-col>
      </template>
      <template v-slot:edit_puk1="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <v-text-field :append-icon="puk1 ? 'mdi-eye' : 'mdi-eye-off'" autocomplete="off" readonly @click:append="puk1 = !puk1" :type="puk1 ? 'text' : 'password'" v-model="fmtrow.puk1" :label="fmtheader.text" :disabled="!fmtpermissions.u" :hint="fmtheader.hint" persistent-hint></v-text-field>
        </v-col>
      </template>
      <template v-slot:edit_puk2="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <v-text-field :append-icon="puk2 ? 'mdi-eye' : 'mdi-eye-off'" autocomplete="off" readonly @click:append="puk2 = !puk2" :type="puk2 ? 'text' : 'password'" v-model="fmtrow.puk2" :label="fmtheader.text" :disabled="!fmtpermissions.u" :hint="fmtheader.hint" persistent-hint></v-text-field>
        </v-col>
      </template>
      <template v-slot:view_state="{ fmtrow }">
        <v-chip label color="info">{{ getState(fmtrow.state) }}</v-chip>
      </template>
      <template v-slot:view_ota_state="{ fmtrow }">
        <v-chip label class="text-capitalize" :color="getOtaState(fmtrow.ota_state)">{{ fmtrow.ota_state }}</v-chip>
      </template>
      <template v-slot:view_scp_state="{ fmtrow }">
        <v-chip label :color="getScpState(fmtrow.scp_state)">{{ fmtrow.scp_state }}</v-chip>
      </template>
      <template v-slot:edit_spi="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="`${helpers.getQATag(resources, fmtheader)}_expand`" cols="12">
          <flo-spi v-model="fmtrow.spi" :header="fmtheader" :__qa="helpers.getQATag(resources, fmtheader)" title="SPI" :pattern="fmtheader.pattern" :disabled="!fmtpermissions.u" />
        </v-col>
      </template>
      <template v-slot:edit_keyset_scp80="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="`${helpers.getQATag(resources, fmtheader)}_expand`" cols="12">
          <flo-kset v-model="fmtrow.keyset_scp80" :header="fmtheader" :__qa="helpers.getQATag(resources, fmtheader)" :keysets="enums()['keyset_scp80']" prefix="SCP80" :pattern="fmtheader.pattern" @change="redraw_kic_kid++" :disabled="!fmtpermissions.u" />
        </v-col>
      </template>
      <template v-slot:edit_keyset_scp81="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="`${helpers.getQATag(resources, fmtheader)}_expand`" cols="12">
          <flo-kset v-model="fmtrow.keyset_scp81" :header="fmtheader" :__qa="helpers.getQATag(resources, fmtheader)" :keysets="enums()['keyset_scp81']" prefix="SCP81" :pattern="fmtheader.pattern" :disabled="!fmtpermissions.u" />
        </v-col>
      </template>
      <template v-slot:edit_kid_algo="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="`${helpers.getQATag(resources, fmtheader)}_expand`" cols="12">
          <flo-kid :key="redraw_kic_kid" v-model="fmtrow.kid_algo" :header="fmtheader" :__qa="helpers.getQATag(resources, fmtheader)" :pattern="fmtheader.pattern" :keyset="fmtrow.keyset_scp80" :disabled="!fmtpermissions.u" />
        </v-col>
      </template>
      <template v-slot:edit_kic_algo="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="`${helpers.getQATag(resources, fmtheader)}_expand`" cols="12">
          <flo-kic :key="redraw_kic_kid" v-model="fmtrow.kic_algo" :header="fmtheader" :__qa="helpers.getQATag(resources, fmtheader)" :pattern="fmtheader.pattern" :keyset="fmtrow.keyset_scp80" :disabled="!fmtpermissions.u" />
        </v-col>
      </template>
      <template v-slot:edit_push_spi="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="`${helpers.getQATag(resources, fmtheader)}_expand`" cols="12">
          <flo-spi v-model="fmtrow.push_spi" :header="fmtheader" :__qa="helpers.getQATag(resources, fmtheader)" title="Push SPI" :pattern="fmtheader.pattern" :disabled="!fmtpermissions.u" />
        </v-col>
      </template>
      <template v-slot:view_iccid="{ fmtrow, fmtpermissions }">
        <v-container class="d-flex flex-nowrap">
          <span class="align-self-center text-center ml-n3">{{ fmtrow.iccid }}</span>
          <v-btn icon class="ml-1" elevation="0" router :disabled="!fmtpermissions.u" :to="{ path: '/resources/card/', query: { iccid: fmtrow.iccid } }">
            <v-icon center color="info">mdi-link</v-icon>
          </v-btn>
        </v-container>
      </template>
      <template v-slot:external="{}">
        <v-card flat class="ma-0 pa-0" :disabled="deleted.disabled">
          <v-container fluid class="ma-0 pa-0">
            <v-row no-gutters>
              <v-col cols="12" class="pa-1">
                <v-tabs v-model="deleted.tabs" @change="onTabChange($event)">
                  <v-tab key="file">From File</v-tab>
                  <v-tab key="range">From Range</v-tab>
                </v-tabs>
              </v-col>
            </v-row>

            <v-row :key="deleted.key" no-gutters>
              <v-col cols="12">
                <v-tabs-items v-model="deleted.tabs">
                  <v-tab-item key="file">
                    <v-container fluid class="ma-0 pa-0">
                      <v-row no-gutters>
                        <v-col cols="12" class="pa-1">
                          <v-file-input v-model="deleted.file" :accept="accept" :error="deleted.error" :error-messages="deleted.error_message" label="Upload File" hint="Accepted ICCID length is 19 (with check digit)." @change="exportChanged($event)" :truncate-length="$vuetify.breakpoint.xs ? 25 : 50" outlined dense persistent-hint></v-file-input>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-tab-item>

                  <v-tab-item key="range">
                    <v-container fluid class="ma-0 pa-0">
                      <v-row no-gutters>
                        <v-col cols="12" lg="6" xl="6" class="pa-1">
                          <v-text-field :label="range.iccid_start.label" :hint="range.iccid_start.hint" :rules="[iccidRule('start')]" @input="onIccidStartInput($event)" @paste="onIccidStartPaste($event)" persistent-hint outlined dense counter></v-text-field>
                        </v-col>
                        <v-col cols="12" lg="6" xl="6" class="pa-1">
                          <v-text-field :label="range.iccid_end.label" :hint="range.iccid_end.hint" :rules="[iccidRule('end')]" @input="onIccidEndInput($event)" @paste="onIccidEndPaste($event)" persistent-hint outlined dense counter></v-text-field>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-tab-item>

                  <v-row no-gutters>
                    <v-col cols="12" class="pa-1">
                      <v-alert v-if="deleted.failure_count > 0" outlined dense type="error"
                        >Delete failures: {{ deleted.failure_count }} out of
                        {{ deleted.parsing_count }}
                      </v-alert>
                      <v-alert v-else-if="deleted.progress != ''" outlined dense :type="`${deleted.parse_error ? 'error' : 'success'}`">{{ deleted.progress }} </v-alert>
                    </v-col>
                  </v-row>

                  <v-row v-if="deleted.reading_percent" no-gutters>
                    <v-col cols="12" class="pa-1">
                      <v-progress-linear active rounded striped :background-opacity="0.3" :height="15" :value="deleted.reading_percent" color="light-blue">
                        <strong>{{ Math.floor(deleted.reading_percent) }}%</strong>
                      </v-progress-linear>
                    </v-col>
                  </v-row>
                  <v-row v-if="deleted.saved_count" no-gutters>
                    <v-col cols="12" class="pa-1">
                      <v-progress-linear active rounded striped :background-opacity="0.3" :height="15" :value="deleted.saved_percent" color="light-blue">
                        <strong>{{ Math.floor(deleted.saved_percent) }}%</strong>
                      </v-progress-linear>
                    </v-col>
                  </v-row>
                </v-tabs-items>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </template>
      <template v-if="deleted.finished" v-slot:external_action="{}">
        <v-btn v-if="import_export_tabs == 'export'" color="primary" :disabled="disableExport()" @click="exportExternalData()" text>Export</v-btn>
        <v-btn v-else-if="external_data.length > 0" color="primary" :disabled="disableDelete()" @click="deleteExternalData()" text>Delete</v-btn>
        <v-btn v-else color="primary" :disabled="disableExecute()" @click="executeExternalData()" text>Execute</v-btn>
      </template>
      <template v-slot:deleteResources="{ itemForDeletion }">
        <v-row no-gutters>
          <v-col cols="12" class="pa-1">
            <blockquote class="subtitle-1">
              Note: Deleting this ICCID - {{ itemForDeletion.iccid }} will also delete the associated <br />
              Card Resources:
              <code>Keys</code>, <code>Subscribers</code>, <code>Settings</code>, <code>Applets</code>, <code>Key Store</code>, <code>HSM Keys</code>, <code>Virtual Files</code>.
            </blockquote>
          </v-col>
        </v-row>
      </template>
    </flo-meta-table>
  </div>
</template>
<script>
import parseNetError from "~/mixins/parseNetError.js";
import { mapGetters, mapActions } from "vuex";
import OTranslator from "~/src/otranslator.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
import enums from "~/src/enums.js";
export default {
  data: () => ({
    resource: "card",
    resources: "cards",
    helpers,
    enums,
    accept: ".csv",
    lookup: "",
    redraw_kic_kid: 1,
    adm: false,
    pin1: false,
    pin2: false,
    puk1: false,
    puk2: false,
    translator: null,
    meta: null,
    hidden_filter: [],
    editedItem: {},
    cards_key: 1,
    headers: [],
    external_data: [],
    failures: [],
    export_data: [],
    upload: {
      dialog: false,
      parsing_count: 0,
      reading_count: 0,
      saved_count: 0,
      saved_percent: 0,
      failure_count: 0,
      loading: false,
      progress: "",
      parse_error: false,
      file: null,
      files: [],
      path: "",
    },
    attach: {
      dialog: false,
      parsing_count: 0,
      reading_count: 0,
      saved_count: 0,
      saved_percent: 0,
      failure_count: 0,
      loading: false,
      progress: "",
      parse_error: false,
      file: null,
      files: [],
      path: "",
    },
    range: {
      iccid_start: {
        label: "Start ICCID",
        hint: "Start of the ICCID range",
        value: "",
      },
      iccid_end: {
        label: "End ICCID",
        hint: "End of the ICCID range",
        value: "",
      },
    },
    deleted: {
      file: null,
      tabs: 0,
      key: 0,
      parsing_count: 0,
      reading_count: 0,
      reading_percent: 0,
      saved_count: 0,
      saved_percent: 0,
      failure_count: 0,
      finished: true,
      disabled: false,
      progress: "",
      parse_error: false,
      error: false,
      error_message: "",
      fields: [],
      headers: [],
    },
    ota_counter: {
      items: [],
      file: null,
      tabs: 0,
      key: 0,
      value: 0,
      order_id: 0,
      valid: false,
      dialog: false,
      finish_fetching: false,
      update_in_progress: false,
      saved_count: 0,
      saved_percent: 0,
      parsing_count: 0,
      reading_count: 0,
      reading_percent: 0,
      failure_count: 0,
      finished: true,
      disabled: false,
      progress: "",
      parse_error: false,
      error: false,
      error_message: "",
      upload_errors: [],
      abort_update: false,
      fields: [],
      headers: [],
      rule: [(v) => (v !== "" && /^[0-9]*$/.test(v)) || "Field is required and accepts only numbers."],
    },
    delimiters: [
      { key: ",", value: "Comma" },
      { key: ";", value: "Semicolon" },
      { key: "=", value: "Equal Sign" },
      { key: "    ", value: "Tab" },
    ],
    local_permissions: { res: "cards", c: false, r: true, u: false, d: true },
    import_export_tabs: "",
  }),
  computed: {
    ...mapGetters({
      getResourceKey: "session/getResourceKey",
    }),
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    ...mapActions({
      addToResourceCache: "session/addToResourceCache",
    }),
    initialize() {
      this.upload.path = this.$store.state.session.membership.path;
      this.attach.path = this.upload.path;
      this.lookup = this.$route.query.imsi;
      if (this.$route.query.hasOwnProperty("iccid")) {
        this.hidden_filter = [
          {
            k: "iccid",
            op: "equal",
            v: this.$route.query.iccid,
          },
        ];
      }
      let translator = new OTranslator();
      // this.loadImeis(translator);
      this.loadProducts(translator);
      this.loadOrders(translator);
      this.loadUiccs(translator);
      this.loadHsms(translator);
      this.loadAccounts(translator);
      translator.setTimeStamp("ts");
      translator.setTimeStamp("last_seen");
      this.translator = translator;
    },
    onLoadData(data) {
      this.headers = data.headers;
      this.meta = data.meta;
      for (const header of data.headers) {
        switch (header.value) {
          case "id":
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "attr":
            {
              header.edit = false;
              header.view = false;
            }
            break;
          case "suspended":
          case "suspended_billing":
            {
              header.disable_edit = true;
              header.disable_new = true;
              header.view = false;
            }
            break;
          case "ota_counter":
          case "aname":
            {
              header.disable_new = true;
              header.edit = false;
              header.view = false;
            }
            break;
          case "eid":
          case "iccid":
            {
              header.disable_edit = true;
              header.disable_new = false;
            }
            break;
          case "ota_state":
          case "scp_state":
          case "ota_user":
          case "state":
            {
              header.gpath = "/Activity";
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "applet_state":
            {
              header.gpath = "/Activity";
            }
            break;
          case "order_id":
          case "uicc_id":
          case "hsm_id":
            {
              header.gpath = "/Network Resources";
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "product_id":
            {
              header.view = false;
              header.gpath = "/Network Resources";
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "spi":
          case "kic_algo":
          case "kid_algo":
          case "keyset_scp80":
            {
              header.view = false;
              header.edit = true;
              header.gpath = "/Security/SCP80";
            }
            break;
          case "push_spi":
          case "keyset_scp81":
            {
              header.view = false;
              header.edit = true;
              header.gpath = "/Security/SCP81";
            }
            break;
          case "adm":
          case "pin1":
          case "puk1":
          case "pin2":
          case "puk2":
            {
              header.view = false;
              header.edit = true;
              header.gpath = "/Personal";
            }
            break;
          case "last_imei":
          case "last_imsi":
          case "last_seen":
            {
              header.view = true;
              header.edit = false;
            }
            break;
          case "last_sid":
          case "last_lac":
          case "last_cellid":
          case "last_mcc":
          case "last_mnc":
          case "aid":
          case "ota_keyset_scp81":
            {
              header.view = false;
              header.edit = false;
            }
            break;
          case "path":
          case "imeis":
            {
              header.view = false;
            }
            break;
        }
      }
    },
    onLoadCounterData(data) {
      data.headers.splice(
        data.headers.length - 1,
        0,
        {
          text: "Status",
          align: "start",
          sortable: false,
          value: "_result_status",
          selected: false,
          default: false,
          disable_edit: true,
          disable_new: true,
          view: true,
          edit: true,
        },
        {
          text: "Message",
          align: "start",
          sortable: false,
          value: "_result_message",
          selected: false,
          default: false,
          disable_edit: true,
          disable_new: true,
          view: true,
          edit: true,
        },
      );
      for (const header of data.headers) {
        switch (header.value) {
          case "iccid":
          case "_result_status":
          case "_result_message":
          case "action":
            {
              header.edit = true;
              header.view = true;
            }
            break;
          default:
            {
              header.edit = false;
              header.view = false;
            }
            break;
        }
      }
    },
    onPreNew(data) {
      data.record.state = "boot";
      this.adm = true;
      this.pin1 = true;
      this.pin2 = true;
      this.puk1 = true;
      this.puk2 = true;
      this.applets = [];
      this.editedItem = data.record;
    },
    onPreEdit(data) {
      this.applets = [];
      this.editedItem = data.record;
      if ("number" == typeof this.editedItem.applet_ids) {
        this.applets.push(this.editedItem.applet_ids);
      } else if ("string" == typeof this.editedItem.applet_ids && "" != this.editedItem.applet_ids) {
        this.applets = JSON.parse(this.editedItem.applet_ids);
      }
    },
    onPostUpdate(data) {
      // suspend the subscriber in the HLR
      if (data.update.suspended != data.record.suspended) {
        this.suspendCard(data.update.suspended, data.update.iccid);
      }

      // suspend the subscriber in the Billing
      if (data.update.suspended_billing != data.record.suspended_billing) {
        this.suspendCardBilling(data.update.suspended_billing, data.update.iccid);
      }
    },
    onQuery(query) {
      query["select"] = {
        id: {},
        iccid: {},
        eid: {},
        description: {},
        state: {},
        spi: {},
        keyset_scp80: {},
        kic_algo: {},
        kid_algo: {},
        push_spi: {},
        keyset_scp81: {},
        ota_keyset_scp81: {},
        adm: {},
        product_id: {},
        imeis: {},
        suspended: {},
        suspended_billing: {},
        last_sid: {},
        last_imsi: {},
        last_imei: {},
        last_mcc: {},
        last_mnc: {},
        last_lac: {},
        last_cellid: {},
        last_seen: {},
        aid: {},
        hsm_id: {},
        uicc_id: {},
        aname: {},
        path: {},
        pin1: {},
        puk1: {},
        pin2: {},
        puk2: {},
        ota_state: {},
        scp_state: {},
        ota_user: {},
        ota_counter: {},
        order_id: {},
      };
    },
    onExportData(event) {
      this.export_data = event;
    },
    async onCounterFileChanged(event) {
      if (!event) {
        this.clearCounterData();
      } else {
        await this.loadCounterFile();
      }
    },
    onImportExportTabChange(event) {
      this.import_export_tabs = event;
      this.clearExternalData();
    },
    sendCardRegistrarSuspend(command) {
      console.log(`sendCardRegistrarSuspend command:${JSON.stringify(command)}`);

      this.$axios
        .$post(`/api/v1/cards/registrar/suspend`, command)
        .then((response) => {
          console.log(`sendCardRegistrarSuspend - response: ${JSON.stringify(response)}`);
        })
        .catch((err) => {
          if (err.hasOwnProperty("response")) {
            console.log(`sendCardRegistrarSuspend fail: ${JSON.stringify(err.response)}`);
            this.tellUser("error", `${err.response.status} - ${err.response.data}`);
          } else {
            console.log(`sendCardRegistrarSuspend fail: ${err}:${JSON.stringify(err)}`);
            this.tellUser("error", `${err}:${JSON.stringify(err)}`);
          }
        });
    },
    sendCardBillingSuspend(command) {
      console.log(`sendBillingCommand command:${JSON.stringify(command)}`);

      this.$axios
        .$post(`/api/v1/cards/billing/suspend`, command)
        .then((response) => {
          console.log(`sendBillingCommand - response: ${JSON.stringify(response)}`);
        })
        .catch((err) => {
          if (err.hasOwnProperty("response")) {
            console.log(`sendCardBillingSuspend fail: ${JSON.stringify(err.response)}`);
            this.tellUser("error", `${err.response.status} - ${err.response.data}`);
          } else {
            console.log(`sendCardBillingSuspend fail: ${err}:${JSON.stringify(err)}`);
            this.tellUser("error", `${err}:${JSON.stringify(err)}`);
          }
        });
    },
    suspendCard(suspend, iccid) {
      let request = {
        command: {
          type: "card",
          action: suspend ? "suspend" : "resume",
          iccid: iccid,
        },
      };
      this.sendCardRegistrarSuspend(request);
    },
    suspendCardBilling(suspend, iccid) {
      let request = {
        command: {
          type: "card",
          action: suspend ? "suspend" : "resume",
          iccid: iccid,
        },
      };

      this.sendCardBillingSuspend(request);
    },
    showImport() {
      this.upload.reading_count = 0;
      this.upload.progress = "";
      this.upload.parsing_count = 0;
      this.upload.parse_error = "";
      this.upload.failure_count = 0;
      this.upload.file = null;
      this.upload.dialog = true;
    },
    closeImport() {
      this.upload.saved_count = 0;
      this.upload.dialog = false;
    },
    uploadChanged(event) {
      this.upload.file = event;
    },
    async saveAllCard(cards) {
      this.upload.failure_count = 0;
      let lfailures = [];
      try {
        for (let i = 0; i < cards.length; i++) {
          let card = cards[i];

          try {
            await this.$axios.$post(`/api/v1/${this.resources.toLowerCase()}`, card);
          } catch (err) {
            this.upload.failure_count++;

            let lfailure = {
              iccid: card.iccid,
              status: 500,
              message: "",
            };

            if (err.hasOwnProperty("response")) {
              console.log(`iccid import: create - fail: ${JSON.stringify(err.response)}`);
              let lerr = this.parseNetError(err);
              lfailure.status = lerr.statusCode;
              lfailure.message = lerr.message;
              this.tellUser("error", lerr);
            } else {
              console.log(`iccid import: create - fail: ${err}`);
              let lerr = this.parseNetError(err);
              this.tellUser("error", lerr);
            }
            lfailures.push(lfailure);
          }

          this.failures = lfailures;
          this.upload.saved_count++;
          this.upload.saved_percent = this.upload.saved_count / (this.upload.parsing_count / 100);
        }

        if (this.upload.failure_count > 0) {
          console.log(`failures: ${JSON.stringify(lfailures)}`);
          this.closeImport();
        }
      } catch (err) {
        console.log(`saveAllCard - FAIL - ${err}:${JSON.stringify(err)}`);
        throw err;
      }

      return "OK";
    },
    saveImport() {
      let upload = this.upload;
      upload.reading_count = 0;
      upload.progress = "";
      upload.parsing_count = 0;
      upload.parse_error = false;
      helpers
        .readFileAsText(this.upload.file)
        .then((text) => {
          console.log(`saveImport then ...`);
          let lines = text.split(/\r?\n/);

          let headers = helpers.CSVtoArray(lines[0]);
          console.log(`saveImport headers: total:${headers.length} array:${JSON.stringify(headers)}`);
          if (7 != headers.length) {
            upload.progress = `7 headers are expected ! ${headers.length} found.`;
            upload.parse_error = true;
            return;
          }

          if ("iccid" != headers[0].toLowerCase()) {
            upload.progress = `Header 1 must be 'iccid' ! ${headers[0]} found.`;
            upload.parse_error = true;
            return;
          }

          if ("product" != headers[1].toLowerCase()) {
            upload.progress = `Header 2 must be 'product' ! ${headers[1]} found.`;
            upload.parse_error = true;
            return;
          }

          if ("desc" != headers[2].toLowerCase()) {
            upload.progress = `Header 3 must be 'desc' ! ${headers[2]} found.`;
            upload.parse_error = true;
            return;
          }

          if ("adm" != headers[3].toLowerCase()) {
            upload.progress = `Header 4 must be 'adm' ! ${headers[3]} found.`;
            upload.parse_error = true;
            return;
          }

          if ("package" != headers[6].toLowerCase()) {
            upload.progress = `Header 7 must be 'package' ! ${headers[6]} found.`;
            upload.parse_error = true;
            return;
          }

          let cards = [];
          let iccid_pos = 0;
          let product_pos = 1;
          let description_pos = 2;
          let adm_pos = 3;
          let kic_pos = 4;
          let kid_pos = 5;
          let package_pos = 6;

          upload.loading = true;
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() == "") {
              continue;
            }

            let fields = helpers.CSVtoArray(lines[i]);

            if (7 != fields.length) {
              upload.progress = `Error at line: ${i + 1}, 7 fields are expected ! ${fields.length} found.`;
              upload.parse_error = true;
              return;
            }

            this.upload.reading_count++;

            let card = {
              iccid: fields[iccid_pos],
              product: fields[product_pos],
              description: fields[description_pos],
              adm: fields[adm_pos],
              kic: fields[kic_pos],
              kid: fields[kid_pos],
              package: fields[package_pos],
              path: upload.path,
            };

            if (card.iccid != "") {
              upload.parsing_count++;
              cards.push(card);
            }

            upload.progress = `Lines: ${upload.reading_count} Parsed: ${this.upload.reading_count}`;
          }
          upload.loading = false;
          this.saveAllCard(cards)
            .then(() => {
              if (this.upload.failure_count === 0) {
                this.cards_key++;
                this.tellUser("success", `Total of ${this.upload.saved_count} cards uploaded successfully.`);
                this.closeImport();
              }
            })
            .catch((err) => {
              upload.progress = `Import error '${err}'.`;
              upload.parse_error = true;
            });
        })
        .catch((err) => {
          upload.progress = `Import error '${err}'.`;
          upload.parse_error = true;
        });
    },
    showAttach() {
      this.attach.reading_count = 0;
      this.attach.progress = "";
      this.attach.parsing_count = 0;
      this.attach.failure_count = 0;
      this.attach.file = null;
      this.attach.parse_error = "";
      this.attach.dialog = true;
    },
    closeAttach() {
      this.attach.saved_count = 0;
      this.attach.dialog = false;
    },
    attachChanged(event) {
      this.attach.file = event;
    },
    async saveAllProfiles(profiles) {
      let lfailures = [];
      this.attach.failure_count = 0;

      try {
        for (let i = 0; i < profiles.length; i++) {
          let profile = profiles[i];

          try {
            await this.$axios.$put(`/api/v1/cards/sub`, profile);
          } catch (err) {
            this.attach.failure_count++;
            let lfailure = {
              iccid: profile.iccid,
              imsi: profile.imsi,
              status: 500,
              message: "",
            };

            if (err.hasOwnProperty("response")) {
              console.log(`profile import: update - fail: ${JSON.stringify(err.response)}`);
              let lerr = this.parseNetError(err);
              lfailure.status = lerr.statusCode;
              lfailure.message = lerr.message;
              this.tellUser("error", lerr);
            } else {
              console.log(`profile import: update - fail: ${err}`);
              let lerr = this.parseNetError(err);
              this.tellUser("error", lerr);
            }
            lfailures.push(lfailure);
          }
          this.failures = lfailures;
          this.attach.saved_count++;
          this.attach.saved_percent = this.attach.saved_count / (this.attach.parsing_count / 100);
        }

        if (this.attach.failure_count > 0) {
          console.log(`failures: ${JSON.stringify(lfailures)}`);
          this.attach.saved_count = 0;
        }
      } catch (err) {
        console.log(`saveAllProfiles - FAIL - ${err}:${JSON.stringify(err)}`);
        throw err;
      }

      return "OK";
    },
    saveAttach() {
      let attach = this.attach;
      attach.reading_count = 0;
      attach.progress = "";
      attach.parsing_count = 0;
      attach.parse_error = false;
      helpers
        .readFileAsText(this.attach.file)
        .then((text) => {
          console.log(`saveAttach then ...`);
          let lines = text.split(/\r?\n/);

          let headers = helpers.CSVtoArray(lines[0]);
          console.log(`saveAttach headers: total:${headers.length} array:${JSON.stringify(headers)}`);

          if (10 != headers.length) {
            attach.progress = `10 headers are expected ! ${headers.length} found.`;
            attach.parse_error = true;
            return;
          }

          if ("iccid" != headers[0].toLowerCase()) {
            attach.progress = `Header 1 must be 'iccid' ! ${headers[0]} found.`;
            attach.parse_error = true;
            return;
          }

          if ("pidx" != headers[1].toLowerCase()) {
            attach.progress = `Header 2 must be 'pidx' ! ${headers[1]} found.`;
            attach.parse_error = true;
            return;
          }

          if ("used" != headers[2].toLowerCase()) {
            attach.progress = `Header 3 must be 'used' ! ${headers[2]} found.`;
            attach.parse_error = true;
            return;
          }

          if ("name" != headers[3].toLowerCase()) {
            attach.progress = `Header 4 must be 'name' ! ${headers[3]} found.`;
            attach.parse_error = true;
            return;
          }

          if ("imsi" != headers[4].toLowerCase()) {
            attach.progress = `Header 5 must be 'imsi' ! ${headers[4]} found.`;
            attach.parse_error = true;
            return;
          }

          if ("range" != headers[5].toLowerCase()) {
            attach.progress = `Header 6 must be 'range' ! ${headers[5]} found.`;
            attach.parse_error = true;
            return;
          }

          if ("mcc" != headers[6].toLowerCase()) {
            attach.progress = `Header 7 must be 'mcc' ! ${headers[6]} found.`;
            attach.parse_error = true;
            return;
          }

          if ("plmn" != headers[7].toLowerCase()) {
            attach.progress = `Header 8 must be 'plmn' ! ${headers[6]} found.`;
            attach.parse_error = true;
            return;
          }

          if ("apn" != headers[8].toLowerCase()) {
            attach.progress = `Header 9 must be 'apn' ! ${headers[6]} found.`;
            attach.parse_error = true;
            return;
          }

          if ("kidx" != headers[9].toLowerCase()) {
            attach.progress = `Header 10 must be 'kidx' ! ${headers[6]} found.`;
            attach.parse_error = true;
            return;
          }

          let profiles = [];
          let iccid_pos = 0;
          let pidx_pos = 1;
          let used_pos = 2;
          let name_pos = 3;
          let imsi_pos = 4;
          let range_pos = 5;
          let mcc_pos = 6;
          let plmn_pos = 7;
          let apn_pos = 8;
          let kidx_pos = 9;

          this.attach.loading = true;
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() == "") {
              continue;
            }

            let fields = helpers.CSVtoArray(lines[i]);

            if (10 != fields.length) {
              attach.progress = `Error at line: ${i + 1}, 10 fields are expected ! ${fields.length} found.`;
              attach.parse_error = true;
              return;
            }

            attach.reading_count++;

            let profile = {
              iccid: fields[iccid_pos],
              pidx: fields[pidx_pos],
              used: fields[used_pos],
              name: fields[name_pos],
              imsi: fields[imsi_pos],
              range: fields[range_pos],
              mcc: fields[mcc_pos],
              plmn: fields[plmn_pos],
              apn: fields[apn_pos],
              kidx: fields[kidx_pos],
            };

            if (profile.iccid != "") {
              attach.parsing_count++;
              profiles.push(profile);
            }

            attach.progress = `Lines: ${attach.reading_count} Parsed: ${this.upload.reading_count}`;
          }

          this.saveAllProfiles(profiles)
            .then(() => {
              if (this.attach.failure_count === 0) {
                this.cards_key++;
                this.tellUser("success", `Total of ${this.attach.saved_count} subscribers attached successfully.`);
                this.closeAttach();
              }
            })
            .catch((err) => {
              attach.progress = `Import error '${err}'.`;
              attach.parse_error = true;
            });
        })
        .catch((err) => {
          attach.progress = `Import error '${err}'.`;
          attach.parse_error = true;
        });
    },
    getState(state) {
      switch (state) {
        case 0:
          return "Manual";
        case 1:
          return "Boot";
        case 2:
          return "Active";
        case 3:
          return "Suspended";
        case 4:
          return "Dead";
        case 5:
          return "Single";
      }
    },
    getOtaState(ota_state) {
      switch (ota_state.toLowerCase()) {
        case "idle":
        case "sync": {
          return "accent";
        }
        case "edit":
        case "dbonly": {
          return "warning";
        }
        case "build":
        case "wait_delay": {
          return "primary";
        }
        case "wait":
        case "error": {
          return "error";
        }
        default: {
          return "info";
        }
      }
    },
    getScpState(scp_state) {
      switch (scp_state.toLowerCase()) {
        case "idle": {
          return "info";
        }
        case "progress": {
          return "accent";
        }
        case "exception": {
          return "error";
        }
        case "completed": {
          return "success";
        }
        case "wait_por":
        case "wait_deliver":
        case "wait_handshake":
        case "wait_register": {
          return "primary";
        }
        default: {
          return "warning";
        }
      }
    },
    getStatusColor(status) {
      switch (status) {
        case 0:
          return "info";
        case 100:
          return "info";
        case 101:
          return "accent";
        case 200:
          return "success";
        case 400:
          return "error";
        case 404:
          return "error";
        case 500:
          return "error";
        default:
          return "warning";
      }
    },
    disabled() {
      let l_disabled = false;
      if (this.upload.saved_count || this.attach.saved_count) {
        l_disabled = true;
      }
      return l_disabled;
    },
    disableAttach() {
      let l_disabled = false;
      if (!this.attach.file) {
        l_disabled = true;
      }
      return l_disabled;
    },
    showCounterAlerts() {
      const { tabs, progress, saved_percent, failure_count } = this.ota_counter;

      if (progress && (tabs == 2 || saved_percent == 0)) {
        return "success";
      } else if (failure_count && tabs != 2) {
        return "failure";
      }
    },
    onTabChange() {
      this.clearExternalData();
    },
    onCounterTabChange() {
      if (this.ota_counter.tabs == 1) {
        this.ota_counter.key++;
      }
      this.clearCounterData();
    },
    onDialogClose() {
      this.deleted.tabs = 0;
      this.clearExternalData();
    },
    onCounterDialogAction(val) {
      let { update_in_progress, saved_percent, tabs } = this.ota_counter;
      if (val == false && update_in_progress && saved_percent != 100 && tabs != 2) {
        this.ota_counter.abort_update = true;
        this.tellUser("warning", "OTA Counter update aborted.");
      }
      this.ota_counter.tabs = 0;
      this.ota_counter.dialog = val;
      this.clearCounterData();
    },
    onIccidStartPaste(event) {
      this.range.iccid_start.value = event.clipboardData.getData("text/plain");
    },
    onIccidEndPaste(event) {
      this.range.iccid_end.value = event.clipboardData.getData("text/plain");
    },
    onIccidStartInput(event) {
      this.range.iccid_start.value = event;
    },
    onIccidEndInput(event) {
      this.range.iccid_end.value = event;
    },
    iccidRule(type) {
      let start = this.range.iccid_start.value;
      let end = this.range.iccid_end.value;
      let rule = /^[0-9]{18}$/;

      if (type == "start") {
        if (!rule.test(start) || !start) {
          return "Accepted ICCID length is 18 (without check digit).";
        }
        if (rule.test(end) && !!end) {
          if (start > end) {
            return "Start ICCID can't be greater than the End ICCID.";
          }
        }
        return true;
      }

      if (type == "end") {
        if (!rule.test(end) || !end) {
          return "Accepted ICCID length is 18 (without check digit).";
        }
        if (rule.test(start) && !!start) {
          if (end < start) {
            return "End ICCID can't be lower than the Start ICCID.";
          }
        }
        return true;
      }
    },
    scrollToTop(element) {
      document.getElementsByClassName(element)[0].scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest", scrollMode: "always" });
    },
    clearExternalData() {
      this.range.iccid_start.value = "";
      this.range.iccid_end.value = "";
      this.external_data = [];
      this.export_data = [];
      this.deleted.reading_count = 0;
      this.deleted.parsing_count = 0;
      this.deleted.failure_count = 0;
      this.deleted.saved_count = 0;
      this.deleted.saved_percent = 0;
      this.deleted.reading_percent = 0;
      this.deleted.progress = "";
      this.deleted.parse_error = "";
      this.deleted.error_message = "";
      this.deleted.fields = [];
      this.deleted.headers = [];
      this.deleted.file = null;
      this.deleted.error = false;
      this.deleted.finished = true;
      this.deleted.key++;
    },
    clearCounterData() {
      this.range.iccid_start.value = "";
      this.range.iccid_end.value = "";
      this.ota_counter.value = 0;
      this.ota_counter.update_in_progress = false;
      this.ota_counter.order_id = 0;
      this.ota_counter.reading_count = 0;
      this.ota_counter.parsing_count = 0;
      this.ota_counter.failure_count = 0;
      this.ota_counter.saved_count = 0;
      this.ota_counter.saved_percent = 0;
      this.ota_counter.reading_percent = 0;
      this.ota_counter.progress = "";
      this.ota_counter.parse_error = false;
      this.ota_counter.fields = [];
      this.ota_counter.headers = [];
      this.ota_counter.file = null;
      this.ota_counter.error = false;
      this.ota_counter.error_message = "";
      this.ota_counter.upload_errors = [];
    },
    disableExecute() {
      if (!this.deleted.tabs) {
        return !this.deleted.fields.length > 0;
      } else {
        return !(this.iccidRule("start") === true && this.iccidRule("end") === true);
      }
    },
    disableDelete() {
      return this.external_data.every((e) => e.id == null);
    },
    disableExport() {
      return this.export_data.length == 0;
    },
    disableOtaCounter(action) {
      let { tabs, file, order_id, valid, update_in_progress, parse_error } = this.ota_counter;
      let iccidRuleStart = this.iccidRule("start");
      let iccidRuleEnd = this.iccidRule("end");
      if (action) {
        if (tabs == 0) {
          return file == null || !valid || update_in_progress || parse_error;
        } else if (tabs == 1) {
          return !(iccidRuleStart == true && iccidRuleEnd == true && valid && !update_in_progress);
        } else {
          return order_id == 0 || !valid || update_in_progress;
        }
      } else {
        if (tabs == 0) {
          return file == null;
        } else if (tabs == 1) {
          return !(iccidRuleStart == true && iccidRuleEnd == true);
        } else {
          return order_id == 0;
        }
      }
    },
    async exportExternalData() {
      let externalData = this.export_data;
      this.scrollToTop("flo-imp-exp");
      if (externalData) {
        externalData = externalData.map((m) =>
          Object.entries(m).reduce((mapped, [k, v]) => {
            mapped[k] = null;
            let type = typeof v;
            switch (type) {
              case "object":
                mapped[k] = JSON.parse(JSON.stringify(v));
                break;
              case "string":
                mapped[k] = v.trim();
                break;
              default:
                mapped[k] = v;
                break;
            }
            return mapped;
          }, {}),
        );

        let link = document.createElement("a");
        link.href = "data:text/csv;charset=utf-8," + encodeURI(helpers.JSONToXSV(externalData, ","));
        link.download = `${this.resources.toLowerCase()}.csv`;
        link.click();
        link.remove();
      }
    },
    async executeExternalData() {
      this.external_data = [];
      this.deleted.reading_count = 0;
      if (!this.deleted.tabs) {
        if (this.deleted.fields.length > 0) {
          let iccids = this.deleted.fields;
          for (let i = 0; i < iccids.length; i++) {
            await this.loadExternalData(iccids[i], i);
          }
        }
      } else {
        if (this.iccidRule("start") == true && this.iccidRule("end") == true) {
          let start = this.range.iccid_start.value;
          let end = this.range.iccid_end.value;
          this.deleted.parsing_count = BigInt(end) - BigInt(start) + BigInt(1);
          await this.calculateIccidRange(start, end);
        }
      }
      this.deleted.reading_percent = 0;
    },
    async deleteExternalData() {
      this.deleted.finished = false;
      this.deleted.reading_percent = 0;
      let externalData = this.external_data;
      this.scrollToTop("flo-imp-exp");
      this.deleted.disabled = true;
      if (externalData.length > 0) {
        for (let data of externalData) {
          if (data.hasOwnProperty("id")) {
            try {
              await this.$axios.$delete(`/api/v1/cards/${data.id}`);
              data["_result_status"] = 200;
              data["_result_message"] = "Resource deleted successfully.";
            } catch (err) {
              this.deleted.failure_count++;
              let lerr = this.parseNetError(err);
              data["_result_status"] = lerr.statusCode;
              data["_result_message"] = lerr.message;
              this.deleted.disabled = false;
              this.tellUser("error", lerr);
            }
          }
          this.deleted.saved_count++;
          this.deleted.saved_percent = this.deleted.saved_count / (Number(this.deleted.parsing_count) / 100);
        }
        this.deleted.saved_count = 0;
      }
      this.deleted.disabled = false;
    },
    async calculateIccidRange(start, end) {
      let count = 0;
      for (let current = start; current <= end; count++) {
        await this.loadExternalData(current, count);
        let carry = 1;
        let result = "";
        for (let i = current.length - 1; i >= 0; i--) {
          let digit = Number(current[i]) + carry;
          carry = 0;
          if (digit > 9) {
            digit = 0;
            carry = 1;
          }
          result = digit + result;
        }
        current = carry ? "1" + result : result;
      }
    },
    async exportChanged(event) {
      if (!event) {
        this.clearExternalData();
      } else {
        await this.loadExternalFile();
      }
    },
    async loadExternalFile() {
      let l_data = [];
      this.deleted.fields = [];
      await helpers
        .readFileAsText(this.deleted.file)
        .then((text) => {
          let lines = text.split(/\r?\n/);
          let l_delimiter = this.delimiters.map((m) => m.key).filter((f) => lines[0].includes(f));
          let l_headers = [];
          if (l_delimiter.length > 0) {
            l_headers = helpers.parseCSV(lines[0], l_delimiter).map((m) => {
              this.deleted.headers.push({ key: m.toLowerCase(), value: helpers.formatString(m) });

              return m.toLowerCase();
            });
          } else {
            let cleanLines = lines[0].toLowerCase().replace(/"/g, "");
            l_headers.push(cleanLines);
            this.deleted.headers.push({ key: cleanLines, value: helpers.formatString(lines[0]) });
          }

          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() == "") {
              continue;
            }

            let l_fields = [];
            if (l_delimiter.length > 0) {
              l_fields = helpers.parseCSV(lines[i], l_delimiter);
            } else {
              l_fields.push(lines[i]);
            }

            let has_iccid = l_headers.some((s) => s == "iccid");
            if (!has_iccid) {
              this.deleted.error = true;
              this.deleted.error_message = "File is missing ICCID.";
              return;
            }

            if (lines[i] && !/^[0-9]{19}$/.test(+lines[i])) {
              this.deleted.parse_error = true;
              this.deleted.progress = `Error at line ${i + 1} - ICCID length is ${lines[i].length}, accepted length is 19 (with check digit).`;
              return;
            }

            if (l_headers.length != l_fields.length) {
              this.deleted.progress = `Error at line: ${i + 1}, ${l_headers.length} fields are expected, but ${l_fields.length} found.`;
              this.deleted.parse_error = true;
              return;
            }

            l_data = l_data.concat(l_fields);
            this.deleted.fields = l_data;
            this.deleted.reading_count++;
            this.deleted.parsing_count++;
            this.deleted.progress = `Lines: ${this.deleted.reading_count}, Parsed: ${this.deleted.reading_count}`;
          }
        })
        .catch((err) => {
          this.deleted.progress = `Import error '${err}'.`;
          this.deleted.parse_error = true;
        });
    },
    async loadCounterFile() {
      let l_data = [];
      this.ota_counter.parse_error = false;
      this.ota_counter.fields = [];
      await helpers
        .readFileAsText(this.ota_counter.file)
        .then((text) => {
          let lines = text.split(/\r?\n/);
          let l_delimiter = this.delimiters.map((m) => m.key).filter((f) => lines[0].includes(f));
          let l_headers = [];
          if (l_delimiter.length > 0) {
            l_headers = helpers.parseCSV(lines[0], l_delimiter).map((m) => {
              this.ota_counter.headers.push({ key: m.toLowerCase(), value: helpers.formatString(m) });

              return m.toLowerCase();
            });
          } else {
            let cleanLines = lines[0].toLowerCase().replace(/"/g, "");
            l_headers.push(cleanLines);
            this.ota_counter.headers.push({ key: cleanLines, value: helpers.formatString(lines[0]) });
          }

          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() == "") {
              continue;
            }

            let l_fields = [];
            if (l_delimiter.length > 0) {
              l_fields = helpers.parseCSV(lines[i], l_delimiter);
            } else {
              l_fields.push(lines[i]);
            }

            let has_iccid = l_headers.some((s) => s == "iccid");
            if (!has_iccid) {
              this.ota_counter.progress = "File is missing ICCID.";
              this.ota_counter.parse_error = true;
              return;
            }

            if (lines[i] && !/^[0-9]{19}$/.test(+lines[i])) {
              this.ota_counter.progress = `Error at line ${i + 1} - ICCID length is ${lines[i].length}, accepted length is 19 (with check digit).`;
              this.ota_counter.parse_error = true;
              return;
            }

            if (l_headers.length != l_fields.length) {
              this.ota_counter.progress = `Error at line: ${i + 1}, ${l_headers.length} fields are expected, but ${l_fields.length} found.`;
              this.ota_counter.parse_error = true;
              return;
            }

            l_data = l_data.concat(l_fields);
            this.ota_counter.fields = l_data;
            this.ota_counter.reading_count++;
            this.ota_counter.parsing_count++;
            this.ota_counter.progress = `Lines: ${this.ota_counter.reading_count}, Parsed: ${this.ota_counter.reading_count}`;
          }
        })
        .catch((err) => {
          this.ota_counter.progress = `Import error '${err}'.`;
          this.ota_counter.parse_error = true;
        });
    },
    async loadExternalData(iccid, count) {
      this.deleted.disabled = true;
      try {
        let query = {
          select: {},
          where: [
            {
              k: "iccid",
              op: "like",
              v: `${iccid}%`,
            },
          ],
        };
        let answer = await this.$axios.$post("api/v1/cards/list", query);
        if (answer.length > 0) {
          this.external_data.push({ ...answer[0], _result_status: 200, _result_message: "OK" });
        } else {
          let error = {
            _result_status: 404,
            _result_message: "Not Found",
          };

          for (let i = 0; i < this.headers.length; i++) {
            let header = this.headers[i];
            if (!["action", "ts"].includes(header.value)) {
              error[header.value] = null;
            }

            if (header.value == "iccid") {
              error[header.value] = iccid;
            }
          }

          this.external_data.push(error);
        }
        this.deleted.reading_percent = (count + 1) / (Number(this.deleted.parsing_count) / 100);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.deleted.disabled = false;
        this.tellUser("error", lerr);
      }
      this.deleted.disabled = false;
    },
    async executeCounterData() {
      this.scrollToTop("ota-counter-dialog");
      let { tabs, fields, order_id, value } = this.ota_counter;
      this.ota_counter.saved_count = 0;
      this.ota_counter.saved_percent = 0;
      this.ota_counter.update_in_progress = true;
      this.ota_counter.abort_update = false;
      let req = {
        counter: value,
      };
      if (tabs == 0) {
        for (let i = 0; i < fields.length; i++) {
          req["iccid"] = fields[i];
          if (!this.ota_counter.abort_update) {
            await this.updateCounterData(req, i);
          }
        }
      } else if (tabs == 1) {
        let start = this.range.iccid_start.value;
        let end = this.range.iccid_end.value;
        this.ota_counter.parsing_count = BigInt(end) - BigInt(start) + BigInt(1);
        let count = 0;
        for (let current = start; current <= end; count++) {
          req["iccid"] = current;
          if (!this.ota_counter.abort_update) {
            await this.updateCounterData(req);
          }
          let carry = 1;
          let result = "";
          for (let i = current.length - 1; i >= 0; i--) {
            let digit = Number(current[i]) + carry;
            carry = 0;
            if (digit > 9) {
              digit = 0;
              carry = 1;
            }
            result = digit + result;
          }
          current = carry ? "1" + result : result;
        }
      } else {
        req["order_id"] = order_id;
        await this.updateCounterData(req);
      }
    },
    async updateCounterData(req) {
      try {
        let answer = await this.$axios.$post("/api/v1/cards/counter/bulk_update", req);
        if (answer.hasOwnProperty("affectedRows")) {
          if (answer.affectedRows == 0) {
            this.tellUser("warning", "No cards have been updated.");
          } else {
            this.ota_counter.progress = `Total of ${answer.affectedRows} cards updated successfully.`;
            this.tellUser("success", `Total of ${answer.affectedRows} cards updated successfully.`);
          }
          // this.ota_counter.dialog = false;
        } else {
          this.tellUser("success", `Card ICCID ${answer.iccid} updated successfully.`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        let upload_error = {};
        this.ota_counter.failure_count++;
        upload_error["iccid"] = req.iccid;
        upload_error["_result_status"] = lerr.statusCode;
        upload_error["_result_message"] = lerr.message;
        this.tellUser("error", lerr);
        this.ota_counter.upload_errors.push(upload_error);
      }
      this.ota_counter.saved_count++;
      this.ota_counter.saved_percent = this.ota_counter.saved_count / (Number(this.ota_counter.parsing_count) / 100);
    },
    async loadAccounts(translator) {
      try {
        let accounts = await this.$axios.$post("api/v1/accounts/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        translator.setEnumEx("aname", accounts);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadHsms(translator) {
      try {
        let hsms = await this.$axios.$post("api/v1/hsms/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        translator.setEnumEx("hsm_id", hsms, true);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadOrders(translator) {
      try {
        let orders = await this.$axios.$post("api/v1/orders/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });

        if (orders.length > 0) {
          this.ota_counter.items = orders;
          translator.setEnumEx("order_id", orders, true);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadUiccs(translator) {
      try {
        let uicc_name = await this.$axios.$post("api/v1/uiccs/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        translator.setEnumEx("uicc_id", uicc_name, true);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadProducts(translator) {
      try {
        let product = await this.$axios.$post("api/v1/products/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        translator.setEnumEx("product_id", product, true);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadImeis(translator) {
      try {
        let imei_name = await this.$axios.$post("api/v1/imeis/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        translator.setEnumEx("imeis", imei_name, true);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
  },
};
</script>
