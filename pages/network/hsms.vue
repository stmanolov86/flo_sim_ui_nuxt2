<template>
  <div>
    <flo-meta-table :refresh="30" @load-data="onLoadData($event)" @pre-new="onPreNew($event)" @query_change="onQueryChange($event)" :translator="translator" :init_filter="init_filter" :resources="resources" main_resource>
      <template v-slot:view_state="{ fmtrow }">
        <v-chip class="text-capitalize" :color="getStateColor(fmtrow.state)" label>{{ fmtrow.state }}</v-chip>
      </template>
      <template v-slot:edit_state="{ fmtrow }">
        <v-col cols="12" lg="6" class="d-flex justify-center align-center">
          <v-chip class="text-capitalize" :color="getStateColor(fmtrow.state)" label>{{ fmtrow.state }}</v-chip>
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
              path: '/network/hsm_keys/',
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
import { mapActions } from "vuex";
import OTranslator from "~/src/otranslator.js";
export default {
  data: () => ({
    resource: "hsm",
    resources: "hsms",
    translator: null,
    dialog: false,
    init_filter: [],
    page: null,
    records: [],
    headers: [],
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
  methods: {
    ...mapActions({
      clearResourceCache: "session/clearResourceCache",
    }),
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
          case "capacity":
          case "slot_id":
            {
              header.view = false;
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
        }
      }
    },
    initialize() {
      if (this.$route.query.name) {
        this.init_filter = [
          {
            k: "name",
            op: "equal",
            v: this.$route.query.name,
          },
        ];
      }
      this.translator = new OTranslator();
      this.translator.setTimeStamp("ts");
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
    onPreNew(data) {
      data.record.state = "disconnected";
    },
    onQueryChange(event) {
      this.page = event;
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
