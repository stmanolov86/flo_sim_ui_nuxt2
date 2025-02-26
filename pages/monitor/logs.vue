<template>
  <div>
    <flo-meta-table v-if="translator !== null" @query="onQuery($event)" @load-data="onLoadData($event)" :translator="translator" :resources="resources" main_resource :hidden_filter="hidden_filter" show_time_range>
      <template v-slot:view_code="{ fmtrow }">
        <v-chip label :color="getCodeColor(fmtrow.code)">{{ fmtrow.code }}</v-chip>
      </template>
      <template v-slot:edit_code="{ fmtrow }">
        <v-col cols="12" lg="6" class="d-flex justify-center align-center">
          <v-chip label :color="getCodeColor(fmtrow.code)">Code: {{ fmtrow.code }}</v-chip>
        </v-col>
      </template>

      <template v-slot:view_mtype="{ fmtrow }">
        <v-chip label color="info">{{ fmtrow.mtype }}</v-chip>
      </template>

      <template v-slot:view_msg="{ fmtrow }">
        <template v-for="(v, k, i) in displayMsg(fmtrow.msg, fmtrow.msubtype)">
          <v-chip label class="mr-1 my-1" v-if="v && i <= 6" :key="i">{{ k }}: {{ v }}</v-chip>
        </template>
      </template>

      <template v-slot:edit_msg="{ fmtheader, fmtrow }">
        <v-col cols="12">
          <flo-json-editor :__qa="helpers.getQATag(resources, fmtheader)" :name="`log`" :mode="`view`" :modes="['view']" v-model="fmtrow.msg"></flo-json-editor>
        </v-col>
      </template>

      <template v-slot:view_identity="{ fmtrow }">
        <v-container class="d-flex flex-nowrap">
          <template v-if="formatIdentity(fmtrow) == ''">Unidentified</template>
          <template v-else>
            <span class="align-self-center">{{ formatIdentity(fmtrow) }}</span>
            <v-btn class="mx-2" icon elevation="0" router :to="identityLink(fmtrow.mtype, fmtrow.msg, fmtrow.identity)">
              <v-icon center color="info">mdi-link</v-icon>
            </v-btn>
          </template>
        </v-container>
      </template>
    </flo-meta-table>
  </div>
</template>
<script>
import OTranslator from "~/src/otranslator.js";
import helpers from "~/src/helpers.js";
import enums from "~/src/enums.js";
export default {
  name: "flo-logs",
  data: () => ({
    enums,
    helpers,
    resource: "log",
    resources: "logs",
    translator: null,
    hidden_filter: [],
  }),
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      let translator = new OTranslator();
      translator.setEnum("code", "sms_code");
      translator.setEnum("mtype", "logs_mtype");
      translator.setEnum("msubtype", "logs_msubtype");
      translator.setTimeStamp("ts");
      this.translator = translator;
    },
    onLoadData(data) {
      for (const header of data.headers) {
        switch (header.value) {
          case "aid":
          case "aname":
          case "path":
            {
              header.view = false;
              header.edit = false;
            }
            break;
          case "id":
          case "ts":
            {
              header.edit = false;
              header.disable_new = true;
            }
            break;
        }
      }
    },
    onQuery(query) {
      query["orderby"] = { id: { o: "desc" } };
    },
    displayMsg(msg, msubtype) {
      if (null == msg) {
        return "";
      }
      if (msg.hasOwnProperty("details")) {
        let l_details = msg.details;
        let l_msubtype = this.translator.toSrcByKey("msubtype", msubtype);
        switch (l_msubtype) {
          case "trigger":
          case "suspend": {
            return msg;
          }
          case "location": {
            if (l_details.hasOwnProperty("bip")) {
              delete l_details.bip;
            }
            return l_details;
          }
          case "sms-out":
          case "sms-in":
          case "apn-request":
          case "scp_expired":
          case "scp80-ram":
          case "scp80-rfm":
          case "scp80-rfm-por":
          case "scp80-push":
          case "scp81-progress":
          case "scp80-applet-flolive":
          case "scp81-handshake": {
            let l_scp = {
              type: msg.type,
              smpp: msg.smpp,
              mobile: msg.mobile,
            };

            if (l_details.hasOwnProperty("response")) {
              let l_response = l_details.response;
              let hidden = ["config", "cards", "operations", "stack", "generated", "capdus", "push"];

              for (const key in l_response) {
                if (hidden.includes(key)) {
                  delete l_response[key];
                }
              }

              l_scp = {
                ...l_scp,
                ...l_response,
              };
            }

            return l_scp;
          }
          case "connectivity": {
            let l_connectivity = {
              type: msg.type,
              state: msg.state,
            };

            if (l_details.hasOwnProperty("timeStamp")) {
              l_details.timeStamp = helpers.toLocalTimeInIsoFormatUi(l_details.timeStamp);
            }
            if (l_details.hasOwnProperty("headers")) {
              const l_headers = l_details.headers;
              for (const k in l_headers) {
                l_connectivity[k] = l_headers[k];
              }
            }
            return l_connectivity;
          }
          case "command":
            {
              if (l_details.hasOwnProperty("response")) {
                if (l_details.response.hasOwnProperty("id")) {
                  return { imsi: l_details.response.imsi };
                } else {
                  return l_details.response;
                }
              }
            }
            break;
          case "campaign": {
            if (l_details.hasOwnProperty("id")) {
              return { id: l_details.id, template: l_details.template };
            }
          }
        }
      } else if (msg.hasOwnProperty("changed")) {
        let l_msg = msg.changed;

        let l_changed = {
          id: l_msg.id,
          campaign_id: l_msg.campaign_id,
          name: l_msg.name,
          fname: l_msg.fname,
          iccid: l_msg.iccid,
          imsi: l_msg.imsi,
          msisdn: l_msg.msisdn,
          state: l_msg.state,
          type: l_msg.type,
          resource: l_msg.resource,
          manufacturer: l_msg.manufacturer,
          data_type: l_msg.data_type,
          len: l_msg.len,
          code: l_msg.code,
          category: l_msg.category,
          tar: l_msg.tar,
          uaid: l_msg.uaid,
          url: l_msg.url,
          ota_user: l_msg.ota_user,
          ota_retry: l_msg.ota_retry,
          ota_state: l_msg.ota_state,
          is_multi_imsi: l_msg.is_multi_imsi,
          multi_imsi_type: l_msg.multi_imsi_type,
        };

        if (l_msg.hasOwnProperty("ts")) {
          l_changed["timeStamp"] = helpers.toLocalTimeInIsoFormatUi(l_msg.ts);
        }

        for (const [k, v] of Object.entries(l_changed)) {
          if (!v) {
            delete l_changed[k];
          }
        }

        return l_changed;
      } else if (msg.hasOwnProperty("error")) {
        return msg.error;
      } else {
        return msg;
      }
    },
    formatIdentity(row) {
      let l_identity = "";
      let l_msg = row.msg.hasOwnProperty("changed") ? row.msg.changed : null;

      switch (row.mtype.replaceAll(" ", "_").toLowerCase()) {
        case "applets":
        case "uiccs":
        case "uicc_aids":
        case "virtual_file_defintion":
        case "virtual_file_defintions":
        case "orders":
        case "products":
        case "campaigns":
        case "campaign_participants":
        case "card_settings":
        case "card_subscribers":
        case "card_virtual_files":
          l_identity = l_msg.hasOwnProperty("name") ? l_msg.name : l_msg.id;
          break;
        case "cards":
          l_identity = l_msg.hasOwnProperty("iccid") ? l_msg.iccid : l_msg.id;
          break;
        case "rfs":
          l_identity = l_msg.hasOwnProperty("fname") ? l_msg.fname : l_msg.id;
          break;
        default:
          l_identity = row.identity;
          break;
      }

      return l_identity;
    },
    identityLink(mtype, msg, identity) {
      let to = null;

      switch (mtype.replaceAll(" ", "_").toLowerCase()) {
        case "card":
          {
            to = {
              path: "/resources/card/",
              query: { iccid: identity },
            };
          }
          break;
        case "cards":
        case "card_settings":
        case "card_subscribers":
        case "card_virtual_files":
          {
            to = {
              path: "/resources/card/",
              query: { iccid: msg.changed.iccid },
            };
          }
          break;
        case "registrar":
        case "registrars":
          {
            to = {
              path: "/network/registrar/",
              query: { name: identity },
            };
          }
          break;
        case "hsm":
        case "hsms":
          {
            to = {
              path: "/network/hsms/",
              query: { name: identity },
            };
          }
          break;
        case "smsc":
        case "smscs":
          {
            to = {
              path: "/network/smsc/",
              query: { name: identity },
            };
          }
          break;
        case "billing":
        case "billings":
          {
            to = {
              path: "/network/billing/",
              query: { name: identity },
            };
          }
          break;
        case "bip":
        case "bips":
          {
            to = {
              path: "/network/bip/",
              query: { name: identity },
            };
          }
          break;
        case "subscriber":
        case "subscribers":
          {
            to = {
              path: "/resources/subscriber/",
              query: { imsi: identity },
            };
          }
          break;
        case "order":
        case "orders":
          {
            to = {
              path: "/resources/order/",
              query: { id: msg.changed.id },
            };
          }
          break;
        case "products":
          {
            to = {
              path: "/resources/product/",
              query: { id: msg.changed.id },
            };
          }
          break;
        case "campaign":
        case "campaigns":
          {
            to = {
              path: "/resources/campaigns/",
              query: { id: msg.changed.id },
            };
          }
          break;
        case "uiccs":
          {
            to = {
              path: "/resources/uicc/",
              query: { id: msg.changed.id },
            };
          }
          break;
        case "uicc_aids":
        case "virtual_file_defintion":
          {
            to = {
              path: "/resources/uicc/",
              query: { id: msg.changed.uicc_id },
            };
          }
          break;
        case "rfs":
        case "virtual_file_defintions":
          {
            to = {
              path: `/resources/${msg.changed.resource == "uicc" ? "uicc" : "applet"}/`,
              query: { id: msg.changed.rid },
            };
          }
          break;
        case "campaign_participants":
          {
            to = {
              path: "/resources/campaign/",
              query: { id: msg.changed.campaign_id },
            };
          }
          break;
        case "applets":
          {
            to = {
              path: "/resources/applet/",
              query: { id: msg.changed.id },
            };
          }
          break;
        default: {
          to = {
            path: "/dashboard",
          };
        }
      }

      return to;
    },
    getCodeColor(code) {
      return code <= 230 ? "success" : code >= 400 ? "error" : "warning";
    },
  },
};
</script>
