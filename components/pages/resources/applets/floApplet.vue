<template>
  <div class="flo-applet">
    <v-card flat outlined class="ma-0 pa-0">
      <v-card-text class="ma-0 pa-0">
        <v-container fluid class="ma-0 pa-0">
          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <div class="headline">
                Applet: {{ applet.record.name }}
                <v-chip v-if="applet.record.hasOwnProperty('state')" label class="text-capitalize" :color="getStateColor(applet.record.state)">{{ applet.record.state }}</v-chip>
              </div>
              <v-row no-gutters>
                <v-col cols="10">
                  <blockquote class="blockquote font-weight-light">
                    Id: <code>{{ applet.record.id }}</code>
                    <span v-if="applet.record.description != ''">
                      , Description: <code>{{ applet.record.description }}</code></span
                    >
                    <span v-if="applet.record.v_major != ''">
                      , Major version: <code>{{ applet.record.v_major }}</code></span
                    >
                    <span v-if="applet.record.v_minor != ''">
                      , Minor version: <code>{{ applet.record.v_minor }}</code></span
                    >
                    <span v-if="applet.record.jc_version != ''">
                      , JC version: <code>{{ applet.record.jc_version }}</code></span
                    >
                    <span v-if="applet.record.uicc_version != ''">
                      , UICC version: <code>{{ applet.record.uicc_version }}</code></span
                    >
                    <span v-if="applet.record.usim_version != ''">
                      , USIM version: <code>{{ applet.record.usim_version }}</code></span
                    >
                  </blockquote>
                </v-col>
                <div class="flex-grow-1"></div>
                <v-btn class="mt-5" v-if="applet.record.state == 'active'" color="primary" @click="changeState('deprecate')" :disabled="!crud.e">
                  <v-icon left>mdi-progress-alert</v-icon>
                  Deprecate</v-btn
                >
                <v-btn class="mt-5" v-if="applet.record.state == 'deprecated'" color="primary" @click="changeState('activate')" :disabled="!crud.e">
                  <v-icon left>mdi-progress-check</v-icon>
                  Activate</v-btn
                >
              </v-row>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Details" elevation="5">
                <template v-slot:content="{}">
                  <flo-meta-resource-view :translator="translator" :value="applet.record" resources="applets" :ignore="['attr', 'ram_ifl', 'ram_ifi', 'action']"></flo-meta-resource-view>
                </template>
              </flo-expand>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Setup" open elevation="5">
                <template v-slot:content="{}">
                  <v-container fluid class="ma-0 pa-0">
                    <v-row v-if="Object.keys(formattedTitle()).length > 0" no-gutters>
                      <v-col cols="12" class="ma-1 pa-1 align-center font-weight-regular title">
                        <span class="info--text">Version: </span><span>{{ formattedTitle().version }}, </span> <span class="info--text">revision: </span><span>{{ formattedTitle().revision }}, </span> <span class="info--text">updated at: </span><span>{{ formattedTitle().ts }} </span>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="6" class="pa-1">
                        <flo-rfs-field label="Upload Applet Setup" hint="Accepts .json file type." resource="applets" field="applet_setup" :id="applet.record.id" accept=".json" @change="applet_setup_changed($event)" :disabled="!hasPermissionToEdit()"></flo-rfs-field>
                      </v-col>
                      <v-col cols="6" class="pa-1">
                        <flo-rfs-field label="Upload Applet CAP" hint="Accepts .cap file type." resource="applets" field="cap" :id="applet.record.id" accept=".cap" @change="applet_cap_changed($event)" :disabled="!hasPermissionToEdit()"></flo-rfs-field>
                      </v-col>
                    </v-row>

                    <v-row v-if="applet.json != null" no-gutters>
                      <v-col cols="12" class="pa-1">
                        <flo-applet-json :value="applet.json" :record="applet.record" @update="onAppletUpdate($event)" :readonly="!hasPermissionToEdit()"></flo-applet-json>
                      </v-col>
                    </v-row>
                  </v-container>
                </template>
              </flo-expand>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <v-textarea name="notes" label="Notes:" hide-details clearable outlined no-resize rows="5" :value="getNotes()" @change="setNotes($event)"></v-textarea>
            </v-col>
            <v-col cols="12" class="pa-1" align="end">
              <v-btn color="primary" @click="saveNotes()" :disabled="!crud.u"> Save Notes </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import tellUser from "~/mixins/tellUser.js";
import DateUtils from "~/src/dateUtils.js";
import helpers from "~/src/helpers.js";
import floRfsField from "~/components/rfs/floRfsField.vue";
import floAppletJson from "~/components/pages/resources/applets/floAppletJson.vue";
import { mapGetters } from "vuex";
export default {
  head() {
    return {
      title: "Applet",
    };
  },
  name: "flo-applet",
  data: () => ({
    helpers,
    translator: null,
    applet_rfs: null,
    applet_setup: null,
    applet: {
      resource: "applet",
      resources: "applets",
      meta: [],
      headers: [],
      json: null,
      record: {
        template: "",
        boot_mark: 0,
        attr: {},
      },
      key: 0,
    },
    crud: null,
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
  components: {
    floAppletJson,
    floRfsField,
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    formattedTitle() {
      let l_title = {};

      if (this.applet.json) {
        let l_json = this.applet.json;
        if (l_json.hasOwnProperty("data")) {
          let l_data = l_json.data;
          if (l_data.hasOwnProperty("version")) {
            l_title["version"] = l_data.version;
          }
          if (l_data.hasOwnProperty("revision")) {
            l_title["revision"] = l_data.revision;
          }
          if (l_data.hasOwnProperty("ts")) {
            l_title["ts"] = l_data.ts;
          }
        }
      }

      return l_title;
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
    getStateColor(state) {
      let colorMap = {
        deprecated: "error",
        active: "success",
      };

      return colorMap[state] || "warning";
    },
    getNotes() {
      let lattr = this.applet.record.attr;
      if (lattr == null) {
        return "";
      }

      if (!lattr.hasOwnProperty("notes")) {
        return "";
      }
      return lattr.notes;
    },
    setNotes(event) {
      console.log(`card - setNotes - ${JSON.stringify(event)}`);
      if (!this.applet.record.attr) {
        this.applet.record.attr = {};
      }
      let lattr = this.applet.record.attr;
      lattr["notes"] = event;
    },
    hasPermissionToEdit() {
      if (this.applet.record.state == "active" && this.crud.c == true) {
        return true;
      }

      return false;
    },
    async saveNotes() {
      let answer = await this.updateAppletAttr();
      if (answer === "OK") {
        this.tellUser("success", `Notes Saved Successfully`);
      }
    },
    async updateAppletAttr() {
      let applet = {
        id: this.applet.record.id,
        attr: this.applet.record.attr,
      };

      console.log(`updateAppletAttr applet:${JSON.stringify(applet)}`);
      try {
        await this.$axios.$put(`/api/v1/applets/${this.applet.record.id}`, applet);
      } catch (err) {
        console.log(`updateAppletAttr - error: ${err}`);
        let aerr = this.parseNetError(err);
        console.log(`updateAppletAttr - application error: ${JSON.stringify(aerr)}`);
        this.tellUser("error", `${aerr.statusCode} - ${aerr.message}`);
        return "FAIL";
      }

      return "OK";
    },
    async applet_setup_changed() {
      await this.reload_applet_setup();
    },
    async applet_cap_changed() {
      await this.reload_applet_setup();
    },
    async ls_applet_setup() {
      let request = {
        field: "applet_setup",
        id: this.applet.record.id,
      };

      try {
        let answer = await this.$axios.$post(`/api/v1/applets/rfs/list`, request);
        if (answer.length > 0) {
          return answer[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      return null;
    },
    async cat(id) {
      let answer = null;
      try {
        answer = await this.$axios.$get(`/api/v1/applets/rfs/${id}`);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      return answer;
    },
    async reload_applet_setup() {
      this.applet.json = null;
      this.applet_rfs = null;

      let rfs = await this.ls_applet_setup();
      if (rfs) {
        this.applet_rfs = await this.cat(rfs.id);
        let bas64_pos = this.applet_rfs.content.data_url.indexOf(",") + 1;
        let applet_setup = atob(this.applet_rfs.content.data_url.substring(bas64_pos));
        this.applet.json = JSON.parse(applet_setup);

        await this.loadApplet();
      }
    },
    async initialize() {
      this.applet.record = this.value;
      this.crud = this.getPermissions.find((f) => "applets" == f.res);
      await this.reload_applet_setup();
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      this.loadDbEnums(translator);
    },
    async loadApplet() {
      let applet = [];
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
        applet = await this.$axios.$post("api/v1/applets/list", query);
        if (applet.length > 0) {
          this.applet.record = applet[0];
          this.applet.key++;
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      this.loading = false;
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
    async updateResource() {
      let binaryEncoded = btoa(JSON.stringify(this.applet.json));
      let item = {
        id: this.applet_rfs.id,
        rtype: "field",
        fname: this.applet_rfs.fname,
        ftype: this.applet_rfs.ftype,
        fsize: this.applet_rfs.fsize,
        resource: this.applet_rfs.resource,
        rid: this.applet.record.id,
        flm: DateUtils.localToLocalLikeIso(new Date()),
        content: { data_url: `data:application/json;base64,${binaryEncoded}` },
      };
      try {
        let answer = await this.$axios.$put(`/api/v1/applets/rfs/${this.applet.record.id}`, item);
        if (answer != null) {
          this.tellUser("success", `Id: ${this.applet.record.id} - ${this.applet_rfs.fname} updated successfully.`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async onAppletUpdate(event) {
      this.applet.json = event;
      await this.updateResource();
    },
    async changeState(action) {
      try {
        let request = { id: this.applet.record.id, action };
        let answer = await this.$axios.$post("/api/v1/applets/action", request);
        if (answer != null) {
          this.applet.record = answer;
          this.tellUser("success", `ID: ${this.applet.record.id} state successfully changed to ${this.applet.record.state}.`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
  },
};
</script>
