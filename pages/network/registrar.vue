<template>
  <div>
    <flo-meta-table :refresh="30" @load-data="onLoadData($event)" @pre-new="onPreNew($event)" @pre-edit="onPreEdit($event)" @query_change="onQueryChange($event)" :translator="translator" :init_filter="init_filter" :resources="resources" main_resource>
      <template v-slot:view_state="{ fmtrow }">
        <v-chip class="text-capitalize" :color="getStateColor(fmtrow.state)" label>{{ fmtrow.state }}</v-chip>
      </template>
      <template v-slot:view_mnc_len="{ fmtrow }">
        <span>{{ fmtrow.mnc_len }}</span>
      </template>
      <template v-slot:edit_state="{ fmtrow }">
        <v-col cols="12" lg="6" class="d-flex justify-center align-center">
          <v-chip class="text-capitalize" :color="getStateColor(fmtrow.state)" label>{{ fmtrow.state }}</v-chip>
        </v-col>
      </template>
      <template v-slot:edit_hsm_id="{ fmtrow, fmtheader }">
        <v-col cols="12" lg="6">
          <v-autocomplete :disabled="fmtheader.disable_edit" v-model="fmtrow.hsm_id" :items="hsms" :label="fmtheader.text" :hint="fmtheader.hint" @change="loadHsmOpKeys($event)" item-text="value" item-value="key" no-data-text="Please select HSM" persistent-hint filled></v-autocomplete>
        </v-col>
      </template>
      <template v-slot:edit_op="{ fmtrow, fmtheader }">
        <v-col cols="12" lg="6">
          <v-autocomplete :disabled="fmtheader.disable_edit" v-model="fmtrow.op" :items="op" :label="fmtheader.text" :hint="fmtheader.hint" item-text="value" item-value="key" no-data-text="Please select OP" persistent-hint filled></v-autocomplete>
        </v-col>
      </template>
    </flo-meta-table>
  </div>
</template>
<script>
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import tellUser from "~/mixins/tellUser.js";
import { mapActions } from "vuex";
export default {
  data: () => ({
    resource: "registrar",
    resources: "registrars",
    translator: null,
    init_filter: [],
    records: [],
    hsms: [],
    op: [],
  }),
  created() {
    this.initialize();
  },
  mounted() {
    this.$bus.$on(this.resources.toLowerCase(), this.resourceChanged);
  },
  beforeDestroy() {
    this.$bus.$off(this.resources.toLowerCase());
  },
  mixins: [tellUser, parseNetError],
  methods: {
    ...mapActions({
      clearResourceCache: "session/clearResourceCache",
    }),
    async initialize() {
      if (this.$route.query.name) {
        this.init_filter = [
          {
            k: "name",
            op: "equal",
            v: this.$route.query.name,
          },
        ];
      }
      await this.loadHsms();
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      this.translator = translator;
    },
    async loadHsms() {
      this.hsms = [];
      try {
        let hsms = await this.$axios.$post("api/v1/hsms/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        this.hsms = hsms;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadHsmOpKeys(id) {
      this.op = [];
      try {
        let query = {
          select: {
            id: {},
            name: {},
          },
          where: [
            {
              k: "hsm_id",
              op: "equal",
              v: id,
            },
            {
              k: "key_type",
              op: "equal",
              v: "op",
            },
            {
              k: "status",
              op: "equal",
              v: "active",
            },
          ],
        };

        this.op = (await this.$axios.$post("api/v1/hsm_keys/list", query)).map(({ id, name }) => ({
          key: id,
          value: name,
        }));
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    findRowById(id) {
      for (let i = 0; i < this.records.length; i++) {
        if (this.records[i].id == id) {
          return i;
        }
      }
      return -1;
    },
    resourceChanged(msg) {
      let i = this.findRowById(msg.changed.id);
      console.log(`resourceChanged - ${this.resources} - found index ${i} for key id:${msg.changed.id}`);
      if (i >= 0 && i < this.records.length) {
        for (const key of Object.keys(this.records[i])) {
          if (msg.changed.hasOwnProperty(key)) {
            this.records[i][key] = msg.changed[key];
          }
        }
      }
    },
    onLoadData(data) {
      this.records = data.items;

      for (const header of data.headers) {
        switch (header.value) {
          case "name":
            {
              header.disable_edit = true;
              header.disable_new = false;
            }
            break;
          case "state":
            {
              header.align = "center";
            }
            break;
          case "id":
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "op":
          case "hsm_id":
          case "profile_id":
          case "steering_id":
            {
              header.view = false;
            }
            break;
        }
      }
    },
    onPreNew(data) {
      data.record.state = "disconnected";
    },
    onPreEdit(data) {
      this.loadHsmOpKeys(data.record.hsm_id);
    },
    onQueryChange() {
      this.clearResourceCache({ module: "main", resource: this.resources });
    },
    getStateColor(state) {
      let colorMap = {
        broken: "error",
        connected: "success",
        disconnected: "warning",
      };

      return colorMap[state] || "info";
    },
  },
};
</script>
