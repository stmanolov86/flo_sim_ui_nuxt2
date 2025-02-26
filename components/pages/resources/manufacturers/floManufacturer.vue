<template>
  <div class="flo-manufacturer">
    <v-card v-if="manufacturer != null" flat outlined class="ma-0 pa-0">
      <v-card-text class="ma-0 pa-0">
        <v-container fluid class="pa-1">
          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <div class="headline">
                Manufacturer: {{ manufacturer.name }}
                <v-chip v-if="manufacturer.hasOwnProperty('state')" label class="text-capitalize" :color="getStateColor(manufacturer.state)">{{ manufacturer.state }}</v-chip>
              </div>
              <v-row no-gutters>
                <v-col cols="10">
                  <blockquote class="blockquote font-weight-light">
                    Id: <code>{{ manufacturer.id }}</code>
                    <span v-if="manufacturer.description != ''">
                      , Description: <code>{{ manufacturer.description }}</code></span
                    >
                  </blockquote>
                </v-col>
                <div class="flex-grow-1"></div>
                <v-btn class="mt-5" v-if="manufacturer.state == 'active'" color="primary" @click="changeState('deprecate')" :disabled="!crud.e">
                  <v-icon left>mdi-progress-alert</v-icon>
                  Deprecate</v-btn
                >
                <v-btn class="mt-5" v-if="manufacturer.state == 'deprecated'" color="primary" @click="changeState('activate')" :disabled="!crud.e">
                  <v-icon left>mdi-progress-check</v-icon>
                  Activate</v-btn
                >
              </v-row>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Details" elevation="5" open>
                <template v-slot:content="{}">
                  <flo-meta-resource-view :value="manufacturer" resources="manufacturers" :ignore="['action']" />
                </template>
              </flo-expand>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
import { mapGetters } from "vuex";
export default {
  head() {
    return {
      title: this.title,
    };
  },
  name: "flo-manufacturer",
  data: () => ({
    resources: "manufacturers",
    title: "Manufacturer",
    manufacturer: null,
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
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    initialize() {
      this.manufacturer = this.value;
      this.crud = this.getPermissions.find((f) => "manufacturers" == f.res);
    },
    getStateColor(state) {
      let colorMap = {
        deprecated: "error",
        active: "success",
      };

      return colorMap[state] || "warning";
    },
    async changeState(action) {
      try {
        let request = { id: this.manufacturer.id, action };
        let answer = await this.$axios.$post("/api/v1/manufacturers/action", request);
        if (answer != null) {
          this.manufacturer = answer;
          this.tellUser("success", `ID: ${this.manufacturer.id} state successfully changed to ${this.manufacturer.state}.`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
  },
};
</script>
