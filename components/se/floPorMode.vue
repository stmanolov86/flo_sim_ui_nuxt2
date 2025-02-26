<template>
  <div class="flo-por-mode">
    <v-container fluid>
      <v-row no-gutters>
        <v-col cols="12">
          <flo-position-control :items="operation.por" :value="val" :multiple="true">
            <template v-slot:content="{ item, idx }">
              <v-container fluid class="ma-0 pa-0">
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-form ref="por" v-model="valid">
                      <v-text-field :value="item" :label="meta.por.label" :hint="meta.por.hint" :type="meta.por.type" :rules="meta.por.rule" @change="onPorChanged($event, idx)" persistent-hint outlined dense></v-text-field>
                    </v-form>
                  </v-col>
                </v-row>
              </v-container>
            </template>
          </flo-position-control>
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col cols="4" class="mt-2">
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <v-btn color="primary" @click="send" :disabled="disableSend" v-on="on"><v-icon left>mdi-send</v-icon>Send</v-btn>
            </template>
            <span>Send PoR</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import floPositionControl from "~/components/widgets/floPositionControl.vue";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
export default {
  name: "flo-por-mode",
  components: {
    floPositionControl,
  },
  data() {
    return {
      valid: false,
      val: "",
      operation: {
        type: "decode_por",
        por: [""],
      },
      meta: {
        por: {
          label: "PoR",
          hint: "Proof Of Receipt",
          input: "text",
          type: "text",
          rule: [(v) => /^[0-9A-Fa-f]+$/.test(v) || "Invalid POR."],
        },
      },
    };
  },
  props: {
    uicc: {
      type: Object,
      default: () => {},
    },
    value: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    disableSend() {
      if (this.valid != false) {
        return false;
      }
      return true;
    },
  },

  mixins: [tellUser, parseNetError],
  methods: {
    onPorChanged(por, idx) {
      this.operation.por[idx] = por;
    },
    async send() {
      let req = {
        cards: [{ se: this.value }],
        operations: this.operation,
      };
      try {
        let answer = await this.$axios.$post("/api/v1/cards/ota/rfm/por", req);
        if (answer != null) {
          this.tellUser("success", "PoR request sent successfully.");
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
  },
};
</script>
