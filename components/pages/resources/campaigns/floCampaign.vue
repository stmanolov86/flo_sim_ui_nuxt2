<template>
  <div class="flo-campaign">
    <v-container v-if="!loading" fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col cols="12">
          <v-card flat outlined>
            <v-card-text class="ma-0 pa-0">
              <v-container fluid class="pa-1">
                <v-row no-gutters>
                  <v-col cols="12" class="pa-1">
                    <div class="headline">
                      Campaign: {{ campaign.name }}
                      <v-chip v-if="campaign.hasOwnProperty('state')" class="text-capitalize" :color="getCampaignStateColor(campaign.state)" label>{{ campaign.state }}</v-chip>
                      <v-chip v-if="campaign.hasOwnProperty('priority')" class="text-capitalize" :color="getCampaignPriorityColor(campaign.priority)" label>{{ campaign.priority }}</v-chip>
                    </div>
                    <v-row no-gutters>
                      <v-col cols="10">
                        <blockquote class="blockquote font-weight-light">
                          Id: <code>{{ campaign.id }}</code
                          >,
                          <span v-if="campaign.retry_interval != 0">
                            Retry Interval: <code>{{ helpers.secondsToTime(campaign.retry_interval) }}</code
                            >,</span
                          >
                          <template v-if="campaign_template != null">
                            <span>
                              Leading ICCID:
                              <router-link
                                :to="{
                                  path: '/resources/card/',
                                  query: { iccid: campaign_template.lead_iccid },
                                }"
                                ><code>{{ campaign_template.lead_iccid }}</code></router-link
                              >
                            </span>
                            <span>
                              , Campaign Template:
                              <code>
                                <router-link
                                  :to="{
                                    path: '/resources/campaign_template/',
                                    query: { id: campaign_template.id },
                                  }"
                                >
                                  <span>{{ campaign_template.name }}</span>
                                </router-link></code
                              >,
                            </span>
                          </template>
                          <span>{{ formatCampaignDuration() }}</span>
                        </blockquote>
                      </v-col>
                      <div class="flex-grow-1"></div>
                      <v-btn class="mt-5 mr-1" v-if="campaign.state == 'scheduled' || campaign.state == 'process'" color="primary" @click="changeState('suspend')" :disabled="!hasPermissionToExecute()">
                        <v-icon left> mdi-pause </v-icon>
                        Suspend</v-btn
                      >
                      <v-btn class="mt-5 mr-1" v-if="campaign.state == 'suspend' || campaign.state == 'exception' || campaign.state == 'expired'" color="primary" @click="changeState('resume')" :disabled="!hasPermissionToExecute()">
                        <v-icon left> mdi-refresh-circle </v-icon>
                        Resume</v-btn
                      >
                      <v-btn class="mt-5 mr-1" v-if="campaign.state != 'canceled' && campaign.state != 'created' && campaign.state != 'completed'" color="primary" @click="changeState('cancel')" :disabled="!hasPermissionToExecute()">
                        <v-icon left> mdi-cancel </v-icon>
                        Cancel</v-btn
                      >
                    </v-row>
                  </v-col>
                </v-row>

                <v-row no-gutters>
                  <v-col cols="12" class="pa-1">
                    <flo-expand title="Details" elevation="5">
                      <template v-slot:content="{}">
                        <flo-meta-resource-view :value="campaign" resources="campaigns" :ignore="['card_action', 'retry_interval', 'action', 'ota_stack', 'param_val', 'path', 'aid']">
                          <template v-slot:view_campaign_template_id="{ fmtheader }">
                            <v-col cols="12" lg="3" xl="3" class="pa-1">
                              <flo-meta-field-view :translator="translator" :header="formatHeader(fmtheader)" :value="formatHeader(fmtheader).data" />
                            </v-col>
                          </template>
                        </flo-meta-resource-view>
                      </template>
                    </flo-expand>
                  </v-col>
                </v-row>

                <v-row v-if="campaign_template" no-gutters>
                  <v-col cols="12" class="pa-1">
                    <flo-expand :title="formatCampaignTemplateTitle()" elevation="5">
                      <template v-slot:title="{ title }">
                        <span class="title font-weight-regular mx-2">{{ title }}</span>
                      </template>
                      <template v-slot:content="{}">
                        <v-container fluid class="ma-0 pa-0">
                          <v-row no-gutters v-if="formatCampaignTemplateParams('participants').length > 0">
                            <v-col cols="12" class="pa-1">
                              <flo-expand title="Parameter Definitions" elevation="5">
                                <template v-slot:title="{ title }">
                                  <span class="title font-weight-regular mx-2">{{ title }}</span>
                                </template>
                                <template v-slot:content="{}">
                                  <v-row no-gutters>
                                    <v-col cols="12" class="pa-1"> <flo-meta-field-definition module="campaigns" resources="campaign_templates" :value="campaign_template" :local_permissions="getLocalPermissions()" readonly /> </v-col> </v-row></template></flo-expand
                            ></v-col>
                          </v-row>
                          <v-row no-gutters>
                            <v-col cols="12" class="pa-1">
                              <flo-expand title="OTA View" elevation="5">
                                <template v-slot:title="{ title }">
                                  <span class="title font-weight-regular mx-2">{{ title }}</span>
                                </template>
                                <template v-slot:content="{}">
                                  <template v-if="!getCardIccid()">
                                    <v-row no-gutters>
                                      <v-col cols="12" align="center">
                                        <v-icon color="warning" large>mdi-alert</v-icon>
                                      </v-col>
                                    </v-row>
                                    <v-row no-gutters>
                                      <v-col class="pa-1" cols="12" align="center">
                                        <span class="text-subtitle-1 font-weight-light primary--text">Leading ICCID {{ campaign_template.lead_iccid }} doesn't exist.</span>
                                      </v-col>
                                    </v-row>
                                  </template>
                                  <template v-else>
                                    <v-row no-gutters>
                                      <v-col cols="1" class="pa-1">
                                        <v-tooltip right>
                                          <template v-slot:activator="{ on }">
                                            <div v-on="on">
                                              <v-switch v-model="inspect" class="subheading font-weight-light" dense color="success" hide-details label="Inspect"></v-switch>
                                            </div>
                                          </template>
                                          <span>Debug mode</span>
                                        </v-tooltip>
                                      </v-col>
                                    </v-row>

                                    <v-row no-gutters v-if="inspect">
                                      <v-col cols="12" lg="12" class="pa-1">
                                        <flo-json-editor name="stack" mode="code" :modes="['view', 'code', 'text']" :key="`js-s-${totalVersion}`" height="300px" :value="campaign_template.ota_stack ? campaign_template.ota_stack : {}"></flo-json-editor>
                                      </v-col>
                                    </v-row>

                                    <v-row no-gutters>
                                      <v-col cols="12" class="pa-1"> <flo-card-scp @change="onScpChange($event)" :campaign_lead_by="campaign_template.lead_by" @send_ram="onSendRam($event)" :value="getScpStackChange()" :spi="getCardSpi()" :kic_algo="getCardKicAlgo()" :kid_algo="getCardKidAlgo()" :push_spi="getCardPushSpi()" :keysets80="getScpActiveKeysets('80')" :keysets81="getScpActiveKeysets('81')" :keyset80="getCardKeysetScp80()" :keyset81="getCardKeysetScp81()" :is_multi_imsi="isMultiImsi()" :uicc_id="getCardUiccId()" :iccid="getCardIccid()" :card_applets="getApplets()" readonly disabled :parameters="getParameters()" :changes_amount="getChangeCount()" /></v-col
                                    ></v-row>
                                  </template>
                                </template> </flo-expand
                            ></v-col>
                          </v-row>
                        </v-container>
                      </template>
                    </flo-expand>
                  </v-col>
                </v-row>

                <v-row no-gutters v-if="formatCampaignTemplateParams('campaign').length > 0">
                  <v-col cols="12" class="pa-1">
                    <flo-expand title="Campaign Parameters" elevation="5">
                      <template v-slot:content="{}">
                        <v-card flat outlined class="ma-1">
                          <v-container fluid>
                            <v-row no-gutters>
                              <v-col v-for="(param, idx) in formatCampaignTemplateParams('campaign')" :key="idx" cols="12" lg="3" xl="3" class="pa-1">
                                <flo-meta-field-edit :header="param" :value="getParamVal(param, getCampaignParamData())" @input="onParamChanged(param, getCampaignParamData(), $event)" :disabled="disableParamEdit()" :pattern="param.pattern"> </flo-meta-field-edit>
                              </v-col>
                            </v-row>

                            <v-row no-gutters>
                              <v-col cols="12" class="pa-1">
                                <v-btn color="primary" @click="saveCampaignVal()" :disabled="disableParamEdit()">
                                  <v-icon left>mdi-content-save</v-icon>
                                  Save
                                </v-btn>
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-card>
                      </template>
                    </flo-expand>
                  </v-col>
                </v-row>

                <v-row v-if="campaign_template" no-gutters>
                  <v-col v-if="card" cols="12" class="pa-1">
                    <flo-expand :open="participants_expand" title="Participants" elevation="5">
                      <template v-slot:content="{}">
                        <v-container v-if="getCardIccid()" class="ma-0 pa-0" fluid>
                          <v-row v-if="campaign.state == 'created'" no-gutters>
                            <v-col cols="12" class="pa-1">
                              <flo-expand :open="generate_expand" :key="generate_expand_key" title="Add/Remove Participants" elevation="5">
                                <template v-slot:content="{}">
                                  <v-container fluid class="ma-0 pa-0">
                                    <v-row no-gutters>
                                      <v-col cols="12" class="pa-1"> <flo-campaign-generate :campaign="campaign" :campaign_template="campaign_template" :uicc="uicc" :disabled="!hasPermissionToEdit()" @generated="onGenerate($event)" /> </v-col>
                                    </v-row>
                                  </v-container>
                                </template>
                              </flo-expand>
                            </v-col>
                          </v-row>

                          <v-row no-gutters>
                            <v-col cols="12" class="pa-1">
                              <flo-expand :open="process_expand" :key="process_expand_key" title="Process" elevation="5">
                                <template v-slot:content="{}">
                                  <v-container fluid class="ma-0 pa-0">
                                    <v-row v-if="campaign.state == 'process' || campaign.state == 'completed'" no-gutters>
                                      <v-col cols="12" class="px-1">
                                        <flo-timeline-campaign-progress :live="true" :campaign_id="campaign.id" :dashboard="campaign_items_in_progress" unique="timeline-campaign-progress" :showTitle="true" title="Campaign Participants Activity" min-height="300px" max-height="300px"></flo-timeline-campaign-progress>
                                      </v-col>
                                    </v-row>
                                    <v-row no-gutters>
                                      <v-col cols="12" class="pa-1">
                                        <flo-meta-table v-if="translator !== null" unique="process" item_key="iccid" :title="title" :show_title="false" :show_search="false" @load-data="onLoadParticipantData($event)" :translator="translator" :disabledEdit="!hasPermissionToEdit()" :can_import="hasPermissionToExecute()" disableNew resources="campaign_participants" :hidden_filter="hidden_filter" :key="cp_key">
                                          <template v-slot:top="{}">
                                            <v-row no-gutters justify="end">
                                              <v-col cols="auto">
                                                <span v-for="(participant, idx) in participant_states" :key="idx" :class="`px-1 text-capitalize subtitle-1 ${getCampaignParticipantStateColor(participant.state)}--text`">{{ `${participant.state} - ${participant.items}` }} </span>
                                              </v-col>
                                            </v-row>
                                          </template>

                                          <template v-slot:ex_new="{ fab, color, permissions, smAndDown }">
                                            <template v-if="permissions.e == true && campaign_participants.length > 0">
                                              <v-row no-gutters>
                                                <v-col v-if="participant_states.length > 0" class="mr-1" cols="12">
                                                  <v-btn :fab="fab" :small="smAndDown" :color="color" @click="clearParticipantsCount()">
                                                    <v-icon :left="!smAndDown">mdi-cancel</v-icon>
                                                    {{ !smAndDown ? "Clear" : "" }}
                                                  </v-btn>
                                                </v-col>
                                                <v-col v-else class="mr-1" cols="12">
                                                  <v-btn :fab="fab" :small="smAndDown" :color="color" @click="countParticipantsByState()">
                                                    <v-icon :left="!smAndDown">mdi-counter</v-icon>
                                                    {{ !smAndDown ? "Stats" : "" }}
                                                  </v-btn>
                                                </v-col>
                                              </v-row>
                                            </template>
                                            <template v-if="permissions.e == true && campaign.state == 'process'">
                                              <template v-if="campaign.state != 'canceled' && campaign.state != 'completed'">
                                                <v-btn v-if="campaign.state.toLowerCase() == 'process'" :fab="fab" :small="smAndDown" class="mr-1" :color="color" @click="changeState('retry')">
                                                  <v-icon :left="!smAndDown">mdi-redo</v-icon>
                                                  {{ !smAndDown ? "Retry all" : "" }}
                                                </v-btn>
                                                <v-btn v-if="campaign.state.toLowerCase() == 'process'" :fab="fab" :small="smAndDown" class="mr-1" :color="color" @click="changeState('resume')">
                                                  <v-icon :left="!smAndDown">mdi-refresh-circle</v-icon>
                                                  {{ !smAndDown ? "Unsuspend all" : "" }}
                                                </v-btn>
                                                <v-btn v-if="campaign.state.toLowerCase() == 'process'" :fab="fab" :small="smAndDown" class="mr-1" :color="color" @click="changeState('continue')">
                                                  <v-icon :left="!smAndDown">mdi-refresh</v-icon>
                                                  {{ !smAndDown ? "Unwait all" : "" }}
                                                </v-btn>
                                              </template>
                                            </template>
                                          </template>

                                          <template v-slot:edit_path="{ fmtheader, fmtrow }">
                                            <v-col :__qa="helpers.getQATag('campaign_participants', fmtheader)" cols="12" lg="6">
                                              <flo-account-select v-model="fmtrow.path" :label="fmtheader.text" :hint="fmtheader.hint" :disabled="fmtheader.disable_edit" persistent-hint />
                                            </v-col>
                                          </template>

                                          <template v-slot:edit_param_val="{ fmtrow, fmtheader }">
                                            <template>
                                              <v-col v-for="(param, idx) in formatCampaignTemplateParams('participants')" :key="idx" :__qa="helpers.getQATag('campaign_participants', fmtheader)" cols="12" lg="6" xl="6">
                                                <flo-meta-field-edit :value="getParamVal(param, fmtrow.param_val)" @input="onParamChanged(param, fmtrow.param_val, $event)" :disabled="disableParamEdit()" :pattern="param.pattern" :header="param"> </flo-meta-field-edit>
                                              </v-col>
                                            </template>
                                          </template>

                                          <template v-slot:view_state="{ fmtrow }">
                                            <v-chip class="text-capitalize" label :color="getCampaignParticipantStateColor(fmtrow.state)">{{ fmtrow.state }}</v-chip>
                                          </template>

                                          <template v-slot:view_code="{ fmtrow }">
                                            <v-chip label :color="getItemCodeColor(fmtrow.code)">{{ fmtrow.code }}</v-chip>
                                          </template>

                                          <template v-slot:ex_actions="{ fmtheader, fmtrow, fmtpermissions }">
                                            <!-- <v-btn :__qa="helpers.getQATag('campaign_participants', fmtheader)" color="primary" class="my-1" v-if="fmtrow.state == 'progress'" @click="updateState(fmtrow, 'suspend')">
                                              <v-icon left>
                                                mdi-pause
                                              </v-icon>
                                              Suspend</v-btn
                                            > -->
                                            <template v-if="fmtpermissions.e == true && campaign.state == 'process' && campaign.state != 'canceled' && campaign.state != 'completed'">
                                              <v-btn :__qa="helpers.getQATag('campaign_participants', fmtheader)" color="primary" class="mr-1" v-if="fmtrow.state == 'canceled' || fmtrow.state == 'retry' || fmtrow.state == 'exception' || fmtrow.state == 'user'" @click="updateState(fmtrow, 'retry')">
                                                <v-icon left> mdi-refresh </v-icon>
                                                Retry</v-btn
                                              >
                                              <v-btn :__qa="helpers.getQATag('campaign_participants', fmtheader)" color="primary" class="mr-1" v-if="fmtrow.state == 'suspended'" @click="updateState(fmtrow, 'resume')">
                                                <v-icon left> mdi-refresh-circle </v-icon>
                                                Unsuspend</v-btn
                                              >
                                              <v-btn :__qa="helpers.getQATag('campaign_participants', fmtheader)" color="primary" class="mr-1" v-if="fmtrow.state == 'wait'" @click="updateState(fmtrow, 'continue')">
                                                <v-icon left> mdi-refresh </v-icon>
                                                Unwait</v-btn
                                              >
                                              <v-btn :__qa="helpers.getQATag('campaign_participants', fmtheader)" color="primary" class="mr-1" v-if="fmtrow.state == 'retry' || fmtrow.state == 'exception' || fmtrow.state == 'pending'" @click="updateState(fmtrow, 'wait')">
                                                <v-icon left> mdi-progress-clock </v-icon>
                                                Wait</v-btn
                                              >
                                              <v-btn :__qa="helpers.getQATag('campaign_participants', fmtheader)" color="primary" class="mr-1" v-if="fmtrow.state == 'progress' || fmtrow.state == 'exception' || fmtrow.state == 'suspended' || fmtrow.state == 'user'" @click="updateState(fmtrow, 'cancel')">
                                                <v-icon left> mdi-cancel </v-icon>
                                                Cancel</v-btn
                                              >
                                              <v-btn :__qa="helpers.getQATag('campaign_participants', fmtheader)" color="primary" class="mr-1" v-if="fmtrow.state == 'user'" @click="updateState(fmtrow, 'dbonly')">
                                                <v-icon left>mdi-progress-download</v-icon>
                                                Confirm</v-btn
                                              >
                                            </template>
                                          </template>

                                          <template v-slot:view_iccid="{ fmtrow }">
                                            <v-container class="d-flex flex-nowrap ma-0 pa-0">
                                              <span class="align-self-center text-center ml-n3">{{ fmtrow.iccid }}</span>
                                              <v-btn
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
                                        </flo-meta-table>
                                      </v-col>
                                    </v-row>

                                    <v-row v-if="showProcessButtons() && hasPermissionToExecute()" no-gutters>
                                      <v-col cols="12" class="pa-1">
                                        <v-btn color="primary" :loading="process_loading" :disabled="disableProcessButtons()" @click="confirmParticipantAction('process')">
                                          <v-icon left>mdi-progress-check</v-icon>
                                          Process
                                        </v-btn>
                                        <v-btn color="primary" :loading="test_loading" :disabled="disableProcessButtons()" @click="confirmParticipantAction('test')">
                                          <v-icon left>mdi-progress-wrench</v-icon>
                                          Test
                                        </v-btn>
                                        <v-btn color="primary" :loading="wait_loading" :disabled="disableProcessButtons()" @click="confirmParticipantAction('wait')">
                                          <v-icon left>mdi-progress-clock</v-icon>
                                          Wait
                                        </v-btn>
                                        <v-btn color="warning" :loading="dbonly_loading" :disabled="disableProcessButtons()" @click="confirmParticipantAction('dbonly')">
                                          <v-icon left>mdi-progress-download</v-icon>
                                          Storage Only
                                        </v-btn>
                                      </v-col>
                                    </v-row>

                                    <v-row no-gutters>
                                      <v-col cols="auto">
                                        <v-dialog :overlay-opacity="0.4" v-model="confirm_action_dialog" persistent width="auto ">
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
                                                  <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"><span class="title text--primary">Are you sure you want to process this campaign?</span> </v-col>
                                                </v-row>
                                                <v-row no-gutters justify="center">
                                                  <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"
                                                    ><span class="body-1 text--primary">{{ formatParticipantAction() }}</span>
                                                  </v-col>
                                                </v-row>
                                              </v-container>
                                            </v-card-text>
                                            <v-card-actions>
                                              <div class="flex-grow-1"></div>
                                              <v-btn color="primary" text @click="confirm_action_dialog = false">Cancel</v-btn>
                                              <v-btn color="primary" text @click="onProcessAction()">Update</v-btn>
                                            </v-card-actions>
                                          </v-card>
                                        </v-dialog>
                                      </v-col>
                                    </v-row>
                                  </v-container>
                                </template>
                              </flo-expand>
                            </v-col>
                          </v-row>
                        </v-container>
                      </template>
                    </flo-expand>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import floCardScp from "~/components/widgets/floCardScp.vue";
import floCampaignGenerate from "~/components/pages/resources/campaigns/floCampaignGenerate.vue";
import floTimelineCampaignProgress from "~/components/charts/floTimelineCampaignProgress";
import floMetaFieldDefinition from "~/components/crud/floMetaFieldDefinition.vue";
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import { mapGetters, mapActions } from "vuex";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
import enums from "~/src/enums.js";
export default {
  head() {
    return {
      title: this.title,
    };
  },
  name: "flo-campaign",
  components: {
    floCardScp,
    floCampaignGenerate,
    floMetaFieldDefinition,
    floTimelineCampaignProgress,
  },
  data: () => ({
    helpers,
    enums,
    title: "Campaign",
    loading: true,
    inspect: false,
    campaign_items_in_progress: {},
    pulling_in_progress: false,
    pull_timer_id: 0,
    translator: null,
    transport: "",
    campaign_participants: [],
    campaign_template: null,
    hidden_filter: [],
    campaign: {},
    uicc: null,
    ota_stack_version: 1,
    args_version: 1,
    cp_key: 1,
    totalVersion: 1,
    valid: false,
    record: {
      args: {},
      ota_stack: {
        changes: [],
      },
    },
    updateInProgress: false,
    progress: false,
    progress_value: 0,
    progress_color: "success",
    process_loading: false,
    test_loading: false,
    wait_loading: false,
    dbonly_loading: false,
    participants_expand: false,
    campaign_editing_expand: false,
    generate_expand: false,
    process_expand: false,
    generate_expand_key: 1,
    process_expand_key: 1,
    lead_by: "",
    card: null,
    card_key_store: [],
    card_applets: [],
    applets: [],
    participant_states: [],
    confirm_action_dialog: false,
    participant_type: "",
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
      getResourceKey: "session/getResourceKey",
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
    ...mapActions({
      addToResourceCache: "session/addToResourceCache",
    }),
    hasPermissionToEdit() {
      let l_permissions = this.permissions.find((p) => p.res == "campaigns");
      if (this.campaign.state == "created") {
        if (l_permissions.u == true && l_permissions.e == true) {
          return true;
        }
      }

      return false;
    },
    hasPermissionToExecute() {
      let l_permissions = this.permissions.find((p) => p.res == "campaigns");
      if (l_permissions.u == true && l_permissions.e == true) {
        return true;
      }

      return false;
    },
    onLoadParticipantData(data) {
      this.campaign_participants = data.items;

      for (const header of data.headers) {
        switch (header.value) {
          case "id":
          case "ts":
          case "code":
          case "tries":
          case "message":
          case "iccid":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "state":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "path":
            {
              header.disable_edit = true;
              header.disable_new = true;
              header.view = false;
            }
            break;
          case "aid":
          case "version":
          case "campaign_id":
            {
              header.edit = false;
              header.view = false;
            }
            break;
          case "param_val":
            {
              header.view = false;
              header.edit = this.formatCampaignTemplateParams("participants").length > 0 ? true : false;
              header.gpath = "/Parameters";
            }
            break;
        }
      }
    },
    getCardSpi() {
      if (this.getLeadBy() == "gsma") {
        return "1602";
      } else {
        return this.card.spi;
      }
    },
    getCardKicAlgo() {
      if (this.getLeadBy() == "gsma") {
        return "12";
      } else {
        return this.card.kic_algo;
      }
    },
    getCardKidAlgo() {
      if (this.getLeadBy() == "gsma") {
        return "12";
      } else {
        return this.card.kid_algo;
      }
    },
    getCardPushSpi() {
      if (this.getLeadBy() == "gsma") {
        return "0601";
      } else {
        return this.card.push_spi;
      }
    },
    getCardKeysetScp80() {
      if (this.getLeadBy() == "gsma") {
        return 1;
      } else {
        return this.card.keyset_scp80;
      }
    },
    getCardKeysetScp81() {
      if (this.getLeadBy() == "gsma") {
        return 64;
      } else {
        return this.card.keyset_scp81;
      }
    },
    isMultiImsi() {
      if (this.getLeadBy() == "gsma") {
        return false;
      }

      let multi_imsi = false;
      if (null != this.applets) {
        let lapplet = this.applets;
        if (lapplet.is_multi_imsi == 1) {
          multi_imsi = true;
        }
      }

      return multi_imsi;
    },
    getScpActiveKeys(p_scp) {
      let all_keysets = [];
      let l_card_key_store = this.card_key_store;
      let l_filter = l_card_key_store.filter((f) => f.scp == p_scp && f.state == "active");
      all_keysets = l_filter;

      return all_keysets;
    },
    getScpActiveKeysets(p_scp) {
      if (this.getLeadBy() == "gsma") {
        if (p_scp == "80") {
          return enums()["keyset_scp80"];
        } else {
          return enums()["keyset_scp81"];
        }
      }

      let l_filter = this.getScpActiveKeys(p_scp);
      let l_reduce = l_filter.reduce((pv, cv, ci, array) => {
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
    getLeadBy() {
      if (this.campaign_template) {
        return this.campaign_template.lead_by;
      } else {
        return this.lead_by ? this.lead_by : "";
      }
    },
    getCardUiccId() {
      if (this.getLeadBy() == "gsma") {
        return 0;
      } else {
        return this.card ? this.card.uicc_id : "";
      }
    },
    getCardIccid() {
      if (this.getLeadBy() == "gsma") {
        return "";
      } else {
        return this.card ? this.card.iccid : "";
      }
    },
    getApplets() {
      if (this.getLeadBy() == "gsma") {
        return "";
      } else {
        return this.applets.id ? this.applets.id : "";
      }
    },
    getItemCodeColor(code) {
      let colorMap = {
        0: "info",
        100: "info",
        101: "accent",
        200: "success",
        204: "warning",
        400: "error",
        404: "error",
        500: "error",
      };

      return colorMap[code] || "warning";
    },
    getCampaignStateColor(state) {
      let colorMap = {
        created: "info",
        process: "accent",
        scheduled: "secondary",
        expired: "warning",
        suspend: "warning",
        canceled: "error",
        exception: "error",
        completed: "success",
      };

      return colorMap[state] || "warning";
    },
    getCampaignPriorityColor(priority) {
      let colorMap = {
        lazy: "info",
        normal: "primary",
        immediate: "warning",
      };

      return colorMap[priority] || "info";
    },
    getCampaignParticipantStateColor(state) {
      let colorMap = {
        pending: "info",
        progress: "accent",
        wait: "secondary",
        suspended: "warning",
        user: "warning",
        retry: "error",
        canceled: "error",
        canceling: "error",
        exception: "error",
        completed: "success",
      };

      return colorMap[state] || "warning";
    },
    getScpStackChange() {
      if (!this.campaign_template.ota_stack) {
        console.log(`flo-campaign- getScpStackChange - No OTA Stack`);
        return null;
      }

      let lota_stack = this.campaign_template.ota_stack;

      if (!lota_stack.hasOwnProperty("type")) {
        console.log(`flo-campaign- getScpStackChange - No Type Tag`);
        return null;
      }

      if (!lota_stack.hasOwnProperty("changes")) {
        console.log(`flo-campaign- getScpStackChange - No Changes`);
        return null;
      }

      let lchanges = lota_stack.changes;
      if (lchanges.length <= 0) {
        console.log(`flo-campaign- getScpStackChange - No Changes Length`);
        return null;
      }

      return lchanges[0];
    },
    getChangeCount() {
      let changes = this.getScpStackChange();
      if (!changes) return 0;

      let total = 0;
      let type = changes.type ? changes.type.toUpperCase() : "";

      if (changes.operations && changes.operations.length > 0) {
        let operation = changes.operations[0];

        if (type === "RFM") {
          if (operation.writes) {
            total = operation.writes.length;
          } else if (operation.reads) {
            total = operation.reads.length;
          } else {
            total = changes.operations.length;
          }
        } else if (type === "FLOLIVE" || type === "RAM") {
          total = changes.operations.length;
        }
      }

      return total;
    },
    getParameters() {
      let l_params = [];

      if (this.campaign_template) {
        if (this.campaign_template.param_def.hasOwnProperty("data")) {
          l_params = this.campaign_template.param_def.data;
        }
      }

      return l_params;
    },
    getLocalPermissions() {
      let l_permissions = {
        c: false,
        r: true,
        u: false,
        d: false,
        e: false,
        res: "campaign_templates",
      };

      return l_permissions;
    },
    onScpChange(event) {
      console.log(`flo-campaign- onScpChange - enter`);
      let lota_stack = this.campaign_template.ota_stack;

      if (event.hasOwnProperty("transport")) {
        if (event.transport != "") {
          let ltransport = event.transport;
          this.transport = ltransport;
        }
      }

      if (event.hasOwnProperty("type")) {
        let ltype = event.type;
        if (ltype == "rfm" || ltype == "ram") {
          lota_stack["type"] = "scp";
        } else if (ltype == "flolive") {
          lota_stack["type"] = "applet";
        }
      }

      if (lota_stack.hasOwnProperty("changes")) {
        lota_stack.changes[0] = event;
      }

      this.totalVersion++;
    },
    onSendRam(event) {
      console.log(`flo-campaign- onSendRam - enter`);
      let lota_stack = this.campaign_template.ota_stack;

      if (lota_stack.changes.length > 0) {
        lota_stack.changes[0].operations = event;
      }
    },
    expandOnState() {
      if (this.campaign.state == "process" || this.campaign.state == "completed" || this.campaign.state == "exception") {
        this.process_expand = true;
        this.process_expand_key++;
        this.participants_expand = true;
      }
    },
    onGenerate() {
      this.generate_expand = false;
      this.process_expand = true;
      this.generate_expand_key++;
      this.process_expand_key++;
    },
    disableProcessButtons() {
      let ldisable = true;

      if (this.campaign_participants.length > 0) {
        ldisable = false;
      }

      return ldisable;
    },
    showProcessButtons() {
      let l_visible = false;
      let l_ota_stack = this.campaign_template.ota_stack;
      if (this.campaign.state == "created") {
        if (l_ota_stack.hasOwnProperty("changes")) {
          if (l_ota_stack.changes.length > 0) {
            l_visible = true;
          }
        }
      }

      return l_visible;
    },
    processButtonsLoaders(type, state) {
      switch (type) {
        case "test":
          this.test_loading = state;
          break;
        case "process":
          this.process_loading = state;
          break;
        case "wait":
          this.wait_loading = state;
          break;
        case "dbonly":
          this.dbonly_loading = state;
          break;
      }
    },
    formatParticipantAction() {
      let action = "";
      switch (this.participant_type) {
        case "process":
          action = "Your action will begin executing campaign participants.";
          break;
        case "test":
          action = "Your action will suspend all participants so you can try them individually.";
          break;
        case "wait":
          action = "Your action will move all campaign participants to wait state.";
          break;
        case "dbonly":
          action = "Your action will not execute and will only update the server storage.";
          break;
      }

      return action;
    },
    formatCampaignDuration() {
      let startTime = helpers.createdSince(this.campaign.start_time, "Campaign", "started", "starts").replace(/\./g, "");
      let endTime = helpers.createdSince(this.campaign.end_time, "Campaign", "ended", "ends").replace(/Campaign/g, "and");

      return `${startTime} ${endTime}`;
    },
    confirmParticipantAction(type) {
      this.participant_type = type;
      this.confirm_action_dialog = true;
    },
    clearParticipantsCount() {
      if (this.participant_states.length > 0) {
        this.participant_states = [];
      }
    },
    async executeProcess(type) {
      let answer = null;
      try {
        let request = {
          id: this.campaign.id,
          type: type,
        };
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
        answer = await this.$axios.$post("api/v1/campaigns/process", request);
        this.campaign = answer.campaign;
        this.cp_key++;
        this.tellUser("success", `Id:${this.campaign.id} process started successfully.`);
      } catch (err) {
        this.cp_key++;
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      this.processButtonsLoaders(type, false);
      this.confirm_action_dialog = false;
      this.progress = false;
      return answer;
    },
    async onProcessAction() {
      let type = this.participant_type;
      this.processButtonsLoaders(type, true);
      await this.executeProcess(type);

      if (this.participant_states.length > 0) {
        await this.countParticipantsByState();
      }
    },
    async loadCard() {
      try {
        let query = {
          select: {},
          where: [
            {
              k: "iccid",
              op: "equal",
              v: this.campaign_template.lead_iccid,
            },
          ],
        };
        let cards = await this.$axios.$post("api/v1/cards/list", query);
        if (cards.length > 0) {
          this.card = cards[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadUicc() {
      try {
        let query = {
          select: {},
          where: [
            {
              k: "id",
              op: "equal",
              v: this.card.uicc_id,
            },
          ],
        };
        let uicc = await this.$axios.$post("api/v1/uiccs/list", query);
        if (uicc.length > 0) {
          this.uicc = uicc[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadCardKeyStore() {
      try {
        let query = {
          where: [
            {
              k: "iccid",
              op: "equal",
              v: this.card.iccid,
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
    async loadCardApplets() {
      try {
        let query = {
          select: {},
          where: [
            {
              k: "iccid",
              op: "equal",
              v: this.card.iccid,
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
        let l_val = 0;
        let l_card_applet = this.card_applets;
        if (l_card_applet.length > 0) {
          l_val = l_card_applet[0].applet_id;
        }
        let query = {
          select: { id: { k: "id" }, name: { k: "name" }, applet_type: { k: "applet_type" }, description: { k: "description" }, is_multi_imsi: { k: "is_multi_imsi" }, multi_imsi_type: { k: "multi_imsi_type" }, ts: { k: "ts" } },
          where: [
            {
              k: "id",
              op: "equal",
              v: l_val,
            },
          ],
        };
        let applets = await this.$axios.$post("api/v1/applets/list", query);
        if (applets.length > 0) {
          this.applets = applets[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async getCampaignItems(p_mark) {
      try {
        let l_campaign_items_in_progress = await this.$axios.$get(`/statistics/v1/dashboard/stats/${p_mark}`);
        return l_campaign_items_in_progress;
      } catch (err) {
        console.error(err);
      }
    },
    async onChange() {
      let l_campaign_items = await this.getCampaignItems(0);
      if (!l_campaign_items) {
        return;
      }

      this.campaign_items_in_progress = l_campaign_items;
    },
    async initialize() {
      this.campaign = this.value;
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      this.translator = translator;
      this.expandOnState();
      this.hidden_filter = [
        {
          k: "campaign_id",
          op: "equal",
          v: this.campaign.id,
        },
      ];

      if (this.campaign.campaign_template_id) {
        await this.loadCampaignTemplate();
      }

      if (this.getLeadBy() == "card") {
        await this.loadCard();
        if (this.card) {
          await this.loadUicc();
          await this.loadCardApplets();
          await this.loadApplets();
          await this.loadCardKeyStore();
        }
      }
      this.campaign_items_in_progress = await this.getCampaignItems(0);
      this.loading = false;
    },
    async loadCampaignTemplate() {
      try {
        let query = {
          select: {},
          where: [
            {
              k: "id",
              op: "equal",
              v: this.campaign.campaign_template_id,
            },
          ],
        };
        let campaign_template = await this.$axios.$post("api/v1/campaign_templates/list", query);
        if (campaign_template.length > 0) {
          this.campaign_template = campaign_template[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      this.loading = false;
    },
    async countParticipantsByState() {
      try {
        let body = {
          campaign_id: this.campaign.id,
        };

        let answer = await this.$axios.$post("api/v1/campaign_participants/count", body);
        if (answer.length > 0) {
          this.participant_states = answer;
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async changeState(action) {
      try {
        let request = { id: this.campaign.id, action };
        let answer = await this.$axios.$post("/api/v1/campaigns/action", request);
        if (answer != null) {
          this.campaign = answer;
          this.cp_key++;
          if (this.participant_states.length > 0) {
            await this.countParticipantsByState();
          }
          this.tellUser("success", `ID: ${this.campaign.id} state successfully changed to ${action}.`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async updateState(item, action) {
      try {
        let request = {
          id: item.id,
          version: item.version,
          action,
        };
        let answer = await this.$axios.$post("/api/v1/campaign_participants/action", request);
        if (answer != null) {
          this.tellUser("success", `${answer.iccid} state successfully changed to ${answer.state}.`);
          this.cp_key++;
          if (this.participant_states.length > 0) {
            await this.countParticipantsByState();
          }
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async pull_api_data() {
      if (this.pulling_in_progress) {
        return;
      }

      if (this.campaign.state != "process" && this.campaign.state != "scheduled") {
        return;
      }

      this.pulling_in_progress = true;

      try {
        let lcampaign = await this.$axios.$get(`/api/v1/campaigns/${this.campaign.id}`);

        if (lcampaign.state == "scheduled") {
          this.pulling_in_progress = false;
          return;
        }

        if (lcampaign.state != this.campaign.state) {
          this.campaign.state = lcampaign.state;
          this.cp_key++;
        }
      } catch (err) {
        console.log(`campaign - pull_api_data - error: ${err}`);
      }

      this.pulling_in_progress = false;
    },
    async saveCampaignVal() {
      try {
        let request = this.campaign;

        if (request.hasOwnProperty("ts")) {
          delete request.ts;
        }
        if (request.hasOwnProperty("start_time")) {
          delete request.start_time;
        }
        if (request.hasOwnProperty("end_time")) {
          delete request.end_time;
        }

        let answer = await this.$axios.$put(`/api/v1/campaigns/${request.id}`, request);
        this.tellUser("success", `Campaign Id:${answer.id} updated successfully.`);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    formatHeader(header) {
      let l_header = header;

      l_header.type = "link";
      l_header["path"] = "/resources/campaign_template/";
      l_header["query"] = { id: this.campaign.campaign_template_id };
      l_header.data = this.campaign_template ? this.campaign_template.name : 0;

      return l_header;
    },
    formatCampaignTemplateTitle() {
      let l_template = this.campaign_template;

      if (l_template) {
        return `Campaign Template - ${l_template.name}`;
      }
    },
    formatCampaignTemplateParams(origin) {
      let param_defs = [];

      if (this.campaign_template) {
        if (this.campaign_template.hasOwnProperty("param_def")) {
          let l_param_def = this.campaign_template.param_def;

          if (l_param_def.hasOwnProperty("data")) {
            param_defs = l_param_def.data
              .filter((f) => f.origin == origin)
              .map((f) => {
                return {
                  text: f.desc,
                  ...f,
                };
              });
          }
        }
      }

      return param_defs;
    },
    getParamVal(param, param_val) {
      let l_val = "";

      for (const [k, v] of Object.entries(param_val)) {
        if (k == param.name) {
          l_val = v;
        }
      }

      return l_val;
    },
    onParamChanged(param, param_val, event) {
      param_val[param.name] = event;
    },
    getCampaignParamData() {
      let l_data = {};
      if (this.campaign) {
        if (Object.keys(this.campaign.param_val).length > 0) {
          l_data = this.campaign.param_val;
        } else {
          let l_param_data = this.formatCampaignTemplateParams("campaign");
          l_param_data.map((m) => {
            let l_obj = { [m.name]: m.default };
            Object.assign(l_data, l_obj);
          });
          this.campaign.param_val = l_data;
        }
      }
      return l_data;
    },
    disableParamEdit() {
      let l_disable = false;
      let l_permissions = this.permissions.find((p) => p.res == "campaign_participants");
      if (this.campaign.state != "created" || l_permissions.u == false) {
        l_disable = true;
      } else {
        l_disable = false;
      }

      return l_disable;
    },
  },
};
</script>
