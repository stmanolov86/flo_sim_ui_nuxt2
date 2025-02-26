<template>
  <div class="flo-card-sms">
    <flo-expand title="Messaging" elevation="5">
      <template v-slot:content="{}">
        <v-container fluid class="ma-0 pa-0">
          <v-row no-gutters>
            <v-col cols="12">
              <v-tabs v-model="tab_msg">
                <v-tabs-slider></v-tabs-slider>
                <v-tab href="#tab-sms">SMS</v-tab>
                <v-tab href="#tab-apn">APN</v-tab>

                <v-tab-item value="tab-sms">
                  <v-card flat tile>
                    <v-card-text>
                      <v-row class="mx-1 px-1">
                        <v-col cols="12" lg="3">
                          <v-text-field v-model="source_name" label="From" prepend-icon="mdi-account" clearable></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12">
                          <v-textarea name="input-7-1" filled no-resize rows="5" outlined hide-details persistent-hint label="Type your message here." v-model="message.value" :hint="smsHint()" @input="onSmsInput($event)" :rules="[getRule()]"></v-textarea>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col class="d-flex justify-start align-center mt-3 py-0" cols="12">
                          <span v-if="error.code != 0" :class="`${smsCodeToColor('', error.code)}--text font-weight-bold px-2`">{{ error.code }} - {{ displayResponse(error.msg) }}</span>
                          <div class="flex-grow-1"></div>
                        </v-col>
                      </v-row>
                      <template v-if="message.encoding == 'binary'">
                        <v-row no-gutters>
                          <v-col cols="6" lg="3">
                            <v-select dense label="Data Coding" v-model="bin_code" :items="[0, 4, 8, 245, 246]" required class="px-0 mx-2" />
                          </v-col>
                          <v-col cols="6" lg="3">
                            <v-select dense label="Esm Class" v-model="bin_esm" :items="[0, 64]" required class="px-0 mx-2" />
                          </v-col>
                          <v-col cols="6" lg="3">
                            <v-select dense label="Protocol Id" v-model="bin_pid" :items="[0, 127]" required class="px-0 mx-2" />
                          </v-col>
                          <v-col cols="6" lg="3">
                            <v-select dense label="Priority Flag" v-model="bin_pif" :items="[0, 1, 2, 3]" required class="px-0 mx-2" />
                          </v-col>
                        </v-row>
                      </template>
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-row no-gutters>
                            <v-col class="d-flex justify-start align-center my-0 py-0" cols="12" lg="6" xl="3">
                              <v-radio-group row v-model="message.encoding">
                                <v-radio label="GSM 7bit" value="gsm7" color="success"></v-radio>

                                <v-radio label="UCS-2" value="ucs2" color="success"></v-radio>

                                <v-radio label="Binary" value="binary" color="success"></v-radio>
                              </v-radio-group>
                            </v-col>

                            <v-col cols="12" lg="6" xl="3">
                              <v-row no-gutters>
                                <v-col class="d-flex align-center pa-2 ma-0" cols="6">
                                  <v-select dense v-model="message_mode" :items="message_modes" class="" item-text="value" item-value="key" required label="Message Mode" hint="Select Mode" hide-details></v-select>
                                </v-col>

                                <v-col class="d-flex align-center pa-2 ma-0" cols="6">
                                  <v-select dense v-model="message_expiry" :items="message_expirys" class="" item-text="value" item-value="key" required label="Expiry" hint="Validity Period" hide-details></v-select>
                                </v-col>
                              </v-row>
                            </v-col>

                            <v-col cols="12" lg="6" xl="3">
                              <v-btn :disabled="disableSms()" color="primary" outlined @click.native.stop class="ma-2" @click="sendSms()"> <v-icon center>mdi-message-text</v-icon>Send </v-btn>
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-tab-item>

                <v-tab-item value="tab-apn">
                  <v-card flat tile>
                    <v-card-text>
                      <v-row no-gutters class="my-0 py-0">
                        <v-col class="d-flex justify-start align-center my-0 py-0" cols="12">
                          <span v-if="error.code != 0" :class="`${smsCodeToColor('', error.code)}--text font-weight-bold px-2`">{{ error.code }} - {{ displayResponse(error.msg) }}</span>
                          <div class="flex-grow-1"></div>
                        </v-col>
                      </v-row>
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-row no-gutters>
                            <v-col class="d-flex justify-start align-center my-0 py-0" cols="12" lg="6" xl="3">
                              <v-radio-group row v-model="apn.encoding">
                                <v-radio label="Auto" value="auto" color="success"></v-radio>
                                <v-radio label="Android" value="android" color="success"></v-radio>
                                <v-radio label="Apple" value="apple" color="success"></v-radio>
                                <v-radio label="Windows" value="windows" color="success"></v-radio>
                              </v-radio-group>
                            </v-col>

                            <v-col cols="12" lg="6" xl="3">
                              <v-row no-gutters>
                                <v-col class="d-flex align-center pa-2 ma-0" cols="6">
                                  <v-select dense v-model="message_mode" :items="message_modes" class="" item-text="value" item-value="key" required label="Message Mode" hint="Select Mode" hide-details></v-select>
                                </v-col>

                                <v-col class="d-flex align-center pa-2 ma-0" cols="6">
                                  <v-select dense v-model="message_expiry" :items="message_expirys" class="" item-text="value" item-value="key" required label="Expiry" hint="Validity Period" hide-details></v-select>
                                </v-col>
                              </v-row>
                            </v-col>

                            <v-col cols="12" lg="6" xl="3">
                              <v-tooltip top>
                                <template v-slot:activator="{ on }">
                                  <v-btn :disabled="disableApn()" color="primary" outlined @click.native.stop class="ma-2" @click="sendApn()" v-on="on"> <v-icon center>mdi-access-point-network</v-icon>Send </v-btn>
                                </template>
                                <span>Send APN</span>
                              </v-tooltip>
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
              </v-tabs>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Log" open elevation="5">
                <template v-slot:title="{ title }">
                  <span class="title font-weight-regular mx-2">{{ title }}</span>
                </template>

                <template v-slot:content="{}">
                  <flo-card-log :iccid="iccid" :hidden_filter="hidden_filter"></flo-card-log>
                </template>
              </flo-expand>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </flo-expand>
  </div>
</template>

<script>
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
const COLORS = {
  trying: "info",
  failed: "error",
  sent: "warning",
  delivered: "success",
};
const eMessageMode = [
  { key: "default", value: "Default" },
  { key: "store_and_forward", value: "Store And Forward" },
];
const eMessageExpiry = [
  { key: 120, value: "2 minute" },
  { key: 300, value: "5 minute" },
  { key: 600, value: "10 minute" },
  { key: 900, value: "15 minute" },
  { key: 1800, value: "30 minute" },
  { key: 3600, value: "1 hour" },
  { key: 7200, value: "2 hours" },
];

export default {
  name: "flo-card-sms",
  props: {
    error: {
      type: Object,
      default: () => {},
    },
    iccid: {
      type: String,
      required: true,
      default: "",
    },
  },
  data() {
    return {
      pulling_in_progress: false,
      pull_timer_id: 0,
      bin_code: 246,
      bin_esm: 64,
      bin_pid: 127,
      bin_pif: 0,
      tab_msg: null,
      source_name: "",
      message_mode: "default",
      message_modes: eMessageMode,
      message_expiry: 120,
      message_expirys: eMessageExpiry,
      selected: [1],
      nonce: 0,
      dotarequest: { ota: [] },
      dota: {
        version: 1,
        build: false,
        request: { ota: [] },
      },
      message: { encoding: "gsm7", value: "" },
      apn: { encoding: "auto", value: "" },
      mchars: 160,
      mlen: 0,
      permissions: {
        c: true,
        r: true,
        u: true,
        d: true,
      },
      rules: {
        gsm7: (value) => {
          const pattern = /^[\x00-\x7F]*$/;
          return pattern.test(value) || "Invalid Ascii code.";
        },
        ucs2: (value) => {
          const pattern = /^.*$/;
          return pattern.test(value) || "Invalid key format.";
        },
        binary: (value) => {
          const pattern = /^[0-9A-Fa-f]+$/;
          if (value.length > 140 * 2) return "Binary message is limited to 140";

          if (value.length % 2 != 0) return "Binary message length must be even";

          return pattern.test(value) || "Invalid Hex code .";
        },
      },
      hidden_filter: [
        {
          k: "iccid",
          op: "equal",
          v: this.iccid,
        },
        { k: "mtype", op: "not_equal", v: "rfm" },
        { k: "mtype", op: "not_equal", v: "scp_expired" },
        { k: "mtype", op: "not_equal", v: "scp80-por" },
        { k: "mtype", op: "not_equal", v: "scp80-push-cancel" },
        { k: "mtype", op: "not_equal", v: "scp80-push-por" },
        { k: "mtype", op: "not_equal", v: "scp80-rfm" },
        { k: "mtype", op: "not_equal", v: "scp80-ram" },
        { k: "mtype", op: "not_equal", v: "scp80-push" },
        { k: "mtype", op: "not_equal", v: "scp80-por" },
        { k: "mtype", op: "not_equal", v: "scp80-applet-flolive" },
        { k: "mtype", op: "not_equal", v: "scp80-rfm-por" },
        { k: "mtype", op: "not_equal", v: "scp80-ram-por" },
        { k: "mtype", op: "not_equal", v: "scp80-push-ack" },
        { k: "mtype", op: "not_equal", v: "scp81-progress" },
        { k: "mtype", op: "not_equal", v: "scp81-handshake" },
        { k: "mtype", op: "not_equal", v: "scp81-exception" },
      ],
    };
  },
  watch: {
    error: function (n, o) {
      console.log(`flo-card-sms - pull_sms_data - error:${JSON.stringify(o)} -> ${JSON.stringify(n)}`);
    },
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
    displayResponse(msg) {
      let lmsg = JSON.stringify(msg);
      if (msg.hasOwnProperty("message")) {
        if (msg.message.length > 150) {
          lmsg = msg.message.substr(0, 150) + " ...";
        } else {
          lmsg = msg.message;
        }
      }

      return lmsg;
    },
    getRule() {
      if (this.message.encoding === "gsm7") {
        return this.rules.gsm7;
      } else if (this.message.encoding === "ucs2") {
        return this.rules.ucs2;
      } else if (this.message.encoding === "binary") {
        return this.rules.binary;
      }
    },
    disableSms() {
      if (0 == this.mlen) {
        return true;
      }

      if (this.error.code > 0 && this.error.code < 200) {
        return true;
      }

      let validate = this.getRule();
      let validate_result = validate(this.message.value);
      if (true !== validate_result) {
        return true;
      }

      return false;
    },
    disableApn() {
      if (this.error.code > 0 && this.error.code < 200) {
        return true;
      }
      return false;
    },
    smsHint() {
      // gsm7 - 160 first page, 154 next page
      // ucs2 - 70 first page, 67 next page
      let fpage = 160;
      let npage = 154;
      let len = this.mlen;
      if (this.message.encoding === "gsm7") {
        fpage = 160;
        npage = 154;
      } else if (this.message.encoding === "ucs2") {
        fpage = 70;
        npage = 67;
      } else if (this.message.encoding === "binary") {
        fpage = 140;
        npage = 140;
        len = len / 2;
      }

      if (len <= fpage) {
        return `${len} used of ${fpage} single page size`;
      } else {
        let pages = Math.floor(len / npage) + 1;
        let chars = len % npage;
        return `${pages} pages, last page ${chars} used of ${npage} multi page size`;
      }
    },
    sendApn() {
      let message = { value: "", encoding: this.apn.encoding };

      if (this.message_mode != "default") {
        message["message_mode"] = this.message_mode;
      }

      if (this.message_expiry != "120") {
        message["expiry"] = this.message_expiry;
      }

      this.$emit("apn", message);
    },
    sendSms() {
      console.log(`sendSms - mode: ${this.message_mode} expiry: ${this.message_expiry} message:${JSON.stringify(this.message)}`);
      let message = { value: this.message.value };
      let validate = this.getRule();

      let validate_result = validate(message.value);
      if (true !== validate_result) {
        alert(validate_result);
        return;
      }

      if (typeof this.source_name !== "undefined" && this.source_name != null && this.source_name !== "") {
        message["source_name"] = this.source_name;
        console.log(`sendSms - ${JSON.stringify(message)}`);
      }

      if (this.message.encoding !== "gsm7") {
        message["encoding"] = this.message.encoding;
      }
      if (this.message.encoding === "binary") {
        message = {
          encoding: this.message.encoding,
          payload: this.message.value,
          data_coding: this.bin_code,
          esm_class: this.bin_esm,
          protocol_id: this.bin_pid,
          priority_flag: this.bin_pif,
        };
      }

      if (this.message_mode != "default") {
        message["message_mode"] = this.message_mode;
      }

      if (this.message_expiry != "120") {
        message["expiry"] = this.message_expiry;
      }

      this.$emit("message", message);
      console.log(`flo-card-sms - sendSms - message after emit: ${JSON.stringify(message)}`);
    },
    onSmsInput(event) {
      if (null == event) {
        this.mlen = 0;
      } else {
        this.mlen = event.length;
      }
    },
    async pull_sms_data() {
      if (this.pulling_in_progress) {
        return;
      }

      if (this.error.code != 202) {
        return;
      }

      if (!this.error.msgid) {
        console.log(`flo-card-sms - pull_sms_data - no msg id`);
        return;
      }

      this.pulling_in_progress = true;
      try {
        console.log(`flo-card-sms - pull_sms_data - search for value:${this.error.msgid}`);

        let query = {
          select: {},
          where: [
            {
              k: "msgid",
              op: "equal",
              v: this.error.msgid,
            },
            {
              k: "code",
              op: "not_equal",
              v: 202,
            },
            {
              k: "iccid",
              op: "equal",
              v: this.iccid,
            },
          ],
        };

        let smss = await this.$axios.$post("api/v1/smss/list", query);
        for (let s = 0; s < smss.length; s++) {
          let sms = smss[s];
          this.error.msgid = "";
          this.error.code = sms.code;
          if (200 == this.error.code) {
            this.message.value = "";
            this.error.msg = "Delivered";
          } else if (this.error.code == 408) {
            this.error.msg = "Timeout";
          } else if (this.error.code > 200) {
            this.error.msg = "Failed";
          }
        }
      } catch (err) {
        console.log(`flo-card-sms - pull_sms_data - error: ${err}`);
      }

      this.pulling_in_progress = false;
    },
    smsCodeToString(code) {
      switch (code) {
        case 100: {
          return "trying";
        }
        case 200: {
          return "delivered";
        }
        case 202: {
          return "sent";
        }
        default: {
          return "failed";
        }
      }
    },
    smsCodeToColor(type, code) {
      if (type == "location") {
        return "accent";
      } else {
        return COLORS[this.smsCodeToString(code)];
      }
    },
  },
};
</script>
