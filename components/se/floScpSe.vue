<template>
  <div class="flo-scp-se">
    <flo-expand title="Secure Element" :open="lopen" @collapse="lopen = $event" @expand="lopen = $event" elevation="5">
      <template v-slot:append="{}" v-if="!lopen">
        <v-spacer v-for="n in 30" :key="n"></v-spacer>
        <v-chip class="mr-1" label>SCP80: {{ `Keyset ${getKSet()}` }}</v-chip>
        <v-chip class="mr-1" label v-if="transport != 'sms'">Push SPI: {{ getPushSpi() }}</v-chip>
        <v-chip class="mr-1" label v-else>SPI: {{ getSpi() }}</v-chip>
        <v-chip class="mr-1" label>KID: {{ getKid() }}</v-chip>
        <v-chip label>KIC: {{ getKic() }}</v-chip>
      </template>

      <template v-slot:content="{}">
        <v-card flat :disabled="disabled">
          <v-container fluid>
            <v-row no-gutters>
              <v-container :key="redraw_all" fluid class="ma-0 pa-0">
                <v-row no-gutters>
                  <v-col cols="12" lg="4" xl="4" class="pa-1">
                    <flo-kset :value="getKSet()" prefix="SCP80" @change="onKSetChange($event)" :keysets="filteredKeysets()" :readonly="readonly" />
                  </v-col>
                </v-row>

                <v-row no-gutters>
                  <v-col v-if="transport != 'sms'" cols="12" lg="4" xl="4" class="pa-1">
                    <flo-spi :value="getPushSpi()" @change="onPushSpiChange($event)" :readonly="readonly" title="Push SPI" pattern="^[0-9a-fA-F]{4}$" />
                  </v-col>
                  <v-col v-else cols="12" lg="4" xl="4" class="pa-1">
                    <flo-spi :value="getSpi()" @change="onSpiChange($event)" :readonly="readonly" title="SPI" pattern="^[0-9a-fA-F]{4}$" />
                  </v-col>

                  <v-col cols="12" lg="4" xl="4" class="pa-1">
                    <flo-kid :value="getKid()" @change="onKidChange($event)" :keyset="getKSet()" :key="redraw_kic_kid" :readonly="readonly" pattern="^[0-9a-fA-F]{2}$" />
                  </v-col>
                  <v-col cols="12" lg="4" xl="4" class="pa-1">
                    <flo-kic :value="getKic()" @change="onKicChange($event)" :keyset="getKSet()" :key="redraw_kic_kid" :readonly="readonly" pattern="^[0-9a-fA-F]{2}$" />
                  </v-col>
                </v-row>
              </v-container>
            </v-row>
          </v-container>
        </v-card>
      </template>
    </flo-expand>
  </div>
</template>

<script>
import floSpi from "~/components/se/floSpi.vue";
import floKic from "~/components/se/floKic.vue";
import floKid from "~/components/se/floKid.vue";
import floKset from "~/components/se/floKset.vue";
export default {
  name: "flo-scp-se",
  components: {
    floSpi,
    floKic,
    floKid,
    floKset,
  },
  data() {
    return {
      lopen: false,
      dkeyset80: 0,
      redraw_all: 0,
      redraw_kic_kid: 0,
      se: {},
    };
  },
  props: {
    value: {
      type: Object,
      default: () => {},
    },
    keysets80: {
      type: Array,
      required: false,
      default: () => [],
    },
    spi: {
      type: String,
      required: false,
      default: "",
    },
    keyset80: {
      type: Number,
      required: false,
      default: 0,
    },
    kic_algo: {
      type: String,
      required: false,
      default: "",
    },
    kid_algo: {
      type: String,
      required: false,
      default: "",
    },
    push_spi: {
      type: String,
      required: false,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    transport: {
      type: String,
      required: true,
      default: "",
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    syncParent() {
      console.log(`flo-scp-se - syncParent - enter - ${JSON.stringify(this.se)}`);
      this.$emit("change", this.se);
    },
    onPreferredChange(event) {
      if (event) {
        this.se = {};
        this.redraw_all++;
        this.syncParent();
      }
    },
    onPushSpiChange(event) {
      console.log(`flo-scp-se - onSpiChange - enter - ${JSON.stringify(event)}`);
      this.se["spi"] = event;
      this.syncParent();
    },
    onSpiChange(event) {
      console.log(`flo-scp-se - onSpiChange - enter - ${JSON.stringify(event)}`);
      this.se["spi"] = event;
      this.syncParent();
    },
    onKicChange(event) {
      console.log(`flo-scp-se - onKicChange - enter - ${JSON.stringify(event)}`);
      this.se["kic_algo"] = event;
      this.syncParent();
    },
    onKidChange(event) {
      console.log(`flo-scp-se - onKicChange - enter - ${JSON.stringify(event)}`);
      this.se["kid_algo"] = event;
      this.syncParent();
    },
    onKSetChange(event) {
      console.log(`flo-scp-se - onKSetChange - enter - ${JSON.stringify(event)}`);
      this.se["keyset"] = event;
      this.redraw_kic_kid++;
      this.syncParent();
    },
    getSpi() {
      if (!this.se.hasOwnProperty("spi")) {
        return this.spi;
      }
      return this.se.spi;
    },
    getPushSpi() {
      if (!this.se.hasOwnProperty("spi")) {
        return this.push_spi;
      }
      return this.se.spi;
    },
    getKic() {
      if (!this.se.hasOwnProperty("kic_algo")) {
        return this.kic_algo;
      }
      return this.se.kic_algo;
    },
    getKid() {
      if (!this.se.hasOwnProperty("kid_algo")) {
        return this.kid_algo;
      }
      return this.se.kid_algo;
    },
    getKSet() {
      if (!this.se.hasOwnProperty("keyset")) {
        return this.dkeyset80;
      }
      return this.se.keyset;
    },
    filteredKeysets() {
      let filtered = [];
      if (this.keysets80.length > 0) {
        filtered = this.keysets80.filter((k) => k.name != "unknown");
      }

      let found = filtered.find((f) => f.key == this.dkeyset80);
      if (found) {
        found.value = `Keyset ${found.key} - Preferred`;
      }

      return filtered;
    },
    initialize() {
      if (0 == this.keyset80) {
        console.log(`flo-scp-se - initialize - keyset80 is zero`);
        if (this.keysets80.length > 0) {
          console.log(`flo-scp-se - initialize - keysets80 available`);
          this.dkeyset80 = this.keysets80[0].key;
        }
      } else {
        console.log(`flo-scp-se - initialize - keyset80 is NOT zero`);
        this.dkeyset80 = this.keyset80;
      }

      console.log(`flo-scp-se - initialize - final - keysets80 ${this.dkeyset80}`);

      this.lopen = this.open;
      if (null != this.value) {
        this.se = this.value;
        console.log(`flo-scp-se - initialize - se - ${JSON.stringify(this.se)}`);
      } else {
        this.syncParent();
      }
    },
  },
};
</script>
