<template>
  <div>
    <flo-meta-table v-if="translator !== null" @load-data="onLoadData($event)" @pre-new="onPreNew($event)" :translator="translator" :resources="resources" main_resource :can_import="crud.e" :init_filter="init_filter" dialogWidth="930px">
      <template v-slot:ex_new="{ fab, color, smAndDown }">
        <v-btn :fab="fab" :small="smAndDown" class="mr-1" :color="color" router :to="{ path: '/resources/campaign_templates/' }">
          <v-icon :left="!smAndDown">mdi-content-duplicate</v-icon>
          {{ !smAndDown ? "Templates" : "" }}
        </v-btn>
      </template>
      <template v-slot:edit_start_time="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" xl="6">
          <VueCtkDateTimePicker v-model="fmtrow.start_time" no-button no-value-to-custom-elem no-button-now format="YYYY-MM-DD HH:mm:ss" :first-day-of-week="1" :color="$vuetify.theme.currentTheme.primary" :dark="$vuetify.theme.dark ? true : false">
            <v-text-field v-model="fmtrow.start_time" label="Start Time" :hint="formatStartTimeHint(fmtrow.start_time)" :disabled="!fmtpermissions.u" persistent-hint></v-text-field>
          </VueCtkDateTimePicker>
        </v-col>
      </template>
      <template v-slot:edit_end_time="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" xl="6">
          <VueCtkDateTimePicker v-model="fmtrow.end_time" no-button no-value-to-custom-elem no-button-now format="YYYY-MM-DD HH:mm:ss" :first-day-of-week="1" :color="$vuetify.theme.currentTheme.primary" :dark="$vuetify.theme.dark ? true : false">
            <v-text-field v-model="fmtrow.end_time" label="End Time" :hint="formatEndTimeHint(fmtrow.end_time)" :disabled="!fmtpermissions.u" persistent-hint></v-text-field>
          </VueCtkDateTimePicker>
        </v-col>
      </template>
      <template v-slot:edit_path="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <flo-account-select v-model="fmtrow.path" :label="fmtheader.text" :disabled="!fmtpermissions.u" :hint="fmtheader.hint" persistent-hint />
        </v-col>
      </template>
      <template v-slot:view_state="{ fmtrow }">
        <v-chip label class="text-capitalize" :color="getStateColor(fmtrow.state)">{{ fmtrow.state }}</v-chip>
      </template>
      <template v-slot:view_priority="{ fmtrow }">
        <v-chip label class="text-capitalize" :color="getPriorityColor(fmtrow.priority)">{{ fmtrow.priority }}</v-chip>
      </template>
      <template v-slot:view_retry_interval="{ fmtrow }">
        <span>{{ formatRetryIntervalView(fmtrow.retry_interval) }}</span>
      </template>
      <template v-slot:edit_retry_interval="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" xl="6">
          <v-text-field v-model="fmtrow.retry_interval" :label="fmtheader.text" :hint="formatRetryIntervalHint(fmtrow.retry_interval)" :disabled="!fmtpermissions.u" persistent-hint></v-text-field>
        </v-col>
      </template>
      <template v-slot:view_campaign_template_id="{ fmtrow }">
        <span v-if="fmtrow.campaign_template_id == 0"></span>
        <v-chip v-else label :color="getCampaignTemplateColor(fmtrow.campaign_template_id)">{{ fmtrow.campaign_template_id }}</v-chip>
      </template>
      <template v-slot:edit_campaign_template_id="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <v-autocomplete v-model="fmtrow.campaign_template_id" :label="fmtheader.text" :hint="fmtheader.hint" :items="campaign_templates" :disabled="!fmtpermissions.u" item-text="value" item-value="value" filled persistent-hint></v-autocomplete>
        </v-col>
      </template>
      <template v-slot:view_name="{ fmtrow, fmtpermissions }">
        <v-container class="d-flex flex-nowrap">
          <span class="align-self-center text-center ml-n3">{{ fmtrow.name }}</span>
          <v-btn
            class="ml-1"
            icon
            elevation="0"
            router
            :disabled="!fmtpermissions.r"
            :to="{
              path: '/resources/campaign/',
              query: { id: fmtrow.id },
            }"
          >
            <v-icon center color="info">mdi-link</v-icon>
          </v-btn>
        </v-container>
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
export default {
  data: () => ({
    helpers,
    resource: "campaign",
    resources: "campaigns",
    translator: null,
    init_filter: [],
    campaign_templates: [],
    crud: null,
  }),
  computed: {
    ...mapGetters({
      getResourceKey: "session/getResourceKey",
      getPermissions: "session/permissions",
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
    onLoadData(data) {
      for (const header of data.headers) {
        switch (header.value) {
          case "id":
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "aid":
          case "card_action":
            {
              header.edit = false;
              header.view = false;
            }
            break;
          case "start_time":
          case "end_time":
            {
              header.gpath = "/Campaign Duration";
            }
            break;
          case "retry":
          case "retry_interval":
            {
              header.gpath = "/Campaign Retries";
            }
            break;
          case "state":
            {
              header.disable_new = true;
              header.disable_edit = true;
            }
            break;
          case "path":
            {
              header.view = false;
            }
            break;
          case "low":
            {
              header.gpath = "/Throttling";
              header.view = false;
              header.edit = false;
            }
            break;
          case "high":
          case "bulk":
            {
              header.gpath = "/Throttling";
              header.view = false;
            }
            break;
          case "param_val":
            {
              header.edit = false;
              header.view = false;
            }
            break;
        }
      }
    },
    async initialize() {
      this.crud = this.getPermissions.find((f) => this.resources == f.res);
      if (this.$route.query.id) {
        this.init_filter = [
          {
            k: "id",
            op: "equal",
            v: this.$route.query.id,
          },
        ];
      }

      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      translator.setTimeStamp("start_time");
      translator.setTimeStamp("end_time");
      await this.loadCampaignTemplates(translator);
      this.translator = translator;
    },
    onPreNew(data) {
      data.record.start_time = helpers.setDateTime(null);
      data.record.end_time = helpers.setDateTime(7);
    },
    getStateColor(state) {
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
    getPriorityColor(priority) {
      let colorMap = {
        lazy: "info",
        normal: "primary",
        immediate: "warning",
      };

      return colorMap[priority] || "info";
    },
    formatRetryIntervalHint(interval) {
      let hint = "Retry interval in seconds, specify 0 for immediate execution.";
      let formatted = helpers.secondsToTime(interval);
      if (formatted) {
        hint = `${formatted} - or set to 0 for immediate execution.`;
      }

      return hint;
    },
    formatRetryIntervalView(interval) {
      let view = 0;
      let formatted = helpers.secondsToTime(interval);
      if (formatted) {
        view = formatted;
      }

      return view;
    },
    formatStartTimeHint(time) {
      return helpers.createdSince(time, "Campaign", "started", "starts");
    },
    formatEndTimeHint(time) {
      return helpers.createdSince(time, "Campaign", "ended", "ends");
    },
    getCampaignTemplateColor(id) {
      return id && typeof id == "string" ? (id.includes("Deprecated") ? "error" : "success") : "warning";
    },
    async loadCampaignTemplates(translator) {
      try {
        let campaign_templates = (
          await this.$axios.$post("api/v1/campaign_templates/list", {
            select: {
              key: { k: "id" },
              value: { k: "name" },
              state: { k: "state" },
            },
          })
        ).map(({ key, value, state }) => ({
          key,
          value: state == "deprecated" ? `${value} - Deprecated` : value,
          disabled: state == "deprecated" ? true : false,
        }));
        this.campaign_templates = campaign_templates;
        translator.setEnumEx("campaign_template_id", campaign_templates, true);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
  },
};
</script>
