<template>
  <div>
    <flo-meta-table v-if="translator != null" @load-data="onLoadData($event)" @import-export-cancel="clearExportData()" :translator="translator" :resources="resources" :can_import="false" :accept="accept" :external_data="external_data" external>
      <template v-slot:view_mcc="{ fmtrow }">
        <v-chip v-for="(mcc, i) in formatMcc(fmtrow.mcc)" :key="i" label color="info" class="mr-1 mb-1 mt-1 text-capitalize">{{ mcc }}</v-chip>
      </template>
      <template v-slot:external="{}">
        <v-card flat class="ma-0 pa-0" :disabled="exported.disabled">
          <v-container fluid class="ma-0 pa-0">
            <v-row no-gutters>
              <v-col cols="12" class="pa-1">
                <v-tabs v-model="exported.tabs" @change="onTabChange($event)">
                  <v-tab key="file">From File</v-tab>
                  <v-tab key="range">From Range</v-tab>
                </v-tabs>
              </v-col>
            </v-row>

            <v-row :key="exported.key" no-gutters>
              <v-col cols="12">
                <v-tabs-items v-model="exported.tabs">
                  <v-tab-item key="file">
                    <v-container fluid class="ma-0 pa-0">
                      <v-row no-gutters>
                        <v-col cols="12" class="pa-1">
                          <v-select v-model="key_content.value" @change="onKeyContentChange($event)" :label="key_content.label" :hint="key_content.hint" :items="key_content.items" item-text="value" item-value="key" no-data-text="Please select Encryption" dense persistent-hint outlined></v-select>
                        </v-col>
                      </v-row>
                      <v-row no-gutters>
                        <v-col cols="12" class="pa-1">
                          <v-file-input v-model="exported.file" :accept="accept" :error="exported.error" :error-messages="exported.error_message" label="Upload File" hint="Accepted ICCID length is 19 (with check digit)." @change="exportChanged($event)" :truncate-length="$vuetify.breakpoint.xs ? 25 : 50" outlined dense persistent-hint></v-file-input>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12" class="pa-1">
                          <v-alert v-if="exported.failure_count > 0" outlined dense type="error"
                            >Export failures: {{ exported.failure_count }} out of
                            {{ exported.parsing_count }}
                          </v-alert>
                          <v-alert v-else-if="exported.progress != ''" outlined dense :type="`${exported.parse_error ? 'error' : 'success'}`">{{ exported.progress }} </v-alert>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-tab-item>

                  <v-tab-item key="range">
                    <v-container fluid class="ma-0 pa-0">
                      <v-row no-gutters>
                        <v-col cols="12" class="pa-1">
                          <v-select v-model="key_content.value" @change="onKeyContentChange($event)" :label="key_content.label" :hint="key_content.hint" :items="key_content.items" item-text="value" item-value="key" no-data-text="Please select Encryption" dense persistent-hint outlined></v-select>
                        </v-col>
                      </v-row>
                      <v-row no-gutters>
                        <v-col cols="12" lg="6" xl="6" class="pa-1">
                          <v-text-field :label="range.iccid_start.label" :hint="range.iccid_start.hint" :rules="[iccidRule('start')]" @input="onIccidStartInput($event)" @paste="onIccidStartPaste($event)" persistent-hint outlined dense counter></v-text-field>
                        </v-col>
                        <v-col cols="12" lg="6" xl="6" class="pa-1">
                          <v-text-field :label="range.iccid_end.label" :hint="range.iccid_end.hint" :rules="[iccidRule('end')]" @input="onIccidEndInput($event)" @paste="onIccidEndPaste($event)" persistent-hint outlined dense counter></v-text-field>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-tab-item>
                </v-tabs-items>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </template>
      <template v-slot:external_action="{}">
        <v-btn v-if="external_data.length > 0" color="primary" @click="exportExternalData()" text>Export</v-btn>
        <v-btn v-else color="primary" :disabled="disableExecute()" @click="executeExternalData()" text>Execute</v-btn>
      </template>
    </flo-meta-table>
  </div>
</template>
<script>
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  async fetch({ store }) {
    let lmcc = await store.dispatch("session/getFromCache", "/denum/mcc");
    if (lmcc == null) {
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
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    }
  },
  data() {
    return {
      helpers,
      resources: "card_subs",
      translator: null,
      accept: ".csv",
      headers: [],
      external_data: [],
      key_content: {
        label: "Network Keys By",
        hint: "Key Content",
        value: "name",
        items: [
          { key: "name", value: "Name" },
          { key: "value", value: "Value" },
        ],
      },
      range: {
        iccid_start: {
          label: "Start ICCID",
          hint: "Start of the ICCID range",
          value: "",
        },
        iccid_end: {
          label: "End ICCID",
          hint: "End of the ICCID range",
          value: "",
        },
      },
      exported: {
        file: null,
        tabs: 0,
        key: 0,
        parsing_count: 0,
        reading_count: 0,
        saved_count: 0,
        saved_percent: 0,
        failure_count: 0,
        disabled: false,
        progress: "",
        parse_error: false,
        error: false,
        error_message: "",
        fields: [],
        headers: [],
      },
      delimiters: [
        { key: ",", value: "Comma" },
        { key: ";", value: "Semicolon" },
        { key: "=", value: "Equal Sign" },
        { key: "    ", value: "Tab" },
      ],
    };
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    initialize() {
      let translator = new OTranslator();
      translator.setEnumEx("countries", this.$store.getters["session/cache"]["/denum/mcc"].value);
      translator.getKeyValues("countries");
      translator.setTimeStamp("ts");
      this.translator = translator;
    },
    onLoadData(data) {
      this.headers = data.headers;
      for (const header of data.headers) {
        switch (header.value) {
          case "id":
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "idx":
          case "mnc":
          case "key_id":
          case "imsi_range":
          case "range":
          case "lrplmnsi":
            {
              header.view = false;
            }
            break;
        }
      }
    },
    onTabChange() {
      this.clearExportData();
    },
    onIccidStartPaste(event) {
      this.range.iccid_start.value = event.clipboardData.getData("text/plain");
    },
    onIccidEndPaste(event) {
      this.range.iccid_end.value = event.clipboardData.getData("text/plain");
    },
    onIccidStartInput(event) {
      this.range.iccid_start.value = event;
    },
    onIccidEndInput(event) {
      this.range.iccid_end.value = event;
    },
    onKeyContentChange() {
      this.external_data = [];
    },
    iccidRule(type) {
      let start = this.range.iccid_start.value;
      let end = this.range.iccid_end.value;
      let rule = /^[0-9]{18}$/;

      if (type == "start") {
        if (!rule.test(start) || !start) {
          return "Accepted ICCID length is 18 (without check digit).";
        }
        if (rule.test(end) && !!end) {
          if (start > end) {
            return "Start ICCID can't be greater than the End ICCID.";
          }
        }
        return true;
      }

      if (type == "end") {
        if (!rule.test(end) || !end) {
          return "Accepted ICCID length is 18 (without check digit).";
        }
        if (rule.test(start) && !!start) {
          if (end < start) {
            return "End ICCID can't be lower than the Start ICCID.";
          }
        }
        return true;
      }
    },
    scrollToTop() {
      document.getElementsByClassName("flo-imp-exp")[0].scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest", scrollMode: "always" });
    },
    clearExportData() {
      this.range.iccid_start.value = "";
      this.range.iccid_end.value = "";
      this.key_content.value = "name";
      this.external_data = [];
      this.exported.reading_count = 0;
      this.exported.parsing_count = 0;
      this.exported.failure_count = 0;
      this.exported.saved_count = 0;
      this.exported.progress = "";
      this.exported.parse_error = "";
      this.exported.error_message = "";
      this.exported.fields = [];
      this.exported.headers = [];
      this.exported.file = null;
      this.exported.error = false;
      this.exported.key++;
    },
    disableExecute() {
      if (!this.exported.tabs) {
        return !this.exported.fields.length > 0;
      } else {
        return !(this.iccidRule("start") === true && this.iccidRule("end") === true);
      }
    },
    formatMcc(mcc) {
      let formatted = [];
      if (mcc.length > 0) {
        formatted = this.translator.getKeyValues("countries").reduce((acc, f) => {
          if (mcc.split(",").includes(f.key) && !acc.includes(f.value)) {
            acc.push(f.value);
          }
          return acc;
        }, []);
        if (formatted.length > 3) {
          formatted.splice(3, 0, "...");
          formatted = formatted.slice(0, 4);
        }
      }

      return formatted;
    },
    async executeExternalData() {
      this.external_data = [];
      if (!this.exported.tabs) {
        if (this.exported.fields.length > 0) {
          let iccids = this.exported.fields;
          for (let i = 0; i < iccids.length; i++) {
            await this.loadExportData([iccids[i]]);
          }
        }
      } else {
        if (this.iccidRule("start") == true && this.iccidRule("end") == true) {
          let start = this.range.iccid_start.value;
          let end = this.range.iccid_end.value;
          this.calculateIccidRange(start, end);
        }
      }
    },
    async exportExternalData() {
      let externalData = this.external_data;
      this.scrollToTop();
      if (externalData) {
        externalData = externalData.map((m) =>
          Object.entries(m).reduce((mapped, [k, v]) => {
            mapped[k] = null;
            let type = typeof v;
            switch (type) {
              case "object":
                mapped[k] = JSON.parse(JSON.stringify(v));
                break;
              case "string":
                mapped[k] = v.trim();
                break;
              default:
                mapped[k] = v;
                break;
            }
            return mapped;
          }, {}),
        );

        let link = document.createElement("a");
        link.href = "data:text/csv;charset=utf-8," + encodeURI(helpers.JSONToXSV(externalData, ","));
        link.download = `${this.resources.toLowerCase()}.csv`;
        link.click();
        link.remove();
      }
    },
    async calculateIccidRange(start, end) {
      let count = 0;
      for (let current = start; current <= end; count++) {
        console.log(`Start (current) of the ICCID range: ${current}, count ${count}`);
        await this.loadExportData([current]);
        let carry = 1;
        let result = "";
        for (let i = current.length - 1; i >= 0; i--) {
          let digit = Number(current[i]) + carry;
          carry = 0;
          if (digit > 9) {
            digit = 0;
            carry = 1;
          }
          result = digit + result;
        }
        current = carry ? "1" + result : result;
      }
    },
    async exportChanged(event) {
      if (!event) {
        this.clearExportData();
      } else {
        await this.loadExportFile();
      }
    },
    async loadExportFile() {
      let l_data = [];
      this.exported.fields = [];
      await helpers
        .readFileAsText(this.exported.file)
        .then((text) => {
          let lines = text.split(/\r?\n/);
          let l_delimiter = this.delimiters.map((m) => m.key).filter((f) => lines[0].includes(f));
          let l_headers = [];
          if (l_delimiter.length > 0) {
            l_headers = helpers.parseCSV(lines[0], l_delimiter).map((m) => {
              this.exported.headers.push({ key: m.toLowerCase(), value: helpers.formatString(m) });

              return m.toLowerCase();
            });
          } else {
            let cleanLines = lines[0].toLowerCase().replace(/"/g, "");
            l_headers.push(cleanLines);
            this.exported.headers.push({ key: cleanLines, value: helpers.formatString(lines[0]) });
          }

          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() == "") {
              continue;
            }

            let l_fields = [];
            if (l_delimiter.length > 0) {
              l_fields = helpers.parseCSV(lines[i], l_delimiter);
            } else {
              l_fields.push(lines[i]);
            }

            let has_iccid = l_headers.some((s) => s == "iccid");
            if (!has_iccid) {
              this.exported.error = true;
              this.exported.error_message = "File is missing ICCID.";
              return;
            }

            if (lines[i] && !/^[0-9]{19}$/.test(+lines[i])) {
              this.exported.parse_error = true;
              this.exported.progress = `Error at line ${i + 1} - ICCID length is ${lines[i].length}, accepted length is 19 (with check digit).`;
              return;
            }

            if (l_headers.length != l_fields.length) {
              this.exported.progress = `Error at line: ${i + 1}, ${l_headers.length} fields are expected, but ${l_fields.length} found.`;
              this.exported.parse_error = true;
              return;
            }

            l_data = l_data.concat(l_fields);
            this.exported.fields = l_data;
            this.exported.reading_count++;
            this.exported.parsing_count++;
            this.exported.progress = `Lines: ${this.exported.reading_count}, Parsed: ${this.exported.reading_count}`;
          }
        })
        .catch((err) => {
          this.exported.progress = `Import error '${err}'.`;
          this.exported.parse_error = true;
        });
    },
    async loadExportData(iccids) {
      this.exported.disabled = true;
      try {
        let body = {
          key_content: this.key_content.value,
          iccids,
        };

        let answer = await this.$axios.$post("api/v1/card_subs/export", body);
        if (answer.length > 0) {
          for (let i = 0; i < answer.length; i++) {
            let { status, message, ...rest } = answer[i];
            answer[i] = {
              ...rest,
              _result_status: status,
              _result_message: message,
            };
          }
          this.external_data.push(...answer);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        if (lerr) {
          let l_err = {};
          for (let i = 0; i < this.headers.length; i++) {
            const header = this.headers[i];
            if (!["action", "ts"].includes(header.value)) {
              l_err[header.value] = null;
            }
          }
          let match = null;
          const regex = /(ICCID|IMSI): (\d+)\./g;
          while ((match = regex.exec(lerr.message)) !== null) {
            l_err[match[1].toLowerCase()] = match[2];
          }
          l_err["_result_status"] = lerr.statusCode;
          l_err["_result_message"] = lerr.message;
          if (!l_err.iccid) {
            l_err["iccid"] = iccids[0];
          }
          this.external_data.push(l_err);
          this.exported.disabled = false;
        }
        this.tellUser("error", lerr);
      }
      this.exported.disabled = false;
    },
  },
};
</script>
