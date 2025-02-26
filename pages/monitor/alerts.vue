<template>
  <div>
    <flo-meta-table v-if="translator !== null" @query="onQuery($event)" @load-data="onLoadData($event)" :translator="translator" :resources="resources" main_resource :hidden_filter="hidden_filter" show_time_range>
      <template v-slot:view_code="{ fmtrow }">
        <v-chip class="text-capitalize" :color="getCodeColor(fmtrow.code)" label>{{ fmtrow.code }}</v-chip>
      </template>

      <template v-slot:edit_code="{ fmtrow }">
        <v-col cols="12" lg="6" class="d-flex justify-center align-center">
          <v-chip class="text-capitalize" :color="getCodeColor(fmtrow.code)" label>{{ fmtrow.code }}</v-chip>
        </v-col>
      </template>

      <template v-slot:view_mtype="{ fmtrow }">
        <v-chip label color="info">{{ fmtrow.mtype }}</v-chip>
      </template>

      <template v-slot:view_msg="{ fmtrow }">
        <template v-for="(v, k, i) in displayMsg(fmtrow.msg)">
          <v-chip label class="mr-1 my-1" v-if="v && i <= 6" :key="i">{{ k }}: {{ v }}</v-chip>
        </template>
      </template>

      <template v-slot:edit_msg="{ fmtheader, fmtrow }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12">
          <flo-json-editor :name="`log`" :mode="`view`" :modes="['view']" v-model="fmtrow.msg"></flo-json-editor>
        </v-col>
      </template>

      <template v-slot:view_identity="{ fmtrow }">
        <v-container class="d-flex flex-nowrap">
          <template v-if="formatIdentity(fmtrow) == ''">Unidentified</template>
          <template v-else>
            <span class="align-self-center">{{ formatIdentity(fmtrow) }}</span>
            <v-btn class="mx-2" icon elevation="0" router :to="identityLink(fmtrow.mtype, fmtrow.identity)">
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
export default {
  name: "flo-alerts",
  data: () => ({
    helpers,
    resource: "alert",
    resources: "alerts",
    translator: null,
    hidden_filter: [],
  }),
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      let translator = new OTranslator();
      translator.setEnum("code");
      translator.setTimeStamp("ts");
      translator.setEnum("mtype", "alerts_mtype");
      translator.setEnum("msubtype", "alerts_msubtype");
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
    displayMsg(msg) {
      if (null == msg) {
        return "";
      }

      let l_msg = {
        smpp: msg.smpp,
        mobile: msg.mobile,
        name: msg.name,
        message: msg.details,
      };

      if (l_msg.message.length > 100) {
        l_msg.message = `${l_msg.message.substr(0, 100)}...`;
      }

      return l_msg;
    },
    formatIdentity(row) {
      let l_identity = "";

      switch (row.mtype.toLowerCase()) {
        case "orders":
        case "campaigns":
          l_identity = row.msg.hasOwnProperty("name") ? row.msg.name : row.msg.id;
          break;
        default:
          l_identity = row.identity;
          break;
      }

      return l_identity;
    },
    identityLink(mtype, identity) {
      let to = null;

      switch (mtype.toLowerCase()) {
        case "card":
        case "cards":
          {
            to = {
              path: "/resources/card/",
              query: { iccid: identity },
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
              query: { id: identity },
            };
          }
          break;
        case "campaign":
        case "campaigns":
          {
            to = {
              path: "/resources/campaign/",
              query: { id: identity },
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
      let colorMap = {
        info: "success",
        warning: "warning",
        error: "error",
        critical: "error",
      };

      return colorMap[code] || "warning";
    },
  },
};
</script>
