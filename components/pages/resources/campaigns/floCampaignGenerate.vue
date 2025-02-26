<template>
  <div class="flo-campaign-generate">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col cols="12" class="pa-1">
          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <v-tabs v-model="tab_add_remove_selected" @change="onAddRemoveTabChange($event)">
                <v-tab key="by_file">Import</v-tab>
                <v-tab key="by_range">Range</v-tab>
                <v-tab key="by_cards">Cards</v-tab>
                <!-- <v-tab key="by_filter">Filter</v-tab> -->
              </v-tabs>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12">
              <v-tabs-items v-model="tab_add_remove_selected">
                <v-tab-item key="by_file">
                  <v-container fluid class="ma-0 pa-0">
                    <v-row no-gutters>
                      <v-col cols="12" class="pa-1">
                        <flo-meta-field-definition module="campaign_participants" resources="campaign_participants" :value="campaign_template" @import-export-create="onImportExportCreate($event)" :header_map="getHeaderMap()" local :local_permissions="getLocalPermissions()" :local_meta="getLocalMeta('participant')" :local_data="getLocalData()" :can_import="crud.e" />
                      </v-col>
                    </v-row>
                  </v-container>
                </v-tab-item>

                <v-tab-item key="by_range">
                  <v-card flat outlined class="ma-0 pa-0">
                    <v-container fluid class="ma-0 pa-0">
                      <v-row no-gutters>
                        <v-col cols="12" lg="3" xl="3" class="pa-1">
                          <v-text-field v-model="range.iccid_start.value" :label="range.iccid_start.label" :hint="range.iccid_start.hint" :type="range.iccid_start.type" :rules="range.iccid_start.rule" :disabled="progress_gen" persistent-hint outlined dense counter></v-text-field>
                        </v-col>
                        <v-col cols="12" lg="3" xl="3" class="pa-1">
                          <v-text-field v-model="range.iccid_end.value" :label="range.iccid_end.label" :hint="range.iccid_end.hint" :type="range.iccid_end.type" :rules="range.iccid_end.rule" :disabled="progress_gen" persistent-hint outlined dense counter></v-text-field>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card>
                </v-tab-item>

                <v-tab-item key="by_cards">
                  <v-container fluid class="ma-0 pa-0">
                    <v-row no-gutters>
                      <v-col cols="12" class="pa-1">
                        <flo-meta-table v-if="translator !== null" unique="generate" :value="selected_cards" :show_select="true" :title="title" :show_title="false" item_key="iccid" :disableNew="true" @load-data="onLoadData($event)" @query="onQuery($event)" @query_change="onQueryChange($event)" @selection-changed="onCardsSelectionChanged($event)" :translator="translator" :hidden_filter="hidden_filter" :can_import="crud.e" resources="cards">
                          <template v-slot:view_state="{ fmtrow }">
                            <v-chip label color="info">{{ getState(fmtrow.state) }}</v-chip>
                          </template>
                          <template v-slot:view_ota_state="{ fmtrow }">
                            <v-chip label class="text-capitalize" :color="getOtaState(fmtrow.ota_state)">{{ fmtrow.ota_state }}</v-chip>
                          </template>
                          <template v-slot:view_scp_state="{ fmtrow }">
                            <v-chip label :color="getScpState(fmtrow.scp_state)">{{ fmtrow.scp_state }}</v-chip>
                          </template>

                          <template v-slot:view_iccid="{ fmtrow }">
                            <v-container class="d-flex flex-nowrap ma-0 pa-0">
                              <span class="align-self-center text-center">{{ fmtrow.iccid }}</span>

                              <v-btn icon class="ml-1" elevation="0" router :to="{ path: '/resources/card/', query: { iccid: fmtrow.iccid } }">
                                <v-icon center color="info">mdi-link</v-icon>
                              </v-btn>
                            </v-container>
                          </template>
                        </flo-meta-table>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-tab-item>

                <!-- <v-tab-item key="by_filter">
                    <v-container fluid class="ma-0 pa-0">
                      <v-row no-gutters>
                        <v-col cols="12" class="pa-1">
                          <flo-meta-table v-if="translator !== null" :disableNew="true" item_key="iccid" @load-data="onLoadData($event)" @query="onQuery($event)" @query_change="onQueryChange($event)" :show_title="false" :title="title" :translator="translator" :hidden_filter="hidden_filter" resources="cards">
                            <template v-slot:view_state="{ fmtrow, dense }">
                              <v-chip v-if="fmtrow.state == 'boot'" label :small="dense" color="warning">{{ fmtrow.state }}</v-chip>
                              <v-chip v-else-if="fmtrow.state == 'active'" label :small="dense" color="success">{{ fmtrow.state }}</v-chip>
                              <v-chip v-else label :small="dense" color="info">{{ fmtrow.state }}</v-chip>
                            </template>

                            <template v-slot:view_iccid="{ fmtrow }">
                              <v-container class="d-flex flex-nowrap ma-0 pa-0">
                                <span class="align-self-center text-center">{{ fmtrow.iccid }}</span>
                                <v-btn icon class="ml-1" elevation="0" router :to="{ path: '/resources/card/', query: { iccid: fmtrow.iccid } }">
                                  <v-icon center color="info">mdi-link</v-icon>
                                </v-btn>
                              </v-container>
                            </template>
                          </flo-meta-table>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-tab-item> -->
              </v-tabs-items>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row no-gutters v-if="progress_gen">
        <v-col cols="12" class="pa-1">
          <v-progress-linear color="success" height="7" indeterminate rounded></v-progress-linear>
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col cols="12" class="pa-1">
          <v-btn :disabled="disabledAdd" color="primary" @click="execAddRemove('add')">
            <v-icon left>mdi-plus</v-icon>
            Add
          </v-btn>
          <v-btn :disabled="disabledRemove" color="primary" @click="execAddRemove('remove')">
            <v-icon left>mdi-minus</v-icon>
            Remove
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import floMetaFieldDefinition from "~/components/crud/floMetaFieldDefinition.vue";
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import { mapGetters, mapActions } from "vuex";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  head() {
    return {
      title: this.title,
    };
  },
  name: "flo-campaign-generate",
  components: {
    floMetaFieldDefinition,
  },
  data() {
    return {
      helpers,
      translator: null,
      title: "Campaign",
      tab_add_remove_selected: 0,
      param_val: [],
      hidden_filter: [],
      selected_cards: [],
      selected_iccids: [],
      filter: [],
      range: {
        iccid_start: {
          label: "Start ICCID",
          hint: "Start of the ICCID range",
          value: "",
          input: "text",
          type: "text",
          rule: [(v) => (/^[0-9]{15,22}$/.test(v) && !!v) || "Accepted ICCID length is between 15 and 22 digits."],
        },
        iccid_end: {
          label: "End ICCID",
          hint: "End of the ICCID range",
          value: "",
          input: "text",
          type: "text",
          rule: [(v) => (/^[0-9]{15,22}$/.test(v) && !!v) || "Accepted ICCID length is between 15 and 22 digits."],
        },
      },
      crud: null,
      generated: null,
      progress_gen: false,
      progress_gen_value: 0,
    };
  },
  props: {
    campaign: {
      type: Object,
      required: true,
      default: null,
    },
    campaign_template: {
      type: Object,
      default: null,
    },
    uicc: {
      type: null,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters({
      getResourceKey: "session/getResourceKey",
      getPermissions: "session/permissions",
    }),
    disabledAdd() {
      let lvalid = true;
      if (!this.disabled) {
        switch (this.tab_add_remove_selected) {
          case 0:
            {
              // by_file
              if (this.param_val.length > 0) {
                lvalid = false;
              }
            }
            break;
          case 1:
            {
              // by_range
              if (this.range.iccid_start.value != "" && this.range.iccid_end.value != "") {
                lvalid = false;
              }

              if (this.progress_gen) {
                lvalid = true;
              }
            }
            break;
          case 2:
            {
              // by_cards
              if (this.selected_iccids.length > 0) {
                lvalid = false;
              }
            }
            break;
          // case 3:
          //   {
          //     // by_filter
          //     if (this.filter.length > 0) {
          //       lvalid = false;
          //     }
          //   }
          //   break;
        }
      }

      return lvalid;
    },
    disabledRemove() {
      let lvalid = true;

      if (!this.disabled) {
        switch (this.tab_add_remove_selected) {
          case 0:
            {
              // by_file
              if (this.param_val.length > 0) {
                lvalid = false;
              }
            }
            break;
          case 1:
            {
              // by_range
              if (this.range.iccid_start.value != "" && this.range.iccid_end.value != "") {
                lvalid = false;
              }
              if (this.progress_gen) {
                lvalid = true;
              }
            }
            break;
          case 2:
            {
              // by_cards
              if (this.selected_iccids.length > 0) {
                lvalid = false;
              }
            }
            break;
          // case 3:
          //   {
          //     // by_filter
          //     if (this.filter.length > 0) {
          //       lvalid = false;
          //     }
          //   }
          //   break;
        }
      }

      return lvalid;
    },
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    ...mapActions({
      addToResourceCache: "session/addToResourceCache",
    }),
    async initialize() {
      this.crud = this.getPermissions.find((f) => "campaigns" == f.res);
      let translator = new OTranslator();
      if (this.campaign_template.lead_by == "card") {
        this.hidden_filter = [
          {
            k: "uicc_id",
            op: "equal",
            v: this.uicc.id,
          },
        ];
        await this.loadOrder(translator);
        await this.loadUiccs(translator);
      }
      translator.setTimeStamp("last_seen");
      this.translator = translator;
    },
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
          case "action":
            {
              header.view = false;
            }
            break;
        }
      }
    },
    onQuery(query) {
      query["select"] = {
        id: {},
        iccid: {},
        state: {},
        ota_state: {},
        scp_state: {},
        description: {},
        uicc_id: {},
        order_id: {},
      };
    },
    onQueryChange(event) {
      console.log(`flo-campaign-generate - onQueryChange - event: ${JSON.stringify(event)}`);
      this.filter = [];
      if (event.hasOwnProperty("where")) {
        this.filter = event.where;
      }
    },
    async addRemove(p_action) {
      let request = {
        campaign_id: this.campaign.id,
        data: {
          action: p_action,
        },
      };

      let l_data = request.data;
      switch (this.tab_add_remove_selected) {
        case 0:
          {
            // by_file
            request["type"] = "by_cards";
            l_data["iccids"] = this.param_val.map((m) => m.iccid);
            l_data["param_val"] = this.param_val;
          }
          break;
        case 1:
          {
            // by_range
            request["type"] = "by_range";
            l_data["iccid_start"] = this.range.iccid_start.value;
            l_data["iccid_end"] = this.range.iccid_end.value;
          }
          break;
        case 2:
          {
            // by_cards
            request["type"] = "by_cards";
            console.log(`flo-campaign-generate - addRemove - selected_cards: ${JSON.stringify(this.selected_iccids)}`);
            l_data["iccids"] = this.selected_iccids;
          }
          break;
        // case 3:
        //   {
        //     // by_filter
        //     request["type"] = "by_filter";
        //     l_data["filter"] = this.filter;
        //   }
        //   break;
      }

      console.log(`flo-campaign-generate - generate: ${JSON.stringify(request)}`);
      let answer = null;
      try {
        let options = {
          onDownloadProgress: (progressEvent) => {
            this.progress_gen_value = progressEvent.loaded * (progressEvent.total / 100);
          },
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };

        console.log(`flo-campaign-generate - request: ${JSON.stringify(request)}`);

        let formData = new FormData();
        formData.append("request", JSON.stringify(request));
        console.log(`flo-campaign-generate - request: ${JSON.stringify(formData)}`);

        this.progress_gen = true;
        answer = await this.$axios.$post("api/v1/campaign_participants/addremove", formData, options);
        console.log(`flo-campaign-generate - answer: ${JSON.stringify(answer)}`);

        if (p_action == "add") {
          answer = answer.replace(/@/g, "");
          answer = JSON.parse(answer);
        }
        console.log(`flo-campaign-generate - no @ answer: ${JSON.stringify(answer)}`);
        console.log(`flo-campaign-generate - parse answer: ${JSON.stringify(answer)}`);

        this.selected_cards = [];
        this.selected_iccids = [];
        console.log(`flo-campaign-generate - answer: ${JSON.stringify(answer)}`);

        if (answer) {
          let lmsg = `${p_action} Participants - requested: ${answer.requested}, Affected: ${answer.affected}`;
          if (answer.requested != answer.affected) {
            this.tellUser("warning", lmsg);
          } else if (answer.requested == answer.affected) {
            this.tellUser("success", lmsg);
          }
        }

        this.progress_gen = false;
      } catch (err) {
        this.progress_gen = false;
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      return answer;
    },
    async execAddRemove(p_action) {
      this.generated = await this.addRemove(p_action);
      if (this.generated) {
        this.$emit("generated", this.generated);
      }
    },
    onImportExportCreate(event) {
      if (event) {
        if (event.hasOwnProperty("data")) {
          this.param_val.push(event.data);
        }
      }
    },
    getLocalPermissions() {
      let l_permissions = {
        c: false,
        r: true,
        u: false,
        d: false,
        e: false,
        res: "campaign_participants",
      };

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
            0: "iccid",
          },
        },
        isolated: true,
        item_name: this.helpers.capitalizeFLetter(val),
        limit: 100,
        screen_name: `${this.helpers.capitalizeFLetter(val)}s`,
        group: "none",
        table: "none",
        keys: {
          iccid: {
            pos: 1,
            name: "iccid",
            desc: "ICCID",
            hint: "Integrated Circuit Card Identifier",
            default: "",
            origin: "participants",
            type: "string",
            pattern: "^[0-9]{15,22}$",
            required: true,
          },
        },
      };

      if (this.campaign_template.hasOwnProperty("param_def")) {
        let l_param_def = this.campaign_template.param_def;
        if (l_param_def.hasOwnProperty("data")) {
          let l_data = l_param_def.data;

          l_data
            .filter((f) => f.origin == "participants")
            .map((f) => {
              let l_f = { [f.name]: f };
              l_meta.keys = { ...l_meta.keys, ...l_f };
            });
        }
      }

      return l_meta;
    },
    getLocalData() {
      let l_recs = JSON.parse(JSON.stringify([]));

      let l_data = this.param_val;
      if (!l_data) {
        return l_recs;
      }

      l_recs = JSON.parse(JSON.stringify(l_data));

      return l_recs;
    },
    getHeaderMap() {
      let l_map = [];
      let l_meta = this.getLocalMeta("participant");

      if (l_meta.hasOwnProperty("keys")) {
        l_map = Object.keys(l_meta.keys);
      }

      return l_map;
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
    onAddRemoveTabChange(event) {
      console.log(`flo-campaign-generate: onAddRemoveTabChange - enter - ${event}`);
    },
    onCardsSelectionChanged(event) {
      console.log(`flo-campaign-generate: onCardsSelectionChanged - enter`);
      this.selected_iccids = event.map((m) => m.iccid);
    },
    async loadOrder(translator) {
      try {
        let order_name = await this.$axios.$post("api/v1/orders/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        translator.setEnumEx("order_id", order_name, true);
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
  },
};
</script>
