<template>
  <div class="flo-card-log">
    <v-container fluid>
      <v-row no-gutters>
        <v-col cols="12" class="mt-2">
          <flo-meta-table v-if="translator !== null" @load-data="onLoadData($event)" @query="onQuery($event)" :hidden_filter="hidden_filter" :show_title="false" :title="title" :translator="translator" resources="smss" show_time_range>
            <template v-slot:ex_new="{ smAndDown }">
              <v-fab-transition>
                <template v-if="!paused">
                  <v-btn :small="smAndDown" class="mt-n5" fab color="warning" @click="pauseLog(true)">
                    <v-icon>mdi-pause</v-icon>
                  </v-btn>
                </template>
                <template v-else>
                  <v-btn :small="smAndDown" class="mt-n5" fab color="success" @click="pauseLog(false)">
                    <v-icon>mdi-play</v-icon>
                  </v-btn>
                </template>
              </v-fab-transition>
            </template>

            <template v-slot:view_msg="{ fmtrow }">
              <template v-if="fmtrow.mtype == 'scp80-push'">
                <template v-for="(v, key, i) in displayMsg(fmtrow.response, fmtrow.msg, fmtrow.mtype)">
                  <v-chip label class="mr-1" :key="i" v-if="i <= 5 && v != ''">{{ key }}: {{ v }}</v-chip>
                </template>
              </template>

              <template v-else-if="fmtrow.mtype == 'location'">
                <template v-for="(v, key, i) in displayMsg(fmtrow.response, fmtrow.msg, fmtrow.mtype)">
                  <v-chip label class="mr-1" :key="i" v-if="i <= 5 && key != 'bip'">{{ key }}: {{ v }}</v-chip>
                </template>
              </template>

              <template v-else>
                <template v-for="(v, key, i) in displayMsg(fmtrow.response, fmtrow.msg, fmtrow.mtype)">
                  <v-chip label class="mr-1 my-1" :key="i" v-if="i <= 6">{{ key }}: {{ v }}</v-chip>
                </template>
              </template>
            </template>

            <template v-slot:view_dir="{ fmtrow }">
              <v-icon left :color="getDirection(fmtrow.dir, fmtrow.mtype, fmtrow.code).color">{{ getDirection(fmtrow.dir, fmtrow.mtype, fmtrow.code).icon }}</v-icon>
            </template>
            <template v-slot:view_corrid="{ fmtrow }">
              <span>{{ fmtrow.corrid.length > 10 ? fmtrow.corrid.substr(0, 10) + "..." : fmtrow.corrid }}</span>
            </template>

            <template v-slot:view_code="{ fmtrow }">
              <v-chip label class="ma-1" :color="smsCodeToColor(fmtrow.mtype, fmtrow.code)">
                <v-icon left>{{ smsCodeToIcon(fmtrow.code) }}</v-icon>
                {{ fmtrow.code }}
              </v-chip>
            </template>

            <template v-slot:view_mtype="{ fmtrow }">
              <v-chip label class="ma-1" :color="getType(fmtrow.mtype, fmtrow.code).color">
                <v-icon left>{{ getType(fmtrow.mtype, fmtrow.code).icon }}</v-icon>
                {{ getType(fmtrow.mtype, fmtrow.code).type }}
              </v-chip>
            </template>

            <template v-slot:edit_response="{ fmtheader, fmtrow }">
              <v-col :__qa="helpers.getQATag('smss', fmtheader)" cols="12">
                <flo-json-editor :name="`Response`" :mode="`view`" :modes="['view', 'preview', 'text']" v-model="fmtrow.response"></flo-json-editor>
              </v-col>
            </template>

            <template v-slot:edit_msg="{ fmtheader, fmtrow }">
              <v-col :__qa="helpers.getQATag('smss', fmtheader)" cols="12">
                <flo-json-editor :name="`Message`" :mode="`view`" :modes="['view', 'preview', 'text']" v-model="fmtrow.msg"></flo-json-editor>
              </v-col>
            </template>
          </flo-meta-table>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
import enums from "~/src/enums.js";
const COLORS = {
  trying: "info",
  failed: "error",
  sent: "success",
  delivered: "success",
  warning: "warning",
};
const ICONS = {
  trying: "mdi-sync",
  failed: "mdi-alert-circle-outline",
  warning: "mdi-alert-outline",
  sent: "mdi-check",
  delivered: "mdi-check-all",
};
export default {
  head() {
    return {
      title: this.title,
    };
  },
  name: "flo-card-log",
  data() {
    return {
      helpers,
      enums,
      title: "Card",
      paused: false,
      translator: null,
      sms_query: null,
      pulling_in_progress: false,
      pull_timer_id: 0,
      ts: null,
      smss: {
        records: [],
      },
    };
  },
  props: {
    iccid: {
      type: String,
      default: "",
    },
    hidden_filter: {
      type: Array,
      default: () => [],
    },
  },
  created() {
    this.initialize();
  },
  mounted() {
    this.pull_timer_id = setInterval(() => {
      this.pull_sms_data();
    }, 5000);
  },
  beforeDestroy() {
    if (0 != this.pull_timer_id) {
      clearInterval(this.pull_timer_id);
      this.pull_timer_id = 0;
    }
  },
  mixins: [tellUser, parseNetError],
  methods: {
    initialize() {
      let translator = new OTranslator();
      let l_filter = this.hidden_filter.filter((f) => f.op == "clike");
      let filtered = [];

      if (l_filter.length > 0) {
        filtered = enums()["sms_mtype"].filter((f) => f.key.startsWith("scp"));
      } else {
        filtered = enums()["sms_mtype"].filter((f) => !f.key.startsWith("scp"));
      }
      translator.setTimeStamp("ts");
      translator.setEnum("code", "sms_code");
      translator.setEnumEx("mtype", filtered, true);
      this.translator = translator;
    },
    onQuery(query) {
      let l_query = query;
      l_query["orderby"] = { id: { o: "desc" } };

      if (l_query.hasOwnProperty("where")) {
        let l_ts = l_query.where.find((f) => f.k == "ts");
        if (l_ts) {
          this.ts = l_ts;
        } else {
          l_query.where.push(this.ts);
        }
      }

      this.sms_query = l_query;
    },
    onLoadData(data) {
      this.smss.records = data.items;
      for (const header of data.headers) {
        switch (header.value) {
          case "imsi":
          case "msgid":
          case "source":
          case "destination":
          case "iccid":
          case "response":
            {
              header.view = false;
            }
            break;
          case "msg":
            {
              header.width = "60%";
            }
            break;
          case "corrid":
            {
              header.width = "10%";
            }
            break;
          case "aid":
          case "path":
            {
              header.view = false;
              header.edit = false;
            }
            break;
        }
      }
    },
    pauseLog(value) {
      this.paused = value;

      if (!value) {
        this.pull_sms_data();
      }
    },
    async pull_sms_data() {
      if (this.pulling_in_progress || this.paused) {
        return;
      }

      this.pulling_in_progress = true;
      try {
        let l_max_id = this.smss.records.reduce((pv, cv, ci, array) => {
          if (!pv) {
            return cv.id;
          }

          return pv > cv.id ? pv : cv.id;
        }, 0);

        let l_query = JSON.parse(JSON.stringify(this.sms_query));
        console.log(`flo-card-log - pull_sms_data - l_query: ${JSON.stringify(l_query)}`);
        let l_max_where = {
          k: "id",
          op: "greater",
          v: l_max_id,
        };

        if (!l_query.hasOwnProperty("where")) {
          l_query["where"] = [];
        }

        let l_where = l_query.where.filter((f) => f.k != "id");
        l_where.push(l_max_where);
        l_query.where = l_where;

        let smss = await this.$axios.$post("api/v1/smss/list", l_query);

        if (smss.length == 0) {
          console.log(`flo-card-log - pull_sms_data - smss.length is 0`);
        }
        for (let s = 0; s < smss.length; s++) {
          let sms = smss[s];
          sms["crud"] = "c";

          this.updateSms(sms);
        }
      } catch (err) {
        console.log(`flo-card-log - pull_sms_data - error: ${err}`);
      }

      this.pulling_in_progress = false;
    },
    updateSms(body) {
      if (body.iccid != this.iccid) {
        return;
      }
      if (body.crud == "c") {
        this.smss.records.unshift(body);
      }
    },
    smsCodeToString(code) {
      switch (code) {
        case 100: {
          return "trying";
        }
        case 102: {
          return "trying";
        }
        case 200: {
          return "delivered";
        }
        case 202: {
          return "sent";
        }
        case 204: {
          return "warning";
        }
        default: {
          return "failed";
        }
      }
    },
    smsCodeToIcon(code) {
      return ICONS[this.smsCodeToString(code)];
    },
    smsCodeToColor(type, code) {
      if (type == "location") {
        return "accent";
      } else {
        return COLORS[this.smsCodeToString(code)];
      }
    },
    getDirection(dir, type, code) {
      let style = {
        icon: "mdi-arrow-up-down-bold",
        color: "warning",
      };
      if (dir == "O") {
        style = {
          icon: "mdi-arrow-left-thick",
          color: this.smsCodeToColor(type, code),
        };
      }
      if (dir == "I") {
        style = {
          icon: "mdi-arrow-right-thick",
          color: this.smsCodeToColor(type, code),
        };
      }
      return style;
    },
    getType(type, code) {
      let l_mtype = this.translator.toSrcByKey("mtype", type);
      switch (l_mtype) {
        case "scp81-exception": {
          return {
            icon: "mdi-bomb",
            color: this.smsCodeToColor(type, code),
            type: "SCP81 Exception",
          };
        }
        case "scp81-progress": {
          return {
            icon: "mdi-sync",
            color: this.smsCodeToColor(type, code),
            type: "SCP81 Progress",
          };
        }
        case "scp81-handshake": {
          return {
            icon: "mdi-handshake",
            color: this.smsCodeToColor(type, code),
            type: "SCP81 Handshake",
          };
        }
        case "scp80-push-ack": {
          return {
            icon: "mdi-send-check",
            color: this.smsCodeToColor(type, code),
            type: "SCP80 Push Ack",
          };
        }
        case "scp80-por": {
          return {
            icon: "mdi-receipt",
            color: this.smsCodeToColor(type, code),
            type: "SCP80 POR",
          };
        }
        case "scp80-push-cancel": {
          return {
            icon: "mdi-cancel",
            color: this.smsCodeToColor(type, code),
            type: "SCP80 PUSH Cancel",
          };
        }
        case "scp80-rfm-por": {
          return {
            icon: "mdi-receipt",
            color: this.smsCodeToColor(type, code),
            type: "SCP80 RFM POR",
          };
        }
        case "scp80-rfm": {
          return {
            icon: "mdi-access-point-network",
            color: this.smsCodeToColor(type, code),
            type: "SCP80 RFM",
          };
        }
        case "scp80-ram": {
          return {
            icon: "mdi-access-point-network",
            color: this.smsCodeToColor(type, code),
            type: "SCP80 RAM",
          };
        }
        case "scp80-push-por": {
          return {
            icon: "mdi-receipt",
            color: this.smsCodeToColor(type, code),
            type: "SCP80 PUSH POR",
          };
        }
        case "scp80-ram-por": {
          return {
            icon: "mdi-receipt",
            color: this.smsCodeToColor(type, code),
            type: "SCP80 RAM POR",
          };
        }
        case "scp80-push": {
          return {
            icon: "mdi-arrow-up-bold",
            color: this.smsCodeToColor(type, code),
            type: "SCP80 Push",
          };
        }
        case "scp80-applet-flolive": {
          return {
            icon: "mdi-sim",
            color: this.smsCodeToColor(type, code),
            type: "SCP80 Applet FloLive",
          };
        }
        case "scp_expired": {
          return {
            icon: "mdi-clock-alert",
            color: this.smsCodeToColor(type, code),
            type: "SCP Expired",
          };
        }
        case "sms": {
          return {
            icon: "mdi-message-text-outline",
            color: this.smsCodeToColor(type, code),
            type: "SMS",
          };
        }
        case "sms_deliver": {
          return {
            icon: "mdi-message-text",
            color: this.smsCodeToColor(type, code),
            type: "SMS Deliver",
          };
        }
        case "raw": {
          return {
            icon: "mdi-barcode",
            color: this.smsCodeToColor(type, code),
            type: "Raw",
          };
        }
        case "raw_deliver": {
          return {
            icon: "mdi-barcode",
            color: this.smsCodeToColor(type, code),
            type: "Raw Deliver",
          };
        }
        case "apn": {
          return {
            icon: "mdi-access-point-network",
            color: this.smsCodeToColor(type, code),
            type: "APN",
          };
        }
        case "apn_deliver": {
          return {
            icon: "mdi-access-point-network",
            color: this.smsCodeToColor(type, code),
            type: "APN Deliver",
          };
        }
        case "location": {
          return {
            icon: "mdi-map-marker",
            color: this.smsCodeToColor(type, code),
            type: "Location",
          };
        }
        default: {
          return {
            icon: "mdi-alert-outline",
            color: "warning",
            type: "Unknown type.",
          };
        }
      }
    },
    displayMsg(response, msg, mtype) {
      // console.log(`flo-card-log - displayMsg - mtype: ${mtype} response: ${JSON.stringify(response)} msg: ${JSON.stringify(msg)}`)
      if (null == msg) {
        return "";
      }

      let l_mtype = this.translator.toSrcByKey("mtype", mtype);
      switch (l_mtype) {
        case "scp_expired": {
          if (response.hasOwnProperty("message")) {
            return { message: response.message };
          }
          return response;
        }
        case "scp81-progress": {
          let lmsg = {};
          if (msg.hasOwnProperty("sw")) {
            lmsg["sw"] = msg.sw;
          }

          if (msg.hasOwnProperty("message")) {
            lmsg["message"] = msg.message;
            if (msg.message.length > 50) {
              lmsg.message = msg.message.substr(0, 50) + " ...";
            }
          }
          if (response.hasOwnProperty("message")) {
            if (response.message.length > 50) {
              lmsg["message"] = response.message.substr(0, 50) + " ...";
            }
            lmsg["message"] = response.message;
          }

          return lmsg;
        }
        case "scp80-rfm-por": {
          let lmsg = {};
          if (msg.hasOwnProperty("message") && msg.hasOwnProperty("sw")) {
            lmsg = { sw: msg.sw, message: msg.message };
            if (msg.message.length > 50) {
              lmsg = { sw: msg.sw, message: msg.message.substr(0, 50) + " ..." };
            }
          }
          return lmsg;
        }
        case "scp80-applet-flolive": {
          let lmsg = {};
          if (msg.hasOwnProperty("cards")) {
            let lcards = msg.cards[0];
            if (lcards.hasOwnProperty("execute_info")) {
              if ("direct" != lcards.execute_info.message_mode) {
                lmsg = {
                  message_mode: lcards.execute_info.message_mode,
                  validity_period: lcards.execute_info.validity_period,
                };
              } else {
                lmsg = {
                  message_mode: lcards.execute_info.message_mode,
                };
              }
            }
          }

          if (msg.hasOwnProperty("operations")) {
            let loperations = msg.operations[0];
            if (loperations.hasOwnProperty("name")) {
              lmsg = {
                ...lmsg,
                ...{
                  name: loperations.hasOwnProperty("name") ? loperations.name : "",
                  imsi: loperations.hasOwnProperty("imsi") ? loperations.imsi : "",
                },
              };
            }
            if (loperations.hasOwnProperty("cmd")) {
              lmsg = {
                ...lmsg,
                ...{
                  cmd: loperations.hasOwnProperty("cmd") ? loperations.cmd : "",
                },
              };
            }
          }

          if (msg.hasOwnProperty("type")) {
            lmsg = {
              ...lmsg,
              ...{
                type: msg.hasOwnProperty("type") ? msg.type : "",
                transport: msg.hasOwnProperty("transport") ? msg.transport : "",
              },
            };
          }
          return lmsg;
        }
        case "scp80-push": {
          let ldisplay = {};
          if (response.hasOwnProperty("message")) {
            ldisplay["message"] = response.message;
          }
          return ldisplay;
        }
        case "scp80-rfm": {
          let lrfm = {};
          if (response.hasOwnProperty("message")) {
            lrfm["message"] = response.message;
          }
          return lrfm;
        }
        case "scp80-push-por":
        case "scp80-por":
        case "scp80-ram-por": {
          let lmsg = {};

          if (msg.hasOwnProperty("type")) {
            if (msg.hasOwnProperty("operations")) {
              lmsg["app"] = msg.operations[0].app;
              lmsg["cmd"] = msg.operations[0].cmd;
            }

            if (msg.hasOwnProperty("cards") && msg.cards.length > 0) {
              const card = msg.cards[0];
              if (card.se && card.se.apps && card.se.apps.length > 0) {
                const app = card.se.apps[0];
                if (app.major) {
                  lmsg["major"] = app.major;
                }
              }
              lmsg["iccid"] = card.iccid;
            }

            lmsg["type"] = msg.type;
            lmsg["transport"] = msg.transport;
          }

          if (msg.hasOwnProperty("sw")) {
            if (msg.sw != "0000") {
              lmsg["sw"] = msg.sw;
            }
          }

          if (response.hasOwnProperty("rsc")) {
            lmsg["rsc"] = response.rsc;
            if (response.hasOwnProperty("rsc_decoded")) {
              lmsg["rsc"] = `${response.rsc} - ${response.rsc_decoded}`;
            }
          }

          if (response.hasOwnProperty("ota_status")) {
            lmsg["ota"] = response.ota_status;
          }

          if (msg.hasOwnProperty("message")) {
            lmsg["message"] = msg.message;
            if (lmsg.message.length > 50) {
              lmsg.message = msg.message.substr(0, 50) + " ...";
            }
          }

          return lmsg;
        }
        case "scp80-ram": {
          let lram = {};

          if (response.hasOwnProperty("message")) {
            lram["message"] = response.message;
          }
          return lram;
        }
        case "scp81-handshake": {
          let ldisplay = {};
          if (response.hasOwnProperty("type")) {
            ldisplay["type"] = response.type;
          }
          if (response.hasOwnProperty("message")) {
            ldisplay["message"] = response.message;
          }

          return ldisplay;
        }
        case "raw_deliver":
        case "raw": {
          let lmsg = structuredClone(msg);
          if (lmsg.hasOwnProperty("raw")) {
            let lraw = {};
            lraw["payload"] = lmsg.raw.payload;
            lraw["esm_class"] = lmsg.raw.esm_class;
            lraw["data_coding"] = lmsg.raw.data_coding;
            lraw["protocol_id"] = lmsg.raw.protocol_id;
            lraw["priority_flag"] = lmsg.raw.priority_flag;
            delete lmsg.raw;
            lmsg = { ...lraw, ...lmsg };
          }

          return lmsg;
        }
        case "location": {
          let lmsg = {};
          if (msg.hasOwnProperty("value")) {
            lmsg = msg.value;
          }
          return lmsg;
        }
        case "apn_deliver":
        case "sms_deliver":
        case "apn":
        case "sms": {
          let lmsg = structuredClone(msg);
          if (lmsg.hasOwnProperty("sms") && undefined != lmsg.sms.value) {
            let lsms = "";
            lsms = lmsg.sms.value.length > 80 ? lmsg.sms.value.substr(0, 80) + " ..." : lmsg.sms.value;
            delete lmsg.sms;
            lmsg = { sms: lsms, ...lmsg };
          } else if (lmsg.hasOwnProperty("apn") || lmsg.hasOwnProperty("wap_push")) {
            let ltype = lmsg.type;
            let lapn = {};
            lapn["imsi"] = lmsg[ltype].imsi;
            lapn["uri"] = lmsg[ltype].uri;
            lapn["name"] = lmsg[ltype].name;
            lapn["apn_address"] = lmsg[ltype].apn_address;
            delete lmsg[ltype];
            lmsg = { ...lapn, ...lmsg };
          }

          return lmsg;
        }
      }

      return msg;
    },
  },
};
</script>
