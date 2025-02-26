<template>
  <div v-if="!card_record_error" class="flo-card">
    <v-card flat outlined class="ma-0 pa-0">
      <v-card-text class="ma-0 pa-0">
        <v-container fluid class="pa-0 ma-0">
          <v-row no-gutters>
            <v-col cols="12" class="ma-1 pa-1">
              <transition v-if="getSuspendBilling()" name="bounce" appear>
                <img src="../../static/suspended.png" alt="Suspended" width="300px" class="align-start" />
              </transition>
              <v-row no-gutters>
                <v-col cols="12" class="ma-1 pa-1">
                  <div class="headline text-capitalize">
                    Card: {{ card.record.iccid }} ({{ card.record.description }})
                    <v-chip v-if="getStateName().toLowerCase() === 'boot'" label color="warning">{{ getStateName() }}</v-chip>
                    <v-chip v-else-if="getStateName().toLowerCase() === 'active'" label color="success">{{ getStateName() }}</v-chip>
                    <v-chip v-else label color="info">{{ getStateName() }}</v-chip>
                    <v-chip label :color="getChangedColor()">{{ getOtaState() }}</v-chip>
                  </div>
                  <div v-bind:key="ulkey">
                    <blockquote v-if="card.record.last_mcc != ''" class="blockquote font-weight-light">
                      Last seen
                      <code>{{ getLastSeen() }}</code
                      >, visting
                      <router-link
                        :to="{
                          path: '/network/operators/',
                          query: {
                            mccmnc: `${card.record.last_mcc}${card.record.last_mnc}`,
                          },
                        }"
                      >
                        <code>{{ card.record.last_mcc }}{{ card.record.last_mnc }}</code> </router-link
                      >with subscription
                      <router-link
                        :to="{
                          path: '/resources/subscribers/',
                          query: { imsi: card.record.last_imsi },
                        }"
                      >
                        <code>{{ card.record.last_imsi }}</code> </router-link
                      >at location <code>{{ card.record.last_lac }}</code> connected to cell id
                      <code>{{ card.record.last_cellid }}</code>

                      {{ getInstalledApnsText() == "" ? "" : " delivered APNs " }}
                      <code v-if="getInstalledApnsText() != ''">{{ getInstalledApnsText() }}</code>
                      {{ card.record.package == "" ? "" : " using package " }}
                      <code v-if="card.record.package != ''">{{ card.record.package }}</code>
                    </blockquote>
                    <blockquote v-else class="blockquote subtitle-1">Card was never used.</blockquote>
                  </div>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12">
              <v-container fluid class="pa-0 ma-0">
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-container fluid class="ma-0 pa-0">
                      <v-row no-gutters>
                        <v-col cols="12" class="pa-1">
                          <flo-expand title="Details" elevation="5" @expand="onExpandDetails()">
                            <template v-slot:content="{}">
                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <flo-expand title="Identity" elevation="5" :loading="identity_loader" @expand="onExpandIdentity()">
                                    <template v-slot:content="{}">
                                      <v-container v-if="!identity_loader" fluid class="ma-0 pa-0">
                                        <v-row no-gutters>
                                          <v-col v-for="(identity, i) in getIdentity()" cols="12" lg="3" xl="3" class="pa-1" :key="i">
                                            <flo-meta-field-view :translator="translator" :header="identity" :value="identity.data" />
                                          </v-col>
                                        </v-row>
                                      </v-container>
                                    </template>
                                  </flo-expand>
                                </v-col>
                              </v-row>

                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <flo-expand title="Links" elevation="5" :loading="links_loader" @expand="onExpandLinks()">
                                    <template v-slot:content="{}">
                                      <v-container v-if="!links_loader" fluid class="ma-0 pa-0">
                                        <v-row no-gutters>
                                          <v-col v-for="(link, i) in getLinks()" cols="12" lg="3" xl="3" class="pa-1" :key="i">
                                            <flo-meta-field-view :translator="translator" :header="link" :value="link.data" />
                                          </v-col>
                                        </v-row>
                                      </v-container>
                                    </template>
                                  </flo-expand>
                                </v-col>
                              </v-row>

                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <flo-expand title="Locations" elevation="5" :loading="location_loader" @expand="onExpandLocation()">
                                    <template v-slot:content="{}">
                                      <v-container v-if="!location_loader" fluid class="ma-0 pa-0">
                                        <v-row no-gutters>
                                          <v-col v-for="(location, i) in getLocations()" cols="12" lg="3" xl="3" class="pa-1" :key="i">
                                            <flo-meta-field-view :translator="translator" :header="location" :value="location.data" />
                                          </v-col>
                                        </v-row>
                                      </v-container>
                                    </template>
                                  </flo-expand>
                                </v-col>
                              </v-row>

                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <flo-expand title="Services" elevation="5" :loading="services_loader" @expand="onExpandServices()">
                                    <template v-slot:content="{}">
                                      <v-container v-if="!services_loader" fluid class="ma-0 pa-0">
                                        <v-row no-gutters>
                                          <v-col v-for="(service, i) in getServices()" cols="12" lg="3" xl="3" class="pa-1" :key="i">
                                            <flo-meta-field-view :translator="translator" :header="service" :value="service.data" />
                                          </v-col>
                                        </v-row>
                                      </v-container>
                                    </template>
                                  </flo-expand>
                                </v-col>
                              </v-row>

                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <flo-expand title="OTA" elevation="5" :loading="ota_loader" @expand="onExpandOta()">
                                    <template v-slot:content="{}">
                                      <v-container v-if="!ota_loader" fluid class="ma-0 pa-0">
                                        <v-row no-gutters>
                                          <template v-for="(ota, i) in getOta()">
                                            <v-col cols="12" :lg="ota.value == 'ota_counter' ? '2' : '3'" :xl="ota.value == 'ota_counter' ? '2' : '3'" class="pa-1" :key="i">
                                              <flo-meta-field-view :translator="translator" :header="ota" :value="ota.data" />
                                            </v-col>
                                            <v-col cols="12" lg="1" xl="1" v-if="ota.value == 'ota_counter'" :key="`${i}-a`" class="mt-4">
                                              <v-btn x-large icon @click="ota_counter_dialog = true">
                                                <v-icon>mdi-counter</v-icon>
                                              </v-btn>
                                            </v-col>
                                          </template>
                                        </v-row>
                                      </v-container>
                                    </template>
                                  </flo-expand>
                                </v-col>
                              </v-row>

                              <v-row no-gutters>
                                <v-col cols="12" class="pa-1">
                                  <v-dialog :overlay-opacity="0.4" persistent v-model="upload_key_store_dialog" max-width="600px">
                                    <v-card>
                                      <v-card-title>
                                        <span class="headline">Upload Key Store</span>
                                      </v-card-title>

                                      <v-card-text>
                                        <v-container fluid class="ma-0 pa-0">
                                          <v-row no-gutters>
                                            <v-col cols="12">
                                              <blockquote class="blockquote">
                                                Note: File type is JSON with the following parameters:
                                                <code>"name", "state", "keyset", "key id", "revision", "algorithm", "size"</code>
                                              </blockquote>
                                            </v-col>
                                          </v-row>
                                          <v-row no-gutters>
                                            <v-col cols="12">
                                              <v-file-input accept=".json" label="Select File" :clearable="false" :error="upload_ks_error" :error-messages="upload_ks_error_message" @change="importKeyStoreChanged($event)" :truncate-length="$vuetify.breakpoint.xs ? 25 : 50" outlined dense></v-file-input>
                                            </v-col>
                                          </v-row>
                                        </v-container>
                                      </v-card-text>

                                      <v-card-actions>
                                        <div class="flex-grow-1"></div>
                                        <v-btn color="primary" text @click="closeKeyStore()">Cancel</v-btn>
                                        <v-btn color="primary" text :disabled="upload_ks_disabled" @click="uploadKeyStore()">Upload</v-btn>
                                      </v-card-actions>
                                    </v-card>
                                  </v-dialog>
                                  <flo-expand title="Keystore" elevation="5">
                                    <template v-slot:content="{}">
                                      <v-container fluid class="ma-0 pa-0">
                                        <v-row no-gutters>
                                          <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
                                            <v-switch v-model="unlock_keystore" class="subheading font-weight-light" color="success" label="Unlock Keystore" hint="Unlock the card keystore for editing." dense persistent-hint></v-switch>
                                          </v-col>
                                        </v-row>
                                        <v-row no-gutters>
                                          <v-col cols="12" class="pa-1">
                                            <flo-meta-table v-if="translator != null" :disabledEdit="unlockedKeystore()" :disableNew="unlockedKeystore()" @query="onQuery($event)" @load-data="onLoadCardKeyData($event)" @pre-edit="onPreEdit($event)" @pre-new="onPreNew($event)" :key="key_store_version" :title="title" :show_title="false" :groupBy="['keyset']" :show_filter="true" :show_search="true" resources="card_key_store" :hidden_filter="hidden_filter" :translator="translator">
                                              <template v-slot:ex_new="{ fab, color, permissions, smAndDown }">
                                                <template v-if="permissions.c == true">
                                                  <v-btn v-if="!unlockedKeystore()" @click="setKeysetForDeletion(0, true)" :fab="fab" :small="smAndDown" class="mx-1" :color="color">
                                                    <v-icon :left="!smAndDown">mdi-delete-clock</v-icon>
                                                    {{ !smAndDown ? "Card Keyset History" : "" }}
                                                  </v-btn>
                                                  <v-btn v-if="!unlockedKeystore()" :fab="fab" :small="smAndDown" class="mx-1" :color="color" @click="upload_key_store_dialog = true">
                                                    <v-icon :left="!smAndDown">mdi-file-import</v-icon>
                                                    {{ !smAndDown ? "Import" : "" }}
                                                  </v-btn>
                                                  <v-btn v-if="!unlockedKeystore()" :fab="fab" :small="smAndDown" class="mx-1" :color="color" @click="exportKeyStoreFile()"
                                                    ><v-icon :left="!smAndDown">mdi-file-export</v-icon>
                                                    {{ !smAndDown ? "Export" : "" }}
                                                  </v-btn>
                                                </template>
                                              </template>

                                              <template v-slot:group_summary="{ group }">
                                                <td v-if="!unlockedKeystore()" :colspan="group.headers.length" class="text-start">
                                                  <v-container fluid class="ma-0 pa-0">
                                                    <v-row no-gutters align="end" justify="end">
                                                      <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'">
                                                        <v-btn color="primary" @click="setKeysetForDeletion(group.group)">
                                                          <v-icon left>mdi-delete</v-icon>
                                                          keyset
                                                        </v-btn>
                                                        <v-btn color="primary" @click="setKeysetForDeletion(group.group, true)">
                                                          <v-icon left>mdi-delete-clock</v-icon>
                                                          keyset history
                                                        </v-btn>
                                                      </v-col>
                                                    </v-row>
                                                  </v-container>
                                                </td>
                                              </template>
                                              <template v-slot:view_state="{ fmtrow }">
                                                <v-chip v-if="fmtrow.state" label :color="getKeyStoreStateColor(fmtrow.state)">{{ fmtrow.state }}</v-chip>
                                              </template>
                                              <template v-slot:view_alg="{ fmtrow }">
                                                <v-chip v-if="fmtrow.alg" label :color="fmtrow.scp == '80' ? 'secondary' : 'accent'">{{ fmtrow.alg }}</v-chip>
                                              </template>
                                              <template v-slot:view_keyset="{ fmtrow }">
                                                <v-chip v-if="fmtrow.scp" label :color="fmtrow.scp == '80' ? 'secondary' : 'accent'">{{ fmtrow.keyset }}</v-chip>
                                              </template>
                                              <template v-slot:view_scp="{ fmtrow }">
                                                <v-chip v-if="fmtrow.scp" label :color="fmtrow.scp == '80' ? 'secondary' : 'accent'">{{ fmtrow.scp }}</v-chip>
                                              </template>

                                              <template v-slot:view_keyid="{ fmtrow }">
                                                <v-chip v-if="fmtrow.keyid" label :color="fmtrow.scp == '80' ? 'secondary' : 'accent'">{{ fmtrow.keyid }} - {{ fmtrow.key_type }}</v-chip>
                                              </template>

                                              <template v-slot:view_name="{ fmtrow }">
                                                <template v-if="'' == fmtrow.name">
                                                  {{ fmtrow.name }}
                                                </template>

                                                <template v-else-if="'unknown' == fmtrow.name">
                                                  <v-container fluid class="ma-0 pa-0">
                                                    <v-row no-gutters align="center" justify="center">
                                                      <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'">
                                                        <v-chip label color="warning" class="text-capitalize">
                                                          <v-icon left>mdi-alert-octagon-outline</v-icon>
                                                          {{ fmtrow.name }}</v-chip
                                                        >
                                                      </v-col>
                                                    </v-row>
                                                  </v-container>
                                                </template>

                                                <flo-field-label v-else :value="fmtrow.name">
                                                  <template v-slot:value="{ value }">
                                                    <v-form autocomplete="off">
                                                      <v-text-field single-line outlined readonly dense class="font-weight-light primary--text ma-0 pa-0 mx-1" :append-icon="card_keys_pass ? 'mdi-eye' : 'mdi-eye-off'" autocomplete="off" @click:append="card_keys_pass = !card_keys_pass" :type="card_keys_pass ? 'text' : 'password'" :value="value" hide-details></v-text-field>
                                                    </v-form>
                                                  </template>
                                                </flo-field-label>
                                              </template>
                                            </flo-meta-table>
                                          </v-col>
                                        </v-row>
                                      </v-container>
                                    </template>
                                  </flo-expand>
                                </v-col>
                              </v-row>
                            </template>
                          </flo-expand>
                        </v-col>
                      </v-row>

                      <v-row no-gutters v-if="!card.loading">
                        <v-col cols="12" class="pa-1">
                          <flo-expand title="Card Editing" elevation="5" @expand="onExpandCardEditing()" :loading="scp_loading">
                            <template v-slot:title="{ title }">
                              <span class="title font-weight-regular mx-2">{{ title }} {{ card.record.ota_user ? `(User: ${card.record.ota_user})` : "" }}</span>
                            </template>
                            <template v-slot:content="{}">
                              <flo-card-edit :resource_data="resource_data" :resource="card" :spi="card.record.spi" :kic_algo="card.record.kic_algo" :kid_algo="card.record.kid_algo" :push_spi="card.record.push_spi" :keysets80="getScpActiveKeysets('80')" :keysets81="getScpActiveKeysets('81')" :keyset80="card.record.keyset_scp80" :keyset81="card.record.keyset_scp81" :bip_bindings="bip_bindings" :is_multi_imsi="isMultiImsi()" :card_applets="applets.records ? applets.records[0].id : ''" @update_failed="onOtaUpdateFailure($event)" @update_success="onOtaUpdateSuccess($event)" @sync="onSyncChange($event)" @scp_loading="onScpLoading($event)" />
                            </template>
                          </flo-expand>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12" class="pa-1">
                          <flo-card-sms @message="onMessage($event)" @apn="onApn($event)" :error="sms_status" :iccid="card.record.iccid"></flo-card-sms>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-col>
                </v-row>

                <!-- <v-row v-if="!isMultiImsi() && keys.records.length > 0" no-gutters>
                  <v-col cols="12" class="pa-1">
                    <flo-expand title="Keys" elevation="0">
                      <template v-slot:title="{ title }">
                        <span class="title font-weight-regular mx-2">{{ title }}</span>
                        <template v-if="getCardChangeCount('keys') > 0">
                          <v-chip class="ma-1" outlined :color="`${getChangedColor()}`">
                            <v-avatar left>
                              <v-icon>mdi-sim</v-icon>
                            </v-avatar>
                            {{ getCardChangeCount("keys") }}
                          </v-chip>
                        </template>
                      </template>

                      <template v-slot:content="{}">
                        <div v-if="keys.loading == false" :key="`key-${keysVersion}`">
                          <v-data-table :headers="keys.headers" :items="keys.records" sort-by="id" calculate-widths :footer-props="{ 'items-per-page-options': [10, 20, 30, 40, 50] }" :items-per-page="30" class="resourcetable elevation-0" :search="keys.lookup" dense show-expand :expanded.sync="keys.expanded">
                            <template v-slot:top>
                              <v-row no-gutters
                                ><v-col cols="1" class="mx-3 my-0">
                                  <v-tooltip right>
                                    <template v-slot:activator="{ on }">
                                      <div v-on="on">
                                        <v-switch v-model="show_unused_keys" class="ma-0 pa-0 subheading font-weight-light" dense color="success" hide-details label="Unused"></v-switch>
                                      </div>
                                    </template>
                                    <span>Show unused keys</span>
                                  </v-tooltip>
                                </v-col></v-row
                              >
                            </template>
                            <template v-slot:item="row">
                              <template v-if="show_unused_keys || isKiOpcUsed(row.item.ki, row.item.opc)">
                                <template v-if="$vuetify.breakpoint.smAndUp">
                                  <tr>
                                    <td v-for="header in row.headers" :key="`rkey-${row.index}-${header.value}`" :class="`text-${typeof header.align === 'undefined' ? 'center' : header.align}`">
                                      <template v-if="header.value == 'data-table-expand'">
                                        <template v-if="getCardChange('keys', row.item.idx) !== null">
                                          <v-icon :color="`${getChangedColor()}`">mdi-sim</v-icon>
                                        </template>
                                      </template>

                                      <template v-else-if="header.value == 'action'">
                                        <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                                          <div class="flex-grow-1"></div>

                                          <v-btn :disabled="row.item.idx <= getBootMark()" class="ma-2" color="primary" @click="editKeysItem(row.item)">
                                            <v-icon left>{{ canEditCardKeys() ? "mdi-pencil" : "mdi-more" }}</v-icon
                                            >{{ canEditCardKeys() ? "Edit" : "View" }}
                                          </v-btn>

                                          <v-tooltip right>
                                            <template v-slot:activator="{ on }">
                                              <v-btn v-if="keys.permissions.u == true" :disabled="!canEditCardKeys() || row.item.idx <= getBootMark()" color="primary" @click="resetKeysItem(row.item)" v-on="on">
                                                <v-icon center>mdi-broom</v-icon>
                                              </v-btn>
                                            </template>
                                            <span>Reset</span>
                                          </v-tooltip>
                                        </v-container>
                                      </template>
                                      <template v-else-if="header.value == 'idx'">
                                        <v-badge v-if="row.item.idx <= getBootMark()" color="warning" overlap class="align-self-center">
                                          <template v-slot:badge>
                                            <span>Boot</span>
                                          </template>

                                          <v-chip v-if="row.item.idx == getLastKey()" class="ma-2" color="info">{{ row.item.idx }}</v-chip>
                                          <v-chip v-else class="ma-2">{{ row.item.idx }}</v-chip>
                                        </v-badge>
                                        <template v-else>
                                          <v-chip v-if="row.item.idx == getLastKey()" class="ma-2" color="info">{{ row.item.idx }}</v-chip>
                                          <v-chip v-else class="ma-2">{{ row.item.idx }}</v-chip>
                                        </template>
                                      </template>
                                      <template v-else-if="header.value == 'ki'">{{ getKiOpcMask(row.item.ki) }}</template>
                                      <template v-else-if="header.value == 'opc'">{{ getKiOpcMask(row.item.opc) }}</template>
                                      <template v-else>
                                        <span>{{ row.item[header.value] }}</span>
                                      </template>
                                    </td>
                                  </tr>
                                  <tr v-if="getCardChange('keys', row.item.idx) !== null" :style="`background-color: ${$vuetify.theme.currentTheme[getChangedColor()]}19;`">
                                    <td v-for="header in row.headers" :key="`rkey-${row.index}-${header.value}`" :class="`text-${typeof header.align === 'undefined' ? 'center' : header.align}`">
                                      <template v-if="header.value == 'data-table-expand'"></template>

                                      <template v-else-if="header.value == 'action'">
                                        <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                                          <div class="flex-grow-1"></div>
                                          <v-btn :disabled="!canEditCardKeys()" color="primary" class="my-2" @click="removeCardChange('keys', row.item.idx)">
                                            <v-icon>mdi-delete</v-icon>
                                          </v-btn>
                                        </v-container>
                                      </template>

                                      <template v-else-if="header.value == 'idx'">
                                        <template v-if="getCardChange('keys', row.item.idx) !== null">
                                          <v-icon :color="`${getChangedColor()}`">mdi-lan-pending</v-icon>
                                        </template>
                                      </template>

                                      <template v-else>
                                        <template v-if="getCardChange('keys', row.item.idx)[header.value] != row.item[header.value]">
                                          <template v-if="header.value == 'ki' || header.value == 'opc'">
                                            <span class="font-italic font-weight-bold">{{ getKiOpcMask(getCardChange("keys", row.item.idx)[header.value]) }}</span>
                                          </template>
                                        </template>

                                        <template v-else>
                                          <template v-if="header.value == 'ki' || header.value == 'opc'">
                                            <span>{{ getKiOpcMask(getCardChange("keys", row.item.idx)[header.value]) }}</span>
                                          </template>
                                        </template>
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

                                          <v-chip v-if="row.item.idx == getLastKey()" class="ma-2" color="primary">{{ row.item.idx }}</v-chip>
                                          <v-chip v-else class="ma-2">{{ row.item.idx }}</v-chip>
                                        </v-badge>
                                        <template v-else>
                                          <v-chip v-if="row.item.idx == getLastKey()" class="ma-2" color="info">{{ row.item.idx }}</v-chip>
                                          <v-chip v-else class="ma-2">{{ row.item.idx }}</v-chip>
                                        </template>
                                        <template v-if="getCardChange('keys', row.item.idx) !== null">
                                          <v-icon class="px-2" :color="`${getChangedColor()}`">mdi-lan-pending</v-icon>
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
                                                    <v-btn :disabled="row.item.idx <= getBootMark()" class="ma-2" color="primary" fab small @click="editKeysItem(row.item)">
                                                      <v-icon>{{ canEditCardKeys() ? "mdi-pencil" : "mdi-more" }}</v-icon>
                                                    </v-btn>

                                                    <v-btn v-if="keys.permissions.u == true" :disabled="!canEditCardKeys() || row.item.idx <= getBootMark()" color="primary" @click="resetKeysItem(row.item)" fab small class="ma-2">
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

                                                    <v-chip v-if="row.item.idx == getLastKey()" class="ma-2" color="info">{{ row.item.idx }}</v-chip>
                                                    <v-chip v-else class="ma-2">{{ row.item.idx }}</v-chip>
                                                  </v-badge>
                                                  <template v-else>
                                                    <v-chip v-if="row.item.idx == getLastKey()" class="ma-2" color="info">{{ row.item.idx }}</v-chip>
                                                    <v-chip v-else class="ma-2">{{ row.item.idx }}</v-chip>
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

                                              <template v-if="getCardChange('keys', row.item.idx) !== null">
                                                <template v-if="getCardChange('keys', row.item.idx)[header.value] != row.item[header.value]">
                                                  <v-list-item :key="`rkey-${row.index}-${header.value}`">
                                                    <v-list-item-content class="ma-0 pa-0">
                                                      <v-list-item-subtitle>
                                                        <v-icon class="px-2" :color="`${getChangedColor()}`">mdi-lan-pending</v-icon>
                                                      </v-list-item-subtitle>
                                                    </v-list-item-content>
                                                    <v-list-item-action>
                                                      <span class="font-italic font-weight-bold">{{ getKiOpcMask(getCardChange("keys", row.item.idx)[header.value]) }}</span>
                                                    </v-list-item-action>
                                                  </v-list-item>
                                                </template>
                                              </template>
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

                <v-row v-if="!isMultiImsi() && settings.records.length > 0" no-gutters>
                  <v-col cols="12" class="pa-1">
                    <flo-expand title="Settings" elevation="5">
                      <template v-slot:title="{ title }">
                        <span class="title font-weight-regular mx-2">{{ title }}</span>
                        <template v-if="getCardChangeCount('settings') > 0">
                          <v-chip class="ma-1" outlined :color="`${getChangedColor()}`">
                            <v-avatar left>
                              <v-icon>mdi-sim</v-icon>
                            </v-avatar>
                            {{ getCardChangeCount("settings") }}
                          </v-chip>
                        </template>
                      </template>
                      <template v-slot:content="{}">
                        <div v-if="settings.loading == false" :key="`set-${settingsVersion}`">
                          <v-data-table :headers="settings.headers" :items="settings.records" sort-by="name" calculate-widths :footer-props="{ 'items-per-page-options': [10, 20, 30, 40, 50] }" :items-per-page="30" class="resourcetable elevation-0" :search="settings.lookup" dense show-expand :expanded.sync="settings.expanded">
                            <template v-slot:top>
                              <v-toolbar flat dense>
                                <v-text-field v-model="settings.lookup" append-icon="mdi-magnify" label="Lookup" single-line hide-details></v-text-field>
                                <v-toolbar-title></v-toolbar-title>

                                <v-divider class="mx-4" inset vertical></v-divider>
                                <div class="flex-grow-1"></div>
                                <v-dialog :overlay-opacity="0.4" v-model="settings.dialog" max-width="800px">
                                  <template v-if="settings.permissions.c == true" v-slot:activator="{ on }">
                                    <v-btn color="primary" dark class="mb-2" v-on="on">New Setting</v-btn>
                                  </template>
                                  <v-card>
                                    <v-card-title class="ma-1 pa-1 px-2 font-weight-regular">
                                      <span class="headline">{{ formSettingsTitle }}</span>
                                    </v-card-title>

                                    <v-card-text>
                                      <v-container>
                                        <v-row>
                                          <template v-for="(header, i) in settings.headers">
                                            <v-col v-if="header.value != 'action'" cols="12" lg="6" :key="'ht' + i">
                                              <v-text-field v-if="header.value == 'id'" disabled v-model="settings.editedItem[header.value]" :label="header.text"></v-text-field>
                                              <v-text-field v-else-if="header.value == 'name'" disabled v-model="settings.editedItem[header.value]" :label="header.text"></v-text-field>
                                              <v-select v-else-if="header.value == 'store'" disabled v-model="settings.editedItem[header.value]" :items="['card', 'server']" required :label="header.text" filled></v-select>
                                              <v-select v-else-if="header.value == 'type'" disabled v-model="settings.editedItem[header.value]" :items="['number', 'string']" required :label="header.text" filled></v-select>
                                              <v-text-field v-else-if="header.value == 'description'" disabled v-model="settings.editedItem[header.value]" :label="header.text"></v-text-field>
                                              <v-text-field v-else-if="header.value == 'ts'" disabled v-model="settings.editedItem[header.value]" :label="header.text"></v-text-field>
                                              <v-text-field v-else :disabled="!canEditCardSettings(settings.editedItem)" v-model="settings.editedItem[header.value]" :label="header.text"></v-text-field>
                                            </v-col>
                                          </template>
                                        </v-row>
                                      </v-container>
                                    </v-card-text>

                                    <v-card-actions>
                                      <div class="flex-grow-1"></div>
                                      <v-btn color="primary" text @click="closeSettings">Cancel</v-btn>
                                      <v-btn color="primary" text @click="setSettings" :disabled="!canEditCardSettings(settings.editedItem)">Set</v-btn>
                                    </v-card-actions>
                                  </v-card>
                                </v-dialog>
                              </v-toolbar>
                            </template>

                            <template v-slot:item="row">
                              <template v-if="$vuetify.breakpoint.smAndUp">
                                <tr>
                                  <td v-for="header in row.headers" :key="`rset-${row.index}-${header.value}`" :class="`text-${typeof header.align === 'undefined' ? 'center' : header.align}`">
                                    <template v-if="header.value == 'data-table-expand'">
                                      <template v-if="getCardChange('settings', row.item.name) !== null">
                                        <v-icon :color="`${getChangedColor()}`">mdi-sim</v-icon>
                                      </template>
                                    </template>

                                    <template v-else-if="header.value == 'action'">
                                      <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                                        <div class="flex-grow-1"></div>
                                        <v-btn class="ma-2" color="primary" @click="editSettingsItem(row.item)">
                                          <v-icon left>{{ canEditCardSettings(row.item) ? "mdi-pencil" : "mdi-more" }}</v-icon
                                          >{{ canEditCardSettings(row.item) ? "Edit" : "View" }}
                                        </v-btn>
                                      </v-container>
                                    </template>

                                    <template v-else-if="header.value == 'name'">{{ row.item[header.value].replace(/_/g, " ") }}</template>
                                    <template v-else>
                                      <span>{{ row.item[header.value] }}</span>
                                    </template>
                                  </td>
                                </tr>
                                <tr v-if="getCardChange('settings', row.item.name) !== null" :style="`background-color: ${$vuetify.theme.currentTheme[getChangedColor()]}19;`">
                                  <td v-for="header in row.headers" :key="`rset-${row.index}-${header.value}`" :class="`text-${typeof header.align === 'undefined' ? 'center' : header.align}`">
                                    <template v-if="header.value == 'data-table-expand'"></template>

                                    <template v-else-if="header.value == 'action'">
                                      <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                                        <div class="flex-grow-1"></div>
                                        <v-btn :disabled="!canEditCardSettings(row.item)" color="primary" class="ma-2" @click="removeCardChange('settings', row.item.name)">
                                          <v-icon>mdi-delete</v-icon>
                                        </v-btn>
                                      </v-container>
                                    </template>
                                    <template v-else-if="header.value == 'name'">
                                      <v-icon class="px-2" :color="`${getChangedColor()}`">mdi-lan-pending</v-icon>
                                    </template>
                                    <template v-else>
                                      <template v-if="getCardChange('settings', row.item.name)[header.value] != row.item[header.value]">
                                        <template>
                                          <span class="font-italic font-weight-bold">{{ getCardChange("settings", row.item.name)[header.value] }}</span>
                                        </template>
                                      </template>

                                      <template v-else>
                                        <template>
                                          <span>{{ getCardChange("settings", row.item.name)[header.value] }}</span>
                                        </template>
                                      </template>
                                    </template>
                                  </td>
                                </tr>
                              </template>
                              <template v-else>
                                <v-container class="ma-0 pa-1">
                                  <flo-expand elevation="0" :color="$vuetify.theme.dark ? (row.index % 2 == 0 ? '#FFFFFF0D' : '#00000000') : row.index % 2 == 0 ? '#0000000D' : '#00000000'">
                                    <template v-slot:title>
                                      <v-chip label class="ma-2">{{ row.item.name.replace(/_/g, " ") }}</v-chip>

                                      <template v-if="getCardChange('settings', row.item.name) !== null">
                                        <v-icon class="px-2" :color="`${getChangedColor()}`">mdi-lan-pending</v-icon>
                                      </template>
                                    </template>

                                    <template v-slot:content>
                                      <v-list color="#00000000" class="ma-0 pa-0">
                                        <template v-for="header in row.headers">
                                          <template v-if="header.value == 'data-table-expand'"></template>
                                          <template v-else-if="header.value == 'action'">
                                            <v-list-item :key="`rset-${row.index}-${header.value}`">
                                              <v-list-item-content class="ma-0 pa-0">
                                                <v-list-item-title> {{ header.text }}</v-list-item-title>
                                              </v-list-item-content>
                                              <v-list-item-action>
                                                <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                                                  <v-btn fab small color="primary" @click="editSettingsItem(row.item)">
                                                    <v-icon>{{ canEditCardSettings(row.item) ? "mdi-pencil" : "mdi-more" }}</v-icon>
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
                                                <span v-else>{{ row.item[header.value] }}</span>
                                              </v-list-item-action>
                                            </v-list-item>

                                            <template v-if="getCardChange('settings', row.item.name) !== null">
                                              <template v-if="getCardChange('settings', row.item.name)[header.value] != row.item[header.value]">
                                                <v-list-item :key="`rset-${row.index}-${header.value}`">
                                                  <v-list-item-content class="ma-0 pa-0">
                                                    <v-list-item-subtitle>
                                                      <v-icon class="px-2" :color="`${getChangedColor()}`">mdi-lan-pending</v-icon>
                                                    </v-list-item-subtitle>
                                                  </v-list-item-content>
                                                  <v-list-item-action>
                                                    <span class="font-italic font-weight-bold">{{ getCardChange("settings", row.item.name)[header.value] }}</span>
                                                  </v-list-item-action>
                                                </v-list-item>
                                              </template>
                                            </template>
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
                </v-row> -->
              </v-container>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <v-textarea name="notes" label="Notes:" hide-details clearable outlined no-resize rows="5" :value="getNotes()" @change="setNotes($event)"></v-textarea>
            </v-col>
            <v-col cols="12" class="pa-1" align="end">
              <v-btn color="primary" @click="saveNotes()"> Save Notes </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
    <v-dialog :overlay-opacity="0.4" v-model="active.dialog" max-width="500px">
      <v-card>
        <v-card-title class="ma-1 pa-1 px-2 font-weight-regular">
          <span class="headline">Manually select active profile</span>
        </v-card-title>

        <v-card-text>
          <v-layout>
            <v-row>
              <v-col cols="12">
                <v-select v-model="active.imsi" :items="active.imsis" :label="'IMSI'" persistent-hint hint="Please select an IMSI from the list"></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="active.mcc" :label="'MCC'" persistent-hint hint="Please set the MCC - Mobile country code"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="active.mnc" :label="'MNC'" persistent-hint hint="Please set the MNC - Mobile network code"></v-text-field>
              </v-col>
            </v-row>
          </v-layout>
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="closeActive">Cancel</v-btn>
          <v-btn color="primary" text @click="setActive">Set</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog :overlay-opacity="0.4" v-model="allocate.dialog" scrollable persistent max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">Add Subscriber</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="allocate.name" :label="'Name'"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-combobox v-model="allocate.sub_idx" :label="'Profile'" required :items="allocate.sub_idxs" filled />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-combobox v-model="allocate.key_idx" :label="'Key'" required :items="allocate.key_idxs" filled />
              </v-col>
              <v-col cols="12">
                <flo-meta-table resources="subscribers" sort-by="imsi" :dense="true" :title="title" @load-data="onLoadData($event)">
                  <template v-slot:view_state="{ fmtrow }">
                    <v-chip v-if="fmtrow.state == 'available'" label class="ma-2" color="success">{{ fmtrow.state }}</v-chip>
                    <v-chip v-else label class="ma-2" color="info">{{ fmtrow.state }}</v-chip>
                  </template>

                  <template v-slot:view_select="{ fmtrow }">
                    <v-checkbox :value="fmtrow.id === allocate.selected.id ? true : false" @change="allocateItemSelected(fmtrow)"></v-checkbox>
                  </template>
                </flo-meta-table>
              </v-col>

              <v-col cols="12" sm="6" md="6">
                <v-text-field v-model="allocate.plmn" :label="'PLMN'"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field v-model="allocate.apn" :label="'APN'"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="closeAllocate">Cancel</v-btn>
          <v-btn color="primary" :disabled="!allocateIsImsiSelected()" text @click="saveAllocate">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog :overlay-opacity="0.4" v-model="keys.dialog" scrollable persistent max-width="800px">
      <template v-if="keys.permissions.c == true" v-slot:activator="{ on }">
        <v-btn color="primary" dark class="mb-2" v-on="on">New {{ keys.resource }}</v-btn>
      </template>
      <v-card class="ma-0 pa-0">
        <v-card-title>
          <span class="headline">{{ formKeysTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container fluid class="ma-0 pa-0">
            <v-row no-gutters>
              <template v-for="(header, i) in keys.headers">
                <v-col v-if="header.value != 'action'" cols="12" class="pa-1" :key="'hk' + i">
                  <v-text-field v-if="header.value == 'id'" disabled v-model="keys.editedItem[header.value]" :label="header.text"></v-text-field>
                  <v-text-field v-else-if="header.value == 'idx'" disabled v-model="keys.editedItem[header.value]" :label="header.text"></v-text-field>
                  <v-text-field v-else-if="header.value == 'opc'" :rules="[rules.hex32]" v-model="keys.editedItem[header.value]" :label="header.text" :disabled="!canEditCardKeys()"></v-text-field>
                  <v-text-field v-else-if="header.value == 'ki'" :rules="[rules.hex32]" v-model="keys.editedItem[header.value]" :label="header.text" :disabled="!canEditCardKeys()"></v-text-field>

                  <v-text-field v-else-if="header.value == 'ts'" disabled v-model="keys.editedItem[header.value]" :label="header.text"></v-text-field>
                  <v-text-field v-else v-model="keys.editedItem[header.value]" :label="header.text"></v-text-field>
                </v-col>
              </template>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="closeKeys">Cancel</v-btn>
          <v-btn color="primary" text :disabled="!canEditCardKeys()" @click="setKeys">Set</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog :overlay-opacity="0.4" v-model="subs.dialog" scrollable persistent max-width="800px">
      <template v-if="subs.permissions.c == true" v-slot:activator="{ on }">
        <v-btn color="primary" dark class="mb-2" v-on="on">New {{ subs.resource }}</v-btn>
      </template>
      <v-card v-if="this.subs.dialog" class="ma-0 pa-0">
        <v-card-title>
          <span class="headline">{{ formSubsTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container fluid class="ma-0 pa-0">
            <v-row no-gutters>
              <template v-for="(header, i) in subs.headers">
                <v-col v-if="header.value != 'action'" cols="12" class="pa-1" :key="'hs' + i">
                  <v-text-field v-if="header.value == 'id'" disabled v-model="subs.editedItem[header.value]" :label="header.text"></v-text-field>
                  <template v-else-if="header.value == 'plmn'">
                    <v-text-field :rules="[rules.plmn]" v-model="subs.editedItem[header.value]" :label="header.text" :disabled="!canEditCardSubs()"></v-text-field>
                    <flo-expand title="ACT Calculator" class="my-2">
                      <template v-slot:content="{}">
                        <flo-plmn-act value="0000"></flo-plmn-act>
                      </template>
                    </flo-expand>
                  </template>
                  <v-text-field v-else-if="header.value == 'idx'" disabled v-model="subs.editedItem[header.value]" :label="header.text"></v-text-field>
                  <v-text-field v-else-if="header.value == 'ts'" disabled v-model="subs.editedItem[header.value]" :label="header.text"></v-text-field>
                  <v-combobox v-else-if="header.value == 'key_id'" v-model="subs.editedItem[header.value]" :label="header.text" required :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" filled :disabled="!canEditCardSubs()" />
                  <v-text-field v-else v-model="subs.editedItem[header.value]" :label="header.text" :disabled="!canEditCardSubs()"></v-text-field>
                </v-col>
              </template>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="closeSubs">Cancel</v-btn>
          <v-btn color="primary" text :disabled="!canEditCardSubs()" @click="setSubs">Set</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog :overlay-opacity="0.4" v-model="ota_counter_dialog" persistent max-width="500px">
      <v-card flat>
        <v-card-title>OTA Counter</v-card-title>
        <v-card-subtitle> Update the OTA Counter only if you know what you are doing! </v-card-subtitle>
        <v-card-text>
          <v-form v-model="valid_ota_counter">
            <v-container fluid class="ma-0 pa-0">
              <v-row no-gutters>
                <v-col cols="12" class="pa-1">
                  <v-text-field v-model="card_ota_counter" :rules="[rules.ota_counter]" label="Counter" hint="OTA Counter" autofocus persistent-hint></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="ota_counter_dialog = false">Cancel</v-btn>
          <v-btn color="primary" text :disabled="disabled" @click="updateCounter()">Update</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog :overlay-opacity="0.4" v-model="delete_keyset_dialog" persistent width="auto ">
      <v-card flat>
        <v-card-title>{{ keysetDialogTitle() }}</v-card-title>
        <v-card-text>
          <v-card flat outlined>
            <v-card-subtitle>Would you like to also delete the keyset from the HSM?</v-card-subtitle>
            <v-card-text>
              <v-row no-gutters>
                <v-col cols="12">
                  <v-switch v-model="hsm_keyset" :disabled="delete_keyset_loader" hint="Delete HSM Keys" label="Delete HSM Keys" color="success" inset persistent-hint></v-switch>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" :disabled="delete_keyset_loader" text @click="closeKeysetDialog()">Cancel</v-btn>
          <v-btn color="primary" :disabled="delete_keyset_loader" :loading="delete_keyset_loader" text @click="deleteKeyset()">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <error-resource v-else-if="card_record_error" resource="card" path="/resources/cards/"></error-resource>
</template>
<script>
import floCardEdit from "~/components/widgets/floCardEdit.vue";
import { mapGetters, mapActions } from "vuex";
import OTranslator from "~/src/otranslator.js";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
import errorResource from "~/components/error/error-resource.vue";
export default {
  head() {
    return {
      title: this.title,
    };
  },
  async fetch({ store }) {
    let lmcc = await store.dispatch("session/getFromCache", "/denum/mcc");
    if (lmcc == null) {
      console.log(`subscribers - fetch - lmcc - is null`);
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
  components: { floCardEdit, errorResource },
  data: () => ({
    title: "Card",
    card_keys_pass: false,
    pulling_in_progress: false,
    pull_timer_id: 0,
    valid_ota_counter: false,
    ota_counter_dialog: false,
    card_ota_counter: 0,
    card_record_error: false,
    helpers,
    translator: null,
    hidden_filter: [],
    changes_amount: 0,
    ota_stack_version: 1,
    inspect: false,
    ulkey: 1,
    bip_bindings: [],
    subscriber: null,
    subs_meta: [],
    act_calc_dialog: false,
    flush_subs: true,
    show_unused_keys: false,
    show_unused_subs: false,
    show_unused_settings: false,
    updateInProgress: false,
    scp_loading: false,
    keysVersion: 0,
    subsVersion: 0,
    settingsVersion: 0,
    actionVersion: 0,
    totalVersion: 0,
    key_store_version: 0,
    card_key_store: [],
    loading: true,
    identity_loader: false,
    links_loader: false,
    services_loader: false,
    ota_loader: false,
    location_loader: false,
    rules: {
      required: (value) => !!value || "Required.",
      ota_counter: (value) => {
        const pattern = /^[0-9]*$/;
        return pattern.test(value) || "Field accepts only numbers.";
      },
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

      mcc: (value) => {
        const pattern = /^[0-9A-Fa-f]{3}$/;
        return pattern.test(value) || "Invalid key format.";
      },
      hex32: (value) => {
        const pattern = /^[0-9A-F]{32}$/;
        return pattern.test(value) || "Invalid key format.";
      },
      plmn: (value) => {
        const pattern = /^$|^([0-9]{3}[0-9Ff]{1}[0-9]{1}[0-9Ff]{1}[0-9A-Fa-f]{4})(,([0-9]{3}[0-9Ff]{1}[0-9]{1}[0-9Ff]{1}[0-9A-Fa-f]{4}))*$/;
        return pattern.test(value) || "Invalid key format.";
      },

      dec1til10: (value) => {
        return (value > 0 && value <= 10) || "Invalid key format.";
      },
    },
    sms_status: { code: 0, msg: "Idle" },
    allocate: {
      dialog: false,
      headers: [],
      records: [],
      key_idx: 1,
      sub_idx: 1,
      key_idxs: [],
      sub_idxs: [],
      selected: {},
      name: "",
      apn: "",
      plmn: "",
    },
    card: {
      resource: "card",
      resources: "cards",
      default_ota_stack_type: "scp",
      state_version: 1,
      permissions: { c: 0, r: 0, u: 0, d: 0 },
      meta: [],
      headers: [],
      record: {
        iccid: "",
        state: 1,
        last_sid: 1,
        boot_mark: 0,
        last_seen: "",
        ota_user: "",
        ota_state: "idle",
        ota_command: {},
        ota_response: {},
        ota_stack: {},
        suspended: 0,
        suspended_billing: 0,
        attr: {},
      },
      user_ota_command: null,
    },
    actions: {},
    applets: {
      records: null,
    },
    card_applets: [],
    subs: {
      resource: "card_sub",
      resources: "card_subs",
      ssmode_items: [
        { key: 0, value: "Manual" },
        { key: 1, value: "Automatic" },
      ],
      permissions: { c: 0, r: 0, u: 0, d: 0 },
      expanded: [],
      lookup: "",
      dialog: false,
      meta: [],
      headers: [],
      records: [],
      editedIndex: -1,
      loading: true,
    },
    keys: {
      resource: "card_key",
      resources: "card_keys",
      permissions: { c: 0, r: 0, u: 0, d: 0 },
      expanded: [],
      lookup: "",
      dialog: false,
      meta: [],
      headers: [],
      records: [],
      editedIndex: -1,
      loading: true,
    },
    settings: {
      resource: "card_setting",
      resources: "card_settings",
      permissions: { c: 0, r: 0, u: 0, d: 0 },
      expanded: [],
      lookup: "",
      dialog: false,
      meta: [],
      headers: [],
      records: [],
      editedIndex: -1,
      loading: true,
    },
    active: {
      dialog: false,
      imsi: "",
      imsis: [],
      mccmnc: "",
    },
    keyset: 0,
    unlock_keystore: false,
    hsm_keyset: true,
    keyset_history: false,
    delete_keyset_dialog: false,
    delete_keyset_loader: false,
    upload_key_store_dialog: false,
    upload_ks_disabled: false,
    upload_ks_error: false,
    upload_ks_error_message: "",
    importKeyStoreFile: {},
    resource_data: {
      hlr_id: 0,
      hlr_name: "",
      hsm_id: 0,
      hsm_name: "",
      uicc_id: 0,
      uicc_name: "",
      smsc_id: 0,
      smsc_name: "",
      bip_id: 0,
      bip_name: "",
      billing_id: 0,
      billing_name: "",
      order_id: 0,
      order_name: "",
      product_id: 0,
      product_name: "",
    },
    key_store_data: [],
  }),
  watch: {
    dialog(val) {
      val || this.close();
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
    disabled() {
      let lvalid = true;
      if (this.valid_ota_counter != false) {
        lvalid = false;
      }

      return lvalid;
    },
    ...mapGetters({
      permissions: "session/permissions",
    }),
  },
  mounted() {
    this.pull_timer_id = setInterval(() => {
      this.pull_api_data(false);
    }, 5000);
  },
  async created() {
    await this.initialize();
  },
  beforeDestroy() {
    if (0 != this.pull_timer_id) {
      clearInterval(this.pull_timer_id);
      this.pull_timer_id = 0;
    }
  },
  mixins: [tellUser, parseNetError],
  methods: {
    ...mapActions({
      addToResourceCache: "session/addToResourceCache",
    }),
    onLoadData(data) {
      data.headers.unshift({
        text: "Select",
        align: "start",
        sortable: false,
        value: "select",
        selected: false,
        default: false,
        disable_edit: true,
        disable_new: true,
        view: true,
        edit: false,
      });

      for (const header of data.headers) {
        switch (header.value) {
          case "id":
          case "hlr_id":
          case "smsc_id":
          case "billing_id":
          case "msisdn":
          case "smsc":
          case "ki":
          case "opc":
          case "mnc_len":
          case "plmn":
          case "suspended":
          case "suspended_billing":
          case "attach":
          case "package":
          case "aid":
          case "aname":
          case "path":
          case "ts":
          case "action":
            {
              header.disable_edit = true;
              header.disable_new = true;
              header.view = false;
            }
            break;
        }
      }
    },
    onQuery(query) {
      query["orderby"] = { keyset: { o: "asc" }, state: { o: "asc" }, keyid: { o: "asc" } };
    },
    onLoadCardKeyData(data) {
      this.key_store_data = data.items;

      for (const header of data.headers) {
        switch (header.value) {
          case "size":
            {
              header.view = false;
            }
            break;
          case "key_type":
            {
              header.view = false;
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "id":
          case "ts":
          case "scp":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "iccid":
            {
              header.edit = false;
              header.view = false;
              header.disable_new = true;
            }
            break;
        }
      }
    },
    async initialize() {
      this.card.record.iccid = this.$route.query.iccid;
      console.log(`card - initialize - ICCID: ${this.card.record.iccid}`);
      await this.reloadData(["card", "applets", "settings", "keystore", "subscriber", "network", "links"]);

      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      translator.setEnum("alg", "scp_keystore_alg");
      let lcache = this.$store.getters["session/cache"];
      translator.setEnumEx("countries", lcache["/denum/mcc"].value);
      this.translator = translator;
      this.loading = false;
    },
    async onExpandIdentity() {
      this.identity_loader = true;
      if (!this.subscriber) {
        await this.reloadData(["subscriber"]);
      }
      this.identity_loader = false;
    },
    async onExpandLinks() {
      this.links_loader = true;
      await this.reloadData(["links"]);
      this.links_loader = false;
    },
    async onExpandServices() {
      this.services_loader = true;
      if (this.bip_bindings.length == 0) {
        await this.reloadData(["network"]);
      }
      this.services_loader = false;
    },
    async onExpandOta() {
      this.ota_loader = true;
      if (!this.card) {
        await this.reloadData(["card"]);
      }
      this.ota_loader = false;
    },
    async onExpandLocation() {
      this.location_loader = true;
      if (!this.subscriber) {
        await this.reloadData(["card", "subscriber"]);
      }
      this.location_loader = false;
    },
    async onExpandDetails() {
      if (!this.subscriber && this.bip_bindings.length == 0) {
        await this.reloadData(["subscriber", "network"]);
      }
    },
    async onExpandCardEditing() {
      this.scp_loading = true;
      if (!this.subscriber && this.bip_bindings.length == 0 && this.keys != false) {
        await this.reloadData(["subscriber", "network", "keys"]);
      }
    },
    async reloadData(dirty) {
      console.log(`card - reloadData - dirty: ${JSON.stringify(dirty)}`);

      for (let i = 0; i < dirty.length; i++) {
        const l_dirty = dirty[i];
        switch (l_dirty) {
          case "card":
            {
              await this.loadCard();
            }
            break;
          case "order":
            {
              await this.loadOrder();
            }
            break;
          case "product":
            {
              await this.loadProduct();
            }
            break;
          case "keystore":
            {
              await this.loadCardKeyStore();
            }
            break;
          case "applets":
            {
              await this.loadCardApplets();
              await this.loadApplets();
            }
            break;
          case "subscriber":
            {
              await this.loadCardSubscribers();
              await this.loadSubsMeta();
              await this.loadSubscriber();
            }
            break;
          case "keys":
            {
              await this.loadCardKeys();
            }
            break;
          case "settings":
            {
              await this.loadCardSettings();
            }
            break;
          case "links":
            {
              await this.loadUicc();
              await this.loadOrder();
              await this.loadProduct();
            }
            break;
          case "network":
            {
              await this.loadBipBindings();
              await this.loadSmsc();
              await this.loadBip();
              await this.loadHsm();

              let l_registrar = this.permissions.find((p) => "registrars" == p.res);
              if (l_registrar) {
                if (l_registrar.r == true) {
                  await this.loadHlr();
                }
              }

              let l_billing = this.permissions.find((p) => "billings" == p.res);
              if (l_billing) {
                if (l_billing.r == true) {
                  await this.loadBilling();
                }
              }
            }
            break;
        }
      }
    },
    async uploadKeyStore() {
      if (this.importKeyStoreFile.length > 0) {
        for (const vfile of this.importKeyStoreFile) {
          if (vfile.hasOwnProperty("id")) {
            delete vfile.id;
          }
          if (vfile.hasOwnProperty("ts")) {
            delete vfile.ts;
          }
          if (vfile.hasOwnProperty("scp")) {
            delete vfile.scp;
          }
          if (vfile.hasOwnProperty("key_type")) {
            delete vfile.key_type;
          }
          if (vfile.hasOwnProperty("iccid")) {
            vfile.iccid = this.card.record.iccid;
          } else {
            vfile["iccid"] = this.card.record.iccid;
          }
          try {
            let answer = await this.$axios.$post("/api/v1/card_key_store", vfile);
            if (answer != null) {
              this.tellUser("success", `File ID: ${answer.id}, File Name: ${answer.name} uploaded successfully.`);
            }
          } catch (err) {
            let lerr = this.parseNetError(err);
            this.tellUser("error", lerr);
          }
        }
        this.upload_key_store_dialog = false;
        this.key_store_version++;
      }
    },
    exportKeyStoreFile() {
      console.log(`card - exportKeyStoreFile - ${JSON.stringify(this.key_store_data)}`);
      if (this.key_store_data.length > 0) {
        let ldata = this.key_store_data;
        ldata.forEach((data) => {
          if (data.hasOwnProperty("scp")) {
            delete data.scp;
          }
          if (data.hasOwnProperty("key_type")) {
            delete data.key_type;
          }
          if (data.hasOwnProperty("state")) {
            data.state = data.state.toLowerCase();
          }
          if (data.hasOwnProperty("iccid")) {
            data.iccid = this.card.record.iccid;
          }
          if (data.hasOwnProperty("alg")) {
            data.alg = this.translator.toSrcByKey("alg", data.alg);
          }
        });
        let download = `${this.card.record.iccid}_key_store_files.json`;
        let blob = new Blob([JSON.stringify(ldata, null, 2)], { type: "text/json" });
        let url = URL.createObjectURL(blob);
        let link = document.createElement("a");
        link.href = url;
        link.download = download;
        link.click();
        link.remove();
        this.key_store_version++;
      }
    },
    importKeyStoreChanged(event) {
      helpers
        .readFileAsText(event)
        .then((content) => {
          this.importKeyStoreFile = JSON.parse(content);
          this.upload_ks_error = false;
          this.upload_ks_disabled = false;
          this.upload_ks_error_message = "";
        })
        .catch((err) => {
          let lerr = this.parseNetError(err);
          this.upload_ks_error = true;
          this.upload_ks_disabled = true;
          this.upload_ks_error_message = "Field accepts only JSON files.";
          this.tellUser("error", lerr);
        });
    },
    closeKeyStore() {
      this.upload_key_store_dialog = false;
      this.upload_ks_error = false;
      this.upload_ks_error_message = "";
    },
    getNotes() {
      let lattr = this.card.record.attr;
      if (lattr == null) {
        return "";
      }
      if (!lattr.hasOwnProperty("notes")) {
        return "";
      }
      return lattr.notes;
    },
    setNotes(event) {
      if (!this.card.record.attr) {
        this.card.record.attr = {};
      }
      let lattr = this.card.record.attr;
      lattr["notes"] = event;
    },
    async updateCounter() {
      let req = {
        id: this.card.record.id,
        iccid: this.card.record.iccid,
        ota_counter: this.card_ota_counter,
      };

      try {
        let answer = await this.$axios.$put("/api/v1/cards/counter/update", req);
        if (answer) {
          this.card.record.ota_counter = answer.ota_counter;
          this.tellUser("success", "OTA Counter updated successfully.");
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      this.ota_counter_dialog = false;
    },
    async saveNotes() {
      let answer = await this.updateCardAttr();
      if (answer === "OK") {
        this.tellUser("success", `Notes Saved Successfully`);
      }
    },
    async loadSubsMeta() {
      try {
        let subs_meta = await this.$axios.$get("/api/v1/subscribers/meta");
        this.subs_meta = subs_meta;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadSubscriber() {
      let last_sid = "";
      let card_iccid = "";
      let sub_imsi = "";
      let lsub = [];
      if (this.card.record && this.card.record.hasOwnProperty("last_sid")) {
        last_sid = this.card.record.last_sid;
      }
      if (this.card.record && this.card.record.hasOwnProperty("iccid")) {
        card_iccid = this.card.record.iccid;
      }
      if (this.subs.records.length > 0) {
        lsub = this.subs.records.filter((sub) => sub.iccid == card_iccid && sub.idx == last_sid);
      }
      if (lsub.length > 0) {
        sub_imsi = lsub[0].imsi;
      }
      try {
        let query = {
          select: {},
          where: [
            {
              k: "imsi",
              op: "equal",
              v: sub_imsi,
            },
          ],
        };
        let subscriber = await this.$axios.$post("api/v1/subscribers/list", query);
        if (subscriber.length > 0) {
          this.subscriber = subscriber[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadHlr() {
      if (this.subscriber && this.subscriber.hasOwnProperty("hlr_id")) {
        this.resource_data.hlr_id = this.subscriber.hlr_id;
      }

      try {
        let query = {
          select: {
            name: {},
          },
          where: [
            {
              k: "id",
              op: "equal",
              v: this.resource_data.hlr_id,
            },
          ],
        };
        let registrar = await this.$axios.$post("api/v1/registrars/list", query);
        if (registrar.length > 0) {
          this.resource_data.hlr_name = registrar[0].name;
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadSmsc() {
      if (this.subscriber && this.subscriber.hasOwnProperty("smsc_id")) {
        this.resource_data.smsc_id = this.subscriber.smsc_id;
      }

      try {
        let query = {
          select: {
            name: {},
          },
          where: [
            {
              k: "id",
              op: "equal",
              v: this.resource_data.smsc_id,
            },
          ],
        };
        let smsc = await this.$axios.$post("api/v1/smscs/list", query);
        if (smsc.length > 0) {
          this.resource_data.smsc_name = smsc[0].name;
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadBip() {
      if (this.subscriber && this.subscriber.hasOwnProperty("bip_id")) {
        this.resource_data.bip_id = this.subscriber.bip_id;
      }

      let query = {
        select: {
          name: {},
        },
        where: [
          {
            k: "id",
            op: "equal",
            v: this.resource_data.bip_id,
          },
        ],
      };
      try {
        let bip = await this.$axios.$post("api/v1/bips/list", query);
        if (bip.length > 0) {
          this.resource_data.bip_name = bip[0].name;
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadBilling() {
      if (this.subscriber && this.subscriber.hasOwnProperty("billing_id")) {
        this.resource_data.billing_id = this.subscriber.billing_id;
      }
      try {
        let query = {
          select: {
            name: {},
          },
          where: [
            {
              k: "id",
              op: "equal",
              v: this.resource_data.billing_id,
            },
          ],
        };
        let billing = await this.$axios.$post("api/v1/billings/list", query);
        if (billing.length > 0) {
          this.resource_data.billing_name = billing[0].name;
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadHsm() {
      if (this.subscriber && this.subscriber.hasOwnProperty("hsm_id")) {
        this.resource_data.hsm_id = this.subscriber.hsm_id;
      }
      try {
        let query = {
          select: {
            name: {},
          },
          where: [
            {
              k: "id",
              op: "equal",
              v: this.resource_data.hsm_id,
            },
          ],
        };
        let hsm = await this.$axios.$post("api/v1/hsms/list", query);
        if (hsm.length > 0) {
          this.resource_data.hsm_name = hsm[0].name;
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadOrder() {
      if (this.card.record && this.card.record.hasOwnProperty("order_id")) {
        this.resource_data.order_id = this.card.record.order_id;
      }
      try {
        let query = {
          select: {
            name: {},
          },
          where: [
            {
              k: "id",
              op: "equal",
              v: this.resource_data.order_id,
            },
          ],
        };
        let order = await this.$axios.$post("api/v1/orders/list", query);
        if (order.length > 0) {
          this.resource_data.order_name = order[0].name;
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadProduct() {
      if (this.card.record && this.card.record.hasOwnProperty("product_id")) {
        this.resource_data.product_name = this.card.record.product_id;
      }
      try {
        let query = {
          select: {
            id: {},
          },
          where: [
            {
              k: "name",
              op: "equal",
              v: this.resource_data.product_name,
            },
          ],
        };
        let product = await this.$axios.$post("api/v1/products/list", query);
        if (product.length > 0) {
          this.resource_data.product_id = product[0].id;
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadUicc() {
      if (this.card.record && this.card.record.hasOwnProperty("uicc_id")) {
        this.resource_data.uicc_id = this.card.record.uicc_id;
      }
      try {
        let query = {
          select: {
            name: {},
          },
          where: [
            {
              k: "id",
              op: "equal",
              v: this.resource_data.uicc_id,
            },
          ],
        };
        let uicc = await this.$axios.$post("api/v1/uiccs/list", query);
        if (uicc.length > 0) {
          this.resource_data.uicc_name = uicc[0].name;
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadBipBindings() {
      if (this.subscriber && this.subscriber.hasOwnProperty("bip_id")) {
        this.resource_data.bip_id = this.subscriber.bip_id;
      }

      try {
        let query = {
          select: {},
          where: [
            {
              k: "bip_id",
              op: "equal",
              v: this.resource_data.bip_id,
            },
          ],
        };

        let bip_bindings = await this.$axios.$post("api/v1/bip_bindings/list", query);
        this.bip_bindings = bip_bindings;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadCardApplets() {
      try {
        let query = {
          select: {},
          where: [
            {
              k: "iccid",
              op: "equal",
              v: this.card.record.iccid,
            },
          ],
        };
        let card_applets = await this.$axios.$post("api/v1/card_applets/list", query);
        this.card_applets = card_applets;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadApplets() {
      try {
        if (this.card_applets.length > 0) {
          let query = {
            select: { id: { k: "id" }, name: { k: "name" }, applet_type: { k: "applet_type" }, description: { k: "description" }, is_multi_imsi: { k: "is_multi_imsi" }, multi_imsi_type: { k: "multi_imsi_type" }, ts: { k: "ts" } },
            where: [
              {
                k: "id",
                op: "equal",
                v: this.card_applets[0].applet_id,
              },
            ],
          };
          let applets = await this.$axios.$post("api/v1/applets/list", query);
          this.applets.records = applets;
        } else {
          this.applets.records = null;
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadCardSubscribers() {
      let user_permissions = this.$store.state.session.permissions;
      this.subs.permissions = user_permissions.find((p) => this.subs.resources.toLowerCase() == p.res);
      let lheaders = [];
      let leditedItem = {};
      let ldefaultItem = {};
      let card_subs_meta = [];
      let card_subs = [];
      try {
        card_subs_meta = await this.$axios.$get(`/api/v1/card_subs/meta`);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      for (const key of Object.keys(card_subs_meta.keys)) {
        let lheader = {
          text: "",
          align: "",
          sortable: false,
          value: "",
          type: "",
        };

        let hidden_keys = ["id", "name", "imsi", "ts", "apn", "mcc", "mnc", "idx", "key_id", "iccid", "smsc", "used", "imsi_range"];

        if (hidden_keys.includes(key)) {
          continue;
        }

        lheader.value = key;
        lheader.align = card_subs_meta.keys[key].align;
        lheader.text = card_subs_meta.keys[key].desc;
        lheader.type = card_subs_meta.keys[key].type;
        lheader.default = card_subs_meta.keys[key].default;
        if (card_subs_meta.keys[key].hasOwnProperty("hint")) {
          lheader["hint"] = card_subs_meta.keys[key].hint;
        }
        ldefaultItem[key] = lheader.default;

        if (lheader.type == "number") {
          leditedItem[key] = 0;
        } else {
          leditedItem[key] = "";
        }

        lheaders.push(lheader);
      }

      try {
        let query = {
          where: [
            {
              k: "iccid",
              op: "equal",
              v: this.card.record.iccid,
            },
          ],
        };
        card_subs = await this.$axios.$post(`/api/v1/card_subs/list`, query);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      this.subs.meta = card_subs_meta;
      this.subs.headers = lheaders;
      this.subs.records = card_subs;
      this.subs.editedItem = leditedItem;
      this.subs.defaultItem = ldefaultItem;
      this.subs.loading = false;
    },
    async loadCardKeys() {
      let user_permissions = this.$store.state.session.permissions;
      this.keys.permissions = user_permissions.find((p) => this.keys.resources.toLowerCase() == p.res);
      let lheaders = [];
      let leditedItem = {};
      let ldefaultItem = {};
      let card_keys_meta = [];
      let card_keys = [];
      try {
        card_keys_meta = await this.$axios.$get(`/api/v1/card_keys/meta`);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      for (const key of Object.keys(card_keys_meta.keys)) {
        if (key == "iccid" || key == "id" || key == "ts") {
          continue;
        }
        let lheader = {
          text: "",
          align: "",
          sortable: false,
          value: "",
          type: "",
        };

        if (key == "idx") {
          lheader.width = "5%";
        }
        lheader.value = key;
        lheader.align = card_keys_meta.keys[key].align;
        lheader.text = card_keys_meta.keys[key].desc;
        lheader.type = card_keys_meta.keys[key].type;
        lheader.default = card_keys_meta.keys[key].default;
        ldefaultItem[key] = lheader.default;

        if (card_keys_meta.keys[key].hasOwnProperty("hint")) {
          lheader["hint"] = card_keys_meta.keys[key].hint;
        }

        if (lheader.type == "number") {
          leditedItem[key] = 0;
        } else {
          leditedItem[key] = "";
        }

        lheaders.push(lheader);
      }

      try {
        let query = {
          where: [
            {
              k: "iccid",
              op: "equal",
              v: this.$route.query.iccid,
            },
          ],
        };
        card_keys = await this.$axios.$post(`/api/v1/card_keys/list`, query);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      lheaders.push({
        text: "Actions",
        value: "action",
        sortable: false,
        align: "center",
      });
      this.keys.meta = card_keys_meta;
      this.keys.headers = lheaders;
      this.keys.records = card_keys;
      this.keys.editedItem = leditedItem;
      this.keys.defaultItem = ldefaultItem;
      this.keys.loading = false;
    },
    async loadCardSettings() {
      let user_permissions = this.$store.state.session.permissions;
      this.settings.permissions = user_permissions.find((p) => this.settings.resources.toLowerCase() == p.res);
      let lheaders = [];
      let leditedItem = {};
      let ldefaultItem = {};
      let card_settings_meta = [];
      let card_settings = [];
      try {
        card_settings_meta = await this.$axios.$get(`/api/v1/card_settings/meta`);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      for (const key of Object.keys(card_settings_meta.keys)) {
        if (key == "iccid" || key == "id" || key == "ts") {
          continue;
        }

        let lheader = {
          text: "",
          align: "",
          sortable: false,
          value: "",
          type: "",
        };

        lheader.value = key;
        lheader.align = card_settings_meta.keys[key].align;
        lheader.text = card_settings_meta.keys[key].desc;
        lheader.type = card_settings_meta.keys[key].type;
        lheader.default = card_settings_meta.keys[key].default;
        ldefaultItem[key] = lheader.default;

        if (card_settings_meta.keys[key].hasOwnProperty("hint")) {
          lheader["hint"] = card_settings_meta.keys[key].hint;
        }

        if (lheader.type == "number") {
          leditedItem[key] = 0;
        } else {
          leditedItem[key] = "";
        }

        lheaders.push(lheader);
      }

      try {
        let query = {
          where: [
            {
              k: "iccid",
              op: "equal",
              v: this.$route.query.iccid,
            },
          ],
        };
        card_settings = this.$axios.$post(`/api/v1/card_settings/list`, query);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      lheaders.push({
        text: "Actions",
        value: "action",
        sortable: false,
        align: "center",
      });
      this.settings.meta = card_settings_meta;
      this.settings.headers = lheaders;
      this.settings.records = card_settings;
      this.settings.editedItem = leditedItem;
      this.settings.defaultItem = ldefaultItem;
      this.settings.loading = false;
    },
    async loadCard() {
      let user_permissions = this.$store.state.session.permissions;
      this.card.permissions = user_permissions.find((p) => this.card.resources.toLowerCase() == p.res);
      let lheaders = [];
      let cards = [];
      let cards_meta = [];
      // important flag - only now the card is loaded
      this.card.loading = true;

      try {
        cards_meta = await this.$axios.$get(`/api/v1/cards/meta`);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      for (const key of Object.keys(cards_meta.keys)) {
        let lheader = {
          text: "",
          align: "",
          sortable: true,
          value: "",
          type: "",
        };
        lheader.value = key;
        lheader.align = cards_meta.keys[key].align;
        lheader.text = cards_meta.keys[key].desc;
        lheader.type = cards_meta.keys[key].type;
        lheader.default = cards_meta.keys[key].default;
        lheader.width = cards_meta.keys[key].width;

        lheaders.push(lheader);
      }

      try {
        let query = {
          where: [
            {
              k: "iccid",
              op: "equal",
              v: this.$route.query.iccid,
            },
          ],
        };
        cards = await this.$axios.$post(`/api/v1/cards/list`, query);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      this.card.meta = cards_meta;
      this.card.headers = lheaders;
      this.card.record = cards[0];

      if (!this.card.record) {
        this.card_record_error = true;
        return;
      }

      this.hidden_filter = [
        {
          k: "iccid",
          op: "equal",
          v: this.card.record.iccid,
        },
      ];

      this.card_ota_counter = this.card.record.ota_counter;

      if (!this.isValidOtaState()) {
        console.log(`card - loadCard -invalid ota state`);
        this.card.record.ota_state = "idle";
      }

      if (!this.card.record.hasOwnProperty("ota_stack")) {
        console.log(`card - loadCard - no ota stack`);

        this.card.record.ota_stack = {
          type: this.card.default_ota_stack_type,
          changes: [],
        };
      }

      if (null == this.card.record.ota_stack) {
        console.log(`card - loadCard - ota stack is null`);
        this.card.record.ota_stack = {
          type: this.card.default_ota_stack_type,
          changes: [],
        };
      }

      if (!this.card.record.ota_stack.hasOwnProperty("type")) {
        console.log(`card - loadCard - ota stack has no type`);
        this.card.record.ota_stack.type = this.card.default_ota_stack_type;
      }

      console.log(`card - loadCard - ota stack is: ${JSON.stringify(this.card.record.ota_stack)}`);
      this.ota_stack_version++;
      // important flag - only now the card is loaded
      this.card.loading = false;
    },
    async loadCardKeyStore() {
      try {
        let query = {
          where: [
            {
              k: "iccid",
              op: "equal",
              v: this.$route.query.iccid,
            },
          ],
        };

        let card_key_store = await this.$axios.$post(`/api/v1/card_key_store/list`, query);
        this.card_key_store = card_key_store;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    onJsonStackUpdate(event) {
      console.log(`card - onJsonStackUpdate - ${JSON.stringify(event)}`);
      this.card.record.ota_stack = event;
      this.ota_stack_version++;
    },
    onJsonRequestUpdate(event) {
      console.log(`card - onJsonRequestUpdate - ${JSON.stringify(event)}`);
      this.card.record.ota_command = event;
    },
    getOtaState() {
      return this.card.record.ota_state;
    },
    isOtaResponseError() {
      let response = this.card.record.ota_response;

      if (!response) {
        return false;
      }

      let lstatus = undefined;
      if (response.statusCode) {
        lstatus = response.statusCode;
      } else if (response.status) {
        lstatus = response.status;
      }

      if (!lstatus) {
        return false;
      }

      if (lstatus < 199 || lstatus == 202) {
        return false;
      }

      if (lstatus == 200) {
        return false;
      }

      if (lstatus > 299) {
        return true;
      }

      return false;
    },
    getNiceOtaError() {
      let response = this.card.record.ota_response;
      if (!response) {
        return "";
      }

      let lstatus = undefined;
      if (response.statusCode) {
        lstatus = response.statusCode;
      } else if (response.status) {
        lstatus = response.status;
      }

      if (!lstatus) {
        return "";
      }

      let lmessage = "";
      if (response.message) {
        lmessage = ` - ${response.message}`;
      }

      return `${lstatus}${lmessage}`;
    },
    isOtaSyncing() {
      let response = this.card.record.ota_response;

      if (!response) {
        return false;
      }

      let lstatus = undefined;
      if (response.statusCode) {
        lstatus = response.statusCode;
      } else if (response.status) {
        lstatus = response.status;
      }

      if (!lstatus) {
        return false;
      }

      if (lstatus < 199 || lstatus == 202) {
        return true;
      }

      return false;
    },
    getOtaResponseColor() {
      let response = this.card.record.ota_response;

      if (!response) {
        return "none";
      }

      let lstatus = undefined;
      if (response.statusCode) {
        lstatus = response.statusCode;
      } else if (response.status) {
        lstatus = response.status;
      }

      if (!lstatus) {
        return "none";
      }

      if (lstatus < 199 || lstatus == 202) {
        return "warning";
      }

      if (lstatus == 200) {
        return "success";
      }

      if (lstatus > 299) {
        return "error";
      }

      return "none";
    },
    onProfileClick(item) {
      console.log(`onProfileClick ${JSON.stringify(item)}`);
      if (this.card.permissions.u == 0) {
        return;
      }

      if (item.imsi != "") {
        this.active.idx = item.idx;
        this.active.imsi = item.imsi;

        this.active.mcc = this.card.record.last_mcc;
        this.active.mnc = this.card.record.last_mnc;
        this.active.imsis = [];
        if (Number(item.imsi_range) == 0) {
          this.active.imsis.push(item.imsi);
        } else {
          for (let i = 0; i < Number(item.imsi_range); i++) {
            this.active.imsis.push(`${Number(item.imsi) + i}`);
          }
        }

        this.active.dialog = true;
      }
    },
    async syncProfile(idx, imsi) {
      console.log(`syncProfile idx:${idx}, imsi:${imsi} ${JSON.stringify(this.active)}`);

      let card = {
        id: this.card.record.id,
        aid: this.card.record.aid,
        path: this.card.record.path,
        force_last_sid: idx,
        force_last_imsi: imsi,
        force_last_mcc: this.active.mcc,
        force_last_mnc: this.active.mnc,
      };

      try {
        await this.$axios.$put(`/api/v1/cards/${this.card.record.id}`, card);
        this.card.record.last_sid = idx;
        this.card.record.last_imsi = imsi;
        this.card.record.last_mcc = this.active.mcc;
        this.card.record.last_mnc = this.active.mnc;
      } catch (err) {
        return "FAIL";
      }

      return "OK";
    },
    setActive() {
      this.active.dialog = false;
      this.syncProfile(this.active.idx, this.active.imsi);
    },
    closeActive() {
      this.active.dialog = false;
    },
    pad(numStr, digits) {
      numStr = numStr.toString();
      while (numStr.length < digits) numStr = "0" + numStr;
      return numStr;
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
    async onMessage(message) {
      console.log(`onMessage message:${JSON.stringify(message)}`);
      let request = { iccid: this.card.record.iccid, sms: message };
      if (message.hasOwnProperty("source_name")) {
        request["source_name"] = message.source_name;
        message.source_name = undefined;
      }

      await this.sendCardSms(request);
    },
    async sendCardSms(command) {
      console.log(`sendCardSms command:${JSON.stringify(command)}`);
      this.sms_status = { msgid: "", code: 100, msg: "Trying" };

      try {
        let response = await this.$axios.$post(`/api/v1/cards/sms`, command);

        console.log(`sendCardSms - response: ${JSON.stringify(response)}`);
        this.sms_status = {
          msgid: response.response.message_id,
          code: 202,
          msg: "Sent",
        };
      } catch (err) {
        console.log(`sendCardSms - error: ${JSON.stringify(err.response)}`);
        this.sms_status = {
          msgid: "",
          code: err.response.status,
          msg: err.response.data,
        };
      }
    },
    onApn(apn) {
      console.log(`onApn apn:${JSON.stringify(apn)}`);
      let request = { iccid: this.card.record.iccid, apn: apn };
      this.sendCardApn(request);
    },
    sendCardApn(command) {
      console.log(`sendCardApn command:${JSON.stringify(command)}`);
      this.sms_status = { msgid: "", code: 100, msg: "Trying" };
      this.$axios
        .$post(`/api/v1/cards/apn`, command)
        .then((response) => {
          console.log(`sendCardApn - response: ${JSON.stringify(response)}`);

          this.sms_status = {
            msgid: response.response.message_id,
            code: 202,
            msg: "Sent",
          };
        })
        .catch((error) => {
          console.log(`sendCardApn - error: ${JSON.stringify(error.response)}`);
          this.sms_status = {
            msgid: "",
            code: error.response.status,
            msg: error.response.data,
          };
        });
    },
    onOtaUpdateFailure() {
      this.pull_api_data(true);
    },
    onScpLoading(event) {
      this.scp_loading = event;
    },
    async onSyncChange() {
      await this.reloadData(["card", "applets", "subscriber"]);
    },
    async onOtaUpdateSuccess(event) {
      console.log(`card - onOtaUpdateSuccess - ${JSON.stringify(event)}`);
      let l_event = event;
      if (!l_event.hasOwnProperty("update")) {
        console.log("card - onOtaUpdateSuccess - event is not update.");
        return;
      }

      let l_update = l_event.update;
      if (!l_update.hasOwnProperty("changes")) {
        console.log("card - onOtaUpdateSuccess - event has no changes.");
        return;
      }

      let l_changes = l_update.changes;
      if (l_changes.length == 0) {
        console.log("card - onOtaUpdateSuccess - changes length is 0.");
        return;
      }

      if (!l_changes[0].hasOwnProperty("operations")) {
        console.log("card - onOtaUpdateSuccess - changes have no operations.");
        return;
      }

      let l_operations = l_changes[0].operations;
      if (l_operations.length == 0) {
        console.log("card - onOtaUpdateSuccess - operations length is 0.");
        return;
      }

      if (!l_operations[0].hasOwnProperty("type")) {
        console.log("card - onOtaUpdateSuccess - operations have no type.");
        return;
      }
      console.log(`card - onOtaUpdateSuccess - type: ${l_operations[0].type}`);
      if (l_operations[0].type == "isd_keys") {
        await this.reloadData(["card", "keystore"]);
        this.key_store_version++;
      }
    },
    async pull_api_data(force) {
      if (this.pulling_in_progress) {
        return;
      }

      if (!force && this.card.record.ota_state == "edit") {
        return;
      }

      this.pulling_in_progress = true;

      try {
        let lcard = await this.$axios.$get(`/api/v1/cards/${this.card.record.id}`);

        let lbody = {
          changed: lcard,
        };

        this.cardChanged(lbody);
      } catch (err) {
        console.log(`card - pull_api_data - error: ${err}`);
      }

      this.pulling_in_progress = false;
    },
    cardChanged(body) {
      if (body.changed.id != this.card.record.id) return;

      //console.log(`cardChanged - card with: ${JSON.stringify(body)}`);
      let dirty = [];

      for (const key of Object.keys(body.changed)) {
        if (key == "ota_stack" || key == "attr") {
          continue;
        }

        if (this.card.record[key] != body.changed[key]) {
          this.card.record[key] = body.changed[key];
          switch (key) {
            case "ota_state":
            case "keyset_scp80":
            case "keyset_scp81":
            case "ota_keyset_scp81":
              {
                if (dirty.find((f) => f != "keystore")) {
                  dirty.push("keystore");
                }
              }
              break;
            case "last_sid":
            case "last_imsi":
              {
                if (dirty.find((f) => f != "subscriber")) {
                  dirty.push("subscriber");
                }
              }
              break;
          }
        }
      }

      if (dirty.length > 0) {
        this.reloadData(dirty);
      }
    },
    findSubRowByIdx(idx) {
      for (let i = 0; i < this.subs.records.length; i++) {
        if (this.subs.records[i].idx == idx) {
          return i;
        }
      }
      return -1;
    },
    findSubRowById(id) {
      for (let i = 0; i < this.subs.records.length; i++) {
        if (this.subs.records[i].id == id) {
          return i;
        }
      }
      return -1;
    },
    cardSubsChanged(body) {
      let changed = body.changed;
      if (this.card.record.iccid != changed.iccid) return;

      let idx = -1;
      if (changed.idx) {
        idx = this.findSubRowByIdx(changed.idx);
      } else if (changed.id) {
        idx = this.findSubRowById(changed.id);
      }

      if (idx < 0) {
        return;
      }

      for (const key of Object.keys(changed)) {
        this.subs.records[idx][key] = changed[key];
      }
    },
    findKeysRowByIdx(idx) {
      for (let i = 0; i < this.keys.records.length; i++) {
        if (this.keys.records[i].idx == idx) {
          return i;
        }
      }
      return -1;
    },
    findKeysRowById(id) {
      for (let i = 0; i < this.keys.records.length; i++) {
        if (this.keys.records[i].id == id) {
          return i;
        }
      }
      return -1;
    },
    cardKeysChanged(body) {
      console.log(`cardKeysChanged - card with: ${JSON.stringify(body)}`);

      let changed = body.changed;
      if (this.card.record.iccid != changed.iccid) return;

      let idx = -1;
      if (changed.idx) {
        idx = this.findKeysRowByIdx(changed.idx);
      } else if (changed.id) {
        idx = this.findKeysRowById(changed.id);
      }

      if (idx < 0) {
        return;
      }

      for (const key of Object.keys(body.changed)) {
        this.keys.records[idx][key] = body.changed[key];
      }
    },
    findSettingsRowById(id) {
      for (let i = 0; i < this.settings.records.length; i++) {
        if (this.settings.records[i].id == id) {
          return i;
        }
      }
      return -1;
    },
    findSettingsRowByName(name) {
      for (let i = 0; i < this.settings.records.length; i++) {
        if (this.settings.records[i].name == name) {
          return i;
        }
      }
      return -1;
    },
    cardSettingsChanged(body) {
      console.log(`cardSettingsChanged - card with: ${JSON.stringify(body)}`);

      let changed = body.changed;
      if (this.card.record.iccid != changed.iccid) return;

      let idx = -1;
      if (changed.name) {
        idx = this.findSettingsRowByName(changed.name);
      } else if (changed.id) {
        idx = this.findSettingsRowById(changed.id);
      }

      if (idx < 0) {
        return;
      }

      for (const key of Object.keys(body.changed)) {
        this.settings.records[idx][key] = body.changed[key];
      }
    },
    updateLocation(body) {
      console.log(`updateLocation`);

      if (this.card.record.iccid != body.location.iccid) return;

      this.card.record.state = body.location.state;
      this.card.record.last_sid = body.location.profileId;
      this.card.record.last_imsi = body.location.imsi;
      this.card.record.last_mcc = body.location.mcc;
      this.card.record.last_mnc = body.location.mnc;
      this.card.record.last_imei = body.location.imei;
      this.card.record.last_lac = body.location.lac;
      this.card.record.last_cellid = body.location.cellid;

      this.ulkey++;
      this.card.record.last_seen = new Date().toISOString();
    },
    getFirstKeysetNumber(p_scp) {
      let l_first_key = this.getFirstActiveKey(p_scp);
      if (!l_first_key) {
        return 0;
      }

      return l_first_key.keyset;
    },
    getFirstActiveKey(p_scp) {
      let l_card_key_store = this.card_key_store;
      let lfound = l_card_key_store.find((f) => f.scp == p_scp && f.state == "active");
      return lfound;
    },
    getScpActiveKeys(p_scp) {
      let l_card_key_store = this.card_key_store;
      let l_filter = l_card_key_store.filter((f) => f.scp == p_scp && f.state == "active");
      return l_filter;
    },
    getScpActiveKeysets(p_scp) {
      let l_filter = this.getScpActiveKeys(p_scp);
      let l_reduce = l_filter.reduce((pv, cv) => {
        let l_pv = [];
        if (pv) {
          l_pv = pv;
        }

        let found = l_pv.find((f) => {
          return f.keyset == cv.keyset;
        });

        if (!found) {
          l_pv.push({ keyset: cv.keyset, name: cv.name });
        }
        return l_pv;
      }, []);
      let l_map = l_reduce.map((m) => {
        return {
          key: m.keyset,
          name: m.name,
          value: `Keyset ${m.keyset}`,
        };
      });

      let lsort = l_map.sort((a, b) => a.keyset - b.keyset);
      return lsort;
    },
    unlockedKeystore() {
      if (this.unlock_keystore) {
        return false;
      }
      return true;
    },
    setKeysetForDeletion(keyset, history) {
      console.log("card - setKeysetForDeletion - enter");
      this.keyset = keyset;

      if (history) {
        this.keyset_history = history;
      }
      this.delete_keyset_dialog = true;
    },
    keysetDialogTitle() {
      let ltitle = "";
      if (this.keyset == 0) {
        ltitle = "the keyset history of this card";
      } else {
        ltitle = `${this.keyset_history ? "the history of " : ""}keyset ${this.keyset}`;
      }
      return `Are you sure you want to delete ${ltitle}?`;
    },
    async deleteKeyset() {
      console.log("card - deleteKeyset - enter");
      try {
        let req = {
          iccid: this.card.record.iccid,
          keyset: this.keyset,
          state: "all",
          hsm: this.hsm_keyset,
        };
        this.delete_keyset_loader = true;
        if (this.keyset_history) {
          req["state"] = "history";
        }
        let answer = await this.$axios.$post("api/v1/card_key_store/keysets/delete", req);
        if (answer != null) {
          await this.reloadData(["keystore"]);
          this.key_store_version++;
          this.tellUser("success", "Keyset Deleted Successfully");
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      this.closeKeysetDialog();
    },
    closeKeysetDialog() {
      this.keyset_history = false;
      this.delete_keyset_loader = false;
      this.delete_keyset_dialog = false;
    },
    isEmpty(obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) return false;
      }
      return true;
    },
    getStateName() {
      switch (this.card.record.state) {
        case 0:
          return "Manual";
        case 1:
          return "Boot";
        case 2:
          return "Active";
        case 3:
          return "Suspend";
        case 4:
          return "Dead";
        case 5:
          return "Single";
        default:
          return "Unknown";
      }
    },
    isStateAutomatic() {
      switch (this.card.record.state) {
        case 1:
          return true;
        case 2:
          return true;
        default:
          return false;
      }
    },
    disableResendOta() {
      switch (this.card.record.ota_state) {
        case "idle":
          return true;
        case "pending":
          return true;
        case "wait":
          return true;
        case "wait_delay":
          return true;
        default:
          return false;
      }
    },
    disableWaitCmd() {
      if (this.card.record.ota_state == "build" || this.card.record.ota_state == "error") {
        return false;
      }

      return true;
    },
    disableBuildCmd() {
      if (this.card.record.ota_state != "idle") {
        return true;
      }
      return false;
    },
    disableCancelCmd() {
      switch (this.card.record.ota_state) {
        case "idle":
          return true;
        default:
          return false;
      }
    },
    isOtaInProgress() {
      switch (this.card.record.ota_state) {
        case "pending":
          return true;
        case "wait_delay":
          return true;
        default:
          return false;
      }
    },
    isOtaInError() {
      switch (this.card.record.ota_state) {
        case "error":
          return true;
        default:
          return false;
      }
    },
    getOtaError() {
      if (this.card.record.ota_state != "error") {
        return "No error";
      } else {
        return JSON.stringify(this.card.record.ota_response);
      }
    },
    getLastSid() {
      return this.card.record.last_sid;
    },
    getInstalledApnsText() {
      if (null == this.card.record.attr) {
        return "";
      }
      let attr = this.card.record.attr;

      if (!attr.hasOwnProperty("apns")) {
        return "";
      }
      let apns = this.card.record.attr.apns;

      if (0 == apns.length) {
        return "";
      }
      return `(${apns.join(",")})`;
    },
    getLastSeen() {
      if (this.card.record.last_seen === "") {
        return "";
      }
      if (!this.card.record.last_seen.endsWith("Z")) {
        this.card.record.last_seen += "Z";
      }

      let l = helpers.toLocalTimeInIsoFormatUi(this.card.record.last_seen);

      return l;
    },
    getBootMark() {
      return this.card.record.boot_mark;
    },
    getLastKey() {
      let sub_idx = this.getLastSid() - 1;
      if (this.subs.records.length < sub_idx) return 1;

      if (typeof this.subs.records[sub_idx] === "undefined") {
        return 1;
      }
      return this.subs.records[sub_idx].key_id;
    },
    tellUser(type, message) {
      this.$bus.$emit("user-msg", { type: type, body: message });
    },
    getIdentity() {
      let sub_keys = ["imsi", "msisdn"];
      let card_keys = ["last_imei", "eid"];
      let identities = this.getDetailsData(sub_keys, card_keys);

      identities.forEach((identity) => {
        if (identity.value == "imsi") {
          identity.type = "link";
          identity["path"] = "/resources/subscriber";
          identity["query"] = { imsi: identity.data };
        }
      });

      return identities;
    },
    getLinks() {
      let card_keys = ["order_id", "product_id", "uicc_id"];
      let links = this.getDetailsData(null, card_keys);
      let l_resource_data = this.resource_data;
      links.forEach((link) => {
        link.type = "link";
        link["path"] = "/resources";
        switch (link.value) {
          case "order_id":
            link["path"] = `${link["path"]}/order`;
            link["query"] = { id: l_resource_data.order_id };
            link.data = l_resource_data.order_name != "" ? l_resource_data.order_name : 0;
            break;
          case "uicc_id":
            link["path"] = `${link["path"]}/uicc`;
            link["query"] = { id: l_resource_data.uicc_id };
            link.data = l_resource_data.uicc_name != "" ? l_resource_data.uicc_name : 0;
            break;
          case "product_id":
            link["path"] = `${link["path"]}/product`;
            link["query"] = { id: l_resource_data.product_id };
            link.data = l_resource_data.product_name != "" ? l_resource_data.product_name : 0;
            break;
        }
      });

      return links;
    },
    getLocations() {
      let card_keys = ["last_mcc", "last_mnc", "last_lac", "last_cellid"];
      let locations = this.getDetailsData(null, card_keys);

      return locations;
    },
    getServices() {
      let sub_keys = ["hlr_id", "smsc_id", "billing_id", "bip_id", "hsm_id"];
      let services = this.getDetailsData(sub_keys);
      let l_resource_data = this.resource_data;

      services.forEach((service) => {
        service.type = "link";
        service["path"] = "/network";

        switch (service.value) {
          case "hsm_id":
            service["path"] = `${service["path"]}/hsm_keys`;
            service["query"] = { id: l_resource_data.hsm_id };
            service.data = l_resource_data.hsm_name != "" ? l_resource_data.hsm_name : 0;
            break;
          case "bip_id":
            service["path"] = `${service["path"]}/bip_bindings`;
            service["query"] = { id: l_resource_data.bip_id };
            service.data = l_resource_data.bip_name != "" ? l_resource_data.bip_name : 0;
            break;
          case "hlr_id":
            service["path"] = `${service["path"]}/registrar`;
            service["query"] = { name: l_resource_data.hlr_name != "" ? l_resource_data.hlr_name : 0 };
            service.data = l_resource_data.hlr_name != "" ? l_resource_data.hlr_name : 0;
            break;
          case "smsc_id":
            service["path"] = `${service["path"]}/smsc`;
            service["query"] = { name: l_resource_data.smsc_name != "" ? l_resource_data.smsc_name : 0 };
            service.data = l_resource_data.smsc_name != "" ? l_resource_data.smsc_name : 0;
            break;
          case "billing_id":
            service["path"] = `${service["path"]}/billing`;
            service["query"] = { name: l_resource_data.billing_name != "" ? l_resource_data.billing_name : 0 };
            service.data = l_resource_data.billing_name != "" ? l_resource_data.billing_name : 0;
            break;
        }
      });

      return services;
    },
    getOta() {
      let card_keys = ["ota_state", "ota_counter", "ota_corrid", "ota_retry", "scp_state", "scp_expiry"];
      let ota = this.getDetailsData(null, card_keys);

      ota.forEach((o) => {
        if ("ota_counter" == o.value) {
          o.type = "password";
        }
        if ("ota_state" == o.value || "scp_state" == o.value) {
          o.type = "state";
        }
      });

      return ota;
    },
    isMultiImsi() {
      let multi_imsi = false;
      if (null != this.applets.records) {
        let lapplet = this.applets.records;
        if (lapplet[0].is_multi_imsi == 1 && lapplet[0].multi_imsi_type == "flolive") {
          multi_imsi = true;
        }
      }

      return multi_imsi;
    },
    getDetailsData(sub_keys, card_keys) {
      console.log(`card - getDetailsData - sub_keys: ${JSON.stringify(sub_keys)} card_keys: ${JSON.stringify(sub_keys)}`);
      let card_meta = this.card.meta;
      let subs_meta = this.subs_meta;
      let details = [];
      if (null != sub_keys) {
        for (const key of Object.keys(subs_meta.keys)) {
          let ldetails = {
            text: "",
            align: "",
            value: "",
            type: "",
            data: "",
          };
          let hidden_keys = sub_keys;

          if (!hidden_keys.includes(key)) {
            continue;
          }

          ldetails.value = key;
          ldetails.align = subs_meta.keys[key].align;
          ldetails.text = subs_meta.keys[key].desc;
          ldetails.type = subs_meta.keys[key].type;

          if (this.subscriber && this.subscriber.hasOwnProperty(key)) {
            ldetails.data = this.subscriber[key];
          }

          if (subs_meta.keys[key].hasOwnProperty("hint")) {
            ldetails["hint"] = subs_meta.keys[key].hint;
          }

          details.push(ldetails);
        }
      }

      if (null != card_keys) {
        for (const key of Object.keys(card_meta.keys)) {
          let ldetails = {
            text: "",
            align: "",
            value: "",
            type: "",
            data: "",
          };
          let hidden_keys = card_keys;

          if (!hidden_keys.includes(key)) {
            continue;
          }
          ldetails.value = key;
          ldetails.data = this.card.record[key];
          ldetails.align = card_meta.keys[key].align;
          ldetails.text = card_meta.keys[key].desc;
          ldetails.type = card_meta.keys[key].type;

          if (card_meta.keys[key].hasOwnProperty("hint")) {
            ldetails["hint"] = card_meta.keys[key].hint;
          }

          details.push(ldetails);
        }
      }

      return details;
    },
    beutifyPlmn(plmn) {
      if (!plmn) {
        return "";
      }

      if (plmn.length < 11) {
        return plmn;
      }
      return `${plmn.substr(0, 11)}...`;
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
    sendCardRegistrarSuspend(command) {
      console.log(`sendCardRegistrarSuspend command:${JSON.stringify(command)}`);

      this.$axios
        .$post(`/api/v1/cards/registrar/suspend`, command)
        .then((response) => {
          console.log(`sendCardRegistrarSuspend - response: ${JSON.stringify(response)}`);
          this.tellUser("error", `${response.status} - ${response.data}`);
        })
        .catch((err) => {
          console.log(`sendCardRegistrarSuspend - error: ${JSON.stringify(err)}`);
          this.tellUser("error", `${err}:${JSON.stringify(err)}`);
        });
    },
    sendCardBillingSuspend(command) {
      console.log(`sendBillingCommand command:${JSON.stringify(command)}`);

      this.$axios
        .$post(`/api/v1/cards/billing/suspend`, command)
        .then((response) => {
          console.log(`sendBillingCommand - response: ${JSON.stringify(response)}`);

          this.tellUser("success", "Performed successfully");
        })
        .catch((err) => {
          console.log(`sendBillingCommand - error: ${JSON.stringify(err)}`);
          if (err.hasOwnProperty("response")) {
            console.log(`sendBillingCommand fail: ${JSON.stringify(err.response)}`);
            this.tellUser("error", `${err.response.status} - ${err.response.data}`);
          } else {
            console.log(`sendBillingCommand fail: ${err}:${JSON.stringify(err)}`);
            this.tellUser("error", `${err}:${JSON.stringify(err)}`);
          }
        });
    },
    getSuspendBilling() {
      let lret = this.card.record.suspended_billing == 0 ? false : true;
      return lret;
    },
    getSuspendBillingText() {
      let lret = this.card.record.suspended_billing == 0 ? "Suspend" : "Unsuspend";
      return lret;
    },
    filterChange(type, id, c) {
      if (c.type != type) {
        return false;
      }

      if (type === "settings") {
        if (c.data.name == id) {
          return true;
        }
      }

      if (type === "actions") {
        if (c.data.cmd == id) {
          return true;
        }
      }

      if (c.data.idx == id) {
        return true;
      }

      return false;
    },
    getCardChanges(type, id) {
      // make sure we have an ota stck variable
      if (!this.card.record.ota_stack) {
        this.card.record["ota_stack"] = {};
      }

      if (!this.card.record.ota_stack.changes) {
        this.card.record.ota_stack["changes"] = [];
      }

      let changes = this.card.record.ota_stack.changes;
      if (!type) {
        return changes;
      } else if (!id) {
        return changes.filter((c) => c.type == type);
      } else {
        return changes.filter((c) => this.filterChange(type, id, c));
      }
    },
    getCardChange(type, id) {
      let changes = this.getCardChanges(type, id);
      if (changes.length == 0) {
        return null;
      } else {
        return changes[0].data;
      }
    },
    getCardChangeCount(type) {
      let changes_amount = 0;
      let c_type = "";
      let cc_type = "";
      let changes = this.getCardChanges(type);

      if (changes.length > 0) {
        let lchanges = changes[0];
        if (lchanges.hasOwnProperty("type")) {
          if (lchanges.type == "flolive") {
            c_type = "Applet";
          } else {
            c_type = "SCP";
          }
          cc_type = lchanges.type.toUpperCase();
        }

        if (lchanges.hasOwnProperty("operations")) {
          let l_opp = lchanges.operations[0];
          if (l_opp != null) {
            if (cc_type == "RFM") {
              if (l_opp.hasOwnProperty("reads") || l_opp.hasOwnProperty("writes")) {
                let ltype = l_opp.type;
                changes_amount = l_opp[ltype].length;
              } else {
                let lopp = lchanges.operations;
                changes_amount = lopp.length;
              }
            } else if (cc_type == "FLOLIVE" || cc_type == "RAM") {
              let lopp = lchanges.operations;
              if (!lopp.includes(null)) {
                changes_amount = lopp.length;
              }
            }
          }
        }
        this.changes_amount = changes_amount;

        return `Operation type is ${c_type} - ${cc_type}, you have ${changes_amount} ${changes_amount == 1 ? "change." : "changes."}`;
      }
    },
    setCardChanges(type, id, data) {
      let changes = this.getCardChanges();
      console.log(`setCardChanges - changes - type:${type} id:${id}`);

      console.log(`setCardChanges - changes - before:${JSON.stringify(changes)}`);
      let change = { type: type, data: data };
      let lfind = changes.filter((c) => this.filterChange(type, id, c));

      if (lfind.length == 0) {
        changes.push(change);
      } else {
        console.log(`setCardChanges - changes - update change`);
        lfind[0].data = change.data;
      }
      console.log(`setCardChanges - changes - after:${JSON.stringify(changes)}`);
      this.totalVersion++;
    },
    removeCardChange(type, id) {
      let changes = this.getCardChanges();
      let lfind = changes.filter((c) => !this.filterChange(type, id, c));

      this.card.record.ota_stack.changes = lfind;
      if (type == "subs") {
        this.subsVersion++;
      } else if (type == "keys") {
        this.keysVersion++;
      } else if (type == "settings") {
        this.settingsVersion++;
      } else if (type == "actions") {
        this.actionVersion++;
      }
      this.totalVersion++;
    },
    getSubsDelta(change) {
      let pos = this.findSubRowByIdx(change.idx);
      let csub = this.subs.records[pos];
      let delta = {};
      let changes = 0;

      for (const key of Object.keys(change)) {
        if (csub[key] != change[key]) {
          delta[key] = change[key];
          changes++;
        }
      }

      if (changes === 0) {
        return null;
      }

      delta.idx = change.idx;
      return delta;
    },
    getSubsMerge(change) {
      let pos = this.findSubRowByIdx(change.idx);
      let csub = this.subs.records[pos];
      let merge = {};

      for (const key of Object.keys(csub)) {
        if (change.hasOwnProperty(key)) {
          merge[key] = change[key];
        } else {
          merge[key] = csub[key];
        }
      }

      return merge;
    },
    _editSubsItem(item) {
      this.subs.editedIndex = this.subs.records.indexOf(item);
      let change = this.getCardChange("subs", item.idx);
      if (null !== change) {
        this.subs.editedItem = Object.assign({}, this.getSubsMerge(change));
      } else {
        this.subs.editedItem = Object.assign({}, item);
        delete this.subs.editedItem.iccid;
        delete this.subs.editedItem.ts;
        delete this.subs.editedItem.id;
      }

      this.subs.dialog = true;
    },
    editSubsItem(item) {
      this._editSubsItem(item);
      this.subs.dialog = true;
    },

    async setSubs() {
      if (this.subs.editedItem.used) {
        this.subs.editedItem.used = 1;
      } else {
        this.subs.editedItem.used = 0;
      }

      let final_sub = undefined;
      if (this.flush_subs) {
        final_sub = this.subs.editedItem;
      } else {
        final_sub = this.getSubsDelta(this.subs.editedItem);
      }

      if (final_sub) {
        this.setCardChanges("subs", final_sub.idx, final_sub);
      }

      this.closeSubs();

      this.subsVersion++;
      return "";
    },
    closeSubs() {
      this.subs.dialog = false;
      setTimeout(() => {
        this.subs.editedItem = Object.assign({}, this.subs.defaultItem);
        this.subs.editedIndex = -1;
      }, 300);
    },
    resetSubsItem(item) {
      this._editSubsItem(item);
      console.log(`card - resetSubsItem - enter`);
      this.subs.editedItem.idx = item.idx;
      this.subs.editedItem.used = 0;
      this.subs.editedItem.name = "";
      this.subs.editedItem.imsi = "";
      this.subs.editedItem.imsi_range = 0;
      this.subs.editedItem.smsc = "";
      this.subs.editedItem.mcc = "";
      this.subs.editedItem.mnc = 2;
      this.subs.editedItem.plmn = "";
      this.subs.editedItem.key_id = 1;

      this.setCardChanges("subs", this.subs.editedItem.idx, this.subs.editedItem);
      let changes = this.getCardChanges();
      console.log(`card - resetSubsItem - changes - after:${JSON.stringify(changes)}`);
      this.closeSubs();

      this.subsVersion++;
      return "";
    },
    _editKeysItem(item) {
      this.keys.editedIndex = this.keys.records.indexOf(item);
      let change = this.getCardChange("keys", item.idx);
      if (null !== change) {
        this.keys.editedItem = Object.assign({}, change);
      } else {
        this.keys.editedItem = Object.assign({}, item);
        delete this.keys.editedItem.iccid;
        delete this.keys.editedItem.ts;
        delete this.keys.editedItem.id;
      }
    },
    editKeysItem(item) {
      this._editKeysItem(item);

      this.keys.dialog = true;
    },
    async setKeys() {
      this.setCardChanges("keys", this.keys.editedItem.idx, this.keys.editedItem);
      this.closeKeys();

      this.keysVersion++;

      return "";
    },
    closeKeys() {
      this.keys.dialog = false;
      setTimeout(() => {
        this.keys.editedItem = Object.assign({}, this.keys.defaultItem);
        this.keys.editedIndex = -1;
      }, 300);
    },
    resetKeysItem(item) {
      console.log(`resetKeysItem - enter`);
      this._editKeysItem(item);
      this.keys.editedItem.ki = "00000000000000000000000000000000";
      this.keys.editedItem.opc = "00000000000000000000000000000000";

      this.setCardChanges("keys", this.keys.editedItem.idx, this.keys.editedItem);
      let changes = this.getCardChanges();
      console.log(`resetKeysItem - changes - after:${JSON.stringify(changes)}`);
      this.closeKeys();
      this.keysVersion++;

      return "";
    },

    editSettingsItem(item) {
      this.settings.editedIndex = this.settings.records.indexOf(item);

      let change = this.getCardChange("settings", item.name);
      if (null !== change) {
        this.settings.editedItem = Object.assign({}, change);
      } else {
        this.settings.editedItem = Object.assign({}, item);

        delete this.settings.editedItem.description;
        if (item.store == "card") {
          delete this.settings.editedItem.iccid;
          delete this.settings.editedItem.ts;
          delete this.settings.editedItem.id;
        }
      }

      this.settings.dialog = true;
    },
    async setSettings() {
      console.log(`card - setSettings - enter`);
      console.log(this.settings.editedItem);

      if (this.settings.editedItem.store == "card" || !this.settings.editedItem.store) {
        let temp = JSON.parse(JSON.stringify(this.settings.editedItem));
        if (temp.hasOwnProperty("store")) {
          delete temp.store;
        }

        this.setCardChanges("settings", this.settings.editedItem.name, temp);
        this.closeSettings();
        this.settingsVersion++;

        return "";
      } else if (this.settings.editedItem.store == "server") {
        if (this.settings.editedIndex > -1) {
          let lupdate = null;
          try {
            lupdate = await this.$axios.$put(`/api/v1/${this.settings.resources.toLowerCase()}/${this.settings.editedItem.id}`, this.settings.editedItem);
          } catch (err) {
            if (err.hasOwnProperty("response")) {
              console.log(`setSettings fail: ${JSON.stringify(err.response)}`);
              this.tellUser("error", `${err.response.status} - ${err.response.data}`);
            } else {
              console.log(`setSettings fail: ${err}`);
              this.tellUser("error", `${err}`);
            }
            return;
          }
          Object.assign(this.settings.editedItem, lupdate);
          Object.assign(this.settings.records[this.settings.editedIndex], this.settings.editedItem);
          this.tellUser("success", `${this.settings.resource} Id:${this.settings.editedItem.id} updated successfully`);
        }

        this.closeSettings();
        return "";
      }
    },
    closeSettings() {
      this.settings.dialog = false;
    },
    closeAllocate() {
      this.allocate.dialog = false;
    },
    allocateIsImsiSelected() {
      let selected = this.allocate.selected;

      if (selected.hasOwnProperty("imsi")) {
        return true;
      }

      return false;
    },
    allocateItemSelected(item) {
      item.selected = true;
      if (item.selected == true) {
        this.allocate.selected = item;
      } else {
        this.allocate.selected = {};
      }
      console.log(`selected item: ${JSON.stringify(this.allocate.selected)}`);
    },
    allocateSubscriber() {
      this.allocate.plmn = "";
      this.allocate.apn = "";
      this.allocate.name = "";
      this.allocate.sub_idx = 0;
      this.allocate.key_idx = 0;

      for (let i = 0; i < this.subs.records.length; i++) {
        if (this.subs.records[i].idx > this.card.record.boot_mark) {
          this.allocate.sub_idxs.push(this.subs.records[i].idx);
          if (this.allocate.sub_idx == 0) {
            if (this.subs.records[i].imsi == "") {
              this.allocate.sub_idx = this.subs.records[i].idx;
            }
          }
        }
      }

      for (let i = 0; i < this.keys.records.length; i++) {
        if (this.keys.records[i].idx > this.card.record.boot_mark) {
          this.allocate.key_idxs.push(this.keys.records[i].idx);
          if (this.allocate.key_idx == 0) {
            if (this.keys.records[i].ki == "00000000000000000000000000000000") {
              this.allocate.key_idx = this.keys.records[i].idx;
            }
          }
        }
      }

      this.$axios.$get(`/api/v1/subscribers/meta`).then((lmeta) => {
        let lheaders = [];
        let leditedItem = {};
        let ldefaultItem = {};

        for (const key of Object.keys(lmeta.keys)) {
          let lheader = {
            text: "",
            align: "",
            sortable: true,
            value: "",
            type: "",
          };

          if (key != "state" && key != "imsi" && key != "mcc") {
            continue;
          }

          lheader.value = key;
          lheader.align = lmeta.keys[key].align;
          lheader.text = lmeta.keys[key].desc;
          lheader.type = lmeta.keys[key].type;
          lheader.default = lmeta.keys[key].default;
          // add default value
          ldefaultItem[key] = lheader.default;

          if (lheader.type == "number") {
            leditedItem[key] = 0;
          } else {
            leditedItem[key] = "";
          }

          lheaders.push(lheader);
        }

        const llist = {};

        this.$axios.$post(`/api/v1/subscribers/list`, llist).then((ldata) => {
          this.allocate.meta = lmeta;
          this.allocate.headers = lheaders;
          this.allocate.records = ldata;
          this.allocate.loading = false;
        });
      });

      this.allocate.dialog = true;
    },
    async saveAllocate() {
      console.log(`saveAllocate - enter`);
      let selected = this.allocate.selected;
      if (selected.hasOwnProperty("imsi") && this.allocate.sub_idx != 0 && this.allocate.key_idx != 0) {
        if (confirm(`Are you sure you want to allocate IMSI:${selected.imsi} at profile ${this.allocate.sub_idx} with key ${this.allocate.key_idx} ?`)) {
          let sub_pos = this.findSubRowByIdx(this.allocate.sub_idx);
          let key_pos = this.findKeysRowByIdx(this.allocate.key_idx);
          console.log(`saveAllocate - sub:${sub_pos} key:${key_pos}`);

          let sclone = Object.assign({}, this.subs.records[sub_pos]);
          console.log(`saveAllocate - sclone:${JSON.stringify(sclone)}`);
          sclone.used = 1;
          sclone.name = this.allocate.name == "" ? `Profile ${this.allocate.sub_idx}` : this.allocate.name;
          sclone.imsi = selected.imsi;
          sclone.imsi_range = 0;
          sclone.smsc = selected.smsc;
          sclone.mcc = "FFF";
          sclone.mnc = selected.mnc_len;

          sclone.plmn = this.allocate.plmn;
          sclone.apn = this.allocate.apn == "" ? `flolive.net` : this.allocate.apn;
          sclone.key_id = this.allocate.key_idx;
          this.subs.editedItem = sclone;
          this.setSubs();

          let kclone = Object.assign({}, this.keys.records[key_pos]);
          console.log(`saveAllocate - kclone:${JSON.stringify(kclone)}`);
          kclone.ki = selected.ki;
          kclone.opc = selected.opc;
          kclone.hsm_id = selected.hsm_id;

          this.keys.editedItem = kclone;
          this.setKeys();
        }
      }

      this.closeAllocate();

      return "";
    },

    hasSsModeChanged() {
      let changes = this.getCardChanges("actions", "change");
      if (changes.length > 0) {
        if (changes[0].data.mode != this.stateAsMode()) {
          return true;
        }
      }
      return false;
    },
    getSsMode() {
      let changes = this.getCardChanges("actions", "change");
      if (changes.length > 0) {
        return changes[0].data.mode;
      }
      return this.stateAsMode();
    },
    stateAsMode() {
      return this.card.record.state == 0 ? 0 : 1;
    },
    setSsMode(mode) {
      let changes = this.getCardChanges("actions", "change");
      if (changes.length > 0) {
        let change = changes[0];
        // if there is already a "change" action just set the mode
        change.data.mode = mode;
        // if we are back to original setup remove the change
        if (this.stateAsMode() == mode && change.data.idx == this.card.record.last_sid) {
          this.removeCardChange("actions", "change");
        }
      } else {
        if (this.stateAsMode() != mode) {
          // if this is a new change add it if there is a change in mode from original
          this.setCardChanges("actions", "change", {
            cmd: "change",
            idx: this.card.record.last_sid,
            mode: mode,
          });
        }
      }
      this.actionVersion++;
      this.totalVersion++;
    },
    getProfileId() {
      let changes = this.getCardChanges("actions", "change");
      if (changes.length > 0) {
        return changes[0].data.idx;
      }

      return this.card.record.last_sid;
    },
    setProfileId(id) {
      console.log(`setProfileId - enter ${id}`);
      // get all change of type "change"
      let changes = this.getCardChanges("actions", "change");
      console.log(`setProfileId - changes - before:${JSON.stringify(changes)}`);

      if (changes.length > 0) {
        let change = changes[0];
        change.data.idx = id;
        console.log(`setProfileId state:${this.card.record.state} mode: ${change.data.mode}`);
        if (this.card.record.last_sid == id && this.stateAsMode() == change.data.mode) {
          this.removeCardChange("actions", "change");
        }
      } else {
        if (this.card.record.last_sid != id) {
          // only if it is diffrent the current profile id
          this.setCardChanges("actions", "change", {
            cmd: "change",
            idx: id,
            mode: this.card.record.state == 0 ? 0 : 1,
          });
        }
      }

      this.actionVersion++;
      this.totalVersion++;
    },
    hasProfileChanged() {
      let changes = this.getCardChanges("actions", "change");
      if (changes.length > 0) {
        if (changes[0].data.idx != this.card.record.last_sid) {
          return true;
        }
      }
      return false;
    },
    getFlushSubs() {
      return !this.flush_subs;
    },
    setFlushSubs(flush) {
      this.flush_subs = !flush;
    },
    getRescanMode() {
      let changes = this.getCardChanges("actions", "rescan");
      if (changes.length) {
        return true;
      } else {
        return false;
      }
    },
    setRescanMode(rescan) {
      this.getCardChanges("actions", "rescan");
      this.removeCardChange("actions", "rescan");

      // if no rescan remove it
      if (rescan) {
        this.setCardChanges("actions", "rescan", {
          cmd: "rescan",
        });
      }
      this.actionVersion++;
    },
    getRefreshMode() {
      let changes = this.getCardChanges("actions", "refresh");
      if (!changes.length) {
        return "FF";
      } else {
        let change = changes[0];
        return change.data.type;
      }
    },
    setRefreshMode(type) {
      console.log(`card - setRefreshMode - enter ${type}`);
      let changes = this.getCardChanges("actions", "refresh");
      console.log(`card - setRefreshMode - changes - before:${JSON.stringify(changes)}`);

      // if type non remove it
      if (changes.length > 0) {
        if (type == "FF") {
          this.removeCardChange("actions", "refresh");
        } else {
          let change = changes[0];
          change.data.type = type;
        }
      } else {
        this.setCardChanges("actions", "refresh", {
          cmd: "refresh",
          type: type,
        });
      }

      this.totalVersion++;
      this.actionVersion++;

      changes = this.getCardChanges();
      console.log(`card - setSsMode - changes - after:${JSON.stringify(changes)}`);
    },
    changeSubsManual(item) {
      console.log(`changeSubsManual iccid:${this.card.record.iccid}`);
      const command = {
        ota: [
          { cmd: "change", id: item.idx },
          { cmd: "refresh", type: 4 },
        ],
      };
      this.sendOtaCommand(this.card.record.iccid, command);
    },
    changeSubsStartFrom(item) {
      console.log(`changeSubsManual iccid:${this.card.record.iccid}`);
      const command = {
        ota: [
          { cmd: "change", id: item.idx },
          { cmd: "change", id: 0 },
        ],
      };
      this.sendOtaCommand(this.card.record.iccid, command);
    },
    getChangedColor() {
      if (this.getOtaState() == "edit") {
        return "warning";
      }
      if (this.isOtaResponseError()) {
        return "error";
      }
      return "accent";
    },
    listSubscribersInUse() {
      let used = this.subs.records.filter((s) => s.used);
      let mapped = used.map((u) => {
        return { key: u.idx, value: `${u.idx}: ${u.name}`, dirty: 0 };
      });
      let schanges = this.getCardChanges("subs");
      if (schanges.length > 0) {
        // remove changed to unused
        // add changed to used
        for (let i = 0; i < schanges.length; i++) {
          let sc = schanges[i];
          let f = mapped.filter((m) => m.key == sc.data.idx);
          if (f.length > 0) {
            if (sc.data.used == 0) {
              f[0].dirty = 1;
            }
          } else {
            mapped.push({
              key: sc.data.idx,
              value: `${sc.data.idx}: ${sc.data.name}`,
              dirty: 0,
            });
          }
        }
      }
      let flist = mapped.filter((s) => s.dirty == 0);
      flist.sort((a, b) => a.key - b.key);
      return flist;
    },

    async updateCardOtaState(state) {
      console.log(`updateCardOtaState iccid:${this.card.record.iccid} state:${state}`);

      let card = {
        id: this.card.record.id,
        iccid: this.card.record.iccid,
        action: state,
      };

      if (state === "wait" || state === "sync" || state === "dbonly") {
        if (this.card.record.ota_stack) {
          let lota_stack = Object.assign({}, this.card.record.ota_stack);
          card["update"] = lota_stack;
        }
      }

      console.log(`card - updateCardOtaState - ${JSON.stringify(card)}`);
      try {
        this.updateInProgress = true;
        let lupdate = await this.$axios.$put(`/api/v1/cards/update`, card);
        this.updateInProgress = false;
        this.card.record = lupdate;
        this.ota_stack_version++;
      } catch (err) {
        console.log(`updateCardOtaState - error: ${err}`);
        let aerr = this.parseNetError(err);
        console.log(`updateCardOtaState - application error: ${JSON.stringify(aerr)}`);
        this.tellUser("error", `${aerr.statusCode} - ${aerr.message}`);
        this.updateInProgress = false;
        return "FAIL";
      }
      return "OK";
    },
    async updateCardAttr() {
      console.log(`updateCardAttr iccid:${this.card.record.iccid}`);

      let card = {
        id: this.card.record.id,
        attr: this.card.record.attr,
      };

      console.log(`updateCardAttr card:${JSON.stringify(card)}`);
      try {
        await this.$axios.$put(`/api/v1/cards/${this.card.record.id}`, card);
      } catch (err) {
        console.log(`updateCardAttr - error: ${err}`);
        let aerr = this.parseNetError(err);
        console.log(`updateCardAttr - application error: ${JSON.stringify(aerr)}`);
        this.tellUser("error", `${aerr.statusCode} - ${aerr.message}`);
        return "FAIL";
      }

      return "OK";
    },
    isValidOtaState() {
      switch (this.card.record.ota_state) {
        case "idle":
        case "edit":
        case "wait":
        case "sync":
          return true;
        default:
          return false;
      }
    },
    getCardStateStep() {
      switch (this.card.record.ota_state) {
        case "idle":
          return 1;
        case "edit":
          return 2;
        case "wait":
          return 3;
        case "sync":
          return 4;
        default:
          return 1;
      }
    },
    canEditCardKeys() {
      if (!this.canEditCard()) {
        return false;
      }
      if (this.keys.permissions.u == 1) {
        return true;
      }
      return false;
    },
    canEditCardSubs() {
      if (!this.canEditCard()) {
        return false;
      }
      if (this.subs.permissions.u == 1) {
        return true;
      }
      return false;
    },
    hasPermissionToEditSettings() {
      if (this.settings.permissions.u == 1) {
        return true;
      }

      return false;
    },
    canEditCardSettings(item) {
      if (item.store == "card") {
        if (!this.canEditCard()) {
          return false;
        }
      }

      if (this.hasPermissionToEditSettings()) {
        return true;
      }

      return false;
    },
    hasPermissionToEditCard() {
      if (this.card.permissions.u == 1) {
        return true;
      }
      return false;
    },
    canEditCard() {
      if (!this.hasPermissionToEditCard()) {
        return false;
      }
      let luser = this.$auth.user;
      if (this.card.record.ota_state === "edit" && this.card.record.ota_user === luser.email) {
        return true;
      } else if (this.card.record.ota_state === "wait" && this.card.record.ota_user === luser.email) {
        return true;
      } else if (this.card.record.ota_state === "sync" && this.card.record.ota_user === luser.email) {
        return true;
      } else if (this.card.record.ota_state === "dbonly" && this.card.record.ota_user === luser.email) {
        return true;
      }
    },
    onPreEdit(data) {
      console.log(`card - onPreEdit data:${JSON.stringify(data)}`);
      data.record.iccid = this.card.record.iccid;
    },
    onPreNew(data) {
      console.log(`card - onPreEdit data:${JSON.stringify(data)}`);
      data.record.iccid = this.card.record.iccid;
    },
    getKeyStoreStateColor(state) {
      let lstate = state.toLowerCase();
      switch (lstate) {
        case "active":
          return "success";
        case "replace":
        case "add":
        case "pending":
          return "warning";
        case "history":
          return "disabled";
        case "delete":
          return "error";
      }
    },
  },
};
</script>
