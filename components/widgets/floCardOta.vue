<template>
  <div class="flo-card-ota">
    <v-container fluid class="pa-0 ma-0">
      <v-row no-gutters>
        <v-col cols="12" class="mt-1">
          <v-container fluid class="ma-0 pa-0">
            <v-row no-gutters>
              <v-col cols="12" class="my-0 py-0">
                <v-row class="ma-0 pa-0 my-1">
                  <v-col cols="12" class="ma-0 pa-0">
                    <flo-expand title="Keys" :open="keys.open" :key="keys.key" :loading="keys.loading" elevation="5">
                      <template v-slot:title="{ title }">
                        <span class="title font-weight-regular mx-2">{{ title }}</span>
                        <template v-if="getCardChangeCount('keys') > 0">
                          <v-chip class="ma-1" outlined :color="`${getChangedColor()}`">
                            <v-avatar left>
                              <v-icon>mdi-sim</v-icon>
                            </v-avatar>
                            {{ getCardChangeCount("keys") == 1 ? `${getCardChangeCount("keys")} change` : `${getCardChangeCount("keys")} changes` }}
                          </v-chip>
                        </template>
                      </template>

                      <template v-slot:content="{}">
                        <div v-if="keys.loading == false" :key="`key-${keysVersion}`">
                          <v-data-table :headers="keys.headers" :items="keys.records" sort-by="id" calculate-widths class="resourcetable elevation-0" :footer-props="{ 'items-per-page-options': [10, 20, 30, 40, 50] }" :items-per-page="30" :search="keys.lookup" dense show-expand :expanded.sync="keys.expanded" :mobile-breakpoint="960">
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
                                <template v-if="$vuetify.breakpoint.mdAndUp">
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

                                          <v-btn :disabled="row.item.idx <= getBootMark()" class="my-2 mr-n1" color="primary" @click="editKeysItem(row.item)">
                                            <v-icon left>{{ canEditCard() ? "mdi-pencil" : "mdi-more" }}</v-icon
                                            >{{ canEditCard() ? "Edit" : "View" }}
                                          </v-btn>

                                          <v-tooltip right>
                                            <template v-slot:activator="{ on }">
                                              <v-btn v-if="keys.permissions.u == true" :disabled="!canEditCard() || row.item.idx <= getBootMark()" color="primary" class="my-2 mr-n1" @click="resetKeysItem(row.item)" v-on="on">
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

                                          <v-chip :disabled="disabled" v-if="row.item.idx == getLastKey()" class="ma-2" color="info">{{ row.item.idx }}</v-chip>
                                          <v-chip :disabled="disabled" v-else class="ma-2">{{ row.item.idx }}</v-chip>
                                        </v-badge>
                                        <template v-else>
                                          <v-chip :disabled="disabled" v-if="row.item.idx == getLastKey()" class="ma-2" color="info">{{ row.item.idx }}</v-chip>
                                          <v-chip :disabled="disabled" v-else class="ma-2">{{ row.item.idx }}</v-chip>
                                        </template>
                                      </template>
                                      <template v-else-if="header.value == 'ki'">{{ getKiOpcMask(row.item.ki) }}</template>
                                      <template v-else-if="header.value == 'opc'">{{ getKiOpcMask(row.item.opc) }}</template>
                                      <template v-else-if="header.value == 'hsm_id'">{{ getHsmName(row.item.hsm_id) }}</template>
                                      <template v-else>
                                        <span class>{{ row.item[header.value] }}</span>
                                      </template>
                                    </td>
                                  </tr>
                                  <tr v-if="getCardChange('keys', row.item.idx) !== null" :style="`background-color: ${$vuetify.theme.currentTheme[getChangedColor()]}19;`">
                                    <td v-for="header in row.headers" :key="`rkey-${row.index}-${header.value}`" :class="`text-${typeof header.align === 'undefined' ? 'center' : header.align}`">
                                      <template v-if="header.value == 'data-table-expand'"></template>

                                      <template v-else-if="header.value == 'action'">
                                        <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                                          <div class="flex-grow-1"></div>
                                          <v-btn :disabled="!canEditCard()" color="primary" class="my-2 mr-n1" @click="removeCardChange('keys', row.item.idx)">
                                            <v-icon>mdi-delete</v-icon>
                                          </v-btn>
                                        </v-container>
                                      </template>

                                      <template v-else-if="header.value == 'idx'">
                                        <template v-if="getCardChange('keys', row.item.idx) !== null">
                                          <v-icon :color="`${getChangedColor()}`">mdi-lan-pending</v-icon>
                                        </template>
                                      </template>
                                      <template v-else-if="header.value == 'hsm_id'">
                                        {{ getHsmName(getCardChange("keys", row.item.idx)[header.value]) }}
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

                                          <v-chip :disabled="disabled" v-if="row.item.idx == getLastKey()" class="ma-2" color="primary">{{ row.item.idx }}</v-chip>
                                          <v-chip :disabled="disabled" v-else class="ma-2">{{ row.item.idx }}</v-chip>
                                        </v-badge>
                                        <template v-else>
                                          <v-chip :disabled="disabled" v-if="row.item.idx == getLastKey()" class="ma-2" color="info">{{ row.item.idx }}</v-chip>
                                          <v-chip :disabled="disabled" v-else class="ma-2">{{ row.item.idx }}</v-chip>
                                        </template>
                                        <template v-if="getCardChange('keys', row.item.idx) !== null">
                                          <v-icon class="px-2" :color="`${getChangedColor()}`">mdi-lan-pending</v-icon>
                                        </template>
                                        <template v-if="row.item.ki == '00000000000000000000000000000000' && row.item.opc == '00000000000000000000000000000000'">
                                          <v-chip :disabled="disabled" label>NO</v-chip>
                                        </template>
                                        <template v-else>
                                          <v-chip :disabled="disabled" color="success" label>YES</v-chip>
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
                                                    <v-btn :disabled="row.item.idx <= getBootMark()" class="my-2 mr-n1" color="primary" fab small @click="editKeysItem(row.item)">
                                                      <v-icon>{{ canEditCard() ? "mdi-pencil" : "mdi-more" }}</v-icon>
                                                    </v-btn>

                                                    <v-btn v-if="keys.permissions.u == true" :disabled="!canEditCard() || row.item.idx <= getBootMark()" color="primary" @click="resetKeysItem(row.item)" fab small class="my-2 mr-n1">
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

                                                    <v-chip :disabled="disabled" v-if="row.item.idx == getLastKey()" class="ma-2" color="info">{{ row.item.idx }}</v-chip>
                                                    <v-chip :disabled="disabled" v-else class="ma-2">{{ row.item.idx }}</v-chip>
                                                  </v-badge>
                                                  <template v-else>
                                                    <v-chip :disabled="disabled" v-if="row.item.idx == getLastKey()" class="ma-2" color="info">{{ row.item.idx }}</v-chip>
                                                    <v-chip :disabled="disabled" v-else class="ma-2">{{ row.item.idx }}</v-chip>
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

                <v-row class="ma-0 pa-0 my-1">
                  <v-col cols="12" class="ma-0 pa-0">
                    <flo-expand title="Subscribers" :open="subs.open" :key="subs.key" :loading="subs.loading" elevation="5">
                      <template v-slot:title="{ title }">
                        <span class="title font-weight-regular mx-2">{{ title }} </span>
                        <template v-if="!getSubsChangeCount().startsWith('0')">
                          <v-chip :key="`sa-${subsVersion}-${actionVersion}`" class="ma-1" outlined :color="`${getChangedColor()}`">
                            <v-avatar left>
                              <v-icon>mdi-sim</v-icon>
                            </v-avatar>
                            {{ getSubsChangeCount() }}
                          </v-chip>
                        </template>
                      </template>

                      <template v-slot:content="{}">
                        <div v-if="subs.loading == false" :key="`sub-${subsVersion}`">
                          <v-data-table :headers="subs.headers" :items="subs.records" disable-sort calculate-widths class="resourcetable elevation-0" :footer-props="{ 'items-per-page-options': [10, 20, 30, 40, 50] }" :items-per-page="30" dense show-expand :expanded.sync="subs.expanded" :mobile-breakpoint="960">
                            <template v-slot:top>
                              <v-card flat>
                                <v-row no-gutters
                                  ><v-col cols="1" class="mx-3 my-0">
                                    <v-tooltip right>
                                      <template v-slot:activator="{ on }">
                                        <div v-on="on">
                                          <v-switch v-model="show_unused_subs" class="ma-0 pa-0 subheading font-weight-light" dense color="success" hide-details label="Unused"></v-switch>
                                        </div>
                                      </template>
                                      <span>Show unused subscribers</span>
                                    </v-tooltip>
                                  </v-col></v-row
                                >

                                <v-row no-gutters>
                                  <v-col cols="12" lg="2">
                                    <v-sheet :color="hasSsModeChanged() ? getChangedColorWithAlpha() : 'none'" :key="`sh-ssm-${actionVersion}`">
                                      <v-select dense :value="getSsMode()" :key="actionVersion" :items="subs.ssmode_items" :readonly="!canEditSsMode()" :disabled="!canEditSsMode() || disabled" item-text="value" item-value="key" required label="Subscriber Selection Mode" hint="Subscriber Selection Mode" :color="hasSsModeChanged() ? getChangedColor() : 'primary'" filled hide-details @change="setSsMode($event)" class="pa-2"></v-select>
                                    </v-sheet>
                                  </v-col>

                                  <v-col cols="12" lg="2">
                                    <v-sheet :color="hasProfileChanged() ? getChangedColorWithAlpha() : 'none'" :key="`sh-ss-${actionVersion}`">
                                      <v-select dense :value="getProfileId()" :items="listSubscribersInUse()" :readonly="!canEditSs()" :disabled="!canEditSs() || disabled" item-text="value" item-value="key" required label="Selected Subscriber" hint="Selected Subscriber" :color="hasProfileChanged() ? getChangedColor() : 'primary'" filled hide-details class="pa-2" @change="setProfileId($event)"></v-select>
                                    </v-sheet>
                                  </v-col>

                                  <v-col cols="12" lg="1">
                                    <v-card flat :disabled="disabled">
                                      <v-card-text class="ma-0 pa-0">
                                        <v-sheet :color="getRefreshMode() ? getChangedColorWithAlpha() : 'none'" :key="`sh-srefresh-${actionVersion}`">
                                          <v-container class="d-flex justify-center align-center ma-0 pa-0">
                                            <v-row no-gutters
                                              ><v-col cols="1" class="mx-3 my-0">
                                                <v-tooltip top>
                                                  <template v-slot:activator="{ on }">
                                                    <div v-on="on">
                                                      <v-switch color="success" :readonly="!canEditRefresh()" :disabled="!canEditRefresh()" :input-value="getRefreshMode()" label="Refresh" @change="setRefreshMode($event)"></v-switch>
                                                    </div>
                                                  </template>
                                                  <span>Refresh the card</span>
                                                </v-tooltip>
                                              </v-col></v-row
                                            >
                                          </v-container>
                                        </v-sheet>
                                      </v-card-text>
                                    </v-card>
                                  </v-col>

                                  <v-col cols="12" lg="1">
                                    <v-card flat :disabled="disabled">
                                      <v-card-text class="ma-0 pa-0">
                                        <v-sheet :color="getRescanMode() ? getChangedColorWithAlpha() : 'none'" :key="`sh-srescan-${actionVersion}`">
                                          <v-container class="d-flex justify-center align-center ma-0 pa-0">
                                            <v-row no-gutters
                                              ><v-col cols="1" class="mx-3 my-0">
                                                <v-tooltip top>
                                                  <template v-slot:activator="{ on }">
                                                    <div v-on="on">
                                                      <v-switch color="success" :readonly="!canEditRescan()" :disabled="!canEditRescan()" :input-value="getRescanMode()" label="Rescan" @change="setRescanMode($event)"></v-switch>
                                                    </div>
                                                  </template>
                                                  <span>Clear current location information from the card</span>
                                                </v-tooltip>
                                              </v-col></v-row
                                            >
                                          </v-container>
                                        </v-sheet>
                                      </v-card-text>
                                    </v-card>
                                  </v-col>

                                  <v-col cols="12" lg="1">
                                    <v-card flat v-if="canEditCard()" :disabled="disabled">
                                      <v-card-text class="ma-0 pa-0">
                                        <v-sheet :color="getFlushSubs() ? getChangedColorWithAlpha() : 'none'" :key="`sh-flush-${actionVersion}`">
                                          <v-container class="d-flex justify-center align-center ma-0 pa-0">
                                            <v-row no-gutters
                                              ><v-col cols="1" class="mx-3 my-0">
                                                <v-tooltip top>
                                                  <template v-slot:activator="{ on }">
                                                    <div v-on="on">
                                                      <v-switch color="success" :readonly="!canEditCard()" :disabled="campaign_lead_by == 'card' ? true : !canEditCard()" :input-value="getFlushSubs()" label="Differences" @change="setFlushSubs($event)"></v-switch>
                                                    </div>
                                                  </template>
                                                  <span>Flush {{ !flush_subs ? "all" : "" }} subscriber {{ !flush_subs ? "details" : "differences only" }}</span>
                                                </v-tooltip>
                                              </v-col></v-row
                                            >
                                          </v-container>
                                        </v-sheet>
                                      </v-card-text>
                                    </v-card>
                                  </v-col>
                                  <div class="flex-grow-1"></div>
                                  <v-col cols="12" lg="1" class="d-flex justify-center align-center mr-n5">
                                    <v-tooltip top>
                                      <template v-slot:activator="{ on }">
                                        <v-btn :disabled="!canEditCard() || disabled" color="primary" @click="allocateSubscriber()" v-on="on">
                                          <v-icon center>mdi-plus</v-icon>
                                        </v-btn>
                                      </template>
                                      <span>Allocate</span>
                                    </v-tooltip>
                                  </v-col>
                                </v-row>
                              </v-card>
                            </template>

                            <template v-slot:item="row">
                              <template v-if="show_unused_subs || row.item.used">
                                <template v-if="$vuetify.breakpoint.mdAndUp">
                                  <tr>
                                    <td v-for="header in row.headers" :key="`rsub-${row.index}-${header.value}`" :class="`text-${typeof header.align === 'undefined' ? 'center' : header.align}`">
                                      <template v-if="header.value == 'data-table-expand'">
                                        <template v-if="getCardChange('subs', row.item.idx) !== null">
                                          <v-icon :color="`${getChangedColor()}`">mdi-sim</v-icon>
                                        </template>
                                      </template>

                                      <template v-else-if="header.value == 'action'">
                                        <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                                          <div class="flex-grow-1"></div>
                                          <v-btn :disabled="row.item.idx <= getBootMark()" class="my-2 mr-n1" color="primary" @click="editSubsItem(row.item)">
                                            <v-icon left>{{ canEditCard() ? "mdi-pencil" : "mdi-more" }}</v-icon
                                            >{{ canEditCard() ? "Edit" : "View" }}
                                          </v-btn>
                                          <v-tooltip right>
                                            <template v-slot:activator="{ on }">
                                              <v-btn v-if="subs.permissions.u == true" :disabled="!canEditCard() || row.item.idx <= getBootMark() || disabled" color="primary" @click="resetSubsItem(row.item)" v-on="on" class="my-2 mr-n1">
                                                <v-icon>mdi-broom</v-icon>
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

                                          <v-chip :disabled="disabled" v-if="row.item.idx == getLastSid()" class="ma-2" color="info">{{ row.item.idx }}</v-chip>
                                          <v-chip :disabled="disabled" v-else class="ma-2" @click="onProfileClick(row.item)">{{ row.item.idx }}</v-chip>
                                        </v-badge>
                                        <template v-else>
                                          <v-chip :disabled="disabled" v-if="row.item.idx == getLastSid()" class="ma-2" color="info">{{ row.item.idx }}</v-chip>
                                          <v-chip :disabled="disabled" v-else class="ma-2" @click="onProfileClick(row.item)">{{ row.item.idx }}</v-chip>
                                        </template>
                                      </template>
                                      <template v-else-if="header.value == 'used'">
                                        <v-chip :disabled="disabled" color="success" label v-if="row.item.used">YES</v-chip>
                                        <v-chip :disabled="disabled" label v-else>NO</v-chip>
                                      </template>
                                      <template v-else-if="header.value == 'imsi' && row.item.imsi">
                                        <v-container class="d-flex flex-nowrap">
                                          <span class="align-self-center text-center ml-n3">{{ row.item.imsi }}</span>
                                          <v-btn
                                            class="ml-1"
                                            icon
                                            elevation="0"
                                            router
                                            :to="{
                                              path: '/resources/subscriber/',
                                              query: { imsi: row.item.imsi },
                                            }"
                                          >
                                            <v-icon center color="info">mdi-link</v-icon>
                                          </v-btn>
                                        </v-container>
                                      </template>
                                      <template v-else-if="header.value == 'mcc'">{{ beutifyMcc(row.item.mcc) }}</template>
                                      <template v-else-if="header.value == 'plmn'">{{ beutifyPlmn(row.item.plmn) }}</template>
                                      <template v-else-if="header.value == 'ts'">{{ helpers.getTsString(row.item.ts) }}</template>
                                      <template v-else>
                                        <span class>{{ row.item[header.value] }}</span>
                                      </template>
                                    </td>
                                  </tr>
                                  <tr v-if="getCardChange('subs', row.item.idx) !== null" :style="`background-color: ${$vuetify.theme.currentTheme[getChangedColor()]}19;`">
                                    <td v-for="header in row.headers" :key="`rsub-${row.index}-${header.value}`" :class="`text-${typeof header.align === 'undefined' ? 'center' : header.align}`">
                                      <template v-if="header.value == 'data-table-expand'"></template>

                                      <template v-else-if="header.value == 'action'">
                                        <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                                          <div class="flex-grow-1"></div>
                                          <v-btn :disabled="!canEditCard() || disabled" color="primary" class="my-2 mr-n1" @click="removeCardChange('subs', row.item.idx)">
                                            <v-icon>mdi-delete</v-icon>
                                          </v-btn>
                                        </v-container>
                                      </template>
                                      <template v-else-if="header.value == 'idx'">
                                        <template v-if="getCardChange('subs', row.item.idx) !== null">
                                          <v-icon :color="`${getChangedColor()}`">mdi-lan-pending</v-icon>
                                        </template>
                                      </template>
                                      <template v-else-if="header.value == 'used'">
                                        <template v-if="!getCardChange('subs', row.item.idx).hasOwnProperty('used')"></template>
                                        <v-chip color="success" label v-else-if="getCardChange('subs', row.item.idx).used">YES</v-chip>
                                        <v-chip label v-else>NO</v-chip>
                                      </template>
                                      <template v-else-if="header.value == 'mcc'">
                                        <span v-if="getCardChange('subs', row.item.idx)[header.value] != row.item[header.value]" class="font-italic font-weight-light font-weight-bold">{{ beutifyMcc(getCardChange("subs", row.item.idx).mcc) }}</span>
                                        <span v-else class>{{ beutifyMcc(getCardChange("subs", row.item.idx).mcc) }}</span>
                                      </template>

                                      <template v-else-if="header.value == 'plmn'">
                                        <span v-if="getCardChange('subs', row.item.idx)[header.value] != row.item[header.value]" class="font-italic font-weight-light font-weight-bold">{{ beutifyPlmn(getCardChange("subs", row.item.idx).plmn) }}</span>
                                        <span v-else class>{{ beutifyPlmn(getCardChange("subs", row.item.idx).plmn) }}</span>
                                      </template>
                                      <template v-else>
                                        <template v-if="getCardChange('subs', row.item.idx)[header.value] != row.item[header.value]">
                                          <span class="font-italic font-weight-bold">{{ getCardChange("subs", row.item.idx)[header.value] }}</span>
                                        </template>
                                        <template v-else>
                                          <span class>{{ getCardChange("subs", row.item.idx)[header.value] }}</span>
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
                                          <v-chip :disabled="disabled" v-if="row.item.idx == getLastSid()" class="ma-2" color="info">{{ row.item.idx }}</v-chip>
                                          <v-chip :disabled="disabled" v-else class="ma-2" @click="onProfileClick(item)">{{ row.item.idx }}</v-chip>
                                        </v-badge>
                                        <template v-else>
                                          <v-chip :disabled="disabled" v-if="row.item.idx == getLastSid()" class="ma-2" color="info">{{ row.item.idx }}</v-chip>
                                          <v-chip :disabled="disabled" v-else class="ma-2">{{ row.item.idx }}</v-chip>
                                        </template>
                                        <template v-if="getCardChange('subs', row.item.idx) !== null">
                                          <v-icon class="px-2" :color="`${getChangedColor()}`">mdi-lan-pending</v-icon>
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
                                                    <v-btn :disabled="row.item.idx <= getBootMark()" class="my-2 mr-n1" color="primary" @click="editSubsItem(row.item)" fab small>
                                                      <v-icon>{{ canEditCard() ? "mdi-pencil" : "mdi-more" }}</v-icon>
                                                    </v-btn>

                                                    <v-btn v-if="subs.permissions.u == true" :disabled="!canEditCard() || row.item.idx <= getBootMark()" color="primary" @click="resetSubsItem(row.item)" fab small class="my-2 mr-n1">
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

                                                      <v-chip :disabled="disabled" v-if="row.item.idx == getLastSid()" class="ma-2" color="info">{{ row.item.idx }}</v-chip>
                                                      <v-chip :disabled="disabled" v-else class="ma-2" @click="onProfileClick(row.item)">{{ row.item.idx }}</v-chip>
                                                    </v-badge>
                                                    <template v-else>
                                                      <v-chip :disabled="disabled" v-if="row.item.idx == getLastSid()" class="ma-2" color="info">{{ row.item.idx }}</v-chip>
                                                      <v-chip :disabled="disabled" v-else class="ma-2" @click="onProfileClick(row.item)">{{ row.item.idx }}</v-chip>
                                                    </template>
                                                  </template>
                                                  <template v-else-if="header.value == 'used'">
                                                    <v-chip color="success" label v-if="row.item.used">YES</v-chip>
                                                    <v-chip label v-else>NO</v-chip>
                                                  </template>
                                                  <template v-else-if="header.value == 'imsi' && row.item.imsi">
                                                    <v-container class="d-flex flex-nowrap">
                                                      <span class="align-self-center text-center">{{ row.item.imsi }}</span>
                                                      <v-btn
                                                        class="mr-n3"
                                                        icon
                                                        elevation="0"
                                                        router
                                                        :to="{
                                                          path: '/resources/subscriber/',
                                                          query: { imsi: row.item.imsi },
                                                        }"
                                                      >
                                                        <v-icon center color="info">mdi-link</v-icon>
                                                      </v-btn>
                                                    </v-container>
                                                  </template>
                                                  <template v-else-if="header.value == 'mcc'">{{ beutifyMcc(row.item.mcc) }}</template>
                                                  <template v-else-if="header.value == 'plmn'">{{ beutifyPlmn(row.item.plmn) }}</template>
                                                  <template v-else-if="header.value == 'ts'">{{ helpers.getTsString(row.item.ts) }}</template>
                                                  <template v-else>
                                                    <span class>{{ row.item[header.value] }}</span>
                                                  </template>
                                                </v-list-item-action>
                                              </v-list-item>
                                              <template v-if="header.value != 'idx'">
                                                <template v-if="getCardChange('subs', row.item.idx) !== null">
                                                  <template v-if="getCardChange('subs', row.item.idx)[header.value] != row.item[header.value]">
                                                    <v-list-item :key="`rsub-${row.index}-${header.value}`">
                                                      <v-list-item-content class="ma-0 pa-0">
                                                        <v-list-item-subtitle>
                                                          <v-icon class="px-2" :color="`${getChangedColor()}`">mdi-lan-pending</v-icon>
                                                        </v-list-item-subtitle>
                                                      </v-list-item-content>
                                                      <v-list-item-action>
                                                        <template v-if="header.value == 'used'">
                                                          <v-chip color="success" label v-if="getCardChange('subs', row.item.idx).used">YES</v-chip>
                                                          <v-chip label v-else>NO</v-chip>
                                                        </template>
                                                        <template v-else-if="header.value == 'mcc'">{{ beutifyMcc(getCardChange("subs", row.item.idx).mcc) }}</template>
                                                        <template v-else-if="header.value == 'plmn'">{{ beutifyPlmn(getCardChange("subs", row.item.idx).plmn) }}</template>
                                                        <template v-else-if="header.value == 'ts'">{{ helpers.getTsString(getCardChange("subs", row.item.idx).ts) }}</template>

                                                        <template v-else>
                                                          <template v-if="getCardChange('subs', row.item.idx)[header.value] != row.item[header.value]">
                                                            <span class="font-italic font-weight-bold">{{ getCardChange("subs", row.item.idx)[header.value] }}</span>
                                                          </template>
                                                          <template v-else>
                                                            <span class>{{ getCardChange("subs", row.item.idx)[header.value] }}</span>
                                                          </template>
                                                        </template>
                                                      </v-list-item-action>
                                                    </v-list-item>
                                                  </template>
                                                </template>
                                              </template>
                                              <v-divider :key="`d${row.index}-${header.value}`" class="mx-4"></v-divider>
                                            </template>
                                          </template>
                                          <template v-if="getCardChange('subs', row.item.idx) !== null"></template>
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

                <v-row class="ma-0 pa-0 my-1">
                  <v-col cols="12" class="ma-0 pa-0">
                    <flo-expand title="Settings" :open="settings.open" :key="settings.key" :loading="settings.loading" elevation="5">
                      <template v-slot:title="{ title }">
                        <span class="title font-weight-regular mx-2">{{ title }}</span>
                        <template v-if="getCardChangeCount('settings') > 0">
                          <v-chip class="ma-1" outlined :color="`${getChangedColor()}`">
                            <v-avatar left>
                              <v-icon>mdi-sim</v-icon>
                            </v-avatar>
                            {{ getCardChangeCount("settings") == 1 ? `${getCardChangeCount("settings")} change` : `${getCardChangeCount("settings")} changes` }}
                          </v-chip>
                        </template>
                      </template>
                      <template v-slot:content="{}">
                        <div v-if="settings.loading == false" :key="`set-${settingsVersion}`">
                          <v-data-table :headers="settings.headers" :items="settings.records" sort-by="name" calculate-widths :footer-props="{ 'items-per-page-options': [10, 20, 30, 40, 50] }" :items-per-page="30" class="resourcetable elevation-0" :search="settings.lookup" dense show-expand :expanded.sync="settings.expanded" :mobile-breakpoint="960">
                            <template v-slot:top>
                              <v-toolbar flat dense>
                                <v-row no-gutters>
                                  <v-col cols="12" lg="3" xl="3" class="pa-1">
                                    <v-text-field v-model="settings.lookup" append-icon="mdi-magnify" label="Lookup" single-line hide-details></v-text-field>
                                  </v-col>
                                </v-row>

                                <v-dialog :overlay-opacity="0.4" v-model="settings.dialog" max-width="800px">
                                  <template v-if="settings.permissions.c == true" v-slot:activator="{ on }">
                                    <v-btn color="primary" dark class="mb-2" v-on="on">New Setting</v-btn>
                                  </template>
                                  <v-card>
                                    <v-card-title>
                                      <span class="headline">{{ formSettingsTitle }}</span>
                                    </v-card-title>

                                    <v-card-text>
                                      <v-container fluid class="ma-0 pa-1">
                                        <v-row no-gutters>
                                          <template v-for="(header, i) in settings.headers">
                                            <v-col v-if="header.value != 'action'" cols="12" lg="6" xl="6" class="pa-2" :key="'ht' + i">
                                              <template v-if="getParams().length > 0">
                                                <v-checkbox v-if="header.value == 'value'" @change="setParam($event, 'settings', i, header.value)" :input-value="getParam(i, 'settings', header.value)" :disabled="!canEditCard()" class="mb-1 ml-n1 subheading font-weight-light" color="success" label="Parameters" hide-details></v-checkbox>
                                              </template>

                                              <v-text-field v-if="header.value == 'name'" disabled v-model="settings.editedItem[header.value]" :label="header.text"></v-text-field>
                                              <v-select v-else-if="header.value == 'store'" disabled v-model="settings.editedItem[header.value]" :items="['card', 'server']" required :label="header.text" filled></v-select>
                                              <v-select v-else-if="header.value == 'type'" disabled v-model="settings.editedItem[header.value]" :items="['number', 'string']" required :label="header.text" filled></v-select>
                                              <v-text-field v-else-if="header.value == 'description'" disabled v-model="settings.editedItem[header.value]" :label="header.text"></v-text-field>
                                              <template v-else-if="header.value == 'value'">
                                                <v-select :key="settings.param_key" v-if="getParam(i, 'settings', header.value)" :value="getParamValue(header.value, 'settings')" @change="onParamChange($event, header.value, 'settings')" :items="getParams()" :label="getParamInfo(settings.editedItem[header.value]).desc" :type="getParamInfo(settings.editedItem[header.value]).type" :hint="getParamInfo(settings.editedItem[header.value]).hint" :disabled="!canEditCard()" item-text="desc" item-value="name" persistent-hint filled></v-select>
                                                <v-text-field v-else :value="getSettingsValue(settings.editedItem)" @change="setSettingsValue(settings.editedItem, $event)" :label="header.text" :disabled="!canEditCard()"></v-text-field>
                                              </template>
                                            </v-col>
                                          </template>
                                        </v-row>
                                      </v-container>
                                    </v-card-text>

                                    <v-card-actions>
                                      <div class="flex-grow-1"></div>
                                      <v-btn color="primary" text @click="closeSettings">Cancel</v-btn>
                                      <v-btn v-if="canEditCard()" color="primary" text @click="setSettings">Set</v-btn>
                                    </v-card-actions>
                                  </v-card>
                                </v-dialog>
                              </v-toolbar>
                            </template>

                            <template v-slot:item="row">
                              <template v-if="$vuetify.breakpoint.mdAndUp">
                                <tr>
                                  <td v-for="header in row.headers" :key="`rset-${row.index}-${header.value}`" :class="`text-${typeof header.align === 'undefined' ? 'center' : header.align}`">
                                    <template v-if="header.value == 'data-table-expand'">
                                      <template v-if="getCardChange('settings', row.item.name) !== null">
                                        <v-icon :color="`${getChangedColor()}`">mdi-sim</v-icon>
                                      </template>
                                    </template>

                                    <template v-else-if="header.value == 'action'">
                                      <div class="flex-grow-1"></div>
                                      <v-btn class="my-2 mr-n1" color="primary" @click="editSettingsItem(row.item)">
                                        <v-icon left>{{ canEditCard() ? "mdi-pencil" : "mdi-more" }}</v-icon
                                        >{{ canEditCard() ? "Edit" : "View" }}
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
                                <tr v-if="getCardChange('settings', row.item.name) !== null" :style="`background-color: ${$vuetify.theme.currentTheme[getChangedColor()]}19;`">
                                  <td v-for="header in row.headers" :key="`rset-${row.index}-${header.value}`" :class="`text-${typeof header.align === 'undefined' ? 'center' : header.align}`">
                                    <template v-if="header.value == 'data-table-expand'"></template>

                                    <template v-else-if="header.value == 'action'">
                                      <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                                        <div class="flex-grow-1"></div>
                                        <v-btn :disabled="!canEditCard()" color="primary" class="my-2 mr-n1" @click="removeCardChange('settings', row.item.name)">
                                          <v-icon>mdi-delete</v-icon>
                                        </v-btn>
                                      </v-container>
                                    </template>
                                    <template v-else-if="header.value == 'name'">
                                      <v-icon class="px-2" :color="`${getChangedColor()}`">mdi-lan-pending</v-icon>
                                    </template>
                                    <template v-else-if="header.value == 'value'">
                                      <template v-if="getCardChange('settings', row.item.name)[header.value] != row.item[header.value]">
                                        <span class="font-italic font-weight-bold">{{ getCardChange("settings", row.item.name)[header.value] }}</span>
                                      </template>
                                    </template>
                                    <template v-else-if="header.value == 'store'"
                                      ><v-chip class="text-capitalize" :color="row.item[header.value] == 'server' ? 'primary' : 'info'" label>{{ row.item[header.value] }}</v-chip></template
                                    >
                                    <template v-else-if="header.value == 'type'">
                                      <v-chip class="text-capitalize" :color="row.item[header.value] == 'number' ? 'primary' : 'info'" label>{{ row.item[header.value] }} </v-chip></template
                                    >
                                    <template v-else>
                                      {{ row.item[header.value] }}
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
                                                <v-list-item-title>{{ header.text }}</v-list-item-title>
                                              </v-list-item-content>
                                              <v-list-item-action>
                                                <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                                                  <v-btn fab small color="primary" @click="editSettingsItem(row.item)">
                                                    <v-icon>{{ canEditCard() ? "mdi-pencil" : "mdi-more" }}</v-icon>
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
                                                <template v-else-if="header.value == 'store'"
                                                  ><v-chip class="text-capitalize" :color="row.item[header.value] == 'server' ? 'primary' : 'info'" label>{{ row.item[header.value] }}</v-chip></template
                                                >
                                                <template v-else-if="header.value == 'type'">
                                                  <v-chip class="text-capitalize" :color="row.item[header.value] == 'number' ? 'primary' : 'info'" label>{{ row.item[header.value] }} </v-chip></template
                                                >
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
                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog :overlay-opacity="0.4" v-model="active.dialog" persistent max-width="500px">
      <v-card>
        <v-card-title>
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
    <v-dialog :overlay-opacity="0.4" v-model="allocate.dialog" scrollable max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">Add Subscriber</span>
        </v-card-title>

        <v-card-text>
          <v-container fluid class="ma-0 pa-1">
            <v-row no-gutters>
              <v-col cols="12" class="pa-2">
                <v-text-field v-model="allocate.name" :rules="[rules.name]" :label="'Name'"></v-text-field>
              </v-col>
              <v-col cols="12" lg="6" xl="6" class="pa-1">
                <v-combobox v-model="allocate.sub_idx" :rules="[rules.required]" :label="'Profile'" :items="allocate.sub_idxs" filled />
              </v-col>
              <v-col cols="12" lg="6" xl="6" class="pa-1">
                <v-combobox v-model="allocate.key_idx" :label="'Key'" :items="allocate.key_idxs" filled />
              </v-col>
              <v-col cols="12" lg="6" xl="6" class="pa-1">
                <v-text-field v-model="allocate.plmn" :rules="[rules.plmn]" :label="'PLMN'"></v-text-field>
              </v-col>
              <v-col cols="12" lg="6" xl="6" class="pa-1">
                <v-text-field v-model="allocate.apn" :label="'APN'"></v-text-field>
              </v-col>
              <v-col cols="12">
                <flo-meta-table resources="subscribers" sort-by="imsi" :show_title="false" disableNew disableExport @load-data="onLoadData($event)">
                  <template v-slot:view_state="{ fmtrow }">
                    <v-chip v-if="fmtrow.state == 'available'" label class="ma-2" color="success">{{ fmtrow.state }}</v-chip>
                    <v-chip v-else label class="ma-2" color="info">{{ fmtrow.state }}</v-chip>
                  </template>

                  <template v-slot:view_select="{ fmtrow }">
                    <v-checkbox :value="fmtrow.id === allocate.selected.id ? true : false" @change="allocateItemSelected(fmtrow)"></v-checkbox>
                  </template>
                </flo-meta-table>
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
    <v-dialog :overlay-opacity="0.4" v-model="keys.dialog" scrollable max-width="800px">
      <template v-if="keys.permissions.c == true" v-slot:activator="{ on }">
        <v-btn color="primary" dark class="mb-2" v-on="on">New {{ keys.resource }}</v-btn>
      </template>
      <v-card class="ma-0 pa-0">
        <v-card-title>
          <span class="headline">{{ formKeysTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container fluid class="ma-0 pa-1">
            <v-row no-gutters>
              <template v-for="(header, i) in keys.headers">
                <v-col v-if="header.value != 'action'" cols="12" lg="6" xl="6" class="pa-2" :key="'hk' + i">
                  <template v-if="getParams().length > 0">
                    <v-checkbox v-if="header.value != 'idx'" @change="setParam($event, 'keys', i, header.value)" :input-value="getParam(i, 'keys', header.value)" :disabled="!canEditCard()" class="mb-1 ml-n1 subheading font-weight-light" color="success" label="Parameters" hide-details></v-checkbox>
                  </template>
                  <v-text-field v-if="header.value == 'idx'" disabled v-model="keys.editedItem[header.value]" :label="header.text"></v-text-field>
                  <template v-else-if="header.value == 'opc'">
                    <v-select :key="keys.param_key" v-if="getParam(i, 'keys', header.value)" :value="getParamValue(header.value, 'keys')" @change="onParamChange($event, header.value, 'keys')" :items="getParams()" :label="getParamInfo(keys.editedItem[header.value]).desc" :type="getParamInfo(keys.editedItem[header.value]).type" :hint="getParamInfo(keys.editedItem[header.value]).hint" :disabled="!canEditCard()" item-text="desc" item-value="name" persistent-hint filled></v-select>
                    <v-text-field v-else v-model="keys.editedItem[header.value]" :rules="[rules.keys]" :append-icon="opc ? 'mdi-eye' : 'mdi-eye-off'" autocomplete="off" @click:append="opc = !opc" :type="opc ? 'text' : 'password'" :label="header.text" :hint="header.hint" :readonly="!canEditCard()" persistent-hint></v-text-field>
                  </template>
                  <template v-else-if="header.value == 'ki'">
                    <v-select :key="keys.param_key" v-if="getParam(i, 'keys', header.value)" :value="getParamValue(header.value, 'keys')" @change="onParamChange($event, header.value, 'keys')" :items="getParams()" :label="getParamInfo(keys.editedItem[header.value]).desc" :type="getParamInfo(keys.editedItem[header.value]).type" :hint="getParamInfo(keys.editedItem[header.value]).hint" :disabled="!canEditCard()" item-text="desc" item-value="name" persistent-hint filled></v-select>
                    <v-text-field v-else v-model="keys.editedItem[header.value]" :rules="[rules.keys]" :append-icon="ki ? 'mdi-eye' : 'mdi-eye-off'" autocomplete="off" @click:append="ki = !ki" :type="ki ? 'text' : 'password'" :label="header.text" :hint="header.hint" :readonly="!canEditCard()" persistent-hint></v-text-field>
                  </template>
                  <template v-else-if="header.value == 'hsm_id'">
                    <v-select :key="keys.param_key" v-if="getParam(i, 'keys', header.value)" :value="getParamValue(header.value, 'keys')" @change="onParamChange($event, header.value, 'keys')" :items="getParams()" :label="getParamInfo(keys.editedItem[header.value]).desc" :type="getParamInfo(keys.editedItem[header.value]).type" :hint="getParamInfo(keys.editedItem[header.value]).hint" :disabled="!canEditCard()" item-text="desc" item-value="name" persistent-hint filled></v-select>
                    <v-select v-else v-model="keys.editedItem[header.value]" :label="hsms.label" :hint="hsms.hint" :items="hsms.items" :rules="hsms.rule" :disabled="!canEditCard()" item-text="value" item-value="key" filled persistent-hint></v-select>
                  </template>
                </v-col>
              </template>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="closeKeys">Cancel</v-btn>
          <v-btn v-if="canEditCard()" color="primary" text @click="setKeys">Set</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog :overlay-opacity="0.4" v-model="subs.dialog" scrollable max-width="800px">
      <template v-if="subs.permissions.c == true" v-slot:activator="{ on }">
        <v-btn color="primary" dark class="mb-2" v-on="on">New {{ subs.resource }}</v-btn>
      </template>
      <v-card v-if="subs.dialog" class="ma-0 pa-0">
        <v-card-title>
          <span class="headline">{{ formSubsTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-container fluid class="ma-0 pa-1">
            <v-row no-gutters>
              <template v-for="(header, i) in subs.headers">
                <v-col v-if="header.value != 'action' && header.value != 'mcc'" cols="12" lg="6" xl="6" class="pa-2" :key="'hs' + i">
                  <template v-if="getParams().length > 0">
                    <v-checkbox v-if="header.value != 'used' && header.value != 'idx'" @change="setParam($event, 'subs', i, header.value)" :input-value="getParam(i, 'subs', header.value)" :disabled="!canEditCard()" class="mb-1 ml-n1 subheading font-weight-light" color="success" label="Parameters" hide-details></v-checkbox>
                  </template>

                  <v-switch v-if="header.value == 'used'" v-model="subs.editedItem[header.value]" color="success" inset :label="header.value" :disabled="!canEditCard()"></v-switch>
                  <v-text-field v-else-if="header.value == 'idx'" disabled v-model="subs.editedItem[header.value]" :label="header.text" :hint="header.hint" persistent-hint></v-text-field>

                  <template v-else-if="header.value == 'imsi'">
                    <v-select :key="subs.param_key" v-if="getParam(i, 'subs', header.value)" :value="getParamValue(header.value, 'subs')" @change="onParamChange($event, header.value, 'subs')" :items="getParams()" :label="getParamInfo(subs.editedItem[header.value]).desc" :type="getParamInfo(subs.editedItem[header.value]).type" :hint="getParamInfo(subs.editedItem[header.value]).hint" :disabled="!canEditCard()" item-text="desc" item-value="name" persistent-hint filled></v-select>
                    <v-text-field v-else :rules="[rules.imsi]" v-model="subs.editedItem[header.value]" :label="header.text" :hint="header.hint" :disabled="!canEditCard()" persistent-hint></v-text-field>
                  </template>

                  <template v-else-if="header.value == 'imsi_range'">
                    <v-select :key="subs.param_key" v-if="getParam(i, 'subs', header.value)" :value="getParamValue(header.value, 'subs')" @change="onParamChange($event, header.value, 'subs')" :items="getParams()" :label="getParamInfo(subs.editedItem[header.value]).desc" :type="getParamInfo(subs.editedItem[header.value]).type" :hint="getParamInfo(subs.editedItem[header.value]).hint" :disabled="!canEditCard()" item-text="desc" item-value="name" persistent-hint filled></v-select>
                    <v-text-field v-else :rules="[rules.imsi_range]" v-model="subs.editedItem[header.value]" :label="header.text" :hint="header.hint" :disabled="!canEditCard()" persistent-hint></v-text-field>
                  </template>

                  <template v-else-if="header.value == 'smsc'">
                    <v-select :key="subs.param_key" v-if="getParam(i, 'subs', header.value)" :value="getParamValue(header.value, 'subs')" @change="onParamChange($event, header.value, 'subs')" :items="getParams()" :label="getParamInfo(subs.editedItem[header.value]).desc" :type="getParamInfo(subs.editedItem[header.value]).type" :hint="getParamInfo(subs.editedItem[header.value]).hint" :disabled="!canEditCard()" item-text="desc" item-value="name" persistent-hint filled></v-select>
                    <v-text-field v-else :rules="[rules.smsc]" v-model="subs.editedItem[header.value]" :label="header.text" :hint="header.hint" :disabled="!canEditCard()" persistent-hint></v-text-field>
                  </template>

                  <template v-else-if="header.value == 'mnc'">
                    <v-select :key="subs.param_key" v-if="getParam(i, 'subs', header.value)" :value="getParamValue(header.value, 'subs')" @change="onParamChange($event, header.value, 'subs')" :items="getParams()" :label="getParamInfo(subs.editedItem[header.value]).desc" :type="getParamInfo(subs.editedItem[header.value]).type" :hint="getParamInfo(subs.editedItem[header.value]).hint" :disabled="!canEditCard()" item-text="desc" item-value="name" persistent-hint filled></v-select>
                    <v-text-field v-else :rules="[rules.mnc_len]" v-model="subs.editedItem[header.value]" :label="header.text" :hint="header.hint" :disabled="!canEditCard()" persistent-hint></v-text-field>
                  </template>

                  <template v-else-if="header.value == 'key_id'">
                    <v-select :key="subs.param_key" v-if="getParam(i, 'subs', header.value)" :value="getParamValue(header.value, 'subs')" @change="onParamChange($event, header.value, 'subs')" :items="getParams()" :label="getParamInfo(subs.editedItem[header.value]).desc" :type="getParamInfo(subs.editedItem[header.value]).type" :hint="getParamInfo(subs.editedItem[header.value]).hint" :disabled="!canEditCard()" item-text="desc" item-value="name" persistent-hint filled></v-select>
                    <v-select v-else v-model="subs.editedItem[header.value]" :label="header.text" :hint="header.hint" :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" filled :disabled="!canEditCard()" persistent-hint />
                  </template>

                  <template v-else-if="header.value == 'name'">
                    <v-select :key="subs.param_key" v-if="getParam(i, 'subs', header.value)" :value="getParamValue(header.value, 'subs')" @change="onParamChange($event, header.value, 'subs')" :items="getParams()" :label="getParamInfo(subs.editedItem[header.value]).desc" :type="getParamInfo(subs.editedItem[header.value]).type" :hint="getParamInfo(subs.editedItem[header.value]).hint" :disabled="!canEditCard()" item-text="desc" item-value="name" persistent-hint filled></v-select>
                    <v-text-field v-else v-model="subs.editedItem[header.value]" :label="header.text" :hint="header.hint" :disabled="!canEditCard()" persistent-hint></v-text-field>
                  </template>

                  <template v-else-if="header.value == 'apn'">
                    <v-select :key="subs.param_key" v-if="getParam(i, 'subs', header.value)" :value="getParamValue(header.value, 'subs')" @change="onParamChange($event, header.value, 'subs')" :items="getParams()" :label="getParamInfo(subs.editedItem[header.value]).desc" :type="getParamInfo(subs.editedItem[header.value]).type" :hint="getParamInfo(subs.editedItem[header.value]).hint" :disabled="!canEditCard()" item-text="desc" item-value="name" persistent-hint filled></v-select>
                    <v-select v-else v-model="subs.editedItem[header.value]" :label="header.text" :hint="header.hint" :disabled="!canEditCard()" :items="apns" item-text="value" item-value="key" persistent-hint filled></v-select>
                  </template>

                  <template v-else-if="header.value == 'fplmn'">
                    <v-select :key="subs.param_key" v-if="getParam(i, 'subs', header.value)" :value="getParamValue(header.value, 'subs')" @change="onParamChange($event, header.value, 'subs')" :items="getParams()" :label="getParamInfo(subs.editedItem[header.value]).desc" :type="getParamInfo(subs.editedItem[header.value]).type" :hint="getParamInfo(subs.editedItem[header.value]).hint" :disabled="!canEditCard()" item-text="desc" item-value="name" persistent-hint filled></v-select>
                    <v-text-field v-else v-model="subs.editedItem[header.value]" :label="header.text" :hint="header.hint" :rules="[rules.fplmn]" :disabled="!canEditCard()" persistent-hint></v-text-field>
                  </template>

                  <template v-else-if="header.value == 'ehplmn'">
                    <v-select :key="subs.param_key" v-if="getParam(i, 'subs', header.value)" :value="getParamValue(header.value, 'subs')" @change="onParamChange($event, header.value, 'subs')" :items="getParams()" :label="getParamInfo(subs.editedItem[header.value]).desc" :type="getParamInfo(subs.editedItem[header.value]).type" :hint="getParamInfo(subs.editedItem[header.value]).hint" :disabled="!canEditCard()" item-text="desc" item-value="name" persistent-hint filled></v-select>
                    <v-text-field v-else v-model="subs.editedItem[header.value]" :label="header.text" :hint="header.hint" :rules="[rules.ehplmn]" :disabled="!canEditCard()" persistent-hint></v-text-field>
                  </template>

                  <template v-else-if="header.value == 'lrplmnsi'">
                    <v-select :key="subs.param_key" v-if="getParam(i, 'subs', header.value)" :value="getParamValue(header.value, 'subs')" @change="onParamChange($event, header.value, 'subs')" :items="getParams()" :label="getParamInfo(subs.editedItem[header.value]).desc" :type="getParamInfo(subs.editedItem[header.value]).type" :hint="getParamInfo(subs.editedItem[header.value]).hint" :disabled="!canEditCard()" item-text="desc" item-value="name" persistent-hint filled></v-select>
                    <v-switch v-else v-model="subs.editedItem[header.value]" :label="header.text" :hint="header.hint" :disabled="!canEditCard()" :true-value="1" :false-value="0" inset color="success" persistent-hint></v-switch>
                  </template>

                  <template v-else-if="header.value == 'plmn'">
                    <v-select :key="subs.param_key" v-if="getParam(i, 'subs', header.value)" :value="getParamValue(header.value, 'subs')" @change="onParamChange($event, header.value, 'subs')" :items="getParams()" :label="getParamInfo(subs.editedItem[header.value]).desc" :type="getParamInfo(subs.editedItem[header.value]).type" :hint="getParamInfo(subs.editedItem[header.value]).hint" :disabled="!canEditCard()" item-text="desc" item-value="name" persistent-hint filled></v-select>
                    <v-text-field v-else :rules="[rules.plmn]" v-model="subs.editedItem[header.value]" :label="header.text" :hint="header.hint" :disabled="!canEditCard()" append-outer-icon="mdi-calculator" @click:append-outer="act_dialog = true" persistent-hint></v-text-field>

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

                  <v-text-field v-else v-model="subs.editedItem[header.value]" :label="header.text" :disabled="!canEditCard()"></v-text-field>
                </v-col>
              </template>
            </v-row>
            <flo-mcc-list v-model="subs.editedItem.mcc" :disabled="!canEditCard()" :length="6" />
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="closeSubs">Cancel</v-btn>
          <v-btn v-if="canEditCard()" color="primary" text @click="setSubs">Set</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import OTranslator from "~/src/otranslator.js";
import floMccList from "~/components/widgets/floMccList.vue";
import floExpand from "~/components/select/floExpand";
import floMetaTable from "~/components/crud/floMetaTable";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  name: "flo-card-ota",
  components: {
    floExpand,
    floMccList,
    floMetaTable,
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
  data: () => ({
    helpers,
    translator: null,
    flush_subs: false,
    show_unused_keys: false,
    show_unused_subs: false,
    show_unused_settings: false,
    act_dialog: false,
    keysVersion: 0,
    subsVersion: 0,
    settingsVersion: 0,
    actionVersion: 0,
    totalVersion: 0,
    ki: 0,
    opc: 0,
    mcc_key: 1,
    hsms: {
      label: "HSM",
      hint: "Hardware Security Module",
      items: [],
      value: false,
    },
    rules: {
      name: (v) => {
        const pattern = /^[^\\s].+[^\\s]$/;
        return pattern.test(v) || "Invalid Name format.";
      },
      required: (v) => !!v || "Required.",
      counter: (v) => v.length <= 20 || "Max 20 characters",
      email: (v) => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(v) || "Invalid e-mail.";
      },
      imsi: (v) => {
        const pattern = /^[0-9]{15}$/;
        return pattern.test(v) || "Invalid IMSI format.";
      },
      imsi_range: (v) => {
        const pattern = /^[0-9]{0,10}$/;
        return pattern.test(v) || "Invalid IMSI Range format.";
      },
      smsc: (v) => {
        const pattern = /^[0-9]{0,32}$/;
        return pattern.test(v) || "Invalid SMSC format.";
      },
      used: (v) => {
        return (v >= 0 && v < 2) || "Invalid format.";
      },
      mcc: (v) => {
        const pattern = /^[0-9A-Fa-f]{3}$/;
        return pattern.test(v) || "Invalid MCC format.";
      },
      mnc: (v) => {
        const pattern = /^[0-9]{3}$/;
        return pattern.test(v) || "Invalid MNC format.";
      },
      mnc_len: (v) => {
        const pattern = /^[1-3]$/;
        return pattern.test(v) || "Invalid MNC length format.";
      },
      hex32: (v) => {
        const pattern = /^[0-9A-F]{32}$/;
        return pattern.test(v) || "Invalid key format.";
      },
      keys: (v) => {
        const pattern = /^.*$/;
        return pattern.test(v) || "Invalid key format.";
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
      dec1til10: (v) => {
        return (v > 0 && v <= 10) || "Invalid key format.";
      },
    },
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
        attr: {},
      },
      user_ota_command: null,
    },
    actions: {},
    operation: [],
    val_type: [],
    apns: [],
    subs: {
      resource: "card_sub",
      resources: "card_subs",
      ssmode_items: [
        { key: 0, value: "Manual" },
        { key: 1, value: "Automatic" },
      ],
      permissions: { c: 0, r: 0, u: 0, d: 0 },
      expanded: [],
      meta: [],
      headers: [],
      records: [],
      lookup: "",
      editedIndex: -1,
      editedItem: {},
      dialog: false,
      loading: true,
      open: false,
      key: 1,
      param_key: 1,
    },
    keys: {
      resource: "card_key",
      resources: "card_keys",
      permissions: { c: 0, r: 0, u: 0, d: 0 },
      expanded: [],
      meta: [],
      headers: [],
      records: [],
      lookup: "",
      editedIndex: -1,
      dialog: false,
      loading: true,
      open: false,
      key: 1,
      param_key: 1,
    },
    settings: {
      resource: "card_setting",
      resources: "card_settings",
      permissions: { c: 0, r: 0, u: 0, d: 0 },
      expanded: [],
      meta: [],
      headers: [],
      records: [],
      lookup: "",
      editedIndex: -1,
      dialog: false,
      loading: true,
      open: false,
      key: 1,
      param_key: 1,
    },
    active: {
      dialog: false,
      imsi: "",
      imsis: [],
      mccmnc: "",
    },
  }),
  props: {
    campaign_lead_by: {
      type: String,
      default: "",
      required: false,
    },
    iccid: {
      type: String,
      default: "",
    },
    value: {
      type: [Object, Array],
      default: null,
    },
    transport: {
      type: String,
      required: true,
      default: "",
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    parameters: {
      type: Array,
      required: false,
      default: () => [],
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
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
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
        this.$emit("sync");
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
    getHsmName(hsm_id) {
      let hsm_name = this.hsms.items.filter((item) => item.key == hsm_id);
      if (hsm_name.length > 0) {
        return hsm_name[0].value;
      } else {
        return "";
      }
    },
    formatSettingsValue(item) {
      switch (item.name) {
        case "inactive_to":
        case "boot_wait_ota_to":
        case "boot_sleep_to":
        case "boot_disconnected_to":
        case "boot_disconnect_timeout":
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
        case "boot_disconnect_timeout":
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
        case "boot_disconnect_timeout":
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
    getParam(i, type, value) {
      let l_edited_idx = this[type].editedIndex + 1;

      let found = this.val_type.find((f) => f.i == i && f.type == type && f.idx == l_edited_idx);
      if (found) {
        return found.val;
      }

      if (value) {
        let l_val = this[type].editedItem[value];
        if (typeof l_val == "string") {
          if (l_val.startsWith("@")) {
            return 1;
          }
          return 0;
        }
      }

      return 0;
    },
    setParam(event, type, i, value) {
      console.log(`flo-card-ota - setParam - event: ${JSON.stringify(event)}, type: ${JSON.stringify(type)}, value: ${JSON.stringify(value)}`);
      let l_edited_idx = this[type].editedIndex + 1;
      let l_val_type = { i: i, idx: l_edited_idx, type: type, val: event ? 1 : 0 };
      let l_idx = this.val_type.findIndex((f) => f.i == i);

      if (l_idx != -1) {
        this.val_type.splice(l_idx, 1);
        this.val_type.push(l_val_type);
      } else {
        this.val_type.push(l_val_type);
      }

      if (!event) {
        if (type != "settings") {
          let l_backup_record = this[type].records.find((f) => f.idx == l_edited_idx);
          this[type].editedItem[value] = l_backup_record[value];
        } else {
          let l_backup_record = this[type].records.find((f) => f.name == this[type].editedItem.name);
          this[type].editedItem[value] = l_backup_record[value];
        }
      }
    },
    onParamChange(event, value, type) {
      console.log(`flo-card-ota - onParamChange - value: ${JSON.stringify(value)}, event: ${JSON.stringify(event)}`);
      if (this.parameters.length > 0) {
        if (event) {
          this[type].editedItem[value] = `@${event}`;
        }
      }
      this[type].param_key++;
    },
    getParamValue(value, type) {
      if (value) {
        let l_val = this[type].editedItem[value];
        if (typeof l_val == "string") {
          if (l_val.startsWith("@")) {
            l_val = l_val.substring(1);
          }
        }

        return l_val;
      }
    },
    getParams() {
      let l_params = [];

      if (this.parameters.length > 0) {
        l_params = this.parameters;
      }

      return l_params;
    },
    getParamInfo(val) {
      let l_info = {
        name: "",
        default: "",
        desc: "Parameter",
        hint: "Please Select Parameter",
        type: "string",
      };
      let l_val = val;
      if (this.getParams().length > 0) {
        if (l_val) {
          if (typeof l_val == "string") {
            if (l_val.startsWith("@")) {
              l_val = l_val.substring(1);
            }
          }

          let found = this.getParams().find((f) => f.name == l_val);
          if (found) {
            l_info = found;
          }
        }
      }

      return l_info;
    },
    async loadCardSubscribers() {
      let user_permissions = this.$store.state.session.permissions;
      this.subs.permissions = user_permissions.find((p) => this.subs.resources.toLowerCase() == p.res);

      try {
        let lmeta = await this.$axios.$get(`/api/v1/card_subs/meta`);

        let lheaders = [];
        let leditedItem = {};
        let ldefaultItem = {};

        for (let key of Object.keys(lmeta.keys)) {
          let lheader = {
            text: "",
            align: "",
            sortable: false,
            value: "",
            type: "",
            hint: "",
          };

          if (key == "iccid" || key == "id" || key == "ts") {
            continue;
          }

          if (key == "idx") {
            lheader.width = "5%";
          }

          lheader.value = key;
          lheader.align = lmeta.keys[key].align;
          lheader.text = lmeta.keys[key].desc;
          lheader.type = lmeta.keys[key].type;
          lheader.hint = lmeta.keys[key].hint;
          lheader.default = lmeta.keys[key].default;

          if (key == "used") {
            lheader.align = "left";
          }

          ldefaultItem[key] = lheader.default;
          leditedItem[key] = lheader.type == "number" ? 0 : "";

          lheaders.push(lheader);
        }

        lheaders.push({
          text: "Actions",
          value: "action",
          sortable: false,
          align: "right",
        });

        let llist = {
          where: [
            {
              k: "iccid",
              op: "equal",
              v: this.card.record.iccid,
            },
          ],
        };

        let ldata = await this.$axios.$post(`/api/v1/card_subs/list`, llist);

        this.subs.meta = lmeta;
        this.subs.headers = lheaders;
        this.subs.records = ldata;
        this.subs.editedItem = leditedItem;
        this.subs.defaultItem = ldefaultItem;
        this.subs.loading = false;
        let subs = this.getCardChanges("subs");
        if (subs.length > 0) {
          let usedSubs = this.subs.records.filter((f) => f.used);
          let max = Math.max(...usedSubs.map((sub) => sub.idx));
          if (subs.some((sub) => sub.data.idx > max)) {
            this.show_unused_subs = true;
          }
        }
      } catch (err) {
        console.log(err);
        this.subs.loading = false;
      }
    },
    async loadCardKeys() {
      let user_permissions = this.$store.state.session.permissions;
      this.keys.permissions = user_permissions.find((p) => this.keys.resources.toLowerCase() == p.res);

      try {
        let lmeta = await this.$axios.$get(`/api/v1/card_keys/meta`);

        let lheaders = [];
        let leditedItem = {};
        let ldefaultItem = {};

        for (let key of Object.keys(lmeta.keys)) {
          if (key == "iccid" || key == "id" || key == "ts") {
            continue;
          }

          let lheader = {
            text: "",
            align: "center",
            sortable: false,
            value: "",
            type: "",
            hint: "",
          };

          if (key == "idx") {
            lheader.width = "5%";
          }

          lheader.value = key;
          lheader.text = lmeta.keys[key].desc;
          lheader.type = lmeta.keys[key].type;
          lheader.hint = lmeta.keys[key].hint;
          lheader.default = lmeta.keys[key].default;
          ldefaultItem[key] = lheader.default;

          leditedItem[key] = lheader.type == "number" ? 0 : "";

          lheaders.push(lheader);
        }

        lheaders.push({
          text: "Actions",
          value: "action",
          sortable: false,
          align: "right",
        });

        let llist = {
          where: [
            {
              k: "iccid",
              op: "equal",
              v: this.iccid,
            },
          ],
        };

        let ldata = await this.$axios.$post(`/api/v1/card_keys/list`, llist);

        this.keys.meta = lmeta;
        this.keys.headers = lheaders;
        this.keys.records = ldata;
        this.keys.editedItem = leditedItem;
        this.keys.defaultItem = ldefaultItem;
        this.keys.loading = false;
        let keys = this.getCardChanges("keys");
        if (keys.length > 0) {
          let found = keys.find((f) => f.data.idx == this.getLastKey());
          if (found && keys.length > 1) {
            this.show_unused_keys = true;
          } else if (found == undefined && keys.length > 0) {
            this.show_unused_keys = true;
          }
        }
      } catch (err) {
        console.log(err);
        this.keys.loading = false;
      }
    },
    async loadCardSettings() {
      let user_permissions = this.$store.state.session.permissions;
      this.settings.permissions = user_permissions.find((p) => this.settings.resources.toLowerCase() == p.res);

      try {
        let lmeta = await this.$axios.$get(`/api/v1/card_settings/meta`);
        let lheaders = [];
        let leditedItem = {};
        let ldefaultItem = {};

        for (let key of Object.keys(lmeta.keys)) {
          if (key == "iccid" || key == "id" || key == "ts") {
            continue;
          }

          let lheader = {
            text: "",
            align: "center",
            sortable: false,
            value: "",
            type: "",
            hint: "",
          };

          lheader.value = key;
          lheader.text = lmeta.keys[key].desc;
          lheader.type = lmeta.keys[key].type;
          lheader.hint = lmeta.keys[key].hint;
          lheader.default = lmeta.keys[key].default;
          ldefaultItem[key] = lheader.default;

          leditedItem[key] = lheader.type == "number" ? 0 : "";

          lheaders.push(lheader);
        }

        lheaders.push({
          text: "Actions",
          value: "action",
          sortable: false,
          align: "right",
        });

        let llist = {
          where: [
            {
              k: "iccid",
              op: "equal",
              v: this.iccid,
            },
          ],
        };

        let ldata = await this.$axios.$post(`/api/v1/card_settings/list`, llist);

        this.settings.meta = lmeta;
        this.settings.headers = lheaders;
        this.settings.records = ldata;
        this.settings.editedItem = leditedItem;
        this.settings.defaultItem = ldefaultItem;
        this.settings.loading = false;
      } catch (err) {
        console.log(err);
        this.settings.loading = false;
      }
    },
    async loadCard() {
      let user_permissions = this.$store.state.session.permissions;
      this.card.permissions = user_permissions.find((p) => this.card.resources.toLowerCase() == p.res);

      try {
        let lmeta = await this.$axios.$get(`/api/v1/cards/meta`);
        let lheaders = [];

        for (let key of Object.keys(lmeta.keys)) {
          let lheader = {
            text: "",
            align: "",
            sortable: true,
            value: "",
            type: "",
          };

          lheader.value = key;
          lheader.align = lmeta.keys[key].align;
          lheader.text = lmeta.keys[key].desc;
          lheader.type = lmeta.keys[key].type;
          lheader.default = lmeta.keys[key].default;
          lheader.width = lmeta.keys[key].width;

          lheaders.push(lheader);
        }

        let llist = {
          where: [
            {
              k: "iccid",
              op: "equal",
              v: this.iccid,
            },
          ],
        };

        let ldata = await this.$axios.$post(`/api/v1/cards/list`, llist);
        this.card.meta = lmeta;
        this.card.headers = lheaders;
        this.card.record = ldata[0];

        if (!this.isValidOtaState()) {
          this.card.record.ota_state = "idle";
        }

        this.card.loading = false;
      } catch (err) {
        console.log(err);
        this.card.loading = false;
      }
    },
    async loadHsm() {
      this.hsms.items = [];
      try {
        let hsm = await this.$axios.$post("api/v1/hsms/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });

        hsm.forEach((hsm) => {
          this.hsms.items.push(hsm);
        });
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadApns() {
      try {
        let apns = await this.$axios.$post("api/v1/apns/list", {
          select: {
            key: { k: "apn" },
            value: { k: "apn" },
          },
        });
        this.apns = apns;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    getLastSid() {
      return this.card.record.last_sid;
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
    async initialize() {
      if (null == this.value) {
        console.log(`flo-card-ota - initialize - value is null`);
        this.syncParent();
      } else {
        this.operation = this.value;

        for (let i = 0; i < this.operation.length; i++) {
          const l_opp = this.operation[i];
          if (l_opp.hasOwnProperty("type")) {
            let l_type = l_opp.type;
            if (l_type == "keys") {
              this.keys.open = true;
              this.keys.key++;
            } else if (l_type == "subs") {
              this.subs.open = true;
              this.subs.key++;
            } else if (l_type == "settings") {
              this.settings.open = true;
              this.settings.key++;
            }
          }
        }
        console.log(`flo-card-ota - initialize - value (operation): ${JSON.stringify(this.operation)}`);
      }

      if (this.campaign_lead_by == "card") {
        this.setFlushSubs(true);
      }
      this.card.record.iccid = this.iccid;
      await this.loadHsm();
      await this.loadCard();
      await this.loadCardKeys();
      await this.loadCardSubscribers();
      await this.loadCardSettings();
      await this.loadApns();
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      let lcache = this.$store.getters["session/cache"];
      translator.setEnumEx("countries", lcache["/denum/mcc"].value);
      this.translator = translator;
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
    beutifyMcc(mcc) {
      if (!mcc) {
        return "";
      }
      let clean = mcc
        .split(",")
        .filter((f) => f !== "DDD")
        .join(",");

      if (clean.length < 8) {
        return clean;
      }
      return `${clean.substr(0, 8)}...`;
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
      if (this.campaign_lead_by != "card") {
        if (this.getOtaState() == "idle") {
          return [];
        }
      }

      let changes = this.operation;

      if (changes.length > 0) {
        if (!type) {
          return changes;
        } else if (!id) {
          return changes.filter((c) => c.type == type);
        } else {
          return changes.filter((c) => this.filterChange(type, id, c));
        }
      } else {
        return changes;
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
      let changes = this.getCardChanges(type);
      return changes.length;
    },
    getSubsChangeCount() {
      let changes = this.getCardChanges("subs").length + this.getCardChanges("actions").length;
      return changes == 1 ? `${changes} change` : `${changes} changes`;
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
      this.operation = changes;
      this.syncParent();
      this.updateVersion(type);
    },
    removeCardChange(type, id) {
      let changes = this.getCardChanges();
      let found = changes.filter((c) => !this.filterChange(type, id, c));
      this.operation = found;

      this.syncParent();
      this.updateVersion(type);
    },
    updateVersion(type) {
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
    syncParent() {
      console.log(`flo-card-ota - syncParent - enter - ${JSON.stringify(this.operation)}`);
      this.$emit("change", this.operation);
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
        final_sub = this.getSubsDelta(this.subs.editedItem);
      } else {
        final_sub = this.subs.editedItem;
      }
      if (final_sub) {
        this.setCardChanges("subs", final_sub.idx, final_sub);
      }

      this.closeSubs();

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
      this.subs.editedItem.lrplmnsi = 0;
      this.subs.editedItem.smsc = "";
      this.subs.editedItem.mcc = "";
      this.subs.editedItem.mnc = 2;
      this.subs.editedItem.plmn = "";
      this.subs.editedItem.key_id = 1;

      this.setCardChanges("subs", this.subs.editedItem.idx, this.subs.editedItem);
      let changes = this.getCardChanges();
      console.log(`card - resetSubsItem - changes - after:${JSON.stringify(changes)}`);
      this.closeSubs();

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
      this.getCardChanges();
      this.closeKeys();

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

      if (this.settings.editedItem.store == "card" || !this.settings.editedItem.store) {
        let temp = JSON.parse(JSON.stringify(this.settings.editedItem));
        if (temp.hasOwnProperty("store")) {
          delete temp.store;
        }

        this.setCardChanges("settings", this.settings.editedItem.name, temp);
        this.closeSettings();

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
      this.show_unused_subs = true;
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
      return this.flush_subs;
    },
    setFlushSubs(event) {
      this.flush_subs = event;
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

      if (rescan) {
        this.setCardChanges("actions", "rescan", {
          cmd: "rescan",
        });
      } else {
        this.removeCardChange("actions", "rescan");
      }
    },
    getRefreshMode() {
      let changes = this.getCardChanges("actions", "refresh");
      if (changes.length) {
        return true;
      } else {
        return false;
      }
    },
    setRefreshMode(refresh) {
      console.log(`card - setRefreshMode - enter ${refresh}`);
      let changes = this.getCardChanges("actions", "refresh");
      console.log(`card - setRefreshMode - changes - before:${JSON.stringify(changes)}`);

      if (refresh) {
        this.setCardChanges("actions", "refresh", {
          cmd: "refresh",
          type: "04",
        });
      } else {
        this.removeCardChange("actions", "refresh");
      }

      changes = this.getCardChanges();
      console.log(`card - setRefreshMode - changes - after:${JSON.stringify(changes)}`);
    },
    getChangedColorWithAlpha() {
      return `${this.$vuetify.theme.currentTheme[this.getChangedColor()]}19`;
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
    hasPermissionToEditCard() {
      if (this.card.permissions.u == 1) {
        return true;
      }
      return false;
    },
    canEditCard() {
      if (!this.hasPermissionToEditCard() || this.disabled) {
        return false;
      }
      let luser = this.$store.state.session.user;
      if ("card" == this.campaign_lead_by) {
        return this.transport == "sms";
      } else {
        return this.card.record.ota_state === "edit" && this.card.record.ota_user === luser.email && this.transport == "sms";
      }
    },
    canEditRefresh() {
      if (!this.canEditCard()) {
        return false;
      }
      return this.canEditCard();
    },
    canEditRescan() {
      if (!this.canEditCard()) {
        return false;
      }
      return this.canEditCard();
    },
    canEditSsMode() {
      if (!this.canEditCard()) {
        return false;
      }
      return this.canEditCard();
    },
    canEditSs() {
      if (!this.canEditCard()) {
        return false;
      }
      return this.canEditCard();
    },
  },
};
</script>
